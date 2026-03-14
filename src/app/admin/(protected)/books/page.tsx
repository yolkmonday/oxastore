import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase";
import AdminBooksTable from "@/components/admin/AdminBooksTable";

export default async function AdminBooksPage() {
  const supabase = createSupabaseClient();
  const { data: books } = await supabase
    .from("books")
    .select("id, title, author, category, price, cover_image")
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

      <AdminBooksTable books={books ?? []} />
    </div>
  );
}
