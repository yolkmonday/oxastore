# 3D Book Viewer

## Overview

Add an interactive 3D book viewer to the book detail page and admin form preview. Users upload 3 images (front cover, back cover, spine) and the system renders a rotatable 3D book using React Three Fiber.

## Tech Stack

- `@react-three/fiber` — React renderer for Three.js
- `@react-three/drei` — helpers (OrbitControls, texture loading)
- `three` — peer dependency

## Database Changes

Add 2 nullable columns to `books` table:

```sql
ALTER TABLE books ADD COLUMN back_image text;
ALTER TABLE books ADD COLUMN spine_image text;
```

## Type Changes

```ts
// src/types/index.ts — Book interface
backImage: string | null;
spineImage: string | null;
```

## Components

### `Book3DViewer` (client component)

Path: `src/components/books/Book3DViewer.tsx`

Props:
- `frontImage: string` — URL front cover
- `backImage: string` — URL back cover
- `spineImage: string` — URL spine
- `width?: number` — book width in cm (default 14)
- `height?: number` — book height in cm (default 21)
- `depth?: number` — spine thickness in cm (default 1.5)

Behavior:
- Renders a box geometry with textures mapped to faces:
  - Front face: front cover
  - Back face: back cover
  - Left/right (spine side): spine image
  - Top/bottom: solid color (white/off-white)
- OrbitControls: horizontal rotation enabled, limited vertical tilt, zoom disabled
- Auto-rotates slowly when not interacting
- Responsive container (fills parent width, aspect ~3:4)

Fallback: If any of the 3 images is missing, component returns `null` (caller shows regular 2D cover instead).

## Admin Form Changes

### BookForm (`src/components/admin/BookForm.tsx`)

Add 2 file inputs below existing "Cover Buku":
- **Cover Belakang** (`back_image`) — file input, accepts image/*
- **Punggung Buku (Spine)** (`spine_image`) — file input, accepts image/*

Add a live 3D preview section:
- Shows `Book3DViewer` when all 3 images are available (uses `URL.createObjectURL` for local file previews)
- Shows text hint "Upload ketiga gambar untuk preview 3D" when incomplete

### Default values

Add to `BookFormProps.defaultValues`:
- `back_image?: string | null`
- `spine_image?: string | null`

## Server Action Changes

### `createBook` and `updateBook` (`src/actions/books.ts`)

- Extract `back_image` and `spine_image` from FormData
- Upload to Supabase Storage bucket (same bucket as cover_image)
- Store public URLs in `back_image` and `spine_image` columns
- On update: only replace if new file provided

## Data Layer Changes

### `getBookBySlug` and `getBooks` (`src/data/books.ts`)

- Map `back_image` -> `backImage` and `spine_image` -> `spineImage` in book mapping function

## Book Detail Page Changes

### `/books/[slug]/page.tsx`

Replace static cover image section with:
- If `book.backImage` AND `book.spineImage` exist: render `Book3DViewer`
- Else: render current static `<Image>` cover (no change)

Keep badges (discount, bestseller) overlaid on the viewer container.

## What Does NOT Change

- `BookCard` in catalog — stays 2D cover image
- Book list in admin — stays as-is
- Existing books without back/spine images — render as before (graceful fallback)
