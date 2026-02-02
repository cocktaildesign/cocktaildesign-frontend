import { pageMetadata } from "@/lib/seo/metadata";
import PageLayout from "@/components/layout/PageLayout";
import styles from "./Contacts.module.css";
import Link from "next/link";
import Image from "next/image";
import CopyButton from "@/components/ui/copy-button/CopyButton";

export const metadata = pageMetadata({
  title: "Контакты",
  description: "Контактная информация CocktailDesign",
  canonical: "/about/contacts",
});

export default function Contacts() {
  return (
    <PageLayout>
      <section className={styles.contactsPage}>
        <div className={styles.contactsPageHeader}>
          <h1 className={styles.contactsPageTitle}>Контакты</h1>
        </div>

        <div className={styles.contactGrid}>
          <div className={`${styles.contactSection} ${styles.contactInfo}`}>
            <div className={styles.infoItem}>
              <h2 className={styles.itemTitle}>Сделать заказ или уточнить наличие можно по телефону</h2>
              <a href="tel:+79956226202" className={styles.itemLink}>
                +7 (995) 622-62-02
              </a>
            </div>

            <div className={styles.infoItem}>
              <h2 className={styles.itemTitle}>Email</h2>
              <a href="mailto:cocktaildesign@yandex.ru" className={styles.itemLink}>
                cocktaildesign@yandex.ru
              </a>
            </div>

            <div className={styles.infoItem}>
              <h2 className={styles.itemTitle}>Прием звонков</h2>
              <p className={styles.itemText}>Пн – вс: с 07:00 – 22:00</p>
            </div>

            <Link href="/support/feedback" className={styles.feedbackButton}>
              Обратная связь
            </Link>
          </div>

          <div className={`${styles.contactSection} ${styles.contactRequisites}`}>
            <h2 className={styles.itemTitle}>Наши реквизиты</h2>

            <div className={styles.requisitesContent}>
              <p className={styles.requisitesOwner}>Индивидуальный предприниматель Кравец Дмитрий Михайлович</p>

              <dl className={styles.requisitesList}>
                <dt className={styles.requisitesTerm}>Юридический адрес</dt>
                <dd className={styles.requisitesDesc}>
                  191040, Россия, г. Санкт-Петербург, 9-я Советская 10–12 лит. А, кв. 29
                </dd>

                <dt className={styles.requisitesTerm}>ИНН</dt>
                <dd className={styles.requisitesDesc}>
                  <span>510999203433</span>
                  <CopyButton value="510999203433" label="ИНН" />
                </dd>

                <dt className={styles.requisitesTerm}>ОГРНИП</dt>
                <dd className={styles.requisitesDesc}>
                  <span>318784700202833</span>
                  <CopyButton value="318784700202833" label="ОГРНИП" />
                </dd>
              </dl>
            </div>

            <Link href="/legal/requisites" className={styles.requisitesLink}>
              Смотреть реквизиты полностью
            </Link>
          </div>

          <div className={`${styles.contactSection} ${styles.contactAddress}`}>
            <div className={styles.addressDetails}>
              <div className={styles.detailsSection}>
                <h2 className={styles.itemTitle}>Адрес офиса:</h2>
                <p className={styles.itemText}>
                  Санкт-Петербург, ул. Уральская 19к8, бизнес-центр «Урал Плаза», оф.120
                </p>
              </div>

              <div className={styles.detailsSection}>
                <h2 className={styles.itemTitle}>Режим работы офиса:</h2>

                <ul className={styles.hoursList}>
                  <li className={styles.itemText}>Пн–Пт: с 10:00 до 18:00</li>
                  <li className={styles.itemText}>Сб–Вс: с 10:00 до 17:00</li>
                </ul>
              </div>

              <div className={styles.detailsSection}>
                <h2 className={styles.itemTitle}>Схема проезда:</h2>

                <ul className={styles.routeList}>
                  <li className={styles.routeItem}>
                    <p className={styles.itemText}>От метро «Василеостровская»:</p>

                    <ul className={styles.routeSublist}>
                      <li>Пешком 20 мин</li>
                      <li>Автобус 42, 151, 230, 41А</li>
                    </ul>
                  </li>

                  <li className={styles.routeItem}>
                    <p className={styles.routeFrom}>От метро «Приморская»:</p>

                    <ul className={styles.routeSublist}>
                      <li>Пешком 18 мин</li>
                      <li>Автобус 41, 220, 42, 47, 128, 249, 41А</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div className={styles.officeImage}>
                <Image
                  src="/images/contact/contact.webp"
                  alt="Контакты"
                  fill
                  sizes="(max-width: 960px) 100vw, 50vw"
                  className={styles.image}
                />
              </div>
            </div>

            <div className={styles.mapEmbed}>
              <iframe
                src="https://yandex.ru/map-widget/v1/?um=constructor%3A6c251b727dc4cda0e657d7f2028c3e3b36dfe89f16c9461ab33ab7f968bed4c5&amp;source=constructor"
                title="Карта: офис CocktailDesign, БЦ «Урал Плаза»"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className={styles.mapIframe}
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
