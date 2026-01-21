import Image from "next/image";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { pageMetadata } from "@/lib/seo/metadata";
import styles from "./LegalPage.module.css";

export const metadata = pageMetadata({
  title: "Правовая информация",
  description: "Официальные документы и условия CocktailDesign",
  canonical: "/legal",
});

type LegalCard = {
  href: string;
  title: string;
  description: string;
  imageSrc: string;
};

const CARDS: LegalCard[] = [
  {
    href: "/legal/requisites",
    title: "Реквизиты",
    description: "Банковские реквизиты и данные продавца для оплаты и договоров.",
    imageSrc: "/images/legal/requisites.webp",
  },
  {
    href: "/legal/privacy-policy",
    title: "Политика конфиденциальности",
    description: "Какие данные мы собираем, как используем и как храним.",
    imageSrc: "/images/legal/privacy-policy.webp",
  },
  {
    href: "/legal/returns",
    title: "Условия возврата товара",
    description: "Порядок возврата и обмена, сроки, условия и исключения.",
    imageSrc: "/images/legal/returns.webp",
  },
  {
    href: "/legal/offer",
    title: "Публичная оферта",
    description: "Условия продажи, оплаты, доставки и оформления заказов.",
    imageSrc: "/images/legal/offer.webp",
  },
  {
    href: "/legal/terms",
    title: "Пользовательское соглашение",
    description: "Правила пользования сайтом и ответственность сторон.",
    imageSrc: "/images/legal/terms.webp",
  },
];

export default function LegalPage() {
  return (
    <PageLayout>
      <section className={styles.legalSection}>
        <h1 className={styles.legalTitle}>Правовая информация</h1>

        <div className={styles.legalGrid}>
          {CARDS.map((card) => (
            <Link key={card.href} href={card.href} className={styles.legalCard}>
              <div className={styles.legalCardMedia} aria-hidden="true">
                <Image
                  src={card.imageSrc}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 45vw, (max-width: 1280px) 22vw, 260px"
                  className={styles.legalCardImage}
                  priority={false}
                />
              </div>

              <div className={styles.legalCardBody}>
                <h2 className={styles.legalCardTitle}>{card.title}</h2>
                <p className={styles.legalCardDesc}>{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
