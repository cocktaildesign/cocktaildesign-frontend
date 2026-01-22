"use client";

import { useCallback, useState } from "react";

import stylesFooter from "./Footer.module.css";
import styles from "./FooterFeedback.module.css";

import DialogueIcon from "@/components/icons/DialogueIcon";
import { Modal } from "@/components/ui/modal/Modal";
import FeedbackForm from "@/components/ui/feedback-form/FeedbackForm";

type Status = "idle" | "success";

export default function FooterFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("idle" as Status);

  const openModal = useCallback(() => {
    setIsOpen(true);
    setStatus("idle");
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <button type="button" className={stylesFooter.feedbackBar} onClick={openModal}>
        <span className={stylesFooter.feedbackBarIcon} aria-hidden="true">
          <DialogueIcon />
        </span>
        <span className={stylesFooter.feedbackBarText}>Предложить улучшение или сообщить об ошибке</span>
      </button>

      <Modal isOpen={isOpen} onClose={closeModal} title="Обратная связь">
        {status === "success" ? (
          <div className={styles.success} role="status" aria-live="polite">
            Спасибо! Сообщение отправлено.
          </div>
        ) : (
          <FeedbackForm
            onSuccess={() => {
              setStatus("success");

              setTimeout(() => {
                closeModal();
              }, 1200);
            }}
          />
        )}
      </Modal>
    </>
  );
}
