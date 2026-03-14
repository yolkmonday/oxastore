"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseClient } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import type { ActionResult } from "@/actions/books";

async function requireAdmin() {
  const session = await getSession();
  if (!session.adminId) redirect("/admin/login");
}

function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    const parts = url.pathname.split("/blog-thumbnails/");
    return parts.length === 2 ? parts[1] : null;
  } catch {
    return null;
  }
}

const postSchema = z.object({
  slug: z.string().min(1, "Slug wajib diisi."),
  title: z.string().min(1, "Judul wajib diisi."),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

export async function createPostAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = postSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content") || undefined,
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createSupabaseClient();

  let thumbnailUrl: string | null = null;
  const thumbnailFile = formData.get("thumbnail") as File | null;
  if (thumbnailFile && thumbnailFile.size > 0) {
    const ext = thumbnailFile.name.split(".").pop();
    const filename = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("blog-thumbnails")
      .upload(filename, thumbnailFile);
    if (uploadError) {
      return { error: "Gagal upload thumbnail: " + uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("blog-thumbnails")
      .getPublicUrl(filename);
    thumbnailUrl = urlData.publicUrl;
  }

  const { error } = await supabase.from("posts").insert({
    slug: parsed.data.slug,
    title: parsed.data.title,
    excerpt: parsed.data.excerpt ?? null,
    content: parsed.data.content ?? null,
    thumbnail: thumbnailUrl,
    status: parsed.data.status,
    published_at: parsed.data.status === "published" ? new Date().toISOString() : null,
  });

  if (error) {
    return { error: "Gagal menyimpan post: " + error.message };
  }

  // Save tags
  const { data: newPost } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", parsed.data.slug)
    .single();

  if (newPost) {
    const tagIdsRaw = formData.get("tagIds") as string | null;
    const newTagNameVal = (formData.get("newTagName") as string | null)?.trim();
    const tagIds = tagIdsRaw ? tagIdsRaw.split(",").filter(Boolean) : [];

    if (newTagNameVal) {
      const newTagSlug = newTagNameVal
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const { data: createdTag } = await supabase
        .from("tags")
        .upsert({ name: newTagNameVal, slug: newTagSlug }, { onConflict: "slug" })
        .select("id")
        .single();
      if (createdTag) tagIds.push(createdTag.id);
    }

    const { upsertPostTags } = await import("@/data/tags");
    await upsertPostTags(newPost.id, tagIds);
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.data.slug}`);
  redirect("/admin/blog");
}

export async function updatePostAction(
  id: string,
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = postSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content") || undefined,
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createSupabaseClient();

  const { data: existingPost } = await supabase
    .from("posts")
    .select("published_at, thumbnail, slug")
    .eq("id", id)
    .single();

  const updateData: Record<string, unknown> = {
    slug: parsed.data.slug,
    title: parsed.data.title,
    excerpt: parsed.data.excerpt ?? null,
    content: parsed.data.content ?? null,
    status: parsed.data.status,
    updated_at: new Date().toISOString(),
  };

  // Set published_at when first transitioning to published (preserve original date on re-publish)
  if (parsed.data.status === "published" && !existingPost?.published_at) {
    updateData.published_at = new Date().toISOString();
  }

  const thumbnailFile = formData.get("thumbnail") as File | null;
  if (thumbnailFile && thumbnailFile.size > 0) {
    const ext = thumbnailFile.name.split(".").pop();
    const filename = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("blog-thumbnails")
      .upload(filename, thumbnailFile);
    if (uploadError) {
      return { error: "Gagal upload thumbnail: " + uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("blog-thumbnails")
      .getPublicUrl(filename);
    updateData.thumbnail = urlData.publicUrl;

    if (existingPost?.thumbnail) {
      const oldPath = extractStoragePath(existingPost.thumbnail);
      if (oldPath) {
        await supabase.storage.from("blog-thumbnails").remove([oldPath]);
      }
    }
  }

  const { error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: "Gagal memperbarui post: " + error.message };
  }

  // Save tags
  const tagIdsRaw = formData.get("tagIds") as string | null;
  const newTagNameVal = (formData.get("newTagName") as string | null)?.trim();
  const tagIds = tagIdsRaw ? tagIdsRaw.split(",").filter(Boolean) : [];

  if (newTagNameVal) {
    const newTagSlug = newTagNameVal
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const { data: createdTag } = await supabase
      .from("tags")
      .upsert({ name: newTagNameVal, slug: newTagSlug }, { onConflict: "slug" })
      .select("id")
      .single();
    if (createdTag) tagIds.push(createdTag.id);
  }

  const { upsertPostTags } = await import("@/data/tags");
  await upsertPostTags(id, tagIds);

  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.data.slug}`);
  // Also revalidate old slug path if it changed
  if (existingPost?.slug && existingPost.slug !== parsed.data.slug) {
    revalidatePath(`/blog/${existingPost.slug}`);
  }
  redirect("/admin/blog");
}

export async function deletePostAction(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createSupabaseClient();

  const { data: post } = await supabase
    .from("posts")
    .select("thumbnail")
    .eq("id", id)
    .single();

  if (post?.thumbnail) {
    const path = extractStoragePath(post.thumbnail);
    if (path) {
      await supabase.storage.from("blog-thumbnails").remove([path]);
    }
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error("Gagal menghapus post: " + error.message);

  revalidatePath("/blog");
  redirect("/admin/blog");
}
