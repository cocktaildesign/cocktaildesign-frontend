import Link from "next/link";
import type { EditorialLink } from "@/lib/seo/related-content";
import styles from "./RelatedLinks.module.css";

export default function RelatedLinks({ title, links }: { title: string; links?: EditorialLink[] }) {
  if (!links?.length) return null;
  return <aside className={styles.related} aria-label={title}>
    <h2>{title}</h2>
    <ul>{links.map(link => <li key={link.href}><Link href={link.href}>{link.label}<span aria-hidden="true"> →</span></Link></li>)}</ul>
  </aside>;
}
