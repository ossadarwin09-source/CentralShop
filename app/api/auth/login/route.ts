import { setSessionCookie, signSession } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { login } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await login(String(body.email || ""), String(body.password || ""));
    await setSessionCookie(await signSession(user));
    return ok({ user });
  } catch (error) {
    return fail(error);
  }
}
