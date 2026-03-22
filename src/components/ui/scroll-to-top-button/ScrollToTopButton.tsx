"use client";

import { useEffect, useState } from "react";
import styles from "./ScrollToTopButton.module.css";
import ArrowUpIcon from "@/components/icons/ArrowUpIcon";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 500);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function handleClick() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${isVisible ? styles.visible : ""}`}
      onClick={handleClick}
      aria-label="Прокрутить наверх">
      <ArrowUpIcon className={styles.icon} />
    </button>
  );
}
