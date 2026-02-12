"use client";

import Image from "next/image";
import { useState } from "react";
import type { Discounts } from "../types";
import styles from "./DiscountsCard.module.css";
import { Modal } from "@/components/ui/modal/Modal";
import DiscountModal from "../discounts-modal/DiscountsModal";

type DiscountsCardProps = {
  discount: Discounts;
};

export default function DiscountCard({ discount }: DiscountsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <article className={styles.card}>
        <button
          type="button"
          className={styles.cardButton} // делаем кнопкой весь контейнер
          onClick={() => setIsModalOpen(true)}
          aria-label={`Подробнее об акции: ${discount.title}`}>
          {/* Картинка теперь просто <img> внутри кнопки, не интерактивная */}
          <Image
            className={styles.cardImage}
            src={discount.image}
            alt="" // оставляем пустым, так как описание уже в aria-label кнопки
            width={400}
            height={190}
          />
          <h2 className={styles.cardTitle}>{discount.title}</h2>
        </button>
      </article>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={discount.title}>
        <DiscountModal title={discount.title} blocks={discount.blocks} />
      </Modal>
    </>
  );
}
