"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface PasswordResult {
  error?: string;
  success?: boolean;
}

const schema = z
  .object({
    password: z.string().min(8, "Password minimal 8 karakter."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirm"],
  });

export async function changeUserPasswordAction(
  _prev: PasswordResult | undefined,
  formData: FormData
): Promise<PasswordResult> {
  const parsed = schema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { error: "Gagal mengubah password." };

  return { success: true };
}
