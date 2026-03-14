import { getBooks } from "@/data/books";
import { getCategories } from "@/data/categories";
import BooksBrowserClient from "@/components/books/BooksBrowserClient";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const [books, categories] = await Promise.all([getBooks(), getCategories()]);
  return <BooksBrowserClient books={books} categories={categories} />;
}
