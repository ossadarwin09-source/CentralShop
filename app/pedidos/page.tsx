"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cop } from "@/lib/format";
import type { Pedido, UsuarioPublico } from "@/lib/types";

function Pedidos() {
  const params = useSearchParams();
  const [user, setUser] = useState<UsuarioPublico | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((data) => setUser(data.user));
    fetch("/api/pedidos")
      .then((r) => r.json())
      .then((data) => {
        const remote: Pedido[] = data.pedidos || [];
        const local: Pedido[] = JSON.parse(localStorage.getItem("cs_pedidos") || "[]");
        const map = new Map<number, Pedido>();
        [...remote, ...local].forEach((pedido) => map.set(pedido.id, pedido));
        setPedidos([...map.values()]);
      })
      .catch(() => setPedidos([]));
  }, []);

  if (user === null) return <p className="container">Cargando pedidos…</p>;

  return (
    <section className="section">
      <div className="container stack">
        <p className="kicker">Pedidos</p>
        <h1>Tus compras</h1>
        {params.get("ok") ? <p className="ok-note">Pedido creado. El pago y el envío quedaron registrados.</p> : null}
        {!user ? <p className="notice">Inicia sesión para ver los pedidos de tu cuenta. <Link href="/cuenta">Entrar</Link></p> : null}
        {pedidos.length === 0 ? <p className="card empty">Aún no hay pedidos.</p> : null}
        {pedidos.map((pedido) => (
          <article key={pedido.id} className="card">
            <h2>Pedido #{pedido.id}</h2>
            <p>Estado: <strong>{pedido.estado}</strong> · Pago {pedido.pagoEstado} · Envío {pedido.envioEstado}</p>
            <p>{pedido.direccion}, {pedido.ciudad}</p>
            <ul>
              {pedido.items.map((item) => (
                <li key={item.id}>{item.cantidad} × {item.nombre} · {cop(item.precioUnitario * item.cantidad)}</li>
              ))}
            </ul>
            <p className="price">Total {cop(pedido.total)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function PedidosPage() {
  return (
    <Suspense fallback={<p className="container">Cargando pedidos…</p>}>
      <Pedidos />
    </Suspense>
  );
}
