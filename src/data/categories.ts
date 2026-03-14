import { createSupabaseClient } from "@/lib/supabase";
import { Category } from "@/types";

function mapRow(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
  };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });
  return (data ?? []).map(mapRow);
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? mapRow(data) : undefined;
}
