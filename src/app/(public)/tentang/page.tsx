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
          buku menemukan
          <br />
          pembacanya
        </p>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
          OXA Matter Indonesia
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Toko buku yang berbasis di Padang, Sumatera Barat — menghadirkan koleksi buku pilihan yang dikurasi dengan cermat untuk pembaca di seluruh Indonesia.
        </p>
      </section>

      {/* Cerita Kami */}
      <section className="py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Cerita kami
        </h2>
        <div className="space-y-4 text-base text-gray-600 leading-relaxed">
          <p className="text-lg text-gray-700 font-medium">
            Mulai dari keyakinan bahwa buku adalah hal yang serius.
          </p>
          <p>
            OXA Matter Indonesia lahir di Padang, Sumatera Barat — dari kepercayaan bahwa pengalaman membeli buku bisa berjalan lebih dekat, lebih jujur, dan lebih bermakna bagi pembaca Indonesia. Bukan sekadar transaksi, melainkan jembatan antara kata-kata yang ditulis dengan sungguh-sungguh dan pembaca yang sedang mencarinya.
          </p>
          <p>
            Nama OXA Matter adalah pengingat bagi kami sendiri: bahwa apa yang kami sediakan harus berarti — <em>matter</em> — bagi orang yang membacanya. Karena itu, kami memilih untuk tidak menjadi toko buku yang sekadar besar. Kami memilih untuk menjadi toko buku yang bertanggung jawab terhadap apa yang ada di rak kami.
          </p>
          <p>
            Setiap judul yang masuk koleksi kami melewati pertimbangan: apakah buku ini layak dibawa ke pembaca? Apakah ia membuka sesuatu, menghibur dengan jujur, atau menemani dengan tulus? Kami tidak selalu punya jawaban yang sempurna, tapi kami berusaha agar pertanyaannya tetap hidup dalam setiap pilihan.
          </p>
          <p>
            Padang, kota tempat kami berdiri, mengajarkan kami soal kesabaran dan ketekunan — dua hal yang menurut kami juga merupakan inti dari membaca. Dari sini, kami melayani pembaca di seluruh Indonesia: mengirimkan paket-paket buku ke rumah-rumah, kantor-kantor, dan komunitas-komunitas yang percaya bahwa buku masih punya tempat di kehidupan mereka.
          </p>
          <p>
            Kami tidak terburu-buru. Kami tidak ingin terburu-buru. Buku tidak pernah dibaca dengan tergesa-gesa, dan kami percaya cara kami menjual buku pun harus mencerminkan hal itu — penuh perhatian, penuh pertimbangan, dan penuh rasa hormat kepada siapa pun yang menerimanya di ujung perjalanan.
          </p>
        </div>
      </section>

      {/* Profil & Legalitas */}
      <section className="py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Profil Usaha
        </h2>
        <div className="bg-gray-50 rounded-2xl p-8">
          <div className="space-y-4 text-base text-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4">
              <span className="font-semibold text-gray-900">Nama Usaha</span>
              <span>OXA Matter Indonesia</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4">
              <span className="font-semibold text-gray-900">Bentuk Hukum</span>
              <span>Perseroan Perorangan</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4">
              <span className="font-semibold text-gray-900">Nomor AHU</span>
              <span>AHU-015334.AH.01.30.Tahun 2026</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4">
              <span className="font-semibold text-gray-900">NIB</span>
              <span>1303260117372</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4">
              <span className="font-semibold text-gray-900">Alamat</span>
              <span>
                Jalan Jembatan Gantung, Kampung Baru Nan XX,
                <br />
                Lubuk Begalung, Kota Padang,
                <br />
                Sumatera Barat 25170
              </span>
            </div>
          </div>
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
              Kurasi
            </div>
            <p className="text-sm text-gray-600">
              Buku pilihan yang dipertimbangkan dengan cermat
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand-500 mb-2">
              Amanah
            </div>
            <p className="text-sm text-gray-600">
              Transaksi yang transparan dan terpercaya
            </p>
          </div>
        </div>
      </section>

      {/* Apa yang kami lakukan */}
      <section className="py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <Icon icon="mdi:storefront" className="text-4xl text-brand-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Jual Beli Buku
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Toko buku online dengan sistem yang transparan dan amanah — fokus pada koleksi fisik, dengan layanan pre-order dan pengiriman ke seluruh Indonesia.
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <Icon icon="mdi:bookmark-check-outline" className="text-4xl text-brand-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Kurasi Pilihan
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Setiap judul yang kami sediakan telah melalui pertimbangan — fiksi sastra, nonfiksi, dan karya-karya yang menyentuh hal-hal yang penting bagi pembaca.
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
              Kurasi yang jujur
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Kami tidak menjual sesuatu hanya karena bisa dijual. Setiap buku yang masuk koleksi telah melewati pertimbangan yang sungguh-sungguh.
            </p>
          </div>

          <div className="border-l-2 border-brand-300 pl-6">
            <div className="text-sm font-semibold text-brand-500 mb-2">02</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Keberpihakan pada pembaca
            </h3>
            <p className="text-base text-gray-600 leading-relaxed">
              Hubungan dengan pembaca dibangun di atas kepercayaan — informasi yang lengkap, deskripsi yang jujur, dan layanan yang membantu sebelum dan sesudah pembelian.
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
              Buku sebagai keseriusan
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
          &ldquo;Kami percaya setiap buku yang baik layak sampai kepada pembaca yang tepat.&rdquo;
        </blockquote>
        <p className="text-sm text-gray-500">
          — OXA Matter Indonesia, Padang
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
