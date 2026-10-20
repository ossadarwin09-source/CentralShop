import { currentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { guardarAviso } from "@/lib/store";

const textos: Record<string, string> = {
  empezar: "No sé por dónde empezar a vender",
  catalogo: "Me falta catálogo y fotos claras",
  pedidos: "Necesito controlar pedidos y envíos",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const opcion = String(body.opcion || "");
    const texto = textos[opcion];
    if (!texto) return ok({ error: "Elige una opción." }, 400);
    const user = await currentUser();
    await guardarAviso(user?.id || null, `Encuesta: ${texto}`);
    return ok({ mensaje: "Gracias. Usaremos tu respuesta para orientar el catálogo." });
  } catch (error) {
    return fail(error);
  }
}
