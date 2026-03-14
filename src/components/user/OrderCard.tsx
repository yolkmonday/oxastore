import { Icon } from "@iconify/react";
import { Order, OrderStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  paid: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function OrderCard({ order }: { order: Order }) {
  const statusLabel = STATUS_LABELS[order.status] ?? order.status;
  const statusColor = STATUS_COLORS[order.status] ?? "";
  const date = new Date(order.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{date}</p>
          <p className="text-sm font-mono text-gray-600">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      {order.order_items && order.order_items.length > 0 && (
        <div className="space-y-1 mb-3 border-t border-gray-50 pt-3">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-700">
              <span className="truncate mr-2">
                {item.book_title}
                {item.quantity > 1 && (
                  <span className="text-gray-400"> x{item.quantity}</span>
                )}
              </span>
              <span className="flex-shrink-0 text-gray-500">
                {formatCurrency(item.book_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-50 pt-3">
        <span className="text-sm text-gray-500">
          <Icon icon="mdi:map-marker-outline" className="inline mr-1" />
          {order.shipping_city}
        </span>
        <span className="font-bold text-gray-900">
          {formatCurrency(order.total_amount)}
        </span>
      </div>
    </div>
  );
}
