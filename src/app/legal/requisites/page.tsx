import PageLayout from "@/components/layout/PageLayout";
import { pageMetadata } from "@/lib/seo/metadata";
import Image from "next/image";
import styles from "./Requisites.module.css";
import CopyButton from "@/components/ui/copy-button/CopyButton";

export const metadata = pageMetadata({
  title: "Реквизиты",
  description: "Реквизиты CocktailDesign",
  canonical: "/legal/requisites",
});

export default function RequisitesPage() {
  return (
    <PageLayout>
      <section className={styles.section}>
        <h1 className={styles.sectionTitle}>Реквизиты</h1>

        <div className={styles.card}>
          <div className={styles.media} aria-hidden="true">
            <Image
              src="/images/legal/requisites.png"
              alt="иконка Реквизитов"
              fill
              priority={false}
              sizes="(max-width: 768px) 96px, 140px"
              className={styles.mediaImage}
            />
          </div>

          <div className={styles.content}>
            <h2 className={styles.title}>Индивидуальный предприниматель Кравец Дмитрий Михайлович</h2>

            <dl className={styles.list}>
              <dt className={styles.term}>ИНН</dt>
              <dd className={styles.desc}>
                <span>510999203433</span>
                <CopyButton value="510999203433" label="ИНН" />
              </dd>

              <dt className={styles.term}>ОГРНИП</dt>
              <dd className={styles.desc}>
                <span>318784700202833</span>
                <CopyButton value="318784700202833" label="ОГРНИП" />
              </dd>

              <dt className={styles.term}>Юридический адрес</dt>
              <dd className={styles.desc}>191040, Россия, г. Санкт-Петербург, 9-я Советская 10–12 лит. А, кв. 29</dd>

              <dt className={styles.term}>Расчётный счёт</dt>
              <dd className={styles.desc}>
                <span>40802810601500251152</span>
                <CopyButton value="40802810601500251152" label="Расчётный счёт" />
              </dd>

              <dt className={styles.term}>Название банка</dt>
              <dd className={styles.desc}>ООО «Банк Точка»</dd>

              <dt className={styles.term}>БИК</dt>
              <dd className={styles.desc}>
                <span>044525104</span>
                <CopyButton value="044525104" label="БИК" />
              </dd>

              <dt className={styles.term}>Корреспондентский счёт</dt>
              <dd className={styles.desc}>
                <span>30101810745374525104</span>
                <CopyButton value="30101810745374525104" label="Корреспондентский счёт" />
              </dd>
            </dl>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
