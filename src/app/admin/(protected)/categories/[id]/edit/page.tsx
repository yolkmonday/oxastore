import { notFound } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import CategoryForm from "@/components/admin/CategoryForm";
import { updateCategoryAction } from "@/actions/categories";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseClient();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (!category) notFound();

  const action = updateCategoryAction.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Kategori</h1>
      <CategoryForm
        action={action}
        defaultValues={{ name: category.name, slug: category.slug }}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
