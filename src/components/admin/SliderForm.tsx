"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ActionResult } from "@/actions/books";

interface SliderFormProps {
  action: (_prevState: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
  defaultValues?: {
    title?: string | null;
    subtitle?: string | null;
    image?: string;
    link?: string | null;
    sort_order?: number;
    is_active?: boolean;
  };
  submitLabel?: string;
}

export default function SliderForm({
  action,
  defaultValues = {},
  submitLabel = "Simpan",
}: SliderFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Judul
        </label>
        <input
          type="text"
          name="title"
          defaultValue={defaultValues.title ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subtitle
        </label>
        <input
          type="text"
          name="subtitle"
          defaultValue={defaultValues.subtitle ?? ""}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Link (URL)
        </label>
        <input
          type="text"
          name="link"
          defaultValue={defaultValues.link ?? ""}
          placeholder="/books atau https://..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Urutan
          </label>
          <input
            type="number"
            name="sort_order"
            min="0"
            defaultValue={defaultValues.sort_order ?? 0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={defaultValues.is_active ?? true}
              className="rounded"
            />
            Aktif
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gambar Slider {!defaultValues.image && <span className="text-red-500">*</span>}
        </label>
        {defaultValues.image && (
          <img
            src={defaultValues.image}
            alt="Slider saat ini"
            className="w-full max-w-xs h-32 object-cover rounded mb-2"
          />
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          required={!defaultValues.image}
          className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
        {defaultValues.image && (
          <p className="text-xs text-gray-400 mt-1">
            Biarkan kosong untuk mempertahankan gambar saat ini.
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
          href="/admin/sliders"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
