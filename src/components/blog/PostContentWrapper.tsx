"use client";

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
