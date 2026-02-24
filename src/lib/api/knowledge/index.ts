// frontend/src/lib/api/knowledge/index.ts
// Публичный вход knowledge-модуля: экспортируем только функции (API).
// Доменные типы импортируем напрямую из "@/app/knowledge/types".

export {
  getKnowledgeItemsFromStrapi,
  getKnowledgeVideoBySlugFromStrapi,
  getKnowledgeArticleBySlugFromStrapi,
  getKnowledgeMaterialBySlugFromStrapi,
} from "./queries";
