// src/lib/api/catalog/index.ts
// Публичный вход каталога: экспортируем только функции (API).
// Типы импортируем напрямую из "./types" при необходимости.

export {
  // Категории
  getTopCategoriesFromStrapi,
  getCategoryBySlugFromStrapi,
  getCatalogTreeFromStrapi,

  // Товары (категория + все потомки, пагинация)
  getProductsByCategorySlugFromStrapi,
} from "./queries";
