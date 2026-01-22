"use client";

import { useCallback, useState } from "react";

import stylesFooter from "./Footer.module.css";
import styles from "./FooterFeedback.module.css";

import DialogueIcon from "@/components/icons/DialogueIcon";
import { Modal } from "@/components/ui/modal/Modal";

type Status = "idle" | "success";

export default function FooterFeedback() {
  const [isOpen, setIsOpen] = useState(false);

  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const [status, setStatus] = useState("idle" as Status);

  const canSubmit = message.trim().length > 0;

  const openModal = useCallback(() => {
    setIsOpen(true);
    setStatus("idle");
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  function resetForm() {
    setMessage("");
    setEmail("");
    setStatus("idle");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!canSubmit) return;

    // Пока без отправки на сервер. На следующем шаге подключим API route.
    console.log({
      message: message.trim(),
      email: email.trim() || null,
      page: typeof window !== "undefined" ? window.location.href : null,
    });

    setStatus("success");

    setTimeout(() => {
      closeModal();
      resetForm();
    }, 2000);
  }

  return (
    <>
      <button type="button" className={stylesFooter.feedbackBar} onClick={openModal}>
        <span className={stylesFooter.feedbackBarIcon} aria-hidden="true">
          <DialogueIcon />
        </span>
        <span className={stylesFooter.feedbackBarText}>Предложить улучшение или сообщить об ошибке</span>
      </button>

      <Modal isOpen={isOpen} onClose={closeModal} title="Обратная связь">
        <div className={styles.wrapper}>
          <header className={styles.header}>
            <h2 className={styles.title}>Поделитесь мнением</h2>
            <p className={styles.subtitle}>Это помогает сделать страницу лучше.</p>
          </header>

          {status === "success" ? (
            <div className={styles.success} role="status" aria-live="polite">
              Спасибо! Сообщение отправлено.
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
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
          )}
        </div>
      </Modal>
    </>
  );
}
