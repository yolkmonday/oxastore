"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";

const Book3DViewer = dynamic(() => import("@/components/books/Book3DViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-xl bg-gray-100 animate-pulse" />
  ),
});

interface Props {
  frontImage: string;
  backImage?: string | null;
  spineImage?: string | null;
  pages?: number;
  className?: string;
}

export default function Book3DSection(props: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Inline viewer */}
      <div className="relative">
        <Book3DViewer {...props} />
        <button
          onClick={() => setModalOpen(true)}
          className="absolute bottom-2 right-2 bg-white/80 hover:bg-white border border-gray-200 rounded-lg p-2 text-gray-600 hover:text-gray-900 transition-colors shadow-sm"
          title="Lihat penuh"
        >
          <Icon icon="mdi:fullscreen" className="text-xl" />
        </button>
      </div>

      {/* Fullscreen modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-[90vw] h-[90vh] max-w-[1200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 text-gray-600 hover:text-gray-900 transition-colors shadow-md"
            >
              <Icon icon="mdi:close" className="text-2xl" />
            </button>
            <Book3DViewer
              {...props}
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </>
  );
}
