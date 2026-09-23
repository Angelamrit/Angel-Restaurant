import { cookies } from "next/headers";
import { ADMIN_COOKIE, accessConfigured, createSession, equalSecret, limitAttempts, sameOrigin } from "@/lib/admin-access";
import { apiError, readJson } from "@/lib/api-response";
import { InputError } from "@/lib/menu-validation";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (!accessConfigured()) return Response.json({ error: "Administrator access has not been configured." }, { status: 503 });
    await limitAttempts(request);
    const input = await readJson(request) as { key?: unknown };
    if (typeof input?.key !== "string" || !equalSecret(input.key, process.env.ADMIN_ACCESS_KEY!)) throw new InputError("The access key is incorrect.");
    (await cookies()).set(ADMIN_COOKIE, createSession(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 28800 });
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}
export async function DELETE(request: Request) {
  try { sameOrigin(request); (await cookies()).delete(ADMIN_COOKIE); return Response.json({ ok: true }); }
  catch (error) { return apiError(error); }
}
