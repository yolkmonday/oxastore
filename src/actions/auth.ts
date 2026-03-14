"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseClient } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { verifyPassword, hashPassword } from "@/lib/password";

export interface ActionResult {
  error?: string;
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Email atau password tidak valid." };
  }

  const { email, password } = parsed.data;
  const supabase = createSupabaseClient();

  const { data: admin } = await supabase
    .from("admins")
    .select("id, email, password")
    .eq("email", email)
    .single();

  if (!admin) {
    return { error: "Email atau password salah." };
  }

  const valid = await verifyPassword(password, admin.password);
  if (!valid) {
    return { error: "Email atau password salah." };
  }

  const session = await getSession();
  session.adminId = admin.id;
  session.email = admin.email;
  await session.save();

  redirect("/admin/books");
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter."),
});

export async function changePasswordAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session.adminId) {
    return { error: "Tidak terautentikasi." };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { currentPassword, newPassword } = parsed.data;
  const supabase = createSupabaseClient();

  const { data: admin } = await supabase
    .from("admins")
    .select("password")
    .eq("id", session.adminId)
    .single();

  if (!admin) {
    return { error: "Admin tidak ditemukan." };
  }

  const valid = await verifyPassword(currentPassword, admin.password);
  if (!valid) {
    return { error: "Password saat ini salah." };
  }

  const hashed = await hashPassword(newPassword);
  const { error: updateError } = await supabase
    .from("admins")
    .update({ password: hashed })
    .eq("id", session.adminId);

  if (updateError) {
    return { error: "Gagal menyimpan password baru." };
  }

  return {};
}
