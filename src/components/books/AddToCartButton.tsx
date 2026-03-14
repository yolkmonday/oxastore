"use client";

import { Icon } from "@iconify/react";
import { Book } from "@/types";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ book }: { book: Book }) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(book)}
      className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
    >
      <Icon icon="mdi:cart-plus" className="text-lg" />
      Tambah ke Keranjang
    </button>
  );
}
