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

import type { CatalogCategoryPreview } from "@/lib/api/catalog/types";

type HeaderClientProps = {
  categories: CatalogCategoryPreview[];
};

export default function HeaderClient({ categories }: HeaderClientProps) {
  // true — когда пользователь проскроллил ниже навбара
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
        {/* Верхняя строка */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <span className={styles.topBarLeftText}>Написать нам</span>

            <div className={styles.topBarLeftSocial}>
              <a
                className="icon"
                href="https://t.me/yourbot"
                aria-label="Telegram"
                rel="noopener noreferrer"
                target="_blank">
                <TelegramIcon />
              </a>

              <a className="icon" href="https://max.ru/xxx" aria-label="MAX" rel="noopener noreferrer" target="_blank">
                <MaxBrandIcon />
              </a>
            </div>
          </div>

          {/* Верхнее меню — вынесено в отдельный компонент */}
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

        {/* Средняя строка — вынесена в отдельный компонент */}
        <MainBar categories={categories} />
      </Container>
    </header>
  );
}
