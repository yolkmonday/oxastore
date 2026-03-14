"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { OrderStatus } from "@/types";
import { getSession } from "@/lib/session";

const VALID_STATUSES: OrderStatus[] = [
  "pending", "paid", "processing", "shipped", "completed", "cancelled",
];

export async function updateOrderStatusAction(
  orderId: string,
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session.adminId) redirect("/admin/login");

  const newStatus = formData.get("status") as OrderStatus;
  if (!VALID_STATUSES.includes(newStatus)) {
    return { error: "Status tidak valid." };
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) return { error: "Gagal mengubah status." };

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}
