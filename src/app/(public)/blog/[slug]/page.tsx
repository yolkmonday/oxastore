import { notFound } from "next/navigation";
import Image from "next/image";
import { getPostBySlug } from "@/data/posts";
import PostContentWrapper from "@/components/blog/PostContentWrapper";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      {post.thumbnail && (
        <div className="relative h-64 w-full rounded-xl overflow-hidden mb-8">
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 mb-3">{post.title}</h1>

      <p className="text-sm text-gray-400 mb-8">
        {new Date(post.published_at ?? post.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {post.content ? (
        <PostContentWrapper html={post.content} />
      ) : (
        <p className="text-gray-400">Konten belum tersedia.</p>
      )}
    </main>
  );
}
