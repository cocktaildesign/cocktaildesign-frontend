"use client";

import styles from "./FavoriteButton.module.css";
import HeartIcon from "@/components/icons/HeartIcon";
import { useFavorite } from "@/lib/favorites/useFavorite";

type FavoriteButtonProps = {
  productId: string;
  className?: string;
};

export default function FavoriteButton({ productId, className }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorite(productId);

  // Максимально простой className без массивов
  const activeClass = isFavorite ? styles.favoriteButtonActive : "";
  const extraClass = className ? className : "";
  const buttonClass = `${styles.favoriteButton} ${activeClass} ${extraClass}`.trim();

  return (
    <button
      type="button"
      className={buttonClass}
      onClick={(event) => {
        // Если кнопка окажется внутри <Link>, не даём ссылке сработать
        event.preventDefault();
        event.stopPropagation();

        toggleFavorite();
      }}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}>
      <HeartIcon className={styles.favoriteIcon} />
    </button>
  );
}
