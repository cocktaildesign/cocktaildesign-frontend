import type { MobileNavigationItem } from "@/lib/api/mobile-navigation";
import NavigationTile from "@/components/navigation/NavigationTile";
import styles from "./MobileCatalogShortcuts.module.css";

type Props = {
  items: MobileNavigationItem[];
};

export default function MobileCatalogShortcuts({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <nav className={styles.section} aria-label="Разделы магазина">
      <div className={styles.list}>
        {items.map((item) => (
          <NavigationTile key={item.href} href={item.href} title={item.title} />
        ))}
      </div>
    </nav>
  );
}
