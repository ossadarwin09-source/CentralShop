"use client";

import { FormEvent, useState } from "react";

export default function ContactoPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.get("nombre"),
        email: form.get("email"),
        mensaje: form.get("mensaje"),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "No se pudo enviar.");
      return;
    }
    setMessage("Mensaje recibido. Te respondemos en menos de 24 horas hábiles.");
    event.currentTarget.reset();
  }

  return (
    <section className="section">
      <div className="container split">
        <div>
          <p className="kicker">Contacto</p>
          <h1>Hablemos de tu compra o de tu tienda</h1>
          <p className="lead">Escríbenos el contexto. Si ya tienes cuenta, el mensaje queda asociado a tu usuario.</p>
          <ul>
            <li>Colombia</li>
            <li>WhatsApp Business disponible</li>
          </ul>
        </div>
        <form className="card stack" onSubmit={onSubmit}>
          <label>Nombre<input name="nombre" required placeholder="Tu nombre" /></label>
          <label>Correo<input name="email" type="email" required placeholder="tu@correo.com" /></label>
          <label>Mensaje<textarea name="mensaje" required minLength={10} placeholder="Cuéntanos qué necesitas" /></label>
          {error ? <p className="error">{error}</p> : null}
          {message ? <p className="ok-note">{message}</p> : null}
          <button className="btn-primary" type="submit">Enviar mensaje</button>
        </form>
      </div>
    </section>
  );
}
