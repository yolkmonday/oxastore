import { createSupabaseClient } from "@/lib/supabase";
import BookForm from "@/components/admin/BookForm";
import { createBookAction } from "@/actions/books";

export default async function NewBookPage() {
  const supabase = createSupabaseClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Buku</h1>
      <BookForm
        action={createBookAction}
        categories={categories ?? []}
        submitLabel="Tambah Buku"
      />
    </div>
  );
}
