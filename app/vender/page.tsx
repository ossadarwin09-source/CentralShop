"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { UsuarioPublico } from "@/lib/types";

export default function VenderPage() {
  const [user, setUser] = useState<UsuarioPublico | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((data) => setUser(data.user));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/tiendas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: form.get("nombre"), descripcion: form.get("descripcion") }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "No se pudo crear la tienda.");
      return;
    }
    setUser(data.user);
    setMessage(data.user.tiendaEstado === "aprobada" ? "Tu tienda quedó aprobada. Ya puedes publicar." : "Tu tienda quedó pendiente de aprobación.");
  }

  return (
    <section className="section">
      <div className="narrow stack">
        <p className="kicker">Vendedores</p>
        <h1>Abre tu tienda en CentralShop</h1>
        <p className="lead">Publica productos, recibe pedidos y sigue el estado de cada venta. Una persona administra una tienda.</p>
        {!user ? <p className="notice">Primero <Link href="/cuenta?next=/vender">inicia sesión</Link> para registrar la tienda.</p> : null}
        {user?.tiendaId ? (
          <div className="card stack">
            <h2>{user.tiendaNombre}</h2>
            <p>Estado: <strong>{user.tiendaEstado}</strong></p>
            <Link className="btn-primary" href="/panel">Ir al panel</Link>
          </div>
        ) : (
          <form className="card stack" onSubmit={onSubmit}>
            <label>Nombre de la tienda<input name="nombre" required minLength={3} /></label>
            <label>Descripción<textarea name="descripcion" required minLength={10} /></label>
            {error ? <p className="error">{error}</p> : null}
            {message ? <p className="ok-note">{message}</p> : null}
            <button className="btn-primary" type="submit" disabled={!user}>Crear tienda</button>
          </form>
        )}
      </div>
    </section>
  );
}
