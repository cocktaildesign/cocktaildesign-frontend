import Link from "next/link";
import { knowledgeTools } from "@/lib/knowledge/tools";
import styles from "./Reading.module.css";

export default function KnowledgeTools({ slug }: { slug: string }) {
  const items = knowledgeTools[slug];
  if (!items?.length) return null;
  return <aside className={styles.tools} aria-label="Инвентарь для практики">
    <h2>Что пригодится для практики</h2>
    <ul>{items.map(item => <li key={item.href}>
      <Link href={item.href}>{item.title} →</Link>
      <p>{item.description}</p>
    </li>)}</ul>
  </aside>;
}
