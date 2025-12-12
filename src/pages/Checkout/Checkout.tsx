import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import styles from "./Checkout.module.css";

interface FormData {
  name: string;
  phone: string;
  email: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  deliveryMethod: "cdek" | "pickup";
}

function Checkout() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    city: "",
    street: "",
    house: "",
    apartment: "",
    deliveryMethod: "cdek",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Стоимость доставки
  const deliveryPrice = formData.deliveryMethod === "cdek" ? 500 : 0;

  // Сумма товаров
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Итоговая сумма
  const total = subtotal + deliveryPrice;

  // Валидация формы
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Введите имя";
    if (!formData.phone.trim()) newErrors.phone = "Введите телефон";
    if (!formData.email.trim()) newErrors.email = "Введите email";
    if (!formData.city.trim()) newErrors.city = "Введите город";
    if (!formData.street.trim()) newErrors.street = "Введите улицу";
    if (!formData.house.trim()) newErrors.house = "Введите номер дома";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка изменения формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Убираем ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Отправка заказа
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // ТЕСТИРОВАНИЕ: если дом = "999" → показываем ошибку
    if (formData.house === "999") {
      navigate("/paymentError");
      return;
    }

    // TODO: Генерируем ID заказа (Потом необходимо заменить на реальный ответ сервера)
    const orderId = "ORD-" + Date.now();

    // TODO: Потом отправим на сервер
    console.log("Заказ:", {
      formData,
      items,
      total,
    });

    // Сохраняем в localStorage для PaymentSuccess и PaymentError
    localStorage.setItem("lastOrderId", orderId);
    localStorage.setItem("lastOrderName", formData.name);
    localStorage.setItem("lastOrderEmail", formData.email);
    localStorage.setItem("lastOrderTotal", total.toString());

    // Очищаем корзину
    clearCart();

    // Переходим на успех (потом будет интеграция с Альфа-Банком)
    navigate("/paymentSuccess");
  };

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <h1>Корзина пуста</h1>
        <p>Нечего оформлять</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Оформление заказа</h1>

      <div className={styles.content}>
        {/* Форма */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <fieldset>
            <legend>Ваши данные</legend>

            <div className={styles.formGroup}>
              <label htmlFor="name">Имя</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Иван Петров"
                className={errors.name ? styles.error : ""}
              />
              {errors.name ? <span className={styles.errorMessage}>{errors.name}</span> : null}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Телефон</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (999) 123-45-67"
                className={errors.phone ? styles.error : ""}
              />
              {errors.phone ? <span className={styles.errorMessage}>{errors.phone}</span> : null}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.com"
                className={errors.email ? styles.error : ""}
              />
              {errors.email ? <span className={styles.errorMessage}>{errors.email}</span> : null}
            </div>
          </fieldset>

          <fieldset>
            <legend>Адрес доставки</legend>

            <div className={styles.formGroup}>
              <label htmlFor="city">Город</label>
              <input
                id="city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Санкт-Петербург"
                className={errors.city ? styles.error : ""}
              />
              {errors.city ? <span className={styles.errorMessage}>{errors.city}</span> : null}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="street">Улица</label>
              <input
                id="street"
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Невский проспект"
                className={errors.street ? styles.error : ""}
              />
              {errors.street ? <span className={styles.errorMessage}>{errors.street}</span> : null}
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label htmlFor="house">Дом</label>
                <input
                  id="house"
                  type="text"
                  name="house"
                  value={formData.house}
                  onChange={handleChange}
                  placeholder="25"
                  className={errors.house ? styles.error : ""}
                />
                {errors.house ? <span className={styles.errorMessage}>{errors.house}</span> : null}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="apartment">Квартира</label>
                <input
                  id="apartment"
                  type="text"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleChange}
                  placeholder="123"
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Доставка</legend>

            <div className={styles.radio}>
              <input
                id="cdek"
                type="radio"
                name="deliveryMethod"
                value="cdek"
                checked={formData.deliveryMethod === "cdek"}
                onChange={handleChange}
              />
              <label htmlFor="cdek">СДЭК (500₽)</label>
            </div>

            <div className={styles.radio}>
              <input
                id="pickup"
                type="radio"
                name="deliveryMethod"
                value="pickup"
                checked={formData.deliveryMethod === "pickup"}
                onChange={handleChange}
              />
              <label htmlFor="pickup">Самовывоз (бесплатно)</label>
            </div>
          </fieldset>

          <button type="submit" className={styles.submitBtn}>
            Оплатить {total} ₽
          </button>
        </form>

        {/* Итоги заказа */}
        <aside className={styles.summary}>
          <h2>Ваш заказ</h2>

          <div className={styles.items}>
            {items.map((item) => (
              <div key={item.id} className={styles.summaryItem}>
                <span>{item.title}</span>
                <br />
                <span>{item.quantity} шт</span>
                <br />
                <span>{item.price * item.quantity}₽</span>
              </div>
            ))}
          </div>

          <div className={styles.divider}></div>

          <div className={styles.row}>
            <span>Сумма товаров:</span>
            <span>{subtotal} ₽</span>
          </div>

          <div className={styles.row}>
            <span>Доставка:</span>
            <span>{deliveryPrice} ₽</span>
          </div>

          <div className={styles.row + " " + styles.total}>
            <span>Итого:</span>
            <span>{total} ₽</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
