// src/app/catalog/product/[slug]/page.tsx
import { notFound } from "next/navigation";
import CartIcon from "@/components/icons/CartIcon";
import PageLayout from "@/components/layout/PageLayout";
import { getProductBySlugFromStrapi } from "@/lib/api/catalog";
import styles from "./ProductPage.module.css";
import FavoriteButton from "@/components/ui/favorites/FavoriteButton";
import Image from "next/image";

type Params = { slug: string };
type PageProps = { params: Promise<Params> };

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const data = await getProductBySlugFromStrapi(slug);
  if (!data) notFound();

  const { product, breadcrumbsCategories } = data;

  // ✅ Важно: variants может отсутствовать
  const variants = data.variants ?? [];

  // 1) Собираем характеристики из variants в формат:
  //    { "цвет": ["желтый", "красный", "синий"], ... }
  const characteristicsByName: Record<string, string[]> = {};

  for (const variant of variants) {
    // ✅ Важно: characteristics может отсутствовать
    const characteristics = variant.characteristics ?? [];

    for (const ch of characteristics) {
      const name = ch.name.trim();
      const value = ch.value.trim();

      if (!name || !value) continue;

      if (!characteristicsByName[name]) {
        characteristicsByName[name] = [];
      }

      if (!characteristicsByName[name].includes(value)) {
        characteristicsByName[name].push(value);
      }
    }
  }

  const characteristicEntries = Object.entries(characteristicsByName);

  // Собираем крошки: Главная / Каталог / ...категории... / Товар
  const breadcrumbsItems = [
    { href: "/", label: "Главная" },
    { href: "/catalog", label: "Каталог" },
    ...breadcrumbsCategories.map((c) => ({ href: `/catalog/${c.slug}`, label: c.name })),
    { href: `/catalog/product/${product.slug}`, label: product.name },
  ];

  const imageSrc = product.imageUrl?.trim() ? product.imageUrl : "/images/catalog/product-placeholder.webp";

  return (
    <PageLayout breadcrumbsItems={breadcrumbsItems}>
      <section className={styles.productPage}>
        <header className={styles.productPageHeader}>
          <h1 className={styles.productPageTitle}>{product.name}</h1>
        </header>

        <div className={styles.productLayout}>
          <div className={styles.productGallery}>
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>

          <div className={styles.productInfo}>
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

            <div>
              <h2 className={styles.productInfoTitle}>О товаре</h2>

              <div className={styles.specRow}>
                <div className={styles.specLeft}>
                  <span className={styles.specLabel}>Артикул</span>
                  <span className={styles.specLine}></span>
                </div>
                <div className={styles.specValue}>000000</div>
              </div>

              <div className={styles.specRow}>
                <div className={styles.specLeft}>
                  <span className={styles.specLabel}>Тип</span>
                  <span className={styles.specLine}></span>
                </div>
                <div className={styles.specValue}>Стрейнер</div>
              </div>

              <div className={styles.specRow}>
                <div className={styles.specLeft}>
                  <span className={styles.specLabel}>Материал</span>
                  <span className={styles.specLine}></span>
                </div>
                <div className={styles.specValue}>Нержавеющая сталь</div>
              </div>
            </div>
          </div>

          <div className={styles.productSidebar}>
            <div className={styles.productPurchase}>
              <span className={styles.productPurchasePriceTitle}>Ваша цена: </span>
              <p className={styles.productPurchasePrice}>{product.price} ₽</p>

              <div className={styles.productActions}>
                <button className={styles.addToCartButton}>
                  <CartIcon />
                  <span>В корзину</span>
                </button>

                <div className={styles.favoriteButton}>
                  <FavoriteButton productId={product.id} />
                </div>
              </div>

              <button className={styles.quickOrderButton}>
                <span>Быстрый заказ</span>
              </button>
            </div>
          </div>

          {product.description?.trim() ? (
            <div className={styles.productDescription}>
              <h2 className={styles.productDescriptionTitle}>О товаре</h2>

              <div className={styles.productDescriptionText}>{product.description}</div>
            </div>
          ) : null}
        </div>
      </section>
    </PageLayout>
  );
}
