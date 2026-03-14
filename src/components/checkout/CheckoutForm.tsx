"use client";

import { useActionState } from "react";
import { Icon } from "@iconify/react";
import { checkoutAction, CheckoutResult } from "@/actions/checkout";
import { CartItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/ui/Button";
import QRCodeDisplay from "./QRCodeDisplay";

interface CheckoutFormProps {
  items: CartItem[];
  total: number;
}

export default function CheckoutForm({ items, total }: CheckoutFormProps) {
  const boundAction = checkoutAction.bind(null, items);
  const [state, action] = useActionState(boundAction, undefined as CheckoutResult | undefined);

  if (state?.qrString && state?.orderId) {
    return (
      <QRCodeDisplay
        orderId={state.orderId}
        qrString={state.qrString}
        total={total}
      />
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {state.error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penerima</label>
        <input
          type="text"
          name="shipping_name"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Nama lengkap penerima"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
        <input
          type="tel"
          name="shipping_phone"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="08xxxxxxxxxx"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman</label>
        <textarea
          name="shipping_address"
          required
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          placeholder="Jl. Contoh No. 1, RT/RW, Kelurahan, Kecamatan"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
        <input
          type="text"
          name="shipping_city"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Jakarta"
        />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-gray-900">Total Pembayaran</span>
          <span className="text-xl font-bold text-brand-600">{formatCurrency(total)}</span>
        </div>
        <Button type="submit" variant="dark" className="w-full" size="lg">
          Bayar dengan QRIS
          <Icon icon="mdi:qrcode" className="text-xl" />
        </Button>
      </div>
    </form>
  );
}
