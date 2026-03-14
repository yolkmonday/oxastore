"use client";

import Image from "next/image";
import { Book } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

interface BestSellerCardProps {
  book: Book;
}

export default function BestSellerCard({ book }: BestSellerCardProps) {
  const { addToCart } = useCart();

  return (
    <div
      className="group cursor-pointer"
      onClick={() => addToCart(book)}
    >
      <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-3 aspect-[3/4]">
        {book.discount && (
          <Badge
            variant="discount"
            className="absolute top-2 left-2 z-10"
          >
            {book.discount}% OFF
          </Badge>
        )}
        <Image
          src={book.coverImage}
          alt={book.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
        />
      </div>
      <h3 className="font-semibold text-sm text-gray-900">{book.title}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
      <p className="font-semibold text-sm text-gray-900 mt-1">
        {formatCurrency(book.price)}
      </p>
    </div>
  );
}
