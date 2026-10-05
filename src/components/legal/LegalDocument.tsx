import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import BackButton from "@/components/ui/back-button/BackButton";
import documents from "@/lib/legal/documents.json";
import { legalText } from "@/lib/legal/company";
import styles from "./LegalDocument.module.css";

export type LegalDocumentId = keyof typeof documents;

function Text({ text }: { text: string }) {
  return legalText(text).split(/(https?:\/\/[^\s]+|\/legal\/[a-z-]+)/g).map((part, i) => {
    if (part.startsWith("/legal/")) return <Link key={i} href={part}>{part === "/legal/privacy-policy" ? "Политика обработки персональных данных" : "Открыть документ"}</Link>;
    if (/^https?:\/\//.test(part)) {
      const href = part.replace(/[.,;]$/, "");
      return <span key={i}><a href={href} target="_blank" rel="noopener noreferrer">{href}</a>{part.slice(href.length)}</span>;
    }
    return part;
  });
}

export default function LegalDocument({ id }: { id: LegalDocumentId }) {
  const doc = documents[id];
  return <PageLayout><article className={styles.document}>
    <BackButton />
    <h1>{doc.title}</h1>
    <p className={styles.revision}>Редакция от 5 октября 2026 года</p>
    <div className={styles.intro}>{doc.intro.map((text, i) => <p key={i}><Text text={text} /></p>)}</div>
    <nav className={styles.contents} aria-label="Содержание документа">
      <h2>Содержание</h2>
      <ul>{doc.sections.map((section, i) => <li key={i}><a href={`#section-${i + 1}`}>{section.title}</a></li>)}</ul>
    </nav>
    {doc.sections.map((section, i) => <section key={i} id={`section-${i + 1}`} className={styles.section}>
      <h2>{section.title}</h2>
      {section.paragraphs.map((text, j) => <p key={j} className={text.startsWith("—") ? styles.listItem : undefined}><Text text={text} /></p>)}
    </section>)}
    <nav className={styles.related} aria-label="Другие правовые документы">
      <Link href="/legal">Все правовые документы</Link>
      <Link href="/legal/requisites">Реквизиты продавца</Link>
    </nav>
  </article></PageLayout>;
}
