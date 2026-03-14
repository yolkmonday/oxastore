"use client";

import { Icon } from "@iconify/react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function CartSummary() {
  const { getCartTotal, items } = useCart();
  const subtotal = getCartTotal();

  if (items.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Ringkasan.</h2>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-600">Subtotal</span>
          <span className="font-semibold text-sm">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-600">Pengiriman</span>
          <Badge variant="free">GRATIS</Badge>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>

      <Button variant="dark" className="w-full" size="lg">
        Checkout Sekarang
        <Icon icon="mdi:arrow-right" className="text-lg" />
      </Button>

      <div className="flex items-center justify-center gap-1.5 mt-4">
        <Icon icon="mdi:lock-outline" className="text-xs text-gray-400" />
        <p className="text-xs text-gray-400 uppercase tracking-wider">
          Pembayaran Aman Terenkripsi
        </p>
      </div>
    </div>
  );
}
