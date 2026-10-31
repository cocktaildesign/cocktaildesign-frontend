"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SERVICES, type BrandingService, type WorkPhoto } from "./branding-data";
import serviceStyles from "@/components/service-sections/ServiceSections.module.css";
import styles from "./Branding.module.css";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("branding:section", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("branding:section", onChange);
  };
}
function currentSection() {
  const hash = window.location.hash.slice(1);
  return SERVICES.some((service) => service.id === hash) ? hash : SERVICES[0].id;
}
const initialSection = () => SERVICES[0].id;
function subscribeViewport(onChange: () => void) {
  const query = window.matchMedia("(max-width: 700px)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const mobileViewport = () => window.matchMedia("(max-width: 700px)").matches;
const desktopSnapshot = () => false;

function PhotoViewer({ photos, index, onChange, onClose }: {
  photos: WorkPhoto[]; index: number; onChange: (index: number) => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const photo = photos[index];
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
  return <dialog ref={dialog} className={styles.viewer} aria-label="Фотографии работ"
    onCancel={onClose}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    onKeyDown={(event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        onChange((index + (event.key === "ArrowRight" ? 1 : -1) + photos.length) % photos.length);
      }
    }}>
    <div className={styles.viewerHeader}>
      <span aria-live="polite">{index + 1} / {photos.length}</span>
      <button autoFocus type="button" onClick={onClose} aria-label="Закрыть фотографию">×</button>
    </div>
    <div className={styles.viewerImage}>
      <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 95vw, 1000px" />
    </div>
    <div className={styles.viewerFooter}>
      <button type="button" onClick={() => onChange((index - 1 + photos.length) % photos.length)} aria-label="Предыдущая фотография">←</button>
      <p aria-live="polite">{photo.caption}{photo.note && <small>{photo.note}</small>}</p>
      <button type="button" onClick={() => onChange((index + 1) % photos.length)} aria-label="Следующая фотография">→</button>
    </div>
  </dialog>;
}

function WorkGallery({ service, onOpen }: { service: BrandingService; onOpen: (index: number) => void }) {
  const gallery = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ first: 1, last: Math.min(3, service.photos.length), atStart: true, atEnd: false });

  const updatePosition = useCallback(() => {
    const element = gallery.current;
    if (!element?.clientWidth) return;
    const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
    const width = element.firstElementChild?.getBoundingClientRect().width || element.clientWidth;
    const step = width + gap;
    const count = Math.max(1, Math.floor((element.clientWidth + gap + 1) / step));
    const first = Math.min(Math.round(element.scrollLeft / step), Math.max(0, service.photos.length - count)) + 1;
    const next = { first, last: Math.min(first + count - 1, service.photos.length),
      atStart: element.scrollLeft <= 1, atEnd: element.scrollWidth - element.clientWidth - element.scrollLeft <= 1 };
    setPosition((current) => Object.keys(next).every((key) => current[key as keyof typeof next] === next[key as keyof typeof next]) ? current : next);
  }, [service.photos.length]);

  useEffect(() => {
    const element = gallery.current;
    if (!element) return;
    const observer = new ResizeObserver(updatePosition);
    observer.observe(element);
    return () => observer.disconnect();
  }, [updatePosition]);

  function move(direction: number) {
    const element = gallery.current;
    if (!element) return;
    const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
    const step = (element.firstElementChild?.getBoundingClientRect().width || element.clientWidth) + gap;
    const count = Math.max(1, Math.floor((element.clientWidth + gap + 1) / step));
    element.scrollBy({ left: direction * step * count,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return <section className={styles.works} aria-labelledby={`${service.id}-works-title`}>
    <div className={styles.sectionHeading}>
      <h3 id={`${service.id}-works-title`}>{service.galleryTitle || "Примеры работ"}</h3>
      <div className={styles.galleryControls}>
        <span className={styles.galleryCount} aria-live="polite" aria-atomic="true">
          {position.first === position.last ? position.first : `${position.first}–${position.last}`} / {service.photos.length}
        </span>
        <button type="button" aria-label="Предыдущие фотографии" aria-controls={`${service.id}-gallery`} disabled={position.atStart} onClick={() => move(-1)}>←</button>
        <button type="button" aria-label="Следующие фотографии" aria-controls={`${service.id}-gallery`} disabled={position.atEnd} onClick={() => move(1)}>→</button>
      </div>
    </div>
    <div ref={gallery} className={styles.gallery} id={`${service.id}-gallery`} role="region" aria-roledescription="карусель"
      aria-label={`${service.title}: фотографии`} tabIndex={0} onScroll={updatePosition}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1);
      }}>
      {service.photos.map((photo, index) => <figure key={photo.src} role="group" aria-roledescription="слайд" aria-label={`${index + 1} из ${service.photos.length}`}>
        <button type="button" className={styles.photoButton} onClick={() => onOpen(index)} aria-label={`Увеличить: ${photo.caption}`}>
          <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 70vw, (max-width: 1050px) 35vw, 310px" style={{ objectPosition: photo.position }} />
        </button>
        <figcaption>{photo.caption}{photo.note && <small>{photo.note}</small>}</figcaption>
      </figure>)}
    </div>
  </section>;
}

function ServicePanel({ service }: { service: BrandingService }) {
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const closeViewer = useCallback(() => setPhotoIndex(null), []);

  return <>
    <div className={styles.overview}>
      <div>
        <header className={styles.panelHeader}>
          <h2>{service.title}</h2>
          <p>{service.description}</p>
        </header>
        <div className={styles.offer}>
          <dl className={styles.facts}>
            {service.facts.map((fact) => <div key={fact.label}>
              <dt>{fact.label}</dt><dd>{fact.value}</dd>{fact.note && <small>{fact.note}</small>}
            </div>)}
          </dl>
        </div>
        <p className={styles.offerNote}>{service.note}</p>
      </div>
      <WorkGallery service={service} onOpen={setPhotoIndex} />
    </div>

    <div className={styles.detailsGrid}>
      <section aria-labelledby={`${service.id}-pricing-title`}>
        <h3 id={`${service.id}-pricing-title`}>{service.pricingTitle}</h3>
        {service.pricingIntro && <p className={styles.bodyText}>{service.pricingIntro}</p>}
        <table className={styles.priceTable}>
          <thead><tr>{service.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
          <tbody>{service.rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody>
        </table>
        {service.pricingNotes.map((note) => <p key={note} className={styles.finePrint}>{note}</p>)}
      </section>
      <section className={styles.order} aria-labelledby={`${service.id}-order-title`}>
        <h3 id={`${service.id}-order-title`}>Как заказать</h3>
        <ol className={styles.steps}>{service.steps.map((step, index) => <li key={step.title}>
          <span className={styles.stepNumber} aria-hidden="true">0{index + 1}</span>
          <div><h4>{step.title}</h4><p>{step.text}</p></div>
        </li>)}</ol>
        <p className={styles.orderAction}>{service.orderLink.external
          ? <a href={service.orderLink.href} target="_blank" rel="noopener noreferrer">{service.orderLink.label}</a>
          : <Link href={service.orderLink.href}>{service.orderLink.label}</Link>}
        </p>
      </section>
    </div>

    <section className={styles.faq} aria-labelledby={`${service.id}-faq-title`}>
      <h3 id={`${service.id}-faq-title`}>Вопросы перед заказом</h3>
      {service.questions.map((item) => <details key={item.question}>
        <summary>{item.question}<span aria-hidden="true" className={styles.plus} /></summary>
        <p>{item.answer}</p>
      </details>)}
    </section>
    {photoIndex !== null && <PhotoViewer photos={service.photos} index={photoIndex} onChange={setPhotoIndex} onClose={closeViewer} />}
  </>;
}

export default function BrandingGuide() {
  const active = useSyncExternalStore(subscribe, currentSection, initialSection);
  const mobile = useSyncExternalStore(subscribeViewport, mobileViewport, desktopSnapshot);
  function select(id: string) {
    if (currentSection() !== id) {
      window.history.pushState(window.history.state, "", `#${id}`);
      window.dispatchEvent(new Event("branding:section"));
    }
    document.getElementById(`branding-tab-${id}`)?.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      const panel = document.getElementById(`branding-panel-${id}`);
      if (!mobile && panel && panel.getBoundingClientRect().top < 126) panel.scrollIntoView({ block: "start" });
    });
  }
  return <div className={`${serviceStyles.layout} ${styles.layout}`}>
    <aside className={styles.sidebar}>
      <div role="tablist" aria-label="Виды брендинга" aria-orientation={mobile ? "horizontal" : "vertical"} className={`${serviceStyles.navigation} ${styles.navigation}`}>
        {SERVICES.map((service, index) => <button key={service.id} id={`branding-tab-${service.id}`}
          type="button" role="tab" aria-selected={active === service.id} aria-controls={`branding-panel-${service.id}`}
          tabIndex={active === service.id ? 0 : -1} className={`${serviceStyles.tab} ${styles.tab}`} onClick={() => select(service.id)}
          onKeyDown={(event) => {
            let next = index;
            if (["ArrowDown", "ArrowRight"].includes(event.key)) next = (index + 1) % SERVICES.length;
            else if (["ArrowUp", "ArrowLeft"].includes(event.key)) next = (index - 1 + SERVICES.length) % SERVICES.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = SERVICES.length - 1;
            else return;
            event.preventDefault(); select(SERVICES[next].id);
          }}>
          <span className={styles.tabText}><strong><span className={styles.fullLabel}>{service.label}</span><span className={styles.shortLabel}>{service.shortLabel}</span></strong><span>{service.hint}</span></span>
        </button>)}
      </div>
    </aside>
    <div className={styles.panels}>
      {SERVICES.map((service) => <section key={service.id} id={`branding-panel-${service.id}`} role="tabpanel"
        aria-labelledby={`branding-tab-${service.id}`} hidden={active !== service.id} tabIndex={0} className={`${serviceStyles.panel} ${styles.panel}`}>
        <ServicePanel key={`${service.id}-${active === service.id}`} service={service} />
      </section>)}
    </div>
  </div>;
}
