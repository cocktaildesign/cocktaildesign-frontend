// src/app/catalog/product/[slug]/ProductDetailsNavigation.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ProductPage.module.css";

type ProductDetailsNavigationProps = {
  hasDescription: boolean;
  hasSpecifications: boolean;
  hasRelatedProducts: boolean;
};

export default function ProductDetailsNavigation({
  hasDescription,
  hasSpecifications,
  hasRelatedProducts,
}: ProductDetailsNavigationProps) {
  const links = useMemo(
    () =>
      [
        hasDescription ? { href: "#product-description", label: "Описание" } : null,
        hasSpecifications ? { href: "#product-specifications", label: "Характеристики" } : null,
        hasRelatedProducts ? { href: "#product-related", label: "Товары из категории" } : null,
      ].filter(Boolean) as { href: string; label: string }[],
    [hasDescription, hasSpecifications, hasRelatedProducts],
  );

  const defaultActiveHref = links[0]?.href ?? "";
  const [activeHref, setActiveHref] = useState(defaultActiveHref);

  useEffect(() => {
    function syncActiveLinkWithHash() {
      const currentHash = window.location.hash;
      const hasCurrentHash = links.some((link) => link.href === currentHash);

      setActiveHref(hasCurrentHash ? currentHash : defaultActiveHref);
    }

    syncActiveLinkWithHash();

    window.addEventListener("hashchange", syncActiveLinkWithHash);

    return () => {
      window.removeEventListener("hashchange", syncActiveLinkWithHash);
    };
  }, [defaultActiveHref, links]);

  if (links.length === 0) {
    return null;
  }

  return (
    <nav className={styles.productDetailsNav} aria-label="Навигация по информации о товаре">
      {links.map((link) => {
        const isActive = activeHref === link.href;

        return (
          <a
            key={link.href}
            href={link.href}
            className={styles.productDetailsNavLink}
            data-active={isActive ? "true" : "false"}
            aria-current={isActive ? "page" : undefined}
            onClick={() => setActiveHref(link.href)}>
            {link.label}
          </a>
        );
      })}
    </nav>
  );
}
