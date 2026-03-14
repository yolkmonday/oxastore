"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CartItem } from "@/types";

export interface CheckoutResult {
  error?: string;
  orderId?: string;
  qrString?: string;
}

const checkoutSchema = z.object({
  shipping_name: z.string().min(1, "Nama penerima wajib diisi."),
  shipping_phone: z.string().min(1, "Nomor HP wajib diisi."),
  shipping_address: z.string().min(1, "Alamat wajib diisi."),
  shipping_city: z.string().min(1, "Kota wajib diisi."),
});

export async function checkoutAction(
  items: CartItem[],
  _prev: CheckoutResult | undefined,
  formData: FormData
): Promise<CheckoutResult> {
  if (!items || items.length === 0) {
    return { error: "Keranjang belanja kosong." };
  }

  const parsed = checkoutSchema.safeParse({
    shipping_name: formData.get("shipping_name"),
    shipping_phone: formData.get("shipping_phone"),
    shipping_address: formData.get("shipping_address"),
    shipping_city: formData.get("shipping_city"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  // Calculate total (price after discount)
  const totalAmount = items.reduce((sum, item) => {
    const price = item.book.discount
      ? item.book.price * (1 - item.book.discount / 100)
      : item.book.price;
    return sum + price * item.quantity;
  }, 0);

  // Create order in DB
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      total_amount: Math.round(totalAmount),
      ...parsed.data,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: "Gagal membuat order." };
  }

  // Create order_items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    book_id: item.book.id,
    book_title: item.book.title,
    book_price: item.book.discount
      ? item.book.price * (1 - item.book.discount / 100)
      : item.book.price,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    return { error: "Gagal menyimpan item order." };
  }

  // Charge via Midtrans Core API
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  const baseUrl = isProduction
    ? "https://api.midtrans.com/v2/charge"
    : "https://api.sandbox.midtrans.com/v2/charge";

  const midtransPayload = {
    payment_type: "qris",
    transaction_details: {
      order_id: order.id,
      gross_amount: Math.round(totalAmount),
    },
  };

  const midtransRes = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(serverKey + ":").toString("base64")}`,
    },
    body: JSON.stringify(midtransPayload),
  });

  if (!midtransRes.ok) {
    return { error: "Gagal menghubungi payment gateway." };
  }

  const midtransData = await midtransRes.json();
  const qrString: string =
    midtransData.qr_string ??
    midtransData.actions?.find(
      (a: { name: string; url: string }) => a.name === "generate-qr-code"
    )?.url ??
    "";

  // Save midtrans transaction id and qr_string
  await supabase
    .from("orders")
    .update({
      midtrans_order_id: midtransData.transaction_id ?? order.id,
      qr_string: qrString,
    })
    .eq("id", order.id);

  return { orderId: order.id, qrString };
}
