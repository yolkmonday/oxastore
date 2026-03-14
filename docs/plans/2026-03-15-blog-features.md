# Blog Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add tags, pagination, search/filter, breadcrumb, reading time, author, share button, and related posts to the public blog.

**Architecture:** All features implemented in one pass. Schema changes via Supabase migration (manual), data layer updates in `src/data/`, new reusable components in `src/components/blog/` and `src/components/ui/`, pages updated last.

**Tech Stack:** Next.js 15 App Router, Supabase JS client, TypeScript, Tailwind CSS, bun

---

## Task 1: DB Migration

**Files:**
- Create: `docs/migrations/003_blog_tags.sql`

**Step 1: Create the migration file**

```sql
-- docs/migrations/003_blog_tags.sql
CREATE TABLE IF NOT EXISTS tags (
  id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name  text NOT NULL,
  slug  text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  uuid NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE tags     ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read tags"      ON tags      FOR SELECT USING (true);
CREATE POLICY "public read post_tags" ON post_tags FOR SELECT USING (true);
```

**Step 2: Run in Supabase**

Open Supabase dashboard → SQL Editor → paste the file contents → Run.
Verify both `tags` and `post_tags` tables appear in Table Editor.

**Step 3: Commit**

```bash
git add docs/migrations/003_blog_tags.sql
git commit -m "feat: add tags and post_tags migration"
```

---

## Task 2: Types

**Files:**
- Modify: `src/types/index.ts`

**Step 1: Add `Tag` interface and `tags` field to `Post`**

Add after the existing `PostStatus` type and before `Post` interface:

```ts
export interface Tag {
  id: string;
  name: string;
  slug: string;
}
```

Add `tags?: Tag[];` as the last field in the `Post` interface:

```ts
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  thumbnail: string | null;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}
```

**Step 2: Verify build compiles**

```bash
bun run build 2>&1 | head -30
```

Expected: no TypeScript errors.

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add Tag type and tags field to Post"
```

---

## Task 3: Tags Data Layer

**Files:**
- Create: `src/data/tags.ts`

**Step 1: Create the file**

```ts
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

// Same query, alias kept separate to clarify call sites
export async function getAllTagsAdmin(): Promise<Tag[]> {
  return getAllTags();
}

export async function upsertPostTags(
  postId: string,
  tagIds: string[]
): Promise<void> {
  const supabase = createSupabaseClient();
  // Delete all existing associations
  await supabase.from("post_tags").delete().eq("post_id", postId);
  if (tagIds.length === 0) return;
  // Insert new associations
  const rows = tagIds.map((tag_id) => ({ post_id: postId, tag_id }));
  const { error } = await supabase.from("post_tags").insert(rows);
  if (error) throw new Error("Gagal menyimpan tags: " + error.message);
}
```

**Step 2: Commit**

```bash
git add src/data/tags.ts
git commit -m "feat: add tags data layer (getAllTags, upsertPostTags)"
```

---

## Task 4: Update Posts Data Layer

**Files:**
- Modify: `src/data/posts.ts`

**Step 1: Replace the entire file**

The key changes:
- `getPublishedPosts` now accepts `{ page, q, tag }` and returns `{ posts, totalPages }`
- `getPostBySlug` includes tags via join
- New `getRelatedPosts(excludeId)`

Note on Supabase join syntax: `post_tags(tags(id,name,slug))` returns nested objects. We flatten them after fetch.

```ts
import "server-only";
import { createSupabaseClient } from "@/lib/supabase";
import { Post, Tag } from "@/types";

const PAGE_SIZE = 9;

// Flatten Supabase nested join into Post.tags
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
    // Filter via post_tags join: only posts that have a tag with this slug
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
  // Shuffle and take `limit`
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
```

**Step 2: Verify build**

```bash
bun run build 2>&1 | head -40
```

Expected: TypeScript compiles cleanly. Any type error in callers of `getPublishedPosts` will surface here — fix call sites that expected `Post[]` directly (the blog list page will be updated in Task 13).

**Step 3: Commit**

```bash
git add src/data/posts.ts
git commit -m "feat: update posts data layer with pagination, search, tag filter, and related posts"
```

---

## Task 5: Reading Time Utility

**Files:**
- Create: `src/lib/readingTime.ts`

**Step 1: Create the file**

```ts
/**
 * Estimates reading time from an HTML string.
 * Strips tags, counts words, assumes 200 words/minute.
 */
export function readingTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} menit baca`;
}
```

**Step 2: Commit**

```bash
git add src/lib/readingTime.ts
git commit -m "feat: add readingTime utility"
```

---

## Task 6: Breadcrumb Component

**Files:**
- Create: `src/components/blog/Breadcrumb.tsx`

**Step 1: Create the file**

```tsx
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: Props) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span>/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-600 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/blog/Breadcrumb.tsx
git commit -m "feat: add reusable Breadcrumb component"
```

---

## Task 7: TagPills Component

**Files:**
- Create: `src/components/blog/TagPills.tsx`

**Step 1: Create the file**

```tsx
import Link from "next/link";
import { Tag } from "@/types";

interface Props {
  tags: Tag[];
}

export default function TagPills({ tags }: Props) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/blog?tag=${tag.slug}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/blog/TagPills.tsx
git commit -m "feat: add TagPills component"
```

---

## Task 8: ShareButton Component

**Files:**
- Create: `src/components/blog/ShareButton.tsx`

**Step 1: Create the file**

```tsx
"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

interface Props {
  title: string;
}

export default function ShareButton({ title }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled — do nothing
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-4 py-2 transition-colors"
    >
      <Icon icon={copied ? "mdi:check" : "mdi:share-variant"} className="text-base" />
      {copied ? "Link disalin!" : "Bagikan"}
    </button>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/blog/ShareButton.tsx
git commit -m "feat: add ShareButton component (Web Share API + clipboard fallback)"
```

---

## Task 9: RelatedPosts Component

**Files:**
- Create: `src/components/blog/RelatedPosts.tsx`

**Step 1: Create the file**

```tsx
import Link from "next/link";
import Image from "next/image";
import { Post } from "@/types";

interface Props {
  posts: Post[];
}

export default function RelatedPosts({ posts }: Props) {
  if (posts.length === 0) return null;
  return (
    <section className="mt-12 pt-8 border-t border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Artikel Lainnya</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            {post.thumbnail ? (
              <div className="relative h-36 w-full">
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-36 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-300 text-3xl">📝</span>
              </div>
            )}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(post.published_at ?? post.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/blog/RelatedPosts.tsx
git commit -m "feat: add RelatedPosts component"
```

---

## Task 10: Pagination Component

**Files:**
- Create: `src/components/ui/Pagination.tsx`

**Step 1: Create the file**

```tsx
import Link from "next/link";

interface Props {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export default function Pagination({ currentPage, totalPages, buildHref }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-2 mt-10">
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          &larr; Sebelumnya
        </Link>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(page)}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            page === currentPage
              ? "bg-gray-900 text-white border-gray-900"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Berikutnya &rarr;
        </Link>
      )}
    </nav>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ui/Pagination.tsx
git commit -m "feat: add reusable Pagination component"
```

---

## Task 11: BlogSearchFilter Component

**Files:**
- Create: `src/components/blog/BlogSearchFilter.tsx`

**Step 1: Create the file**

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Tag } from "@/types";
import { Icon } from "@iconify/react";

interface Props {
  tags: Tag[];
  currentQ: string;
  currentTag: string;
}

export default function BlogSearchFilter({ tags, currentQ, currentTag }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  function navigate(q: string, tag: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    router.push(`/blog?${params.toString()}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(inputRef.current?.value ?? "", currentTag);
  }

  function handleTagClick(tagSlug: string) {
    const q = searchParams.get("q") ?? "";
    navigate(q, tagSlug === currentTag ? "" : tagSlug);
  }

  return (
    <div className="mb-8 flex flex-col gap-4">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Icon
            icon="mdi:magnify"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
          />
          <input
            ref={inputRef}
            type="text"
            defaultValue={currentQ}
            placeholder="Cari artikel..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors"
        >
          Cari
        </button>
      </form>

      {/* Tag pills */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTagClick("")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !currentTag
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Semua
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.slug)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                currentTag === tag.slug
                  ? "bg-brand-500 text-white"
                  : "bg-brand-50 text-brand-600 hover:bg-brand-100"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/blog/BlogSearchFilter.tsx
git commit -m "feat: add BlogSearchFilter component (search + tag pills)"
```

---

## Task 12: Update Blog List Page

**Files:**
- Modify: `src/app/(public)/blog/page.tsx`

**Step 1: Replace the file**

`getPublishedPosts` now returns `{ posts, totalPages }`. Pass URL params for search/filter/pagination. `buildHref` preserves `q` and `tag` when changing pages.

```tsx
import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts } from "@/data/posts";
import { getAllTags } from "@/data/tags";
import BlogSearchFilter from "@/components/blog/BlogSearchFilter";
import Pagination from "@/components/ui/Pagination";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; tag?: string; page?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const { q = "", tag = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);

  const [{ posts, totalPages }, tags] = await Promise.all([
    getPublishedPosts({ page, q, tag }),
    getAllTags(),
  ]);

  function buildHref(p: number): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    params.set("page", String(p));
    return `/blog?${params.toString()}`;
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog</h1>
      <p className="text-gray-500 mb-8">Artikel, tips, dan cerita dari kami.</p>

      <BlogSearchFilter tags={tags} currentQ={q} currentTag={tag} />

      {posts.length === 0 ? (
        <p className="text-gray-400 text-center py-20">Belum ada artikel.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {post.thumbnail ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.thumbnail}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-300 text-4xl">📝</span>
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                      {post.excerpt}
                    </p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.map((t) => (
                        <span
                          key={t.id}
                          className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-600"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-auto">
                    {new Date(post.published_at ?? post.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            buildHref={buildHref}
          />
        </>
      )}
    </main>
  );
}
```

**Step 2: Verify build**

```bash
bun run build 2>&1 | head -40
```

Expected: clean compile.

**Step 3: Commit**

```bash
git add src/app/(public)/blog/page.tsx
git commit -m "feat: update blog list with search, tag filter, and pagination"
```

---

## Task 13: Update Blog Detail Page

**Files:**
- Modify: `src/app/(public)/blog/[slug]/page.tsx`

**Step 1: Replace the file**

```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { getPostBySlug, getRelatedPosts } from "@/data/posts";
import PostContentWrapper from "@/components/blog/PostContentWrapper";
import Breadcrumb from "@/components/blog/Breadcrumb";
import TagPills from "@/components/blog/TagPills";
import ShareButton from "@/components/blog/ShareButton";
import RelatedPosts from "@/components/blog/RelatedPosts";
import { readingTime } from "@/lib/readingTime";
import { Icon } from "@iconify/react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post.id);
  const timeToRead = post.content ? readingTime(post.content) : null;

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />

      {post.thumbnail && (
        <div className="relative h-64 w-full rounded-xl overflow-hidden mb-8">
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

      {/* Meta row: author, date, reading time */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
        <span className="flex items-center gap-1.5">
          <Icon icon="mdi:account-circle" className="text-base" />
          AdminOXA
        </span>
        <span className="flex items-center gap-1.5">
          <Icon icon="mdi:calendar-outline" className="text-base" />
          {new Date(post.published_at ?? post.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        {timeToRead && (
          <span className="flex items-center gap-1.5">
            <Icon icon="mdi:clock-outline" className="text-base" />
            {timeToRead}
          </span>
        )}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mb-8">
          <TagPills tags={post.tags} />
        </div>
      )}

      {/* Content */}
      {post.content ? (
        <PostContentWrapper html={post.content} />
      ) : (
        <p className="text-gray-400">Konten belum tersedia.</p>
      )}

      {/* Share */}
      <div className="mt-10 pt-6 border-t border-gray-100">
        <ShareButton title={post.title} />
      </div>

      {/* Related posts */}
      <RelatedPosts posts={relatedPosts} />
    </main>
  );
}
```

**Step 2: Verify build**

```bash
bun run build 2>&1 | head -40
```

**Step 3: Commit**

```bash
git add src/app/(public)/blog/\[slug\]/page.tsx
git commit -m "feat: update blog detail with breadcrumb, reading time, author, tags, share, related posts"
```

---

## Task 14: Update Admin PostForm (Tag Multi-Select)

**Files:**
- Modify: `src/components/admin/PostForm.tsx`

**Step 1: Add tag state and UI**

Add to the top of the component (after existing state declarations):

```ts
const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
  defaultValues.tags?.map((t) => t.id) ?? []
);
const [newTagName, setNewTagName] = useState("");
```

Add `tags` prop to `PostFormProps`:

```ts
interface PostFormProps {
  action: (_prevState: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
  defaultValues?: Partial<Post>;
  submitLabel?: string;
  allTags?: Tag[];
}
```

Import `Tag` at the top:

```ts
import type { Tag } from "@/types";
```

Add hidden input for selected tag IDs (before the submit button area):

```tsx
{/* Hidden input for tag IDs */}
<input type="hidden" name="tagIds" value={selectedTagIds.join(",")} />
```

Add the tag section (between Status and the error/submit area):

```tsx
{/* Tags */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>

  {/* Existing tags */}
  {(allTags ?? []).length > 0 && (
    <div className="flex flex-wrap gap-2 mb-3">
      {(allTags ?? []).map((tag) => {
        const active = selectedTagIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() =>
              setSelectedTagIds((prev) =>
                active ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
              )
            }
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              active
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  )}

  {/* New tag inline creation */}
  <div className="flex gap-2">
    <input
      type="text"
      value={newTagName}
      onChange={(e) => setNewTagName(e.target.value)}
      placeholder="Buat tag baru..."
      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
    />
    <input
      type="hidden"
      name="newTagName"
      value={newTagName}
    />
  </div>
  <p className="text-xs text-gray-400 mt-1">
    Tulis nama tag baru dan klik Simpan — tag akan dibuat otomatis.
  </p>
</div>
```

**Step 2: Commit**

```bash
git add src/components/admin/PostForm.tsx
git commit -m "feat: add tag multi-select to PostForm"
```

---

## Task 15: Update Server Actions (Save Tags)

**Files:**
- Modify: `src/actions/posts.ts`

**Step 1: Add tag saving to `createPostAction`**

After the successful `supabase.from("posts").insert(...)`, before `revalidatePath`, add:

```ts
// Save tags
const { data: newPost } = await supabase
  .from("posts")
  .select("id")
  .eq("slug", parsed.data.slug)
  .single();

if (newPost) {
  const tagIdsRaw = formData.get("tagIds") as string | null;
  const newTagName = (formData.get("newTagName") as string | null)?.trim();
  const tagIds = tagIdsRaw ? tagIdsRaw.split(",").filter(Boolean) : [];

  // Create new tag if provided
  if (newTagName) {
    const slugify = (str: string) =>
      str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const newTagSlug = slugify(newTagName);
    const { data: createdTag } = await supabase
      .from("tags")
      .upsert({ name: newTagName, slug: newTagSlug }, { onConflict: "slug" })
      .select("id")
      .single();
    if (createdTag) tagIds.push(createdTag.id);
  }

  if (tagIds.length > 0) {
    const { upsertPostTags } = await import("@/data/tags");
    await upsertPostTags(newPost.id, tagIds);
  }
}
```

**Step 2: Add tag saving to `updatePostAction`**

After the successful `supabase.from("posts").update(...)`, before `revalidatePath`, add:

```ts
// Save tags
const tagIdsRaw = formData.get("tagIds") as string | null;
const newTagName = (formData.get("newTagName") as string | null)?.trim();
const tagIds = tagIdsRaw ? tagIdsRaw.split(",").filter(Boolean) : [];

if (newTagName) {
  const slugify = (str: string) =>
    str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const newTagSlug = slugify(newTagName);
  const { data: createdTag } = await supabase
    .from("tags")
    .upsert({ name: newTagName, slug: newTagSlug }, { onConflict: "slug" })
    .select("id")
    .single();
  if (createdTag) tagIds.push(createdTag.id);
}

const { upsertPostTags } = await import("@/data/tags");
await upsertPostTags(id, tagIds);
```

**Step 3: Verify build**

```bash
bun run build 2>&1 | head -40
```

Expected: clean compile, no errors.

**Step 4: Commit**

```bash
git add src/actions/posts.ts
git commit -m "feat: save tags in create and update post actions"
```

---

## Task 16: Wire Up Admin Pages (Pass `allTags` to PostForm)

**Files:**
- Modify: `src/app/admin/(protected)/blog/new/page.tsx`
- Modify: `src/app/admin/(protected)/blog/[id]/edit/page.tsx`

**Step 1: Update new post page**

```tsx
import PostForm from "@/components/admin/PostForm";
import { createPostAction } from "@/actions/posts";
import { getAllTagsAdmin } from "@/data/tags";

export default async function NewBlogPostPage() {
  const allTags = await getAllTagsAdmin();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat Post Baru</h1>
      <PostForm action={createPostAction} submitLabel="Publikasikan" allTags={allTags} />
    </div>
  );
}
```

**Step 2: Read and update the edit page**

Read `src/app/admin/(protected)/blog/[id]/edit/page.tsx` first, then add `allTags`:

```tsx
import { getAllTagsAdmin } from "@/data/tags";
// ...existing imports...

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const [post, allTags] = await Promise.all([getPostById(id), getAllTagsAdmin()]);
  if (!post) notFound();

  // ...existing action binding...
  return (
    <div>
      <h1 ...>Edit Post</h1>
      <PostForm
        action={updateAction}
        defaultValues={post}
        submitLabel="Simpan Perubahan"
        allTags={allTags}
      />
    </div>
  );
}
```

**Step 3: Final build verification**

```bash
bun run build 2>&1
```

Expected: exits with code 0, no errors.

**Step 4: Commit**

```bash
git add src/app/admin/(protected)/blog/new/page.tsx src/app/admin/(protected)/blog/\[id\]/edit/page.tsx
git commit -m "feat: pass allTags to PostForm in admin new and edit pages"
```

---

## Done

All blog features are implemented. Test manually:

1. Visit `/blog` — search, tag filter, and pagination should work
2. Visit `/blog/[any-slug]` — breadcrumb, author, reading time, tags, share button, related posts should appear
3. Admin: create/edit a post — tag multi-select and new tag creation should work
