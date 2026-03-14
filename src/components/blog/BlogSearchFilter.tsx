"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Tag } from "@/types";
import { Icon } from "@iconify/react";

interface Props {
  tags: Tag[];
  currentQ: string;
  currentTag: string;
}

export default function BlogSearchFilter({ tags, currentQ, currentTag }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  function navigate(q: string, tag: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    router.push(`/blog?${params.toString()}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(inputRef.current?.value ?? "", currentTag);
  }

  function handleTagClick(tagSlug: string) {
    const q = searchParams.get("q") ?? "";
    navigate(q, tagSlug === currentTag ? "" : tagSlug);
  }

  return (
    <div className="mb-8 flex flex-col gap-4">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Icon
            icon="mdi:magnify"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
          />
          <input
            ref={inputRef}
            type="text"
            defaultValue={currentQ}
            placeholder="Cari artikel..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors"
        >
          Cari
        </button>
      </form>

      {/* Tag pills */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTagClick("")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !currentTag
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Semua
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.slug)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                currentTag === tag.slug
                  ? "bg-brand-500 text-white"
                  : "bg-brand-50 text-brand-600 hover:bg-brand-100"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
