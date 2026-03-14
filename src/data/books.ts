import { createSupabaseClient } from "@/lib/supabase";
import { Book } from "@/types";

function mapRow(row: Record<string, unknown>): Book {
  return {
    id: row.id as string,
    slug: (row.slug as string) ?? "",
    title: row.title as string,
    author: row.author as string,
    price: Number(row.price),
    year: row.year as number,
    coverImage: (row.cover_image as string | null) ?? null,
    category: row.category as string,
    tags: (row.tags as string[]) ?? [],
    isBestSeller: row.is_bestseller as boolean,
    discount: (row.discount as number | null) ?? undefined,
    description: row.description as string | undefined,
    pages: (row.pages as number | null) ?? undefined,
    language: row.language as string | undefined,
    width: (row.width as number | null) ?? undefined,
    length: (row.length as number | null) ?? undefined,
    weight: (row.weight as number | null) ?? undefined,
    publisher: row.publisher as string | undefined,
    marketplaceLinks: (row.marketplace_links as import("@/types").MarketplaceLink[] | null) ?? undefined,
  };
}

export async function getBooks(): Promise<Book[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapRow);
}

export async function getBooksByCategory(category: string): Promise<Book[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("books")
    .select("*")
    .eq("category", category);
  return (data ?? []).map(mapRow);
}

export async function getBestSellers(): Promise<Book[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("books")
    .select("*")
    .eq("is_bestseller", true);
  return (data ?? []).map(mapRow);
}

export async function getBookById(id: string): Promise<Book | undefined> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? mapRow(data) : undefined;
}

export async function getBookBySlug(slugOrId: string): Promise<Book | undefined> {
  const supabase = createSupabaseClient();
  const { data: bySlug } = await supabase
    .from("books")
    .select("*")
    .eq("slug", slugOrId)
    .maybeSingle();
  if (bySlug) return mapRow(bySlug);
  // Fallback to ID for old URLs or books without slug
  return getBookById(slugOrId);
}
