import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ReviewForm } from "@/components/ReviewForm";
import { cop, estrellas } from "@/lib/format";
import { getProducto } from "@/lib/store";

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const producto = await getProducto(Number(id));
  if (!producto || Number.isNaN(Number(id))) notFound();
  const tone = producto.imagen?.startsWith("http") || producto.imagen?.startsWith("/") ? "tecnologia" : producto.imagen || "tecnologia";

  return (
    <section className="section">
      <div className="container split">
        <div className={`visual tone-${tone}`} style={{ minHeight: 320, borderRadius: 28 }}>
          <span>{producto.categoria}</span>
        </div>
        <div className="stack">
          <p className="kicker">{producto.categoria}</p>
          <h1>{producto.nombre}</h1>
          <p className="muted">Vendido por <Link href={`/tiendas/${producto.tiendaId}`}>{producto.tienda}</Link></p>
          <p className="stars">{producto.resenas ? `${estrellas(producto.rating)} ${producto.rating} · ${producto.resenas} reseñas` : "Sin reseñas todavía"}</p>
          <p className="price" style={{ fontSize: "1.8rem" }}>{cop(producto.precio)}</p>
          <p>{producto.descripcion}</p>
          <p className="muted">Stock disponible: {producto.stock}</p>
          <AddToCartButton producto={producto} />
          <FavoriteButton productoId={producto.id} />
        </div>
      </div>
      <div className="container" style={{ marginTop: 22 }}>
        <h2>Reseñas</h2>
        <div className="stack">
          {producto.opiniones.length === 0 ? <p className="muted">Sé la primera persona en contar cómo te fue.</p> : null}
          {producto.opiniones.map((resena) => (
            <article key={resena.id} className="card">
              <strong>{resena.usuario}</strong>
              <p className="stars">{estrellas(resena.calificacion)}</p>
              <p>{resena.comentario}</p>
              <p className="muted">{resena.creadoEn}</p>
            </article>
          ))}
          <ReviewForm productoId={producto.id} />
        </div>
      </div>
    </section>
  );
}
