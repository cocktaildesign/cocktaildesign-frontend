import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import styles from "./Catalog.module.css";
import { getTopCategoriesFromStrapi } from "@/lib/api/catalog";

export const metadata = pageMetadata({
  title: "Каталог",
  description:
    "Каталог барного оборудования: шейкеры, джиггеры, стрейнеры, барные ложки и аксессуары. Фото, характеристики и наличие.",
  canonical: "/catalog",
});

export default async function CatalogPage() {
  // Загружаем категории из Strapi через наш API-слой
  const categories = await getTopCategoriesFromStrapi();

  return (
    <PageLayout>
      <h1>Каталог</h1>

      <ul>
        {categories.map((c) => (
          <li key={c.id}>
            {/* Показываем картинку только если она есть */}
            {c.imageSrc && (
              <img
                src={c.imageSrc}
                alt={c.alt ?? c.name}
                width={120}
                height={120}
                style={{
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}

            {/* Название категории */}
            <div>{c.name}</div>
          </li>
        ))}
      </ul>
    </PageLayout>
  );
}
