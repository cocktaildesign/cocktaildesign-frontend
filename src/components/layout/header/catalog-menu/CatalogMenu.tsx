import CatalogIcon from "@/components/icons/CatalogIcon";
import styles from "./CatalogMenu.module.css";
import { useId, useState } from "react";

type CatalogItem = {
  id: string;
  title: string;
  href?: string;
  children?: CatalogItem[];
};

const catalogItems: CatalogItem[] = [
  // =============================================
  // 1. БАРНЫЙ ИНВЕНТАРЬ — большая группа с подкатегориями
  // =============================================
  {
    id: "bar-inventory",
    title: "Барный инвентарь",
    href: "/catalog/bar-inventory",
    children: [
      // --- Шейкеры (2-й уровень) → 3 подкатегории (3-й уровень) ---
      {
        id: "shakers",
        title: "Шейкеры",
        href: "/catalog/bar-inventory/shakers",
        children: [
          { id: "shaker-cobbler", title: "Кобблер", href: "/catalog/bar-inventory/shakers/cobbler" },
          { id: "shaker-boston", title: "Бостон", href: "/catalog/bar-inventory/shakers/boston" },
          { id: "shaker-parisian", title: "Паризиан", href: "/catalog/bar-inventory/shakers/parisian" },
        ],
      },
      // --- Стрейнеры (2-й уровень) → 4 подкатегории ---
      {
        id: "strainers",
        title: "Стрейнеры",
        href: "/catalog/bar-inventory/strainers",
        children: [
          { id: "strainer-hawthorne", title: "Хоторн стрейнер", href: "/catalog/bar-inventory/strainers/hawthorne" },
          { id: "strainer-art", title: "Арт стрейнер", href: "/catalog/bar-inventory/strainers/art" },
          { id: "strainer-julep", title: "Джулеп стрейнер", href: "/catalog/bar-inventory/strainers/julep" },
          { id: "strainer-fine", title: "Файн стрейнер", href: "/catalog/bar-inventory/strainers/fine" },
        ],
      },
      // --- Джиггеры и мерники (2-й уровень) → 5 подкатегорий ---
      {
        id: "jiggers-measuring",
        title: "Джиггеры и мерники",
        href: "/catalog/bar-inventory/jiggers-measuring",
        children: [
          {
            id: "jiggers-japanese",
            title: "Японский стиль",
            href: "/catalog/bar-inventory/jiggers-measuring/japanese",
          },
          {
            id: "jiggers-american",
            title: "Американский стиль",
            href: "/catalog/bar-inventory/jiggers-measuring/american",
          },
          { id: "jiggers-single", title: "Односторонние", href: "/catalog/bar-inventory/jiggers-measuring/single" },
          {
            id: "measuring-spoons",
            title: "Мерные ложки",
            href: "/catalog/bar-inventory/jiggers-measuring/measuring-spoons",
          },
          { id: "measuring-cups", title: "Мерники", href: "/catalog/bar-inventory/jiggers-measuring/measuring-cups" },
        ],
      },
      // --- Листья 2-го уровня (без 3-го уровня) ---
      { id: "bar-spoons", title: "Барные ложки", href: "/catalog/bar-inventory/bar-spoons" },
      { id: "mixing-glasses", title: "Смесительные стаканы", href: "/catalog/bar-inventory/mixing-glasses" },
      { id: "muddlers-squeezers", title: "Мадлеры и сквизеры", href: "/catalog/bar-inventory/muddlers-squeezers" },
      { id: "tongs-tweezers", title: "Щипцы и пинцеты", href: "/catalog/bar-inventory/tongs-tweezers" },
      { id: "bar-misc", title: "Полезные мелочи для бара", href: "/catalog/bar-inventory/bar-misc" },
      {
        id: "knives-peelers-graters",
        title: "Ножи, пиллеры, терки",
        href: "/catalog/bar-inventory/knives-peelers-graters",
      },
      {
        id: "scales-measuring-devices",
        title: "Весы и измерительные приборы",
        href: "/catalog/bar-inventory/scales-measuring-devices",
      },
      {
        id: "cocktail-technologies",
        title: "Технологии для коктейлей",
        href: "/catalog/bar-inventory/cocktail-technologies",
      },
    ],
  },

  // =============================================
  // 2. ВСЕ ДЛЯ ПОДАЧИ
  // =============================================
  {
    id: "serving",
    title: "Все для подачи",
    href: "/catalog/serving",
    children: [
      { id: "serving-berries-powders", title: "Ягоды и пудры", href: "/catalog/serving/berries-powders" },
      { id: "serving-straws", title: "Трубочки", href: "/catalog/serving/straws" },
      { id: "serving-garnish", title: "Для гарниша", href: "/catalog/serving/garnish" },
      { id: "serving-coasters-trays", title: "Костеры, подставки, подносы", href: "/catalog/serving/coasters-trays" },
      { id: "serving-skewers", title: "Шпажки", href: "/catalog/serving/skewers" },
      { id: "serving-tools-devices", title: "Инвентарь и девайсы", href: "/catalog/serving/tools-devices" },
      { id: "serving-molds", title: "Формы", href: "/catalog/serving/molds" },
    ],
  },

  // =============================================
  // 3. ВСЕ ДЛЯ КОНДИТЕРА
  // =============================================
  {
    id: "confectionery",
    title: "Все для кондитера",
    href: "/catalog/confectionery",
    children: [
      { id: "confectionery-mats", title: "Коврики", href: "/catalog/confectionery/mats" },
      { id: "confectionery-spatulas", title: "Лопатки и шпатели", href: "/catalog/confectionery/spatulas" },
      { id: "confectionery-molds", title: "Кондитерские формы", href: "/catalog/confectionery/molds" },
      { id: "confectionery-misc", title: "Кондитерские мелочи", href: "/catalog/confectionery/misc" },
    ],
  },

  // =============================================
  // 4–6. Категории 1-го уровня БЕЗ вложенности
  // =============================================
  { id: "barista", title: "Все для бариста", href: "/catalog/barista" },
  { id: "wine", title: "Все для вина", href: "/catalog/wine" },
  { id: "accessories", title: "Аксессуары", href: "/catalog/accessories" },

  // =============================================
  // 7. МОЛЕКУЛЯРНАЯ КУХНЯ
  // =============================================
  {
    id: "molecular",
    title: "Молекулярная кухня",
    href: "/catalog/molecular",
    children: [
      { id: "molecular-acids-textures", title: "Кислоты и текстуры", href: "/catalog/molecular/acids-textures" },
      {
        id: "molecular-cocktail-tech",
        title: "Технологии для коктейлей",
        href: "/catalog/molecular/cocktail-technologies",
      },
    ],
  },

  // =============================================
  // 8. ОРГАНИЗАЦИЯ И ХРАНЕНИЕ
  // =============================================
  {
    id: "storage",
    title: "Организация и хранение",
    href: "/catalog/storage",
    children: [
      { id: "storage-garnish-jars", title: "Баночки для гарнишей", href: "/catalog/storage/garnish-jars" },
      { id: "storage-dispensers", title: "Диспенсеры", href: "/catalog/storage/dispensers" },
      { id: "storage-organizers", title: "Органайзеры", href: "/catalog/storage/organizers" },
    ],
  },

  // =============================================
  // 9. БОКАЛЫ И СТЕКЛО
  // =============================================
  {
    id: "glassware",
    title: "Бокалы и стекло",
    href: "/catalog/glassware",
    children: [
      { id: "glassware-glasses", title: "Бокалы", href: "/catalog/glassware/glasses" },
      { id: "glassware-bitter-bottles", title: "Бутылочки для биттера", href: "/catalog/glassware/bitter-bottles" },
      { id: "glassware-garnish-jars", title: "Баночки для гарнишей", href: "/catalog/glassware/garnish-jars" },
    ],
  },

  // =============================================
  // 10. ИНСТРУМЕНТЫ ДЛЯ ЛЬДА
  // =============================================
  {
    id: "ice-tools",
    title: "Инструменты для льда",
    href: "/catalog/ice-tools",
    children: [
      { id: "ice-stamps", title: "Клише и оттиски", href: "/catalog/ice-tools/stamps" },
      { id: "ice-scoops", title: "Совки", href: "/catalog/ice-tools/scoops" },
      { id: "ice-tongs", title: "Щипцы", href: "/catalog/ice-tools/tongs" },
      { id: "ice-molds", title: "Формы для льда", href: "/catalog/ice-tools/molds" },
      { id: "ice-picks-knives", title: "Пики и ножи для льда", href: "/catalog/ice-tools/picks-knives" },
      { id: "ice-generators", title: "Ледогенераторы", href: "/catalog/ice-tools/generators" },
    ],
  },

  // =============================================
  // 11. ОБОРУДОВАНИЕ
  // =============================================
  {
    id: "equipment",
    title: "Оборудование",
    href: "/catalog/equipment",
    children: [
      { id: "equipment-scales", title: "Весы и измерительные приборы", href: "/catalog/equipment/scales-measuring" },
      {
        id: "equipment-cocktail-tech",
        title: "Технологии для коктейлей",
        href: "/catalog/equipment/cocktail-technologies",
      },
      { id: "equipment-hoshizaki", title: "Льдогенераторы Hoshizaki", href: "/catalog/equipment/hoshizaki" },
      { id: "equipment-auxiliary", title: "Вспомогательное оборудование", href: "/catalog/equipment/auxiliary" },
      { id: "equipment-bar-modules", title: "Барные модули", href: "/catalog/equipment/bar-modules" },
    ],
  },

  // =============================================
  // 12–16. Категории 1-го уровня БЕЗ вложенности
  // =============================================
  { id: "sets", title: "Наборы и готовые решения", href: "/catalog/sets" },
  { id: "limited", title: "Лимитированная коллекция", href: "/catalog/limited" },
  { id: "certificates-gifts", title: "Сертификаты и подарки", href: "/catalog/certificates-gifts" },
  { id: "sale", title: "Акции", href: "/catalog/sale" },
  { id: "last-chance", title: "Последний шанс купить", href: "/catalog/last-chance" },
];

// --- Утилита: проверяет, есть ли у элемента дочерние категории ---
function itemHasChildren(item: CatalogItem) {
  return (item.children?.length ?? 0) > 0;
}

export default function CatalogMenu() {
  // --- Состояние меню ---
  const [isOpen, setIsOpen] = useState(false);

  // id активной категории 1-го уровня (по умолчанию — первая в массиве)
  const [activeId, setActiveId] = useState(catalogItems[0]?.id ?? "");

  // уникальный id для связи кнопки и выпадающей панели (a11y: aria-controls)
  const menuId = useId();

  // --- Производные данные ---
  // Находим объект активной категории 1-го уровня
  const activeCategory = catalogItems.find((item) => item.id === activeId);

  // Дети активной категории — это элементы 2-го уровня меню
  const level2Items = activeCategory?.children ?? [];

  // --- Обработчики ---
  function openMenu() {
    setIsOpen(true);
  }

  function closeMenu() {
    setIsOpen(false);
  }

  // Закрываем меню, только если фокус ушёл ЗА ПРЕДЕЛЫ всего компонента.
  // Если фокус перешёл на другой элемент внутри меню — не закрываем.
  // e.relatedTarget — элемент, ПОЛУЧИВШИЙ фокус после blur
  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    const nextFocused = e.relatedTarget;

    // Если новый фокус всё ещё внутри нашего контейнера — ничего не делаем
    if (nextFocused instanceof Node && e.currentTarget.contains(nextFocused)) {
      return;
    }

    closeMenu();
  }

  return (
    <div
      className={styles.catalogMenu}
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
      onFocus={openMenu}
      onBlur={handleBlur}>
      {/* Кнопка-триггер каталога */}
      <button
        type="button"
        className={styles.buttonCta}
        aria-expanded={isOpen} // говорит скринридеру: панель открыта/закрыта
        aria-controls={menuId} // связывает кнопку с панелью по id
      >
        <CatalogIcon className={styles.catalogIcon} />
        Каталог
      </button>

      {/* Выпадающая панель — рендерим только когда меню открыто */}
      {isOpen && (
        <div id={menuId} className={styles.panel}>
          <div className={styles.columns}>
            {/* ===== ЛЕВАЯ КОЛОНКА: категории 1-го уровня ===== */}
            <ul className={styles.topList}>
              {catalogItems.map((item) => {
                const isActive = item.id === activeId;

                return (
                  <li key={item.id} className={styles.topListItem}>
                    <button
                      type="button"
                      className={styles.topItemButton}
                      onMouseEnter={() => setActiveId(item.id)} // при наведении — показываем детей
                      onFocus={() => setActiveId(item.id)} // при фокусе (Tab) — то же самое
                      aria-current={isActive ? "true" : undefined}>
                      <span className={styles.topItemTitle}>{item.title}</span>

                      {/* Шеврон ›  — показываем только если есть подкатегории */}
                      {itemHasChildren(item) ? (
                        <span className={styles.chevron} aria-hidden="true">
                          ›
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* ===== ПРАВАЯ ЗОНА: 2-й и 3-й уровни ===== */}
            {/* Показываем только если у активной категории есть дети */}
            {level2Items.length > 0 ? (
              <div className={styles.subPanel}>
                <div className={styles.subGrid}>
                  {level2Items.map((section) => {
                    // Дети 2-го уровня — это элементы 3-го уровня
                    const level3Items = section.children ?? [];

                    return (
                      <div key={section.id} className={styles.subSection}>
                        {/* Заголовок подкатегории 2-го уровня */}
                        <div className={styles.subSectionTitle}>{section.title}</div>

                        {/* Список 3-го уровня — только если есть */}
                        {level3Items.length > 0 ? (
                          <ul className={styles.thirdList}>
                            {level3Items.map((leaf) => (
                              <li key={leaf.id} className={styles.thirdListItem}>
                                {leaf.title}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
