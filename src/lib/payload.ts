import "server-only";

import config from "@payload-config";
import { getPayload } from "payload";

export function getPayloadClient() {
  return getPayload({ config });
}

export function textToLexical(text: string) {
  return {
    root: {
      type: "root",
      children: text
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((line) => ({
          type: "paragraph",
          children: [{ type: "text", text: line, version: 1 }],
          direction: "ltr" as const,
          format: "" as const,
          indent: 0,
          version: 1,
        })),
      direction: "ltr" as const,
      format: "" as const,
      indent: 0,
      version: 1,
    },
  };
}

export function lexicalToText(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const root = (value as { root?: { children?: unknown[] } }).root;
  if (!root?.children) return "";
  return root.children
    .map((node) => {
      const n = node as { children?: { text?: string }[] };
      return n.children?.map((c) => c.text ?? "").join("") ?? "";
    })
    .join("\n");
}
