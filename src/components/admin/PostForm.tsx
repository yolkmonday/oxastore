"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import slugify from "slugify";
import "react-quill-new/dist/quill.snow.css";
import type { ActionResult } from "@/actions/books";
import type { Post } from "@/types";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link", "image"],
    ["clean"],
  ],
};

interface PostFormProps {
  action: (_prevState: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
  defaultValues?: Partial<Post>;
  submitLabel?: string;
}

export default function PostForm({
  action,
  defaultValues = {},
  submitLabel = "Simpan",
}: PostFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [title, setTitle] = useState(defaultValues.title ?? "");
  const [slug, setSlug] = useState(defaultValues.slug ?? "");
  const [slugAuto, setSlugAuto] = useState(!defaultValues.slug);
  const [content, setContent] = useState(defaultValues.content ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    defaultValues.status ?? "draft"
  );

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setTitle(val);
    if (slugAuto) {
      setSlug(slugify(val, { lower: true, strict: true }));
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-2xl">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Judul <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={title}
          onChange={handleTitleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slug <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugAuto(false);
            }}
            required
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="button"
            onClick={() => {
              const generated = slugify(title, { lower: true, strict: true });
              setSlug(generated);
              setSlugAuto(true);
            }}
            className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-2 py-1 whitespace-nowrap"
          >
            Auto
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">URL: /blog/{slug || "..."}</p>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ringkasan
        </label>
        <textarea
          name="excerpt"
          defaultValue={defaultValues.excerpt ?? ""}
          rows={3}
          placeholder="Ringkasan singkat untuk preview..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Thumbnail
        </label>
        {defaultValues.thumbnail && (
          <img
            src={defaultValues.thumbnail}
            alt="Thumbnail saat ini"
            className="w-48 h-28 object-cover rounded mb-2"
          />
        )}
        <input
          type="file"
          name="thumbnail"
          accept="image/*"
          className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
        {defaultValues.thumbnail && (
          <p className="text-xs text-gray-400 mt-1">
            Biarkan kosong untuk mempertahankan thumbnail saat ini.
          </p>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Konten
        </label>
        <input type="hidden" name="content" value={content} />
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={QUILL_MODULES}
            className="min-h-[200px]"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <input type="hidden" name="status" value={status} />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStatus("draft")}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              status === "draft"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Draft
          </button>
          <button
            type="button"
            onClick={() => setStatus("published")}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              status === "published"
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Published
          </button>
        </div>
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
          href="/admin/blog"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
