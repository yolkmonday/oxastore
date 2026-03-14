import { OrderStatus } from "@/types";

const LABELS: Record<OrderStatus, string> = {
  pending: "Menunggu",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${COLORS[status]}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
