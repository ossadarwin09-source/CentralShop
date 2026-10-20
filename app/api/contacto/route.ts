import { currentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { guardarAviso } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nombre = String(body.nombre || "").trim();
    const email = String(body.email || "").trim();
    const mensaje = String(body.mensaje || "").trim();
    if (nombre.length < 2 || !email.includes("@") || mensaje.length < 10) {
      return ok({ error: "Completa nombre, correo y un mensaje más claro." }, 400);
    }
    const user = await currentUser();
    await guardarAviso(user?.id || null, `Contacto de ${nombre}: ${mensaje}`);
    return ok({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
