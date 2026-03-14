import PostForm from "@/components/admin/PostForm";
import { createPostAction } from "@/actions/posts";
import { getAllTagsAdmin } from "@/data/tags";

export default async function NewBlogPostPage() {
  const allTags = await getAllTagsAdmin();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat Post Baru</h1>
      <PostForm action={createPostAction} submitLabel="Publikasikan" allTags={allTags} />
    </div>
  );
}
