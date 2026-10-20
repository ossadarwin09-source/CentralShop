import { currentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { panel } from "@/lib/store";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return ok({ error: "Inicia sesión para ver el panel." }, 401);
    return ok(await panel(user));
  } catch (error) {
    return fail(error);
  }
}
