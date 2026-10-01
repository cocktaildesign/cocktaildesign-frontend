import type { KnowledgeContentBlock } from "@/app/knowledge/types";

type ImageBlock = Extract<KnowledgeContentBlock, { type: "image" }>;
export type ReadingBlock =
  | { type: "heading"; id: string; level: 2 | 3; content: string }
  | { type: "text" | "label" | "quote"; content: string }
  | { type: "rule" }
  | { type: "list"; ordered: boolean; start: number; items: string[] }
  | { type: "gallery"; images: ImageBlock[] }
  | Extract<KnowledgeContentBlock, { type: "link" }>;

const labels = /^(?:Ингредиенты|Инструкция|Технология|Приготовление|Процесс приготовления|Примечания?|Советы|Плюсы|Минусы|Первый слой|Второй слой):?$/i;
const foamHeadings = new Set([
  "Что такое лецитиновая пена", "Что входит в комплект", "Сборка устройства", "Базовый принцип работы",
  "Как приготовить смесь", "Как сделать летающее облако", "Рецепты лецитиновой пены", "Дозировка лецитина",
  "Температура жидкости", "Что если пена не образуется?", "Пузырьки слишком крупные", "Пена быстро оседает",
  "Где используют лецитиновую пену?",
]);
const foamSubheadings = new Set([
  "Установите перфорированную панель", "Установите колбу", "Подключите шланг", "Подключите баллон",
  "Пена Юдзу", "Пена клубника — базилик", "Пена черная смородина — гибискус",
]);

export function plainHeading(text: string): string {
  return text.trim().replace(/^#{1,6}\s+/, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1");
}

// CMS text is never interpreted as HTML. Only http(s), mail and local links are clickable.
export function safeReadingHref(href: string): string | undefined {
  const value = href.trim();
  if (/^\/(?!\/)/.test(value) && !/[\\\u0000-\u0020]/.test(value)) return value;
  if (/^https?:\/\//i.test(value)) {
    try { const url = new URL(value); if (!url.username && !url.password) return url.href; } catch { /* plain text */ }
  }
  if (/^mailto:[^\s<>]+$/i.test(value)) return value;
  return undefined;
}

/** Presentation only: CMS values, recipe quantities and paragraph order remain unchanged. */
export function readingBlocks(blocks: KnowledgeContentBlock[], slug: string): ReadingBlock[] {
  const result: ReadingBlock[] = [];
  const foam = slug === "letsitinovaya-vozdushnaya-pena-retsepty-i-tekhnologiya";
  let headingIndex = 0;
  let recipeIngredients = false;
  function heading(content: string, level: 2 | 3) {
    result.push({ type: "heading", id: `section-${++headingIndex}`, level, content: plainHeading(content) });
    recipeIngredients = false;
  }
  function listItem(content: string, ordered: boolean, number = 1) {
    const last = result.at(-1);
    if (last?.type === "list" && last.ordered === ordered && (!ordered || last.start + last.items.length === number)) {
      last.items.push(content);
    } else result.push({ type: "list", ordered, start: number, items: [content] });
  }
  function line(raw: string) {
    const content = raw.trim();
    if (!content) return;
    const plain = plainHeading(content);
    const mdHeading = content.match(/^(#{1,6})\s+/);
    if (labels.test(plain)) {
      result.push({ type: "label", content: plain });
      recipeIngredients = foam && /^Ингредиенты/i.test(plain);
    } else if (foam && foamHeadings.has(plain)) heading(plain, 2);
    else if (foam && foamSubheadings.has(plain)) heading(plain, 3);
    else if (/^\d{1,2}:\d{2}(?::\d{2})?\s+\S/.test(plain)) heading(plain, 3);
    else if (mdHeading) heading(plain, mdHeading[1].length < 3 ? 2 : 3);
    else if (/^Рецепт(?:\s+[^.!?]{1,95})?:?$/i.test(plain)) heading(plain, 3);
    else if (/^(?:---+|\*\*\*+)$/.test(content)) result.push({ type: "rule" });
    else if (/^>\s?/.test(content)) result.push({ type: "quote", content: content.replace(/^>\s?/, "") });
    else {
      const bullet = content.match(/^(?:[-*•·])\s+(.+)$/);
      const numbered = content.match(/^(\d{1,3})[.)]\s+(.+)$/);
      if (bullet) listItem(bullet[1], false);
      else if (numbered) listItem(numbered[2], true, Number(numbered[1]));
      else if (recipeIngredients) listItem(content, false);
      else result.push({ type: "text", content });
    }
  }
  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        if (labels.test(plainHeading(block.content))) line(block.content);
        else heading(block.content, block.level);
        break;
      case "text":
        // Oil recipes were imported as individual unmarked paragraphs. Explicit source IDs
        // avoid guessing whether numbers in other articles are ingredients or instructions.
        if (slug === "kak-gotovit-kokteyli-s-maslom" && new Set([
          "1518", "1519", "1520", "1521", "1527", "1528", "1529", "1537", "1538", "1539", "1540", "1541",
          "1547", "1548", "1549", "1550", "1554", "1555", "1556", "1557", "1558", "1559", "1560",
        ]).has(block.id)) listItem(block.content, false);
        else block.content.replace(/\r\n?/g, "\n").split(/\n/).forEach(line);
        break;
      case "list":
        result.push({ type: "list", ordered: block.ordered, start: 1, items: [...block.items] });
        break;
      case "image": {
        recipeIngredients = false;
        const last = result.at(-1);
        if (last?.type === "gallery") {
          // Only identical adjacent-run images; captions and images elsewhere are preserved.
          if (!last.images.some(x => x.src === block.src && x.alt === block.alt && x.caption === block.caption)) last.images.push(block);
        } else result.push({ type: "gallery", images: [block] });
        break;
      }
      case "link": result.push(block); recipeIngredients = false; break;
    }
  }
  return result;
}

export function readingContents(blocks: ReadingBlock[]) {
  const headings = blocks.filter((b): b is Extract<ReadingBlock, { type: "heading" }> => b.type === "heading");
  const main = headings.filter(b => b.level === 2);
  const entries = main.length >= 3 ? main : headings;
  return entries.length >= 3 ? entries : [];
}
