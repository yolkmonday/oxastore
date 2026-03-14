"use client";

import { deleteSliderAction } from "@/actions/sliders";

export default function DeleteSliderButton({
  id,
  title,
}: {
  id: string;
  title: string | null;
}) {
  return (
    <form
      action={deleteSliderAction.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Hapus slider "${title || "tanpa judul"}"?`)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
      >
        Hapus
      </button>
    </form>
  );
}
