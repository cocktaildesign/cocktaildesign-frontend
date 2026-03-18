import Link from "next/link";

import ProductsSlider from "../../../components/ui/products-slider/ProductsSlider";
import ProductCard from "../product-card/HomeProductCard";

import type { CatalogCollection } from "@/lib/api/catalog/types";
import PageLayout from "@/components/layout/PageLayout";
import styles from "./SaleProductsShelf.module.css";

type SaleProductsShelfProps = {
  collections: CatalogCollection[];
  collectionSlug?: string;
};

export default function SaleProductsShelf({ collections, collectionSlug = "sale" }: SaleProductsShelfProps) {
  const safeSlug = collectionSlug.trim();

  if (!safeSlug) return null;

  const collection = collections.find((item) => item.slug === safeSlug);

  if (!collection) return null;
  if (collection.products.length === 0) return null;

  return (
    <PageLayout>
      <section className={styles.section}>
        <div className={styles.shelf}>
          <div className={styles.header}>
            <h2 className={styles.title}>Скидки в Cocktail Design</h2>

            {collection.viewAllHref && (
              <Link href="/catalog/collection/sale" className={styles.viewAll}>
                Смотреть всё →
              </Link>
            )}
          </div>
          <ProductsSlider>
            {collection.products.map((product) => (
              <div key={product.id} className={styles.slide}>
                <ProductCard product={product} />
              </div>
            ))}
          </ProductsSlider>{" "}
        </div>
      </section>
    </PageLayout>
  );
}
