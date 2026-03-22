import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import styles from "./Branding.module.css";
import Logo from "@/components/ui/logo/Logo";
import ServiceCards from "./service-cards/ServiceCards";

export const metadata = pageMetadata({
  title: "Брендинг барного инвентаря и аксессуаров",
  description:
    "Мы создаём кастомизированный барный инвентарь и аксессуары, которые подчёркивают характер бренда и помогают заведениям выделяться среди конкурентов.",
  canonical: "/branding",
});

export default function Branding() {
  return (
    <PageLayout>
      <section className={styles.brandingPage}>
        <div className={styles.brandingContainer}>
          <div className={styles.brandingContainerTextContent}>
            <h1 className={styles.brandingContainerTitle}>Брендинг барного инвентаря и аксессуаров</h1>

            <p className={styles.brandingContainerDescription}>
              Мы создаём кастомизированный барный инвентарь и аксессуары, которые подчёркивают характер бренда и
              помогают заведениям выделяться среди конкурентов.
            </p>
          </div>

          <Logo className={styles.logo} />
        </div>

        <div className={styles.servicesIntro}>
          <p className={styles.servicesIntroText}>
            Мы предлагаем два формата брендинга барного инвентаря, которые позволяют адаптировать изделия под стиль
            вашего бренда и уровень кастомизации.
          </p>
        </div>

        <ServiceCards />
      </section>
    </PageLayout>
  );
}
