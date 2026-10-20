import { currentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { listFavoritos, toggleFavorito } from "@/lib/store";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return ok({ productos: [] });
    return ok({ productos: await listFavoritos(user.id) });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return ok({ error: "Inicia sesión para guardar favoritos." }, 401);
    const body = await request.json();
    const result = await toggleFavorito(user.id, Number(body.productoId));
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}
