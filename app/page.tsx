import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { listCategorias, listProductos } from "@/lib/store";

export default async function HomePage() {
  const [categorias, productos] = await Promise.all([listCategorias(), listProductos({ orden: "destacados" })]);
  const destacados = productos.slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="kicker">Marketplace verificado en Colombia</p>
            <h1>Compra y vende productos con un pedido claro de principio a fin.</h1>
            <p className="lead">
              Encuentra tiendas, compara precios en COP y sigue el pago y el envío en el mismo lugar. CentralShop conecta productos y personas.
            </p>
            <form className="btn-row" action="/productos" method="get" style={{ width: "100%" }}>
              <input name="q" placeholder="Busca audífonos, café, hogar..." aria-label="Buscar productos" style={{ flex: 1, minWidth: 220 }} />
              <button className="btn-primary" type="submit">Explorar productos</button>
            </form>
            <div className="btn-row">
              <Link className="btn-ghost" href="/vender">Quiero vender</Link>
              <Link className="btn-ghost" href="/cuenta">Crear cuenta gratis</Link>
            </div>
            <div className="trust">
              <span>★ 4,8/5 en reseñas del catálogo</span>
              <span>✓ Pagos protegidos</span>
              <span>✓ Envío con guía</span>
            </div>
          </div>
          <aside className="hero-card">
            <p className="kicker">Pedido en camino</p>
            <h2>Café Huila y lámpara Aura</h2>
            <div className="mini-order">
              <div><span>Pago PSE</span><strong>Aprobado</strong></div>
              <div><span>Envío</span><strong>En preparación</strong></div>
              <div><span>Total</span><strong>$171.900</strong></div>
            </div>
            <p className="muted">Así ve el cliente el estado: pendiente, pagado, preparando, enviado o entregado.</p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="kicker">Categorías</p>
              <h2>Encuentra lo que tu casa y tu día necesitan</h2>
            </div>
            <Link href="/productos">Ver catálogo</Link>
          </div>
          <div className="cat-grid">
            {categorias.map((categoria) => (
              <Link key={categoria.id} href={`/productos?categoria=${categoria.id}`} className="cat">
                <strong>{categoria.nombre}</strong>
                <span className="muted">{categoria.descripcion}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="kicker">Cómo funciona</p>
              <h2>De la búsqueda a la entrega</h2>
            </div>
          </div>
          <div className="steps">
            <article className="step"><b>01</b><h3>Elige el producto</h3><p className="muted">Compara tienda, precio, stock y reseñas.</p></article>
            <article className="step"><b>02</b><h3>Paga con un método claro</h3><p className="muted">Tarjeta, PSE, billetera o pago contraentrega.</p></article>
            <article className="step"><b>03</b><h3>Sigue el envío</h3><p className="muted">La guía y el estado quedan ligados al pedido.</p></article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="kicker">Destacados</p>
              <h2>Productos con mejor calificación</h2>
            </div>
            <Link href="/productos?orden=destacados">Ver todos</Link>
          </div>
          <div className="catalog-grid">
            {destacados.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container stats">
          <div className="stat"><strong>6</strong> categorías activas</div>
          <div className="stat"><strong>12</strong> productos de ejemplo</div>
          <div className="stat"><strong>24 h</strong> respuesta de contacto</div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <p className="kicker">Quiénes somos</p>
            <h2>Tecnología con propósito comercial</h2>
            <div className="values">
              <article className="value"><h3>Misión</h3><p>Facilitar la compra y la venta con un proceso rápido, seguro y trazable.</p></article>
              <article className="value"><h3>Visión</h3><p>Ser el marketplace de referencia para tiendas independientes en Latinoamérica.</p></article>
              <article className="value"><h3>Valores</h3><p>Claridad, confianza, calidad y trato directo entre tienda y cliente.</p></article>
            </div>
          </div>
          <blockquote className="quote">
            <p>“Pasamos de vender por mensajes sueltos a tener stock, reseñas y un pedido que el cliente puede seguir.”</p>
            <strong>Laura Jiménez · Cliente CentralShop</strong>
          </blockquote>
        </div>
      </section>

      <section className="section">
        <div className="container banner">
          <div>
            <h2>Tu próxima compra puede salir hoy.</h2>
            <p>Crea tu cuenta, arma el carrito y elige cómo pagar.</p>
          </div>
          <Link className="btn-ghost" href="/cuenta">Crear cuenta gratis</Link>
        </div>
      </section>
    </>
  );
}
