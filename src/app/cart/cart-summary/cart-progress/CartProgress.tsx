import type { DiscountTier } from "@/lib/cart/discountTiers";
import styles from "./CartProgress.module.css";

type CartProgressProps = {
  discountableTotal: number;
  currentTier: DiscountTier | null;
  nextTier: DiscountTier | null;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.ceil(price));
}

export default function CartProgress({ discountableTotal, currentTier, nextTier }: CartProgressProps) {
  if (!nextTier) return null;

  const remaining = nextTier.minAmount - discountableTotal;

  const fromAmount = currentTier ? currentTier.minAmount : 0;
  const toAmount = nextTier.minAmount;

  const progress = Math.min((discountableTotal - fromAmount) / (toAmount - fromAmount), 1);

  const RADIUS = 20;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className={styles.progressBlock}>
      {/* Круг прогресса */}
      <div className={styles.progressCircleWrapper}>
        <svg className={styles.progressSvg} width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
          <circle cx="26" cy="26" r={RADIUS} stroke="#BFC7D1" strokeWidth="3" fill="none" />

          <circle
            cx="26"
            cy="26"
            r={RADIUS}
            stroke="#0F172A"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 26 26)"
          />
        </svg>

        {/* Иконка */}
        <div className={styles.progressIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 8L12 3L3 8M21 8V16L12 21M21 8L12 13M3 8V16L12 21M3 8L12 13M12 13V21"
              stroke="#0F172A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Текст */}
      <p className={styles.progressText}>
        Добавьте ещё <span className={styles.progressAmount}>{formatPrice(remaining)} ₽</span> и получите скидку{" "}
        <span className={styles.progressPercent}>{nextTier.percent}%</span>
      </p>
    </div>
  );
}
