// src/lib/api/catalog/index.ts
// Публичный вход каталога: экспортируем только функции (API).
// Типы импортируем напрямую из "./types" при необходимости.

export { getTopCategoriesFromStrapi, getCategoryBySlugFromStrapi, getCatalogTreeFromStrapi } from "./queries";
