"use client";
import Link from "next/link";
import { useId, useState, useSyncExternalStore } from "react";
import { analyticsStatus, setAnalyticsEnabled, subscribeAnalytics } from "@/lib/analytics/metrika";
import styles from "./AnalyticsSettings.module.css";

export default function AnalyticsSettings() {
  const id = useId();
  const status = useSyncExternalStore<ReturnType<typeof analyticsStatus> | "loading">(
    subscribeAnalytics, analyticsStatus, () => "loading",
  );
  const [notice, setNotice] = useState("");
  const state = status === "loading" ? "Проверяем настройку…" : status === "unavailable"
    ? "Отключена на этом адресе" : status === "disabled" ? "Отключена в этом браузере" : "Включена в этом браузере";
  return <section className={styles.block} aria-labelledby={`${id}-title`}>
    <div className={styles.copy}>
      <h2 id={`${id}-title`}>Настройки аналитики</h2>
      <p>Яндекс Метрика помогает анализировать посещения и заказы.{" "}
        <Link href="/legal/privacy-policy#section-13">Подробнее</Link></p>
      <p className={styles.hint} id={`${id}-description`}>Корзина и оформление работают и без Метрики.</p>
    </div>
    <div className={styles.control}>
      <label className={styles.toggle}>
        <input type="checkbox" checked={status === "enabled"} disabled={status === "loading" || status === "unavailable"}
          aria-label="Яндекс Метрика" aria-describedby={`${id}-state ${id}-description`}
          onChange={event => {
          const enabled = event.currentTarget.checked;
          const { saved } = setAnalyticsEnabled(enabled);
          setNotice(saved ? "" : "Выбор применён в этой вкладке. Браузер не позволил сохранить настройку.");
        }} />
        <span><span className={styles.name}>Яндекс Метрика</span>
          <span className={styles.state} id={`${id}-state`} aria-live="polite">{state}</span></span>
      </label>
      <p className={styles.notice} role="status">{notice}</p>
    </div>
  </section>;
}
