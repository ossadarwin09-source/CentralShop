"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CuentaForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/panel";
  const [mode, setMode] = useState<"login" | "registro">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.get("nombre"),
        email: form.get("email"),
        password: form.get("password"),
        telefono: form.get("telefono"),
      }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "No pudimos entrar.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <section className="section">
      <div className="narrow card stack">
        <p className="kicker">Cuenta</p>
        <h1>{mode === "login" ? "Accede a CentralShop" : "Crea tu cuenta"}</h1>
        <div className="btn-row">
          <button className={mode === "login" ? "btn-primary" : "btn-ghost"} type="button" onClick={() => setMode("login")}>Acceder</button>
          <button className={mode === "registro" ? "btn-primary" : "btn-ghost"} type="button" onClick={() => setMode("registro")}>Crear cuenta</button>
        </div>
        <form className="stack" onSubmit={onSubmit}>
          {mode === "registro" ? (
            <>
              <label>Nombre<input name="nombre" required minLength={3} /></label>
              <label>Teléfono<input name="telefono" /></label>
            </>
          ) : null}
          <label>Correo<input name="email" type="email" required /></label>
          <label>Contraseña<input name="password" type="password" required minLength={8} /></label>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn-primary" disabled={loading} type="submit">{loading ? "Espera…" : mode === "login" ? "Entrar" : "Registrarme"}</button>
        </form>
        <div className="notice">
          Cuentas de demostración: cliente@centralshop.co / Cliente123 · vendedor@centralshop.co / Vendedor123 · admin@centralshop.co / Admin123
        </div>
      </div>
    </section>
  );
}

export default function CuentaPage() {
  return (
    <Suspense fallback={<p className="container">Cargando cuenta…</p>}>
      <CuentaForm />
    </Suspense>
  );
}
