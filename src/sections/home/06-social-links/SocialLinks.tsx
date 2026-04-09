// src/sections/home/social-links/SocialLinks.tsx

import VKIcon from "@/components/icons/social-network/VKIcon";
import TelegramIcon from "@/components/icons/social-network/TelegramIcon";
import ContainerNoPaddingMobil from "@/components/layout/ContainerNoPaddingMobil";

import styles from "./SocialLinks.module.css";

export default function SocialLinks() {
  return (
    <section className={styles.section}>
      <ContainerNoPaddingMobil>
        <div className={styles.sectionSocial}>
          {/* ВКонтакте */}
          <div className={styles.card}>
            <div className={styles.content}>
              <span className={styles.name}>ВКонтакте</span>
              <span className={styles.description}>Подписывайтесь и следите за новостями!</span>
            </div>

            <a
              href="https://vk.ru/cocktail_design"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.button} ${styles.buttonVk}`}>
              <VKIcon width={16} height={16} />
              Подписаться
            </a>
          </div>
          {/* Telegram */}
          <div className={styles.card}>
            <div className={styles.content}>
              <span className={styles.name}>Telegram</span>
              <span className={styles.description}>Подписывайтесь и следите за новостями!</span>
            </div>

            <a
              href="https://t.me/Cocktail_Design_official"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.button} ${styles.buttonTg}`}>
              <TelegramIcon width={16} height={16} />
              Подписаться
            </a>
          </div>
        </div>
      </ContainerNoPaddingMobil>
    </section>
  );
}
