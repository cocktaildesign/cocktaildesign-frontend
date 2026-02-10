// ---------- Блоки контента внутри акции ----------
// Каждый блок — это один элемент разметки внутри модалки

type DiscountsHeadingBlock = {
  id: string;
  type: "heading";
  level: 2 | 3; // h2 или h3 внутри модалки (h1 — заголовок самой акции)
  content: string;
};

type DiscountsTextBlock = {
  id: string;
  type: "text";
  content: string; // абзац текста, \n для переносов
};

type DiscountsTextSmallBlock = {
  id: string;
  type: "textSmall";
  content: string; // абзац текста, \n для переносов
};

type DiscountsImageBlock = {
  id: string;
  type: "image";
  src: string;
  alt?: string; // если нет — декоративное изображение
  caption?: string; // подпись через <figcaption>
};

type DiscountsListBlock = {
  id: string;
  type: "list";
  items: string[];
  ordered?: boolean; // true = <ol>, иначе <ul>
};

type DiscountsLinkBlock = {
  id: string;
  type: "link";
  title: string;
  url: string;
  description?: string;
};

// Объединённый тип блока — один из вариантов выше
export type DiscountsBlock =
  | DiscountsHeadingBlock
  | DiscountsTextBlock
  | DiscountsTextSmallBlock
  | DiscountsImageBlock
  | DiscountsListBlock
  | DiscountsLinkBlock;

// ---------- Сама акция ----------
export type Discounts = {
  id: string;
  slug?: string; // для будущих URL/якорей
  title: string; // заголовок на карточке и в модалке
  image: string; // путь к картинке-обложке
  startDate?: string | null; // начало акции (ISO-формат: "2026-02-01")
  endDate?: string | null; // конец акции (ISO-формат: "2026-03-01")
  blocks: DiscountsBlock[]; // контент внутри модалки
};
