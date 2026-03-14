"use client";

// PostContentWrapper exists because Next.js 16 + Turbopack rejects dynamic({ ssr: false })
// when called directly from a Server Component. This "use client" wrapper holds the
// dynamic import so DOMPurify (browser-only) never runs during SSR.
// DO NOT remove this wrapper or convert PostContent to a direct import in the detail page.

import dynamic from "next/dynamic";

const PostContent = dynamic(() => import("@/components/blog/PostContent"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-100 rounded h-64" />,
});

interface PostContentWrapperProps {
  html: string;
}

export default function PostContentWrapper({ html }: PostContentWrapperProps) {
  return <PostContent html={html} />;
}
