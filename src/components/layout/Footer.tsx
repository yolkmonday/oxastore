import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-3">
              <Image src="/oxa-logo.png" alt="OXA Matter" height={28} width={140} className="h-7 w-auto grayscale opacity-40" />
            </div>
            <p className="text-sm text-gray-500">
              &copy; 2024 PT OXA Matter Indonesia. Toko buku & penerbit.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
              Perusahaan
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-gray-700">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-gray-700">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
              Dukungan
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-gray-700">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-gray-700">
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
              Sosial
            </h4>
            <div className="flex items-center gap-3">
              <Link href="#" className="text-gray-400 hover:text-gray-600">
                <Icon icon="mdi:instagram" className="text-xl" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-gray-600">
                <Icon icon="mdi:share-variant" className="text-xl" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-center text-xs text-gray-400 uppercase tracking-widest">
            PT OXA Matter Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
