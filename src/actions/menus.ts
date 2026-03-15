"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import type { MenuLocation } from "@/types";

async function requireAdmin() {
  const session = await getSession();
  if (!session.adminId) redirect("/admin/login");
}

// ── Group actions ──

export async function createGroupAction(formData: FormData) {
  await requireAdmin();
  const location = formData.get("location") as MenuLocation;
  const title = (formData.get("title") as string) || null;

  const supabase = createSupabaseClient();

  const { data: last } = await supabase
    .from("menu_groups")
    .select("sort_order")
    .eq("location", location)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = last ? (last.sort_order as number) + 1 : 0;

  const { error } = await supabase
    .from("menu_groups")
    .insert({ location, title, sort_order: sortOrder });

  if (error) throw new Error("Gagal membuat grup: " + error.message);
  revalidatePath("/admin/menus");
  revalidatePath("/");
}

export async function updateGroupAction(id: string, formData: FormData) {
  await requireAdmin();
  const title = (formData.get("title") as string) || null;
  const sortOrder = parseInt(formData.get("sort_order") as string, 10);

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("menu_groups")
    .update({ title, sort_order: isNaN(sortOrder) ? 0 : sortOrder })
    .eq("id", id);

  if (error) throw new Error("Gagal memperbarui grup: " + error.message);
  revalidatePath("/admin/menus");
  revalidatePath("/");
}

export async function deleteGroupAction(id: string) {
  await requireAdmin();
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("menu_groups").delete().eq("id", id);
  if (error) throw new Error("Gagal menghapus grup: " + error.message);
  revalidatePath("/admin/menus");
  revalidatePath("/");
}

// ── Item actions ──

export async function createItemAction(formData: FormData) {
  await requireAdmin();
  const group_id = formData.get("group_id") as string;
  const label = formData.get("label") as string;
  const url = formData.get("url") as string;
  const icon = (formData.get("icon") as string) || null;
  const open_new_tab = formData.get("open_new_tab") === "true";

  if (!label || !url) throw new Error("Label dan URL wajib diisi.");

  const supabase = createSupabaseClient();

  const { data: last } = await supabase
    .from("menu_items")
    .select("sort_order")
    .eq("group_id", group_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = last ? (last.sort_order as number) + 1 : 0;

  const { error } = await supabase
    .from("menu_items")
    .insert({ group_id, label, url, icon, open_new_tab, sort_order: sortOrder });

  if (error) throw new Error("Gagal membuat item: " + error.message);
  revalidatePath("/admin/menus");
  revalidatePath("/");
}

export async function updateItemAction(id: string, formData: FormData) {
  await requireAdmin();
  const label = formData.get("label") as string;
  const url = formData.get("url") as string;
  const icon = (formData.get("icon") as string) || null;
  const open_new_tab = formData.get("open_new_tab") === "true";
  const sortOrder = parseInt(formData.get("sort_order") as string, 10);

  if (!label || !url) throw new Error("Label dan URL wajib diisi.");

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("menu_items")
    .update({
      label,
      url,
      icon,
      open_new_tab,
      sort_order: isNaN(sortOrder) ? 0 : sortOrder,
    })
    .eq("id", id);

  if (error) throw new Error("Gagal memperbarui item: " + error.message);
  revalidatePath("/admin/menus");
  revalidatePath("/");
}

export async function deleteItemAction(id: string) {
  await requireAdmin();
  const supabase = createSupabaseClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) throw new Error("Gagal menghapus item: " + error.message);
  revalidatePath("/admin/menus");
  revalidatePath("/");
}
