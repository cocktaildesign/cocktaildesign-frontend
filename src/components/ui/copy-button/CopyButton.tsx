"use client";

import { useEffect, useRef, useState } from "react";
import CopyIcon from "@/components/icons/CopyIcon";
import styles from "./CopyButton.module.css";

type CopyButtonProps = {
  value: string;
  label: string;
  className?: string;
  successMessage?: string;
};

export default function CopyButton({ value, label, className, successMessage }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  function showSuccess() {
    clearTimeout(resetTimer.current);
    setCopied(true);
    resetTimer.current = setTimeout(() => setCopied(false), successMessage ? 4000 : 1200);
  }

  async function handleCopy() {
    try {
      const canUseClipboardApi =
        typeof navigator !== "undefined" &&
        typeof navigator.clipboard !== "undefined" &&
        typeof navigator.clipboard.writeText === "function" &&
        window.isSecureContext;

      if (canUseClipboardApi) {
        await navigator.clipboard.writeText(value);
        showSuccess();
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (ok) {
        showSuccess();
      }
    } catch (err) {
      console.log("Copy failed", err);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Скопировать: ${label}`}
      title="Копировать"
      className={`${styles.copyButton} ${className ?? ""}`}>
      {copied ? <span className={styles.iconSuccess}>✓</span> : <CopyIcon title={undefined} />}
      {successMessage && <span role="status" className={styles.status}>{copied ? successMessage : ""}</span>}
    </button>
  );
}
