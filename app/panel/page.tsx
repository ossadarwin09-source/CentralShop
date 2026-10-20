"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { cop } from "@/lib/format";
import type { Categoria, Pedido, Producto, Tienda, UsuarioPublico } from "@/lib/types";

type PanelData = {
  usuario: UsuarioPublico;
  pedidos: Pedido[];
  favoritos: Producto[];
  productosTienda: Producto[];
  pendientes: Tienda[];
  conteos: { usuarios: number; tiendas: number; productos: number; pedidos: number };
};

export default function PanelPage() {
  const [data, setData] = useState<PanelData | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const [panel, cats] = await Promise.all([
      fetch("/api/panel").then((r) => r.json()),
      fetch("/api/categorias").then((r) => r.json()),
    ]);
    if (panel.error) setError(panel.error);
    else setData(panel);
    setCategorias(cats.categorias || []);
  }

  useEffect(() => {
    load().catch(() => setError("No pudimos abrir el panel."));
  }, []);

  async function crearProducto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.get("nombre"),
        descripcion: form.get("descripcion"),
        precio: Number(form.get("precio")),
        stock: Number(form.get("stock")),
        categoriaId: Number(form.get("categoriaId")),
      }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error);
      return;
    }
    setMessage("Producto publicado.");
    event.currentTarget.reset();
    await load();
  }

  async function cambiarTienda(id: number, estado: string) {
    const response = await fetch(`/api/tiendas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    const body = await response.json();
    if (!response.ok) setError(body.error);
    else await load();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (error && !data) {
    return (
      <section className="section"><div className="narrow card stack">
        <p className="error">{error}</p>
        <Link className="btn-primary" href="/cuenta">Iniciar sesión</Link>
      </div></section>
    );
  }
  if (!data) return <p className="container">Cargando panel…</p>;

  const user = data.usuario;
  return (
    <section className="section">
      <div className="container stack">
        <div className="section-head">
          <div>
            <p className="kicker">{user.rol}</p>
            <h1>Hola, {user.nombre}</h1>
            <p className="muted">{user.email}</p>
          </div>
          <button className="btn-ghost" type="button" onClick={logout}>Cerrar sesión</button>
        </div>
        {message ? <p className="ok-note">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}

        {user.rol === "administrador" ? (
          <div className="stats">
            <div className="stat"><strong>{data.conteos.usuarios}</strong> usuarios</div>
            <div className="stat"><strong>{data.conteos.tiendas}</strong> tiendas</div>
            <div className="stat"><strong>{data.conteos.pedidos}</strong> pedidos</div>
          </div>
        ) : null}

        {user.rol === "administrador" && data.pendientes.length > 0 ? (
          <div className="card stack">
            <h2>Tiendas pendientes</h2>
            {data.pendientes.map((tienda) => (
              <div key={tienda.id} className="section-head">
                <strong>{tienda.nombre}</strong>
                <button className="btn-primary" type="button" onClick={() => cambiarTienda(tienda.id, "aprobada")}>Aprobar</button>
              </div>
            ))}
          </div>
        ) : null}

        {user.rol === "vendedor" ? (
          <form className="card stack" onSubmit={crearProducto}>
            <h2>{user.tiendaNombre || "Tu tienda"} · {user.tiendaEstado}</h2>
            <div className="form-grid">
              <label>Producto<input name="nombre" required /></label>
              <label>Categoría
                <select name="categoriaId">{categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
              </label>
              <label>Precio COP<input name="precio" type="number" min={0} required /></label>
              <label>Stock<input name="stock" type="number" min={0} required /></label>
            </div>
            <label>Descripción<textarea name="descripcion" required /></label>
            <button className="btn-primary" type="submit" disabled={user.tiendaEstado !== "aprobada"}>Publicar producto</button>
          </form>
        ) : null}

        {user.rol === "vendedor" ? (
          <div className="card">
            <h2>Tus productos</h2>
            <ul>{data.productosTienda.map((p) => <li key={p.id}>{p.nombre} · {cop(p.precio)} · stock {p.stock}</li>)}</ul>
          </div>
        ) : null}

        <div className="card">
          <h2>Pedidos</h2>
          {data.pedidos.length === 0 ? <p className="muted">Sin pedidos todavía.</p> : null}
          {data.pedidos.map((pedido) => (
            <p key={pedido.id}>#{pedido.id} · {pedido.estado} · {cop(pedido.total)}</p>
          ))}
          <Link href="/pedidos">Ver detalle</Link>
        </div>
      </div>
    </section>
  );
}
