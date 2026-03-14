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
  return session;
}

const bookSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi."),
  author: z.string().min(1, "Penulis wajib diisi."),
  price: z.coerce.number().positive("Harga harus lebih dari 0."),
  year: z.coerce.number().int().min(1000).max(9999),
  category: z.string().min(1, "Kategori wajib dipilih."),
  is_bestseller: z.coerce.boolean().optional().default(false),
  discount: z.coerce.number().int().min(0).max(100).optional().nullable(),
  description: z.string().optional(),
  pages: z.coerce.number().int().positive().optional().nullable(),
  language: z.string().optional(),
  width: z.coerce.number().positive().optional().nullable(),
  length: z.coerce.number().positive().optional().nullable(),
  weight: z.coerce.number().positive().optional().nullable(),
  publisher: z.string().optional(),
});

function parseSlugAndTags(formData: FormData) {
  const slug = (formData.get("slug") as string)?.trim() || null;
  const tagsRaw = (formData.get("tags") as string) || "";
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return { slug, tags };
}

export async function createBookAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = bookSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author"),
    price: formData.get("price"),
    year: formData.get("year"),
    category: formData.get("category"),
    is_bestseller: formData.get("is_bestseller") === "on",
    discount: formData.get("discount") || null,
    description: formData.get("description") || undefined,
    pages: formData.get("pages") || null,
    language: formData.get("language") || undefined,
    width: formData.get("width") || null,
    length: formData.get("length") || null,
    weight: formData.get("weight") || null,
    publisher: formData.get("publisher") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { slug, tags } = parseSlugAndTags(formData);
  const supabase = createSupabaseClient();

  let cover_image: string | null = null;
  const coverFile = formData.get("cover_image") as File | null;
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split(".").pop();
    const filename = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("book-covers")
      .upload(filename, coverFile);
    if (uploadError) {
      return { error: "Gagal upload gambar: " + uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("book-covers")
      .getPublicUrl(filename);
    cover_image = urlData.publicUrl;
  }

  const { error } = await supabase.from("books").insert({
    ...parsed.data,
    cover_image,
    slug,
    tags,
  });

  if (error) {
    return { error: "Gagal menyimpan buku: " + error.message };
  }

  redirect("/admin/books");
}

export async function updateBookAction(
  id: string,
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createSupabaseClient();

  const parsed = bookSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author"),
    price: formData.get("price"),
    year: formData.get("year"),
    category: formData.get("category"),
    is_bestseller: formData.get("is_bestseller") === "on",
    discount: formData.get("discount") || null,
    description: formData.get("description") || undefined,
    pages: formData.get("pages") || null,
    language: formData.get("language") || undefined,
    width: formData.get("width") || null,
    length: formData.get("length") || null,
    weight: formData.get("weight") || null,
    publisher: formData.get("publisher") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { slug, tags } = parseSlugAndTags(formData);

  // Fetch existing cover to delete if a new one is uploaded
  const { data: existingBook } = await supabase
    .from("books")
    .select("cover_image")
    .eq("id", id)
    .single();

  let cover_image: string | undefined = undefined;
  const coverFile = formData.get("cover_image") as File | null;
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split(".").pop();
    const filename = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("book-covers")
      .upload(filename, coverFile);
    if (uploadError) {
      return { error: "Gagal upload gambar: " + uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("book-covers")
      .getPublicUrl(filename);
    cover_image = urlData.publicUrl;

    // Delete old cover from Storage
    if (existingBook?.cover_image) {
      try {
        const oldUrl = new URL(existingBook.cover_image);
        const oldPathParts = oldUrl.pathname.split("/book-covers/");
        if (oldPathParts.length === 2) {
          await supabase.storage.from("book-covers").remove([oldPathParts[1]]);
        }
      } catch {
        // Non-fatal: old image cleanup failed silently
      }
    }
  }

  const updateData: Record<string, unknown> = {
    ...parsed.data,
    slug,
    tags,
    updated_at: new Date().toISOString(),
  };
  if (cover_image !== undefined) {
    updateData.cover_image = cover_image;
  }

  const { error } = await supabase
    .from("books")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: "Gagal memperbarui buku: " + error.message };
  }

  redirect("/admin/books");
}

export async function deleteBookAction(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createSupabaseClient();

  const { data: book } = await supabase
    .from("books")
    .select("cover_image")
    .eq("id", id)
    .single();

  if (book?.cover_image) {
    try {
      const url = new URL(book.cover_image);
      const pathParts = url.pathname.split("/book-covers/");
      if (pathParts.length === 2) {
        await supabase.storage.from("book-covers").remove([pathParts[1]]);
      }
    } catch {
      // Non-fatal: storage cleanup failed silently
    }
  }

  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) {
    throw new Error("Gagal menghapus buku: " + error.message);
  }

  redirect("/admin/books");
}
