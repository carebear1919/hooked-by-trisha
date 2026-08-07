"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPayloadClient, textToLexical } from "@/lib/payload";
import { BLOCK_TYPES, type BlockType, type PageBlock } from "./block-types";

export async function getOrCreateHomePage(): Promise<{
  id: number | string;
  layout: PageBlock[];
  hasUnpublishedChanges: boolean;
}> {
  const payload = await getPayloadClient();
  // draft:true returns the latest version (draft or published) so edits build on
  // whatever the admin last saved, not necessarily what's live for customers.
  const { docs } = await payload.find({
    collection: "pages",
    where: { slug: { equals: "home" } },
    limit: 1,
    depth: 2,
    draft: true,
  });

  if (docs[0]) {
    return {
      id: docs[0].id,
      layout: (docs[0].layout ?? []) as PageBlock[],
      hasUnpublishedChanges: docs[0]._status === "draft",
    };
  }

  const created = await payload.create({
    collection: "pages",
    data: { title: "Home", slug: "home", layout: [], _status: "published" },
  });
  return { id: created.id, layout: [], hasUnpublishedChanges: false };
}

export async function getPublishedHomeMeta(): Promise<{ updatedAt: string | null }> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "pages",
    where: { slug: { equals: "home" } },
    limit: 1,
    draft: false,
  });
  return { updatedAt: docs[0]?.updatedAt ?? null };
}

export async function duplicateBlock(formData: FormData) {
  const index = Number(formData.get("index") ?? -1);
  if (index < 0) return;

  const payload = await getPayloadClient();
  const { id, layout } = await getOrCreateHomePage();
  if (!layout[index]) return;

  const { id: _discardId, ...blockWithoutId } = layout[index];
  const newLayout = [...layout];
  newLayout.splice(index + 1, 0, blockWithoutId as PageBlock);

  await payload.update({
    collection: "pages",
    id,
    data: { layout: newLayout },
    draft: true,
  });

  revalidatePath("/admin/pages");
  redirect(`/admin/pages?flash=${encodeURIComponent("Block duplicated — preview it, then publish when ready.")}`);
}

export async function publishHomePage() {
  const payload = await getPayloadClient();
  const { id, layout } = await getOrCreateHomePage();

  await payload.update({
    collection: "pages",
    id,
    data: { layout },
    draft: false,
  });

  revalidatePath("/admin/pages");
  revalidatePath("/");
  redirect(`/admin/pages?flash=${encodeURIComponent("Homepage published — live for customers now.")}`);
}

function buildBlockFromForm(type: BlockType, formData: FormData): PageBlock {
  switch (type) {
    case "hero":
      return {
        blockType: "hero",
        eyebrow: String(formData.get("eyebrow") ?? ""),
        headline: String(formData.get("headline") ?? ""),
        subtext: String(formData.get("subtext") ?? ""),
        image: formData.get("image") ? Number(formData.get("image")) : null,
        buttonLabel: String(formData.get("buttonLabel") ?? ""),
        buttonHref: String(formData.get("buttonHref") ?? ""),
      };
    case "imageText":
      return {
        blockType: "imageText",
        image: formData.get("image") ? Number(formData.get("image")) : null,
        heading: String(formData.get("heading") ?? ""),
        text: textToLexical(String(formData.get("text") ?? "")),
        imagePosition: String(formData.get("imagePosition") ?? "left"),
      };
    case "gallery":
      return {
        blockType: "gallery",
        images: formData
          .getAll("images")
          .map((v) => Number(v))
          .filter(Boolean)
          .map((image) => ({ image })),
      };
    case "testimonial":
      return {
        blockType: "testimonial",
        quote: String(formData.get("quote") ?? ""),
        attribution: String(formData.get("attribution") ?? ""),
      };
    case "faq":
      return {
        blockType: "faq",
        questions: Array.from({ length: 5 })
          .map((_, i) => ({
            question: String(formData.get(`question-${i}`) ?? "").trim(),
            answer: String(formData.get(`answer-${i}`) ?? "").trim(),
          }))
          .filter((q) => q.question && q.answer),
      };
    case "richText":
      return {
        blockType: "richText",
        content: textToLexical(String(formData.get("content") ?? "")),
      };
  }
}

export async function addBlock(formData: FormData) {
  const type = String(formData.get("blockType") ?? "") as BlockType;
  if (!BLOCK_TYPES.includes(type)) throw new Error("Unknown block type.");

  const payload = await getPayloadClient();
  const { id, layout } = await getOrCreateHomePage();
  const newBlock = buildBlockFromForm(type, formData);

  await payload.update({
    collection: "pages",
    id,
    data: { layout: [...layout, newBlock] },
    draft: true,
  });

  revalidatePath("/admin/pages");
  redirect(`/admin/pages?flash=${encodeURIComponent("Block added — preview it, then publish when ready.")}`);
}

export async function updateBlockAction(formData: FormData) {
  const type = String(formData.get("blockType") ?? "") as BlockType;
  const index = Number(formData.get("index") ?? -1);
  if (!BLOCK_TYPES.includes(type) || index < 0) throw new Error("Invalid block.");

  const payload = await getPayloadClient();
  const { id, layout } = await getOrCreateHomePage();
  const updatedBlock = buildBlockFromForm(type, formData);
  const newLayout = layout.map((b, i) => (i === index ? updatedBlock : b));

  await payload.update({
    collection: "pages",
    id,
    data: { layout: newLayout },
    draft: true,
  });

  revalidatePath("/admin/pages");
  redirect(`/admin/pages?flash=${encodeURIComponent("Block updated — preview it, then publish when ready.")}`);
}

export async function deleteBlock(formData: FormData) {
  const index = Number(formData.get("index") ?? -1);
  if (index < 0) return;

  const payload = await getPayloadClient();
  const { id, layout } = await getOrCreateHomePage();
  const newLayout = layout.filter((_, i) => i !== index);

  await payload.update({
    collection: "pages",
    id,
    data: { layout: newLayout },
    draft: true,
  });

  revalidatePath("/admin/pages");
  redirect(`/admin/pages?flash=${encodeURIComponent("Block deleted — preview it, then publish when ready.")}`);
}

export async function moveBlock(formData: FormData) {
  const index = Number(formData.get("index") ?? -1);
  const direction = String(formData.get("direction") ?? "");
  if (index < 0 || (direction !== "up" && direction !== "down")) return;

  const payload = await getPayloadClient();
  const { id, layout } = await getOrCreateHomePage();
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= layout.length) return;

  const newLayout = [...layout];
  [newLayout[index], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[index]];

  await payload.update({
    collection: "pages",
    id,
    data: { layout: newLayout },
    draft: true,
  });

  revalidatePath("/admin/pages");
  redirect(`/admin/pages?flash=${encodeURIComponent("Block reordered — preview it, then publish when ready.")}`);
}
