// src/sections/home/knowledge-preview/KnowledgePreview.tsx
import { getKnowledgeItemsFromStrapi } from "@/lib/api/knowledge";
import KnowledgePreviewTabs from "./knowledge-preview-tabs/KnowledgePreviewTabs";
import styles from "./KnowledgePreview.module.css";
import ContainerNoPaddingMobil from "@/components/layout/ContainerNoPaddingMobil";

export default async function KnowledgePreview() {
  const items = await getKnowledgeItemsFromStrapi(null, null);

  return (
    <section className={styles.section}>
      <ContainerNoPaddingMobil>
        {/* Передаём items в табы, ссылку рендерим рядом */}
        <KnowledgePreviewTabs items={items} />
      </ContainerNoPaddingMobil>
    </section>
  );
}
