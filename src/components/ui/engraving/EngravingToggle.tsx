// frontend/src/components/ui/engraving/EngravingToggle.tsx
"use client";

import styles from "./EngravingToggle.module.css";

type EngravingToggleProps = {
  checked: boolean;
  onChange: (nextChecked: boolean) => void;
  className?: string;
};

export default function EngravingToggle({ checked, onChange, className }: EngravingToggleProps) {
  return (
    <label className={`${styles.engravingControl}${className ? ` ${className}` : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        className={styles.engravingCheckbox}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />
      <span className={styles.switch} aria-hidden="true" />
      <span className={styles.label}>Гравировка</span>
    </label>
  );
}
