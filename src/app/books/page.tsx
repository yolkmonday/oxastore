"use client";

import { useState } from "react";
import { Category } from "@/types";
import { getBooks } from "@/data/books";
import BookGrid from "@/components/books/BookGrid";
import SearchBar from "@/components/ui/SearchBar";
import { cn } from "@/lib/utils";

const tabs: { label: string; value: Category | "all" }[] = [
  { label: "Popular", value: "popular" },
  { label: "New", value: "new" },
  { label: "Upcoming", value: "upcoming" },
];

export default function BooksPage() {
  const [activeTab, setActiveTab] = useState<Category | "all">("popular");
  const [search, setSearch] = useState("");

  const allBooks = getBooks();

  const filteredBooks = allBooks.filter((book) => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Books</h1>
          <div className="flex items-center gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "text-sm font-medium pb-1 border-b-2 transition-colors cursor-pointer",
                  activeTab === tab.value
                    ? "border-orange-500 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <SearchBar
          placeholder="Search Your Favorite books"
          value={search}
          onChange={setSearch}
          className="w-full md:w-80"
        />
      </div>

      <BookGrid books={filteredBooks} />
    </div>
  );
}
