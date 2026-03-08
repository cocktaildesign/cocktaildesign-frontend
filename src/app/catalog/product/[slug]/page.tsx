// src/app/catalog/product/[slug]/page.tsx
//
// Server Component — данные грузятся на сервере, клиенту уходит готовый HTML.
// Интерактивные части (кнопки, количество, избранное) вынесены в ProductPurchaseControls.

import { notFound } from "next/navigation";
import { getStrapiMediaUrl } from "@/lib/api/strapi/media";
import Link from "next/link";
import Image from "next/image";
import ProductGallery from "./ProductGallery";
import PageLayout from "@/components/layout/PageLayout";
import { getProductBySlugFromStrapi } from "@/lib/api/catalog";
import ProductPurchaseControls from "./ProductPurchaseControls";
import MouseScrollIcon from "@/components/icons/product-page/MouseScrollIcon";

import styles from "./ProductPage.module.css";

const PLACEHOLDER_IMG = "/images/catalog/product-placeholder.webp";

// Типы для App Router: params приходит как Promise в Next.js 15+
type Params = { slug: string };
type PageProps = { params: Promise<Params> };

// Один формат изображения (thumbnail / small / medium / large)
type ImageFormat = {
  url: string;
};

// Набор возможных размеров изображения из Strapi
type ProductImageFormats = {
  thumbnail?: ImageFormat;
  small?: ImageFormat;
  medium?: ImageFormat;
  large?: ImageFormat;
} | null;

// Один объект изображения товара
type ProductImage = {
  url: string; // оригинальное изображение
  alternativeText?: string | null; // alt текст из Strapi
  formats?: ProductImageFormats; // набор ресайзов
};

// Атрибуты товара из API
type RelatedProductAttributes = {
  name: string | null; // название товара
  slug: string | null; // slug для страницы товара
  price: number | null; // текущая цена
  priceOld: number | null; // старая цена
  image: ProductImage[] | null; // массив изображений или null
};

// Один товар из ответа API
type RelatedProduct = {
  id: number;
  attributes: RelatedProductAttributes;
};

// Полный ответ endpoint `/api/catalog/products`
type RelatedProductsResponse = {
  items: RelatedProduct[]; // список товаров
  total: number; // всего товаров в категории
  limit: number; // limit запроса
  offset: number; // offset запроса
  hasMore: boolean; // есть ли ещё товары
};

// Запрос для получения блока похожие товары
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.cocktaildesign.ru/api";

async function getRelatedProducts(params: {
  categorySlug: string;
  limit: number;
  offset: number;
}): Promise<RelatedProductsResponse | null> {
  const { categorySlug, limit, offset } = params;

  if (!categorySlug) return null;

  const url = new URL(`${API_BASE}/catalog/products`);
  url.searchParams.set("categorySlug", categorySlug);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;

  return (await res.json()) as RelatedProductsResponse;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  // Загружаем данные товара с бэкенда
  const data = await getProductBySlugFromStrapi(slug);

  // Если товар не найден — показываем стандартную 404-страницу Next.js
  if (!data) notFound();

  const { product, breadcrumbsCategories } = data;

  // variants может отсутствовать, если товар без вариантов — используем пустой массив
  const variants = data.variants ?? [];

  // images может отсутствовать (товар без фото) — используем пустой массив
  const images = product.images ?? [];

  // specifications может отсутствовать — используем пустой массив

  const specifications = product.specifications ?? [];

  // ─── Характеристики вариантов ─────────────────────────────────────────────
  // Собираем уникальные значения по каждой характеристике:
  // { "цвет": ["чёрный", "золото"], "объём": ["30/60"] }
  const characteristicsByName: Record<string, string[]> = {};

  for (const variant of variants) {
    const characteristics = variant.characteristics ?? [];

    for (const ch of characteristics) {
      const name = ch.name.trim();
      const value = ch.value.trim();

      // Пропускаем пустые значения
      if (!name || !value) continue;

      // Создаём массив для новой характеристики
      if (!characteristicsByName[name]) {
        characteristicsByName[name] = [];
      }

      // Добавляем только уникальные значения
      if (!characteristicsByName[name].includes(value)) {
        characteristicsByName[name].push(value);
      }
    }
  }

  // Object.entries превращает объект в массив пар [ключ, значения]
  // для удобного рендера через .map()
  const characteristicEntries = Object.entries(characteristicsByName);

  // ─── Хлебные крошки ───────────────────────────────────────────────────────
  // Формат: Главная / Каталог / [категории из бэкенда] / Название товара
  const breadcrumbsItems = [
    { href: "/", label: "Главная" },
    { href: "/catalog", label: "Каталог" },
    ...breadcrumbsCategories.map((c) => ({
      href: `/catalog/${c.slug}`,
      label: c.name,
    })),
    { href: `/catalog/product/${product.slug}`, label: product.name },
  ];

  // берём "верхнюю" категорию товара
  const relatedCategorySlug = breadcrumbsCategories[0]?.slug ?? "";

  // запрашиваем товары
  const relatedResponse = await getRelatedProducts({
    categorySlug: relatedCategorySlug,
    limit: 1000,
    offset: 0,
  });

  // убираем текущий товар
  const relatedItems = (relatedResponse?.items ?? []).filter((item) => {
    const itemSlug = item.attributes.slug ?? "";
    return itemSlug && itemSlug !== product.slug;
  });
  console.log("GALLERY IMAGES", images);

  return (
    <PageLayout breadcrumbsItems={breadcrumbsItems}>
      <section className={styles.productPage}>
        {/* Заголовок товара */}
        <header className={styles.productPageHeader}>
          <h1 className={styles.productPageTitle}>{product.name}</h1>
        </header>

        {/* Основная сетка: галерея | характеристики | сайдбар с ценой */}
        <div className={styles.productLayout}>
          <div className={styles.productMeta}>
            <p className={styles.productMetaSku}>
              Артикул: <span>{product.moyskladId}</span>
            </p>
          </div>
          {/* ── /ГАЛЕРЕЯ ──────────────────────────────────────────────────── */}
          <ProductGallery images={images} />

          {/* ── ИНФОРМАЦИЯ О ТОВАРЕ ─────────────────────────────────────── */}
          <div className={styles.productInfo}>
            {/* Варианты (цвет, объём и т.д.) — показываем только если они есть */}
            {variants.length > 0 && characteristicEntries.length > 0 ? (
              <div className={styles.productVariants}>
                {characteristicEntries.map(([name, values]) => (
                  <div key={name} className={styles.productVariant}>
                    <span className={styles.productInfoTitle}>{name}</span>

                    <ul className={styles.productVariantValues}>
                      {values.map((value) => (
                        <li key={value} className={styles.productVariantValue}>
                          {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Характеристики товара */}
            <div>
              <h2 className={styles.productInfoTitle}>О товаре</h2>

              {specifications.map((spec) => (
                <div key={spec.id} className={styles.specRow}>
                  <div className={styles.specLeft}>
                    <span className={styles.specLabel}>{spec.label}</span>
                  </div>

                  <div className={styles.specValue}>
                    {spec.href ? (
                      <Link href={spec.href} className={styles.specLink}>
                        {spec.value}
                      </Link>
                    ) : (
                      spec.value
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* ── /ИНФОРМАЦИЯ ───────────────────────────────────────────────── */}

          {/* ── САЙДБАР: цена и кнопки покупки ─────────────────────────── */}
          <div className={styles.productSidebar}>
            <div className={styles.productPurchase}>
              <span className={styles.productPurchasePriceTitle}>Ваша цена: </span>
              <p className={styles.productPurchasePrice}>{product.price} ₽</p>

              {/*
                ProductPurchaseControls — Client Component.
                Всё интерактивное (счётчик, гравировка, корзина) живёт там.
                Сюда передаём только id, чтобы знать какой товар добавлять.
              */}
              <ProductPurchaseControls productId={product.id} />
            </div>
          </div>
          {/* ── /САЙДБАР ──────────────────────────────────────────────────── */}

          {/* ── ОПИСАНИЕ ТОВАРА (на всю ширину, внизу) ──────────────────── */}
          {product.description?.trim() ? (
            <div className={styles.productDescription}>
              <h2 className={styles.productDescriptionTitle}>Описание</h2>
              <div className={styles.productDescriptionText}>{product.description}</div>
            </div>
          ) : null}
          {/* ── /ОПИСАНИЕ ─────────────────────────────────────────────────── */}

          {/* ── ПОХОЖИЕ ТОВАРЫ  ──────────────────── */}
          <section className={styles.related} aria-label="Похожие товары">
            <h2 className={styles.relatedTitle}>
              Аналогичные товары
              <MouseScrollIcon className={styles.relatedScrollIcon} />
            </h2>
            <ul className={styles.relatedList}>
              {relatedItems.map((item) => {
                const itemSlug = item.attributes.slug ?? "";
                const itemName = item.attributes.name ?? "Товар";
                const itemPrice = item.attributes.price ?? 0;

                const rawImg = item.attributes.image?.[0]?.url ?? undefined;
                const itemImg = getStrapiMediaUrl(rawImg) ?? PLACEHOLDER_IMG;

                return (
                  <li key={item.id} className={styles.relatedItem}>
                    <Link href={`/catalog/product/${itemSlug}`} className={styles.relatedCard}>
                      <div className={styles.relatedImage}>
                        <Image src={itemImg} fill alt={itemName} className={styles.relatedImageImg} />
                      </div>
                      <div className={styles.relatedCardPrice}>{itemPrice} ₽</div>
                      <div className={styles.relatedCardTitle}>{itemName}</div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
          {/* ── ПОХОЖИЕ ТОВАРЫ ─────────────────────────────────────────────────── */}
        </div>
      </section>
    </PageLayout>
  );
}
