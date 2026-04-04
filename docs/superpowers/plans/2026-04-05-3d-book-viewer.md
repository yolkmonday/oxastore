# 3D Book Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive 3D book viewer to the detail page and admin form, built from front cover, back cover, and spine images uploaded by admin.

**Architecture:** Three.js via React Three Fiber renders a textured box geometry as the book. Three new image fields (back_image, spine_image) are added to the database and piped through the existing Supabase upload flow. The 3D viewer is a client component with OrbitControls for drag-to-rotate.

**Tech Stack:** `three`, `@react-three/fiber`, `@react-three/drei`, Supabase Storage, Next.js App Router

---

### Task 1: Install dependencies

**Files:** `package.json`

- [ ] **Step 1: Install Three.js and React Three Fiber**

```bash
bun add three @react-three/fiber @react-three/drei
bun add -D @types/three
```

- [ ] **Step 2: Verify installation**

```bash
bun run build 2>&1 | head -5
```

Expected: build starts without import errors (can cancel after compilation begins).

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add three.js and react-three-fiber dependencies"
```

---

### Task 2: Add database columns and update types

**Files:**
- Modify: `src/types/index.ts:21-41` (Book interface)
- Modify: `src/data/books.ts:4-26` (mapRow function)

- [ ] **Step 1: Add columns to Supabase**

Run this SQL in Supabase dashboard (SQL Editor):

```sql
ALTER TABLE books ADD COLUMN IF NOT EXISTS back_image text;
ALTER TABLE books ADD COLUMN IF NOT EXISTS spine_image text;
```

- [ ] **Step 2: Update Book interface**

In `src/types/index.ts`, add two fields to the `Book` interface after `coverImage`:

```ts
export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  price: number;
  year: number;
  coverImage: string | null;
  backImage: string | null;
  spineImage: string | null;
  category: string;
  tags: string[];
  discount?: number;
  isBestSeller?: boolean;
  description?: string;
  pages?: number;
  language?: string;
  width?: number;
  length?: number;
  weight?: number;
  publisher?: string;
  marketplaceLinks?: MarketplaceLink[];
}
```

- [ ] **Step 3: Update mapRow in data layer**

In `src/data/books.ts`, add the two new fields to the `mapRow` function after `coverImage`:

```ts
function mapRow(row: Record<string, unknown>): Book {
  return {
    id: row.id as string,
    slug: (row.slug as string) ?? "",
    title: row.title as string,
    author: row.author as string,
    price: Number(row.price),
    year: row.year as number,
    coverImage: (row.cover_image as string | null) ?? null,
    backImage: (row.back_image as string | null) ?? null,
    spineImage: (row.spine_image as string | null) ?? null,
    category: row.category as string,
    tags: (row.tags as string[]) ?? [],
    isBestSeller: row.is_bestseller as boolean,
    discount: (row.discount as number | null) ?? undefined,
    description: row.description as string | undefined,
    pages: (row.pages as number | null) ?? undefined,
    language: row.language as string | undefined,
    width: (row.width as number | null) ?? undefined,
    length: (row.length as number | null) ?? undefined,
    weight: (row.weight as number | null) ?? undefined,
    publisher: row.publisher as string | undefined,
    marketplaceLinks: (row.marketplace_links as import("@/types").MarketplaceLink[] | null) ?? undefined,
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/data/books.ts
git commit -m "feat: add backImage and spineImage fields to Book type and data layer"
```

---

### Task 3: Update server actions to handle back/spine image uploads

**Files:**
- Modify: `src/actions/books.ts`

- [ ] **Step 1: Add image upload helper**

Add this helper function after the `parseSlugAndTags` function in `src/actions/books.ts`:

```ts
async function uploadBookImage(
  supabase: ReturnType<typeof createSupabaseClient>,
  file: File | null
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const ext = file.name.split(".").pop();
  const filename = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("book-covers")
    .upload(filename, file);
  if (error) throw new Error("Gagal upload gambar: " + error.message);
  const { data: urlData } = supabase.storage
    .from("book-covers")
    .getPublicUrl(filename);
  return urlData.publicUrl;
}

function extractStoragePath(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const parts = url.pathname.split("/book-covers/");
    return parts.length === 2 ? parts[1] : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Update createBookAction**

In `createBookAction`, replace the cover_image upload block (lines 83-98) and the insert call with:

```ts
  const supabase = createSupabaseClient();

  let cover_image: string | null = null;
  let back_image: string | null = null;
  let spine_image: string | null = null;

  try {
    cover_image = await uploadBookImage(supabase, formData.get("cover_image") as File | null);
    back_image = await uploadBookImage(supabase, formData.get("back_image") as File | null);
    spine_image = await uploadBookImage(supabase, formData.get("spine_image") as File | null);
  } catch (err) {
    return { error: (err as Error).message };
  }

  const { error } = await supabase.from("books").insert({
    ...parsed.data,
    cover_image,
    back_image,
    spine_image,
    slug,
    tags,
    marketplace_links,
  });
```

- [ ] **Step 3: Update updateBookAction**

In `updateBookAction`, update the existing book select to also fetch `back_image` and `spine_image`:

```ts
  const { data: existingBook } = await supabase
    .from("books")
    .select("cover_image, back_image, spine_image")
    .eq("id", id)
    .single();
```

Then replace the cover_image upload block (lines 154-182) with:

```ts
  let cover_image: string | undefined = undefined;
  let back_image: string | undefined = undefined;
  let spine_image: string | undefined = undefined;

  try {
    const newCover = await uploadBookImage(supabase, formData.get("cover_image") as File | null);
    if (newCover) {
      cover_image = newCover;
      if (existingBook?.cover_image) {
        const oldPath = extractStoragePath(existingBook.cover_image);
        if (oldPath) await supabase.storage.from("book-covers").remove([oldPath]);
      }
    }

    const newBack = await uploadBookImage(supabase, formData.get("back_image") as File | null);
    if (newBack) {
      back_image = newBack;
      if (existingBook?.back_image) {
        const oldPath = extractStoragePath(existingBook.back_image as string);
        if (oldPath) await supabase.storage.from("book-covers").remove([oldPath]);
      }
    }

    const newSpine = await uploadBookImage(supabase, formData.get("spine_image") as File | null);
    if (newSpine) {
      spine_image = newSpine;
      if (existingBook?.spine_image) {
        const oldPath = extractStoragePath(existingBook.spine_image as string);
        if (oldPath) await supabase.storage.from("book-covers").remove([oldPath]);
      }
    }
  } catch (err) {
    return { error: (err as Error).message };
  }
```

And update the `updateData` object to include the new fields:

```ts
  const updateData: Record<string, unknown> = {
    ...parsed.data,
    slug,
    tags,
    marketplace_links,
    updated_at: new Date().toISOString(),
  };
  if (cover_image !== undefined) updateData.cover_image = cover_image;
  if (back_image !== undefined) updateData.back_image = back_image;
  if (spine_image !== undefined) updateData.spine_image = spine_image;
```

- [ ] **Step 4: Update bulkDeleteBooksAction and deleteBookAction**

In `bulkDeleteBooksAction`, update the select and filenames extraction:

```ts
  const { data: books } = await supabase
    .from("books")
    .select("cover_image, back_image, spine_image")
    .in("id", ids);

  if (books) {
    const filenames = books
      .flatMap((b) => {
        const urls = [b.cover_image, b.back_image, b.spine_image].filter(Boolean) as string[];
        return urls.map(extractStoragePath).filter(Boolean) as string[];
      });
    if (filenames.length) {
      await supabase.storage.from("book-covers").remove(filenames);
    }
  }
```

In `deleteBookAction`, update similarly:

```ts
  const { data: book } = await supabase
    .from("books")
    .select("cover_image, back_image, spine_image")
    .eq("id", id)
    .single();

  if (book) {
    const urls = [book.cover_image, book.back_image, book.spine_image].filter(Boolean) as string[];
    const paths = urls.map(extractStoragePath).filter(Boolean) as string[];
    if (paths.length) {
      await supabase.storage.from("book-covers").remove(paths);
    }
  }
```

- [ ] **Step 5: Commit**

```bash
git add src/actions/books.ts
git commit -m "feat: handle back_image and spine_image uploads in book actions"
```

---

### Task 4: Update BookForm with new upload fields and 3D preview

**Files:**
- Modify: `src/components/admin/BookForm.tsx`

- [ ] **Step 1: Add new defaultValues props**

In the `BookFormProps` interface `defaultValues`, add after `cover_image`:

```ts
    back_image?: string | null;
    spine_image?: string | null;
```

- [ ] **Step 2: Add state for local image previews**

Add these state variables inside the `BookForm` component, after the existing `useState` calls:

```ts
  const [coverPreview, setCoverPreview] = useState<string | null>(defaultValues.cover_image ?? null);
  const [backPreview, setBackPreview] = useState<string | null>(defaultValues.back_image ?? null);
  const [spinePreview, setSpinePreview] = useState<string | null>(defaultValues.spine_image ?? null);

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string | null) => void
  ) {
    const file = e.target.files?.[0];
    if (file) {
      setter(URL.createObjectURL(file));
    }
  }
```

- [ ] **Step 3: Add back_image and spine_image file inputs**

After the existing "Cover Buku" `<div>` block, add:

```tsx
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cover Belakang
        </label>
        {defaultValues.back_image && (
          <img
            src={defaultValues.back_image}
            alt="Cover belakang saat ini"
            className="w-20 h-28 object-cover rounded mb-2"
          />
        )}
        <input
          type="file"
          name="back_image"
          accept="image/*"
          onChange={(e) => handleImageChange(e, setBackPreview)}
          className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
        {defaultValues.back_image && (
          <p className="text-xs text-gray-400 mt-1">
            Biarkan kosong untuk mempertahankan cover belakang saat ini.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Punggung Buku (Spine)
        </label>
        {defaultValues.spine_image && (
          <img
            src={defaultValues.spine_image}
            alt="Spine saat ini"
            className="w-10 h-28 object-cover rounded mb-2"
          />
        )}
        <input
          type="file"
          name="spine_image"
          accept="image/*"
          onChange={(e) => handleImageChange(e, setSpinePreview)}
          className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
        {defaultValues.spine_image && (
          <p className="text-xs text-gray-400 mt-1">
            Biarkan kosong untuk mempertahankan spine saat ini.
          </p>
        )}
      </div>
```

- [ ] **Step 4: Update the existing cover_image input to track preview**

Add `onChange` to the existing cover_image file input:

```tsx
        <input
          type="file"
          name="cover_image"
          accept="image/*"
          onChange={(e) => handleImageChange(e, setCoverPreview)}
          className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
```

- [ ] **Step 5: Add 3D preview section**

Add a dynamic import for Book3DViewer and a preview section after the spine_image div. Add this import at the top of the file:

```ts
import dynamic from "next/dynamic";

const Book3DViewer = dynamic(() => import("@/components/books/Book3DViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-50 rounded-xl flex items-center justify-center text-sm text-gray-400">
      Memuat preview 3D...
    </div>
  ),
});
```

Then add the preview block after the spine input div:

```tsx
      {/* 3D Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preview 3D
        </label>
        {coverPreview && backPreview && spinePreview ? (
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            <Book3DViewer
              frontImage={coverPreview}
              backImage={backPreview}
              spineImage={spinePreview}
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-50 rounded-xl flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-300">
            Upload cover depan, belakang, dan spine untuk preview 3D
          </div>
        )}
      </div>
```

- [ ] **Step 6: Update admin edit page to pass new defaultValues**

In `src/app/admin/(protected)/books/[id]/edit/page.tsx`, add to the `defaultValues` object:

```ts
          back_image: book.back_image,
          spine_image: book.spine_image,
```

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/BookForm.tsx src/app/admin/\(protected\)/books/\[id\]/edit/page.tsx
git commit -m "feat: add back/spine image uploads and 3D preview to BookForm"
```

---

### Task 5: Create Book3DViewer component

**Files:**
- Create: `src/components/books/Book3DViewer.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/books/Book3DViewer.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader, Mesh } from "three";

interface Book3DViewerProps {
  frontImage: string;
  backImage: string;
  spineImage: string;
  width?: number;
  height?: number;
  depth?: number;
}

function BookMesh({
  frontImage,
  backImage,
  spineImage,
  width = 2.8,
  height = 4,
  depth = 0.3,
}: Book3DViewerProps) {
  const meshRef = useRef<Mesh>(null);
  const isHovering = useRef(false);

  const [frontTex, backTex, spineTex] = useLoader(TextureLoader, [
    frontImage,
    backImage,
    spineImage,
  ]);

  useFrame((_state, delta) => {
    if (meshRef.current && !isHovering.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => (isHovering.current = true)}
      onPointerOut={() => (isHovering.current = false)}
    >
      <boxGeometry args={[width, height, depth]} />
      {/*
        Box face order: +X, -X, +Y, -Y, +Z, -Z
        +X = right edge, -X = left edge (spine),
        +Y = top, -Y = bottom,
        +Z = front cover, -Z = back cover
      */}
      <meshStandardMaterial attach="material-0" color="#f5f5f4" />
      <meshStandardMaterial attach="material-1" map={spineTex} />
      <meshStandardMaterial attach="material-2" color="#f5f5f4" />
      <meshStandardMaterial attach="material-3" color="#f5f5f4" />
      <meshStandardMaterial attach="material-4" map={frontTex} />
      <meshStandardMaterial attach="material-5" map={backTex} />
    </mesh>
  );
}

export default function Book3DViewer(props: Book3DViewerProps) {
  return (
    <div className="w-full h-[400px]">
      <Canvas camera={{ position: [0, 0, 6], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <BookMesh {...props} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={(Math.PI * 2) / 3}
        />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2: Verify the component compiles**

```bash
bun run build 2>&1 | tail -20
```

Expected: build succeeds without errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/books/Book3DViewer.tsx
git commit -m "feat: create Book3DViewer component with React Three Fiber"
```

---

### Task 6: Integrate 3D viewer into book detail page

**Files:**
- Modify: `src/app/(public)/books/[slug]/page.tsx`

- [ ] **Step 1: Add dynamic import**

At the top of `src/app/(public)/books/[slug]/page.tsx`, add:

```ts
import dynamic from "next/dynamic";

const Book3DViewer = dynamic(() => import("@/components/books/Book3DViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-[220px] aspect-[3/4] rounded-xl bg-gray-100 animate-pulse" />
  ),
});
```

- [ ] **Step 2: Replace cover section with conditional 3D viewer**

Replace the cover `<div>` section (the `<div className="relative w-[220px] aspect-[3/4]...">` block containing the Image) with:

```tsx
          {book.backImage && book.spineImage ? (
            <div className="relative w-[280px]">
              {book.discount && (
                <Badge
                  variant="discount"
                  className="absolute top-2 left-2 z-10"
                >
                  {book.discount}% DISKON
                </Badge>
              )}
              {book.isBestSeller && (
                <Badge
                  variant="bestseller"
                  className="absolute top-2 right-2 z-10"
                >
                  Best Seller
                </Badge>
              )}
              <Book3DViewer
                frontImage={book.coverImage || "https://placehold.co/220x293/e5e7eb/9ca3af?text=No+Cover"}
                backImage={book.backImage}
                spineImage={book.spineImage}
              />
            </div>
          ) : (
            <div className="relative w-[220px] aspect-[3/4] rounded-xl overflow-hidden shadow-lg bg-gray-100">
              {book.discount && (
                <Badge
                  variant="discount"
                  className="absolute top-2 left-2 z-10"
                >
                  {book.discount}% DISKON
                </Badge>
              )}
              {book.isBestSeller && (
                <Badge
                  variant="bestseller"
                  className="absolute top-2 right-2 z-10"
                >
                  Best Seller
                </Badge>
              )}
              <Image
                src={book.coverImage || "https://placehold.co/220x293/e5e7eb/9ca3af?text=No+Cover"}
                alt={book.title}
                fill
                className="object-cover"
              />
            </div>
          )}
```

- [ ] **Step 3: Verify build**

```bash
bun run build 2>&1 | tail -20
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/books/\[slug\]/page.tsx
git commit -m "feat: show 3D book viewer on detail page when all images available"
```

---

### Task 7: Build and verify end-to-end

- [ ] **Step 1: Run full build**

```bash
bun run build
```

Expected: all pages compile, no type errors.

- [ ] **Step 2: Manual test checklist**

Run `bun run dev` and verify:
1. Admin `/admin/books/new` — shows 3 image upload fields, 3D preview appears when all 3 selected
2. Admin edit page — shows existing images, 3D preview works with existing URLs
3. Book detail page — shows 3D viewer if all 3 images exist, falls back to 2D cover if not
4. Existing books without back/spine images still render correctly

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: 3D book viewer - complete implementation"
```
