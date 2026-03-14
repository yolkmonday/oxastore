"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseClient } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import type { ActionResult } from "@/actions/books";

async function requireAdmin() {
  const session = await getSession();
  if (!session.adminId) redirect("/admin/login");
  return session;
}

const sliderSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  link: z.string().optional(),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.coerce.boolean().default(true),
});

function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    const parts = url.pathname.split("/slider-images/");
    return parts.length === 2 ? parts[1] : null;
  } catch {
    return null;
  }
}

export async function createSliderAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = sliderSchema.safeParse({
    title: formData.get("title") || undefined,
    subtitle: formData.get("subtitle") || undefined,
    link: formData.get("link") || undefined,
    sort_order: formData.get("sort_order"),
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createSupabaseClient();

  const imageFile = formData.get("image") as File | null;
  if (!imageFile || imageFile.size === 0) {
    return { error: "Gambar slider wajib diupload." };
  }

  const ext = imageFile.name.split(".").pop();
  const filename = `${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("slider-images")
    .upload(filename, imageFile);
  if (uploadError) {
    return { error: "Gagal upload gambar: " + uploadError.message };
  }
  const { data: urlData } = supabase.storage
    .from("slider-images")
    .getPublicUrl(filename);

  const { error } = await supabase.from("sliders").insert({
    ...parsed.data,
    title: parsed.data.title || null,
    subtitle: parsed.data.subtitle || null,
    link: parsed.data.link || null,
    image: urlData.publicUrl,
  });

  if (error) {
    return { error: "Gagal menyimpan slider: " + error.message };
  }

  redirect("/admin/sliders");
}

export async function updateSliderAction(
  id: string,
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = sliderSchema.safeParse({
    title: formData.get("title") || undefined,
    subtitle: formData.get("subtitle") || undefined,
    link: formData.get("link") || undefined,
    sort_order: formData.get("sort_order"),
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createSupabaseClient();

  const updateData: Record<string, unknown> = {
    ...parsed.data,
    title: parsed.data.title || null,
    subtitle: parsed.data.subtitle || null,
    link: parsed.data.link || null,
  };

  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    // Upload new image
    const ext = imageFile.name.split(".").pop();
    const filename = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("slider-images")
      .upload(filename, imageFile);
    if (uploadError) {
      return { error: "Gagal upload gambar: " + uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("slider-images")
      .getPublicUrl(filename);
    updateData.image = urlData.publicUrl;

    // Delete old image
    const { data: existing } = await supabase
      .from("sliders")
      .select("image")
      .eq("id", id)
      .single();
    if (existing?.image) {
      const oldPath = extractStoragePath(existing.image);
      if (oldPath) {
        await supabase.storage.from("slider-images").remove([oldPath]);
      }
    }
  }

  const { error } = await supabase
    .from("sliders")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: "Gagal memperbarui slider: " + error.message };
  }

  redirect("/admin/sliders");
}

export async function deleteSliderAction(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createSupabaseClient();

  const { data: slider } = await supabase
    .from("sliders")
    .select("image")
    .eq("id", id)
    .single();

  if (slider?.image) {
    const path = extractStoragePath(slider.image);
    if (path) {
      await supabase.storage.from("slider-images").remove([path]);
    }
  }

  const { error } = await supabase.from("sliders").delete().eq("id", id);
  if (error) {
    throw new Error("Gagal menghapus slider: " + error.message);
  }

  redirect("/admin/sliders");
}
