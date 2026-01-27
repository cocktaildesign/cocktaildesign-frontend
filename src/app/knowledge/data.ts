// frontend/src/app/knowledge/data.ts

import type { KnowledgeItem } from "./types";

const KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: "k1",
    title: "Лекция: формулы баланса вкуса",
    tab: "education",
    format: "video",
    slug: "flavor-balance-formulas",
    date: "2026-01-10",
    duration: "12:40",
    description: "Разбираем базовые формулы баланса вкуса и то, как они применяются в коктейлях.",
  },
  {
    id: "k2",
    title: "Техника: быстрый фэт-вошинг дома",
    tab: "techniques",
    format: "video",
    slug: "fat-washing-fast",
    date: "2026-01-12",
    duration: "6:05",
    description: "Показываем простой и быстрый способ фэт-вошинга без профессионального оборудования.",
  },
  {
    id: "k3",
    title: "Теория: кислотность и сладость в коктейлях",
    tab: "education",
    format: "article",
    slug: "acidity-sweetness-basics",
    date: "2026-01-15",
    description: "Как кислотность и сладость влияют на вкус коктейля и как находить баланс.",
  },
  {
    id: "k4",
    title: "Видео: как выбирать лёд для разных напитков",
    tab: "techniques",
    format: "video",
    slug: "ice-selection-guide",
    date: "2026-01-18",
    duration: "4:47",
    description: "Разбираем типы льда и объясняем, какой лёд подходит для разных коктейлей.",
  },
  {
    id: "k5",
    title: "Статья: базовый набор барного инвентаря",
    tab: "industry",
    format: "article",
    slug: "basic-bar-tools",
    date: "2026-01-20",
    description: "Подробный разбор базового набора барного инвентаря для дома и профессионального бара.",
  },
  {
    id: "k6",
    title: "Лекция: шейк vs стир — когда и почему",
    tab: "education",
    format: "video",
    slug: "shake-vs-stir",
    date: "2026-01-22",
    duration: "9:30",
    description: "Разбираем разницу между шейком и стиром и объясняем, когда использовать каждый метод.",
  },
];

export function getKnowledgeItems(): KnowledgeItem[] {
  return KNOWLEDGE_ITEMS;
}

export function getKnowledgeItemBySlug(slug: string): KnowledgeItem | null {
  return KNOWLEDGE_ITEMS.find((item) => item.slug === slug) ?? null;
}
