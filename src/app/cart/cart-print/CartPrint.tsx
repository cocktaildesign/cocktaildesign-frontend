import Logo from "@/components/ui/logo/Logo";
import { ENGRAVING_PRICE_NOTE } from "@/lib/cart/engraving";
import { type CartQuote, quoteSummaryRows, QUOTE_DELIVERY_NOTE, QUOTE_PRICE_NOTE, QUOTE_ROUNDING_NOTE } from "@/lib/cart/cartQuote";
import styles from "./CartPrint.module.css";

const money = (cents: number) => new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);

export default function CartPrint({ quote, notice }: { quote: CartQuote | null; notice: string }) {
  if (!quote) return <div className={styles.printOnly}><p>{notice || "Дождитесь загрузки корзины перед печатью КП."}</p></div>;
  return <div className={styles.printOnly}>
    <div className={styles.header}>
      <div className={styles.logo}><Logo /></div>
      <div className={styles.contacts}><p>8 (995) 622-62-02</p><p>cocktaildesign@yandex.ru</p></div>
    </div>
    <div className={styles.titleRow}>
      <h1>Коммерческое предложение</h1>
      <p>Дата: {new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow" }).format(new Date())}</p>
    </div>
    <p className={styles.note}>{QUOTE_PRICE_NOTE}</p>
    <table className={styles.table}>
      <colgroup><col style={{ width: "31%" }} /><col style={{ width: "13%" }} /><col style={{ width: "12%" }} />
        <col style={{ width: "11%" }} /><col style={{ width: "13%" }} /><col style={{ width: "7%" }} /><col style={{ width: "13%" }} /></colgroup>
      <thead><tr><th>Наименование товара</th><th>Артикул</th><th>Цена на сайте за 1 шт., ₽</th>
        <th>Скидка за 1 шт., ₽</th><th>Цена за 1 шт. со скидкой, ₽</th><th>Кол-во, шт.</th><th>Стоимость со скидкой, ₽</th></tr></thead>
      <tbody>{quote.rows.map((row, index) => <tr key={index}>
        <td>{row.name}{row.engraving ? " (Гравировка — стоимость отдельно)" : ""}</td><td>{row.code || "—"}</td>
        <td>{money(row.unitCents)}</td><td>{row.roundedUnit ? "≈ " : ""}{money(row.unitDiscountCents)}</td>
        <td>{row.roundedUnit ? "≈ " : ""}{money(row.unitFinalCents)}</td><td>{row.quantity}</td><td>{money(row.finalCents)}</td>
      </tr>)}</tbody>
    </table>
    <div className={styles.totals}>
      <p>Количество товаров: {quote.totalQuantity} шт.</p>
      {quoteSummaryRows(quote).map(row => <p key={row.label}>{row.label}: <span>{money(row.cents)} ₽</span></p>)}
      <p className={styles.final}>Итого к оплате: <strong>{money(quote.finalCents)} ₽</strong></p>
    </div>
    <p className={styles.note}>{QUOTE_DELIVERY_NOTE}</p>
    {quote.rows.some(item => item.engraving) && <p className={styles.note}>{ENGRAVING_PRICE_NOTE}</p>}
    {quote.hasRoundedUnits && <p className={styles.note}>{QUOTE_ROUNDING_NOTE}</p>}
    {quote.fixedCents > 0 && <p className={styles.note}>Денежный промокод вычтен из общей суммы заказа после скидок по товарам, включая уценку.</p>}
    {["inventory", "startup"].includes(quote.pricing.promoType) && quote.pricing.bonusMessage &&
      <p className={styles.bonus}>{quote.pricing.bonusMessage}</p>}
    <p className={styles.footer}>Цены и скидки действительны на момент печати. Актуальные условия можно уточнить на сайте или по телефону.</p>
  </div>;
}
