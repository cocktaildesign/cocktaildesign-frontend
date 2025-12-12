import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import styles from "./PaymentSuccess.module.css";

interface OrderData {
  orderId: string;
  name: string;
  email: string;
  total: number;
}

function PaymentSuccess() {
  // Получаем данные используя useMemo (не useState)
  const orderData: OrderData | null = useMemo(() => {
    const orderId = localStorage.getItem("lastOrderId");
    const name = localStorage.getItem("lastOrderName");
    const email = localStorage.getItem("lastOrderEmail");
    const total = localStorage.getItem("lastOrderTotal");

    if (orderId && name && email && total) {
      return {
        orderId: orderId,
        name: name,
        email: email,
        total: Number(total),
      };
    }

    return null;
  }, []);

  // Очищаем localStorage только один раз
  useEffect(() => {
    localStorage.removeItem("lastOrderId");
    localStorage.removeItem("lastOrderName");
    localStorage.removeItem("lastOrderEmail");
    localStorage.removeItem("lastOrderTotal");
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>✅</div>

        <h1 className={styles.title}>Спасибо за заказ!</h1>

        {orderData ? (
          <>
            <p className={styles.message}>Ваш заказ успешно создан</p>

            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Номер заказа:</span>
                <span className={styles.value}>{orderData.orderId}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.label}>Имя:</span>
                <span className={styles.value}>{orderData.name}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.label}>Email:</span>
                <span className={styles.value}>{orderData.email}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.label}>Сумма:</span>
                <span className={styles.value}>{orderData.total} ₽</span>
              </div>
            </div>

            <div className={styles.info}>
              <h3>Что дальше?</h3>
              <ul>
                <li>На вашу почту отправлена квитанция</li>
                <li>Менеджер свяжется с вами в течение часа</li>
                <li>Доставка будет осуществлена в указанный срок</li>
              </ul>
            </div>
          </>
        ) : (
          <p className={styles.message}>Загрузка данных заказа...</p>
        )}

        <div className={styles.buttons}>
          <Link to="/catalog" className={styles.primaryBtn}>
            Вернуться в каталог
          </Link>
          <Link to="/" className={styles.secondaryBtn}>
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
