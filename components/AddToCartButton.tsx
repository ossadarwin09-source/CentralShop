"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";
import type { Producto } from "@/lib/types";

export function AddToCartButton({ producto, cantidad = 1 }: { producto: Producto; cantidad?: number }) {
  const [message, setMessage] = useState("");

  return (
    <div className="stack">
      <button
        className="btn-primary full"
        type="button"
        disabled={producto.stock < 1}
        onClick={() => {
          addToCart(
            {
              productoId: producto.id,
              nombre: producto.nombre,
              precio: producto.precio,
              tienda: producto.tienda,
              imagen: producto.imagen,
              stock: producto.stock,
            },
            cantidad
          );
          setMessage("Agregado al carrito");
        }}
      >
        {producto.stock < 1 ? "Agotado" : "Agregar al carrito"}
      </button>
      {message ? <p className="ok-note">{message}</p> : null}
    </div>
  );
}
