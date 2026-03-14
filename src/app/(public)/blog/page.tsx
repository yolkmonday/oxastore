import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts } from "@/data/posts";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog</h1>
      <p className="text-gray-500 mb-10">Artikel, tips, dan cerita dari kami.</p>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-center py-20">Belum ada artikel.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {post.thumbnail ? (
                <div className="relative h-48 w-full">
                  <Image
                    src={post.thumbnail}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-300 text-4xl">📝</span>
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <h2 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors mb-2 line-clamp-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                    {post.excerpt}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-auto">
                  {new Date(post.published_at ?? post.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
