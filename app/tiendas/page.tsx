import Link from "next/link";
import { listTiendas } from "@/lib/store";

export default async function TiendasPage() {
  const tiendas = await listTiendas();
  return (
    <section className="section">
      <div className="container">
        <p className="kicker">Tiendas</p>
        <h1>Quienes venden en CentralShop</h1>
        <div className="catalog-grid">
          {tiendas.map((tienda) => (
            <Link key={tienda.id} href={`/tiendas/${tienda.id}`} className="card stack">
              <h2>{tienda.nombre}</h2>
              <p className="muted">{tienda.ciudad}</p>
              <p>{tienda.descripcion}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
