"use client";

import Link from "next/link";
import ServiceSections from "@/components/service-sections/ServiceSections";
import styles from "./PaymentTabs.module.css";

const SECTIONS = [
  { id: "legal", label: "Организациям и ИП" },
  { id: "physical", label: "Частным покупателям" },
];

export default function PaymentTabs() {
  return <ServiceSections id="payment" label="Разделы оплаты" sections={SECTIONS}
    renderContent={(id) => id === "legal" ? (
      <>
        <h2 className={styles.title}>Оплата по счёту</h2>
        <p className={styles.subtitle}>Выставим счёт для оплаты по реквизитам.</p>
        <ol className={styles.steps}>
          <li><span className={styles.number} aria-hidden="true">1</span><div>
            <h3>Оформите заказ</h3><p>Укажите ИНН организации или ИП при оформлении.</p>
          </div></li>
          <li><span className={styles.number} aria-hidden="true">2</span><div>
            <h3>Получите счёт</h3><p>Выставим счёт после согласования заказа.</p>
          </div></li>
          <li><span className={styles.number} aria-hidden="true">3</span><div>
            <h3>Оплатите счёт</h3><p>После поступления оплаты подготовим заказ к отправке.</p>
          </div></li>
        </ol>
        <p className={styles.note}>Для изделий на заказ после оплаты запускаем производство. Срок изготовления согласуем отдельно.</p>
        <Link href="/legal/requisites" className={styles.link}>Смотреть реквизиты <span aria-hidden="true">→</span></Link>
      </>
    ) : (
      <>
        <h2 className={styles.title}>Оплата покупки</h2>
        <div className={styles.methods}>
          <section><h3>Банковской картой</h3><p>Онлайн — по ссылке на оплату после подтверждения заказа. В офисе — через терминал.</p></section>
          <section><h3>Наличными</h3><p>В нашем офисе в Санкт-Петербурге. После оплаты выдаём кассовый чек.</p></section>
        </div>
        <Link href="/contacts" className={styles.link}>Адрес и часы работы офиса <span aria-hidden="true">→</span></Link>
      </>
    )} />;
}
