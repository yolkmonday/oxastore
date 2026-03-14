import "server-only";
import { createSupabaseClient } from "@/lib/supabase";
import { Order, OrderStatus } from "@/types";

export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  const supabase = createSupabaseClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data } = await query;
  return (data as Order[]) ?? [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  return (data as Order) ?? null;
}
