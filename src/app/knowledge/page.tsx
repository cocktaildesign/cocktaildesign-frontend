// frontend/src/app/knowledge/page.tsx
import PageLayout from "@/components/layout/PageLayout";
import { pageMetadata } from "@/lib/seo/metadata";
import styles from "./KnowledgePage.module.css";
import { getKnowledgeItemsFromStrapi } from "@/lib/api/knowledge";

import KnowledgeContent from "./knowledge-content/KnowledgeContent";
import KnowledgeFilters from "./knowledge-filters/KnowledgeFilters";
import TelegramBanner from "@/sections/telegram-cta/TelegramCta";

export const metadata = pageMetadata({
  title: "База знаний",
  description:
    "Лекции, исследования и практические материалы о барной культуре, ингредиентах и техниках работы с рецептами.",
  canonical: "/knowledge",
});

type KnowledgePageProps = {
  searchParams: Promise<{
    tab?: string;
    format?: string;
  }>;
};

export default async function KnowledgePage({ searchParams }: KnowledgePageProps) {
  const { tab, format } = await searchParams;
  const activeTab = tab ?? null;
  const activeFormat = format ?? null;

  const filteredItems = await getKnowledgeItemsFromStrapi(activeTab, activeFormat);

  return (
    <PageLayout>
      <section className={styles.knowledgePage}>
        {/* Верхняя часть страницы */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageHeaderTitle}>База знаний</h1>

          <p className={styles.pageHeaderDescription}>
            В этом блоке мы делимся своими лекциями, исследованиями и наработками. Здесь вы сможете найти информацию по
            необычным техникам работы с рецептами и формулами.
          </p>
        </div>

        <hr className={styles.line} />

        {/* Фильтры и контент */}
        <div className={styles.layout}>
          <KnowledgeFilters />

          <KnowledgeContent items={filteredItems} />
        </div>
      </section>

      <TelegramBanner />
    </PageLayout>
  );
}
