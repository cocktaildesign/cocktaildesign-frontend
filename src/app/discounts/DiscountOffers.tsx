"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import VolumeTiers from "./VolumeTiers";
import { discounts } from "./data";
import styles from "./Discounts.module.css";

const gifts = discounts.find((discount) => discount.id === "2")?.blocks.find((block) => block.id === "2-6");

function OfferIcon({ name }: { name: "truck" | "gift" | "copy" | "arrow" | "check" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "truck" && <><path d="M3 17H2V5h13v12H8m7-9h4l3 4v5h-2m-5 0h-3" /><circle cx="5.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></>}
      {name === "gift" && <><path d="M3 8h18v4H3zM5 12v9h14v-9M12 8v13" /><path d="M12 8H7.5A2.5 2.5 0 1 1 10 5.5L12 8Zm0 0h4.5A2.5 2.5 0 1 0 14 5.5L12 8Z" /></>}
      {name === "copy" && <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 5V3H4v14h1" /></>}
      {name === "arrow" && <path d="M4 12h16m-6-6 6 6-6 6" />}
      {name === "check" && <path d="m5 12 4 4L19 6" />}
    </svg>
  );
}

function PromoCode({ code }: { code: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(code);
      setStatus("copied");
      timer.current = setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={styles.promo}>
      <div className={styles.promoBox}>
        <div className={styles.promoText}>
          <span className={styles.promoLabel}>Промокод для корзины</span>
          <strong className={styles.promoValue}>{code}</strong>
        </div>
        <button type="button" onClick={copy} className={styles.copyButton} aria-label={`Скопировать промокод ${code}`}>
          <OfferIcon name={status === "copied" ? "check" : "copy"} />
          <span>{status === "copied" ? "Скопировано" : "Копировать"}</span>
        </button>
      </div>
      <p className={status === "error" ? styles.promoHint : styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {status === "copied" ? "Скопировано. Вставьте код при оформлении заказа."
          : status === "error" ? `Не удалось скопировать. Выделите код ${code} и скопируйте вручную.` : ""}
      </p>
    </div>
  );
}

export default function DiscountOffers() {
  const startup = useRef<HTMLElement>(null);
  const [giftsOpen, setGiftsOpen] = useState(false);

  // Preserve the existing home-banner link to the full StartUp conditions.
  useEffect(() => {
    let frame = 0;
    function openFromAnchor() {
      if (window.location.hash !== "#startup") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setGiftsOpen(true);
        startup.current?.scrollIntoView({ block: "start" });
      });
    }
    openFromAnchor();
    window.addEventListener("hashchange", openFromAnchor);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", openFromAnchor);
    };
  }, []);

  return (
    <>
      <div className={styles.offers}>
        <section ref={startup} id="startup" className={`${styles.card} ${styles.startup}`} aria-labelledby="startup-title">
          <h2 id="startup-title" className={styles.cardTitle}>Скидка на первый заказ</h2>
          <div className={styles.startupLead}>
            <p className={styles.discount}>−20%</p>
            <p className={styles.startupIntro}>Для новых покупателей<br />при заказе от&nbsp;20&nbsp;000&nbsp;₽</p>
          </div>
          <ul className={styles.benefits}>
            <li><OfferIcon name="truck" /><span>Бесплатная доставка по всей России</span></li>
            <li><OfferIcon name="gift" /><span>Один подарок на выбор</span></li>
          </ul>
          <PromoCode code="STARTCD20" />
          <div className={styles.startupActions}>
            <Link href="/catalog" className={`${styles.button} ${styles.lightButton}`}>В каталог <OfferIcon name="arrow" /></Link>
            <button type="button" className={styles.giftsToggle} aria-expanded={giftsOpen}
              aria-controls="startup-gifts" onClick={() => setGiftsOpen((open) => !open)}>
              <span>Подарки и условия</span><span className={styles.plus} aria-hidden="true" />
            </button>
          </div>
          <div id="startup-gifts" hidden={!giftsOpen} className={styles.giftPanel}>
            <div className={styles.detailsBody}>
              <p className={styles.detailsHeading}>Выберите один подарок</p>
              <ul className={styles.giftList}>
                {gifts?.type === "list" && gifts.items.map((gift) => <li key={gift}>{gift}</li>)}
              </ul>
              <p>Введите промокод STARTCD20 в корзине или сообщите менеджеру. Менеджер свяжется с вами и поможет выбрать подарок.</p>
            </div>
          </div>
          <p className={styles.note}>Кроме партнёрских товаров и позиций по акции.</p>
        </section>

        <VolumeTiers />

        <section className={`${styles.card} ${styles.secondaryCard}`} aria-labelledby="delivery-title">
          <h2 id="delivery-title" className={styles.cardTitle}>Скидка на доставку</h2>
          <p className={styles.offerValue}>Бесплатно от&nbsp;5&nbsp;000&nbsp;₽</p>
          <p className={styles.body}>По России, кроме отдалённых регионов.</p>
          <div className={styles.deliveryTerms}>
            <p>В отдалённые регионы РФ, Казахстан, Беларусь и Армению — скидка <strong>350&nbsp;₽</strong> на доставку за каждые <strong>5&nbsp;000&nbsp;₽</strong> в чеке.</p>
            <p>Стоимость доставки подтвердит менеджер после оформления заказа.</p>
          </div>
          <Link href="/shipping" className={styles.textLink}><span>Подробнее о доставке</span><OfferIcon name="arrow" /></Link>
        </section>

        <section className={`${styles.card} ${styles.secondaryCard}`} aria-labelledby="birthday-title">
          <h2 id="birthday-title" className={styles.cardTitle}>Скидка ко дню рождения</h2>
          <p className={styles.offerValue}>−10%</p>
          <p className={styles.body}>За 3 дня до и 3 дня после даты рождения.</p>
          <PromoCode code="DRCD" />
          <p className={styles.note}>После подтверждения даты рождения менеджером. Кроме партнёрских товаров и позиций по акции.</p>
        </section>
      </div>

      <aside className={styles.help} aria-label="Помощь с условиями скидок">
        <p>Поможем разобраться в условиях</p>
        <div className={styles.helpLinks}>
          <Link href="/contacts" className={styles.button}>Связаться с нами</Link>
          <Link href="/catalog/collection/sale" className={styles.textLink}><span>Товары со скидкой</span><OfferIcon name="arrow" /></Link>
        </div>
      </aside>
    </>
  );
}
