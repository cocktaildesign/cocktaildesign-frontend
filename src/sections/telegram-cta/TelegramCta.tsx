import Image from "next/image";
import styles from "./TelegramCta.module.css";
import TelegramIcon from "@/components/icons/social-network/TelegramIcon";

export default function TelegramBanner() {
  return (
    <section className={styles.banner} aria-labelledby="tg-banner-title">
      <div className={styles.content}>
        <h2 id="tg-banner-title" className={styles.title}>
          Больше лекций и новых материалов — в Telegram
        </h2>

        <p className={styles.description}>
          Публикуем свежие видео, статьи и полезные разборы. Многое из нашего телеграм канала не попадает на сайт.
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

      <div className={styles.qrBlock}>
        <div className={styles.qrFrame}>
          <Image
            src="/images/qr/tgQrNoBackGround.png"
            alt="QR-код Telegram канала Cocktail Design"
            fill
            className={styles.qrImage}
            sizes="160px"
          />
        </div>

        <p className={styles.qrHint}>Или отсканируйте QR-код</p>
      </div>
    </section>
  );
}
