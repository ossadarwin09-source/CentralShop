import { currentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { crearProducto, listProductos } from "@/lib/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria");
    const tienda = searchParams.get("tienda");
    const productos = await listProductos({
      q: searchParams.get("q") || undefined,
      categoriaId: categoria ? Number(categoria) : undefined,
      tiendaId: tienda ? Number(tienda) : undefined,
      orden: searchParams.get("orden") || undefined,
    });
    return ok({ productos });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return ok({ error: "Inicia sesión." }, 401);
    const body = await request.json();
    const producto = await crearProducto(user, {
      nombre: String(body.nombre || ""),
      descripcion: String(body.descripcion || ""),
      precio: Number(body.precio),
      stock: Number(body.stock),
      categoriaId: Number(body.categoriaId),
    });
    return ok({ producto }, 201);
  } catch (error) {
    return fail(error);
  }
}
