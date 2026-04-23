import PageLayout from "@/components/layout/PageLayout";
import ProductCard from "@/app/catalog/product-card/ProductCard";
import { pageMetadata } from "@/lib/seo/metadata";
import { getDiscountedProductsFromStrapi } from "@/lib/api/catalog";

import styles from "./DiscountsProduct.module.css";

export const metadata = pageMetadata({
  title: "Товары со скидкой",
  description: "Товары со скидкой CocktailDesign",
  canonical: "/discounts-product",
});

export default async function DiscountsProductPage() {
  const response = await getDiscountedProductsFromStrapi({
    limit: 100,
    offset: 0,
  });

  const products = response.items;

  return (
    <PageLayout>
      <section className={styles.discountsProductPage}>
        <header className={styles.header}>
          <h1 className={styles.title}>Товары со скидкой</h1>

          {products.length > 0 ? (
            <p className={styles.subtitle}>Найдено товаров: {response.total}</p>
          ) : (
            <p className={styles.subtitle}>Сейчас товаров со скидкой нет</p>
          )}
        </header>

        {products.length > 0 ? (
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>
    </PageLayout>
  );
}
