"use client";

import { FormEvent, useState } from "react";

export function ReviewForm({ productoId }: { productoId: number }) {
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const response = await fetch(`/api/productos/${productoId}/resenas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calificacion, comentario }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "No se pudo publicar la reseña.");
      return;
    }
    setMessage("Reseña publicada. Recarga para verla en la lista.");
    setComentario("");
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <h3>Escribe una reseña</h3>
      <label>
        Calificación
        <select value={calificacion} onChange={(event) => setCalificacion(Number(event.target.value))}>
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Comentario
        <textarea value={comentario} onChange={(event) => setComentario(event.target.value)} required minLength={8} />
      </label>
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok-note">{message}</p> : null}
      <button className="btn-primary" type="submit">Publicar reseña</button>
    </form>
  );
}
