import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { Link } from "react-router-dom";

import styles from "./Catalog.module.css";
// Категории и товары
import mockProduct from "../../../../data/mock-products.json";
import categories from "../../../../data/categories.json";
//интерфейсы
import type { Category, CategoriesResponse, Product } from "../../types/types";

function Catalog() {
  //получаем параметры из URL
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedCategoryId = searchParams.get("category") ? parseInt(searchParams.get("category")!, 10) : null;
  const currentParentId = searchParams.get("parent") ? parseInt(searchParams.get("parent")!, 10) : null;

  //Типизируем данные из JSON
  const categoryData = (categories as unknown as CategoriesResponse).data;
  const productData = mockProduct as Product[];

  const flattenedCategories = useMemo(() => {
    const result: Map<number, Category> = new Map();

    //функция которая идет по всем категориям рекурсивно
    const flatten = (cats: Category[]): void => {
      cats.forEach((cat) => {
        result.set(cat.id, cat);
        if (cat.children) {
          flatten(cat.children);
        }
      });
    };
    // Начинаем с корневых категорий
    flatten(categoryData);
    return result;
  }, [categoryData]);

  //ищем категорию по id
  const findCategoryById = useCallback(
    (id: number): Category | null => {
      return flattenedCategories.get(id) || null;
    },
    [flattenedCategories]
  );

  //получаем видимые пункты меню
  const visibleMenuItems = useMemo(() => {
    if (currentParentId === null) {
      return categoryData;
    }
    // Если currentParentId не null, значит мы внутри категории
    // Находим эту категорию и показываем её ДЕТЕЙ
    const parent = findCategoryById(currentParentId);

    return parent?.children || [];
  }, [currentParentId, findCategoryById, categoryData]);

  // получить все ID категории и ее потомков
  const getAllCategoryIds = useCallback(
    (categoryId: number): number[] => {
      const visited = new Set<number>();
      const result: number[] = [];

      // функция которая рекурсивно идет по всем потомкам
      const traverse = (id: number): void => {
        if (visited.has(id)) return;

        visited.add(id);

        result.push(id);

        const cat = flattenedCategories.get(id);

        if (cat?.children) {
          cat.children.forEach((child) => {
            traverse(child.id);
          });
        }
      };
      // Начинаем обход с переданной категории
      traverse(categoryId);
      return result;
    },
    [flattenedCategories]
  );

  //фильтруем товары по выбранным категориям
  const filteredProducts = useMemo(() => {
    // если ничего не выбранно то показываем все товары
    if (selectedCategoryId === null) {
      return productData;
    }

    const categoryIds = getAllCategoryIds(selectedCategoryId);
    const categoryIdSet = new Set(categoryIds);

    return productData.filter((product) => {
      return categoryIdSet.has(product.category_id);
    });
  }, [selectedCategoryId, getAllCategoryIds, productData]);

  //обработчик клика по категории
  const handleCategoryClick = useCallback(
    (category: Category): void => {
      //проверяем есть ли у этой категории дети
      const hasChildren = category.children && category.children.length > 0;

      if (hasChildren) {
        // ЕСЛИ ЕСТЬ ДЕТИ:
        // Меняем URL на ?category=14&parent=14
        // Это говорит: "показывать товары из 14 И её потомков"
        // И "в меню показывать детей 14"
        navigate(`/catalog?category=${category.id}&parent=${category.id}`);
      } else {
        // ЕСЛИ НЕТ ДЕТЕЙ:
        // Меняем URL на ?category=14&parent=ТЕКУЩИЙ_PARENT
        // Это говорит: "показывать товары из 14"
        // Но "в меню остаётся то же самое"
        navigate(`/catalog?category=${category.id}&parent=${currentParentId || ""}`);
      }
    },
    [navigate, currentParentId]
  );

  // обработчик кнопки назад
  const handleGoBack = useCallback((): void => {
    // Если мы в главном меню (currentParentId === null)
    // То кнопка назад не работает (её и не должно быть)
    if (currentParentId === null) return;
    // Находим текущую категорию в которой мы находимся
    const current = findCategoryById(currentParentId);

    if (current?.parent_id) {
      // Если у текущей категории есть родитель
      // Идём к родителю
      navigate(`/catalog?category=${current.parent_id}&parent=${current.parent_id}`);
    } else {
      // Если родителя нет (мы на уровне 1)
      // Идём в главное меню
      navigate(`/catalog`);
    }
  }, [currentParentId, findCategoryById, navigate]);

  //renderPrice - функция для рендеринга цены товара
  const renderPrice = (product: Product) => {
    // Проверяем: есть ли скидка?
    // discount_price должна быть не null и не undefined
    const hasDiscount = product.discount_price !== null && product.discount_price !== undefined;

    if (hasDiscount) {
      // ЕСЛИ ЕСТЬ СКИДКА
      // Показываем две цены: оригинальную (зачёркнутую) и со скидкой (красную)
      return (
        <>
          <span className={styles.originalPrice}>{product.price} ₽</span>
          <span className={styles.discountPrice}>{product.discount_price} ₽</span>
        </>
      );
    } else {
      // ЕСЛИ НЕТ СКИДКИ
      // Показываем только одну цену (оригинальную)
      return <span>{product.price} ₽</span>;
    }
  };

  // Берём функцию addItem из Zustand
  const { addItem } = useCart();

  // Обработчик кнопки "Добавить в корзину"
  const handleAddToCart = (product: Product) => {
    // Преобразуем Product в CartItem
    const cartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1, // Добавляем 1 товар
    };

    // Добавляем в корзину
    addItem(cartItem);

    // Опционально: показать уведомление
    alert(`${product.title} добавлен в корзину!`);
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h3 className={styles.titleCategory}>Категории</h3>

        {/* Кнопка назад - показываем только если не в главном меню */}
        {currentParentId !== null && (
          <button className={styles.backButton} onClick={handleGoBack}>
            ← {findCategoryById(currentParentId)?.name}
          </button>
        )}

        {/* Меню с категориями */}
        <div className={styles.menu}>
          {visibleMenuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;

            return (
              <button
                key={item.id}
                className={`${styles.menuItem} ${selectedCategoryId === item.id ? styles.active : ""}`}
                onClick={() => handleCategoryClick(item)}>
                <span>
                  <span>{item.name}</span>
                  {hasChildren && <span>→</span>}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <main className={styles.main}>
        <h1>Каталог</h1>

        {/* Если товары есть - показываем их */}
        {filteredProducts.length > 0 && (
          <div className={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <Link to={`/product/${product.id}`} className={styles.productCardLink} key={product.id}>
                <div key={product.id} className={styles.productCard}>
                  <img src={product.image} alt={product.title} />
                  <h3>{product.title}</h3>

                  {/* ИСПОЛЬЗУЕМ ФУНКЦИЮ renderPrice */}
                  <div className={styles.price}>{renderPrice(product)}</div>

                  <button
                    className={styles.addToCart}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}>
                    Добавить в корзину
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Если товаров нет - показываем сообщение */}
        {filteredProducts.length === 0 && <div className={styles.empty}>Товаров не найдено</div>}
      </main>
    </div>
  );
}

export default Catalog;
