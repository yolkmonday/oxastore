"use client";

import Image from "next/image";

interface BookMockupProps {
  coverImage: string;
  spineImage?: string | null;
  title: string;
  pages?: number;
}

function getSpineWidth(pages?: number): number {
  if (!pages || pages <= 0) return 12;
  const w = pages * 0.06;
  return Math.max(8, Math.min(w, 28));
}

export default function BookMockup({ coverImage, spineImage, title, pages }: BookMockupProps) {
  const spineW = getSpineWidth(pages);

  return (
    <div
      className="relative w-[160px] h-[220px] group-hover:scale-105 transition-transform duration-300"
      style={{ perspective: "800px" }}
    >
      {/* Container yang dirotasi */}
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateY(-20deg)",
        }}
      >
        {/* Front cover */}
        <div
          className="absolute inset-0 rounded-r-md overflow-hidden shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            transform: `translateZ(${spineW / 2}px)`,
          }}
        >
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover"
          />
        </div>

        {/* Spine */}
        <div
          className="absolute top-0 left-0 h-full overflow-hidden"
          style={{
            width: `${spineW}px`,
            backfaceVisibility: "hidden",
            transform: `rotateY(90deg) translateZ(0px) translateX(-${spineW / 2}px)`,
            transformOrigin: "left center",
          }}
        >
          {spineImage ? (
            <Image
              src={spineImage}
              alt={`${title} spine`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
        </div>

        {/* Bottom edge (pages) */}
        <div
          className="absolute bottom-0 left-0 w-full"
          style={{
            height: `${spineW}px`,
            backfaceVisibility: "hidden",
            transform: `rotateX(90deg) translateZ(${220 - spineW / 2}px) translateY(${spineW / 2}px)`,
            transformOrigin: "bottom center",
            background: "linear-gradient(to right, #e8e5e0, #f5f2ed, #e8e5e0)",
          }}
        />

        {/* Shadow underneath */}
        <div
          className="absolute -bottom-3 left-2 right-0 h-6 rounded-full opacity-20 blur-md"
          style={{
            background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)",
            transform: `translateZ(${spineW / 2}px)`,
          }}
        />
      </div>
    </div>
  );
}
