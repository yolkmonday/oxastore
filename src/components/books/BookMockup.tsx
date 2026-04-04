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
  if (!pages || pages <= 0) return Math.round((0.15 / 2.8) * 220);
  const w = (pages * 0.0015) / 2.8 * 220;
  return Math.max(
    Math.round((0.08 / 2.8) * 220),
    Math.min(Math.round(w), Math.round((0.5 / 2.8) * 220))
  );
}

function SingleBook({
  image,
  alt,
  spineImage,
  spineW,
  rotateY,
  translateX,
  translateZ,
  zIndex,
}: {
  image: string;
  alt: string;
  spineImage?: string | null;
  spineW: number;
  rotateY: number;
  translateX: number;
  translateZ: number;
  zIndex: number;
}) {
  const isBack = rotateY > 0;

  return (
    <div
      className="absolute inset-0"
      style={{ zIndex }}
    >
      <div
        className="absolute w-[120px] h-[190px] left-1/2 top-1/2"
        style={{
          transformStyle: "preserve-3d",
          transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
        }}
      >
        {/* Cover face */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: `translateZ(${spineW / 2}px)`,
            borderRadius: isBack ? "3px 1px 1px 3px" : "1px 3px 3px 1px",
            boxShadow: isBack
              ? "4px 4px 12px rgba(0,0,0,0.3)"
              : "-2px 4px 16px rgba(0,0,0,0.35)",
          }}
        >
          <Image
            src={image}
            alt={alt}
            fill
            className="object-cover"
            sizes="120px"
          />
          {/* Lighting overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: isBack
                ? "linear-gradient(to left, rgba(0,0,0,0.08), transparent 40%)"
                : "linear-gradient(to right, rgba(255,255,255,0.06), transparent 30%, rgba(0,0,0,0.06))",
            }}
          />
        </div>

        {/* Back of cover (hidden, but needed for 3D) */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            transform: `translateZ(-${spineW / 2}px) rotateY(180deg)`,
            background: "#d4d0cb",
            borderRadius: isBack ? "1px 3px 3px 1px" : "3px 1px 1px 3px",
          }}
        />

        {/* Spine face */}
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
            boxShadow: "inset 0 0 4px rgba(0,0,0,0.15)",
          }}
        >
          {spineImage ? (
            <>
              <Image
                src={spineImage}
                alt={`${alt} spine`}
                fill
                className="object-cover"
                sizes={`${spineW}px`}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to right, rgba(0,0,0,0.15), transparent 30%, transparent 70%, rgba(0,0,0,0.1))",
                }}
              />
            </>
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: "linear-gradient(to right, #3a3a3a, #555, #4a4a4a)",
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
            background: "linear-gradient(to bottom, #f0ede8, #e5e2dc)",
            boxShadow: "inset 0 -1px 3px rgba(0,0,0,0.08)",
          }}
        />

        {/* Bottom edge (pages) */}
        <div
          className="absolute bottom-0 left-0 w-full"
          style={{
            height: `${spineW}px`,
            backfaceVisibility: "hidden",
            transform: `rotateX(90deg) translateY(${spineW / 2}px)`,
            transformOrigin: "bottom center",
            background: "linear-gradient(to top, #e8e5e0, #ddd9d3)",
          }}
        />

        {/* Right/Left edge (pages, opposite of spine) */}
        <div
          className="absolute top-0 h-full"
          style={{
            width: `${spineW}px`,
            right: isBack ? undefined : 0,
            left: isBack ? 0 : undefined,
            backfaceVisibility: "hidden",
            transform: isBack
              ? `rotateY(90deg) translateX(-${spineW / 2}px)`
              : `rotateY(-90deg) translateX(${spineW / 2}px)`,
            transformOrigin: isBack ? "left center" : "right center",
            background: isBack
              ? "repeating-linear-gradient(to right, #f0ede8 0px, #e2dfd9 1px, #f0ede8 2px)"
              : "repeating-linear-gradient(to right, #f0ede8 0px, #e2dfd9 1px, #f0ede8 2px)",
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
    return (
      <div
        className="relative w-[170px] h-[230px] group-hover:scale-105 transition-transform duration-300"
        style={{ perspective: "800px" }}
      >
        <SingleBook
          image={coverImage}
          alt={title}
          spineImage={spineImage}
          spineW={spineW}
          rotateY={-25}
          translateX={8}
          translateZ={0}
          zIndex={1}
        />
        {/* Ground shadow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] h-[10px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)",
            filter: "blur(4px)",
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="relative w-[190px] h-[230px] group-hover:scale-105 transition-transform duration-300"
      style={{ perspective: "800px" }}
    >
      {/* Back book — behind, rotated to show back cover */}
      <SingleBook
        image={backImage}
        alt={`${title} back`}
        spineImage={spineImage}
        spineW={spineW}
        rotateY={30}
        translateX={-18}
        translateZ={-20}
        zIndex={1}
      />
      {/* Front book — in front, rotated to show front cover */}
      <SingleBook
        image={coverImage}
        alt={title}
        spineImage={spineImage}
        spineW={spineW}
        rotateY={-25}
        translateX={18}
        translateZ={20}
        zIndex={2}
      />
      {/* Ground shadow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-[10px] rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)",
          filter: "blur(5px)",
        }}
      />
    </div>
  );
}
