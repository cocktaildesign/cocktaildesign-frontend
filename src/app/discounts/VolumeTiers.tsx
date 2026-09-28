"use client";

import { useState, type ChangeEvent } from "react";
import { getCurrentTier, getNextTier, useDiscountTiers } from "@/lib/cart/discountTiers";
import styles from "./VolumeTiers.module.css";

function formatPrice(value: number) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function getTierPosition(index: number, tiersCount: number) {
  if (tiersCount <= 1) {
    return "0%";
  }

  return `${(index / (tiersCount - 1)) * 100}%`;
}

function getSafeProgress(orderAmount: number, scale: ReadonlyArray<{ minAmount: number }>): number {
  if (scale.length < 2) {
    return 0;
  }

  const nextIndex = scale.findIndex((point) => point.minAmount > orderAmount);

  if (nextIndex === -1) {
    return 100;
  }

  if (nextIndex === 0) {
    return 0;
  }

  const rangeStart = scale[nextIndex - 1].minAmount;
  const rangeEnd = scale[nextIndex].minAmount;
  const intervalProgress = (orderAmount - rangeStart) / (rangeEnd - rangeStart);

  // Each interval occupies only the space between its two visible marks.
  return ((nextIndex - 1 + intervalProgress) / (scale.length - 1)) * 100;
}

export default function VolumeTiers() {
  const { tiers, isLoading } = useDiscountTiers();
  const [orderSum, setOrderSum] = useState("");

  const orderAmount = Number(orderSum) || 0;
  const currentTier = getCurrentTier(tiers, orderAmount);
  const nextTier = getNextTier(tiers, orderAmount);
  const currentPercent = currentTier?.percent ?? 0;
  const saving = Math.round((orderAmount * currentPercent) / 100);
  const totalAfterDiscount = Math.max(orderAmount - saving, 0);
  const amountUntilNextTier = nextTier ? Math.max(nextTier.minAmount - orderAmount, 0) : 0;
  const scaleTiers = [{ id: "no-discount", minAmount: 0, percent: 0 }, ...tiers];
  const safeProgress = getSafeProgress(orderAmount, scaleTiers);

  const maximumPercent = tiers.length > 0 ? Math.max(...tiers.map((tier) => tier.percent)) : 0;

  const firstTier = tiers[0] ?? null;

  let discountHint = "";
  if (currentTier) {
    discountHint = `Применяется к заказам от ${formatPrice(currentTier.minAmount)}`;
  } else if (firstTier) {
    discountHint = `Начинается от ${formatPrice(firstTier.minAmount)}`;
  }

  function handleOrderSumChange(event: ChangeEvent<HTMLInputElement>) {
    const numbers = event.target.value.replace(/\D/g, "").slice(0, 9);
    setOrderSum(numbers);
  }

  return (
    <section className={styles.section}>
      <div className={styles.calculator}>
        {isLoading && <p>Загружаем условия скидок…</p>}

        {!isLoading && tiers.length === 0 && <p>Условия накопительных скидок временно недоступны.</p>}

        {!isLoading && tiers.length > 0 && (
          <>
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
                <span className={styles.currentLevelValue}>
                  {currentTier ? `Скидка ${currentTier.percent}%` : "Без скидки"}
                </span>
              </div>
            </div>

            <div className={styles.progressBlock}>
              <div className={styles.progressTrack} aria-hidden="true">
                <div className={styles.progressFill} style={{ width: `${safeProgress}%` }} />

                <div className={styles.progressMarks}>
                  {scaleTiers.map((tier, index) => {
                    const isPassed = orderAmount >= tier.minAmount;

                    return (
                      <span
                        key={tier.id}
                        className={`${styles.mark} ${isPassed ? styles.markPassed : ""}`}
                        style={{ left: getTierPosition(index, scaleTiers.length) }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className={styles.progressLabels}>
                {scaleTiers.map((tier, index) => {
                  const isCurrent = currentTier ? currentTier.id === tier.id : index === 0;
                  const isPassed = orderAmount >= tier.minAmount;

                  return (
                    <div
                      key={tier.id}
                      className={`${styles.progressLabel} ${isPassed ? styles.progressLabelPassed : ""} ${
                        isCurrent ? styles.progressLabelCurrent : ""
                      }`}
                      style={{ left: getTierPosition(index, scaleTiers.length) }}>
                      <span className={styles.progressPercent}>{tier.percent}%</span>
                      <span className={styles.progressAmount}>от {formatPrice(tier.minAmount)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.metrics} aria-live="polite">
              <Metric
                label="Ваша скидка"
                value={`${currentPercent}%`}
                hint={discountHint}
                primary
              />

              <Metric
                label="Экономия"
                value={formatPrice(saving)}
                hint={
                  orderAmount > 0 ? `К оплате ${formatPrice(totalAfterDiscount)}` : "Рассчитается автоматически"
                }
              />

              <Metric
                label={nextTier ? "До следующего уровня" : "Максимальный уровень"}
                value={nextTier ? formatPrice(amountUntilNextTier) : "Достигнут"}
                hint={
                  nextTier
                    ? `Следующая скидка — ${nextTier.percent}%`
                    : `Доступна максимальная скидка ${maximumPercent}%`
                }
                muted={!nextTier}
              />
            </div>
          </>
        )}
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
