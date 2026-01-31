"use client";

import { useRouter } from "next/navigation";
import styles from "./BackButton.module.css";
import type { ComponentProps } from "react";
import ArrowBackIcon from "@/components/icons/ArrowBackIcon";

type Props = ComponentProps<"button"> & {
  color?: string;
};

export default function BackButton({ color, ...props }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/knowledge");
  };

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleBack}
      style={color ? { color } : undefined}
      aria-label="Вернуться назад"
      {...props}>
      <ArrowBackIcon width="6" height="12" />
      Вернуться назад
    </button>
  );
}
