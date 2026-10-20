import { setSessionCookie, signSession } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { register } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await register({
      nombre: String(body.nombre || ""),
      email: String(body.email || ""),
      password: String(body.password || ""),
      telefono: String(body.telefono || ""),
    });
    await setSessionCookie(await signSession(user));
    return ok({ user }, 201);
  } catch (error) {
    return fail(error);
  }
}
