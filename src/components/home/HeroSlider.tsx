"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import type { Slider } from "@/types";

function SlideContent({ slide, priority }: { slide: Slider; priority: boolean }) {
  return (
    <>
      <Image
        src={slide.image}
        alt={slide.title ?? "Slider"}
        fill
        className="object-cover"
        priority={priority}
      />
      {(slide.title || slide.subtitle) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
          <div className="p-6 md:p-10 text-white">
            {slide.title && (
              <h2 className="text-xl md:text-3xl font-bold mb-1">
                {slide.title}
              </h2>
            )}
            {slide.subtitle && (
              <p className="text-sm md:text-base text-white/80">
                {slide.subtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function HeroSlider({ sliders }: { sliders: Slider[] }) {
  const [current, setCurrent] = useState(0);
  const total = sliders.length;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, total]);

  if (total === 0) return null;

  const slide = sliders[current];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gray-100">
      {slide.link ? (
        <Link href={slide.link} className="relative block w-full aspect-[21/8]">
          <SlideContent slide={slide} priority={current === 0} />
        </Link>
      ) : (
        <div className="relative w-full aspect-[21/8]">
          <SlideContent slide={slide} priority={current === 0} />
        </div>
      )}

      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition cursor-pointer"
          >
            <Icon icon="mdi:chevron-left" className="text-xl text-gray-700" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition cursor-pointer"
          >
            <Icon icon="mdi:chevron-right" className="text-xl text-gray-700" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sliders.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition cursor-pointer ${
                  i === current ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
