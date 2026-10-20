export function WhatsAppButton({ phone }: { phone: string }) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent("Hola, quiero información de CentralShop.")}`;
  return (
    <a className="whatsapp" href={href} target="_blank" rel="noreferrer" aria-label="Hablar por WhatsApp">
      WA
    </a>
  );
}
