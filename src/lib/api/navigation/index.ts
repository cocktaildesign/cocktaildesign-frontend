import { NAVIGATION_QUERY } from "./queries";
import { mapNavigationItems } from "./mappers";
import type { NavigationData, StrapiNavigationResponse } from "./types";

// Берём серверную переменную
const API_URL = process.env.STRAPI_URL;

// Получаем навигацию из Strapi
export async function getNavigation(): Promise<NavigationData> {
  // 1. Проверяем env
  if (!API_URL) {
    console.error("❌ STRAPI_URL не задан");

    return {
      header: [],
      footer: [],
    };
  }

  try {
    // 2. Делаем запрос
    const response = await fetch(`${API_URL}/api/nastrojki-navigaczii?${NAVIGATION_QUERY}`, {
      next: { revalidate: 60 },
    });

    // 3. Проверяем ответ
    if (!response.ok) {
      console.error(`❌ Ошибка Strapi: ${response.status} ${response.statusText}`);

      return {
        header: [],
        footer: [],
      };
    }

    // 4. Парсим JSON
    const json: StrapiNavigationResponse = await response.json();

    // 5. Если нет данных
    if (!json.data) {
      return {
        header: [],
        footer: [],
      };
    }

    // 6. Преобразуем данные
    return {
      header: mapNavigationItems(json.data.headerCategories),
      footer: mapNavigationItems(json.data.footerCategories),
    };
  } catch (error) {
    // 7. Ловим любые ошибки (сеть, JSON и т.д.)
    console.error("❌ Ошибка при загрузке navigation", error);

    return {
      header: [],
      footer: [],
    };
  }
}
