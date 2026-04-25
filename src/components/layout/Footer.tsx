import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Legalitas */}
          <div>
            <div className="mb-3">
              <Image src="/oxa-logo.png" alt="OXA Matter Indonesia" height={28} width={140} className="h-7 w-auto grayscale opacity-40" />
            </div>
            <p className="text-sm text-gray-500">
              &copy; 2026 OXA Matter Indonesia. Toko buku online.
            </p>
            <div className="mt-3 space-y-1 text-xs text-gray-400">
              <p>Perseroan Perorangan</p>
              <p>AHU-015334.AH.01.30.Tahun 2026</p>
              <p>NIB: 1303260117372</p>
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
              Navigasi
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/books" className="text-sm text-gray-500 hover:text-gray-700">
                  Buku
                </Link>
              </li>
              <li>
                <Link href="/katalog" className="text-sm text-gray-500 hover:text-gray-700">
                  Katalog
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-700">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
              Informasi
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tentang" className="text-sm text-gray-500 hover:text-gray-700">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="text-sm text-gray-500 hover:text-gray-700">
                  Kontak
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-500 hover:text-gray-700">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak & Sosial */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
              Hubungi Kami
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:halo@oxamatter.com" className="text-sm text-gray-500 hover:text-gray-700">
                  halo@oxamatter.com
                </a>
              </li>
              <li>
                <span className="text-sm text-gray-500">
                  Padang, Sumatera Barat
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-center text-xs text-gray-400 uppercase tracking-widest">
            OXA Matter Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
