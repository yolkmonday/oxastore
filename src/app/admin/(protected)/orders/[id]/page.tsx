import { notFound } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { getOrderById } from "@/data/orders";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@/types";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import UpdateOrderStatusForm from "@/components/admin/UpdateOrderStatusForm";
import { updateOrderStatusAction } from "@/actions/orders";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  const boundAction = updateOrderStatusAction.bind(null, id);

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <Icon icon="mdi:arrow-left" className="text-base" />
        Kembali ke Daftar Pesanan
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Shipping info */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Info Pengiriman
          </h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-400 w-20 flex-shrink-0">Nama</dt>
              <dd className="text-gray-900 font-medium">{order.shipping_name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400 w-20 flex-shrink-0">HP</dt>
              <dd className="text-gray-900">{order.shipping_phone}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400 w-20 flex-shrink-0">Alamat</dt>
              <dd className="text-gray-900">{order.shipping_address}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400 w-20 flex-shrink-0">Kota</dt>
              <dd className="text-gray-900">{order.shipping_city}</dd>
            </div>
          </dl>
        </div>

        {/* Payment info */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Info Pembayaran
          </h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-400 w-20 flex-shrink-0">Tanggal</dt>
              <dd className="text-gray-900">
                {new Date(order.created_at).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400 w-20 flex-shrink-0">Total</dt>
              <dd className="text-gray-900 font-bold">{formatCurrency(order.total_amount)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Item Pesanan
        </h2>
        <div className="space-y-2">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-900">{item.book_title}</span>
              <div className="flex items-center gap-4 text-gray-500">
                <span>x{item.quantity}</span>
                <span className="font-semibold text-gray-900 w-24 text-right">
                  {formatCurrency(item.book_price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-3 border-t border-gray-100 mt-2">
          <span className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
        </div>
      </div>

      {/* Update status */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Update Status
        </h2>
        <UpdateOrderStatusForm
          currentStatus={order.status as OrderStatus}
          action={boundAction}
        />
        {["completed", "cancelled"].includes(order.status) && (
          <p className="text-sm text-gray-400">Order ini sudah final.</p>
        )}
      </div>
    </div>
  );
}
