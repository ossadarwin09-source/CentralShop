"use client";

import { useState } from "react";

export function FavoriteButton({ productoId }: { productoId: number }) {
  const [message, setMessage] = useState("");

  async function toggle() {
    const response = await fetch("/api/favoritos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productoId }),
    });
    const data = await response.json();
    setMessage(response.ok ? (data.activo ? "Guardado en favoritos" : "Quitado de favoritos") : data.error);
  }

  return (
    <button className="btn-ghost" type="button" onClick={toggle}>
      {message || "Guardar favorito"}
    </button>
  );
}
