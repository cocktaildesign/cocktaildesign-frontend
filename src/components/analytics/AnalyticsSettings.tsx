"use client";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { analyticsStatus, setAnalyticsEnabled, subscribeAnalytics } from "@/lib/analytics/metrika";
import styles from "./AnalyticsSettings.module.css";

export default function AnalyticsSettings() {
  const status = useSyncExternalStore(subscribeAnalytics, analyticsStatus, () => "unavailable" as const);
  const [notice, setNotice] = useState("");
  return <div className={styles.block}>
    <p>Для работы магазина используем техническое хранилище браузера. <Link href="/legal/privacy-policy">Об обработке данных</Link></p>
    <details className={styles.details}>
      <summary>Настройки аналитики</summary>
      <div className={styles.panel}>
        <p>{status === "unavailable" ? "Яндекс Метрика на этом сайте сейчас отключена." : status === "disabled" ? "Яндекс Метрика отключена в этом браузере." : "Яндекс Метрика включена для анализа посещаемости и улучшения сайта."}</p>
        <p>Настройка не влияет на корзину и оформление заказа. Она управляет Метрикой, но не встроенными картами и видеоплеерами.</p>
        {status !== "unavailable" && <button type="button" onClick={() => {
          const enabled = status === "disabled";
          const { saved } = setAnalyticsEnabled(enabled);
          setNotice(saved ? (enabled ? "Аналитика включена в этом браузере." : "Аналитика отключена в этом браузере.") : "Выбор применён только в этой вкладке: браузер не позволил сохранить настройку.");
        }}>{status === "disabled" ? "Включить Метрику" : "Отключить Метрику"}</button>}
        <p className={styles.notice} role="status">{notice}</p>
      </div>
    </details>
  </div>;
}
