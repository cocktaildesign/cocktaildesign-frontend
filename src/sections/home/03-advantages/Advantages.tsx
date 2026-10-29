import Container from "@/components/layout/Container";
import styles from "./Advantages.module.css";

const facts = [
  { title: "С 2016", description: "На рынке барного инвентаря" },
  { title: "Своё производство", description: "Санкт-Петербург" },
  { title: "Пожизненная гарантия", description: "На изделия Cocktail Design" },
  { title: "Barproof 2017 и 2019", description: "Лучший продукт России" },
  { title: "В барах рейтинга", description: "The World’s 50 Best Bars" },
];

export default function Advantages() {
  return (
    <section className={styles.section} aria-label="Факты о Cocktail Design" data-home-facts="true">
      <Container>
        <ul className={styles.facts}>
          {facts.map((fact, index) => (
            <li key={fact.title} className={`${styles.fact} ${index === 0 ? styles.since : ""}`}>
              <p className={styles.title}>{fact.title}</p>
              <p className={styles.description}>{fact.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
