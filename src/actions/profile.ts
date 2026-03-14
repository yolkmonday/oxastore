"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ProfileResult {
  error?: string;
  success?: boolean;
}

const profileSchema = z.object({
  full_name: z.string().min(1, "Nama wajib diisi."),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

export async function updateProfileAction(
  _prev: ProfileResult | undefined,
  formData: FormData
): Promise<ProfileResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi." };

  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...parsed.data });

  if (error) return { error: "Gagal menyimpan profil." };

  revalidatePath("/akun/profil");
  return { success: true };
}
