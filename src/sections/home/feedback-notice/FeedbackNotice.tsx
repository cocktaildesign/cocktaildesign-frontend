import Link from "next/link";
import Container from "@/components/layout/Container";
import DialogueIcon from "@/components/icons/DialogueIcon";
import styles from "./FeedbackNotice.module.css";

export default function FeedbackNotice() {
  return (
    <aside className={styles.section} aria-label="Обратная связь">
      <Container>
        <div className={styles.notice}>
          <span className={styles.icon} aria-hidden="true"><DialogueIcon /></span>
          <p className={styles.copy}>
            <span className={styles.title}>Есть идея или заметили ошибку?</span>
            <span className={styles.description}>Помогите сделать сайт удобнее.</span>
          </p>
          <Link className={styles.link} href="/support/feedback">
            Оставить сообщение <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </aside>
  );
}
