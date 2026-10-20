import { ok, fail } from "@/lib/http";
import { getProducto } from "@/lib/store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const producto = await getProducto(Number(id));
    if (!producto) return ok({ error: "Producto no encontrado." }, 404);
    return ok({ producto });
  } catch (error) {
    return fail(error);
  }
}
