"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { Book } from "@/types";
import { useCart } from "@/context/CartContext";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-shadow group">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400 truncate">{book.title}</p>
        <p className="text-xs text-gray-400">{book.year}</p>
      </div>

      <div className="flex justify-center mb-4">
        <Image
          src={book.coverImage}
          alt={book.title}
          width={160}
          height={220}
          className="rounded-md object-cover"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          By {book.author.split(" ").pop()}.
        </p>
        <button
          onClick={() => addToCart(book)}
          className="flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-orange-500 transition-colors cursor-pointer"
        >
          Read Now
          <Icon icon="mdi:arrow-right" className="text-base" />
        </button>
      </div>
    </div>
  );
}
