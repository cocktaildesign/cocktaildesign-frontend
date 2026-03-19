// src/components/layout/header/HeaderClient.tsx
"use client";

import { useState, useEffect } from "react";
import Container from "@/components/layout/Container";
import styles from "./Header.module.css";

import TopNav from "@/components/layout/header/top-nav/TopNav";
import MainBar from "@/components/layout/header/main-bar/MainBar";
import InfoIcon from "@/components/icons/InfoIcon";
import TelegramIcon from "@/components/icons/TelegramIcon";
import MaxBrandIcon from "@/components/icons/MaxIcon";

import type { CatalogCategoryPreview, CatalogCollection } from "@/lib/api/catalog/types";

type HeaderClientProps = {
  categories: CatalogCategoryPreview[];
  collections: CatalogCollection[]; // ← новое
};

export default function HeaderClient({ categories, collections }: HeaderClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 57);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={isScrolled ? styles.headerScrolled : styles.header}>
      <Container>
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <span className={styles.topBarLeftText}>Написать нам</span>

            <div className={styles.topBarLeftSocial}>
              <a
                className="icon"
                href="https://t.me/Cocktail_Design_official"
                aria-label="Telegram"
                rel="noopener noreferrer"
                target="_blank">
                <TelegramIcon />
              </a>

              <a
                className="icon"
                href="https://max.ru/join/QQKS8__nbdrJTvRVrRSCdMBqinbSTzi34ReNX1TJw80"
                aria-label="MAX"
                rel="noopener noreferrer"
                target="_blank">
                <MaxBrandIcon />
              </a>
            </div>
          </div>

          <TopNav />

          <address className={styles.topBarContact}>
            <div className={styles.infoTooltip}>
              <InfoIcon className={styles.infoIcon} title="Часы работы" />

              <div className={styles.infoDropdown}>
                <div className={styles.infoDropdownContent}>
                  <p className={styles.infoDropdownText}>Звонок бесплатный</p>

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

            <a className={`${styles.linkBase} ${styles.phoneLink}`} href="tel:+78002221100">
              8 (995) 622-62-02
            </a>
          </address>
        </div>

        {/* Передаём и categories и collections */}
        <MainBar categories={categories} collections={collections} />
      </Container>
    </header>
  );
}
