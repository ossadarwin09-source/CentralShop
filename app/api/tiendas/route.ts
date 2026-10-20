import { currentUser, setSessionCookie, signSession } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { crearTienda, listTiendas } from "@/lib/store";

export async function GET() {
  try {
    return ok({ tiendas: await listTiendas() });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return ok({ error: "Inicia sesión para abrir una tienda." }, 401);
    const body = await request.json();
    const updated = await crearTienda(user, { nombre: String(body.nombre || ""), descripcion: String(body.descripcion || "") });
    await setSessionCookie(await signSession(updated));
    return ok({ user: updated }, 201);
  } catch (error) {
    return fail(error);
  }
}
