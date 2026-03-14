import { getBooks } from "@/data/books";
import { getCategories } from "@/data/categories";
import BooksBrowserClient from "@/components/books/BooksBrowserClient";

export const dynamic = "force-dynamic";

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const [books, categories, params] = await Promise.all([
    getBooks(),
    getCategories(),
    searchParams,
  ]);
  return (
    <BooksBrowserClient
      books={books}
      categories={categories}
      initialSearch={params.q ?? ""}
      initialTab={params.tab ?? "all"}
    />
  );
}
