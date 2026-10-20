"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cartCount, readCart } from "@/lib/cart";
import type { UsuarioPublico } from "@/lib/types";

const links = [
  { href: "/productos", label: "Productos" },
  { href: "/tiendas", label: "Tiendas" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<UsuarioPublico | null>(null);

  useEffect(() => {
    const sync = () => setCount(cartCount(readCart()));
    sync();
    window.addEventListener("cs-cart", sync);
    window.addEventListener("storage", sync);
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
    return () => {
      window.removeEventListener("cs-cart", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link href="/" className="brand" aria-label="CentralShop, inicio">
          <img src="/logo-mark.svg" alt="" width={46} height={46} />
          <span>
            <strong>Central<span>Shop</span></strong>
            <small>Conectando productos y personas</small>
          </span>
        </Link>
        <nav className="nav" aria-label="Principal">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
        <div className="actions">
          <Link className="icon-btn" href="/favoritos" aria-label="Favoritos">♡</Link>
          <Link className="icon-btn" href="/carrito" aria-label="Carrito">
            Carrito {count > 0 ? <b>{count}</b> : null}
          </Link>
          <Link className="icon-btn" href={user ? "/panel" : "/cuenta"}>
            {user ? user.nombre.split(" ")[0] : "Entrar"}
          </Link>
          <button className="menu-btn" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            Menú
          </button>
        </div>
      </div>
      <div className={`container mobile-nav ${open ? "open" : ""}`}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>
        ))}
      </div>
    </header>
  );
}
