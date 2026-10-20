import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { getTienda, listProductos } from "@/lib/store";

export default async function TiendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tienda = await getTienda(Number(id));
  if (!tienda || tienda.estado !== "aprobada") notFound();
  const productos = await listProductos({ tiendaId: tienda.id });

  return (
    <section className="section">
      <div className="container">
        <p className="kicker">{tienda.ciudad}</p>
        <h1>{tienda.nombre}</h1>
        <p className="lead">{tienda.descripcion}</p>
        <div className="catalog-grid">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      </div>
    </section>
  );
}
