import type { MetadataRoute } from "next";
import { createSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const BASE_URL = "https://oxamatter.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseClient();

  const [{ data: books }, { data: posts }] = await Promise.all([
    supabase.from("books").select("slug, created_at"),
    supabase
      .from("posts")
      .select("slug, published_at, created_at")
      .eq("status", "published"),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/books`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/katalog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/tentang`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/kontak`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/faq`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const bookPages: MetadataRoute.Sitemap = (books ?? []).map((book) => ({
    url: `${BASE_URL}/books/${book.slug}`,
    lastModified: book.created_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.published_at ?? post.created_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...bookPages, ...blogPages];
}
