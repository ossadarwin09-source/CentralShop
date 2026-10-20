import { ok, fail } from "@/lib/http";
import { listCategorias } from "@/lib/store";

export async function GET() {
  try {
    return ok({ categorias: await listCategorias() });
  } catch (error) {
    return fail(error);
  }
}
