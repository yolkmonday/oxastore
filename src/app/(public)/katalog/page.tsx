import Link from "next/link";
import { Icon } from "@iconify/react";

export default function KatalogPage() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      <section className="py-16 md:py-24 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
          Katalog Buku
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Katalog buku OXA Matter Indonesia akan segera hadir. Kami saat ini
          sedang dalam proses pendaftaran ISBN dan akan segera mempublikasikan
          daftar terbitan kami di halaman ini.
        </p>
      </section>

      <section className="pb-16 md:pb-24 text-center">
        <div className="bg-gray-50 rounded-2xl px-8 py-12">
          <Icon
            icon="mdi:bookshelf"
            className="text-6xl text-gray-300 mx-auto mb-6"
          />
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Segera hadir
          </h3>
          <p className="text-base text-gray-600 mb-6 max-w-md mx-auto">
            Sementara itu, Anda dapat melihat koleksi buku yang tersedia di toko
            kami.
          </p>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Lihat koleksi buku
            <Icon icon="mdi:arrow-right" className="text-lg" />
          </Link>
        </div>
      </section>
    </div>
  );
}
