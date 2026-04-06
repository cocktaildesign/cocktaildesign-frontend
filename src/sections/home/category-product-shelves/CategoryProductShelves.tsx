import Link from "next/link";

import ContainerNoPaddingMobil from "@/components/layout/ContainerNoPaddingMobil";
import ProductsSlider from "../../../components/ui/products-slider/ProductsSlider";
import ProductCard from "../product-card/HomeProductCard";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";

import type { CatalogCollection } from "@/lib/api/catalog/types";

import styles from "./CategoryProductShelves.module.css";

type CategoryProductShelvesProps = {
  collections: CatalogCollection[];
  collectionSlug: string;
};

export default function CategoryProductShelves({ collections, collectionSlug }: CategoryProductShelvesProps) {
  const normalizedSlug = collectionSlug.trim();

  if (!normalizedSlug) {
    return null;
  }

  const collection = collections.find((item) => item.slug === normalizedSlug);

  if (!collection) {
    return null;
  }

  if (collection.products.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <ContainerNoPaddingMobil>
        <div className={styles.shelf}>
          <div className={styles.header}>
            <h2 className={styles.title}>{collection.title}</h2>

            {collection.viewAllHref && (
              <Link href="/catalog" className={styles.viewAllLink}>
                <span className={styles.viewAllText}>Все</span>
                <ArrowRightIcon className={styles.viewAllIcon} title="Вперёд" />
              </Link>
            )}
          </div>

          <ProductsSlider>
            {collection.products.map((product) => (
              <div key={product.id} className={styles.slide}>
                <ProductCard product={product} />
              </div>
            ))}
          </ProductsSlider>
        </div>
      </ContainerNoPaddingMobil>
    </section>
  );
}
