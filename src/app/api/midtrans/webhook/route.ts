import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;

  // Verify Midtrans signature: SHA512(order_id + status_code + gross_amount + server_key)
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const expectedSignature = createHash("sha512")
    .update(order_id + status_code + gross_amount + serverKey)
    .digest("hex");

  if (signature_key !== expectedSignature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
  }

  let newStatus: string | null = null;

  if (transaction_status === "settlement" || transaction_status === "capture") {
    newStatus = "paid";
  } else if (
    transaction_status === "cancel" ||
    transaction_status === "expire" ||
    transaction_status === "deny"
  ) {
    newStatus = "cancelled";
  }

  if (newStatus) {
    const supabase = createAdminClient();
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", order_id);
  }

  return NextResponse.json({ message: "OK" });
}
