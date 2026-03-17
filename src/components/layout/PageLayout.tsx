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
  className?: string; // опциональный класс
};

export default function PageLayout({ children, showBreadcrumbs = true, breadcrumbsItems, className }: PageLayoutProps) {
  return (
    <main className={`${styles.main} ${className ?? ""}`}>
      <Container>
        {showBreadcrumbs && <Breadcrumbs items={breadcrumbsItems} />}
        {children}
      </Container>
      {/* <GridOverlay /> */}
    </main>
  );
}
