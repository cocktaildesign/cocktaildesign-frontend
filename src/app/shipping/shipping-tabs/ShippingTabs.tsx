"use client";

import ServiceSections from "@/components/service-sections/ServiceSections";
import styles from "./ShippingTabs.module.css";

const SECTIONS = [
  { id: "world", label: "Россия и мир" },
  { id: "spb", label: "Санкт-Петербург" },
  { id: "pickup", label: "Самовывоз" },
  { id: "discounts", label: "Скидки на доставку" },
  { id: "returns", label: "Возврат" },
  { id: "damaged", label: "Повреждённая посылка" },
];

function Contacts() {
  return <div className={styles.contacts}>
    <a href="tel:+79956226202">+7 (995) 622-62-02</a>
    <a href="mailto:cocktaildesign@yandex.ru">cocktaildesign@yandex.ru</a>
  </div>;
}

export default function DeliveryTabs() {
  return <ServiceSections id="shipping" label="Разделы доставки" sections={SECTIONS}
    renderContent={(id, select) => {
      switch (id) {
        case "world": return <>
          <h2 className={styles.title}>Доставка по России и миру</h2>
          <table className={styles.routes}>
            <thead><tr><th scope="col">Направление</th><th scope="col">Служба доставки</th></tr></thead>
            <tbody>
              <tr><th scope="row">Россия, Беларусь, Казахстан, Армения</th><td>СДЭК</td></tr>
              <tr><th scope="row">Весь мир</th><td>Почта России, EMS</td></tr>
            </tbody>
          </table>
          <div className={styles.delivery}>
            <h3>Курьерская доставка по России</h3>
            <dl className={styles.metrics}>
              <div><dt>Средняя стоимость</dt><dd>400–650 ₽</dd></div>
              <div><dt>Ориентировочный срок</dt><dd>3–5 дней</dd></div>
            </dl>
            <p className={styles.dispatch}>Отправка — в течение 1–2 дней после оплаты заказа.</p>
          </div>
          <div className={styles.benefit}>
            <div className={styles.benefitHeading}>
              <h3>Бесплатная доставка по России от 5 000 ₽</h3>
              <button type="button" className={styles.link} onClick={() => select("discounts")}>Условия <span aria-hidden="true">→</span></button>
            </div>
            <p>Для крупногабаритных заказов и отдалённых регионов — скидка 350 ₽ за каждые 5 000 ₽.</p>
          </div>
        </>;
        case "spb": return <>
          <h2 className={styles.title}>Доставка по Санкт-Петербургу</h2>
          <dl className={styles.info}>
            <div><dt>Экспресс-доставка по центру</dt><dd>700 ₽.</dd></div>
            <div><dt>Бесплатная экспресс-доставка</dt><dd>При заказе от 7 000 ₽ — в Василеостровский, Адмиралтейский, Петроградский и Центральный районы.</dd></div>
            <div><dt>Остальные районы</dt><dd>Экспресс-доставка по тарифам службы доставки. Скидка на доставку — 350 ₽ за каждые 7 000 ₽ в заказе.</dd></div>
            <div><dt>СДЭК: 1–2 рабочих дня</dt><dd>До пункта выдачи — 275 ₽, курьером до адреса — 465 ₽. При заказе от 5 000 ₽ — бесплатно.</dd></div>
          </dl>
        </>;
        case "pickup": return <>
          <h2 className={styles.title}>Самовывоз</h2>
          <dl className={styles.info}>
            <div><dt>Адрес</dt><dd>Санкт-Петербург, ул. Уральская, 19к8, бизнес-центр «Урал Плаза», офис 120.</dd></div>
            <div><dt>Перед приездом</dt><dd>Согласуйте самовывоз с менеджером. Выдаём заказы в рабочие часы.</dd></div>
          </dl>
          <Contacts />
        </>;
        case "discounts": return <>
          <h2 className={styles.title}>Скидки на доставку</h2>
          <dl className={styles.info}>
            <div><dt>По России — бесплатно от 5 000 ₽</dt><dd>Исключения — крупногабаритные заказы и доставка в отдалённые регионы.</dd></div>
            <div><dt>Скидка 350 ₽ за каждые 5 000 ₽</dt><dd>Для крупногабаритных заказов, доставки в отдалённые регионы России, а также в Казахстан, Беларусь и Армению.</dd></div>
            <div><dt>Экспресс-доставка по Петербургу</dt><dd>В остальные районы — скидка 350 ₽ за каждые 7 000 ₽ в заказе.</dd></div>
          </dl>
          <button type="button" className={styles.link} onClick={() => select("spb")}>Все условия доставки по Петербургу <span aria-hidden="true">→</span></button>
        </>;
        case "returns": return <>
          <h2 className={styles.title}>Условия возврата</h2>
          <p className={styles.text}>Возврат и обмен — в течение 14 дней, не считая дня покупки.</p>
          <ul className={styles.list}>
            <li>Товар не был в употреблении.</li>
            <li>Сохранены товарный вид и потребительские свойства.</li>
          </ul>
          <p className={styles.text}>По вопросам возврата свяжитесь с нами.</p>
          <Contacts />
        </>;
        case "damaged": return <>
          <h2 className={styles.title}>Если посылка повреждена</h2>
          <p className={styles.text}>Если при получении вы заметили повреждения упаковки, следы вскрытия или подозрительные звуки внутри:</p>
          <ol className={styles.list}>
            <li>Сразу составьте акт о повреждении на месте получения.</li>
            <li>Попросите сотрудника службы доставки помочь с оформлением акта.</li>
            <li>После составления акта свяжитесь с нами.</li>
          </ol>
          <Contacts />
        </>;
        default: return null;
      }
    }} />;
}
