"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import type { CatalogCategoryPreview, CatalogCollection } from "@/lib/api/catalog/types";
import { useCatalogMenu } from "./CatalogMenuProvider";
import CategoryIcon from "./CategoryIcon";
import CategoryProducts from "./CategoryProducts";
import styles from "./CatalogMenu.module.css";

type CatalogMenuProps = {
  categories: CatalogCategoryPreview[];
  collections: CatalogCollection[];
  onOpen?: () => void;
};
const compactQuery = "(max-width: 900px)";
function subscribeCompact(callback: () => void) {
  const query = window.matchMedia(compactQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const hasChildren = (item: CatalogCategoryPreview) => Boolean(item.children?.length);
const controls = 'button:not([disabled]), a[href]';

export default function CatalogMenu({ categories, collections, onOpen }: CatalogMenuProps) {
  const { isOpen, menuId, toggle } = useCatalogMenu();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuCollections = collections.filter((item) => !item.sourceCategorySlug
    || !categories.some((category) => category.slug === item.sourceCategorySlug));
  return (
    <div className={styles.catalogMenu}>
      <button ref={triggerRef} type="button" className={styles.buttonCta} aria-label="Каталог"
        aria-expanded={isOpen} aria-controls={menuId} onClick={(event) => {
          if (!isOpen) onOpen?.();
          toggle(event.currentTarget);
        }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <path d={isOpen ? "m6 6 12 12M6 18 18 6" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
        <span className={styles.buttonCtaText}>Каталог</span>
      </button>
      {isOpen && <CatalogPanel categories={categories} collections={menuCollections} triggerRef={triggerRef} />}
    </div>
  );
}

function CatalogPanel({ categories, collections, triggerRef }: CatalogMenuProps & { triggerRef: RefObject<HTMLButtonElement | null> }) {
  const { menuId, close } = useCatalogMenu();
  const compact = useSyncExternalStore(subscribeCompact, () => window.matchMedia(compactQuery).matches, () => false);
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const [trail, setTrail] = useState<CatalogCategoryPreview[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mobileHeadingRef = useRef<HTMLHeadingElement>(null);
  const mobileBodyRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeCollection = collections.find((item) => `collection:${item.id}` === activeId);
  const active = activeCollection ? undefined : categories.find((item) => item.id === activeId) ?? categories[0];
  const activeName = activeCollection?.title ?? active?.name;
  const activeHref = activeCollection ? `/catalog/collection/${activeCollection.slug}` : `/catalog/${active?.slug}`;
  const sections = active?.children ?? [];
  const grouped = sections.filter(hasChildren);
  const leaves = sections.filter((item) => !hasChildren(item));
  const current = trail.at(-1);
  const mobileItems = current ? current.children ?? [] : categories;
  const cancelHover = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  }, []);
  function selectCategory(id: string) {
    cancelHover();
    setActiveId(id);
    contentRef.current?.scrollTo({ top: 0 });
  }
  function previewOnHover(id: string, pointerType: string) {
    if (pointerType !== "mouse") return;
    cancelHover();
    hoverTimer.current = setTimeout(() => selectCategory(id), 300);
  }

  useLayoutEffect(() => {
    if (compact) return;
    function positionPanel() {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(1160, document.documentElement.clientWidth - 48);
      const left = Math.max(24, Math.min(rect.left, document.documentElement.clientWidth - width - 24));
      panel.style.top = `${rect.bottom + 10}px`;
      panel.style.left = `${left}px`;
      panel.style.width = `${width}px`;
      panel.style.setProperty("--catalog-top", `${rect.bottom + 10}px`);
      panel.style.visibility = "visible";
    }
    positionPanel();
    window.addEventListener("resize", positionPanel);
    window.addEventListener("scroll", positionPanel, { passive: true });
    return () => {
      window.removeEventListener("resize", positionPanel);
      window.removeEventListener("scroll", positionPanel);
    };
  }, [compact, triggerRef]);

  useEffect(() => {
    const handleBack = () => close();
    window.addEventListener("popstate", handleBack);
    return () => { window.removeEventListener("popstate", handleBack); cancelHover(); };
  }, [close, cancelHover]);

  useEffect(() => {
    if (compact) {
      const dialog = dialogRef.current;
      const previousOverflow = document.body.style.overflow;
      dialog?.showModal();
      document.body.style.overflow = "hidden";
      return () => { dialog?.close(); document.body.style.overflow = previousOverflow; };
    }
    function outside(event: Event) {
      const target = event.target;
      if (target instanceof Node && !panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) close();
    }
    function keyboard(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); close(true); }
      if (event.key !== "Tab") return;
      const items = panelRef.current?.querySelectorAll<HTMLElement>(controls);
      if (!items?.length) return;
      if (document.activeElement === triggerRef.current && !event.shiftKey) {
        event.preventDefault(); items[0].focus();
      } else if (document.activeElement === items[0] && event.shiftKey) {
        event.preventDefault(); triggerRef.current?.focus();
      } else if (document.activeElement === items[items.length - 1] && !event.shiftKey) {
        // Continue in the header after the trigger, despite the panel's portal.
        const headerControls = Array.from(document.querySelectorAll<HTMLElement>('header button, header a[href], header input'));
        const next = headerControls.slice(headerControls.indexOf(triggerRef.current!) + 1)
          .find((item) => item.getClientRects().length && !item.hasAttribute("disabled"));
        if (next) { event.preventDefault(); close(); next.focus(); }
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", keyboard);
    };
  }, [compact, close, triggerRef]);

  useEffect(() => {
    if (!compact) return;
    mobileBodyRef.current?.scrollTo({ top: 0 });
    if (trail.length) mobileHeadingRef.current?.focus();
  }, [compact, trail]);

  const collectionLinks = collections.length > 0 && (
    <nav className={styles.collections} aria-label="Подборки каталога">
      <p className={styles.collectionsLabel}>Подборки</p>
      {collections.map((item) => <Link prefetch={false} key={item.id} href={`/catalog/collection/${item.slug}`}
        className={`${styles.rootItem} ${!compact && activeCollection?.id === item.id ? styles.selected : ""}`}
        aria-controls={!compact ? `${menuId}-content` : undefined}
        onFocus={() => { if (!compact) selectCategory(`collection:${item.id}`); }}
        onKeyDown={(event) => {
          if (!compact && event.key === "ArrowRight") {
            event.preventDefault();
            contentRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
          }
        }}
        onPointerEnter={(event) => { if (!compact) previewOnHover(`collection:${item.id}`, event.pointerType); }}
        onPointerLeave={cancelHover} onClick={() => close()}>
        <CategoryIcon name={item.title} /><span>{item.title}</span>
        {!compact && <span className={styles.chevron} aria-hidden="true">›</span>}
      </Link>)}
    </nav>
  );

  if (compact) return createPortal(
    <dialog ref={dialogRef} id={menuId} className={styles.mobileDialog} aria-labelledby={`${menuId}-title`}
      onCancel={(event) => { event.preventDefault(); close(true); }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const items = event.currentTarget.querySelectorAll<HTMLElement>(controls);
        const first = items[0], last = items[items.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && (document.activeElement === first || document.activeElement === mobileHeadingRef.current)) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right) close(true);
      }}>
      <div className={styles.mobileHeader}>
        {current && <button type="button" className={styles.iconButton} aria-label="Назад к разделам" onClick={() => {
          setTrail((items) => items.slice(0, -1));
          mobileHeadingRef.current?.focus();
        }}>←</button>}
        <h2 ref={mobileHeadingRef} tabIndex={-1} id={`${menuId}-title`}>{current?.name ?? "Каталог"}</h2>
        <button type="button" className={styles.iconButton} aria-label="Закрыть каталог" onClick={() => close(true)}>×</button>
      </div>
      <div ref={mobileBodyRef} className={styles.mobileBody}>
        <nav aria-label={current?.name ?? "Разделы каталога"}>
          {mobileItems.map((item) => hasChildren(item) ? (
            <button type="button" key={item.id} className={styles.mobileRow} onClick={() => setTrail((items) => [...items, item])}>
              {!current && <CategoryIcon name={item.name} />}<span>{item.name}</span><span aria-hidden="true">›</span>
            </button>
          ) : (
            <Link prefetch={false} key={item.id} href={`/catalog/${item.slug}`} className={styles.mobileRow} onClick={() => close()}>
              {!current && <CategoryIcon name={item.name} />}<span>{item.name}</span>
            </Link>
          ))}
        </nav>
        {!current && collectionLinks}
      </div>
      <Link prefetch={false} className={styles.mobileAll} href={current ? `/catalog/${current.slug}` : "/catalog"} onClick={() => close()}>
        {current ? "Все товары раздела" : "Весь каталог"}<span aria-hidden="true">→</span>
      </Link>
    </dialog>, document.body,
  );

  return createPortal(<>
    <div className={styles.backdrop} aria-hidden="true" />
    <div ref={panelRef} id={menuId} className={styles.panel} role="region" aria-label="Каталог товаров">
      <div className={styles.sidebar}>
        <div className={styles.categoryScroll}>
          <nav aria-label="Разделы каталога"><ul className={styles.rootList}>
            {categories.map((item) => <li key={item.id}>
              <Link prefetch={false} href={`/catalog/${item.slug}`} className={`${styles.rootItem} ${active?.id === item.id ? styles.selected : ""}`}
                aria-controls={`${menuId}-content`}
                onClick={() => close()} onFocus={() => selectCategory(item.id)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") {
                    event.preventDefault(); selectCategory(item.id);
                    contentRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
                  }
                }}
                onPointerEnter={(event) => previewOnHover(item.id, event.pointerType)} onPointerLeave={cancelHover}>
                <CategoryIcon name={item.name} /><span>{item.name}</span><span className={styles.chevron} aria-hidden="true">›</span>
              </Link>
            </li>)}
          </ul></nav>
          {collectionLinks}
        </div>
        <Link prefetch={false} className={styles.allCatalog} href="/catalog" onClick={() => close()}>Весь каталог <span aria-hidden="true">→</span></Link>
      </div>
      <div ref={contentRef} id={`${menuId}-content`} className={styles.content}>
        {(active || activeCollection) && <>
          <div className={`${styles.heading} ${!sections.length ? styles.previewHeading : ""}`}>
            <h2>{activeName}</h2>
            <Link prefetch={false} className={!sections.length ? styles.sectionCta : styles.viewAll} href={activeHref} onClick={() => close()}>
              {sections.length ? "Все товары раздела" : "Смотреть все товары"} <span aria-hidden="true">→</span>
            </Link>
          </div>
          {grouped.length > 0 && <div className={styles.groups}>{grouped.map((section) => <section key={section.id} className={styles.groupCard}>
            <h3><Link prefetch={false} href={`/catalog/${section.slug}`} onClick={() => close()}>{section.name}</Link></h3>
            <ul>{section.children?.map((item) => <li key={item.id}><Link prefetch={false} href={`/catalog/${item.slug}`} onClick={() => close()}>{item.name}</Link></li>)}</ul>
          </section>)}</div>}
          {leaves.length > 0 && <nav className={`${styles.leaves} ${grouped.length ? styles.afterGroups : ""}`} aria-label={`Категории: ${activeName}`}>
            {leaves.map((item) => <Link prefetch={false} key={item.id} href={`/catalog/${item.slug}`} onClick={() => close()}>{item.name}</Link>)}
          </nav>}
          {!sections.length && <CategoryProducts key={activeId} slug={activeCollection?.slug ?? active!.slug}
            collection={Boolean(activeCollection)} onNavigate={() => close()} />}
        </>}
        {!active && !activeCollection && <Link prefetch={false} href="/catalog" onClick={() => close()}>Перейти в каталог →</Link>}
      </div>
    </div>
  </>, document.body);
}
