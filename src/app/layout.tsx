import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OXA Matter Indonesia — Penerbit & Toko Buku",
  description:
    "OXA Matter Indonesia adalah penerbit dan toko buku yang berbasis di Padang, Sumatera Barat. OXA Publisher adalah imprint penerbitan dari OXA Matter Indonesia.",
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
