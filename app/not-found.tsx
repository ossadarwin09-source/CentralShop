import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="narrow card stack">
        <h1>No encontramos esa página</h1>
        <Link className="btn-primary" href="/">Volver al inicio</Link>
      </div>
    </section>
  );
}
