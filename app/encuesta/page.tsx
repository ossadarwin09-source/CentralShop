"use client";

import { FormEvent, useState } from "react";

const opciones = [
  { id: "empezar", label: "No sé por dónde empezar a vender" },
  { id: "catalogo", label: "Me falta catálogo y fotos claras" },
  { id: "pedidos", label: "Necesito controlar pedidos y envíos" },
];

export default function EncuestaPage() {
  const [choice, setChoice] = useState(opciones[0].id);
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/encuesta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opcion: choice }),
    });
    const data = await response.json();
    setMessage(data.mensaje || "Gracias por responder.");
  }

  return (
    <section className="section">
      <div className="narrow card stack">
        <p className="kicker">Encuesta</p>
        <h1>¿Qué frena hoy tu venta en línea?</h1>
        <p className="muted">Responde sin crear cuenta. Si ya entraste, guardamos el aviso en tus notificaciones.</p>
        <form className="stack" onSubmit={onSubmit}>
          {opciones.map((opcion) => (
            <label key={opcion.id} style={{ fontWeight: 500 }}>
              <span>
                <input type="radio" name="opcion" checked={choice === opcion.id} onChange={() => setChoice(opcion.id)} /> {opcion.label}
              </span>
            </label>
          ))}
          <button className="btn-primary" type="submit">Enviar respuesta</button>
        </form>
        {message ? <p className="ok-note">{message}</p> : null}
      </div>
    </section>
  );
}
