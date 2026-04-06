import type { ReactNode } from "react";
import styles from "./ContainerNoPaddingMobil.module.css";

export default function ContainerNoPaddingMobil({ children }: { children: ReactNode }) {
  return <div className={styles.container}>{children}</div>;
}
