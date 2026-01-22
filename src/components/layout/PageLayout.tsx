import type { ReactNode } from "react";
import Container from "./Container";
import styles from "./Page.module.css";
import Breadcrumbs from "../ui/breadcrumbs/Breadcrumbs";
import GridOverlay from "./GridOverlay";

type PageLayoutProps = {
  children: ReactNode;
  showBreadcrumbs?: boolean;
};

export default function PageLayout({ children, showBreadcrumbs = true }: PageLayoutProps) {
  return (
    <main className={styles.main}>
      <Container>
        {showBreadcrumbs && <Breadcrumbs />}
        {children}
      </Container>
      {/* <GridOverlay /> */}
    </main>
  );
}
