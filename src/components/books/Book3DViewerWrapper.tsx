"use client";

import dynamic from "next/dynamic";

const Book3DViewer = dynamic(() => import("@/components/books/Book3DViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-xl bg-gray-100 animate-pulse" />
  ),
});

interface Props {
  frontImage: string;
  backImage: string;
  spineImage: string;
}

export default function Book3DViewerWrapper(props: Props) {
  return <Book3DViewer {...props} />;
}
