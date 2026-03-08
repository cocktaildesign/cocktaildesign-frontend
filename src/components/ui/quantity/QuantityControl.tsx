// src/components/ui/quantity/QuantityControl.tsx
"use client";

import styles from "./QuantityControl.module.css";

type QuantityControlProps = {
  value: number;
  onChange: (nextValue: number) => void;
  min?: number;
};

export default function QuantityControl({ value, onChange, min = 1 }: QuantityControlProps) {
  function increment() {
    onChange(value + 1);
  }

  function decrement() {
    if (value <= min) return;
    onChange(value - 1);
  }

  return (
    <div className={styles.quantityControl}>
      <button type="button" className={styles.quantityButton} aria-label="Уменьшить количество" onClick={decrement}>
        -
      </button>

      <input
        type="number"
        className={styles.quantityInput}
        aria-label="Количество"
        min={min}
        value={value}
        onChange={(event) => {
          const raw = event.target.value;

          if (raw === "") {
            onChange(min);
            return;
          }

          const next = Number(raw);

          if (!Number.isFinite(next) || next < min) {
            onChange(min);
            return;
          }

          onChange(next);
        }}
      />

      <button type="button" className={styles.quantityButton} aria-label="Увеличить количество" onClick={increment}>
        +
      </button>
    </div>
  );
}
