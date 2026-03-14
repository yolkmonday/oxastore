"use client";

import { useState } from "react";
import { Book, Category } from "@/types";
import BookGrid from "@/components/books/BookGrid";
import SearchBar from "@/components/ui/SearchBar";
import { cn } from "@/lib/utils";

export default function BooksBrowserClient({
  books,
  categories,
}: {
  books: Book[];
  categories: Category[];
}) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filteredBooks = books.filter((book) => {
    const matchesTab = activeTab === "all" || book.category === activeTab;
    const matchesSearch =
      search === "" ||
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Buku</h1>
          <div className="flex items-center gap-6 flex-wrap">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "text-sm font-medium pb-1 border-b-2 transition-colors cursor-pointer",
                activeTab === "all"
                  ? "border-orange-500 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              )}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveTab(cat.slug)}
                className={cn(
                  "text-sm font-medium pb-1 border-b-2 transition-colors cursor-pointer",
                  activeTab === cat.slug
                    ? "border-orange-500 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        <SearchBar
          placeholder="Cari buku favorit kamu..."
          value={search}
          onChange={setSearch}
          className="w-full md:w-80"
        />
      </div>
      <BookGrid books={filteredBooks} />
    </div>
  );
}
