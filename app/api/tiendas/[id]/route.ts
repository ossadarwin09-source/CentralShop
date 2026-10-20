import { currentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { aprobarTienda } from "@/lib/store";
import type { Tienda } from "@/lib/types";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) return ok({ error: "Inicia sesión." }, 401);
    const { id } = await context.params;
    const body = await request.json();
    const tienda = await aprobarTienda(user, Number(id), String(body.estado) as Tienda["estado"]);
    return ok({ tienda });
  } catch (error) {
    return fail(error);
  }
}
