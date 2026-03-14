# User Auth, Checkout & Order Management — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Tambahkan user auth (Supabase Auth), checkout QRIS (Midtrans Core API), order history, halaman akun, dan admin order management.

**Architecture:** Supabase Auth untuk user session via `@supabase/ssr` + cookie. Server Actions untuk semua mutasi user. Satu API Route untuk Midtrans webhook dan satu untuk polling status.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase Auth + SSR, Midtrans Core API, qrcode.react, zod, Tailwind CSS v4.

---

## Context Penting

- Project: `/Users/yolk/Dev/oxastore`
- Run commands: `bun` (bukan npm/yarn/pnpm)
- Build check: `bun run build`
- Pattern: Server Actions pakai `"use server"` di top file. Client components pakai `"use client"`.
- Supabase existing client di `src/lib/supabase.ts` pakai service role key — itu untuk admin, JANGAN diubah.
- Admin auth pakai `iron-session` (bukan Supabase Auth) — jangan diubah.
- Tailwind brand colors: `brand-500`, `brand-50`, `brand-700` dll (defined di CSS).
- `formatCurrency` ada di `src/lib/utils.ts`.
- `Badge` component ada di `src/components/ui/Badge.tsx`.
- `Button` component ada di `src/components/ui/Button.tsx`.

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json` (via bun)

**Step 1: Install packages**

```bash
cd /Users/yolk/Dev/oxastore
bun add @supabase/ssr qrcode.react
bun add -d @types/qrcode.react
```

> Note: `@supabase/supabase-js` sudah ada. `@supabase/ssr` yang perlu ditambah.
> Note: `qrcode.react` v4+ sudah include TypeScript types, jika `@types/qrcode.react` tidak tersedia, skip.

**Step 2: Verifikasi package.json**

Pastikan `@supabase/ssr` dan `qrcode.react` muncul di `dependencies`.

**Step 3: Tambah env vars ke `.env.local`**

Buka `.env.local` (atau buat jika belum ada), tambahkan:

```env
# Tambahkan baris ini (nilai diisi sesuai dashboard Midtrans)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
```

> `SUPABASE_SERVICE_ROLE_KEY` dan Supabase URL/ANON_KEY harusnya sudah ada.

**Step 4: Commit**

```bash
git add package.json bun.lock
git commit -m "feat: add @supabase/ssr and qrcode.react dependencies"
```

---

## Task 2: Supabase SSR Helpers

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`

> File `src/lib/supabase.ts` (existing, service role) tidak diubah.

**Step 1: Buat `src/lib/supabase/server.ts`**

```ts
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookie write diabaikan
          }
        },
      },
    }
  );
}
```

**Step 2: Buat `src/lib/supabase/client.ts`**

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Step 3: Buat `src/middleware.ts`** (di root `src/`)

Middleware ini memperbarui token Supabase agar tidak expired saat navigasi.

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — penting, jangan dihapus
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Step 4: Commit**

```bash
git add src/lib/supabase/ src/middleware.ts
git commit -m "feat: add Supabase SSR helpers and auth middleware"
```

---

## Task 3: Database Migrations

**Files:**
- Create: `docs/migrations/001_user_auth.sql` (dokumentasi, run manual di Supabase)

**Step 1: Buat file SQL**

```sql
-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  text,
  phone      text,
  address    text,
  city       text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status            text NOT NULL DEFAULT 'pending',
  total_amount      numeric(12,2) NOT NULL,
  midtrans_order_id text UNIQUE,
  qr_string         text,
  shipping_name     text NOT NULL,
  shipping_phone    text NOT NULL,
  shipping_address  text NOT NULL,
  shipping_city     text NOT NULL,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select_own" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- order_items
CREATE TABLE IF NOT EXISTS order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid REFERENCES orders(id) ON DELETE CASCADE,
  book_id     uuid,
  book_title  text NOT NULL,
  book_price  numeric(12,2) NOT NULL,
  quantity    int NOT NULL DEFAULT 1
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_select_own" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_insert_own" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );
```

**Step 2: Jalankan SQL di Supabase Dashboard**

Buka Supabase Dashboard → SQL Editor → paste isi file di atas → Run.

**Step 3: Tambah tipe di `src/types/index.ts`**

Buka file tersebut dan tambahkan di bagian bawah:

```ts
export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  midtrans_order_id: string | null;
  qr_string: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string | null;
  book_title: string;
  book_price: number;
  quantity: number;
}
```

**Step 4: Commit**

```bash
mkdir -p docs/migrations
git add docs/migrations/001_user_auth.sql src/types/index.ts
git commit -m "feat: add DB migration SQL and Order types"
```

---

## Task 4: User Auth Server Actions

**Files:**
- Create: `src/actions/user-auth.ts`

**Step 1: Buat file**

```ts
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthResult {
  error?: string;
}

const registerSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

export async function registerAction(
  _prev: AuthResult | undefined,
  formData: FormData
): Promise<AuthResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

export async function userLoginAction(
  _prev: AuthResult | undefined,
  formData: FormData
): Promise<AuthResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Email atau password salah." };
  }

  const redirectTo = formData.get("redirect") as string | null;
  redirect(redirectTo || "/");
}

export async function userLogoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
```

**Step 2: Commit**

```bash
git add src/actions/user-auth.ts
git commit -m "feat: add user auth server actions (register, login, logout)"
```

---

## Task 5: Halaman /masuk (Login + Register)

**Files:**
- Create: `src/app/masuk/page.tsx`
- Create: `src/components/auth/AuthTabs.tsx`

**Step 1: Buat `src/components/auth/AuthTabs.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { registerAction, userLoginAction } from "@/actions/user-auth";
import Button from "@/components/ui/Button";

export default function AuthTabs({ redirectTo }: { redirectTo?: string }) {
  const [tab, setTab] = useState<"masuk" | "daftar">("masuk");

  const [loginState, loginAction] = useActionState(userLoginAction, undefined);
  const [registerState, registerFormAction] = useActionState(registerAction, undefined);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab("masuk")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "masuk"
              ? "border-b-2 border-brand-500 text-brand-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Masuk
        </button>
        <button
          onClick={() => setTab("daftar")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            tab === "daftar"
              ? "border-b-2 border-brand-500 text-brand-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Daftar
        </button>
      </div>

      {tab === "masuk" ? (
        <form action={loginAction} className="space-y-4">
          {redirectTo && (
            <input type="hidden" name="redirect" value={redirectTo} />
          )}
          {loginState?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {loginState.error}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="email@contoh.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Password"
            />
          </div>
          <Button type="submit" variant="dark" className="w-full" size="lg">
            Masuk
            <Icon icon="mdi:login" className="text-lg" />
          </Button>
        </form>
      ) : (
        <form action={registerFormAction} className="space-y-4">
          {registerState?.error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {registerState.error}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="email@contoh.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Minimal 8 karakter"
            />
          </div>
          <Button type="submit" variant="dark" className="w-full" size="lg">
            Daftar Sekarang
            <Icon icon="mdi:account-plus" className="text-lg" />
          </Button>
        </form>
      )}
    </div>
  );
}
```

**Step 2: Buat `src/app/masuk/page.tsx`**

```tsx
import Link from "next/link";
import Image from "next/image";
import AuthTabs from "@/components/auth/AuthTabs";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function MasukPage({ searchParams }: Props) {
  const { redirect } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/oxa-logo.png"
              alt="OXA Matter"
              height={36}
              width={180}
              className="h-9 w-auto mx-auto"
              priority
            />
          </Link>
          <p className="text-gray-500 text-sm mt-2">
            Masuk atau daftar untuk melanjutkan
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <AuthTabs redirectTo={redirect} />
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/auth/ src/app/masuk/
git commit -m "feat: add /masuk login and register page"
```

---

## Task 6: (user) Route Group — Auth Guard Layout

**Files:**
- Create: `src/app/(user)/layout.tsx`

**Step 1: Buat file**

```tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/masuk");
  }

  return <>{children}</>;
}
```

**Step 2: Commit**

```bash
git add src/app/(user)/layout.tsx
git commit -m "feat: add (user) route group with auth guard"
```

---

## Task 7: Update Header — Tampilkan Status Login

Header saat ini adalah Client Component yang tidak bisa mengecek session Supabase secara langsung. Kita ubah menjadi Server Component untuk bagian auth, dengan memisahkan client interactivity ke komponen terpisah.

**Files:**
- Create: `src/components/layout/UserNav.tsx` (Client Component — dropdown user)
- Modify: `src/components/layout/Header.tsx`

**Step 1: Buat `src/components/layout/UserNav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { userLogoutAction } from "@/actions/user-auth";
import Button from "@/components/ui/Button";

interface UserNavProps {
  email: string;
}

export default function UserNav({ email }: UserNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900"
      >
        <Icon icon="mdi:account-circle" className="text-2xl" />
        <Icon icon="mdi:chevron-down" className="text-base" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1">
            <p className="px-4 py-2 text-xs text-gray-400 truncate border-b border-gray-50">
              {email}
            </p>
            <Link
              href="/akun/pesanan"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <Icon icon="mdi:clipboard-list-outline" />
              Pesanan Saya
            </Link>
            <Link
              href="/akun/profil"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <Icon icon="mdi:account-outline" />
              Profil
            </Link>
            <div className="border-t border-gray-50 mt-1">
              <form action={userLogoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
                >
                  <Icon icon="mdi:logout" />
                  Keluar
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

**Step 2: Ubah `src/components/layout/Header.tsx`**

Header perlu tahu apakah user login. Karena Header ada di `(public)/layout.tsx` (Server Component), kita bisa fetch session di sana dan pass sebagai prop. Tapi Header saat ini adalah Client Component karena pakai `useCart` dan `useState` untuk mobile menu.

Solusi: buat Header menjadi Server Component wrapper yang merender `HeaderClient` untuk bagian interaktif. Cara paling simple: tambahkan `initialUser` prop ke Header.

Buka `src/components/layout/Header.tsx`. Ubah seluruh isinya:

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { useCart } from "@/context/CartContext";
import Badge from "@/components/ui/Badge";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import UserNav from "@/components/layout/UserNav";

interface HeaderProps {
  userEmail?: string | null;
}

export default function Header({ userEmail }: HeaderProps) {
  const { getCartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const count = getCartCount();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/">
          <Image src="/oxa-logo.png" alt="OXA Matter" height={32} width={160} className="h-8 w-auto" priority />
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          <li>
            <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Tentang
            </Link>
          </li>
          <li>
            <Link href="/books" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Buku
            </Link>
          </li>
          <li>
            <Link href="/books?tab=popular" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Populer
            </Link>
          </li>
          <li>
            <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Bantuan
            </Link>
          </li>
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <SearchBar className="w-48" />
          <Link href="/cart" className="relative">
            <Icon icon="mdi:cart-outline" className="text-2xl text-gray-700 hover:text-gray-900" />
            {count > 0 && (
              <Badge variant="cart" className="absolute -top-2 -right-2">
                {count}
              </Badge>
            )}
          </Link>
          {userEmail ? (
            <UserNav email={userEmail} />
          ) : (
            <>
              <Link href="/masuk">
                <Button variant="ghost">Masuk</Button>
              </Link>
              <Link href="/masuk?tab=daftar">
                <Button variant="dark" size="sm">Daftar</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <Icon icon={menuOpen ? "mdi:close" : "mdi:menu"} className="text-2xl text-gray-700" />
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-6 py-4 space-y-4">
          <SearchBar className="w-full" />
          <ul className="space-y-3">
            <li><Link href="#" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>Tentang</Link></li>
            <li><Link href="/books" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>Buku</Link></li>
            <li><Link href="/books?tab=popular" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>Populer</Link></li>
            <li><Link href="#" className="text-sm text-gray-600" onClick={() => setMenuOpen(false)}>Bantuan</Link></li>
          </ul>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative" onClick={() => setMenuOpen(false)}>
              <Icon icon="mdi:cart-outline" className="text-2xl text-gray-700" />
              {count > 0 && (
                <Badge variant="cart" className="absolute -top-2 -right-2">{count}</Badge>
              )}
            </Link>
            {userEmail ? (
              <UserNav email={userEmail} />
            ) : (
              <>
                <Link href="/masuk"><Button variant="ghost">Masuk</Button></Link>
                <Link href="/masuk"><Button variant="dark" size="sm">Daftar</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
```

**Step 3: Update `src/app/(public)/layout.tsx`**

Buka file tersebut. Ubah agar fetch user session dan pass ke Header:

```tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CartProvider from "@/context/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <CartProvider>
      <Header userEmail={user?.email} />
      <main>{children}</main>
      <Footer />
    </CartProvider>
  );
}
```

**Step 4: Commit**

```bash
git add src/components/layout/UserNav.tsx src/components/layout/Header.tsx src/app/(public)/layout.tsx
git commit -m "feat: update Header to show user auth state with dropdown"
```

---

## Task 8: Halaman /akun/profil

**Files:**
- Create: `src/actions/profile.ts`
- Create: `src/app/(user)/akun/profil/page.tsx`
- Create: `src/components/user/ProfileForm.tsx`

**Step 1: Buat `src/actions/profile.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ProfileResult {
  error?: string;
  success?: boolean;
}

const profileSchema = z.object({
  full_name: z.string().min(1, "Nama wajib diisi."),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

export async function updateProfileAction(
  _prev: ProfileResult | undefined,
  formData: FormData
): Promise<ProfileResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi." };

  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...parsed.data });

  if (error) return { error: "Gagal menyimpan profil." };

  revalidatePath("/akun/profil");
  return { success: true };
}
```

**Step 2: Buat `src/components/user/ProfileForm.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { Icon } from "@iconify/react";
import { updateProfileAction } from "@/actions/profile";
import { Profile } from "@/types";
import Button from "@/components/ui/Button";

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, action] = useActionState(updateProfileAction, undefined);

  return (
    <form action={action} className="space-y-4 max-w-lg">
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          Profil berhasil disimpan.
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
        <input
          type="text"
          name="full_name"
          defaultValue={profile?.full_name ?? ""}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
        <input
          type="tel"
          name="phone"
          defaultValue={profile?.phone ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="08xxxxxxxxxx"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
        <textarea
          name="address"
          defaultValue={profile?.address ?? ""}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          placeholder="Jl. Contoh No. 1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
        <input
          type="text"
          name="city"
          defaultValue={profile?.city ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Jakarta"
        />
      </div>
      <Button type="submit" variant="dark">
        Simpan Perubahan
        <Icon icon="mdi:content-save-outline" />
      </Button>
    </form>
  );
}
```

**Step 3: Buat `src/app/(user)/akun/profil/page.tsx`**

```tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/user/ProfileForm";
import { Profile } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profil Saya</h1>
      <ProfileForm profile={profile as Profile | null} />
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/actions/profile.ts src/components/user/ProfileForm.tsx src/app/(user)/akun/profil/
git commit -m "feat: add profile page with edit form"
```

---

## Task 9: Halaman /akun/password

**Files:**
- Create: `src/actions/user-password.ts`
- Create: `src/app/(user)/akun/password/page.tsx`
- Create: `src/components/user/ChangePasswordForm.tsx`

**Step 1: Buat `src/actions/user-password.ts`**

```ts
"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface PasswordResult {
  error?: string;
  success?: boolean;
}

const schema = z
  .object({
    password: z.string().min(8, "Password minimal 8 karakter."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirm"],
  });

export async function changeUserPasswordAction(
  _prev: PasswordResult | undefined,
  formData: FormData
): Promise<PasswordResult> {
  const parsed = schema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { error: "Gagal mengubah password." };

  return { success: true };
}
```

**Step 2: Buat `src/components/user/ChangePasswordForm.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { Icon } from "@iconify/react";
import { changeUserPasswordAction } from "@/actions/user-password";
import Button from "@/components/ui/Button";

export default function ChangePasswordForm() {
  const [state, action] = useActionState(changeUserPasswordAction, undefined);

  return (
    <form action={action} className="space-y-4 max-w-lg">
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          Password berhasil diubah.
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Minimal 8 karakter"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
        <input
          type="password"
          name="confirm"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Ulangi password baru"
        />
      </div>
      <Button type="submit" variant="dark">
        Ubah Password
        <Icon icon="mdi:lock-reset" />
      </Button>
    </form>
  );
}
```

**Step 3: Buat `src/app/(user)/akun/password/page.tsx`**

```tsx
import ChangePasswordForm from "@/components/user/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default function PasswordPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ubah Password</h1>
      <ChangePasswordForm />
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/actions/user-password.ts src/components/user/ChangePasswordForm.tsx src/app/(user)/akun/password/
git commit -m "feat: add change password page for users"
```

---

## Task 10: CartSummary — Wire Checkout Button

**Files:**
- Modify: `src/components/cart/CartSummary.tsx`

**Step 1: Buka `src/components/cart/CartSummary.tsx`**

Ganti baris tombol "Checkout Sekarang" (sekitar baris 41-44) dari `<Button>` statis menjadi `<Link>`:

```tsx
// Tambahkan import di bagian atas:
import Link from "next/link";

// Ganti:
<Button variant="dark" className="w-full" size="lg">
  Checkout Sekarang
  <Icon icon="mdi:arrow-right" className="text-lg" />
</Button>

// Menjadi:
<Link href="/checkout">
  <Button variant="dark" className="w-full" size="lg">
    Checkout Sekarang
    <Icon icon="mdi:arrow-right" className="text-lg" />
  </Button>
</Link>
```

**Step 2: Commit**

```bash
git add src/components/cart/CartSummary.tsx
git commit -m "feat: wire cart checkout button to /checkout page"
```

---

## Task 11: Checkout Action + Midtrans QRIS

**Files:**
- Create: `src/actions/checkout.ts`

**Step 1: Buat `src/actions/checkout.ts`**

```ts
"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CartItem } from "@/types";

export interface CheckoutResult {
  error?: string;
  orderId?: string;
  qrString?: string;
}

const checkoutSchema = z.object({
  shipping_name: z.string().min(1, "Nama penerima wajib diisi."),
  shipping_phone: z.string().min(1, "Nomor HP wajib diisi."),
  shipping_address: z.string().min(1, "Alamat wajib diisi."),
  shipping_city: z.string().min(1, "Kota wajib diisi."),
});

export async function checkoutAction(
  items: CartItem[],
  _prev: CheckoutResult | undefined,
  formData: FormData
): Promise<CheckoutResult> {
  if (!items || items.length === 0) {
    return { error: "Keranjang belanja kosong." };
  }

  const parsed = checkoutSchema.safeParse({
    shipping_name: formData.get("shipping_name"),
    shipping_phone: formData.get("shipping_phone"),
    shipping_address: formData.get("shipping_address"),
    shipping_city: formData.get("shipping_city"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  // Hitung total (harga setelah diskon)
  const totalAmount = items.reduce((sum, item) => {
    const price = item.book.discount
      ? item.book.price * (1 - item.book.discount / 100)
      : item.book.price;
    return sum + price * item.quantity;
  }, 0);

  // Buat order di DB
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      total_amount: Math.round(totalAmount),
      ...parsed.data,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: "Gagal membuat order." };
  }

  // Buat order_items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    book_id: item.book.id,
    book_title: item.book.title,
    book_price: item.book.discount
      ? item.book.price * (1 - item.book.discount / 100)
      : item.book.price,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    return { error: "Gagal menyimpan item order." };
  }

  // Charge ke Midtrans Core API
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  const baseUrl = isProduction
    ? "https://api.midtrans.com/v2/charge"
    : "https://api.sandbox.midtrans.com/v2/charge";

  const midtransPayload = {
    payment_type: "qris",
    transaction_details: {
      order_id: order.id,
      gross_amount: Math.round(totalAmount),
    },
  };

  const midtransRes = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(serverKey + ":").toString("base64")}`,
    },
    body: JSON.stringify(midtransPayload),
  });

  if (!midtransRes.ok) {
    return { error: "Gagal menghubungi payment gateway." };
  }

  const midtransData = await midtransRes.json();
  const qrString: string = midtransData.qr_string ?? midtransData.actions?.find(
    (a: { name: string; url: string }) => a.name === "generate-qr-code"
  )?.url ?? "";

  // Simpan midtrans_order_id dan qr_string
  await supabase
    .from("orders")
    .update({
      midtrans_order_id: midtransData.transaction_id ?? order.id,
      qr_string: qrString,
    })
    .eq("id", order.id);

  return { orderId: order.id, qrString };
}
```

**Step 2: Commit**

```bash
git add src/actions/checkout.ts
git commit -m "feat: add checkout server action with Midtrans QRIS integration"
```

---

## Task 12: Halaman /checkout

**Files:**
- Create: `src/app/(user)/checkout/page.tsx`
- Create: `src/components/checkout/CheckoutForm.tsx`
- Create: `src/components/checkout/QRCodeDisplay.tsx`

**Step 1: Buat `src/components/checkout/QRCodeDisplay.tsx`**

```tsx
"use client";

import { useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface QRCodeDisplayProps {
  orderId: string;
  qrString: string;
  total: number;
}

export default function QRCodeDisplay({ orderId, qrString, total }: QRCodeDisplayProps) {
  const router = useRouter();

  const checkStatus = useCallback(async () => {
    const res = await fetch(`/api/midtrans/status?order_id=${orderId}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.status === "paid") {
      router.push("/akun/pesanan");
    }
  }, [orderId, router]);

  useEffect(() => {
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Scan QR Code untuk Bayar</h2>
        <p className="text-sm text-gray-500">Total: <span className="font-semibold text-gray-900">{formatCurrency(total)}</span></p>
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
        <QRCodeSVG value={qrString} size={240} />
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Menunggu pembayaran...
      </div>
      <p className="text-xs text-gray-400 text-center max-w-xs">
        Scan dengan aplikasi QRIS yang didukung (GoPay, OVO, Dana, dll). Halaman akan otomatis berpindah setelah pembayaran berhasil.
      </p>
    </div>
  );
}
```

**Step 2: Buat `src/components/checkout/CheckoutForm.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { Icon } from "@iconify/react";
import { checkoutAction, CheckoutResult } from "@/actions/checkout";
import { CartItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/ui/Button";
import QRCodeDisplay from "./QRCodeDisplay";

interface CheckoutFormProps {
  items: CartItem[];
  total: number;
}

export default function CheckoutForm({ items, total }: CheckoutFormProps) {
  const boundAction = checkoutAction.bind(null, items);
  const [state, action] = useActionState<CheckoutResult | undefined, FormData>(
    boundAction,
    undefined
  );

  if (state?.qrString && state?.orderId) {
    return (
      <QRCodeDisplay
        orderId={state.orderId}
        qrString={state.qrString}
        total={total}
      />
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {state.error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penerima</label>
        <input
          type="text"
          name="shipping_name"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Nama lengkap penerima"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
        <input
          type="tel"
          name="shipping_phone"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="08xxxxxxxxxx"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman</label>
        <textarea
          name="shipping_address"
          required
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          placeholder="Jl. Contoh No. 1, RT/RW, Kelurahan, Kecamatan"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
        <input
          type="text"
          name="shipping_city"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Jakarta"
        />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold text-gray-900">Total Pembayaran</span>
          <span className="text-xl font-bold text-brand-600">{formatCurrency(total)}</span>
        </div>
        <Button type="submit" variant="dark" className="w-full" size="lg">
          Bayar dengan QRIS
          <Icon icon="mdi:qrcode" className="text-xl" />
        </Button>
      </div>
    </form>
  );
}
```

**Step 3: Buat `src/app/(user)/checkout/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const dynamic = "force-dynamic";

// Checkout page renders cart items from client state.
// Since cart is in localStorage, we need a client-aware wrapper.
// We use a simple approach: Server page with client CheckoutForm that reads cart.
export default function CheckoutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <Icon icon="mdi:arrow-left" className="text-base" />
        Kembali ke Keranjang
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <CheckoutClientWrapper />
    </div>
  );
}

// Import dynamically to access CartContext
import CheckoutClientWrapper from "@/components/checkout/CheckoutClientWrapper";
```

> **CATATAN:** Karena `cart` ada di React Context (client-side), kita perlu wrapper client component. Lanjut ke step berikutnya.

**Step 4: Ubah `src/app/(user)/checkout/page.tsx`** (versi final yang benar)

Hapus file sebelumnya dan buat ulang:

```tsx
import Link from "next/link";
import { Icon } from "@iconify/react";
import CheckoutClientWrapper from "@/components/checkout/CheckoutClientWrapper";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <Icon icon="mdi:arrow-left" className="text-base" />
        Kembali ke Keranjang
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
      <CheckoutClientWrapper />
    </div>
  );
}
```

**Step 5: Buat `src/components/checkout/CheckoutClientWrapper.tsx`**

```tsx
"use client";

import { useCart } from "@/context/CartContext";
import CheckoutForm from "./CheckoutForm";

export default function CheckoutClientWrapper() {
  const { items, getCartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg font-medium mb-2">Keranjang kosong</p>
        <p className="text-sm">Tambahkan buku terlebih dahulu sebelum checkout.</p>
      </div>
    );
  }

  return <CheckoutForm items={items} total={getCartTotal()} />;
}
```

**Step 6: Commit**

```bash
git add src/app/(user)/checkout/ src/components/checkout/
git commit -m "feat: add checkout page with shipping form and QRIS QR code display"
```

---

## Task 13: Midtrans API Routes

**Files:**
- Create: `src/app/api/midtrans/webhook/route.ts`
- Create: `src/app/api/midtrans/status/route.ts`

**Step 1: Buat `src/app/api/midtrans/webhook/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

// Gunakan service role untuk bypass RLS di webhook
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;

  // Verifikasi signature Midtrans
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const expectedSignature = createHash("sha512")
    .update(order_id + status_code + gross_amount + serverKey)
    .digest("hex");

  if (signature_key !== expectedSignature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
  }

  let newStatus: string | null = null;

  if (transaction_status === "settlement" || transaction_status === "capture") {
    newStatus = "paid";
  } else if (
    transaction_status === "cancel" ||
    transaction_status === "expire" ||
    transaction_status === "deny"
  ) {
    newStatus = "cancelled";
  }

  if (newStatus) {
    const supabase = createAdminClient();
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", order_id);
  }

  return NextResponse.json({ message: "OK" });
}
```

**Step 2: Buat `src/app/api/midtrans/status/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order_id");
  if (!orderId) {
    return NextResponse.json({ error: "order_id required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ status: order.status });
}
```

**Step 3: Commit**

```bash
git add src/app/api/midtrans/
git commit -m "feat: add Midtrans webhook and status polling API routes"
```

---

## Task 14: Halaman /akun/pesanan (Order History)

**Files:**
- Create: `src/app/(user)/akun/pesanan/page.tsx`
- Create: `src/components/user/OrderCard.tsx`

**Step 1: Buat `src/components/user/OrderCard.tsx`**

```tsx
import { Icon } from "@iconify/react";
import { Order, OrderStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  paid: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-purple-50 text-purple-700 border-purple-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function OrderCard({ order }: { order: Order }) {
  const statusLabel = STATUS_LABELS[order.status] ?? order.status;
  const statusColor = STATUS_COLORS[order.status] ?? "";
  const date = new Date(order.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{date}</p>
          <p className="text-sm font-mono text-gray-600">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      {order.order_items && order.order_items.length > 0 && (
        <div className="space-y-1 mb-3 border-t border-gray-50 pt-3">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-gray-700">
              <span className="truncate mr-2">
                {item.book_title}
                {item.quantity > 1 && (
                  <span className="text-gray-400"> x{item.quantity}</span>
                )}
              </span>
              <span className="flex-shrink-0 text-gray-500">
                {formatCurrency(item.book_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-50 pt-3">
        <span className="text-sm text-gray-500">
          <Icon icon="mdi:map-marker-outline" className="inline mr-1" />
          {order.shipping_city}
        </span>
        <span className="font-bold text-gray-900">
          {formatCurrency(order.total_amount)}
        </span>
      </div>
    </div>
  );
}
```

**Step 2: Buat `src/app/(user)/akun/pesanan/page.tsx`**

```tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Order } from "@/types";
import OrderCard from "@/components/user/OrderCard";

export const dynamic = "force-dynamic";

export default async function PesananPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pesanan Saya</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium mb-1">Belum ada pesanan</p>
          <p className="text-sm">Mulai belanja dan pesanan Anda akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(orders as Order[]).map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/user/OrderCard.tsx src/app/(user)/akun/pesanan/
git commit -m "feat: add order history page for users"
```

---

## Task 15: Admin — Daftar Order

**Files:**
- Create: `src/data/orders.ts`
- Create: `src/app/admin/(protected)/orders/page.tsx`
- Create: `src/components/admin/OrderStatusBadge.tsx`

**Step 1: Buat `src/data/orders.ts`**

```ts
import "server-only";
import { createSupabaseClient } from "@/lib/supabase";
import { Order, OrderStatus } from "@/types";

export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  const supabase = createSupabaseClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data } = await query;
  return (data as Order[]) ?? [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  return (data as Order) ?? null;
}
```

**Step 2: Buat `src/components/admin/OrderStatusBadge.tsx`**

```tsx
import { OrderStatus } from "@/types";

const LABELS: Record<OrderStatus, string> = {
  pending: "Menunggu",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${COLORS[status]}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
```

**Step 3: Buat `src/app/admin/(protected)/orders/page.tsx`**

```tsx
import Link from "next/link";
import { getOrders } from "@/data/orders";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@/types";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";

export const dynamic = "force-dynamic";

const ALL_STATUSES: OrderStatus[] = [
  "pending", "paid", "processing", "shipped", "completed", "cancelled",
];

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const activeStatus = ALL_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : undefined;

  const orders = await getOrders(activeStatus);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pesanan</h1>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/orders"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !activeStatus
              ? "bg-brand-500 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Semua
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeStatus === s
                ? "bg-brand-500 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">No. Order</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pembeli</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  Tidak ada pesanan.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-600">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{order.shipping_name}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                    >
                      Lihat
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/data/orders.ts src/components/admin/OrderStatusBadge.tsx src/app/admin/(protected)/orders/page.tsx
git commit -m "feat: add admin orders list page with status filter"
```

---

## Task 16: Admin — Detail Order + Update Status

**Files:**
- Create: `src/actions/orders.ts`
- Create: `src/app/admin/(protected)/orders/[id]/page.tsx`
- Create: `src/components/admin/UpdateOrderStatusForm.tsx`

**Step 1: Buat `src/actions/orders.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { OrderStatus } from "@/types";
import { getSession } from "@/lib/session";

const VALID_STATUSES: OrderStatus[] = [
  "pending", "paid", "processing", "shipped", "completed", "cancelled",
];

export async function updateOrderStatusAction(
  orderId: string,
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session.adminId) redirect("/admin/login");

  const newStatus = formData.get("status") as OrderStatus;
  if (!VALID_STATUSES.includes(newStatus)) {
    return { error: "Status tidak valid." };
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) return { error: "Gagal mengubah status." };

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}
```

**Step 2: Buat `src/components/admin/UpdateOrderStatusForm.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { OrderStatus } from "@/types";
import Button from "@/components/ui/Button";

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["completed", "cancelled"],
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
  action: (prev: { error?: string } | undefined, formData: FormData) => Promise<{ error?: string }>;
}

export default function UpdateOrderStatusForm({ orderId, currentStatus, action }: Props) {
  const [state, formAction] = useActionState(action, undefined);
  const nextStatuses = NEXT_STATUSES[currentStatus] ?? [];

  if (nextStatuses.length === 0) return null;

  return (
    <div>
      {state?.error && (
        <p className="text-sm text-red-600 mb-3">{state.error}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <form key={status} action={formAction}>
            <input type="hidden" name="status" value={status} />
            <Button
              type="submit"
              variant={status === "cancelled" ? "ghost" : "dark"}
              size="sm"
            >
              Tandai: {STATUS_LABELS[status]}
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}
```

**Step 3: Buat `src/app/admin/(protected)/orders/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { getOrderById } from "@/data/orders";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus } from "@/types";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import UpdateOrderStatusForm from "@/components/admin/UpdateOrderStatusForm";
import { updateOrderStatusAction } from "@/actions/orders";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  const boundAction = updateOrderStatusAction.bind(null, id);

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <Icon icon="mdi:arrow-left" className="text-base" />
        Kembali ke Daftar Pesanan
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Info Pembeli */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Info Pengiriman
          </h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-400 w-20 flex-shrink-0">Nama</dt>
              <dd className="text-gray-900 font-medium">{order.shipping_name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400 w-20 flex-shrink-0">HP</dt>
              <dd className="text-gray-900">{order.shipping_phone}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400 w-20 flex-shrink-0">Alamat</dt>
              <dd className="text-gray-900">{order.shipping_address}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400 w-20 flex-shrink-0">Kota</dt>
              <dd className="text-gray-900">{order.shipping_city}</dd>
            </div>
          </dl>
        </div>

        {/* Info Order */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Info Pembayaran
          </h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-400 w-20 flex-shrink-0">Tanggal</dt>
              <dd className="text-gray-900">
                {new Date(order.created_at).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-400 w-20 flex-shrink-0">Total</dt>
              <dd className="text-gray-900 font-bold">{formatCurrency(order.total_amount)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Item List */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Item Pesanan
        </h2>
        <div className="space-y-2">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-900">{item.book_title}</span>
              <div className="flex items-center gap-4 text-gray-500">
                <span>x{item.quantity}</span>
                <span className="font-semibold text-gray-900 w-24 text-right">
                  {formatCurrency(item.book_price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-3 border-t border-gray-100 mt-2">
          <span className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
        </div>
      </div>

      {/* Update Status */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Update Status
        </h2>
        <UpdateOrderStatusForm
          orderId={id}
          currentStatus={order.status as OrderStatus}
          action={boundAction}
        />
        {["completed", "cancelled"].includes(order.status) && (
          <p className="text-sm text-gray-400">Order ini sudah final.</p>
        )}
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/actions/orders.ts src/components/admin/UpdateOrderStatusForm.tsx src/app/admin/(protected)/orders/
git commit -m "feat: add admin order detail page with status update"
```

---

## Task 17: Update Admin Sidebar

**Files:**
- Modify: `src/components/admin/AdminSidebarNav.tsx`

**Step 1: Buka file dan tambahkan item "Pesanan"**

Temukan array `navItems` (sekitar baris 8) dan tambahkan item baru setelah "Slider":

```ts
const navItems = [
  {
    href: "/admin/books",
    icon: "mdi:book-open-page-variant-outline",
    label: "Buku",
  },
  {
    href: "/admin/categories",
    icon: "mdi:tag-multiple-outline",
    label: "Kategori",
  },
  {
    href: "/admin/sliders",
    icon: "mdi:image-multiple-outline",
    label: "Slider",
  },
  {
    href: "/admin/orders",          // <-- TAMBAHKAN INI
    icon: "mdi:clipboard-list-outline",
    label: "Pesanan",
  },
  {
    href: "/admin/settings",
    icon: "mdi:cog-outline",
    label: "Pengaturan",
  },
];
```

**Step 2: Commit**

```bash
git add src/components/admin/AdminSidebarNav.tsx
git commit -m "feat: add Pesanan nav item to admin sidebar"
```

---

## Task 18: Build Verification

**Step 1: Jalankan build**

```bash
cd /Users/yolk/Dev/oxastore
bun run build
```

**Step 2: Periksa output**

Expected: `✓ Compiled successfully` atau sejenisnya tanpa error TypeScript/build.

Jika ada error:
- TypeScript error → perbaiki type yang salah
- Import error → pastikan semua file sudah dibuat
- `@supabase/ssr` tidak ditemukan → jalankan `bun install` ulang

**Step 3: Commit fix jika ada**

```bash
git add -A
git commit -m "fix: resolve build errors"
```

---

## Checklist Akhir

- [ ] `bun run build` sukses tanpa error
- [ ] `/masuk` — halaman login/register bisa dibuka
- [ ] Login redirect ke `/`
- [ ] Header menampilkan dropdown user setelah login
- [ ] `/checkout` redirect ke `/masuk` jika belum login
- [ ] Admin `/admin/orders` menampilkan daftar order
- [ ] Admin `/admin/orders/[id]` bisa update status
- [ ] Sidebar admin punya item "Pesanan"
