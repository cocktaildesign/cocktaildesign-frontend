import Link from "next/link";
import Image from "next/image";
import styles from "./MobileCatalogShortcuts.module.css";

type Item = {
  href: string;
  title: string;
  image?: string;
};

const items: Item[] = [
  {
    href: "/catalog",
    title: "Каталог",
    image: "/images/home/1.webp",
  },
  {
    href: "/knowledge",
    title: "Знания",
    image: "/images/home/2.webp",
  },
  {
    href: "/legal/requisites",
    title: "Реквизиты",
    image: "/images/home/3.webp",
  },
  {
    href: "/branding",
    title: "Брендинг",
    image: "/images/home/5.webp",
  },
  {
    href: "/contacts",
    title: "Контакты",
    image: "/images/home/4.webp",
  },
  {
    href: "/shipping",
    title: "Доставка",
    image: "/images/home/6.webp",
  },
  {
    href: "/payment-methods",
    title: "Оплата",
    image: "/images/home/7.webp",
  },
];

export default function MobileCatalogShortcuts() {
  return (
    <section className={styles.section}>
      <div className={styles.list}>
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={styles.card}>
            <div className={styles.media}>
              <Image
                src={item.image || "/images/catalog/product-placeholder.webp"}
                alt={item.title}
                fill
                sizes="80px"
                className={styles.image}
              />
            </div>

            <div className={styles.caption}>
              <span className={styles.title}>{item.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
