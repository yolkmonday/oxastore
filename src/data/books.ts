import { createSupabaseClient } from "@/lib/supabase";
import { Book, Category } from "@/types";

function mapRow(row: Record<string, unknown>): Book {
  return {
    id: row.id as string,
    title: row.title as string,
    author: row.author as string,
    price: Number(row.price),
    year: row.year as number,
    coverImage: (row.cover_image as string) ?? "",
    category: row.category as Category,
    isBestSeller: row.is_bestseller as boolean,
    discount: (row.discount as number | null) ?? undefined,
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

export async function getBooksByCategory(category: Category): Promise<Book[]> {
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
    .single();
  return data ? mapRow(data) : undefined;
}
