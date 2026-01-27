// types.ts

// Категории (вкладки слева /knowledge?tab=...)
export type KnowledgeTab =
  | "techniques" // Техники и фишки
  | "education" // Обучение
  | "podcasts" // Подкасты и интервью
  | "industry" // Индустрия и культура
  | "resources"; // Материалы и ресурсы

// Форматы (фильтр + бейдж/иконка на карточке)
export type KnowledgeFormat = "video" | "article" | "podcast" | "material";

// Карточка в списке /knowledge
export type KnowledgeItem = {
  id: string;
  title: string;
  tab: KnowledgeTab; // категория
  format: KnowledgeFormat; // формат
  slug: string;
  date: string;

  description?: string;

  duration?: string; // пока оставляем как есть (потом уточним для каких форматов нужно)
};
