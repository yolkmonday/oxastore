"use client";

import { useActionState } from "react";
import Link from "next/link";
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
        <Link
          href="/admin/books"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
