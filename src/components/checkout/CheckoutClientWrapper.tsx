"use client";

import { useCart } from "@/context/CartContext";
import CheckoutForm from "./CheckoutForm";

export default function CheckoutClientWrapper() {
  const { items, getCartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium mb-2">Keranjang kosong</p>
        <p className="text-sm">Tambahkan buku terlebih dahulu sebelum checkout.</p>
      </div>
    );
  }

  return <CheckoutForm items={items} total={getCartTotal()} />;
}
