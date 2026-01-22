import Image from "next/image";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { pageMetadata } from "@/lib/seo/metadata";
import styles from "./SupportPage.module.css";

export const metadata = pageMetadata({
  title: "Поддержка",
  description: "Свяжитесь с нами или сообщите о проблеме",
  canonical: "/support",
});

type SupportCard = {
  href: string;
  title: string;
  description: string;
  imageSrc: string;
};

const CARDS: SupportCard[] = [
  {
    href: "/support/feedback",
    title: "Обратная связь",
    description: "Сообщите об ошибке или предложите улучшение.",
    imageSrc: "/images/legal/terms.webp",
  },
];

export default function SupportPage() {
  return (
    <PageLayout>
      <section className={styles.section}>
        <h1 className={styles.title}>Поддержка</h1>

        <div className={styles.grid}>
          {CARDS.map((card) => (
            <Link key={card.href} href={card.href} className={styles.card}>
              <div className={styles.cardMedia} aria-hidden="true">
                <Image src={card.imageSrc} alt="" fill sizes="260px" className={styles.cardImage} />
              </div>

              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>{card.title}</h2>
                <p className={styles.cardDesc}>{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
