// Telegram.tsx
import Image from "next/image";
import styles from "./Telegram.module.css";
import TelegramIcon from "@/components/icons/social-network/TelegramIcon";

export default function TelegramBanner() {
  return (
    <section className={styles.banner} aria-labelledby="tg-banner-title">
      {/* Текстовый блок */}
      <div className={styles.content}>
        <h2 id="tg-banner-title" className={styles.title}>
          Подписывайтесь на наш Telegram
        </h2>

        <p className={styles.description}>
          Новинки, акции и советы по выбору барного инвентаря — первыми узнаете в канале.
        </p>

        <a
          className={styles.ctaButton}
          href="https://t.me/Cocktail_Design_official"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Открыть Telegram-канал Cocktail Design в новой вкладке">
          <TelegramIcon />
          Перейти в Telegram
        </a>
      </div>

      {/* QR-код */}
      <div className={styles.qrFrame}>
        <Image
          src="/images/qr/iphoneTgQr.png"
          alt="QR-код Telegram канала Cocktail Design"
          fill
          className={styles.qrImage}
          sizes="160px"
        />
      </div>
    </section>
  );
}
