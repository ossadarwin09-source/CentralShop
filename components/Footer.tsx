import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand">
            <img src="/logo-mark.svg" alt="" width={42} height={42} />
            <span>
              <strong>Central<span>Shop</span></strong>
              <small>Conectando productos y personas</small>
            </span>
          </div>
          <p className="muted">Compra y vende en un solo lugar, con pedidos, pagos y envíos trazables.</p>
        </div>
        <div>
          <h3>Explorar</h3>
          <ul>
            <li><Link href="/productos">Catálogo</Link></li>
            <li><Link href="/tiendas">Tiendas</Link></li>
            <li><Link href="/encuesta">Encuesta</Link></li>
          </ul>
        </div>
        <div>
          <h3>Cuenta</h3>
          <ul>
            <li><Link href="/cuenta">Crear cuenta</Link></li>
            <li><Link href="/cuenta">Acceder</Link></li>
            <li><Link href="/vender">Quiero vender</Link></li>
            <li><Link href="/pedidos">Mis pedidos</Link></li>
          </ul>
        </div>
        <div>
          <h3>Contacto</h3>
          <ul>
            <li>Colombia</li>
            <li><Link href="/contacto">Escríbenos</Link></li>
            <li><Link href="/nosotros">Misión y visión</Link></li>
          </ul>
        </div>
      </div>
      <div className="container legal">© {new Date().getFullYear()} CentralShop · Hecho para desplegar en Vercel</div>
    </footer>
  );
}
