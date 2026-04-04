"use client";

import Image from "next/image";

interface BookMockupProps {
  coverImage: string;
  backImage?: string | null;
  spineImage?: string | null;
  title: string;
  pages?: number;
}

// Match Three.js pagestoDepth ratio: depth/height = 0.0015/2.8, scaled to 220px
function getSpineWidth(pages?: number): number {
  if (!pages || pages <= 0) return Math.round(0.15 / 2.8 * 220); // ~12px
  const w = pages * 0.0015 / 2.8 * 220;
  return Math.max(Math.round(0.08 / 2.8 * 220), Math.min(Math.round(w), Math.round(0.5 / 2.8 * 220)));
}

function SingleBook({
  image,
  alt,
  spineImage,
  spineW,
  rotateY,
  zIndex,
  offsetX,
}: {
  image: string;
  alt: string;
  spineImage?: string | null;
  spineW: number;
  rotateY: number;
  zIndex: number;
  offsetX: number;
}) {
  const isBack = rotateY > 0;

  return (
    <div
      className="absolute top-0 h-full"
      style={{
        width: "130px",
        left: `${offsetX}px`,
        zIndex,
        perspective: "600px",
      }}
    >
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotateY}deg)`,
        }}
      >
        {/* Face */}
        <div
          className="absolute inset-0 overflow-hidden shadow-xl"
          style={{
            borderRadius: isBack ? "4px 2px 2px 4px" : "2px 4px 4px 2px",
            backfaceVisibility: "hidden",
            transform: `translateZ(${spineW / 2}px)`,
          }}
        >
          <Image
            src={image}
            alt={alt}
            fill
            className="object-cover"
            sizes="130px"
          />
        </div>

        {/* Spine */}
        <div
          className="absolute top-0 h-full overflow-hidden"
          style={{
            width: `${spineW}px`,
            left: isBack ? undefined : 0,
            right: isBack ? 0 : undefined,
            backfaceVisibility: "hidden",
            transform: isBack
              ? `rotateY(-90deg) translateX(${spineW / 2}px)`
              : `rotateY(90deg) translateX(-${spineW / 2}px)`,
            transformOrigin: isBack ? "right center" : "left center",
          }}
        >
          {spineImage ? (
            <Image
              src={spineImage}
              alt={`${alt} spine`}
              fill
              className="object-cover"
              sizes={`${spineW}px`}
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: "linear-gradient(to right, #4a4a4a, #5a5a5a, #4a4a4a)",
              }}
            />
          )}
        </div>

        {/* Top edge (pages) */}
        <div
          className="absolute top-0 left-0 w-full"
          style={{
            height: `${spineW}px`,
            backfaceVisibility: "hidden",
            transform: `rotateX(-90deg) translateY(-${spineW / 2}px)`,
            transformOrigin: "top center",
            background: "linear-gradient(to right, #e8e5e0, #f5f2ed, #e8e5e0)",
          }}
        />
      </div>
    </div>
  );
}

export default function BookMockup({
  coverImage,
  backImage,
  spineImage,
  title,
  pages,
}: BookMockupProps) {
  const spineW = getSpineWidth(pages);
  const hasBack = !!backImage;

  if (!hasBack) {
    // Single book, slight angle
    return (
      <div className="relative w-[160px] h-[220px] group-hover:scale-105 transition-transform duration-300">
        <SingleBook
          image={coverImage}
          alt={title}
          spineImage={spineImage}
          spineW={spineW}
          rotateY={-20}
          zIndex={2}
          offsetX={15}
        />
      </div>
    );
  }

  // Two books: back cover behind (leaning left), front cover in front (leaning right)
  return (
    <div className="relative w-[180px] h-[220px] group-hover:scale-105 transition-transform duration-300">
      {/* Back cover — behind, leaning left */}
      <SingleBook
        image={backImage}
        alt={`${title} back`}
        spineImage={spineImage}
        spineW={spineW}
        rotateY={25}
        zIndex={1}
        offsetX={0}
      />
      {/* Front cover — in front, leaning right */}
      <SingleBook
        image={coverImage}
        alt={title}
        spineImage={spineImage}
        spineW={spineW}
        rotateY={-20}
        zIndex={2}
        offsetX={30}
      />
    </div>
  );
}
