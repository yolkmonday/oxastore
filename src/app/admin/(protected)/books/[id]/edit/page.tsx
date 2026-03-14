import { notFound } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import BookForm from "@/components/admin/BookForm";
import { updateBookAction } from "@/actions/books";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseClient();

  const [{ data: book }, { data: categories }] = await Promise.all([
    supabase.from("books").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("created_at", { ascending: true }),
  ]);

  if (!book) notFound();

  const action = updateBookAction.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Buku</h1>
      <BookForm
        action={action}
        categories={categories ?? []}
        defaultValues={{
          title: book.title,
          author: book.author,
          price: book.price,
          year: book.year,
          category: book.category,
          is_bestseller: book.is_bestseller,
          discount: book.discount,
          cover_image: book.cover_image,
          description: book.description,
          pages: book.pages,
          language: book.language,
          width: book.width,
          length: book.length,
          weight: book.weight,
          publisher: book.publisher,
          slug: book.slug,
          tags: book.tags ?? [],
          marketplaceLinks: book.marketplace_links ?? [],
        }}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
