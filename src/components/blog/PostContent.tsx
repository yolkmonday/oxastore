"use client";

import DOMPurify from "dompurify";

interface PostContentProps {
  html: string;
}

export default function PostContent({ html }: PostContentProps) {
  const sanitized = DOMPurify.sanitize(html);

  return (
    <div
      className="prose prose-gray max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
