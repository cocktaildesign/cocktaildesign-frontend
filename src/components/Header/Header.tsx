import { useCart } from "../../hooks/useCart";

import { Link } from "react-router-dom";
import styles from "./Header.module.css";

function Header() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <>
      <nav className={styles.headerNavigation}>
        <Link to="/">Главная</Link>
        <Link to="/catalog">Каталог</Link>
        <Link to="/cart">Корзина ({cartCount})</Link>
      </nav>
    </>
  );
}

export default Header;
