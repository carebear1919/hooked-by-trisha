import Image from "next/image";
import Link from "next/link";
import { lexicalToText, type PageBlock } from "@/lib/site-pages";

type Media = { url?: string | null; alt?: string | null } | null | undefined;

function mediaSrc(m: Media): string | undefined {
  return m?.url ?? undefined;
}
function mediaAlt(m: Media, fallback: string): string {
  return m?.alt || fallback;
}

export default function CmsBlocks({ blocks }: { blocks: PageBlock[] }) {
  if (blocks.length === 0) return null;

  return (
    <>
      {blocks.map((block, i) => {
        switch (block.blockType) {
          case "hero": {
            const image = block.image as Media;
            return (
              <section key={i} className="max-w-[1280px] mx-auto px-container-padding py-section-gap">
                <div className="bg-surface-container-low rounded-xl p-8 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  <div className="space-y-4">
                    {Boolean(block.eyebrow) && (
                      <span className="font-body text-label-md uppercase tracking-wider text-primary">
                        {String(block.eyebrow)}
                      </span>
                    )}
                    <h2 className="font-headline text-headline-lg text-on-surface">{String(block.headline ?? "")}</h2>
                    {Boolean(block.subtext) && (
                      <p className="font-body text-body-lg text-on-surface-variant">{String(block.subtext)}</p>
                    )}
                    {Boolean(block.buttonLabel) && Boolean(block.buttonHref) && (
                      <Link
                        href={String(block.buttonHref)}
                        className="inline-block mt-2 px-8 py-3 bg-primary text-on-primary font-body text-label-md rounded-full hover:opacity-90 transition-opacity"
                      >
                        {String(block.buttonLabel)}
                      </Link>
                    )}
                  </div>
                  {mediaSrc(image) && (
                    <div className="relative rounded-xl overflow-hidden aspect-4/5">
                      <Image
                        className="object-cover"
                        src={mediaSrc(image)!}
                        alt={mediaAlt(image, String(block.headline ?? ""))}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                      />
                    </div>
                  )}
                </div>
              </section>
            );
          }

          case "imageText": {
            const image = block.image as Media;
            const imageRight = block.imagePosition === "right";
            return (
              <section key={i} className="max-w-[1280px] mx-auto px-container-padding py-section-gap">
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${
                    imageRight ? "md:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="relative rounded-xl overflow-hidden aspect-4/5">
                    {mediaSrc(image) && (
                      <Image
                        className="object-cover"
                        src={mediaSrc(image)!}
                        alt={mediaAlt(image, String(block.heading ?? ""))}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    {Boolean(block.heading) && (
                      <h2 className="font-headline text-headline-md text-on-surface">{String(block.heading)}</h2>
                    )}
                    <p className="font-body text-body-lg text-on-surface-variant whitespace-pre-line">
                      {lexicalToText(block.text)}
                    </p>
                  </div>
                </div>
              </section>
            );
          }

          case "gallery": {
            const images = Array.isArray(block.images) ? (block.images as { image: Media }[]) : [];
            if (images.length === 0) return null;
            return (
              <section key={i} className="max-w-[1280px] mx-auto px-container-padding py-section-gap">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((entry, j) => (
                    <div key={j} className="relative aspect-square rounded-xl overflow-hidden bg-surface-container-low">
                      {mediaSrc(entry.image) && (
                        <Image
                          className="object-cover"
                          src={mediaSrc(entry.image)!}
                          alt={mediaAlt(entry.image, "Gallery photo")}
                          fill
                          sizes="(min-width: 768px) 33vw, 50vw"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          case "testimonial":
            return (
              <section key={i} className="max-w-[800px] mx-auto px-container-padding py-section-gap text-center">
                <p className="font-headline text-headline-md text-on-surface italic">
                  &ldquo;{String(block.quote ?? "")}&rdquo;
                </p>
                {Boolean(block.attribution) && (
                  <p className="mt-4 font-body text-label-md text-on-surface-variant">{String(block.attribution)}</p>
                )}
              </section>
            );

          case "faq": {
            const questions = Array.isArray(block.questions)
              ? (block.questions as { question: string; answer: string }[])
              : [];
            if (questions.length === 0) return null;
            return (
              <section key={i} className="max-w-[800px] mx-auto px-container-padding py-section-gap">
                <div className="divide-y divide-surface-container-high border-t border-b border-surface-container-high">
                  {questions.map((q, j) => (
                    <details key={j} className="group py-4">
                      <summary className="flex justify-between items-center cursor-pointer list-none font-body text-body-lg text-on-surface">
                        {q.question}
                        <span className="material-symbols-outlined group-open:rotate-180 transition-transform" aria-hidden>
                          expand_more
                        </span>
                      </summary>
                      <p className="pt-3 font-body text-body-md text-on-surface-variant">{q.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            );
          }

          case "richText":
            return (
              <section key={i} className="max-w-[800px] mx-auto px-container-padding py-section-gap">
                <p className="font-body text-body-lg text-on-surface-variant whitespace-pre-line">
                  {lexicalToText(block.content)}
                </p>
              </section>
            );

          default:
            return null;
        }
      })}
    </>
  );
}
