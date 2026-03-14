"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { bulkDeleteBooksAction } from "@/actions/books";
import DeleteBookButton from "@/components/admin/DeleteBookButton";

interface BookRow {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  cover_image: string | null;
}

export default function AdminBooksTable({ books }: { books: BookRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const allChecked = books.length > 0 && selected.size === books.length;
  const someChecked = selected.size > 0 && !allChecked;

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(books.map((b) => b.id)));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleBulkDelete() {
    if (!confirm(`Hapus ${selected.size} buku yang dipilih?`)) return;
    startTransition(async () => {
      await bulkDeleteBooksAction(Array.from(selected));
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div>
      {/* Bulk action bar */}
      <div className={`flex items-center gap-3 mb-3 h-9 transition-opacity ${selected.size > 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <span className="text-sm text-gray-600">{selected.size} dipilih</span>
        <button
          onClick={handleBulkDelete}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? "Menghapus..." : "Hapus yang dipilih"}
        </button>
        <button
          onClick={() => setSelected(new Set())}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Batal
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => { if (el) el.indeterminate = someChecked; }}
                  onChange={toggleAll}
                  className="rounded cursor-pointer"
                  aria-label="Pilih semua"
                />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Cover</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Judul</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Penulis</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Harga</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {books.map((book) => (
              <tr
                key={book.id}
                className={`hover:bg-gray-50 ${selected.has(book.id) ? "bg-brand-50" : ""}`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(book.id)}
                    onChange={() => toggle(book.id)}
                    className="rounded cursor-pointer"
                    aria-label={`Pilih ${book.title}`}
                  />
                </td>
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
                <td className="px-4 py-3 font-medium text-gray-900">{book.title}</td>
                <td className="px-4 py-3 text-gray-600">{book.author}</td>
                <td className="px-4 py-3 text-gray-600">{book.category}</td>
                <td className="px-4 py-3 text-gray-600">{formatCurrency(Number(book.price))}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/books/${book.id}/edit`}
                      className="text-brand-600 hover:text-brand-800 font-medium"
                    >
                      Edit
                    </Link>
                    <DeleteBookButton id={book.id} title={book.title} />
                  </div>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
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
