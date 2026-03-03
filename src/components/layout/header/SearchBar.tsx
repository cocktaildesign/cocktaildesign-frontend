"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./SearchBar.module.css";
import ResetIcon from "@/components/icons/ResetIcon";
import type { CatalogCategoryPreview } from "@/lib/api/catalog/types";

type Props = {
  placeholder?: string;
  categories: CatalogCategoryPreview[];
};

type Product = {
  id: string;
  title: string;
  priceRub: number;
  categoryTitle?: string;
  imageUrl?: string;
  slug?: string;
};

type ApiProductItem = {
  id: number;
  attributes: {
    name?: string | null;
    price?: number | null;
    categoryName?: string | null;
    slug?: string | null;
    image?: Array<{ url: string }> | null;
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.cocktaildesign.ru/api";
const POPULAR_QUERIES = ["Шейкер", "Джиггер", "Барная ложка", "Стрейнер", "Сироп"];

// функцию запроса случайных товаров
async function fetchRandomProducts(count = 2): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/catalog/random-products?count=${count}`);
  if (!res.ok) return [];

  const data = (await res.json()) as { items?: ApiProductItem[] };

  return (data.items ?? []).map((item) => ({
    id: String(item.id),
    title: item.attributes.name ?? "",
    priceRub: item.attributes.price ?? 0,
    categoryTitle: item.attributes.categoryName ?? undefined,
    slug: item.attributes.slug ?? undefined,
    imageUrl: item.attributes.image?.[0]?.url ?? undefined,
  }));
}

async function searchProducts(query: string): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/catalog/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { items?: ApiProductItem[] };
  return (data.items ?? []).map((item) => ({
    id: String(item.id),
    title: item.attributes.name ?? "",
    priceRub: item.attributes.price ?? 0,
    categoryTitle: item.attributes.categoryName ?? undefined,
    slug: item.attributes.slug ?? undefined,
    imageUrl: item.attributes.image?.[0]?.url ?? undefined,
  }));
}

function buildChips(query: string, products: Product[]): string[] {
  const trimmed = query.trim();
  if (trimmed.length === 0 || products.length === 0) return [];

  const queryTokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  const endsWithSpace = /\s$/.test(query);
  const baseTokens = endsWithSpace ? queryTokens : queryTokens.slice(0, -1);
  const prefix = endsWithSpace ? "" : (queryTokens[queryTokens.length - 1] ?? "");

  const counts = new Map<string, number>();

  for (const product of products) {
    const titleTokens = product.title.toLowerCase().split(/\s+/).filter(Boolean);
    const baseMatches = baseTokens.length <= titleTokens.length && baseTokens.every((t, i) => titleTokens[i] === t);
    if (!baseMatches) continue;

    const candidate = titleTokens[baseTokens.length];
    if (!candidate) continue;
    if (prefix.length > 0 && !candidate.startsWith(prefix)) continue;
    if (prefix.length > 0 && candidate === prefix) continue;

    counts.set(candidate, (counts.get(candidate) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([token]) => token);
}

export default function SearchBar({ placeholder = "Поиск в CocktailDesign", categories }: Props) {
  const router = useRouter();
  const panelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const LIMIT = 8;

  const visibleCategories = showAllCategories ? categories : categories.slice(0, LIMIT);

  const trimmed = query.trim();

  // Загружаем случайные товары когда панель открылась и запрос пустой
  useEffect(() => {
    if (!isOpen || trimmed.length > 0) return;

    async function loadRandom() {
      const result = await fetchRandomProducts(2);
      setRandomProducts(result);
    }

    loadRandom();
  }, [isOpen, trimmed.length]);

  useEffect(() => {
    if (!isOpen || trimmed.length < 2) {
      const resetTimer = setTimeout(() => {
        setProducts([]);
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    const loadingTimer = setTimeout(() => setIsLoading(true), 0);
    const searchTimer = setTimeout(() => {
      searchProducts(trimmed).then((result) => {
        setProducts(result);
        setIsLoading(false);
      });
    }, 250);

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(searchTimer);
    };
  }, [query, isOpen, trimmed]);

  const viewStatus =
    !isOpen || trimmed.length === 0 ? "idle" : isLoading ? "loading" : products.length > 0 ? "success" : "empty";

  const chips = viewStatus === "success" ? buildChips(query, products) : [];

  function openPanel() {
    setIsOpen(true);
  }

  function closePanel() {
    setIsOpen(false);
    setActiveIndex(-1);
    setRandomProducts([]);
    setShowAllCategories(false);
  }

  function clearQuery() {
    setQuery("");
    setProducts([]);
    setActiveIndex(-1);
    queueMicrotask(() => inputRef.current?.focus());
  }

  function goToProduct(product: Product) {
    closePanel();
    if (product.slug) router.push(`/catalog/product/${product.slug}`);
  }

  function applyPopularQuery(popularQuery: string) {
    setQuery(popularQuery);
    setActiveIndex(-1);
    openPanel();
    queueMicrotask(() => inputRef.current?.focus());
  }

  function applyChip(token: string) {
    const endsWithSpace = /\s$/.test(query);
    let nextQuery: string;
    if (endsWithSpace) {
      nextQuery = `${query}${token} `;
    } else {
      const parts = query.trimEnd().split(/\s+/);
      parts[parts.length - 1] = token;
      nextQuery = `${parts.join(" ")} `;
    }
    setQuery(nextQuery);
    setActiveIndex(-1);
    queueMicrotask(() => inputRef.current?.focus());
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (activeIndex >= 0 && products[activeIndex]) {
      goToProduct(products[activeIndex]);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setActiveIndex(-1);
    if (!isOpen) openPanel();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      closePanel();
      return;
    }
    if (viewStatus !== "success" || products.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i < 0 ? 0 : i + 1, products.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const product = products[activeIndex];
      if (product) goToProduct(product);
    }
  }

  return (
    <div className={styles.searchContainer}>
      <div className={isOpen ? styles.overlayOpen : styles.overlay} aria-hidden="true" onClick={closePanel} />

      {/* Форма — фиксированная высота, чипы сюда НЕ входят */}
      <form className={styles.search} role="search" onSubmit={handleSubmit}>
        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            role="combobox"
            className={styles.input}
            type="search"
            name="query"
            placeholder={placeholder}
            autoComplete="off"
            value={query}
            onFocus={openPanel}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-haspopup="listbox"
          />
          {trimmed.length > 0 && (
            <button type="button" className={styles.resetButton} aria-label="Очистить поиск" onClick={clearQuery}>
              <ResetIcon className={styles.resetIcon} />
            </button>
          )}
          <button className={styles.button} type="submit">
            Найти
          </button>
        </div>
      </form>

      {/* Выпадающая панель — абсолютная, не влияет на хедер */}
      <div
        id={panelId}
        role="region"
        aria-label="Панель поиска"
        className={isOpen ? styles.searchPanelOpen : styles.searchPanel}>
        <div className={styles.searchPanelContent}>
          {/* Чипы — теперь внутри панели, не в форме */}
          {chips.length > 0 && (
            <div className={styles.chipsRow} aria-label="Быстрые подсказки">
              {chips.map((chip) => (
                <button key={chip} type="button" className={styles.chip} onClick={() => applyChip(chip)}>
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Популярные запросы */}
          {viewStatus === "idle" && (
            <div className={styles.idleSection}>
              <div className={styles.sectionTitle}>Популярные запросы</div>

              <div className={styles.populateLayout}>
                {/* левая колонка — всегда видна сразу */}
                <ul className={styles.list}>
                  {POPULAR_QUERIES.map((item) => (
                    <li key={item}>
                      <button type="button" className={styles.listButton} onClick={() => applyPopularQuery(item)}>
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>

                {/* правая колонка — скелетон пока товары не загрузились */}
                {randomProducts.length === 0 ? (
                  <div className={styles.randomProductList}>
                    <div className={styles.skeletonCard} />
                    <div className={styles.skeletonCard} />
                  </div>
                ) : (
                  <ul className={styles.randomProductList}>
                    {randomProducts.map((product) => (
                      <li key={product.id} className={styles.randomProductItem}>
                        <Link
                          href={`/catalog/product/${product.slug}`}
                          className={styles.randomProductButton}
                          onClick={closePanel}>
                          <div className={styles.thumb}>
                            <Image
                              src={
                                product.imageUrl?.trim() ? product.imageUrl : "/images/catalog/product-placeholder.webp"
                              }
                              alt={product.title}
                              fill
                              className={styles.image}
                              sizes="20vw"
                            />
                          </div>
                          <span className={styles.randomProductPrice}>
                            {product.priceRub.toLocaleString("ru-RU")} ₽
                          </span>
                          <span className={styles.randomProductTitle}>{product.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={styles.idleCategories}>
                <h3 className={styles.idleCategoriesTitle}>Категории</h3>

                <ul
                  className={`${styles.idleCategoriesList} ${
                    showAllCategories ? styles.idleCategoriesListExpanded : ""
                  }`}>
                  {visibleCategories.map((category) => (
                    <li key={category.id} className={styles.idleCategoriesItem}>
                      <Link
                        onClick={closePanel}
                        href={`/catalog/${category.slug}`}
                        className={styles.idleCategoriesLink}>
                        <span className={styles.idleCategoryText}>{category.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                {!showAllCategories && categories.length > LIMIT && (
                  <button
                    type="button"
                    className={styles.categoriesMoreButton}
                    onClick={() => setShowAllCategories(true)}>
                    Показать еще
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Загрузка */}
          {viewStatus === "loading" && <div className={styles.empty}>Ищем…</div>}

          {/* Результаты */}
          {viewStatus === "success" && (
            <div>
              <div className={styles.sectionTitle}>Товары</div>
              <ul className={styles.productsList}>
                {products.map((product, index) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      className={`${styles.productButton} ${index === activeIndex ? styles.productButtonActive : ""}`}
                      aria-current={index === activeIndex ? "true" : undefined}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => goToProduct(product)}>
                      {product.imageUrl ? (
                        <Image
                          className={styles.previewImageImg}
                          src={product.imageUrl}
                          alt={product.title}
                          width={48}
                          height={48}
                          loading="lazy"
                        />
                      ) : (
                        <span className={styles.previewImage} aria-hidden="true" />
                      )}
                      <span className={styles.productInfo}>
                        <span className={styles.productTitle}>{product.title}</span>
                        {product.categoryTitle && (
                          <span className={styles.productCategory}>{product.categoryTitle}</span>
                        )}
                        <span className={styles.productPrice}>{product.priceRub.toLocaleString("ru-RU")} ₽</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ничего не найдено */}
          {viewStatus === "empty" && <div className={styles.empty}>Ничего не найдено</div>}
        </div>
      </div>
    </div>
  );
}
