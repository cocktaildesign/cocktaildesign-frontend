//frontend/src/components/layout/header/HeaderClient.tsx
"use client";

import { useEffect, useState } from "react";
import ContainerHeader from "@/components/layout/ContainerNoPaddingMobil";
import TopNav from "@/components/layout/header/top-nav/TopNav";
import MainBar from "@/components/layout/header/main-bar/MainBar";
import TelegramIcon from "@/components/icons/TelegramIcon";
import MaxBrandIcon from "@/components/icons/MaxIcon";
import PhoneIcon from "@/components/icons/header/PhoneIcon";

import type { CatalogCategoryPreview, CatalogCollection } from "@/lib/api/catalog/types";

import styles from "./Header.module.css";

type HeaderClientProps = {
  categories: CatalogCategoryPreview[];
  collections: CatalogCollection[];
};

const SCROLL_OFFSET = 57;

export default function HeaderClient({ categories, collections }: HeaderClientProps) {
  // Состояние хедера после скролла
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Проверяем, ушла ли верхняя строка за границу экрана
    function handleScroll() {
      setIsScrolled(window.scrollY > SCROLL_OFFSET);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ""}`}>
      <ContainerHeader>
        {/* Верхняя строка хедера */}
        <div className={styles.topBar}>
          <TopNav />

          <div className={styles.contacts}>
            <span className={styles.contactLabel}>Написать</span>

            <div className={styles.messengers}>
              <a
                className="icon"
                href="https://t.me/Manager_cocktail_design"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Написать нам в Telegram">
                <TelegramIcon />
              </a>

              <a
                className="icon"
                href="https://max.ru/u/f9LHodD0cOLWKnOz-T53SpORKXEy2ENCK_4sq882r9L9MRQzWWDdeYS4daM"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Написать нам в MAX">
                <MaxBrandIcon />
              </a>
            </div>

            <a
              className={styles.phoneLink}
              href="tel:+79956226202"
              aria-label="Позвонить +7 (995) 622-62-02">
              <span className={styles.phoneText}>+7 (995) 622-62-02</span>

              <span className={styles.phoneIcon}>
                <PhoneIcon />
              </span>
            </a>
          </div>
        </div>

        {/* Основная строка хедера */}
        <MainBar categories={categories} collections={collections} />
      </ContainerHeader>
    </header>
  );
}
