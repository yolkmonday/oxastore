import CategoryForm from "@/components/admin/CategoryForm";
import { createCategoryAction } from "@/actions/categories";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Kategori</h1>
      <CategoryForm action={createCategoryAction} submitLabel="Tambah Kategori" />
    </div>
  );
}
