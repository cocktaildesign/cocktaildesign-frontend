"use client";
import { useState } from "react";
import styles from "./ServiceCards.module.css";
import SideModal from "@/components/ui/side-modal/SideModal";
import { LaserContent } from "./LaserContent/LaserContent";
import { CustomContent } from "./CustomContent/CustomContent";

export default function ServiceCards() {
  // Состояние: пустая строка = закрыто, "laser"/"custom" = открыто
  const [activeService, setActiveService] = useState("");
  /* "" = модалка закрыта
   "laser" = открыта Лазерная гравировка
   "custom" = открыто Индивидуальное производство */

  return (
    <div className={styles.servicesGrid}>
      {/* Карточка 1 */}
      <button
        type="button"
        className={`${styles.serviceCard} ${styles.serviceCardLaser}`}
        onClick={() => setActiveService("laser")}>
        <div className={styles.serviceCardContent}>
          <h2 className={styles.servicesGridTitle}>Лазерная гравировка</h2>
          <p className={styles.servicesGridDescription}>
            Мы переносим ваш логотип или изображение на металлические изделия из нашего каталога, превращая стандартный
            инвентарь в элемент бренда.
          </p>
        </div>
        <span className={styles.cardOverlay}>Подробнее...</span>
      </button>

      {/* Карточка 2 */}
      <button
        type="button"
        className={`${styles.serviceCard} ${styles.serviceCardCustom}`}
        onClick={() => setActiveService("custom")}>
        <div className={styles.serviceCardContent}>
          <h2 className={styles.servicesGridTitle}>Индивидуальное производство</h2>
          <p className={styles.servicesGridDescription}>
            Мы разрабатываем и производим барный инвентарь по индивидуальным чертежам и эскизам, создавая уникальные
            решения для вашего бренда.
          </p>
        </div>
        <span className={styles.cardOverlay}>Подробнее...</span>
      </button>

      {/* Модалка */}
      <SideModal isOpen={activeService !== ""} onClose={() => setActiveService("")}>
        {activeService === "laser" && <LaserContent />}
        {activeService === "custom" && <CustomContent />}
      </SideModal>
    </div>
  );
}
