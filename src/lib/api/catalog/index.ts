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
  getCatalogMenuCollectionsFromStrapi,
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
