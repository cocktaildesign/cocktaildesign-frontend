import { Modal } from "@/components/ui/modal/Modal";

import styles from "./PromoModal.module.css";

type PromoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const GIFTS = [
  "Латунное клише 50×50 мм с логотипом заведения",
  "Гравировка на одном виде инвентаря (все шейкеры, стрейнеры и т.д.)",
  "Любое изделие Cocktail Design (ложка, стрейнер, файн или барблейд)",
  "10% скидка на следующий заказ",
];

const STEPS = [
  "Добавьте нужные товары в корзину",
  "При оформлении введите промокод или скажите менеджеру",
  "Менеджер свяжется с вами и поможет выбрать подарок",
];

export function PromoModal({ isOpen, onClose }: PromoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Скидка 20% для новых клиентов">
      <div className={styles.inner}>
        <span className={styles.badge}>Только для новых клиентов</span>

        <h2 className={styles.title}>Скидка 20% и подарок на выбор</h2>

        <p className={styles.subtitle}>При первом заказе от 20 000₽</p>

        {/* Что входит */}
        <p className={styles.sectionLabel}>Что входит</p>

        <ul className={styles.perks}>
          <li className={styles.perk}>
            <span className={styles.check}>✓</span>
            <span>Скидка 20% на весь заказ</span>
          </li>

          <li className={styles.perk}>
            <span className={styles.check}>✓</span>
            <span>Бесплатная доставка по всей России</span>
          </li>

          <li className={styles.perk}>
            <span className={styles.check}>✓</span>
            <span>Подарок на выбор:</span>
          </li>
        </ul>

        <ul className={styles.gifts}>
          {GIFTS.map((gift) => (
            <li key={gift} className={styles.gift}>
              {gift}
            </li>
          ))}
        </ul>

        <div className={styles.divider} />

        {/* Как получить */}
        <p className={styles.sectionLabel}>Как получить</p>

        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <li key={step} className={styles.step}>
              <span className={styles.stepNum}>{index + 1}</span>
              <span className={styles.stepText}>{step}</span>
            </li>
          ))}
        </ol>

        {/* Промокод */}
        <div className={styles.promoRow}>
          <span className={styles.promoLabel}>Промокод</span>
          <span className={styles.promoCode}>STARTCD20</span>
        </div>

        <div className={styles.divider} />

        <p className={styles.note}>
          Акция действует только для новых клиентов. Скидка не распространяется на партнёрские товары и позиции с уже
          действующими акциями.
        </p>
      </div>
    </Modal>
  );
}
