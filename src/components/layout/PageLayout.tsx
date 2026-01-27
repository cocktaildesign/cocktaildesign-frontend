import type { ReactNode } from "react";
import Container from "./Container";
import styles from "./Page.module.css";
import Breadcrumbs from "../ui/breadcrumbs/Breadcrumbs";
import GridOverlay from "./GridOverlay";

type Crumb = { href: string; label: string };

type PageLayoutProps = {
  children: ReactNode;
  showBreadcrumbs?: boolean;
  breadcrumbsItems?: Crumb[];
};

export default function PageLayout({ children, showBreadcrumbs = true, breadcrumbsItems }: PageLayoutProps) {
  return (
    <main className={styles.main}>
      <Container>
        {showBreadcrumbs && <Breadcrumbs items={breadcrumbsItems} />}
        {children}
      </Container>
      {/* <GridOverlay /> */}
    </main>
  );
}
