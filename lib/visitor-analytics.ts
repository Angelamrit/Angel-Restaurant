import "server-only";
import { requireAdmin } from "./admin-access";
import { collections } from "./database";
import { withinLimit } from "./rate-limit";
import { analyticsTimeZone, dayKey, lastDays, monthStart, weekStart, type Device, type TrackedPath } from "./visitor-analytics-core";

// A visitor reading quickly still stays far below this; a script replaying one cookie does not.
const VIEWS_PER_VISITOR = 60;
const VIEW_WINDOW_MS = 10 * 60 * 1000;

export async function recordPageView({ visitorId, path, device, referrer, at = new Date() }: { visitorId: string; path: TrackedPath; device: Device; referrer: string; at?: Date }) {
  // Keyed on the anonymous visitor ID, not the network address: behind the VPS proxy there is no trusted client IP,
  // and the shared limiter would otherwise put every visitor in one bucket. Fails closed: no store, no write.
  if (!(await withinLimit("page-view", visitorId, VIEW_WINDOW_MS, VIEWS_PER_VISITOR, false))) return false;
  const day = dayKey(at, analyticsTimeZone());
  const { pageViews, visitors } = collections();
  await Promise.all([
    pageViews.insertOne({ visitorId, path, day, at, device, ...(referrer ? { referrer } : {}) }),
    // $setOnInsert only: for a returning visitor this matches the unique index and writes nothing.
    visitors.updateOne({ visitorId }, { $setOnInsert: { visitorId, firstSeen: at, firstDay: day } }, { upsert: true }),
  ]);
  return true;
}

export type TrafficStats = {
  timeZone: string; today: string;
  visitorsToday: number; visitorsThisWeek: number; visitorsThisMonth: number; totalVisitors: number;
  pageViewsToday: number;
  mostViewed: { path: string; views: number } | null; mostViewedSince: string;
  daily: { day: string; visitors: number }[];
};

export async function getTrafficStats(now = new Date()): Promise<TrafficStats> {
  await requireAdmin();
  const timeZone = analyticsTimeZone();
  const today = dayKey(now, timeZone);
  const days = lastDays(today, 7);
  const mostViewedSince = lastDays(today, 30)[0];
  const { pageViews, visitors } = collections();

  // Distinct visitors from `from` up to today, counted inside MongoDB (no visitor IDs leave the database).
  const uniqueSince = async (from: string) => (await pageViews.aggregate<{ n: number }>([
    { $match: { day: { $gte: from } } }, { $group: { _id: "$visitorId" } }, { $count: "n" },
  ]).toArray())[0]?.n ?? 0;

  const [visitorsToday, visitorsThisWeek, visitorsThisMonth, totalVisitors, pageViewsToday, top, perDay] = await Promise.all([
    uniqueSince(today),
    uniqueSince(weekStart(today)),
    uniqueSince(monthStart(today)),
    visitors.countDocuments(),
    pageViews.countDocuments({ day: today }),
    pageViews.aggregate<{ _id: string; views: number }>([
      { $match: { day: { $gte: mostViewedSince } } }, { $group: { _id: "$path", views: { $sum: 1 } } }, { $sort: { views: -1, _id: 1 } }, { $limit: 1 },
    ]).toArray(),
    pageViews.aggregate<{ _id: string; visitors: number }>([
      { $match: { day: { $gte: days[0] } } },
      { $group: { _id: { day: "$day", visitorId: "$visitorId" } } },
      { $group: { _id: "$_id.day", visitors: { $sum: 1 } } },
    ]).toArray(),
  ]);

  const byDay = new Map(perDay.map(row => [row._id, row.visitors]));
  return {
    timeZone, today, visitorsToday, visitorsThisWeek, visitorsThisMonth, totalVisitors, pageViewsToday,
    mostViewed: top[0] ? { path: top[0]._id, views: top[0].views } : null, mostViewedSince,
    daily: days.map(day => ({ day, visitors: byDay.get(day) ?? 0 })),
  };
}
