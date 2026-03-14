import "server-only";
import { createSupabaseClient } from "@/lib/supabase";
import { Post } from "@/types";

export async function getPublishedPosts(): Promise<Post[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return (data as Post[]) ?? [];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return (data as Post) ?? null;
}

export async function getAllPosts(): Promise<Post[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Post[]) ?? [];
}

export async function getPostById(id: string): Promise<Post | null> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Post) ?? null;
}
