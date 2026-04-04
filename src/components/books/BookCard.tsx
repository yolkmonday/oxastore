"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Book } from "@/types";
import { useCart } from "@/context/CartContext";
import BookMockup from "@/components/books/BookMockup";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-shadow group">
      <div className="flex items-center justify-between mb-3">
        <Link href={`/books/${book.slug || book.id}`} className="text-xs text-gray-400 truncate hover:text-brand-500 transition-colors">{book.title}</Link>
        <p className="text-xs text-gray-400">{book.year}</p>
      </div>

      <Link href={`/books/${book.slug || book.id}`} className="flex justify-center mb-4 py-2">
        {book.coverImage ? (
          <BookMockup
            coverImage={book.coverImage}
            spineImage={book.spineImage ?? undefined}
            title={book.title}
            pages={book.pages}
          />
        ) : (
          <div className="w-[160px] h-[220px] rounded-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
            <p className="text-xs text-gray-500 text-center font-medium leading-relaxed line-clamp-5">
              {book.title}
            </p>
          </div>
        )}
      </Link>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          By {book.author.split(" ").pop()}.
        </p>
        <button
          onClick={() => addToCart(book)}
          className="flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-brand-500 transition-colors cursor-pointer"
        >
          Tambah
          <Icon icon="mdi:arrow-right" className="text-base" />
        </button>
      </div>
    </div>
  );
}
