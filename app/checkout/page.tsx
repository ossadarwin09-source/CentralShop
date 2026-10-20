"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cartTotal, readCart, writeCart } from "@/lib/cart";
import { cop } from "@/lib/format";
import type { UsuarioPublico } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<UsuarioPublico | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ReturnType<typeof readCart>>([]);
  const subtotal = cartTotal(items);

  useEffect(() => {
    setItems(readCart());
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => setUser(data.user))
      .finally(() => setReady(true));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metodo: form.get("metodo"),
        direccion: {
          alias: form.get("alias"),
          departamento: form.get("departamento"),
          ciudad: form.get("ciudad"),
          direccion: form.get("direccion"),
          referencia: form.get("referencia"),
          telefono: form.get("telefono"),
        },
        items: readCart().map((item) => ({ productoId: item.productoId, cantidad: item.cantidad })),
      }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "No se pudo crear el pedido.");
      return;
    }
    const previous = JSON.parse(localStorage.getItem("cs_pedidos") || "[]");
    localStorage.setItem("cs_pedidos", JSON.stringify([data.pedido, ...previous]));
    writeCart([]);
    router.push("/pedidos?ok=1");
  }

  if (!ready) return <p className="container">Cargando pago…</p>;
  if (!items.length) {
    return (
      <section className="section"><div className="container card empty">
        <p>Tu carrito está vacío.</p>
        <Link className="btn-primary" href="/productos">Ver productos</Link>
      </div></section>
    );
  }
  if (!user) {
    return (
      <section className="section"><div className="container card stack">
        <h1>Entra para pagar</h1>
        <p>El pedido queda a nombre de tu cuenta.</p>
        <Link className="btn-primary" href="/cuenta?next=/checkout">Iniciar sesión</Link>
      </div></section>
    );
  }

  return (
    <section className="section">
      <div className="container split">
        <form className="card stack" onSubmit={onSubmit}>
          <p className="kicker">Pago y envío</p>
          <h1>Datos de entrega</h1>
          <div className="form-grid">
            <label>Alias<input name="alias" placeholder="Casa" /></label>
            <label>Teléfono<input name="telefono" defaultValue={user.telefono} /></label>
            <label>Departamento<input name="departamento" required placeholder="Antioquia" /></label>
            <label>Ciudad<input name="ciudad" required placeholder="Medellín" /></label>
          </div>
          <label>Dirección<input name="direccion" required placeholder="Calle 10 # 20-30" /></label>
          <label>Referencia<input name="referencia" placeholder="Apto, portería, barrio" /></label>
          <label>
            Método de pago
            <select name="metodo" defaultValue="pse">
              <option value="pse">PSE</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="billetera">Billetera</option>
              <option value="efectivo_contraentrega">Efectivo contraentrega</option>
            </select>
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Creando pedido…" : `Pagar ${cop(subtotal + (subtotal >= 150000 ? 0 : 12000))}`}</button>
        </form>
        <aside className="card">
          <h2>Resumen</h2>
          {items.map((item) => (
            <p key={item.productoId}>{item.cantidad} × {item.nombre}<br /><strong>{cop(item.precio * item.cantidad)}</strong></p>
          ))}
        </aside>
      </div>
    </section>
  );
}
