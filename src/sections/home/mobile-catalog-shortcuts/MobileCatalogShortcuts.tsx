import Link from "next/link";
import Image from "next/image";

import type { MobileNavigationItem } from "@/lib/api/mobile-navigation";
import { resolveHomeImageUrl } from "@/lib/api/mobile-navigation";

import styles from "./MobileCatalogShortcuts.module.css";

type Props = {
  items: MobileNavigationItem[];
};

export default function MobileCatalogShortcuts({ items }: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.list}>
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={styles.card}>
            <div className={styles.media}>
              <Image
                src={resolveHomeImageUrl(item.href, item.homeImageUrl)}
                alt={item.title}
                fill
                sizes="92px"
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
