import Link from "next/link";
import { Icon } from "@iconify/react";
import CheckoutClientWrapper from "@/components/checkout/CheckoutClientWrapper";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <Icon icon="mdi:arrow-left" className="text-base" />
        Kembali ke Keranjang
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
      <CheckoutClientWrapper />
    </div>
  );
}
