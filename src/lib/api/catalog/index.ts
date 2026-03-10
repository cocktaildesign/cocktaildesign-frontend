// src/lib/api/catalog/index.ts

export {
  // Категории
  getTopCategoriesFromStrapi,
  getCategoryBySlugFromStrapi,
  getCatalogTreeFromStrapi,

  // Товары (категория + все потомки, пагинация)
  getProductsByCategorySlugFromStrapi,

  // Товар (детальная страница)
  getProductBySlugFromStrapi,

  // Главная — товар недели
  getWeeklyProductBlock,
} from "./queries";
