"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import type { Categoria, Producto } from "@/lib/types";

function Catalogo() {
  const params = useSearchParams();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [q, setQ] = useState(params.get("q") || "");
  const [categoria, setCategoria] = useState(params.get("categoria") || "");
  const [orden, setOrden] = useState(params.get("orden") || "recientes");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categorias")
      .then((response) => response.json())
      .then((data) => setCategorias(data.categorias || []))
      .catch(() => setError("No pudimos cargar las categorías."));
  }, []);

  useEffect(() => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (categoria) query.set("categoria", categoria);
    if (orden) query.set("orden", orden);
    fetch(`/api/productos?${query.toString()}`)
      .then((response) => response.json())
      .then((data) => setProductos(data.productos || []))
      .catch(() => setError("No pudimos cargar los productos."));
  }, [q, categoria, orden]);

  return (
    <section className="section">
      <div className="container">
        <p className="kicker">Catálogo</p>
        <h1>Productos</h1>
        <div className="form-grid">
          <label>
            Buscar
            <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Nombre o tienda" />
          </label>
          <label>
            Orden
            <select value={orden} onChange={(event) => setOrden(event.target.value)}>
              <option value="recientes">Recientes</option>
              <option value="destacados">Mejor calificación</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
            </select>
          </label>
        </div>
        <div className="filters">
          <button className={`chip ${categoria === "" ? "active" : ""}`} type="button" onClick={() => setCategoria("")}>Todas</button>
          {categorias.map((item) => (
            <button key={item.id} className={`chip ${categoria === String(item.id) ? "active" : ""}`} type="button" onClick={() => setCategoria(String(item.id))}>
              {item.nombre}
            </button>
          ))}
        </div>
        {error ? <p className="error">{error}</p> : null}
        {productos.length === 0 ? <p className="card empty">No hay productos con ese filtro.</p> : null}
        <div className="catalog-grid">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<p className="container">Cargando catálogo…</p>}>
      <Catalogo />
    </Suspense>
  );
}
