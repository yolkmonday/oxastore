import Link from "next/link";
import { Icon } from "@iconify/react";
import { getBooks, getBestSellers } from "@/data/books";
import { getActiveSliders } from "@/data/sliders";
import { getCategories } from "@/data/categories";
import HeroSlider from "@/components/home/HeroSlider";
import HomeSearchBar from "@/components/home/HomeSearchBar";
import BookCard from "@/components/books/BookCard";


export const dynamic = "force-dynamic";

export default async function Home() {
  const [sliders, books, bestSellers, categories] = await Promise.all([
    getActiveSliders(),
    getBooks(),
    getBestSellers(),
    getCategories(),
  ]);

  const latestBooks = books.slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Hero Slider */}
      {sliders.length > 0 && (
        <section className="pt-6">
          <HeroSlider sliders={sliders} />
        </section>
      )}

      {/* Tagline */}
      <section className="py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
          Buku pilihan
          <span className="text-brand-500"> untuk hidup bermakna.</span>
        </h1>
        <p className="text-base text-gray-500 max-w-lg mx-auto mb-6">
          OXA Matter Indonesia — temukan koleksi buku terbaik yang menginspirasi
          pertumbuhan, kreativitas, dan kehidupan yang penuh makna.
        </p>
        <HomeSearchBar />
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Best Seller</h2>
            <Link
              href="/books?tab=popular"
              className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
            >
              Lihat semua <Icon icon="mdi:arrow-right" className="text-base" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {bestSellers.slice(0, 4).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* Buku Terbaru */}
      {latestBooks.length > 0 && (
        <section className="pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Buku Terbaru</h2>
            <Link
              href="/books"
              className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
            >
              Lihat semua <Icon icon="mdi:arrow-right" className="text-base" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {latestBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}

      {/* Kategori */}
      {categories.length > 0 && (
        <section className="pb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Kategori</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/books?tab=${cat.slug}`}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:shadow-md hover:border-brand-200 transition-all group"
              >
                <Icon
                  icon="mdi:bookshelf"
                  className="text-xl text-brand-400 group-hover:text-brand-500"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
