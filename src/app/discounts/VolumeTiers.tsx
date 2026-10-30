"use client";

import { useState } from "react";
import { getCurrentTier, getNextTier, useDiscountTiers } from "@/lib/cart/discountTiers";
import styles from "./Discounts.module.css";

// Published terms from cocktaildesign.ru/sistema-skidok, checked 30.10.2026.
// Keep information visible while loading; calculations require the live tiers.
const publishedTiers = [
  { id: 1, minAmount: 10000, percent: 5 },
  { id: 2, minAmount: 25000, percent: 8 },
  { id: 3, minAmount: 50000, percent: 12 },
  { id: 4, minAmount: 100000, percent: 16 },
  { id: 5, minAmount: 200000, percent: 20 },
];
const money = (value: number) => `${value.toLocaleString("ru-RU")} ₽`;

export default function VolumeTiers() {
  const { tiers, isLoading, error } = useDiscountTiers();
  const [orderSum, setOrderSum] = useState("");
  const available = !isLoading && !error && tiers.length > 0;
  const displayTiers = available ? tiers : publishedTiers;
  const amount = Number(orderSum) || 0;
  const current = getCurrentTier(tiers, amount);
  const next = getNextTier(tiers, amount);
  const percent = current?.percent ?? 0;
  const saving = Math.round(amount * percent / 100);

  return (
    <section className={`${styles.card} ${styles.volume}`} aria-labelledby="volume-title">
      <h2 id="volume-title" className={styles.cardTitle}>Скидка за объём заказа</h2>
      <table className={styles.tiers}>
        <caption className={styles.srOnly}>Скидки в зависимости от суммы одного заказа</caption>
        <thead><tr><th scope="col">Сумма одного заказа</th><th scope="col">Скидка</th></tr></thead>
        <tbody>{displayTiers.map((tier) => (
          <tr key={tier.id} className={available && amount > 0 && current?.id === tier.id ? styles.activeTier : undefined}>
            <th scope="row">от {money(tier.minAmount)}</th><td>{tier.percent}%</td>
          </tr>
        ))}</tbody>
      </table>
      <p className={styles.note}>Есть исключения по товарам. Не суммируется с другими акциями.</p>
      <details className={`${styles.details} ${styles.calculator}`}>
        <summary>Рассчитать скидку <span className={styles.plus} aria-hidden="true" /></summary>
        <div className={styles.detailsBody}>
          {isLoading ? <p role="status">Загружаем условия для расчёта…</p>
            : !available ? <p role="status">Сейчас расчёт недоступен. Условия из таблицы и итоговую скидку можно уточнить у менеджера.</p>
              : <>
                <label className={styles.inputLabel} htmlFor="orderSum">Сумма товаров без скидки</label>
                <div className={styles.inputWrap}>
                  <input id="orderSum" type="text" inputMode="numeric" autoComplete="off"
                    placeholder="Например, 25 000" aria-describedby="calculation-note"
                    value={orderSum ? Number(orderSum).toLocaleString("ru-RU") : ""}
                    onChange={(event) => setOrderSum(event.target.value.replace(/\D/g, "").slice(0, 9))} />
                  <span aria-hidden="true">₽</span>
                </div>
                <div className={styles.calculation} role="status" aria-live="polite" aria-atomic="true">
                  {amount > 0 ? <>
                    <dl className={styles.results}>
                      <div><dt>Скидка</dt><dd>{percent}%</dd></div>
                      <div><dt>Экономия</dt><dd>{money(saving)}</dd></div>
                      <div><dt>После скидки</dt><dd>{money(amount - saving)}</dd></div>
                    </dl>
                    <p className={styles.nextTier}>{next ? `До скидки ${next.percent}% — ещё ${money(next.minAmount - amount)}`
                      : `Достигнута максимальная скидка за объём — ${percent}%.`}</p>
                  </> : <p className={styles.note}>Введите сумму — покажем скидку и экономию.</p>}
                </div>
                <p id="calculation-note" className={styles.note}>Предварительный расчёт для товаров, участвующих в скидке. Доставка и другие акции не учитываются. Итоговую стоимость подтвердит менеджер.</p>
              </>}
        </div>
      </details>
    </section>
  );
}
