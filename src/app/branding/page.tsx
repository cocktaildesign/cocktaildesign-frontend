// frontend/src/app/branding/page.tsx
import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import styles from "./Branding.module.css";
import BrandingGuide from "./BrandingGuide";

export const metadata = pageMetadata({
  title: "Брендинг и изготовление на заказ",
  description:
    "Лазерная гравировка на барном инвентаре, клише для оттисков и изготовление по вашему дизайну. Примеры работ, цены и условия заказа Cocktail Design.",
  canonical: "/branding",
});

export default function Branding() {
  return (
    <PageLayout className={styles.pageLayout} breadcrumbsItems={[{ href: "/", label: "Главная" }, { href: "/branding", label: "Брендинг" }]}>
      <section className={styles.page}>
        <header className={styles.intro}>
          <h1>Брендинг и изготовление на заказ</h1>
          <p>Логотип на готовом изделии, клише для оттисков или инструмент по вашему эскизу.</p>
        </header>
        <BrandingGuide />
      </section>
    </PageLayout>
  );
}
