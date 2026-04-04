"use client";

import Image from "next/image";

interface BookMockupProps {
  coverImage: string;
  backImage?: string | null;
  spineImage?: string | null;
  title: string;
  pages?: number;
}

function getSpineWidth(pages?: number): number {
  if (!pages || pages <= 0) return 6;
  const w = pages * 0.035;
  return Math.max(4, Math.min(Math.round(w), 18));
}

/**
 * A single standing book rendered with CSS 3D.
 * `spineOnRight` controls which side the spine is on.
 */
function StandingBook({
  image,
  alt,
  spineImage,
  spineW,
  rotateY,
  style,
  zIndex,
  spineOnRight,
}: {
  image: string;
  alt: string;
  spineImage?: string | null;
  spineW: number;
  rotateY: number;
  style?: React.CSSProperties;
  zIndex: number;
  spineOnRight: boolean;
}) {
  return (
    <div className="absolute inset-0" style={{ zIndex, ...style }}>
      <div
        className="absolute left-1/2 top-1/2 w-[130px] h-[195px]"
        style={{
          transformStyle: "preserve-3d",
          transform: `translate(-50%, -50%) rotateY(${rotateY}deg)`,
        }}
      >
        {/* Front face (the visible cover) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            transform: `translateZ(${spineW / 2}px)`,
            backfaceVisibility: "hidden",
            borderRadius: spineOnRight ? "2px 3px 3px 2px" : "3px 2px 2px 3px",
            boxShadow: `${spineOnRight ? "" : "-"}3px 6px 20px rgba(0,0,0,0.4)`,
          }}
        >
          <Image src={image} alt={alt} fill className="object-cover" sizes="115px" />
          {/* Subtle light gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: spineOnRight
                ? "linear-gradient(105deg, rgba(255,255,255,0.07) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)"
                : "linear-gradient(255deg, rgba(255,255,255,0.07) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)",
            }}
          />
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translateZ(-${spineW / 2}px) rotateY(180deg)`,
            backfaceVisibility: "hidden",
            background: "#c8c4be",
            borderRadius: spineOnRight ? "3px 2px 2px 3px" : "2px 3px 3px 2px",
          }}
        />

        {/* Spine */}
        <div
          className="absolute top-0 h-full overflow-hidden"
          style={{
            width: `${spineW}px`,
            ...(spineOnRight
              ? { right: 0, transformOrigin: "right center", transform: `rotateY(-90deg) translateX(${spineW / 2}px)` }
              : { left: 0, transformOrigin: "left center", transform: `rotateY(90deg) translateX(-${spineW / 2}px)` }),
            backfaceVisibility: "hidden",
          }}
        >
          {spineImage ? (
            <>
              <Image src={spineImage} alt={`${alt} spine`} fill className="object-cover" sizes={`${spineW}px`} />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(to right, rgba(0,0,0,0.12), transparent 40%, transparent 60%, rgba(0,0,0,0.08))" }}
              />
            </>
          ) : (
            <div className="w-full h-full" style={{ background: "linear-gradient(to right, #3d3d3d, #555, #444)" }} />
          )}
        </div>

        {/* Page edge (opposite of spine) */}
        <div
          className="absolute top-0 h-full"
          style={{
            width: `${spineW}px`,
            ...(spineOnRight
              ? { left: 0, transformOrigin: "left center", transform: `rotateY(90deg) translateX(-${spineW / 2}px)` }
              : { right: 0, transformOrigin: "right center", transform: `rotateY(-90deg) translateX(${spineW / 2}px)` }),
            backfaceVisibility: "hidden",
            background: "repeating-linear-gradient(to right, #f2efea 0px, #e6e3dd 1px, #f2efea 2px)",
          }}
        />

        {/* Top edge */}
        <div
          className="absolute top-0 left-0 w-full"
          style={{
            height: `${spineW}px`,
            transform: `rotateX(-90deg) translateY(-${spineW / 2}px)`,
            transformOrigin: "top center",
            backfaceVisibility: "hidden",
            background: "linear-gradient(to bottom, #f2efea, #e6e3dd)",
          }}
        />

        {/* Bottom edge */}
        <div
          className="absolute bottom-0 left-0 w-full"
          style={{
            height: `${spineW}px`,
            transform: `rotateX(90deg) translateY(${spineW / 2}px)`,
            transformOrigin: "bottom center",
            backfaceVisibility: "hidden",
            background: "linear-gradient(to top, #e6e3dd, #dad7d1)",
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

  // Single book
  if (!hasBack) {
    return (
      <div
        className="relative w-[190px] h-[250px] group-hover:scale-105 transition-transform duration-300"
        style={{ perspective: "800px", perspectiveOrigin: "50% 45%" }}
      >
        <StandingBook
          image={coverImage}
          alt={title}
          spineImage={spineImage}
          spineW={spineW}
          rotateY={-28}
          zIndex={1}
          spineOnRight={false}
        />
        <div
          className="absolute bottom-[18px] left-1/2 -translate-x-1/2 w-[70%] h-2"
          style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.3), transparent 70%)", filter: "blur(4px)" }}
        />
      </div>
    );
  }

  // Two books: back cover on left (spine facing right/center), front cover on right (spine facing left/center)
  return (
    <div
      className="relative w-[210px] h-[250px] group-hover:scale-105 transition-transform duration-300"
      style={{ perspective: "900px", perspectiveOrigin: "50% 45%" }}
    >
      {/* Back book — left side, rotated so back cover faces viewer, spine on right */}
      <StandingBook
        image={backImage}
        alt={`${title} back`}
        spineImage={spineImage}
        spineW={spineW}
        rotateY={32}
        zIndex={1}
        spineOnRight={true}
        style={{ left: "-12px" }}
      />
      {/* Front book — right side, rotated so front cover faces viewer, spine on left */}
      <StandingBook
        image={coverImage}
        alt={title}
        spineImage={spineImage}
        spineW={spineW}
        rotateY={-28}
        zIndex={2}
        spineOnRight={false}
        style={{ left: "12px" }}
      />
      {/* Ground shadow */}
      <div
        className="absolute bottom-[16px] left-1/2 -translate-x-1/2 w-[80%] h-2"
        style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.35), transparent 70%)", filter: "blur(5px)" }}
      />
    </div>
  );
}
