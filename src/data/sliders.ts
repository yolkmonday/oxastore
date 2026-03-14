import { createSupabaseClient } from "@/lib/supabase";
import { Slider } from "@/types";

function mapRow(row: Record<string, unknown>): Slider {
  return {
    id: row.id as string,
    title: (row.title as string | null) ?? null,
    subtitle: (row.subtitle as string | null) ?? null,
    image: row.image as string,
    link: (row.link as string | null) ?? null,
    sortOrder: row.sort_order as number,
    isActive: row.is_active as boolean,
  };
}

export async function getActiveSliders(): Promise<Slider[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("sliders")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []).map(mapRow);
}

export async function getAllSliders(): Promise<Slider[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("sliders")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data ?? []).map(mapRow);
}

export async function getSliderById(id: string): Promise<Slider | undefined> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("sliders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? mapRow(data) : undefined;
}
