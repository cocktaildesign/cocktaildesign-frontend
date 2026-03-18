"use client";

import ArrowBackIcon from "@/components/icons/ArrowBackIcon";
import styles from "./ProductPage.module.css";

export default function ScrollToDescriptionButton() {
  return (
    <a
      href="#product-description"
      className={styles.productAboutButton}
      onClick={(e) => {
        e.preventDefault();
        document.getElementById("product-description")?.scrollIntoView({ behavior: "smooth" });
      }}>
      <span className={styles.productAboutButtonText}>Перейти к описанию</span>
      <ArrowBackIcon className={styles.productAboutButtonIcon} />
    </a>
  );
}
