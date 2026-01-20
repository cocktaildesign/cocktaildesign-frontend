"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Breadcrumbs.module.css";

const LABELS: { [path: string]: string } = {
  "/about": "О нас",
  "/about/contacts": "Контакты",
  "/catalog": "Каталог",
  "/help": "Помощь",
  "/legal": "Правовая информация",
  "/legal/requisites": "Реквизиты",
};

type Crumb = { href: string; label: string };

export default function Breadcrumbs() {
  const pathname = usePathname();

  if (!pathname) return null;
  if (pathname === "/") return null;

  const rawSegments = pathname.split("/");
  const segments = rawSegments.filter((segment) => segment.length > 0);

  const crumbs: Crumb[] = [{ href: "/", label: "Главная" }];
  let accumulator = "";

  for (const segment of segments) {
    accumulator += `/${segment}`;

    const label = LABELS[accumulator];
    if (!label) continue;

    crumbs.push({ href: accumulator, label });
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav className={styles.nav} aria-label="Хлебные крошки">
      <ol className={styles.list}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          const content = isLast ? (
            <span className={styles.current} aria-current="page">
              {crumb.label}
            </span>
          ) : (
            <Link className={styles.link} href={crumb.href}>
              {crumb.label}
            </Link>
          );

          return (
            <li className={styles.item} key={crumb.href}>
              {content}
              {!isLast && (
                <span className={styles.separator} aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
