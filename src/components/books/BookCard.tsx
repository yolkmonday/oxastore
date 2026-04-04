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
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl transition-shadow group">
      <Link href={`/books/${book.slug || book.id}`} className="flex justify-center py-4">
        {book.coverImage ? (
          <BookMockup
            coverImage={book.coverImage}
            backImage={book.backImage}
            spineImage={book.spineImage}
            title={book.title}
            pages={book.pages}
          />
        ) : (
          <div className="w-[190px] h-[250px] rounded-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
            <p className="text-sm text-gray-500 text-center font-medium leading-relaxed line-clamp-5">
              {book.title}
            </p>
          </div>
        )}
      </Link>

      <div className="mt-3">
        <Link href={`/books/${book.slug || book.id}`} className="block mb-1">
          <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-brand-500 transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mb-3">
          {book.author}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">{book.year}</p>
          <button
            onClick={() => addToCart(book)}
            className="flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-brand-500 transition-colors cursor-pointer"
          >
            Tambah
            <Icon icon="mdi:arrow-right" className="text-base" />
          </button>
        </div>
      </div>
    </div>
  );
}
