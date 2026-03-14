"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { ActionResult } from "@/actions/books";
import { Category } from "@/types";

interface BookFormProps {
  action: (_prevState: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
  categories: Category[];
  defaultValues?: {
    title?: string;
    author?: string;
    price?: number;
    year?: number;
    category?: string;
    is_bestseller?: boolean;
    discount?: number | null;
    cover_image?: string | null;
    description?: string;
    pages?: number | null;
    language?: string;
    width?: number | null;
    length?: number | null;
    weight?: number | null;
    publisher?: string;
    slug?: string | null;
    tags?: string[];
  };
  submitLabel?: string;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function BookForm({
  action,
  categories,
  defaultValues = {},
  submitLabel = "Simpan",
}: BookFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [slugValue, setSlugValue] = useState(defaultValues.slug ?? "");
  const [titleValue, setTitleValue] = useState(defaultValues.title ?? "");

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    setTitleValue(newTitle);
    if (!slugValue || slugValue === slugify(titleValue)) {
      setSlugValue(slugify(newTitle));
    }
  }

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
          value={titleValue}
          onChange={handleTitleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slug URL
          <span className="text-gray-400 font-normal ml-1">(opsional, auto-generate dari judul)</span>
        </label>
        <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500">
          <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-300">/books/</span>
          <input
            type="text"
            name="slug"
            value={slugValue}
            onChange={(e) => setSlugValue(e.target.value)}
            placeholder="judul-buku-anda"
            className="flex-1 px-3 py-2 text-sm focus:outline-none"
          />
        </div>
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
            Harga (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            step="1"
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
          defaultValue={defaultValues.category ?? ""}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="" disabled>Pilih kategori...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
          <span className="text-gray-400 font-normal ml-1">(pisahkan dengan koma)</span>
        </label>
        <input
          type="text"
          name="tags"
          defaultValue={defaultValues.tags?.join(", ") ?? ""}
          placeholder="fiksi, novel, bestseller"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Penerbit
        </label>
        <input
          type="text"
          name="publisher"
          defaultValue={defaultValues.publisher ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bahasa
        </label>
        <input
          type="text"
          name="language"
          defaultValue={defaultValues.language ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Jumlah Halaman
        </label>
        <input
          type="number"
          name="pages"
          min="1"
          defaultValue={defaultValues.pages ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Panjang (cm)
          </label>
          <input
            type="number"
            name="length"
            step="0.1"
            min="0"
            defaultValue={defaultValues.length ?? ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lebar (cm)
          </label>
          <input
            type="number"
            name="width"
            step="0.1"
            min="0"
            defaultValue={defaultValues.width ?? ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Berat (gram)
          </label>
          <input
            type="number"
            name="weight"
            step="0.1"
            min="0"
            defaultValue={defaultValues.weight ?? ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deskripsi
        </label>
        <textarea
          name="description"
          rows={4}
          defaultValue={defaultValues.description ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
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
