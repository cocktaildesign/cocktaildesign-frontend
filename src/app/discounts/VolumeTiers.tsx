"use client";

import { useState, type ChangeEvent } from "react";
import styles from "./VolumeTiers.module.css";

const TIERS = [
  { pct: 5, min: 10000 },
  { pct: 8, min: 25000 },
  { pct: 12, min: 50000 },
  { pct: 16, min: 100000 },
  { pct: 20, min: 200000 },
];

function formatPrice(value: number) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function getActiveTier(sum: number) {
  for (let index = TIERS.length - 1; index >= 0; index--) {
    if (sum >= TIERS[index].min) {
      return TIERS[index];
    }
  }

  return null;
}

function getNextTier(sum: number) {
  return TIERS.find((tier) => sum < tier.min) ?? null;
}

function getTierPosition(index: number) {
  return `${(index / (TIERS.length - 1)) * 100}%`;
}

function getProgress(sum: number) {
  const firstTier = TIERS[0];
  const lastTier = TIERS[TIERS.length - 1];

  if (sum < firstTier.min) {
    return 0;
  }

  if (sum >= lastTier.min) {
    return 100;
  }

  let activeIndex = 0;

  for (let index = 0; index < TIERS.length; index++) {
    if (sum >= TIERS[index].min) {
      activeIndex = index;
    }
  }

  const currentTier = TIERS[activeIndex];
  const nextTier = TIERS[activeIndex + 1];
  const segmentSize = 100 / (TIERS.length - 1);
  const segmentProgress = (sum - currentTier.min) / (nextTier.min - currentTier.min);

  return activeIndex * segmentSize + segmentProgress * segmentSize;
}

export default function VolumeTiers() {
  const [orderSum, setOrderSum] = useState("");

  const sum = Number(orderSum) || 0;
  const activeTier = getActiveTier(sum);
  const nextTier = getNextTier(sum);
  const discountPercent = activeTier?.pct ?? 0;
  const saving = Math.round((sum * discountPercent) / 100);
  const totalAfterDiscount = Math.max(sum - saving, 0);
  const remaining = nextTier ? Math.max(nextTier.min - sum, 0) : 0;
  const progress = getProgress(sum);

  function handleOrderSumChange(event: ChangeEvent<HTMLInputElement>) {
    const numbers = event.target.value.replace(/\D/g, "").slice(0, 9);
    setOrderSum(numbers);
  }

  return (
    <section className={styles.section}>
      <div className={styles.calculator}>
        <div className={styles.calcHeader}>
          <div className={styles.calcField}>
            <label className={styles.calcLabel} htmlFor="orderSum">
              Сумма заказа
            </label>

            <div className={styles.inputWrap}>
              <input
                id="orderSum"
                className={styles.calcInput}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                value={orderSum ? Number(orderSum).toLocaleString("ru-RU") : ""}
                onChange={handleOrderSumChange}
                aria-describedby="orderSumHint"
              />
              <span className={styles.currency} aria-hidden="true">
                ₽
              </span>
            </div>

            <span id="orderSumHint" className={styles.inputHint}>
              Введите сумму, чтобы рассчитать скидку и экономию
            </span>
          </div>

          <div className={styles.currentLevel}>
            <span className={styles.currentLevelLabel}>Текущий уровень</span>
            <span className={styles.currentLevelValue}>{activeTier ? `Скидка ${activeTier.pct}%` : "Без скидки"}</span>
          </div>
        </div>

        <div className={styles.progressBlock}>
          <div className={styles.progressTrack} aria-hidden="true">
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />

            <div className={styles.progressMarks}>
              {TIERS.map((tier, index) => {
                const isPassed = sum >= tier.min;

                return (
                  <span
                    key={tier.pct}
                    className={`${styles.mark} ${isPassed ? styles.markPassed : ""}`}
                    style={{ left: getTierPosition(index) }}
                  />
                );
              })}
            </div>
          </div>

          <div className={styles.progressLabels}>
            {TIERS.map((tier, index) => {
              const isCurrent = activeTier?.pct === tier.pct;
              const isPassed = sum >= tier.min;

              return (
                <div
                  key={tier.pct}
                  className={`${styles.progressLabel} ${isPassed ? styles.progressLabelPassed : ""} ${
                    isCurrent ? styles.progressLabelCurrent : ""
                  }`}
                  style={{ left: getTierPosition(index) }}>
                  <span className={styles.progressPercent}>{tier.pct}%</span>
                  <span className={styles.progressAmount}>от {formatPrice(tier.min)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.metrics} aria-live="polite">
          <Metric
            label="Ваша скидка"
            value={`${discountPercent}%`}
            hint={
              activeTier
                ? `Применяется к заказам от ${formatPrice(activeTier.min)}`
                : `Начинается от ${formatPrice(TIERS[0].min)}`
            }
            primary
          />

          <Metric
            label="Экономия"
            value={formatPrice(saving)}
            hint={sum > 0 ? `К оплате ${formatPrice(totalAfterDiscount)}` : "Рассчитается автоматически"}
          />

          <Metric
            label={nextTier ? "До следующего уровня" : "Максимальный уровень"}
            value={nextTier ? formatPrice(remaining) : "Достигнут"}
            hint={nextTier ? `Следующая скидка — ${nextTier.pct}%` : "Доступна максимальная скидка 20%"}
            muted={!nextTier}
          />
        </div>
      </div>

      <div className={styles.notes}>
        <p className={styles.note}>
          * На часть позиций дополнительные скидки не распространяются. Полный перечень можете уточнить у менеджера.
        </p>
        <p className={styles.note}>** Скидки не суммируются с другими акциями.</p>
      </div>
    </section>
  );
}

type MetricProps = {
  label: string;
  value: string;
  hint: string;
  primary?: boolean;
  muted?: boolean;
};

function Metric({ label, value, hint, primary = false, muted = false }: MetricProps) {
  const className = `${styles.metric} ${primary ? styles.metricPrimary : ""} ${muted ? styles.metricMuted : ""}`;

  return (
    <div className={className}>
      <span className={styles.metricLabel}>{label}</span>
      <strong className={styles.metricValue}>{value}</strong>
      <span className={styles.metricHint}>{hint}</span>
    </div>
  );
}
