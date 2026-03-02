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

        <div className={styles.productMeta}>
          <p className={styles.productSku}>
            Артикул товара: <span>000000</span>
          </p>
        </div>

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
          <div className={styles.productInfo}></div>
          <div className={styles.productSidebar}>
            <div className={styles.productPurchase}>
              <p className={styles.productPurchasePrice}>{product.price} ₽</p>
              <div className={styles.productActions}>
                <button className={styles.addToCartButton}>
                  <CartIcon></CartIcon>
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
        </div>
      </section>
    </PageLayout>
  );
}
