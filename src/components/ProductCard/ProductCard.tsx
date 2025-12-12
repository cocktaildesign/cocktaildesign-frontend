import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";
import type { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/product/${product.id}`} className={styles.card}>
      <img src={product.image} alt={product.title} className={styles.image} />
      <h3 className={styles.title}>{product.title}</h3>
      <p className={styles.price}>{product.price}</p>
      <button className={styles.button}>Подробнее</button>
    </Link>
  );
}

export default ProductCard;
