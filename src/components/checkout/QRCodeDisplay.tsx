"use client";

import { useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface QRCodeDisplayProps {
  orderId: string;
  qrString: string;
  total: number;
}

export default function QRCodeDisplay({ orderId, qrString, total }: QRCodeDisplayProps) {
  const router = useRouter();

  const checkStatus = useCallback(async () => {
    const res = await fetch(`/api/midtrans/status?order_id=${orderId}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.status === "paid") {
      router.push("/akun/pesanan");
    }
  }, [orderId, router]);

  useEffect(() => {
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Scan QR Code untuk Bayar</h2>
        <p className="text-sm text-gray-500">Total: <span className="font-semibold text-gray-900">{formatCurrency(total)}</span></p>
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
        <QRCodeSVG value={qrString} size={240} />
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Menunggu pembayaran...
      </div>
      <p className="text-xs text-gray-400 text-center max-w-xs">
        Scan dengan aplikasi QRIS yang didukung (GoPay, OVO, Dana, dll). Halaman akan otomatis berpindah setelah pembayaran berhasil.
      </p>
    </div>
  );
}
