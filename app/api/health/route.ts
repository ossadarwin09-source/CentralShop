import { ok } from "@/lib/http";
import { getMode } from "@/lib/store";

export async function GET() {
  return ok(getMode());
}
