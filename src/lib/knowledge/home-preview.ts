import type { KnowledgeItemPreview } from "@/app/knowledge/types";

// Each homepage tab renders four cards. Keep those choices on the server so
// older, unreachable cards are not serialized into the homepage's client data.
export function homeKnowledgePreviews(items: KnowledgeItemPreview[]): KnowledgeItemPreview[] {
  const counts = new Map<KnowledgeItemPreview["format"], number>();
  return items.filter((item) => {
    const count = counts.get(item.format) ?? 0;
    counts.set(item.format, count + 1);
    return count < 4;
  });
}
