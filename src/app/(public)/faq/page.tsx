"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

const faqs = [
  {
    q: "Bagaimana cara memesan buku?",
    a: "Pilih buku yang diinginkan, tambahkan ke keranjang, lalu lanjutkan ke pembayaran. Kami menerima pembayaran melalui berbagai metode termasuk transfer bank dan e-wallet.",
  },
  {
    q: "Berapa lama pengiriman?",
    a: "Pengiriman dalam kota Padang membutuhkan 1-2 hari kerja. Untuk pengiriman ke luar kota, estimasi 3-7 hari kerja tergantung lokasi dan jasa pengiriman yang dipilih.",
  },
  {
    q: "Apakah bisa mengembalikan buku yang sudah dibeli?",
    a: "Pengembalian bisa dilakukan dalam 7 hari setelah buku diterima jika terdapat cacat cetak atau kerusakan akibat pengiriman. Hubungi kami melalui WhatsApp atau email untuk proses pengembalian.",
  },
  {
    q: "Apakah tersedia buku digital (e-book)?",
    a: "Saat ini kami fokus pada buku fisik. Untuk ketersediaan format digital, silakan hubungi kami langsung.",
  },
  {
    q: "Bagaimana cara menerbitkan buku di OXA Publisher?",
    a: "Kirimkan naskah Anda melalui email ke halo@oxamatter.com dengan subjek 'Pengajuan Naskah'. Sertakan sinopsis, 3 bab pertama, dan biodata penulis. Tim editorial kami akan merespons dalam 2-4 minggu.",
  },
  {
    q: "Apakah ada program pre-order?",
    a: "Ya, untuk judul-judul tertentu kami membuka program pre-order dengan harga khusus. Ikuti akun media sosial kami untuk informasi terbaru.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-6">
      <section className="py-16 md:py-24 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
          Pertanyaan Umum
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Temukan jawaban untuk pertanyaan yang sering diajukan.
        </p>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex items-center justify-between w-full py-5 text-left gap-4"
              >
                <span className="text-base font-medium text-gray-900">
                  {faq.q}
                </span>
                <Icon
                  icon={openIndex === i ? "mdi:chevron-up" : "mdi:chevron-down"}
                  className="text-xl text-gray-400 shrink-0"
                />
              </button>
              {openIndex === i && (
                <div className="pb-5 text-sm text-gray-600 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="pb-16 md:pb-24 text-center">
        <div className="bg-gray-50 rounded-2xl px-8 py-10">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Masih ada pertanyaan?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Hubungi kami langsung dan kami akan dengan senang hati membantu.
          </p>
          <a
            href="/kontak"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Hubungi Kami
            <Icon icon="mdi:arrow-right" className="text-lg" />
          </a>
        </div>
      </section>
    </div>
  );
}
