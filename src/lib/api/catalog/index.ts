export {
  // Категории
  getTopCategoriesFromStrapi,
  getCategoryBySlugFromStrapi,
  getCatalogTreeFromStrapi,
  getChildCategoriesFromStrapi,

  // НОВЫЕ — миграция на единый источник /catalog/categories-flat
  getTopCategoriesFromTree,
  getChildCategoriesFromTree,

  // Товары (категория + все потомки, пагинация)
  getProductsByCategorySlugFromStrapi,
  getDiscountedProductsFromStrapi,
  getProductsByIdsFromStrapi,

  // Главная — подборки товаров
  getCatalogCollectionsWithProductsFromStrapi,

  // Товар (детальная страница)
  getProductBySlugFromStrapi,

  // Главная — товар недели
  getWeeklyProductBlock,

  // Коллекции — страница /catalog/collection/[slug]
  getCollectionProductsFromStrapi,
  getCollectionCategoriesTreeFromStrapi,

  // каталог цветов
  getColorMap,
} from "./queries";
