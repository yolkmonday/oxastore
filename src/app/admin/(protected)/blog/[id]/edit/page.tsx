import { notFound } from "next/navigation";
import PostForm from "@/components/admin/PostForm";
import DeletePostButton from "@/components/admin/DeletePostButton";
import { getPostById } from "@/data/posts";
import { updatePostAction } from "@/actions/posts";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  const boundAction = updatePostAction.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
        <DeletePostButton id={id} />
      </div>
      <PostForm
        action={boundAction}
        defaultValues={post}
        submitLabel="Simpan Perubahan"
      />
    </div>
  );
}
