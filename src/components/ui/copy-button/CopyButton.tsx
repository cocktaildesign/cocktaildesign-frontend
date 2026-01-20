"use client";

import { useState } from "react";
import CopyIcon from "@/components/icons/CopyIcon";
import styles from "./CopyButton.module.css";

type CopyButtonProps = {
  value: string;
  label: string;
};

export default function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const canUseClipboardApi =
        typeof navigator !== "undefined" &&
        typeof navigator.clipboard !== "undefined" &&
        typeof navigator.clipboard.writeText === "function" &&
        window.isSecureContext;

      if (canUseClipboardApi) {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
        return;
      }

      // Fallback (работает чаще в dev и без secure context)
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
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
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
      className={styles.copyButton}>
      {copied ? <span className={styles.iconSuccess}>✓</span> : <CopyIcon title={undefined} />}
    </button>
  );
}
