//frontend/src/components/layout/ContainerNoPaddingRight.tsx
import type { ReactNode } from "react";
import styles from "./Container.module.css";

export default function ContainerNoPaddingRight({ children }: { children: ReactNode }) {
  return <div className={styles.container}>{children}</div>;
}
