"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CartItem from "./CartItem";

export default function CartTable() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link
          href="/books"
          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
        >
          Browse our collection
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="hidden sm:grid grid-cols-[1fr_140px_80px_96px] gap-4 pb-3 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Book Details
        </p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
          Quantity
        </p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
          Price
        </p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
          Total
        </p>
      </div>

      {items.map((item) => (
        <CartItem key={item.book.id} item={item} />
      ))}
    </div>
  );
}
