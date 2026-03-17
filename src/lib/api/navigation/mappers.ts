import type { NavigationItem, StrapiNavigationItem } from "./types";

// Преобразуем список пунктов меню из Strapi
// в удобный список для фронта.
export function mapNavigationItems(items: StrapiNavigationItem[]): NavigationItem[] {
  return items
    .filter((item) => item.isVisible)
    .map((item) => {
      // Если категория не выбрана — такой пункт пропускаем
      if (!item.category) {
        return null;
      }

      // Если у категории нет slug — ссылку не собрать
      if (!item.category.slug) {
        return null;
      }

      return {
        // Если label не заполнен, показываем название категории
        label: item.label || item.category.name,
        // Ссылка строится из slug категории
        href: `/catalog/${item.category.slug}`,
      };
    })
    .filter((item): item is NavigationItem => item !== null);
}
