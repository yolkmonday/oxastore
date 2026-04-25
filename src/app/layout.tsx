import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OXA Matter Indonesia — Toko Buku Online",
  description:
    "OXA Matter Indonesia adalah toko buku online yang berbasis di Padang, Sumatera Barat. Menghadirkan koleksi buku pilihan untuk pembaca di seluruh Indonesia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" translate="no">
      <body className="antialiased">{children}</body>
    </html>
  );
}
