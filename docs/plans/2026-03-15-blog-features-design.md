# Blog Features Design

Date: 2026-03-15

## Overview

Add the following features to the public blog:

- Breadcrumb / back button
- Categories / tags (relational)
- Related posts (random)
- Share button
- Reading time estimate
- Author info (static "AdminOXA")
- Pagination (9 posts/page)
- Search & filter (server-side)

Approach: all features implemented in one pass.

---

## 1. Schema Changes

New migration: `docs/migrations/003_blog_tags.sql`

```sql
CREATE TABLE tags (
  id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name  text NOT NULL,
  slug  text UNIQUE NOT NULL
);

CREATE TABLE post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "public read post_tags" ON post_tags FOR SELECT USING (true);
```

---

## 2. Type Changes (`src/types/index.ts`)

```ts
export interface Tag {
  id: string;
  name: string;
  slug: string;
}

// Post gets optional tags when fetched with join
export interface Post {
  ...existing fields...
  tags?: Tag[];
}
```

---

## 3. Data Layer (`src/data/posts.ts`, `src/data/tags.ts`)

### `posts.ts` changes

| Function | Change |
|---|---|
| `getPublishedPosts(page, q, tag)` | Add pagination (9/page), search by title/excerpt, filter by tag slug, include tags via join |
| `getPostBySlug(slug)` | Include tags via join |
| `getRelatedPosts(excludeId, limit=3)` | Fetch random posts excluding current |

### New `tags.ts`

| Function | Purpose |
|---|---|
| `getAllTags()` | All tags for filter UI (public) |
| `getAllTagsAdmin()` | All tags for admin PostForm |
| `upsertPostTags(postId, tagIds)` | Delete old + insert new post_tags |

---

## 4. Blog List Page (`/blog`)

- **Search bar** at top: text input, submit via form (GET)
- **Tag filter pills**: "Semua" + one pill per tag, active pill highlighted
- **Grid**: 3 columns (unchanged)
- **Pagination**: prev/next + page numbers at bottom

URL structure: `/blog?q=keyword&tag=tutorial&page=2`

New components:
- `BlogSearchFilter` (client component) — search input + tag pills
- `Pagination` (reusable server component) — receives `currentPage`, `totalPages`, base URL params

---

## 5. Blog Detail Page (`/blog/[slug]`)

### Above content
- **Breadcrumb**: `Beranda / Blog / [Post Title]` — links to `/` and `/blog`
- **Reading time**: calculated from HTML word count (~200 words/min), displayed as "X menit baca"
- **Author**: static avatar placeholder + "AdminOXA"
- **Tag pills**: each links to `/blog?tag=slug`

### Below content
- **Share button** (client component): Web Share API if available, fallback copies URL to clipboard
- **Related posts**: 3 random posts, horizontal card layout (thumbnail + title + date)

New components:
- `Breadcrumb` — reusable, accepts `{ label: string; href?: string }[]`
- `ShareButton` — client component
- `RelatedPosts` — accepts `Post[]`

Utility: `src/lib/readingTime.ts` — calculates reading time from HTML string

---

## 6. Admin PostForm (`src/components/admin/PostForm.tsx`)

Add tag multi-select field:
- Load all existing tags from `getAllTagsAdmin()`
- Checkboxes or pill-toggle UI for selecting tags
- Inline tag creation: type a new tag name, auto-generate slug, add to list
- Tags saved via `upsertPostTags` in server actions

### Server action changes (`src/actions/posts.ts`)
- `createPostAction`: after insert post, call `upsertPostTags(postId, selectedTagIds)`
- `updatePostAction`: call `upsertPostTags(postId, selectedTagIds)` (replaces old tags)

---

## 7. New Files Summary

| File | Type |
|---|---|
| `docs/migrations/003_blog_tags.sql` | Migration |
| `src/data/tags.ts` | Data layer |
| `src/lib/readingTime.ts` | Utility |
| `src/components/blog/Breadcrumb.tsx` | Component |
| `src/components/blog/ShareButton.tsx` | Client component |
| `src/components/blog/RelatedPosts.tsx` | Component |
| `src/components/blog/TagPills.tsx` | Component |
| `src/components/blog/BlogSearchFilter.tsx` | Client component |
| `src/components/ui/Pagination.tsx` | Reusable component |
