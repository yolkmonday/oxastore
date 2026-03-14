"use client";

import { useActionState } from "react";
import { OrderStatus } from "@/types";
import Button from "@/components/ui/Button";

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["completed", "cancelled"],
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

interface Props {
  currentStatus: OrderStatus;
  action: (prev: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;
}

export default function UpdateOrderStatusForm({ currentStatus, action }: Props) {
  const [state, formAction] = useActionState(action, undefined);
  const nextStatuses = NEXT_STATUSES[currentStatus] ?? [];

  if (nextStatuses.length === 0) return null;

  return (
    <div>
      {state?.error && (
        <p className="text-sm text-red-600 mb-3">{state.error}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <form key={status} action={formAction}>
            <input type="hidden" name="status" value={status} />
            <Button
              type="submit"
              variant={status === "cancelled" ? "ghost" : "dark"}
              size="sm"
            >
              Tandai: {STATUS_LABELS[status]}
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}
