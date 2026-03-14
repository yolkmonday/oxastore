import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OXA Store — toko buku & penerbit",
  description:
    "Toko buku dan penerbit OXA Publisher. PT OXA Matter Indonesia.",
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
