# Admin Panel & Supabase Backend — Design Doc

**Date:** 2026-03-14
**Status:** Approved

## Overview

Add an admin panel to the oxastore bookstore with Supabase as the backend. Admins can log in, manage books (CRUD), upload cover images, and change their password. The storefront migrates from static dummy data to Supabase.

## Stack Additions

| Package | Purpose |
|---|---|
| `@supabase/supabase-js` | Supabase client (server-side) |
| `iron-session` | Encrypted cookie session management |
| `bcryptjs` + `@types/bcryptjs` | Password hashing |
| `zod` | Server-side input validation |
| `tsx` | Run seeder script |

## Architecture

Next.js Server Actions for all backend operations. No separate API routes. Supabase accessed server-side only using `service_role` key.

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx              ← auth guard (redirect if no session)
│   │   ├── page.tsx                ← redirect to /admin/books
│   │   ├── login/page.tsx          ← login form
│   │   ├── books/
│   │   │   ├── page.tsx            ← book list table
│   │   │   ├── new/page.tsx        ← create book form
│   │   │   └── [id]/edit/page.tsx  ← edit book form
│   │   └── settings/page.tsx       ← change password form
├── actions/
│   ├── auth.ts                     ← loginAction, logoutAction, changePasswordAction
│   └── books.ts                    ← createBookAction, updateBookAction, deleteBookAction
├── lib/
│   ├── supabase.ts                 ← Supabase server client (service_role)
│   ├── session.ts                  ← iron-session config and getSession helper
│   └── password.ts                 ← bcrypt hash/compare helpers
└── scripts/
    └── seed-admin.ts               ← inserts initial admin from .env vars
```

## Database Schema

```sql
-- Admins table (custom auth, no Supabase Auth)
create table admins (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  password   text not null,  -- bcrypt hash
  created_at timestamptz default now()
);

-- Books table (replaces static dummy data)
create table books (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  author        text not null,
  price         numeric(10,2) not null,
  year          int not null,
  cover_image   text,           -- public URL from Supabase Storage
  category      text not null,  -- 'popular' | 'new' | 'upcoming'
  is_bestseller boolean default false,
  discount      int,            -- nullable, percentage
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
```

## Supabase Storage

- Bucket: `book-covers` (public read)
- Upload path: `book-covers/{uuid}.{ext}`
- On book delete: remove file from storage before deleting row

## Auth Flow

### Login
1. Admin submits form at `/admin/login`
2. `loginAction(formData)` queries `admins` table by email
3. `bcrypt.compare()` verifies password
4. On success: set iron-session cookie `{ adminId, email }`, redirect to `/admin/books`
5. On failure: return error message to form

### Auth Guard
- `src/app/admin/layout.tsx` is a Server Component
- Calls `getSession()` on every render
- Redirects to `/admin/login` if no valid session

### Logout
- `logoutAction()` destroys session cookie, redirects to `/admin/login`

### Change Password
1. Admin submits form at `/admin/settings` (current password + new password)
2. `changePasswordAction(formData)` verifies current password with bcrypt
3. Hashes new password, updates `admins` table

## Session Config (iron-session)

```ts
{
  cookieName: "oxastore_admin",
  password: process.env.SESSION_SECRET,  // min 32 chars
  cookieOptions: { secure: process.env.NODE_ENV === "production" }
}
```

## Server Actions

### `src/actions/auth.ts`
- `loginAction(formData: FormData): Promise<ActionResult>`
- `logoutAction(): Promise<void>`
- `changePasswordAction(formData: FormData): Promise<ActionResult>`

### `src/actions/books.ts`
- `getBooksAction(): Promise<Book[]>`
- `getBookByIdAction(id: string): Promise<Book>`
- `createBookAction(formData: FormData): Promise<ActionResult>`
- `updateBookAction(id: string, formData: FormData): Promise<ActionResult>`
- `deleteBookAction(id: string): Promise<ActionResult>`

## Storefront Integration

- `src/data/books.ts` refactored — all functions fetch from Supabase instead of static array
- `Book.id` remains `string` (UUID is compatible)
- Storefront pages become `async` Server Components

## Seeder

`src/scripts/seed-admin.ts` — run once via `npx tsx src/scripts/seed-admin.ts`

Reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env.local`, hashes password, inserts into `admins` table.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_SECRET=                 # random string, min 32 chars
ADMIN_EMAIL=                    # for seeder
ADMIN_PASSWORD=                 # for seeder
```
