import { useParams, Link } from "react-router-dom";
import type { Product } from "../../types/product";
import mockProducts from "../../../../data/mock-products.json";
import styles from "./ProductDetail.module.css";
import { useCart } from "../../hooks/useCart";

function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();

  const product = mockProducts.find((currentProduct) => currentProduct.id === Number(id)) as Product | undefined;

  if (!product) {
    return (
      <div className={styles.container}>
        <h1>Товар не найден</h1>
        <Link to="/catalog">Вернуться в каталог</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    alert(`${product.title} добавлен в корзину!`);
  };

  return (
    <div className={styles.containerProductDetail}>
      <img src={product.image} alt={product.title} className={styles.image} />

      <div className={styles.productInfo}>
        <h1 className={styles.title}>{product.title}</h1>
        <p className={styles.category}>{product.category}</p>
        <p className={styles.price}>{product.price}</p>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.buttons}>
          <button onClick={handleAddToCart} className={styles.button}>
            В корзину
          </button>
          <Link to="/cart" className={styles.cartLink}>
            Перейти в корзину
          </Link>

          <Link to="/catalog" className={styles.backLink}>
            ← Вернуться в каталог
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
