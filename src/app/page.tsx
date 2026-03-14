import Link from "next/link";
import { Icon } from "@iconify/react";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <section className="py-24 md:py-32 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
          Curated books
          <br />
          <span className="text-orange-500">for intentional living.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
          Discover handpicked collections of books that inspire growth,
          creativity, and mindful living. Start your journey today.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Browse Library
            <Icon icon="mdi:arrow-right" className="text-lg" />
          </Link>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            View Cart
          </Link>
        </div>
      </section>
    </div>
  );
}
