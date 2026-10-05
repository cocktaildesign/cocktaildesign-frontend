// src/app/legal/requisites/page.tsx
import PageLayout from "@/components/layout/PageLayout";
import { pageMetadata } from "@/lib/seo/metadata";
import Image from "next/image";
import styles from "./Requisites.module.css";
import CopyButton from "@/components/ui/copy-button/CopyButton";
import BackButton from "@/components/ui/back-button/BackButton";
import { company } from "@/lib/legal/company";

export const metadata = pageMetadata({
  title: "Реквизиты",
  description: "Реквизиты CocktailDesign",
  canonical: "/legal/requisites",
});

export default function RequisitesPage() {
  return (
    <PageLayout>
      <section className={styles.section}>
        <BackButton />

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
            <h2 className={styles.title}>{company.name}</h2>

            <dl className={styles.list}>
              <dt className={styles.term}>ИНН</dt>
              <dd className={styles.desc}>
                <span>{company.inn}</span>
                <CopyButton value={company.inn} label="ИНН" />
              </dd>

              <dt className={styles.term}>ОГРНИП</dt>
              <dd className={styles.desc}>
                <span>{company.ogrnip}</span>
                <CopyButton value={company.ogrnip} label="ОГРНИП" />
              </dd>

              <dt className={styles.term}>Юридический адрес</dt>
              <dd className={styles.desc}>{company.registrationAddress}</dd>

              <dt className={styles.term}>Расчётный счёт</dt>
              <dd className={styles.desc}>
                <span>{company.account}</span>
                <CopyButton value={company.account} label="Расчётный счёт" />
              </dd>

              <dt className={styles.term}>Название банка</dt>
              <dd className={styles.desc}>{company.bank}</dd>

              <dt className={styles.term}>БИК</dt>
              <dd className={styles.desc}>
                <span>{company.bik}</span>
                <CopyButton value={company.bik} label="БИК" />
              </dd>

              <dt className={styles.term}>Корреспондентский счёт</dt>
              <dd className={styles.desc}>
                <span>{company.correspondentAccount}</span>
                <CopyButton value={company.correspondentAccount} label="Корреспондентский счёт" />
              </dd>
            </dl>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
