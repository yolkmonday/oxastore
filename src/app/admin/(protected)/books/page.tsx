import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabase";
import DeleteBookButton from "@/components/admin/DeleteBookButton";

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
                    <DeleteBookButton id={book.id} title={book.title} />
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
