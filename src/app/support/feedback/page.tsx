import PageLayout from "@/components/layout/PageLayout";
import FeedbackForm from "@/components/ui/feedback-form/FeedbackForm";
import { pageMetadata } from "@/lib/seo/metadata";
import styles from "./FeedbackPage.module.css";

export const metadata = pageMetadata({
  title: "Обратная связь",
  description: "Сообщите об ошибке или предложите улучшение",
  canonical: "/support/feedback",
});

export default function FeedbackPage() {
  return (
    <PageLayout>
      <section className={styles.section}>
        <div className={styles.card}>
          <FeedbackForm />
        </div>
      </section>
    </PageLayout>
  );
}
