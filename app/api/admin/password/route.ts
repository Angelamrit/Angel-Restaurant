import { changeAdminPassword, limitAttempts, requireAdmin, sameOrigin } from "@/lib/admin-access";
import { apiError, readJson } from "@/lib/api-response";
import { audit } from "@/lib/audit";
import { InputError } from "@/lib/menu-validation";

// Change the administrator password. Requires a signed-in session AND the current password (a stolen or left-open
// session alone is not enough), is throttled separately from sign-in, and ends every other session on success.
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireAdmin();
    await limitAttempts(request, "password");
    const input = await readJson(request) as { currentPassword?: unknown; newPassword?: unknown };
    if (typeof input?.currentPassword !== "string" || typeof input?.newPassword !== "string" || !input.currentPassword || !input.newPassword) {
      throw new InputError("Enter your current password and a new password.");
    }
    try {
      await changeAdminPassword(input.currentPassword, input.newPassword);
    } catch (error) {
      if (error instanceof InputError && error.message === "The current password is incorrect.") await audit("password.change.failed", "admin");
      throw error;
    }
    await audit("password.change", "admin");
    return Response.json({ ok: true });
  } catch (error) { return apiError(error); }
}
