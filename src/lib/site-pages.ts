import "server-only";

import { getPayloadClient, lexicalToText } from "./payload";

export type PageBlock = Record<string, unknown> & { blockType: string };

export async function getHomeLayout(opts?: { preview?: boolean }): Promise<PageBlock[]> {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "pages",
    where: { slug: { equals: "home" } },
    limit: 1,
    depth: 2,
    draft: opts?.preview ?? false,
  });
  return (docs[0]?.layout ?? []) as PageBlock[];
}

export { lexicalToText };
