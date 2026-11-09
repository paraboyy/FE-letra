import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Letra Studio",
    default: "Letra Studio — Premium Photography Studio",
  },
  description:
    "Letra Studio adalah studio foto profesional yang menyediakan layanan fotografi premium. Reservasi paket foto, potret keluarga, pre-wedding, dan lebih banyak lagi.",
  keywords: ["letra studio", "foto studio", "reservasi foto", "fotografer profesional", "paket foto", "midtrans"],
  authors: [{ name: "Letra Studio" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Letra Studio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-pX9yZa1B3_LetraStudio";
  const snapUrl = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <html lang="id" data-scroll-behavior="smooth">
      <head>
        {/* Midtrans Snap JS SDK */}
        <Script
          src={snapUrl}
          data-client-key={midtransClientKey}
          strategy="lazyOnload"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
