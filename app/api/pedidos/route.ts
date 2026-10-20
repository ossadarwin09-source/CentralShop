import { currentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { crearPedido, listPedidos } from "@/lib/store";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return ok({ pedidos: [] });
    return ok({ pedidos: await listPedidos(user.id) });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return ok({ error: "Inicia sesión para crear el pedido." }, 401);
    const body = await request.json();
    const pedido = await crearPedido({
      user,
      items: Array.isArray(body.items) ? body.items : [],
      direccion: body.direccion || {},
      metodo: String(body.metodo || ""),
    });
    return ok({ pedido }, 201);
  } catch (error) {
    return fail(error);
  }
}
