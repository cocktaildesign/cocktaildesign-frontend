import Image from "next/image";
import styles from "./CustomContent.module.css";

export function CustomContent() {
  return (
    <div className={styles.customContent}>
      <section className={styles.content}>
        <div className={styles.contentLeft}>
          <header className={styles.intro}>
            <h1 className={styles.introTitle}>Индивидуальное производство </h1>
            <p className={styles.introDescription}>
              Когда готовые решения не подходят, мы создаем инвентарь по вашим эскизам. Полный контроль над дизайном,
              размерами и функционалом для воплощения любой барной концепции.
            </p>
          </header>

          <div className={styles.features}>
            <h2 className={styles.featuresTitle}>Мы можем сделать</h2>

            <ul className={styles.featuresList}>
              <li className={styles.featuresItem}>
                <h3 className={styles.featuresItemTitle}>Анализируем задачу и создаём технический проект</h3>
                <p className={styles.featuresItemDescription}>
                  Превращаем вашу идею и эскиз в детальные чертежи, оптимизированные под материалы, эргономику и
                  технологию производства.
                </p>
              </li>

              <li className={styles.featuresItem}>
                <h3 className={styles.featuresItemTitle}>Усовершенствовать вашу концепцию</h3>
                <p className={styles.featuresItemDescription}>
                  На этапе проектирования предлагаем инженерные и дизайнерские решения, чтобы повысить функциональность,
                  долговечность и эстетику изделия.
                </p>
              </li>

              <li className={styles.featuresItem}>
                <h3 className={styles.featuresItemTitle}>Обеспечиваем полный цикл «под ключ».</h3>
                <p className={styles.featuresItemDescription}>
                  Берём на себя всю реализацию — от утверждения 3D-модели и изготовления прототипа до финишной обработки
                  и контроля качества готового изделия.
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.gallery}>
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
      </section>

      <section className={styles.instructions}>
        <h2 className={styles.lazerTitleH2}>Как сделать заказ</h2>

        <ul className={styles.stepsList}>
          <li className={styles.stepsItem}>
            <div className={styles.stepsItemHeader}>
              <span className={styles.stepsItemHeaderStep}>1</span>
              <h3 className={styles.stepsItemHeaderTitle}>Обсуждение задачи</h3>
            </div>
            <p className={styles.stepsItemDescription}>
              Вы рассказываете нам идею. Мы задаём уточняющие вопросы, чтобы понять суть.
            </p>
          </li>

          <li className={styles.stepsItem}>
            <div className={styles.stepsItemHeader}>
              <span className={styles.stepsItemHeaderStep}>2</span>
              <h3 className={styles.stepsItemHeaderTitle}>Проектирование макета</h3>
            </div>
            <p className={styles.stepsItemDescription}>
              Наши специалисты разрабатывают детальный макет или технический чертёж.
            </p>
          </li>

          <li className={styles.stepsItem}>
            <div className={styles.stepsItemHeader}>
              <span className={styles.stepsItemHeaderStep}>3</span>
              <h3 className={styles.stepsItemHeaderTitle}>Согласование и запуск</h3>
            </div>
            <p className={styles.stepsItemDescription}>
              Вы утверждаете проект. Только после этого мы запускаем станки.
            </p>
          </li>

          <li className={styles.stepsItem}>
            <div className={styles.stepsItemHeader}>
              <span className={styles.stepsItemHeaderStep}>4</span>
              <h3 className={styles.stepsItemHeaderTitle}>Отправка</h3>
            </div>
            <p className={styles.stepsItemDescription}>
              Мы тщательно упаковываем и оперативно отправляем вам готовый заказ.
            </p>
          </li>
        </ul>

        <button type="button" className={styles.lazerButton}>
          Оставить заявку
        </button>
      </section>

      <section className={styles.priceSection}>
        <h2 className={styles.priceSectionTitle}>Стоимость производства</h2>

        <div className={styles.tableWrapper}>
          <table className={styles.priceTable}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableHeadCell}>Кол-во, шт.</th>
                <th className={styles.tableHeadCell}>Стрейнер</th>
                <th className={styles.tableHeadCell}>Джулеп</th>
                <th className={styles.tableHeadCell}>Файн-стрейнер</th>
                <th className={styles.tableHeadCell}>Ложка</th>
              </tr>
            </thead>

            <tbody className={styles.tableBody}>
              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>4 </td>
                <td className={styles.tableCell}>2 950,00 ₽</td>
                <td className={styles.tableCell}>2 450,00 ₽</td>
                <td className={styles.tableCell}>2 450,00 ₽</td>
                <td className={styles.tableCell}>2 950,00 ₽</td>
              </tr>

              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>10 </td>
                <td className={styles.tableCell}>2 850,00 ₽</td>
                <td className={styles.tableCell}>2 400,00 ₽</td>
                <td className={styles.tableCell}>2 400,00 ₽</td>
                <td className={styles.tableCell}>2 850,00 ₽</td>
              </tr>

              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>20 </td>
                <td className={styles.tableCell}>2 600,00 ₽</td>
                <td className={styles.tableCell}>2 250,00 ₽</td>
                <td className={styles.tableCell}>2 250,00 ₽</td>
                <td className={styles.tableCell}>2 600,00 ₽</td>
              </tr>

              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>50 </td>
                <td className={styles.tableCell}>2 450,00 ₽</td>
                <td className={styles.tableCell}>2 100,00 ₽</td>
                <td className={styles.tableCell}>2 100,00 ₽</td>
                <td className={styles.tableCell}>2 450,00 ₽</td>
              </tr>

              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>100 </td>
                <td className={styles.tableCell}>2 300,00 ₽</td>
                <td className={styles.tableCell}>1 950,00 ₽</td>
                <td className={styles.tableCell}>1 950,00 ₽</td>
                <td className={styles.tableCell}>2 300,00 ₽</td>
              </tr>

              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>150 </td>
                <td className={styles.tableCell}>2 150,00 ₽</td>
                <td className={styles.tableCell}>1 850,00 ₽</td>
                <td className={styles.tableCell}>1 850,00 ₽</td>
                <td className={styles.tableCell}>2 150,00 ₽</td>
              </tr>

              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>200 </td>
                <td className={styles.tableCell}>2 000,00 ₽</td>
                <td className={styles.tableCell}>1 700,00 ₽</td>
                <td className={styles.tableCell}>1 700,00 ₽</td>
                <td className={styles.tableCell}>2 000,00 ₽</td>
              </tr>

              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>250 </td>
                <td className={styles.tableCell}>1 850,00 ₽</td>
                <td className={styles.tableCell}>1 600,00 ₽</td>
                <td className={styles.tableCell}>1 600,00 ₽</td>
                <td className={styles.tableCell}>1 850,00 ₽</td>
              </tr>

              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>300 </td>
                <td className={styles.tableCell}>1 650,00 ₽</td>
                <td className={styles.tableCell}>1 450,00 ₽</td>
                <td className={styles.tableCell}>1 450,00 ₽</td>
                <td className={styles.tableCell}>1 650,00 ₽</td>
              </tr>

              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>350 </td>
                <td className={styles.tableCell}>1 600,00 ₽</td>
                <td className={styles.tableCell}>1 350,00 ₽</td>
                <td className={styles.tableCell}>1 350,00 ₽</td>
                <td className={styles.tableCell}>1 600,00 ₽</td>
              </tr>

              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>400 </td>
                <td className={styles.tableCell}>1 550,00 ₽</td>
                <td className={styles.tableCell}>1 300,00 ₽</td>
                <td className={styles.tableCell}>1 300,00 ₽</td>
                <td className={styles.tableCell}>1 550,00 ₽</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className={styles.priceNote}>
          * Цены указаны ориентировочно и зависят от сложности изделия и объёма заказа. При одновременном заказе
          индивидуального дизайна и оборудования из каталога — дополнительная скидка.
        </p>
      </section>
    </div>
  );
}
