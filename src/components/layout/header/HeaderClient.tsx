//frontend/src/components/layout/header/HeaderClient.tsx
"use client";

import { useEffect, useState } from "react";
import ContainerHeader from "@/components/layout/ContainerNoPaddingMobil";
import TopNav from "@/components/layout/header/top-nav/TopNav";
import MainBar from "@/components/layout/header/main-bar/MainBar";
import InfoIcon from "@/components/icons/InfoIcon";
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
          {/* Левая часть: текст и соцсети */}
          <div className={styles.topBarLeft}>
            <span className={styles.topBarLeftText}>Написать нам</span>

            <div className={styles.topBarLeftSocial}>
              <a
                className="icon"
                href="https://t.me/Cocktail_Design_official"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram">
                <TelegramIcon />
              </a>

              <a
                className="icon"
                href="https://max.ru/join/QQKS8__nbdrJTvRVrRSCdMBqinbSTzi34ReNX1TJw80"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MAX">
                <MaxBrandIcon />
              </a>
            </div>
          </div>

          {/* Верхнее меню */}
          <TopNav />

          {/* Контакты и график работы */}
          <address className={styles.topBarContact}>
            <div className={styles.infoTooltip}>
              <InfoIcon className={styles.infoIcon} title="Часы работы" />

              <div className={styles.infoDropdown}>
                <div className={styles.infoDropdownContent}>
                  <p className={styles.infoDropdownText}>Часы работы:</p>

                  <ul className={styles.infoDropdownSchedule}>
                    <li>
                      Пн–Пт: <time>10:00–18:00</time>
                    </li>
                    <li>
                      Сб–Вс: <time>10:00–17:00</time>
                    </li>
                  </ul>

                  <p className={styles.infoDropdownTitle}>Email</p>

                  <a href="mailto:cocktaildesign@yandex.ru" className={styles.infoDropdownEmail}>
                    cocktaildesign@yandex.ru
                  </a>
                </div>
              </div>
            </div>

            <a
              className={`${styles.linkBase} ${styles.phoneLink}`}
              href="tel:+79956226202"
              aria-label="Позвонить 8 (995) 622-62-02">
              <span className={styles.phoneText}>8 (995) 622-62-02</span>

              <span className={styles.phoneIcon}>
                <PhoneIcon />
              </span>
            </a>
          </address>
        </div>

        {/* Основная строка хедера */}
        <MainBar categories={categories} collections={collections} />
      </ContainerHeader>
    </header>
  );
}
