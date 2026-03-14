import Image from "next/image";
import Link from "next/link";
import { Book } from "@/types";
import { formatCurrency } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

interface BestSellerCardProps {
  book: Book;
}

export default function BestSellerCard({ book }: BestSellerCardProps) {
  return (
    <Link href={`/books/${book.slug || book.id}`} className="group block">
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden mb-3 aspect-[3/4]">
        {book.discount && (
          <Badge
            variant="discount"
            className="absolute top-2 left-2 z-10"
          >
            {book.discount}% DISKON
          </Badge>
        )}
        {book.coverImage ? (
          <Image
            src={book.coverImage}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <p className="text-xs text-gray-500 text-center font-medium leading-relaxed line-clamp-6">
              {book.title}
            </p>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-sm text-gray-900">{book.title}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
      <p className="font-semibold text-sm text-gray-900 mt-1">
        {formatCurrency(book.price)}
      </p>
    </Link>
  );
}
