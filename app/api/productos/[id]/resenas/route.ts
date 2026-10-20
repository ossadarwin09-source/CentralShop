import { currentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { crearResena } from "@/lib/store";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) return ok({ error: "Inicia sesión para reseñar." }, 401);
    const { id } = await context.params;
    const body = await request.json();
    const resena = await crearResena(user, Number(id), Number(body.calificacion), String(body.comentario || ""));
    return ok({ resena }, 201);
  } catch (error) {
    return fail(error);
  }
}
