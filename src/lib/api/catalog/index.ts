export {
  // Категории
  getCategoryBySlugFromStrapi,
  getCatalogTreeFromStrapi,
  getTopCategoriesFromTree,
  getChildCategoriesFromTree,

  // Товары (категория + все потомки, пагинация)
  getProductsByCategorySlugFromStrapi,
  getDiscountedProductsFromStrapi,
  getProductsByIdsFromStrapi,

  // Главная — подборки товаров
  getCatalogCollectionsWithProductsFromStrapi,
  getHomepageCollectionsFromStrapi,

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
