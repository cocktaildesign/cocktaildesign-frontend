import styles from "./GridOverlay.module.css";
import Container from "./Container";

export default function GridOverlay() {
  return (
    <div className={styles.overlay} aria-hidden="true">
      <Container>
        <div className={styles.grid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={styles.col} />
          ))}
        </div>
      </Container>
    </div>
  );
}
