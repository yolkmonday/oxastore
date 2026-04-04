import Link from "next/link";
import { Icon } from "@iconify/react";

export const dynamic = "force-dynamic";

export default function TentangPage() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center">
        <p className="text-base md:text-lg text-gray-500 mb-4 italic">
          Tempat di mana
          <br />
          kata-kata menemukan
          <br />
          pembacanya
        </p>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
          OXA Matter
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          OXA Matter hadir sebagai ruang pertemuan antara penulis, penerbit, dan pembaca — melalui buku-buku yang dipilih, diterbitkan, dan disebarkan dengan penuh pertimbangan.
        </p>
      </section>

      {/* Cerita Kami */}
      <section className="py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Cerita kami
        </h2>
        <div className="space-y-4 text-base text-gray-600 leading-relaxed">
          <p>
            Mulai dari keyakinan bahwa buku adalah hal yang serius
          </p>
          <p>
            OXA Matter lahir di Padang, Sumatera Barat — dari kepercayaan bahwa industri penerbitan bisa berjalan lebih dekat, lebih jujur, dan lebih bermakna bagi penulis dan pembaca Indonesia.
          </p>
          <p>
            Di bawah PT Oxa Matter Indonesia, kami menjalankan dua peran sekaligus: sebagai OXA Publisher, kami menerbitkan karya-karya yang layak mendapat perhatian lebih luas; sebagai toko buku, kami memastikan buku-buku tersebut sampai ke tangan yang tepat.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand-500 mb-2">
              Padang
            </div>
            <p className="text-sm text-gray-600">
              Berbasis di Sumatera Barat, melayani seluruh Indonesia
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand-500 mb-2">
              2 peran
            </div>
            <p className="text-sm text-gray-600">
              Penerbit sekaligus toko buku dalam satu atap
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand-500 mb-2">
              ISBN
            </div>
            <p className="text-sm text-gray-600">
              Terdaftar di Perpustakaan Nasional RI
            </p>
          </div>
        </div>
      </section>

      {/* Two Roles */}
      <section className="py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <Icon icon="mdi:book-open-page-variant" className="text-4xl text-brand-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              OXA Publisher
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Kami menerbitkan fiksi sastra, nonfiksi, dan karya-karya yang menyentuh hal-hal yang penting — dengan proses editorial yang cermat dan produksi fisik yang layak dibanggakan.
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <Icon icon="mdi:storefront" className="text-4xl text-brand-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Toko Buku OXA
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Jual beli buku dengan sistem yang transparan dan amanah — tersedia dalam format fisik maupun digital, dengan layanan pre-order dan pengiriman ke seluruh Indonesia.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10">
          Yang kami pegang
        </h2>
        <p className="text-base text-gray-500 mb-10">
          Nilai-nilai yang menjadi landasan
        </p>

        <div className="space-y-8">
          <div className="border-l-2 border-brand-300 pl-6">
            <div className="text-sm font-semibold text-brand-500 mb-2">01</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Kejujuran editorial
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Kami tidak menerbitkan sesuatu hanya karena bisa diterbitkan. Setiap naskah yang kami bawa ke pembaca telah melewati pertimbangan yang sungguh-sungguh.
            </p>
          </div>

          <div className="border-l-2 border-brand-300 pl-6">
            <div className="text-sm font-semibold text-brand-500 mb-2">02</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Keberpihakan pada penulis
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Hubungan dengan penulis dibangun di atas kepercayaan dan keadilan — hak cipta dihormati, royalti dibayar dengan benar, proses penerbitan dilakukan bersama.
            </p>
          </div>

          <div className="border-l-2 border-brand-300 pl-6">
            <div className="text-sm font-semibold text-brand-500 mb-2">03</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Transaksi yang amanah
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Setiap jual beli di OXA dijalankan dengan prinsip keterbukaan — syarat yang jelas, harga yang jujur, dan produk yang sesuai dengan yang dijanjikan.
            </p>
          </div>

          <div className="border-l-2 border-brand-300 pl-6">
            <div className="text-sm font-semibold text-brand-500 mb-2">04</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Sastra sebagai keseriusan
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Buku bukan sekadar produk. Ia adalah cara manusia merawat pemahaman tentang diri dan dunianya — dan kami memperlakukannya demikian.
            </p>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-16 md:py-24 text-center">
        <blockquote className="text-xl md:text-2xl font-medium text-gray-700 italic max-w-3xl mx-auto mb-8 leading-relaxed">
          &ldquo;Kami percaya setiap buku yang layak ditulis juga layak diterbitkan — dan layak sampai kepada pembaca yang tepat.&rdquo;
        </blockquote>
        <p className="text-sm text-gray-500">
          — OXA Matter, Padang
        </p>
      </section>

      {/* CTA */}
      <section className="pb-16 md:pb-24 text-center">
        <div className="bg-gray-50 rounded-2xl px-8 py-12">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            Jelajahi koleksi buku kami
          </h3>
          <p className="text-base text-gray-600 mb-6">
            Temukan buku-buku pilihan yang telah kami kurasi dengan cermat.
          </p>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Lihat semua buku
            <Icon icon="mdi:arrow-right" className="text-lg" />
          </Link>
        </div>
      </section>
    </div>
  );
}
