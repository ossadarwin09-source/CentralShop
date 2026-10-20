import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getMode } from "@/lib/store";
import { env } from "@/lib/env";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: {
    default: "CentralShop",
    template: "%s · CentralShop",
  },
  description: "Marketplace para comprar y vender con pagos protegidos. Conectando productos y personas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const mode = getMode();
  const whatsapp = env.whatsapp;

  return (
    <html lang="es">
      <body className={poppins.className}>
        {mode.mode === "demo" ? (
          <div className="demo-banner">
            <div className="container">
              Modo demostración: el catálogo es de ejemplo. Para persistir cuentas, pedidos y stock configura <strong>DATABASE_URL</strong> en Vercel.
            </div>
          </div>
        ) : null}
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton phone={whatsapp} />
        <Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
