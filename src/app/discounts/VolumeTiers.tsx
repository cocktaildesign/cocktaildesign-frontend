"use client";

import { useState } from "react";
import styles from "./VolumeTiers.module.css";

const tiers = [
  { pct: 5, min: 10000 },
  { pct: 8, min: 25000 },
  { pct: 12, min: 50000 },
  { pct: 16, min: 100000 },
  { pct: 20, min: 200000 },
];

function formatPrice(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

export default function VolumeTiers() {
  const [orderSum, setOrderSum] = useState("");

  const sum = parseFloat(orderSum) || 0;

  // Находим последний подходящий тир (наибольший где sum >= min)
  const activeTier = [...tiers].reverse().find((t) => sum >= t.min) || null;

  const saving = activeTier ? Math.round((sum * activeTier.pct) / 100) : 0;

  return (
    <section className={styles.section}>


      {/* Калькулятор */}
      <div className={styles.calculator}>
        <label className={styles.calcLabel} htmlFor="orderSum">
          Сумма заказа
        </label>
        <input
          id="orderSum"
          className={styles.calcInput}
          type="number"
          placeholder="Введите сумму"
          value={orderSum}
          onChange={(e) => setOrderSum(e.target.value)}
        />
        {activeTier && (
          <p className={styles.calcResult}>
            Скидка <strong>{activeTier.pct}%</strong> — экономия <strong>{formatPrice(saving)}</strong>
          </p>
        )}
        {sum > 0 && !activeTier && <p className={styles.calcHint}>Скидка начинается от {formatPrice(tiers[0].min)}</p>}
      </div>

      {/* Карточки ступеней */}
      <ul className={styles.tiers}>
        {tiers.map((tier) => (
          <li key={tier.pct} className={`${styles.tier} ${activeTier?.pct === tier.pct ? styles.tierActive : ""}`}>
            <span className={styles.tierLabel}>от {formatPrice(tier.min)}</span>
            <span className={styles.tierPct}>{tier.pct}%</span>
            <span className={styles.tierSub}>скидка</span>
            {activeTier?.pct === tier.pct && <span className={styles.tierBadge}>ваш уровень</span>}
          </li>
        ))}
      </ul>

      {/* Сноски */}
      <div className={styles.notes}>
        <p className={styles.note}>
          * На часть позиций дополнительные скидки не распространяются. Полный перечень можете уточнить у менеджера.
        </p>
        <p className={styles.note}>** Скидки не суммируются с другими акциями.</p>
      </div>
    </section>
  );
}
