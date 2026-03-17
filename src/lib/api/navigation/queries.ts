// Query string для Strapi.
// Подгружаем только нужные поля категории: name и slug.
export const NAVIGATION_QUERY =
  "populate[headerCategories][populate][category][fields][0]=name" +
  "&populate[headerCategories][populate][category][fields][1]=slug" +
  "&populate[footerCategories][populate][category][fields][0]=name" +
  "&populate[footerCategories][populate][category][fields][1]=slug";
