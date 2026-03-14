import Link from "next/link";
import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-1 mb-3">
              <span className="text-brand-500">*</span>
              <span className="font-bold text-gray-900">oxamatter</span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; 2024 oxamatter. curated books for intentional living.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-gray-700">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-gray-700">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-gray-700">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-gray-700">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-900 mb-4">
              Social
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
            Oxamatter Book Club Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
