import { currentUser, setSessionCookie, signSession } from "@/lib/auth";
import { ok, fail } from "@/lib/http";
import { reloadUser } from "@/lib/store";

export async function GET() {
  try {
    const session = await currentUser();
    if (!session) return ok({ user: null });
    const user = await reloadUser(session.id);
    await setSessionCookie(await signSession(user));
    return ok({ user });
  } catch {
    return ok({ user: null });
  }
}
