//frontend/src/app/branding/service-cards/LaserContent/LaserContent.tsx
import Link from "next/link";
import Image from "next/image";
import styles from "./LaserContent.module.css";

export function LaserContent() {
  return (
    <div className={styles.lazerContent}>
      {/* Верхний блок */}
      <header className={styles.lazerContentHeader}>
        <h1 className={styles.lazerContentHeaderTitle}>Лазерная гравировка</h1>

        <div className={styles.lazerContentHeaderText}>
          <p className={styles.lazerContentHeaderParagraph}>
            Мы переносим ваш логотип или изображение на металлические изделия из нашего каталога, превращая стандартный
            инвентарь в элемент бренда.
          </p>

          <p className={styles.lazerContentHeaderParagraph}>
            Лазерная гравировка — это нанесение рисунка, логотипа или надписи на металл с помощью лазера. Мы выполняем
            чёрно-белую, цветную гравировку и фотогравировку с высокой детализацией. Изображение не стирается и
            сохраняет чёткость надолго.
          </p>
        </div>
      </header>

      {/* Галерея */}
      <div className={styles.containerImage}>
        <Image
          src="/images/brending/service-cards/LaserContent/image1.webp"
          alt="Гравировка на джиггере"
          width={250}
          height={250}
          className={styles.image}
        />
        <Image
          src="/images/brending/service-cards/LaserContent/image2.webp"
          alt="Гравировка на джиггере"
          width={250}
          height={250}
          className={styles.image}
        />
        <Image
          src="/images/brending/service-cards/LaserContent/image3.webp"
          alt="Гравировка на джиггере"
          width={250}
          height={250}
          className={styles.image}
        />
        <Image
          src="/images/brending/service-cards/LaserContent/image4.webp"
          alt="Гравировка на джиггере"
          width={250}
          height={250}
          className={styles.image}
        />
      </div>

      {/* Инструкция */}
      <section className={styles.instructions}>
        <h2 className={styles.lazerTitleH2}>Как сделать заказ</h2>

        <ul className={styles.stepsList}>
          <li className={styles.stepsItem}>
            <div className={styles.stepsItemHeader}>
              <span className={styles.stepsItemHeaderStep}>1</span>
              <h3 className={styles.stepsItemHeaderTitle}>Выберите изделие</h3>
            </div>

            <p className={styles.stepsItemDescription}>Выберите изделие в нашем каталоге.</p>
          </li>

          <li className={styles.stepsItem}>
            <div className={styles.stepsItemHeader}>
              <span className={styles.stepsItemHeaderStep}>2</span>
              <h3 className={styles.stepsItemHeaderTitle}>Оформите гравировку</h3>
            </div>

            <p className={styles.stepsItemDescription}>Нажмите кнопку «Сделать гравировку» и оформите корзину.</p>
          </li>

          <li className={styles.stepsItem}>
            <div className={styles.stepsItemHeader}>
              <span className={styles.stepsItemHeaderStep}>3</span>
              <h3 className={styles.stepsItemHeaderTitle}>Согласуйте макет</h3>
            </div>

            <p className={styles.stepsItemDescription}>Менеджер свяжется с вами для уточнения деталей.</p>
          </li>

          <li className={styles.stepsItem}>
            <div className={styles.stepsItemHeader}>
              <span className={styles.stepsItemHeaderStep}>4</span>
              <h3 className={styles.stepsItemHeaderTitle}>Получите готовое изделие</h3>
            </div>

            <p className={styles.stepsItemDescription}>Мы наносим гравировку и отправляем ваш заказ.</p>
          </li>
        </ul>

        <Link href="/catalog" className={styles.lazerButton}>
          Перейти в каталог
        </Link>
      </section>

      {/* Нижний блок */}
      <div className={styles.lazerFooter}>
        <h3 className={styles.lazerTitleH2}>Не нашли подходящее изделие или есть вопросы по гравировке</h3>

        <p className={styles.lazerFooterText}>
          Нажмите «Оставить заявку» — наш менеджер свяжется с вами, поможет подобрать оптимальный вариант и рассчитает
          стоимость.
        </p>

        <button type="button" className={styles.lazerButton}>
          Оставить заявку
        </button>
      </div>
    </div>
  );
}
