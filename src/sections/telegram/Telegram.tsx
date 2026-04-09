import Image from "next/image";

import Container from "@/components/layout/Container";
import TelegramIcon from "@/components/icons/social-network/TelegramIcon";

import styles from "./Telegram.module.css";

export default function TelegramBanner() {
  return (
    <section className={styles.section} aria-labelledby="tg-banner-title">
      <Container>
        <div className={styles.banner}>
          {/* Текстовый блок */}
          <div className={styles.content}>
            <h2 id="tg-banner-title" className={styles.title}>
              Подписывайтесь
              <br />
              на наш Telegram
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
              <span>Перейти в Telegram</span>
            </a>
          </div>

          {/* Телефон с QR-кодом */}
          <div className={styles.qrFrame}>
            <Image
              src="/images/qr/iphoneTgQr.png"
              alt="QR-код Telegram канала Cocktail Design"
              fill
              className={styles.qrImage}
              sizes="(max-width: 600px) 0px, (max-width: 1024px) 280px, 360px"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
