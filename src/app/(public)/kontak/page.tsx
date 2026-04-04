import { Icon } from "@iconify/react";

export default function KontakPage() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      <section className="py-16 md:py-24 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
          Hubungi Kami
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Ada pertanyaan, saran, atau ingin bekerja sama? Jangan ragu untuk menghubungi kami.
        </p>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <Icon icon="mdi:email-outline" className="text-4xl text-brand-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <a
              href="mailto:halo@oxamatter.com"
              className="text-sm text-gray-600 hover:text-brand-500 transition-colors"
            >
              halo@oxamatter.com
            </a>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <Icon icon="mdi:whatsapp" className="text-4xl text-brand-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
            <a
              href="https://wa.me/628123456789"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-brand-500 transition-colors"
            >
              +62 812-3456-789
            </a>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <Icon icon="mdi:map-marker-outline" className="text-4xl text-brand-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Alamat</h3>
            <p className="text-sm text-gray-600">
              Padang, Sumatera Barat
              <br />
              Indonesia
            </p>
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Jam Operasional</h2>
          <p className="text-sm text-gray-500 mb-6">Waktu Indonesia Barat (WIB)</p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Senin — Jumat</span>
              <span className="font-medium text-gray-900">09.00 — 17.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sabtu</span>
              <span className="font-medium text-gray-900">09.00 — 14.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Minggu & Hari Libur</span>
              <span className="font-medium text-gray-500">Tutup</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
