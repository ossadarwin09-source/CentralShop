import Link from "next/link";
import { cop, estrellas } from "@/lib/format";
import type { Producto } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ producto }: { producto: Producto }) {
  const tone = producto.imagen?.startsWith("http") || producto.imagen?.startsWith("/") ? "tecnologia" : producto.imagen || "tecnologia";
  return (
    <article className="product">
      <Link href={`/productos/${producto.id}`}>
        <div className={`visual tone-${tone}`}>
          <span>{producto.categoria}</span>
        </div>
      </Link>
      <div className="product-body">
        <p className="muted" style={{ margin: 0 }}>{producto.tienda}</p>
        <h3 style={{ fontSize: "1.05rem" }}>
          <Link href={`/productos/${producto.id}`}>{producto.nombre}</Link>
        </h3>
        <p className="stars" aria-label={`${producto.rating} de 5`}>
          {producto.resenas ? `${estrellas(producto.rating)} ${producto.rating}` : "Sin reseñas"}
        </p>
        <p className="price">{cop(producto.precio)}</p>
        <AddToCartButton producto={producto} />
      </div>
    </article>
  );
}
