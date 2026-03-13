// src/sections/home/banners/Banners.tsx
// Два рекламных баннера на главной — пока с плейсхолдерами.

import Image from "next/image";
import styles from "./Banners.module.css";
import PageLayout from "@/components/layout/PageLayout";

export default function Banners() {
  return (
    <PageLayout>
      <section className={styles.section}>
        {/* Баннер 1 */}
        <div className={styles.banner}>
          <Image src="/images/catalog/product-placeholder.webp" alt="Баннер 1" fill className={styles.image} />
        </div>

        {/* Баннер 2 */}
        <div className={styles.banner}>
          <Image src="/images/catalog/product-placeholder.webp" alt="Баннер 2" fill className={styles.image} />
        </div>
      </section>
    </PageLayout>
  );
}
