import BookForm from "@/components/admin/BookForm";
import { createBookAction } from "@/actions/books";

export default function NewBookPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Buku</h1>
      <BookForm action={createBookAction} submitLabel="Tambah Buku" />
    </div>
  );
}
