import { Link } from "react-router-dom";
import styles from "./PaymentError.module.css";

function PaymentError() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>❌</div>

        <h1 className={styles.title}>Ошибка оплаты!</h1>

        <p className={styles.message}>К сожалению, платёж не был обработан</p>

        <div className={styles.info}>
          <h3>Возможные причины:</h3>
          <ul>
            <li>Недостаточно средств на счёте</li>
            <li>Неправильные данные карты</li>
            <li>Карта заблокирована банком</li>
            <li>Проблема с подключением к серверу</li>
          </ul>
        </div>

        <div className={styles.buttons}>
          <Link to="/checkout" className={styles.primaryBtn}>
            Попробовать снова
          </Link>
          <Link to="/catalog" className={styles.secondaryBtn}>
            Вернуться в каталог
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentError;
