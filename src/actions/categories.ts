"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseClient } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export interface ActionResult {
  error?: string;
}

async function requireAdmin() {
  const session = await getSession();
  if (!session.adminId) redirect("/admin/login");
}

const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi."),
  slug: z
    .string()
    .min(1, "Slug wajib diisi.")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
});

export async function createCategoryAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase.from("categories").insert(parsed.data);
  if (error) {
    return { error: "Gagal menyimpan kategori: " + error.message };
  }

  redirect("/admin/categories");
}

export async function updateCategoryAction(
  id: string,
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("categories")
    .update(parsed.data)
    .eq("id", id);
  if (error) {
    return { error: "Gagal memperbarui kategori: " + error.message };
  }

  redirect("/admin/categories");
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    throw new Error("Gagal menghapus kategori: " + error.message);
  }
  redirect("/admin/categories");
}
