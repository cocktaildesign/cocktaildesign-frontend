import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import styles from "./BusinessGuide.module.css";

export type BusinessGuideContent = {
  title: string;
  lead: string;
  sections: { heading: string; text: string; links: { href: string; label: string }[] }[];
};

export default function BusinessGuide({ content, path }: { content: BusinessGuideContent; path: string }) {
  return (
    <PageLayout breadcrumbsItems={[{ href: "/", label: "Главная" }, { href: path, label: content.title }]}>
      <article className={styles.guide}>
        <header>
          <h1>{content.title}</h1>
          <p className={styles.lead}>{content.lead}</p>
        </header>
        <div className={styles.sections}>
          {content.sections.map(section => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.text}</p>
              <ul>
                {section.links.map(link => <li key={link.href}><Link href={link.href}>{link.label} →</Link></li>)}
              </ul>
            </section>
          ))}
        </div>
        <section className={styles.help}>
          <h2>Как подготовить заказ для заведения</h2>
          <p>Соберите нужные позиции и количество в корзине. Из неё можно скачать коммерческое предложение с текущими ценами и скидками. Если нужна помощь с подбором или комплектацией, обратитесь к менеджеру.</p>
          <ul>
            <li><Link href="/catalog">Весь каталог →</Link></li>
            <li><Link href="/discounts">Скидки за объём →</Link></li>
            <li><Link href="/shipping">Условия доставки →</Link></li>
            <li><Link href="/contacts">Связаться с менеджером →</Link></li>
          </ul>
        </section>
      </article>
    </PageLayout>
  );
}
