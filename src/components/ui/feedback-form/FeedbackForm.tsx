"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";

import { sendFeedback } from "@/lib/feedback";
import { FEEDBACK_CONSENT_TEXT, LEGAL_VERSION } from "@/lib/legal/company";

import styles from "./FeedbackForm.module.css";

type FeedbackFormProps = {
  onSuccess?: () => void;
};

export default function FeedbackForm(props: FeedbackFormProps) {
  const { onSuccess } = props;

  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const attempt = useRef<{ content: string; requestId: string } | null>(null);

  const canSubmit = message.trim().length > 0 && consent;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!canSubmit || inFlight.current) return;
    inFlight.current = true;
    setStatus("sending");
    setError("");
    const payload = { message: message.trim(), email: email.trim(), page: window.location.pathname,
      consent: { accepted: true as const, version: LEGAL_VERSION } };
    const content = JSON.stringify(payload);
    try {
      if (attempt.current?.content !== content) attempt.current = { content, requestId: crypto.randomUUID() };
      await sendFeedback({ ...payload, requestId: attempt.current.requestId });
      setMessage("");
      setEmail("");
      setConsent(false);
      attempt.current = null;
      setStatus("success");
      onSuccess?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось отправить сообщение. Попробуйте ещё раз.");
      setStatus("error");
    } finally {
      inFlight.current = false;
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-busy={status === "sending"}>
      <header className={styles.header}>
        <h2 className={styles.title}>Помогите нам стать лучше</h2>
        <p className={styles.subtitle}>Расскажите, что можно улучшить на сайте или в работе нашей компании.</p>
      </header>

      <label className={styles.field}>
        <span className={styles.label}>Что можно улучшить?</span>
        <textarea
          className={styles.textarea}
          value={message}
          onChange={(e) => { setMessage(e.target.value); setStatus("idle"); setError(""); }}
          rows={8}
          placeholder="Опишите проблему или предложение…"
          required
          maxLength={3000}
          disabled={status === "sending"}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Email для ответа (необязательно)</span>
        <input
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="name@example.com"
          maxLength={254}
          disabled={status === "sending"}
        />
      </label>

      <div className={styles.consent}>
        <label><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required disabled={status === "sending"} />
          <span>{FEEDBACK_CONSENT_TEXT}</span></label>
        <a href="/legal/consent" target="_blank" rel="noopener noreferrer" className={styles.link}>Текст согласия</a>
      </div>

      <button className={styles.submit} type="submit" disabled={!canSubmit || status === "sending"}>
        {status === "sending" ? "Отправляем…" : "Отправить"}
      </button>

      {status === "success" && <p className={styles.success} role="status">Спасибо! Ваше сообщение принято.</p>}
      {status === "error" && <p className={styles.error} role="alert">{error}</p>}

      <p className={styles.note}>
        О том, как мы используем данные, — в{" "}
        <a className={styles.link} href="/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
          Политике обработки персональных данных
        </a>
        .
      </p>
    </form>
  );
}
