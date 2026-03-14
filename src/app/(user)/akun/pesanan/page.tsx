import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Order } from "@/types";
import OrderCard from "@/components/user/OrderCard";

export const dynamic = "force-dynamic";

export default async function PesananPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pesanan Saya</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium mb-1">Belum ada pesanan</p>
          <p className="text-sm">Mulai belanja dan pesanan Anda akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(orders as Order[]).map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
