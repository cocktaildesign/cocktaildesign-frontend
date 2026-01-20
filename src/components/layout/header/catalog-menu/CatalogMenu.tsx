import CatalogIcon from "@/components/icons/CatalogIcon";
import styles from "./CatalogMenu.module.css";
import { useId, useMemo, useState } from "react";

type CatalogItem = {
  id: string;
  title: string;
  href?: string;
  children?: CatalogItem[];
};

const catalogItems: CatalogItem[] = [
  { id: "glasses", title: "Бокалы", href: "/catalog/glasses" },
  { id: "bar-spoons", title: "Барные ложки", href: "/catalog/bar-spoons" },
  { id: "graduated-cylinders", title: "Мензурки", href: "/catalog/graduated-cylinders" },
  { id: "measuring-spoons", title: "Мерники и мерные ложки", href: "/catalog/measuring-spoons" },
  { id: "mixing-glasses", title: "Смесительные стаканы", href: "/catalog/mixing-glasses" },
  { id: "muddlers-squeezers", title: "Мадлеры и сквизеры", href: "/catalog/muddlers-squeezers" },
  { id: "knives-peelers-graters", title: "Ножи/Пиллеры/Терки", href: "/catalog/knives-peelers-graters" },
  { id: "tweezers", title: "Пинцеты", href: "/catalog/tweezers" },
  { id: "droppers-atomizers", title: "Дропперы / Атомайзеры", href: "/catalog/droppers-atomizers" },
  { id: "puree-dispensers", title: "Диспенсеры для пюре", href: "/catalog/puree-dispensers" },
  { id: "stamps", title: "Клише и оттиски", href: "/catalog/stamps" },
  { id: "sets", title: "Наборы и готовые решения", href: "/catalog/sets" },
  { id: "gifts", title: "Подарки", href: "/catalog/gifts" },
  { id: "misc", title: "Полезные мелочи", href: "/catalog/misc" },

  {
    id: "serving",
    title: "Все для подачи",
    children: [
      { id: "serving-garnish", title: "Гарниш и украшения", href: "/catalog/serving/garnish" },
      { id: "serving-tools", title: "Инвентарь для подачи", href: "/catalog/serving/tools" },
      { id: "serving-trays", title: "Костеры/Подставки/Подносы", href: "/catalog/serving/coasters-trays" },
      { id: "serving-straws", title: "Трубочки и шпажки", href: "/catalog/serving/straws" },
      { id: "serving-molds", title: "Формы", href: "/catalog/serving/molds" },
    ],
  },

  {
    id: "jiggers",
    title: "Джиггеры",
    children: [
      { id: "jiggers-us", title: "Американский стиль", href: "/catalog/jiggers/us-style" },
      { id: "jiggers-jp", title: "Японский стиль", href: "/catalog/jiggers/japanese" },
      { id: "jiggers-single", title: "Односторонние", href: "/catalog/jiggers/single" },
    ],
  },

  {
    id: "ice-tools",
    title: "Инструменты для льда",
    children: [
      { id: "ice-tools-cuts", title: "Пики и ножи", href: "/catalog/ice-tools/picks-knives" },
      { id: "ice-tools-scoops", title: "Совки", href: "/catalog/ice-tools/scoops" },
      { id: "ice-tools-molds", title: "Формы для льда", href: "/catalog/ice-tools/molds" },
    ],
  },

  {
    id: "molecular",
    title: "Молекулярная кухня",
    children: [
      { id: "molecular-acids", title: "Кислоты и текстуры", href: "/catalog/molecular/acids-textures" },
      { id: "molecular-equipment", title: "Оборудование", href: "/catalog/molecular/equipment" },
    ],
  },

  {
    id: "strainers",
    title: "Стрейнеры",
    children: [
      { id: "strainer-julep", title: "Джулеп", href: "/catalog/strainers/julep" },
      { id: "strainer-fine", title: "Файн", href: "/catalog/strainers/fine" },
      { id: "strainer-hawthorne", title: "Хоторн", href: "/catalog/strainers/hawthorne" },
    ],
  },

  {
    id: "shakers",
    title: "Шейкеры",
    children: [
      {
        id: "shaker-boston",
        title: "Бостон",
        href: "/catalog/shakers/boston",
        children: [
          { id: "boston-sale", title: "Sample Sale", href: "/catalog/shakers/boston/sample-sale" },
          { id: "boston-limited", title: "Лимитированные", href: "/catalog/shakers/boston/limited" },
        ],
      },
      { id: "shaker-cobbler", title: "Кобблер", href: "/catalog/shakers/cobbler" },
      { id: "shaker-parisian", title: "Паризиан", href: "/catalog/shakers/parisian" },
    ],
  },

  { id: "bitter-bottles", title: "Бутылочки для биттера", href: "/catalog/bitter-bottles" },
  { id: "wine-barista", title: "Для вина и бариста", href: "/catalog/wine-barista" },
];

function itemHasChildren(item: CatalogItem) {
  return (item.children?.length ?? 0) > 0;
}

export default function CatalogMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTopId, setActiveTopId] = useState(catalogItems[0]?.id ?? "");
  const menuId = useId();

  const topItemsForRender = useMemo(() => {
    return [...catalogItems].sort((a, b) => {
      const aHas = itemHasChildren(a);
      const bHas = itemHasChildren(b);

      if (aHas === bHas) return 0;
      return aHas ? -1 : 1; // “ветвистые” — вверх
    });
  }, []); // catalogItems — константа модуля

  const activeTopItem = topItemsForRender.find((item) => item.id === activeTopId);
  const secondLevelItems = activeTopItem?.children ?? [];
  const hasSecondLevel = secondLevelItems.length > 0;

  function openMenu() {
    setIsOpen(true);
  }

  function closeMenu() {
    setIsOpen(false);
  }

  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    const nextFocused = e.relatedTarget;

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
      <button type="button" className={styles.buttonCta} aria-expanded={isOpen} aria-controls={menuId}>
        <CatalogIcon className={styles.catalogIcon} />
        Каталог
      </button>

      {isOpen && (
        <div id={menuId} className={styles.panel}>
          <div className={styles.columns}>
            {/* Левая колонка */}
            <ul className={styles.topList}>
              {topItemsForRender.map((item) => {
                const isActive = item.id === activeTopId;

                return (
                  <li key={item.id} className={styles.topListItem}>
                    <button
                      type="button"
                      className={styles.topItemButton}
                      onMouseEnter={() => setActiveTopId(item.id)}
                      onFocus={() => setActiveTopId(item.id)}
                      aria-current={isActive ? "true" : undefined}>
                      <span className={styles.topItemTitle}>{item.title}</span>

                      {itemHasChildren(item) ? (
                        <span className={styles.chevron} aria-hidden>
                          ›
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Правая зона — только если у активного top есть дети */}
            {hasSecondLevel ? (
              <div className={styles.subPanel}>
                <div className={styles.subGrid}>
                  {secondLevelItems.map((section) => {
                    const third = section.children ?? [];
                    const hasThird = third.length > 0;

                    return (
                      <div key={section.id} className={styles.subSection}>
                        <div className={styles.subSectionTitle}>{section.title}</div>

                        {hasThird ? (
                          <ul className={styles.thirdList}>
                            {third.map((leaf) => (
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
