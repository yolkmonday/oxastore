"use client";

import { deleteBookAction } from "@/actions/books";

export default function DeleteBookButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <form
      action={deleteBookAction.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm(`Hapus "${title}"?`)) e.preventDefault();
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
