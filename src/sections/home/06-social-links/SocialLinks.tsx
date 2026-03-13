// src/sections/home/social-links/SocialLinks.tsx
// Два блока с соцсетями — ВКонтакте и Telegram.

import VKIcon from "@/components/icons/social-network/VKIcon";
import TelegramIcon from "@/components/icons/social-network/TelegramIcon";
import styles from "./SocialLinks.module.css";
import PageLayout from "@/components/layout/PageLayout";
export default function SocialLinks() {
  return (
    <PageLayout>
      {" "}
      <section className={styles.section}>
        {/* ВКонтакте */}
        <div className={styles.card}>
          <span className={styles.name}>ВКонтакте</span>
          <span className={styles.description}>Подписывайтесь и следите за новостями!</span>
          <a href="https://vk.com/cocktaildesign" target="_blank" rel="noopener noreferrer" className={styles.button}>
            <VKIcon width={16} height={16} />
            Подписаться
          </a>
        </div>

        {/* Telegram */}
        <div className={styles.card}>
          <span className={styles.name}>Telegram</span>
          <span className={styles.description}>Подписывайтесь и следите за новостями!</span>
          <a href="https://t.me/cocktaildesign" target="_blank" rel="noopener noreferrer" className={styles.button}>
            <TelegramIcon width={16} height={16} />
            Подписаться
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
