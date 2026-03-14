import { getBooks } from "@/data/books";
import BooksBrowserClient from "@/components/books/BooksBrowserClient";

export default async function BooksPage() {
  const books = await getBooks();
  return <BooksBrowserClient books={books} />;
}
