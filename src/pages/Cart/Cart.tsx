import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import styles from "./Cart.module.css";

function Cart() {
  const { items, removeItem, updateQuantity, clearCart } = useCart();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <h1>Корзина пуста</h1>
        <p>Добавте товары из каталога</p>
        <Link to="/catalog" className={styles.link}>
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Корзина</h1>

      <div className={styles.items}>
        {items.map((curentItem) => {
          return (
            <div key={curentItem.id} className={styles.cartItem}>
              <img src={curentItem.image} alt={curentItem.title} className={styles.images} />

              <div className={styles.info}>
                <h3 className={styles.title}>{curentItem.title}</h3>
                <p className={styles.price}>{curentItem.price}₽</p>
              </div>

              <div className={styles.quantity}>
                <button
                  onClick={() => {
                    if (curentItem.quantity > 1) {
                      updateQuantity(curentItem.id, curentItem.quantity - 1);
                    } else {
                      const confirmed = window.confirm(
                        "Удалить товар?\nВы точно хотите удалить выбранный товар? Отменить данное действие будет невозможно."
                      );

                      if (confirmed) {
                        removeItem(curentItem.id);
                      }
                    }
                  }}>
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={curentItem.quantity}
                  onChange={(e) => updateQuantity(curentItem.id, Math.max(1, Number(e.target.value)))}
                  className={styles.quantityInput}
                />
                <button onClick={() => updateQuantity(curentItem.id, Math.max(1, curentItem.quantity + 1))}>+</button>
              </div>

              <div className={styles.itemTotal}>Итог: {curentItem.price * curentItem.quantity}₽</div>

              <button onClick={() => removeItem(curentItem.id)} className={styles.removeBtn}>
                Удалить
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.summary}>
        <h2>Итого: {total}₽</h2>
        <div className={styles.summaryButtons}>
          <Link to="/checkout" className={styles.checkoutBtn}>
            Перейти к оформлению
          </Link>
          <button onClick={() => clearCart()}>Очистить корзину</button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
