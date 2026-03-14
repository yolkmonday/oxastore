import { notFound } from "next/navigation";
import Image from "next/image";
import { getPostBySlug, getRelatedPosts } from "@/data/posts";
import PostContentWrapper from "@/components/blog/PostContentWrapper";
import Breadcrumb from "@/components/blog/Breadcrumb";
import TagPills from "@/components/blog/TagPills";
import ShareButton from "@/components/blog/ShareButton";
import RelatedPosts from "@/components/blog/RelatedPosts";
import { readingTime } from "@/lib/readingTime";
import { Icon } from "@iconify/react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post.id);
  const timeToRead = post.content ? readingTime(post.content) : null;

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />

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

      <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
        <span className="flex items-center gap-1.5">
          <Icon icon="mdi:account-circle" className="text-base" />
          AdminOXA
        </span>
        <span className="flex items-center gap-1.5">
          <Icon icon="mdi:calendar-outline" className="text-base" />
          {new Date(post.published_at ?? post.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        {timeToRead && (
          <span className="flex items-center gap-1.5">
            <Icon icon="mdi:clock-outline" className="text-base" />
            {timeToRead}
          </span>
        )}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="mb-8">
          <TagPills tags={post.tags} />
        </div>
      )}

      {post.content ? (
        <PostContentWrapper html={post.content} />
      ) : (
        <p className="text-gray-400">Konten belum tersedia.</p>
      )}

      <div className="mt-10 pt-6 border-t border-gray-100">
        <ShareButton title={post.title} />
      </div>

      <RelatedPosts posts={relatedPosts} />
    </main>
  );
}
