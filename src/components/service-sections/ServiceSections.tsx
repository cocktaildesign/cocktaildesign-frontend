"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import styles from "./ServiceSections.module.css";

const MOBILE_QUERY = "(max-width: 700px)";
function subscribeToViewport(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isMobile = () => window.matchMedia(MOBILE_QUERY).matches;
const serverSnapshot = () => false;

type Section = { id: string; label: string };
type Props = {
  id: string;
  label: string;
  sections: Section[];
  renderContent: (id: string, select: (id: string) => void) => ReactNode;
};

/** One content tree: vertical tabs on desktop, native disclosures on mobile. */
export default function ServiceSections({ id, label, sections, renderContent }: Props) {
  const [active, setActive] = useState(sections[0].id);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ [sections[0].id]: true });
  const mobile = useSyncExternalStore(subscribeToViewport, isMobile, serverSnapshot);

  function select(sectionId: string) {
    setActive(sectionId);
    setExpanded((current) => ({ ...current, [sectionId]: true }));
    document.getElementById(`${id}-${mobile ? "summary" : "tab"}-${sectionId}`)?.focus();
  }

  return (
    <div className={styles.layout} data-service-sections={id}>
      {!mobile && (
        <div className={styles.navigation} role="tablist" aria-label={label} aria-orientation="vertical">
          {sections.map((section, index) => (
            <button
              key={section.id}
              id={`${id}-tab-${section.id}`}
              type="button"
              role="tab"
              aria-selected={active === section.id}
              aria-controls={`${id}-panel-${section.id}`}
              tabIndex={active === section.id ? 0 : -1}
              className={styles.tab}
              onClick={() => select(section.id)}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === "ArrowDown") next = (index + 1) % sections.length;
                else if (event.key === "ArrowUp") next = (index - 1 + sections.length) % sections.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = sections.length - 1;
                else return;
                event.preventDefault();
                select(sections[next].id);
              }}>
              {section.label}
            </button>
          ))}
        </div>
      )}
      <div className={styles.panels}>
        {sections.map((section) => mobile ? (
          <details
            key={section.id}
            className={styles.disclosure}
            open={Boolean(expanded[section.id])}
            onToggle={(event) => {
              const open = event.currentTarget.open;
              setExpanded((current) => current[section.id] === open ? current : { ...current, [section.id]: open });
            }}>
            <summary
              id={`${id}-summary-${section.id}`}>
              {section.label}<span className={styles.chevron} aria-hidden="true" />
            </summary>
            <div id={`${id}-panel-${section.id}`} className={styles.mobileContent}
              role="region" aria-labelledby={`${id}-summary-${section.id}`}>
              {renderContent(section.id, select)}
            </div>
          </details>
        ) : (
          <section key={section.id} id={`${id}-panel-${section.id}`}
            role="tabpanel" aria-labelledby={`${id}-tab-${section.id}`}
            hidden={active !== section.id} tabIndex={0} className={styles.panel}>
            {renderContent(section.id, select)}
          </section>
        ))}
      </div>
    </div>
  );
}
