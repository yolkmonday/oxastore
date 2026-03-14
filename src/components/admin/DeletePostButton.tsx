"use client";

import { deletePostAction } from "@/actions/posts";

export default function DeletePostButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!confirm("Hapus post ini? Tindakan tidak bisa dibatalkan.")) return;
    try {
      await deletePostAction(id);
    } catch (err) {
      console.error("DeletePostButton error:", err);
      alert("Gagal menghapus post. Silakan coba lagi.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm text-red-600 hover:text-red-700 font-medium"
    >
      Hapus Post
    </button>
  );
}
