"use client";

import { useRouter } from "next/navigation";
import styles from "./BackButton.module.css";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    // Если есть история — возвращаемся назад
    if (window.history.length > 1) {
      router.back();
      return;
    }

    // Иначе — fallback на список
    router.push("/knowledge");
  };

  return (
    <button type="button" className={styles.button} onClick={handleBack} aria-label="Вернуться назад">
      ← Вернуться назад
    </button>
  );
}
