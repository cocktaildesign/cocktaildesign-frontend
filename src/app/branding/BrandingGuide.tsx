"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MANAGER_URL, SERVICES, type BrandingService, type WorkPhoto } from "./branding-data";
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

function ServicePanel({ service }: { service: BrandingService }) {
  const [expanded, setExpanded] = useState(false);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const closeViewer = useCallback(() => setPhotoIndex(null), []);
  const actionClass = styles.primaryAction;
  const actionContent = <>{service.action.label}<span aria-hidden="true">{service.action.external ? "↗" : "→"}</span></>;

  return <>
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
      <div className={styles.actionWrap}>
        {service.action.external
          ? <a href={service.action.href} target="_blank" rel="noopener noreferrer" className={actionClass}>{actionContent}</a>
          : <Link href={service.action.href} className={actionClass}>{actionContent}</Link>}
        {service.action.note && <small>{service.action.note}</small>}
      </div>
    </div>
    <p className={styles.offerNote}>{service.note}</p>

    <section className={styles.works} aria-labelledby={`${service.id}-works-title`}>
      <div className={styles.sectionHeading}>
        <h3 id={`${service.id}-works-title`}>{service.galleryTitle || "Примеры работ"}</h3>
        <button type="button" className={styles.textAction} aria-expanded={expanded} aria-controls={`${service.id}-gallery`}
          onClick={() => setExpanded(!expanded)}>{expanded ? "Свернуть" : `Все ${service.photos.length} фото`}<span aria-hidden="true">{expanded ? "−" : "+"}</span></button>
      </div>
      <div className={styles.gallery} id={`${service.id}-gallery`}>
        {service.photos.map((photo, index) => <figure key={photo.src} hidden={!expanded && index >= 3}>
          <button type="button" className={styles.photoButton} onClick={() => setPhotoIndex(index)} aria-label={`Увеличить: ${photo.caption}`}>
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 65vw, (max-width: 1050px) 25vw, 310px" style={{ objectPosition: photo.position }} />
            <span className={styles.zoom} aria-hidden="true">↗</span>
          </button>
          <figcaption>{photo.caption}{photo.note && <small>{photo.note}</small>}</figcaption>
        </figure>)}
      </div>
    </section>

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
  return <div className={styles.layout}>
    <aside className={styles.sidebar}>
      <div role="tablist" aria-label="Виды брендинга" aria-orientation={mobile ? "horizontal" : "vertical"} className={styles.navigation}>
        {SERVICES.map((service, index) => <button key={service.id} id={`branding-tab-${service.id}`}
          type="button" role="tab" aria-selected={active === service.id} aria-controls={`branding-panel-${service.id}`}
          tabIndex={active === service.id ? 0 : -1} className={styles.tab} onClick={() => select(service.id)}
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
          <span className={styles.chevron} aria-hidden="true">›</span>
        </button>)}
      </div>
      <div className={styles.help}>
        <p>Не уверены, что выбрать?</p>
        <a href={MANAGER_URL} target="_blank" rel="noopener noreferrer">Напишите менеджеру <span aria-hidden="true">↗</span></a>
      </div>
    </aside>
    <div className={styles.panels}>
      {SERVICES.map((service) => <section key={service.id} id={`branding-panel-${service.id}`} role="tabpanel"
        aria-labelledby={`branding-tab-${service.id}`} hidden={active !== service.id} tabIndex={0} className={styles.panel}>
        <ServicePanel key={`${service.id}-${active === service.id}`} service={service} />
      </section>)}
    </div>
  </div>;
}
