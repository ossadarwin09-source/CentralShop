import Link from "next/link";

export default function NosotrosPage() {
  return (
    <section className="section">
      <div className="narrow stack">
        <p className="kicker">CentralShop</p>
        <h1>Conectando productos y personas</h1>
        <p className="lead">Somos un marketplace de comercio electrónico para que una tienda publique su catálogo y un cliente compre, pague y reciba con trazabilidad.</p>
        <div className="values">
          <article className="value"><h2>Misión</h2><p>Facilitar la compra y la venta de productos de manera rápida, segura y eficiente.</p></article>
          <article className="value"><h2>Visión</h2><p>Ser el aliado comercial de tiendas independientes que quieren vender en línea sin perder el control del pedido.</p></article>
          <article className="value"><h2>Valores</h2><p>Claridad en el precio, respeto por el stock real y comunicación directa.</p></article>
        </div>
        <Link className="btn-primary" href="/contacto">Hablar con nosotros</Link>
      </div>
    </section>
  );
}
