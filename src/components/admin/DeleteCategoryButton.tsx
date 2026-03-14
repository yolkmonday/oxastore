"use client";

import { deleteCategoryAction } from "@/actions/categories";

export default function DeleteCategoryButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <form
      action={deleteCategoryAction.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Hapus kategori "${name}"?`)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
      >
        Hapus
      </button>
    </form>
  );
}
