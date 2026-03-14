"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

export default function HomeSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/books?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-5 py-3 shadow-sm focus-within:ring-2 focus-within:ring-brand-300 focus-within:border-brand-300 transition-all">
        <Icon icon="mdi:magnify" className="text-gray-400 text-xl flex-shrink-0" />
        <input
          type="text"
          placeholder="Cari judul atau penulis..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
        />
        <button
          type="submit"
          className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors cursor-pointer flex-shrink-0"
        >
          Cari
        </button>
      </div>
    </form>
  );
}
