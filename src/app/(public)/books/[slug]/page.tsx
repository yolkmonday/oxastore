import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { getBookBySlug } from "@/data/books";
import { formatCurrency } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import AddToCartButton from "@/components/books/AddToCartButton";
import Book3DSection from "@/components/books/Book3DSection";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) notFound();

  const discountedPrice = book.discount
    ? book.price * (1 - book.discount / 100)
    : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link
        href="/books"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-8"
      >
        <Icon icon="mdi:arrow-left" className="text-base" />
        Kembali ke Daftar Buku
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-10">
        {/* Cover */}
        <div className="flex flex-col items-center gap-4">
          {book.backImage && book.spineImage ? (
            <div className="relative w-[380px]">
              {book.discount && (
                <Badge
                  variant="discount"
                  className="absolute top-2 left-2 z-10"
                >
                  {book.discount}% DISKON
                </Badge>
              )}
              {book.isBestSeller && (
                <Badge
                  variant="bestseller"
                  className="absolute top-2 right-2 z-10"
                >
                  Best Seller
                </Badge>
              )}
              <Book3DSection
                frontImage={book.coverImage || "https://placehold.co/220x293/e5e7eb/9ca3af?text=No+Cover"}
                backImage={book.backImage}
                spineImage={book.spineImage}
                pages={book.pages}
                className="w-full h-[500px] p-4"
              />
            </div>
          ) : (
            <div className="relative w-[220px] aspect-[3/4] rounded-xl overflow-hidden shadow-lg bg-gray-100">
              {book.discount && (
                <Badge
                  variant="discount"
                  className="absolute top-2 left-2 z-10"
                >
                  {book.discount}% DISKON
                </Badge>
              )}
              {book.isBestSeller && (
                <Badge
                  variant="bestseller"
                  className="absolute top-2 right-2 z-10"
                >
                  Best Seller
                </Badge>
              )}
              <Image
                src={book.coverImage || "https://placehold.co/220x293/e5e7eb/9ca3af?text=No+Cover"}
                alt={book.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <AddToCartButton book={book} />
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-brand-500 font-medium uppercase tracking-wide mb-1">
            {book.category}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{book.title}</h1>
          <p className="text-gray-500 mb-4">oleh {book.author}</p>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(discountedPrice ?? book.price)}
            </span>
            {discountedPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(book.price)}
              </span>
            )}
          </div>

          {book.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {book.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full border border-brand-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {book.description && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Deskripsi
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>
          )}

          {/* Marketplace Links */}
          {book.marketplaceLinks && book.marketplaceLinks.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Beli di Marketplace
              </h2>
              <div className="flex flex-wrap gap-2">
                {book.marketplaceLinks.map((mp, i) => (
                  <a
                    key={i}
                    href={mp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-brand-400 hover:text-brand-600 transition-colors bg-white"
                  >
                    {mp.type === "shopee" && <Icon icon="simple-icons:shopee" className="text-base text-orange-500" />}
                    {mp.type === "tokopedia" && <Icon icon="simple-icons:tokopedia" className="text-base text-green-500" />}
                    {mp.type === "lazada" && <Icon icon="simple-icons:lazada" className="text-base text-blue-500" />}
                    {mp.type === "bukalapak" && <Icon icon="simple-icons:bukalapak" className="text-base text-red-500" />}
                    {mp.type === "blibli" && <Icon icon="simple-icons:blibli" className="text-base text-blue-400" />}
                    {mp.type === "amazon" && <Icon icon="simple-icons:amazon" className="text-base text-yellow-500" />}
                    {mp.type === "website" && <Icon icon="mdi:web" className="text-base text-gray-500" />}
                    {{
                      shopee: "Shopee",
                      tokopedia: "Tokopedia",
                      lazada: "Lazada",
                      bukalapak: "Bukalapak",
                      blibli: "Blibli",
                      amazon: "Amazon",
                      website: "Website Resmi",
                    }[mp.type]}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Metadata grid */}
          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Detail Buku
            </h2>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="text-gray-400">Tahun Terbit</dt>
                <dd className="font-medium text-gray-900">{book.year}</dd>
              </div>
              {book.publisher && (
                <div>
                  <dt className="text-gray-400">Penerbit</dt>
                  <dd className="font-medium text-gray-900">{book.publisher}</dd>
                </div>
              )}
              {book.language && (
                <div>
                  <dt className="text-gray-400">Bahasa</dt>
                  <dd className="font-medium text-gray-900">{book.language}</dd>
                </div>
              )}
              {book.pages && (
                <div>
                  <dt className="text-gray-400">Jumlah Halaman</dt>
                  <dd className="font-medium text-gray-900">{book.pages} halaman</dd>
                </div>
              )}
              {(book.length || book.width) && (
                <div>
                  <dt className="text-gray-400">Ukuran</dt>
                  <dd className="font-medium text-gray-900">
                    {[book.length, book.width].filter(Boolean).join(" × ")} cm
                  </dd>
                </div>
              )}
              {book.weight && (
                <div>
                  <dt className="text-gray-400">Berat</dt>
                  <dd className="font-medium text-gray-900">{book.weight} gram</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
