import PostForm from "@/components/admin/PostForm";
import { createPostAction } from "@/actions/posts";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat Post Baru</h1>
      <PostForm action={createPostAction} submitLabel="Publikasikan" />
    </div>
  );
}
