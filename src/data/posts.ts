import "server-only";
import { createSupabaseClient } from "@/lib/supabase";
import { Post, Tag } from "@/types";

const PAGE_SIZE = 9;

function normalizeTags(raw: Record<string, unknown>): Tag[] {
  const postTags = raw.post_tags as { tags: Tag }[] | undefined;
  return postTags?.map((pt) => pt.tags).filter(Boolean) ?? [];
}

export async function getPublishedPosts(params?: {
  page?: number;
  q?: string;
  tag?: string;
}): Promise<{ posts: Post[]; totalPages: number }> {
  const supabase = createSupabaseClient();
  const page = Math.max(1, params?.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("posts")
    .select("*, post_tags(tags(id,name,slug))", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (params?.q) {
    query = query.or(
      `title.ilike.%${params.q}%,excerpt.ilike.%${params.q}%`
    );
  }

  if (params?.tag) {
    query = query.eq("post_tags.tags.slug", params.tag);
  }

  query = query.range(from, to);

  const { data, count } = await query;

  const posts: Post[] = (data ?? []).map((raw) => ({
    ...(raw as Post),
    tags: normalizeTags(raw as Record<string, unknown>),
  }));

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  return { posts, totalPages };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("posts")
    .select("*, post_tags(tags(id,name,slug))")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (!data) return null;
  return {
    ...(data as Post),
    tags: normalizeTags(data as Record<string, unknown>),
  };
}

export async function getRelatedPosts(
  excludeId: string,
  limit = 3
): Promise<Post[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("posts")
    .select("id, slug, title, thumbnail, published_at, created_at")
    .eq("status", "published")
    .neq("id", excludeId)
    .limit(10);

  const all = (data as Post[]) ?? [];
  return all.sort(() => Math.random() - 0.5).slice(0, limit);
}

export async function getAllPosts(): Promise<Post[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("posts")
    .select("*, post_tags(tags(id,name,slug))")
    .order("created_at", { ascending: false });
  return (data ?? []).map((raw) => ({
    ...(raw as Post),
    tags: normalizeTags(raw as Record<string, unknown>),
  }));
}

export async function getPostById(id: string): Promise<Post | null> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("posts")
    .select("*, post_tags(tags(id,name,slug))")
    .eq("id", id)
    .single();
  if (!data) return null;
  return {
    ...(data as Post),
    tags: normalizeTags(data as Record<string, unknown>),
  };
}
