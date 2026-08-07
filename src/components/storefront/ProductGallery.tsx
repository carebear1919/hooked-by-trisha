"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function ProductGallery({
  images,
}: {
  images: { src: string; alt: string }[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const active = images[activeIndex] ?? images[0];

  const next = () => setActiveIndex((i) => (i + 1) % images.length);
  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, images.length]);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label={`Zoom in on ${active.alt}`}
        className="group relative w-full aspect-4/5 rounded-xl overflow-hidden bg-secondary-container shadow-sm cursor-zoom-in"
      >
        <Image
          className="object-cover transition-opacity duration-300"
          src={active.src}
          alt={active.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />
        <span className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-surface/90 flex items-center justify-center text-on-surface shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined" aria-hidden>
            zoom_in
          </span>
        </span>
      </button>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show image ${i + 1}: ${img.alt}`}
              aria-pressed={i === activeIndex}
              className={`relative aspect-square rounded-lg overflow-hidden bg-surface-container-high transition-all ${
                i === activeIndex
                  ? "border-2 border-primary"
                  : "border-2 border-transparent"
              }`}
            >
              <Image
                className={`object-cover transition-opacity ${
                  i === activeIndex ? "opacity-100" : "opacity-80 hover:opacity-100"
                }`}
                src={img.src}
                alt={img.alt}
                fill
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-surface/20 hover:bg-surface/30 text-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined" aria-hidden>
              close
            </span>
          </button>

          {images.length > 1 && (
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-2 sm:left-6 w-11 h-11 rounded-full bg-surface/20 hover:bg-surface/30 text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined" aria-hidden>
                chevron_left
              </span>
            </button>
          )}

          <img
            src={active.src}
            alt={active.alt}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-2 sm:right-6 w-11 h-11 rounded-full bg-surface/20 hover:bg-surface/30 text-white flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined" aria-hidden>
                chevron_right
              </span>
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to image ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === activeIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
