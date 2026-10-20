"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Producto, UsuarioPublico } from "@/lib/types";

export default function FavoritosPage() {
  const [user, setUser] = useState<UsuarioPublico | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/auth/me").then((r) => r.json()), fetch("/api/favoritos").then((r) => r.json())])
      .then(([session, fav]) => {
        setUser(session.user);
        setProductos(fav.productos || []);
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <p className="container">Cargando favoritos…</p>;

  return (
    <section className="section">
      <div className="container">
        <p className="kicker">Favoritos</p>
        <h1>Guardados</h1>
        {!user ? <p className="notice">Entra a tu cuenta para guardar productos. <Link href="/cuenta?next=/favoritos">Acceder</Link></p> : null}
        <div className="catalog-grid">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
        {user && productos.length === 0 ? <p className="card empty">Aún no marcas favoritos.</p> : null}
      </div>
    </section>
  );
}
