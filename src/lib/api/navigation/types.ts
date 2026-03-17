// Сырая категория из Strapi
export type StrapiNavigationCategory = {
  name: string;
  slug: string | null;
};

// Один пункт меню из Strapi
export type StrapiNavigationItem = {
  label: string | null;
  isVisible: boolean;
  category: StrapiNavigationCategory | null;
};

// Ответ Strapi для navigation settings
export type StrapiNavigationResponse = {
  data: {
    headerCategories: StrapiNavigationItem[];
    footerCategories: StrapiNavigationItem[];
  } | null;
};

// Уже удобный тип для фронта
export type NavigationItem = {
  label: string;
  href: string;
};

// Финальный результат для сайта
export type NavigationData = {
  header: NavigationItem[];
  footer: NavigationItem[];
};
