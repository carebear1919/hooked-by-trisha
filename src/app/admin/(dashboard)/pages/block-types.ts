export const BLOCK_TYPES = ["hero", "imageText", "gallery", "testimonial", "faq", "richText"] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];
export type PageBlock = Record<string, unknown> & { blockType: BlockType; id?: string };
