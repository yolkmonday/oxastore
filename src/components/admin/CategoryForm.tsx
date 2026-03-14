"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { ActionResult } from "@/actions/categories";

interface CategoryFormProps {
  action: (_prevState: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
  defaultValues?: { name?: string; slug?: string };
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

export default function CategoryForm({
  action,
  defaultValues = {},
  submitLabel = "Simpan",
}: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [slugValue, setSlugValue] = useState(defaultValues.slug ?? "");
  const [nameValue, setNameValue] = useState(defaultValues.name ?? "");

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newName = e.target.value;
    setNameValue(newName);
    if (!slugValue || slugValue === slugify(nameValue)) {
      setSlugValue(slugify(newName));
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Kategori <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          value={nameValue}
          onChange={handleNameChange}
          placeholder="Contoh: Fiksi Ilmiah"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slug <span className="text-red-500">*</span>
          <span className="text-gray-400 font-normal ml-1">(digunakan di URL)</span>
        </label>
        <input
          type="text"
          name="slug"
          required
          value={slugValue}
          onChange={(e) => setSlugValue(e.target.value)}
          placeholder="fiksi-ilmiah"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <p className="text-xs text-gray-400 mt-1">Hanya huruf kecil, angka, dan tanda hubung (-)</p>
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
          href="/admin/categories"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
