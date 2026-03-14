"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { CartItem as CartItemType } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { removeFromCart, incrementQty, decrementQty } = useCart();
  const { book, quantity } = item;

  return (
    <div className="flex items-center gap-4 py-6 border-b border-gray-100">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
          {book.coverImage ? (
            <Image
              src={book.coverImage}
              alt={book.title}
              width={64}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-1">
              <p className="text-[10px] text-gray-400 text-center line-clamp-3">{book.title}</p>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm text-gray-900">{book.title}</h3>
          <p className="text-xs text-gray-500">{book.author}</p>
          <button
            onClick={() => removeFromCart(book.id)}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 mt-1 cursor-pointer"
          >
            <Icon icon="mdi:delete-outline" className="text-sm" />
            HAPUS
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => decrementQty(book.id)}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-50 cursor-pointer"
        >
          <Icon icon="mdi:minus" className="text-sm" />
        </button>
        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
        <button
          onClick={() => incrementQty(book.id)}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-50 cursor-pointer"
        >
          <Icon icon="mdi:plus" className="text-sm" />
        </button>
      </div>

      <p className="w-20 text-right text-sm text-gray-500">
        {formatCurrency(book.price)}
      </p>

      <p className="w-24 text-right font-semibold text-sm text-gray-900">
        {formatCurrency(book.price * quantity)}
      </p>
    </div>
  );
}
