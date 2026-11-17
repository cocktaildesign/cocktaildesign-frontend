import Link from "next/link";
import type { MouseEventHandler } from "react";
import NavigationIcon from "./NavigationIcon";
import styles from "./NavigationTile.module.css";

type Props = {
  title: string;
  href: string;
  active?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export default function NavigationTile({ title, href, active = false, onClick }: Props) {
  return (
    <Link href={href} className={`${styles.tile} ${active ? styles.active : ""}`} aria-current={active ? "page" : undefined} onClick={onClick}>
      <span className={styles.icon}><NavigationIcon href={href} /></span>
      <span className={styles.label}>{title}</span>
    </Link>
  );
}
