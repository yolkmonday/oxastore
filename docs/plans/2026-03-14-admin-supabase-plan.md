# Admin Panel & Supabase Backend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a fully functional admin panel with Supabase backend, replacing static dummy data with a real database.

**Architecture:** Next.js Server Actions handle all backend logic (no API routes). Supabase is accessed server-side only via `service_role` key. Admin auth uses custom bcrypt + iron-session (no Supabase Auth).

**Tech Stack:** Next.js 16, Supabase JS v2, iron-session, bcryptjs, zod, tsx

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install packages**

```bash
npm install @supabase/supabase-js iron-session bcryptjs zod
npm install -D @types/bcryptjs tsx
```

**Step 2: Verify installation**

```bash
cat package.json | grep -E "supabase|iron-session|bcryptjs|zod|tsx"
```

Expected: all 5 packages appear.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add supabase, iron-session, bcryptjs, zod dependencies"
```

---

## Task 2: Environment Variables

**Files:**
- Create: `.env.local` (do NOT commit)
- Create: `.env.local.example`

**Step 1: Create `.env.local.example`**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SESSION_SECRET=your-random-string-minimum-32-characters-long
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
```

**Step 2: Create `.env.local` with your actual values**

Copy `.env.local.example` to `.env.local` and fill in real values from your Supabase project dashboard (Settings > API).

`SESSION_SECRET` must be at least 32 characters. Generate one:
```bash
openssl rand -base64 32
```

**Step 3: Ensure `.env.local` is in `.gitignore`**

Check `.gitignore` contains `.env.local`. Next.js includes this by default.

**Step 4: Commit `.env.local.example`**

```bash
git add .env.local.example
git commit -m "chore: add env vars example file"
```

---

## Task 3: Supabase Database Setup

Run these SQL statements in the Supabase SQL Editor (dashboard > SQL Editor).

**Step 1: Create `admins` table**

```sql
create table admins (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  password   text not null,
  created_at timestamptz default now()
);
```

**Step 2: Create `books` table**

```sql
create table books (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  author        text not null,
  price         numeric(10,2) not null,
  year          int not null,
  cover_image   text,
  category      text not null,
  is_bestseller boolean default false,
  discount      int,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
```

**Step 3: Create Storage bucket**

In Supabase dashboard > Storage > New bucket:
- Name: `book-covers`
- Public bucket: YES (toggle on)

**Step 4: Set Storage policy (allow public read)**

In the `book-covers` bucket > Policies > New policy > "For full customization":

```sql
-- Allow public read
create policy "Public read"
  on storage.objects for select
  using ( bucket_id = 'book-covers' );

-- Allow service_role full access (already granted by default for service_role)
```

---

## Task 4: Supabase Client Library

**Files:**
- Create: `src/lib/supabase.ts`

**Step 1: Create server-side Supabase client**

```ts
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

Note: We use `service_role` key here because this file is only ever imported in Server Components and Server Actions — never sent to the browser.

**Step 2: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add supabase server client"
```

---

## Task 5: Session Library (iron-session)

**Files:**
- Create: `src/lib/session.ts`

**Step 1: Create session config and helper**

```ts
// src/lib/session.ts
import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface AdminSession {
  adminId: string;
  email: string;
}

export const sessionOptions: SessionOptions = {
  cookieName: "oxastore_admin",
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<AdminSession>(cookieStore, sessionOptions);
}
```

**Step 2: Commit**

```bash
git add src/lib/session.ts
git commit -m "feat: add iron-session config and getSession helper"
```

---

## Task 6: Password Helpers

**Files:**
- Create: `src/lib/password.ts`

**Step 1: Create bcrypt helpers**

```ts
// src/lib/password.ts
import bcrypt from "bcryptjs";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
```

**Step 2: Commit**

```bash
git add src/lib/password.ts
git commit -m "feat: add bcrypt password helpers"
```

---

## Task 7: Admin Seeder Script

**Files:**
- Create: `src/scripts/seed-admin.ts`

**Step 1: Create seeder**

```ts
// src/scripts/seed-admin.ts
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// Load .env.local manually for tsx
import { config } from "dotenv";
config({ path: ".env.local" });

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const hashedPassword = await bcrypt.hash(password, 12);

  const { error } = await supabase
    .from("admins")
    .insert({ email, password: hashedPassword });

  if (error) {
    if (error.code === "23505") {
      console.log(`Admin ${email} already exists.`);
    } else {
      console.error("Error seeding admin:", error.message);
      process.exit(1);
    }
  } else {
    console.log(`Admin ${email} created successfully.`);
  }
}

seedAdmin();
```

**Step 2: Install dotenv (needed for the script)**

```bash
npm install -D dotenv
```

**Step 3: Run the seeder**

```bash
npx tsx src/scripts/seed-admin.ts
```

Expected output: `Admin admin@example.com created successfully.`

**Step 4: Commit**

```bash
git add src/scripts/seed-admin.ts package.json package-lock.json
git commit -m "feat: add admin seeder script"
```

---

## Task 8: Auth Server Actions

**Files:**
- Create: `src/actions/auth.ts`

**Step 1: Create auth actions**

```ts
// src/actions/auth.ts
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseClient } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { verifyPassword, hashPassword } from "@/lib/password";

export interface ActionResult {
  error?: string;
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Email atau password tidak valid." };
  }

  const { email, password } = parsed.data;
  const supabase = createSupabaseClient();

  const { data: admin } = await supabase
    .from("admins")
    .select("id, email, password")
    .eq("email", email)
    .single();

  if (!admin) {
    return { error: "Email atau password salah." };
  }

  const valid = await verifyPassword(password, admin.password);
  if (!valid) {
    return { error: "Email atau password salah." };
  }

  const session = await getSession();
  session.adminId = admin.id;
  session.email = admin.email;
  await session.save();

  redirect("/admin/books");
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter."),
});

export async function changePasswordAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session.adminId) {
    return { error: "Tidak terautentikasi." };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { currentPassword, newPassword } = parsed.data;
  const supabase = createSupabaseClient();

  const { data: admin } = await supabase
    .from("admins")
    .select("password")
    .eq("id", session.adminId)
    .single();

  if (!admin) {
    return { error: "Admin tidak ditemukan." };
  }

  const valid = await verifyPassword(currentPassword, admin.password);
  if (!valid) {
    return { error: "Password saat ini salah." };
  }

  const hashed = await hashPassword(newPassword);
  await supabase
    .from("admins")
    .update({ password: hashed })
    .eq("id", session.adminId);

  return {};
}
```

**Step 2: Commit**

```bash
git add src/actions/auth.ts
git commit -m "feat: add login, logout, changePassword server actions"
```

---

## Task 9: Books Server Actions

**Files:**
- Create: `src/actions/books.ts`

**Step 1: Create books actions**

```ts
// src/actions/books.ts
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseClient } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export interface ActionResult {
  error?: string;
}

async function requireAdmin() {
  const session = await getSession();
  if (!session.adminId) redirect("/admin/login");
  return session;
}

const bookSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi."),
  author: z.string().min(1, "Penulis wajib diisi."),
  price: z.coerce.number().positive("Harga harus lebih dari 0."),
  year: z.coerce.number().int().min(1000).max(9999),
  category: z.enum(["popular", "new", "upcoming"]),
  is_bestseller: z.coerce.boolean().optional().default(false),
  discount: z.coerce.number().int().min(0).max(100).optional().nullable(),
});

export async function createBookAction(
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = bookSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author"),
    price: formData.get("price"),
    year: formData.get("year"),
    category: formData.get("category"),
    is_bestseller: formData.get("is_bestseller") === "on",
    discount: formData.get("discount") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createSupabaseClient();

  // Handle cover image upload
  let cover_image: string | null = null;
  const coverFile = formData.get("cover_image") as File | null;
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split(".").pop();
    const filename = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("book-covers")
      .upload(filename, coverFile);
    if (uploadError) {
      return { error: "Gagal upload gambar: " + uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("book-covers")
      .getPublicUrl(filename);
    cover_image = urlData.publicUrl;
  }

  const { error } = await supabase.from("books").insert({
    ...parsed.data,
    cover_image,
  });

  if (error) {
    return { error: "Gagal menyimpan buku: " + error.message };
  }

  redirect("/admin/books");
}

export async function updateBookAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = bookSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author"),
    price: formData.get("price"),
    year: formData.get("year"),
    category: formData.get("category"),
    is_bestseller: formData.get("is_bestseller") === "on",
    discount: formData.get("discount") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = createSupabaseClient();

  // Handle cover image upload (optional re-upload)
  let cover_image: string | undefined = undefined;
  const coverFile = formData.get("cover_image") as File | null;
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split(".").pop();
    const filename = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("book-covers")
      .upload(filename, coverFile);
    if (uploadError) {
      return { error: "Gagal upload gambar: " + uploadError.message };
    }
    const { data: urlData } = supabase.storage
      .from("book-covers")
      .getPublicUrl(filename);
    cover_image = urlData.publicUrl;
  }

  const updateData: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };
  if (cover_image !== undefined) {
    updateData.cover_image = cover_image;
  }

  const { error } = await supabase
    .from("books")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: "Gagal memperbarui buku: " + error.message };
  }

  redirect("/admin/books");
}

export async function deleteBookAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createSupabaseClient();

  // Get cover URL to delete from storage
  const { data: book } = await supabase
    .from("books")
    .select("cover_image")
    .eq("id", id)
    .single();

  if (book?.cover_image) {
    // Extract filename from URL
    const url = new URL(book.cover_image);
    const pathParts = url.pathname.split("/");
    const filename = pathParts[pathParts.length - 1];
    await supabase.storage.from("book-covers").remove([filename]);
  }

  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) {
    return { error: "Gagal menghapus buku: " + error.message };
  }

  redirect("/admin/books");
}
```

**Step 2: Commit**

```bash
git add src/actions/books.ts
git commit -m "feat: add CRUD book server actions with storage upload"
```

---

## Task 10: Admin Layout with Auth Guard

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`

**Step 1: Create admin layout**

```tsx
// src/app/admin/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Login page is exempt — check pathname via children render
  // We guard all routes; login page handles the unauthenticated state separately
  const isLoginPage =
    typeof children === "object" &&
    (children as React.ReactElement)?.type?.toString().includes("LoginPage");

  if (!session.adminId) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-bold text-gray-900">oxastore admin</span>
          <Link
            href="/admin/books"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Buku
          </Link>
          <Link
            href="/admin/settings"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Pengaturan
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{session.email}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-red-600 hover:text-red-800 cursor-pointer"
            >
              Keluar
            </button>
          </form>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
```

**Important:** The login page (`/admin/login`) must NOT use this layout. Create a separate layout for login, or handle the redirect differently.

Actually, the cleanest approach is to **not** apply the auth guard to `/admin/login`. To do this, move login outside the protected layout group:

Restructure:
```
src/app/
├── admin/
│   ├── (protected)/         ← route group, has auth-guarded layout
│   │   ├── layout.tsx       ← auth guard here
│   │   ├── page.tsx         ← redirect to /admin/books
│   │   ├── books/
│   │   └── settings/
│   └── login/
│       └── page.tsx         ← no auth guard
```

**Step 2: Update — use route group for protected routes**

Create `src/app/admin/(protected)/layout.tsx` instead:

```tsx
// src/app/admin/(protected)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.adminId) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-bold text-gray-900">oxastore admin</span>
          <Link
            href="/admin/books"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Buku
          </Link>
          <Link
            href="/admin/settings"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Pengaturan
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{session.email}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-red-600 hover:text-red-800 cursor-pointer"
            >
              Keluar
            </button>
          </form>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
```

**Step 3: Create redirect page**

```tsx
// src/app/admin/(protected)/page.tsx
import { redirect } from "next/navigation";
export default function AdminPage() {
  redirect("/admin/books");
}
```

**Step 4: Commit**

```bash
git add src/app/admin/
git commit -m "feat: add admin layout with auth guard using route group"
```

---

## Task 11: Admin Login Page

**Files:**
- Create: `src/app/admin/login/page.tsx`

**Step 1: Create login page**

```tsx
// src/app/admin/login/page.tsx
"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
        <p className="text-sm text-gray-500 mb-6">oxastore</p>

        <form action={action} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Masuk..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Note on `useActionState`:** This is React 19's hook for Server Actions. Import from `"react"`, not `"react-dom"`.

**Step 2: Commit**

```bash
git add src/app/admin/login/
git commit -m "feat: add admin login page"
```

---

## Task 12: Admin Books List Page

**Files:**
- Create: `src/app/admin/(protected)/books/page.tsx`

**Step 1: Create books list**

```tsx
// src/app/admin/(protected)/books/page.tsx
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase";
import { deleteBookAction } from "@/actions/books";

export default async function AdminBooksPage() {
  const supabase = createSupabaseClient();
  const { data: books } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Buku</h1>
        <Link
          href="/admin/books/new"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800"
        >
          + Tambah Buku
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Cover</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Judul</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Penulis</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Harga</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {books?.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-10 h-14 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-gray-100 rounded" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {book.title}
                </td>
                <td className="px-4 py-3 text-gray-600">{book.author}</td>
                <td className="px-4 py-3 text-gray-600">{book.category}</td>
                <td className="px-4 py-3 text-gray-600">
                  ${Number(book.price).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/books/${book.id}/edit`}
                      className="text-orange-600 hover:text-orange-800 font-medium"
                    >
                      Edit
                    </Link>
                    <form
                      action={deleteBookAction.bind(null, book.id)}
                    >
                      <button
                        type="submit"
                        className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                        onClick={(e) => {
                          if (!confirm(`Hapus "${book.title}"?`)) e.preventDefault();
                        }}
                      >
                        Hapus
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(!books || books.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Belum ada buku. Tambah buku pertama.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/admin/\(protected\)/books/page.tsx
git commit -m "feat: add admin books list page"
```

---

## Task 13: Book Form Component

**Files:**
- Create: `src/components/admin/BookForm.tsx`

This reusable form is shared by both create and edit pages.

**Step 1: Create BookForm component**

```tsx
// src/components/admin/BookForm.tsx
"use client";

import { useActionState } from "react";
import { ActionResult } from "@/actions/books";

interface BookFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  defaultValues?: {
    title?: string;
    author?: string;
    price?: number;
    year?: number;
    category?: string;
    is_bestseller?: boolean;
    discount?: number | null;
    cover_image?: string | null;
  };
  submitLabel?: string;
}

export default function BookForm({
  action,
  defaultValues = {},
  submitLabel = "Simpan",
}: BookFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Judul <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          required
          defaultValue={defaultValues.title}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Penulis <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="author"
          required
          defaultValue={defaultValues.author}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Harga (USD) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            step="0.01"
            min="0"
            required
            defaultValue={defaultValues.price}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tahun <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="year"
            required
            defaultValue={defaultValues.year}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kategori <span className="text-red-500">*</span>
        </label>
        <select
          name="category"
          defaultValue={defaultValues.category ?? "popular"}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="popular">Popular</option>
          <option value="new">New</option>
          <option value="upcoming">Upcoming</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Diskon (%)
        </label>
        <input
          type="number"
          name="discount"
          min="0"
          max="100"
          defaultValue={defaultValues.discount ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="is_bestseller"
            defaultChecked={defaultValues.is_bestseller}
            className="rounded"
          />
          Best Seller
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cover Buku
        </label>
        {defaultValues.cover_image && (
          <img
            src={defaultValues.cover_image}
            alt="Cover saat ini"
            className="w-20 h-28 object-cover rounded mb-2"
          />
        )}
        <input
          type="file"
          name="cover_image"
          accept="image/*"
          className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
        {defaultValues.cover_image && (
          <p className="text-xs text-gray-400 mt-1">
            Biarkan kosong untuk mempertahankan cover saat ini.
          </p>
        )}
      </div>

      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
        >
          {pending ? "Menyimpan..." : submitLabel}
        </button>
        <a
          href="/admin/books"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Batal
        </a>
      </div>
    </form>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/admin/BookForm.tsx
git commit -m "feat: add reusable BookForm component"
```

---

## Task 14: Admin Create Book Page

**Files:**
- Create: `src/app/admin/(protected)/books/new/page.tsx`

**Step 1: Create page**

```tsx
// src/app/admin/(protected)/books/new/page.tsx
import BookForm from "@/components/admin/BookForm";
import { createBookAction } from "@/actions/books";

export default function NewBookPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Buku</h1>
      <BookForm action={createBookAction} submitLabel="Tambah Buku" />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/admin/\(protected\)/books/new/
git commit -m "feat: add create book page"
```

---

## Task 15: Admin Edit Book Page

**Files:**
- Create: `src/app/admin/(protected)/books/[id]/edit/page.tsx`

**Step 1: Create edit page**

```tsx
// src/app/admin/(protected)/books/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import BookForm from "@/components/admin/BookForm";
import { updateBookAction } from "@/actions/books";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseClient();
  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .single();

  if (!book) notFound();

  const action = updateBookAction.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Buku</h1>
      <BookForm
        action={action}
        defaultValues={{
          title: book.title,
          author: book.author,
          price: book.price,
          year: book.year,
          category: book.category,
          is_bestseller: book.is_bestseller,
          discount: book.discount,
          cover_image: book.cover_image,
        }}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/admin/\(protected\)/books/
git commit -m "feat: add edit book page"
```

---

## Task 16: Admin Settings (Change Password) Page

**Files:**
- Create: `src/app/admin/(protected)/settings/page.tsx`

**Step 1: Create settings page**

```tsx
// src/app/admin/(protected)/settings/page.tsx
"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/actions/auth";

export default function SettingsPage() {
  const [state, action, pending] = useActionState(
    changePasswordAction,
    undefined
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Ganti Password
        </h2>

        <form action={action} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Saat Ini
            </label>
            <input
              type="password"
              name="currentPassword"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Baru
            </label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-400 mt-1">Minimal 8 karakter.</p>
          </div>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          {state && !state.error && (
            <p className="text-sm text-green-600">Password berhasil diubah.</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Menyimpan..." : "Simpan Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/admin/\(protected\)/settings/
git commit -m "feat: add admin change password settings page"
```

---

## Task 17: Migrate Storefront to Supabase

**Files:**
- Modify: `src/data/books.ts`
- Modify: `src/app/books/page.tsx`

**Step 1: Refactor `src/data/books.ts`**

Replace static array with Supabase queries:

```ts
// src/data/books.ts
import { createSupabaseClient } from "@/lib/supabase";
import { Book, Category } from "@/types";

function mapRow(row: Record<string, unknown>): Book {
  return {
    id: row.id as string,
    title: row.title as string,
    author: row.author as string,
    price: Number(row.price),
    year: row.year as number,
    coverImage: (row.cover_image as string) ?? "",
    category: row.category as Category,
    isBestSeller: row.is_bestseller as boolean,
    discount: row.discount as number | undefined,
  };
}

export async function getBooks(): Promise<Book[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase.from("books").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(mapRow);
}

export async function getBooksByCategory(category: Category): Promise<Book[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase.from("books").select("*").eq("category", category);
  return (data ?? []).map(mapRow);
}

export async function getBestSellers(): Promise<Book[]> {
  const supabase = createSupabaseClient();
  const { data } = await supabase.from("books").select("*").eq("is_bestseller", true);
  return (data ?? []).map(mapRow);
}

export async function getBookById(id: string): Promise<Book | undefined> {
  const supabase = createSupabaseClient();
  const { data } = await supabase.from("books").select("*").eq("id", id).single();
  return data ? mapRow(data) : undefined;
}
```

**Step 2: Update `src/app/books/page.tsx`**

The page must become a Server Component (remove `"use client"`) since `getBooks()` is now async and server-only. Move filtering server-side:

```tsx
// src/app/books/page.tsx
import { getBooks } from "@/data/books";
import BooksBrowserClient from "@/components/books/BooksBrowserClient";

export default async function BooksPage() {
  const books = await getBooks();
  return <BooksBrowserClient books={books} />;
}
```

**Step 3: Create `src/components/books/BooksBrowserClient.tsx`**

Extract the client-side filtering/search logic into a new Client Component:

```tsx
// src/components/books/BooksBrowserClient.tsx
"use client";

import { useState } from "react";
import { Book, Category } from "@/types";
import BookGrid from "@/components/books/BookGrid";
import SearchBar from "@/components/ui/SearchBar";
import { cn } from "@/lib/utils";

const tabs: { label: string; value: Category | "all" }[] = [
  { label: "Popular", value: "popular" },
  { label: "New", value: "new" },
  { label: "Upcoming", value: "upcoming" },
];

export default function BooksBrowserClient({ books }: { books: Book[] }) {
  const [activeTab, setActiveTab] = useState<Category | "all">("popular");
  const [search, setSearch] = useState("");

  const filteredBooks = books.filter((book) => {
    const matchesTab = activeTab === "all" || book.category === activeTab;
    const matchesSearch =
      search === "" ||
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Books</h1>
          <div className="flex items-center gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "text-sm font-medium pb-1 border-b-2 transition-colors cursor-pointer",
                  activeTab === tab.value
                    ? "border-orange-500 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <SearchBar
          placeholder="Search Your Favorite books"
          value={search}
          onChange={setSearch}
          className="w-full md:w-80"
        />
      </div>
      <BookGrid books={filteredBooks} />
    </div>
  );
}
```

**Step 4: Check other usages of data functions**

Check if `getBestSellers()` or `getBooks()` are used elsewhere:

```bash
grep -r "getBestSellers\|getBooks\|getBookById\|getBooksByCategory" src/ --include="*.tsx" --include="*.ts"
```

Update any callers to `await` the now-async functions and ensure they're in Server Components.

**Step 5: Commit**

```bash
git add src/data/books.ts src/app/books/page.tsx src/components/books/BooksBrowserClient.tsx
git commit -m "feat: migrate storefront data layer from static array to Supabase"
```

---

## Task 18: Seed Books Data (Optional)

If you want to pre-populate books from the old dummy data:

**Step 1: Run SQL in Supabase SQL Editor**

```sql
insert into books (title, author, price, year, cover_image, category, is_bestseller, discount) values
('The Great Gatsby', 'F. Scott Fitzgerald', 15.00, 1925, null, 'popular', false, null),
('1984', 'George Orwell', 12.00, 1949, null, 'popular', false, null),
('Brave New World', 'Aldous Huxley', 14.50, 1932, null, 'popular', true, 20),
('The Alchemist', 'Paulo Coelho', 12.99, 1988, null, 'popular', true, null),
('Animal Farm', 'George Orwell', 10.00, 1945, null, 'popular', true, null),
('Crime and Punishment', 'Fyodor Dostoevsky', 16.20, 1866, null, 'popular', true, null),
('The 48 Laws of Power', 'Robert Greene', 18.99, 1998, null, 'popular', false, null),
('Educated', 'Tara Westover', 14.99, 2018, null, 'new', false, null),
('The Subtle Art of Not Giving a F*ck', 'Mark Manson', 13.50, 2016, null, 'popular', false, null),
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 17.00, 2011, null, 'popular', false, null),
('It Ends with Us', 'Colleen Hoover', 11.99, 1998, null, 'new', false, null),
('The Midnight Library', 'Matt Haig', 13.99, 2020, null, 'new', false, null),
('Atomic Habits', 'James Clear', 15.99, 2018, null, 'new', false, null),
('Ikigai', 'Hector Garcia', 12.50, 2018, null, 'upcoming', false, null);
```

---

## Task 19: Smoke Test

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Test auth flow**

1. Go to `http://localhost:3000/admin` — should redirect to `/admin/login`
2. Login with seeded admin credentials
3. Should redirect to `/admin/books`
4. Click Keluar — should redirect to `/admin/login`

**Step 3: Test CRUD**

1. Click "+ Tambah Buku", fill form, upload a cover image, submit
2. Verify book appears in list
3. Click Edit, change title, submit — verify update
4. Click Hapus, confirm — verify deletion

**Step 4: Test change password**

1. Go to Pengaturan
2. Enter wrong current password — verify error message
3. Enter correct current password + new password — verify success message

**Step 5: Test storefront**

1. Go to `http://localhost:3000/books`
2. Verify books from Supabase appear (if seeded)
3. Verify search and category filter still work

---

## Final Commit

```bash
git add -A
git commit -m "feat: complete admin panel with Supabase backend"
```
