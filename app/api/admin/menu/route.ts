import { requireAdmin, sameOrigin } from "@/lib/admin-access";
import { apiError, readJson } from "@/lib/api-response";
import { saveMenu } from "@/lib/menu-repository";
import { revalidatePath } from "next/cache";
export async function POST(request: Request) {
  try {
    await requireAdmin(); sameOrigin(request);
    await saveMenu(await readJson(request), true);
    revalidatePath("/menu"); revalidatePath("/"); revalidatePath("/admin", "layout");
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) { return apiError(error); }
}
