// src/sections/home/knowledge-preview/KnowledgePreview.tsx
import { getKnowledgeItemsFromStrapi } from "@/lib/api/knowledge";
import KnowledgePreviewTabs from "./knowledge-preview-tabs/KnowledgePreviewTabs";
import styles from "./KnowledgePreview.module.css";
import PageLayout from "@/components/layout/PageLayout";

export default async function KnowledgePreview() {
  const items = await getKnowledgeItemsFromStrapi(null, null);

  return (
    <PageLayout>
      <section className={styles.section}>
        {/* Передаём items в табы, ссылку рендерим рядом */}
        <KnowledgePreviewTabs items={items} />
      </section>
    </PageLayout>
  );
}
