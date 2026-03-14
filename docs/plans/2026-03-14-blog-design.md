# Blog CRUD Feature Design

## Goal

Add a blog system where admins can create, edit, and delete posts with rich text content, a thumbnail image, and draft/published status. Public users can browse and read posts.

## Architecture

Server Actions handle all mutations. Admin routes are protected by iron-session. Public routes are in the `(public)` route group. HTML content is stored in the database and sanitized on render using DOMPurify.

## Tech Stack

- `react-quill-new` — React 19-compatible rich text editor
- `dompurify` + `@types/dompurify` — XSS sanitization on render
- `slugify` — Auto-generate slug from title
- Supabase Storage (`blog-thumbnails` bucket, public) — thumbnail uploads
- Tailwind `prose` class — styled HTML rendering

---

## Database Schema

```sql
CREATE TABLE posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  title       text NOT NULL,
  excerpt     text,
  content     text,              -- HTML from Quill
  thumbnail   text,              -- Supabase Storage public URL
  status      text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- RLS: public can read published posts only
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published" ON posts FOR SELECT USING (status = 'published');
-- Admin bypasses RLS via service role
```

---

## Routes

| Path | Access | Description |
|------|--------|-------------|
| `/blog` | Public | Grid of published posts |
| `/blog/[slug]` | Public | Full post with sanitized HTML |
| `/admin/blog` | Admin | List all posts (draft + published) |
| `/admin/blog/new` | Admin | Create post form |
| `/admin/blog/[id]/edit` | Admin | Edit post form |

---

## Admin Flow (CRUD)

### PostForm component (`src/components/admin/PostForm.tsx`)

Fields:
- **Title** — text input, onChange auto-generates slug
- **Slug** — text input, editable (auto-filled from title via `slugify`)
- **Excerpt** — textarea
- **Thumbnail** — file input → uploads to `blog-thumbnails` bucket via Server Action, stores public URL
- **Content** — `ReactQuill` (dynamic import with `ssr: false`)
- **Status** — toggle: Draft / Published

### Server Actions (`src/actions/posts.ts`)

- `createPostAction(prev, formData)` — validates, uploads thumbnail if present, inserts row
- `updatePostAction(id, prev, formData)` — updates row, re-uploads thumbnail if new file
- `deletePostAction(id)` — deletes row + removes thumbnail from Storage

All actions guard with `getAdminSession()` and redirect on success.

---

## Public Blog Flow

### `/blog` page

- Fetches published posts ordered by `published_at DESC`
- Grid of cards: thumbnail, title, excerpt, date
- Empty state if no published posts

### `/blog/[slug]` page

- Fetches single post by slug, 404 if not found or draft
- Renders `content` HTML via DOMPurify in a `<div className="prose">` wrapper
- DOMPurify runs client-side in a `"use client"` component (`PostContent.tsx`)

---

## File Structure

```
src/
  actions/posts.ts
  app/
    (public)/
      blog/
        page.tsx
        [slug]/
          page.tsx
    admin/(protected)/
      blog/
        page.tsx
        new/page.tsx
        [id]/edit/page.tsx
  components/
    admin/
      PostForm.tsx
    blog/
      PostContent.tsx        -- "use client", DOMPurify sanitize + render
  data/posts.ts              -- getPublishedPosts(), getPostBySlug(), getAllPosts()
  types/index.ts             -- Post type added
docs/migrations/
  002_blog.sql
```

---

## Manual Setup Required

1. Create `blog-thumbnails` bucket in Supabase Storage (public)
2. Run `docs/migrations/002_blog.sql` in Supabase Dashboard
