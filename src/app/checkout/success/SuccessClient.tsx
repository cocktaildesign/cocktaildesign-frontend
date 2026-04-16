"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TelegramIcon from "@/components/icons/TelegramIcon";
import CheckIcon from "@/components/icons/cart/CheckIcon";
import PhoneIcon from "@/components/icons/header/PhoneIcon";
import styles from "./Success.module.css";

export default function SuccessClient() {
  // Номер заказа из URL — /checkout/success?order=31391
  const searchParams = useSearchParams();
  const orderName = searchParams.get("order");

  return (
    <div className={styles.successState}>
      <div className={styles.successCard}>
        {/* Иконка */}
        <div className={styles.successIcon}>
          <CheckIcon color="green" width="24" height="24" />
        </div>

        {/* Заголовок */}
        <h1 className={styles.successTitle}>Спасибо! Заказ оформлен</h1>

        {/* Номер заказа */}
        {orderName && (
          <p className={styles.successOrder}>
            Ваш заказ: <strong>№{orderName}</strong>
          </p>
        )}

        {/* Текст */}
        <p className={styles.successDescription}>
          Менеджер свяжется с вами в ближайшее время для подтверждения заказа и уточнения деталей доставки.
        </p>

        {/* Контакты поддержки */}
        <div className={styles.successContacts}>
          <p className={styles.successContactsTitle}>Если есть вопросы — мы на связи:</p>

          <a href="tel:+79956226202" className={styles.successContact}>
            <PhoneIcon width="16" height="16" />
            <span>8 (995) 622-62-02</span>
          </a>

          <a
            href="https://t.me/Cocktail_Design_official"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.successContact}>
            <TelegramIcon width="16" height="16" />
            <span>Telegram</span>
          </a>
        </div>

        {/* Кнопки */}
        <div className={styles.successActions}>
          <Link href="/catalog" className={styles.primaryButton}>
            Продолжить покупки
          </Link>

          <Link href="/" className={styles.secondaryButton}>
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
