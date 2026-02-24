import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import styles from "./Catalog.module.css";
import { getTopCategoriesFromStrapi } from "@/lib/api/catalog";
import Image from "next/image";

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
        {categories.map((category) => (
          <li key={category.id}>
            {category.imageSrc && (
              <Image
                src={category.imageSrc}
                alt={category.alt ?? category.name}
                width={120}
                height={120}
                // небольшой UX: чтобы картинка не "растягивалась"
                style={{ objectFit: "cover", display: "block" }}
              />
            )}

            <div>{category.name}</div>
          </li>
        ))}
      </ul>
    </PageLayout>
  );
}
