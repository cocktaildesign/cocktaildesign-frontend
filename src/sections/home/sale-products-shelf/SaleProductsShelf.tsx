import Link from "next/link";

import ContainerNoPaddingMobil from "@/components/layout/ContainerNoPaddingMobil";
import ProductsSlider from "../../../components/ui/products-slider/ProductsSlider";
import ProductCard from "../product-card/HomeProductCard";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";

import type { CatalogCollection } from "@/lib/api/catalog/types";

import styles from "./SaleProductsShelf.module.css";

type SaleProductsShelfProps = {
  collection: CatalogCollection | null;
};

export default function SaleProductsShelf({ collection }: SaleProductsShelfProps) {
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
          {/* Верхняя часть полки */}
          <div className={styles.header}>
            <h2 className={styles.title}>
              Скидки <span className={styles.desktopOnly}>в Cocktail Design</span>
            </h2>

            {collection.viewAllHref && (
              <Link href={collection.viewAllHref} className={styles.viewAllLink}>
                <span className={styles.viewAllText}>Все</span>
                <ArrowRightIcon className={styles.viewAllIcon} title="Вперёд" />
              </Link>
            )}
          </div>

          {/* Слайдер с товарами */}
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
