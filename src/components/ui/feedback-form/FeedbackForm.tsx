"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import styles from "./FeedbackForm.module.css";

type FeedbackFormProps = {
  onSuccess?: () => void;
};

export default function FeedbackForm(props: FeedbackFormProps) {
  const { onSuccess } = props;

  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const canSubmit = message.trim().length > 0;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!canSubmit) return;

    console.log({
      message: message.trim(),
      email: email.trim() || null,
      page: typeof window !== "undefined" ? window.location.href : null,
    });

    onSuccess?.();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <header className={styles.header}>
        <h2 className={styles.title}>Поделитесь мнением</h2>
        <p className={styles.subtitle}>Это помогает сделать наш сайт лучше.</p>
      </header>

      <label className={styles.field}>
        <span className={styles.label}>Что можно улучшить?</span>
        <textarea
          className={styles.textarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={8}
          placeholder="Опишите проблему или предложение…"
          required
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
        />
      </label>

      <button className={styles.submit} type="submit" disabled={!canSubmit}>
        Отправить
      </button>

      <p className={styles.note}>
        Нажимая «Отправить», вы соглашаетесь с{" "}
        <a className={styles.link} href="/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
          политикой конфиденциальности
        </a>
        .
      </p>
    </form>
  );
}
