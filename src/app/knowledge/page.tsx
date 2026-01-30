import PageLayout from "@/components/layout/PageLayout";
import { pageMetadata } from "@/lib/seo/metadata";
import styles from "./KnowledgePage.module.css";
import { getKnowledgeItems } from "./data";

import KnowledgeContent from "./knowledge-content/KnowledgeContent";
import KnowledgeFilters from "./knowledge-filters/KnowledgeFilters";
import TelegramBanner from "@/sections/telegram-cta/TelegramCta";

export const metadata = pageMetadata({
  title: "База знаний",
  description:
    "Лекции, исследования и практические материалы о барной культуре, ингредиентах и техниках работы с рецептами.",
  canonical: "/knowledge",
});

const items = getKnowledgeItems();

type KnowledgePageProps = {
  searchParams: Promise<{
    tab?: string;
    format?: string;
  }>;
};

export default async function KnowledgePage({ searchParams }: KnowledgePageProps) {
  // Получаем параметры фильтрации из URL
  const { tab, format } = await searchParams;

  const activeTab = tab ?? null;
  const activeFormat = format ?? null;

  // Фильтруем материалы по выбранному разделу и формату
  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab ? item.tab === activeTab : true;
    const matchesFormat = activeFormat ? item.format === activeFormat : true;

    return matchesTab && matchesFormat;
  });

  return (
    <PageLayout>
      <section className={styles.knowledgePage}>
        <div className={styles.pageHeader}>
          <h1>База знаний</h1>

          <p className={styles.pageHeaderDescription}>
            В этом блоке мы делимся своими лекциями, исследованиями и наработками. Здесь вы сможете найти информацию по
            необычным техникам работы с рецептами и формулами.
          </p>
        </div>

        <hr className={styles.line} />

        <div className={styles.layout}>
          <KnowledgeFilters />

          <KnowledgeContent items={filteredItems} />
        </div>
      </section>
      <TelegramBanner />
    </PageLayout>
  );
}
