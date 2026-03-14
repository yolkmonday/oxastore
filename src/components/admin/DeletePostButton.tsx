"use client";

import { deletePostAction } from "@/actions/posts";

export default function DeletePostButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!confirm("Hapus post ini? Tindakan tidak bisa dibatalkan.")) return;
    try {
      await deletePostAction(id);
    } catch (err) {
      // Re-throw Next.js redirect/notFound errors so the framework handles navigation
      if (
        err !== null &&
        typeof err === "object" &&
        "digest" in err &&
        typeof (err as { digest: unknown }).digest === "string" &&
        (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
      ) {
        throw err;
      }
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
