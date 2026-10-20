import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "./env";
import type { UsuarioPublico } from "./types";

const COOKIE = "cs_session";

function key() {
  return new TextEncoder().encode(env.jwtSecret);
}

export async function signSession(user: UsuarioPublico) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key());
}

export async function readSession(token: string | undefined | null): Promise<UsuarioPublico | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return {
      id: Number(payload.id),
      rol: payload.rol as UsuarioPublico["rol"],
      nombre: String(payload.nombre),
      email: String(payload.email),
      telefono: String(payload.telefono || ""),
      estado: (payload.estado as UsuarioPublico["estado"]) || "activo",
      tiendaId: payload.tiendaId ? Number(payload.tiendaId) : undefined,
      tiendaNombre: payload.tiendaNombre ? String(payload.tiendaNombre) : undefined,
      tiendaEstado: payload.tiendaEstado as UsuarioPublico["tiendaEstado"],
    };
  } catch {
    return null;
  }
}

export async function currentUser() {
  const jar = await cookies();
  return readSession(jar.get(COOKIE)?.value);
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
