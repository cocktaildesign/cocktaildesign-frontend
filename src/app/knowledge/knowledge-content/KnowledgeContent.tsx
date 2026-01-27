import KnowledgeCard from "./knowledge-card/KnowledgeCard";

import styles from "./KnowledgeContent.module.css";
import type { KnowledgeItem } from "../types";

// ===== Props компонента =====
// Получаем список отфильтрованных материалов
type KnowledgeContentProps = {
  items: KnowledgeItem[];
};

// ===== Основной компонент =====
export default function KnowledgeContent({ items }: KnowledgeContentProps) {
  return (
    <section className={styles.content} aria-label="Материалы">
      {/* Скрытый заголовок для доступности */}
      <h2 className={styles.visuallyHidden}>Список материалов</h2>

      {items.length > 0 ? (
        <div className={styles.cardsGrid}>
          {items.map((item) => (
            <KnowledgeCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className={styles.emptyState}>Ничего не найдено.</p>
      )}
    </section>
  );
}
