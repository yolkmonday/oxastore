# User Auth, Checkout & Order Management — Design Doc

**Date:** 2026-03-14

---

## Goal

Tambahkan fitur user auth (daftar/login), checkout dengan Midtrans QRIS, history order, profil, dan ganti password. Tambahkan juga view order di admin panel.

## Keputusan Arsitektur

- **Auth:** Supabase Auth (email + password)
- **Payment:** Midtrans Core API, QRIS only
- **Pattern:** Server Actions untuk semua mutasi, kecuali webhook Midtrans (API Route)
- **Checkout data:** Nama + nomor HP + satu alamat pengiriman (diisi saat checkout)

---

## Route Structure

```
src/app/
├── (public)/                  # existing
│   ├── page.tsx
│   ├── books/
│   └── cart/
├── (user)/                    # NEW — requires Supabase Auth session
│   ├── layout.tsx             # redirect ke /masuk jika tidak ada session
│   ├── checkout/
│   │   └── page.tsx           # form pengiriman + QR code Midtrans
│   └── akun/
│       ├── pesanan/
│       │   └── page.tsx       # daftar order + detail
│       ├── profil/
│       │   └── page.tsx       # edit nama, HP, alamat, kota
│       └── password/
│           └── page.tsx       # ganti password
├── masuk/
│   └── page.tsx               # login + register (2 tab, public)
└── admin/
    └── (protected)/
        └── orders/            # NEW — admin order management
            ├── page.tsx       # daftar semua order + filter status
            └── [id]/
                └── page.tsx   # detail order + update status
```

---

## Database Schema

### `profiles` table
```sql
CREATE TABLE profiles (
  id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone     text,
  address   text,
  city      text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can read own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Insert on signup"            ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

### `orders` table
```sql
CREATE TABLE orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status            text NOT NULL DEFAULT 'pending',
    -- 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  total_amount      numeric(12,2) NOT NULL,
  midtrans_order_id text UNIQUE,
  qr_string         text,          -- raw QRIS string dari Midtrans
  shipping_name     text NOT NULL,
  shipping_phone    text NOT NULL,
  shipping_address  text NOT NULL,
  shipping_city     text NOT NULL,
  created_at        timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Admin reads via service role key (bypass RLS)
```

### `order_items` table
```sql
CREATE TABLE order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid REFERENCES orders(id) ON DELETE CASCADE,
  book_id     uuid,            -- referensi loose (buku bisa dihapus)
  book_title  text NOT NULL,   -- snapshot saat order
  book_price  numeric(12,2) NOT NULL,
  quantity    int NOT NULL DEFAULT 1
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can read own order items"
  ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "User can insert own order items"
  ON order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
```

---

## Auth Flow

1. `/masuk` — halaman publik dengan dua tab: **Masuk** dan **Daftar**
2. **Daftar:** `supabase.auth.signUp({ email, password })` → trigger/Server Action buat row di `profiles`
3. **Masuk:** `supabase.auth.signInWithPassword({ email, password })`
4. **Logout:** Server Action memanggil `supabase.auth.signOut()`
5. `(user)/layout.tsx` memanggil `supabase.auth.getUser()`, redirect ke `/masuk` jika null
6. Header menampilkan nama user / avatar jika login, tombol "Masuk" jika belum

### Supabase Client Setup
- `src/lib/supabase/server.ts` — `createServerClient` untuk Server Components & Actions
- `src/lib/supabase/client.ts` — `createBrowserClient` untuk Client Components

---

## Checkout Flow

```
/cart → klik "Lanjut ke Checkout" → /checkout
  ├── Jika belum login → redirect ke /masuk?redirect=/checkout
  └── Jika sudah login:
      Form: nama penerima, nomor HP, alamat lengkap, kota
      Klik "Bayar dengan QRIS"
        → Server Action checkoutAction():
            1. Buat row di orders (status: 'pending')
            2. Buat rows di order_items
            3. POST ke Midtrans Core API /charge:
               { payment_type: 'qris', transaction_details: { order_id, gross_amount } }
            4. Simpan qr_string ke orders
            5. Return qr_string ke client
        → Client render QR code (library: qrcode.react)
        → Polling GET /api/midtrans/status?order_id=xxx tiap 3 detik
        → Jika status = 'settlement' → redirect ke /akun/pesanan
```

### Midtrans Webhook
`POST /api/midtrans/webhook` (API Route):
1. Verifikasi signature: `SHA512(order_id + status_code + gross_amount + server_key)`
2. Update `orders.status` berdasarkan `transaction_status`:
   - `settlement` / `capture` → `paid`
   - `cancel` / `expire` / `deny` → `cancelled`

---

## Halaman Akun User

| Route | Deskripsi |
|-------|-----------|
| `/akun/pesanan` | Daftar order diurutkan terbaru. Setiap order: nomor, tanggal, status badge, total, tombol lihat detail. Detail: daftar item + info pengiriman |
| `/akun/profil` | Form edit: nama lengkap, nomor HP, alamat, kota. Submit via Server Action `updateProfileAction` |
| `/akun/password` | Form: password baru + konfirmasi. Submit via Server Action memanggil `supabase.auth.updateUser({ password })` |

---

## Admin Order Management

### `/admin/orders`
- Tabel: No. Order (truncated UUID), Nama Pembeli, Total, Status badge, Tanggal, Aksi (Lihat)
- Filter dropdown status (Semua / Pending / Paid / Processing / Shipped / Completed / Cancelled)
- Gunakan Supabase **service role key** untuk bypass RLS

### `/admin/orders/[id]`
- Info order lengkap: data pembeli, alamat, daftar item
- Tombol update status:
  ```
  pending → paid → processing → shipped → completed
  (dari mana saja) → cancelled
  ```
- Server Action `updateOrderStatusAction(orderId, newStatus)`

### Sidebar Admin
Tambah item **"Pesanan"** dengan icon `mdi:clipboard-list-outline` di `AdminSidebarNav.tsx`.

---

## Environment Variables yang Dibutuhkan

```env
# Supabase (sudah ada)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # NEW — untuk admin bypass RLS

# Midtrans
MIDTRANS_SERVER_KEY=            # NEW
MIDTRANS_CLIENT_KEY=            # NEW — untuk frontend jika dibutuhkan
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY= # NEW
MIDTRANS_IS_PRODUCTION=false    # NEW — false = sandbox
```

---

## Packages yang Dibutuhkan

```bash
bun add @supabase/ssr @supabase/supabase-js
bun add qrcode.react
bun add midtrans-client  # atau fetch langsung ke Midtrans API
```

> `@supabase/ssr` menyediakan `createServerClient` dan `createBrowserClient` untuk Next.js App Router.
