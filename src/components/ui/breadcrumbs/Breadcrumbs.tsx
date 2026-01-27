"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Breadcrumbs.module.css";

const LABELS: Record<string, string> = {
  "/about": "О нас",
  "/about/contacts": "Контакты",
  "/catalog": "Каталог",
  "/help": "Помощь",
  "/legal": "Правовая информация",
  "/legal/requisites": "Реквизиты",
  "/legal/privacy-policy": "Политика конфиденциальности",
  "/legal/terms": "Пользовательское соглашение",
  "/legal/offer": "Публичная оферта",
  "/legal/returns": "Условия возврата товара",
  "/support": "Сервис и поддержка",
  "/support/feedback": "Обратная связь",
  "/knowledge": "База знаний",
};

type Crumb = { href: string; label: string };

type BreadcrumbsProps = {
  items?: Crumb[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();

  if (items && items.length > 1) {
    return renderCrumbs(items);
  }

  if (!pathname) return null;
  if (pathname === "/") return null;

  const segments = pathname.split("/").filter((segment) => segment.length > 0);

  const crumbs: Crumb[] = [{ href: "/", label: "Главная" }];
  let accumulator = "";

  for (const segment of segments) {
    accumulator = accumulator + `/${segment}`;

    const label = LABELS[accumulator];
    if (!label) continue;

    crumbs.push({ href: accumulator, label });
  }

  if (crumbs.length <= 1) return null;

  return renderCrumbs(crumbs);
}

function renderCrumbs(crumbs: Crumb[]) {
  return (
    <nav className={styles.nav} aria-label="Хлебные крошки">
      <ol className={styles.list}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li className={styles.item} key={crumb.href}>
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link className={styles.link} href={crumb.href}>
                  {crumb.label}
                </Link>
              )}

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
