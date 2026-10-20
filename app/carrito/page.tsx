"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cartTotal, readCart, writeCart, type CartItem } from "@/lib/cart";
import { cop } from "@/lib/format";

export default function CarritoPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  function update(productoId: number, cantidad: number) {
    const next = readCart()
      .map((item) => (item.productoId === productoId ? { ...item, cantidad: Math.max(1, Math.min(item.stock, cantidad)) } : item));
    writeCart(next);
    setItems(next);
  }

  function remove(productoId: number) {
    const next = readCart().filter((item) => item.productoId !== productoId);
    writeCart(next);
    setItems(next);
  }

  const subtotal = cartTotal(items);
  const envio = subtotal === 0 || subtotal >= 150000 ? 0 : 12000;

  return (
    <section className="section">
      <div className="container">
        <p className="kicker">Carrito</p>
        <h1>Tu compra</h1>
        {items.length === 0 ? (
          <div className="card empty">
            <p>Todavía no agregas productos.</p>
            <Link className="btn-primary" href="/productos">Explorar productos</Link>
          </div>
        ) : (
          <div className="split">
            <div className="card">
              <table className="table">
                <thead>
                  <tr><th>Producto</th><th>Cantidad</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.productoId}>
                      <td>
                        <strong>{item.nombre}</strong>
                        <div className="muted">{item.tienda}</div>
                        <button className="chip" type="button" onClick={() => remove(item.productoId)}>Quitar</button>
                      </td>
                      <td>
                        <div className="qty">
                          <button type="button" onClick={() => update(item.productoId, item.cantidad - 1)}>-</button>
                          <span>{item.cantidad}</span>
                          <button type="button" onClick={() => update(item.productoId, item.cantidad + 1)}>+</button>
                        </div>
                      </td>
                      <td>{cop(item.precio * item.cantidad)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <aside className="card stack">
              <h2>Resumen</h2>
              <p>Subtotal <strong>{cop(subtotal)}</strong></p>
              <p>Envío <strong>{envio === 0 ? "Gratis" : cop(envio)}</strong></p>
              <p>El envío es gratis desde $150.000.</p>
              <p className="price">Total {cop(subtotal + envio)}</p>
              <Link className="btn-primary" href="/checkout">Continuar al pago</Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
