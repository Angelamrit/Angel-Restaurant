import { test, expect } from "@playwright/test";

test("admin motion preserves navigation, filtering and reduced-motion access", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/admin");
  await page.getByLabel("Administrator access key").fill("angel-local-e2e-only-access-key-2026");
  await page.getByRole("button", { name: "Open workspace" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  const total = page.locator(".admin-stats .admin-number").first();
  await expect(total).toHaveAttribute("aria-label", "84");
  await expect(total).toHaveText("84");
  await expect(page.locator(".admin-page-head")).toHaveCSS("animation-name", "admin-enter");
  await page.screenshot({ path: "test-results/admin-motion-desktop.png", fullPage: true });

  const navigation = page.getByRole("navigation", { name: "Administration" });
  await navigation.getByRole("link", { name: "Menu", exact: true }).click();
  await expect(page.getByRole("heading", { name: "The menu", exact: true })).toBeVisible();
  await page.getByLabel("Search dishes").fill("a dish that does not exist");
  await expect(page.getByRole("heading", { name: "No dishes found." })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(84);
  await expect(page.getByLabel("Search dishes")).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  await navigation.getByRole("link", { name: "Overview" }).click();
  await expect(navigation.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "page");
  await expect(total).toHaveText("84");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/admin-motion-mobile.png", fullPage: true });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".admin-page-head")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".admin-meter > span").first()).toHaveCSS("animation-name", "none");
  await expect(total).toHaveText("84");
  await navigation.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
});

test("header stays hidden during small downward scrolls and returns on upward intent", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).toHaveAttribute("data-motion-hydrated", "");
  const header = page.locator(".site-header");
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect(header).toHaveAttribute("data-hidden", "true");
  await page.evaluate(() => window.scrollBy(0, 2));
  await expect(header).toHaveAttribute("data-hidden", "true");
  await page.evaluate(() => window.scrollBy(0, -40));
  await expect(header).toHaveAttribute("data-hidden", "false");
});
