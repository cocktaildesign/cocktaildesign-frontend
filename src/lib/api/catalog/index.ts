export {
  // Категории
  getTopCategoriesFromStrapi,
  getCategoryBySlugFromStrapi,
  getCatalogTreeFromStrapi,

  // Товары (категория + все потомки, пагинация)
  getProductsByCategorySlugFromStrapi,

  // Товар (детальная страница)
  getProductBySlugFromStrapi,
} from "./queries";
