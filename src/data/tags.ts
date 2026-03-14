import "server-only";
import { createSupabaseClient } from "@/lib/supabase";
import { Tag } from "@/types";

export async function getAllTags(): Promise<Tag[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name", { ascending: true });
  return (data as Tag[]) ?? [];
}

export async function getAllTagsAdmin(): Promise<Tag[]> {
  return getAllTags();
}

export async function upsertPostTags(
  postId: string,
  tagIds: string[]
): Promise<void> {
  const supabase = createSupabaseClient();
  await supabase.from("post_tags").delete().eq("post_id", postId);
  if (tagIds.length === 0) return;
  const rows = tagIds.map((tag_id) => ({ post_id: postId, tag_id }));
  const { error } = await supabase.from("post_tags").insert(rows);
  if (error) throw new Error("Gagal menyimpan tags: " + error.message);
}
