"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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
  const marketplaceLinksRaw = (formData.get("marketplace_links") as string) || "[]";
  let marketplace_links = [];
  try {
    marketplace_links = JSON.parse(marketplaceLinksRaw);
  } catch {
    marketplace_links = [];
  }
  return { slug, tags, marketplace_links };
}

async function uploadBookImage(
  supabase: ReturnType<typeof createSupabaseClient>,
  file: File | null
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = file.name.split(".").pop();
  const filename = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("book-covers")
    .upload(filename, file);
  if (error) throw new Error("Gagal upload gambar: " + error.message);
  const { data: urlData } = supabase.storage
    .from("book-covers")
    .getPublicUrl(filename);
  return urlData.publicUrl;
}

function extractStoragePath(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const parts = url.pathname.split("/book-covers/");
    return parts.length === 2 ? parts[1] : null;
  } catch {
    return null;
  }
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

  const { slug, tags, marketplace_links } = parseSlugAndTags(formData);
  const supabase = createSupabaseClient();

  let cover_image: string | null = null;
  let back_image: string | null = null;
  let spine_image: string | null = null;

  try {
    cover_image = await uploadBookImage(supabase, formData.get("cover_image") as File | null);
    back_image = await uploadBookImage(supabase, formData.get("back_image") as File | null);
    spine_image = await uploadBookImage(supabase, formData.get("spine_image") as File | null);
  } catch (err) {
    return { error: (err as Error).message };
  }

  const { error } = await supabase.from("books").insert({
    ...parsed.data,
    cover_image,
    back_image,
    spine_image,
    slug,
    tags,
    marketplace_links,
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

  const { slug, tags, marketplace_links } = parseSlugAndTags(formData);

  // Fetch existing images to delete if new ones are uploaded
  const { data: existingBook } = await supabase
    .from("books")
    .select("cover_image, back_image, spine_image")
    .eq("id", id)
    .single();

  let cover_image: string | undefined = undefined;
  let back_image: string | undefined = undefined;
  let spine_image: string | undefined = undefined;

  try {
    const newCover = await uploadBookImage(supabase, formData.get("cover_image") as File | null);
    if (newCover) {
      cover_image = newCover;
      if (existingBook?.cover_image) {
        const oldPath = extractStoragePath(existingBook.cover_image);
        if (oldPath) await supabase.storage.from("book-covers").remove([oldPath]);
      }
    }

    const newBack = await uploadBookImage(supabase, formData.get("back_image") as File | null);
    if (newBack) {
      back_image = newBack;
      if (existingBook?.back_image) {
        const oldPath = extractStoragePath(existingBook.back_image as string);
        if (oldPath) await supabase.storage.from("book-covers").remove([oldPath]);
      }
    }

    const newSpine = await uploadBookImage(supabase, formData.get("spine_image") as File | null);
    if (newSpine) {
      spine_image = newSpine;
      if (existingBook?.spine_image) {
        const oldPath = extractStoragePath(existingBook.spine_image as string);
        if (oldPath) await supabase.storage.from("book-covers").remove([oldPath]);
      }
    }
  } catch (err) {
    return { error: (err as Error).message };
  }

  const updateData: Record<string, unknown> = {
    ...parsed.data,
    slug,
    tags,
    marketplace_links,
    updated_at: new Date().toISOString(),
  };
  if (cover_image !== undefined) updateData.cover_image = cover_image;
  if (back_image !== undefined) updateData.back_image = back_image;
  if (spine_image !== undefined) updateData.spine_image = spine_image;

  const { error } = await supabase
    .from("books")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: "Gagal memperbarui buku: " + error.message };
  }

  redirect("/admin/books");
}

export async function bulkDeleteBooksAction(ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  if (!ids.length) return {};
  const supabase = createSupabaseClient();

  const { data: books } = await supabase
    .from("books")
    .select("cover_image, back_image, spine_image")
    .in("id", ids);

  if (books) {
    const filenames = books
      .flatMap((b) => {
        const urls = [b.cover_image, b.back_image, b.spine_image].filter(Boolean) as string[];
        return urls.map(extractStoragePath).filter(Boolean) as string[];
      });
    if (filenames.length) {
      await supabase.storage.from("book-covers").remove(filenames);
    }
  }

  const { error } = await supabase.from("books").delete().in("id", ids);
  if (error) return { error: "Gagal menghapus buku: " + error.message };

  revalidatePath("/admin/books");
  return {};
}

export async function deleteBookAction(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createSupabaseClient();

  const { data: book } = await supabase
    .from("books")
    .select("cover_image, back_image, spine_image")
    .eq("id", id)
    .single();

  if (book) {
    const urls = [book.cover_image, book.back_image, book.spine_image].filter(Boolean) as string[];
    const paths = urls.map(extractStoragePath).filter(Boolean) as string[];
    if (paths.length) {
      await supabase.storage.from("book-covers").remove(paths);
    }
  }

  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) {
    throw new Error("Gagal menghapus buku: " + error.message);
  }

  redirect("/admin/books");
}
