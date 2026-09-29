"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

import { getStrapiMediaUrl } from "@/lib/api/strapi/media";
import { mapProductBadges } from "@/lib/api/catalog/mappers";
import ResetIcon from "@/components/icons/ResetIcon";
import SearchIcon from "@/components/icons/header/SearchIcon";
import ProductBadges from "@/shared/ui/product-badges/ProductBadges";

import type { CatalogCategoryPreview, ProductBadge } from "@/lib/api/catalog/types";

import styles from "./SearchBar.module.css";
import { usePagedSearch, type SearchPage } from "./usePagedSearch";

const PLACEHOLDER_IMG = "/images/catalog/product-placeholder.webp";

// Типы
type Props = {
  placeholder?: string;
  categories: CatalogCategoryPreview[];
  onOpenChange?: (isOpen: boolean) => void;
  // Сигнал извне — когда число меняется, панель закрывается.
  // Используется в MainBar чтобы закрыть поиск по клику на стрелку "назад".
  closeSignal?: number;
};

type Product = {
  id: string;
  title: string;
  priceRub: number;
  categoryTitle?: string;
  code?: string;
  imageUrl?: string;
  slug?: string;
  variantId?: string;
  isNew: boolean;
  noveltyBadgeColor: string;
  isSampleSale: boolean;
  badges: ProductBadge[];
};

type ApiImage = {
  url: string;
};

type ApiMatchedVariant = {
  id: number;
  name?: string | null;
  price?: number | null;
  code?: string | null;
  image?: ApiImage[] | null;
};

type ApiProductItem = {
  id: number;
  attributes: {
    name?: string | null;
    price?: number | null;
    code?: string | null;
    categoryName?: string | null;
    slug?: string | null;
    image?: ApiImage[] | null;
    matchedVariant?: ApiMatchedVariant | null;
    isNew?: boolean | null;
    noveltyBadgeColor?: string | null;
    isSampleSale?: boolean | null;
    badges?: unknown;
  };
};

// Константы
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.cocktaildesign.ru/api";
const POPULAR_QUERIES = ["Шейкер", "Джиггер", "Барная ложка", "Стрейнер", "Сироп"];

const CATEGORIES_LIMIT = 8;
const RANDOM_PRODUCTS_COUNT = 2;

const SEARCH_MIN_LENGTH = 2;
const SEARCH_PAGE_SIZE = 10;

const DEFAULT_NOVELTY_BADGE_COLOR = "#2eae4a";

function normalizeNoveltyBadgeColor(value: unknown): string {
  if (typeof value !== "string") {
    return DEFAULT_NOVELTY_BADGE_COLOR;
  }

  const trimmed = value.trim();

  if (!/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return DEFAULT_NOVELTY_BADGE_COLOR;
  }

  return trimmed;
}

// Преобразуем ответ API в формат компонента
function mapApiProductToProduct(item: ApiProductItem): Product {
  const matchedVariant = item.attributes.matchedVariant ?? null;

  const raw = matchedVariant?.image?.[0]?.url ?? item.attributes.image?.[0]?.url ?? undefined;

  return {
    id: String(item.id),
    title: matchedVariant?.name ?? item.attributes.name ?? "",
    priceRub: matchedVariant?.price ?? item.attributes.price ?? 0,
    categoryTitle: item.attributes.categoryName ?? undefined,
    code: matchedVariant?.code ?? item.attributes.code ?? undefined,
    slug: item.attributes.slug ?? undefined,
    variantId: matchedVariant ? String(matchedVariant.id) : undefined,
    imageUrl: getStrapiMediaUrl(raw),
    isNew: item.attributes.isNew === true,
    noveltyBadgeColor: normalizeNoveltyBadgeColor(item.attributes.noveltyBadgeColor),
    isSampleSale: item.attributes.isSampleSale === true,
    badges: mapProductBadges(item.attributes.badges),
  };
}

// Запрос случайных товаров для пустого состояния
async function fetchRandomProducts(count: number): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/catalog/random-products?count=${count}`);

  if (!res.ok) {
    return [];
  }

  const data = (await res.json()) as { items?: ApiProductItem[] };
  return (data.items ?? []).map(mapApiProductToProduct);
}

// Поиск товаров по запросу
async function searchProducts(query: string, offset: number, revision: string, signal: AbortSignal): Promise<SearchPage<Product>> {
  const params = new URLSearchParams({ q: query, limit: String(SEARCH_PAGE_SIZE), offset: String(offset) });
  if (revision) params.set("revision", revision);
  const res = await fetch(`${API_BASE}/catalog/search-v2?${params}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]), cache: "no-store",
  });
  if (!res.ok) throw new Error(res.status === 409 ? "search_results_changed" : "search_unavailable");
  const data = await res.json() as { items?: ApiProductItem[]; total?: number; nextOffset?: number; hasMore?: boolean; revision?: string };
  const items = (data.items ?? []).map(mapApiProductToProduct);
  // Older API remains usable during rollout/rollback, without offering unsupported pagination.
  return { items, total: data.total ?? items.length, nextOffset: data.nextOffset ?? items.length,
    hasMore: data.hasMore === true, revision: data.revision ?? "" };
}

// Строим чипы для продолжения поисковой фразы
function buildChips(query: string, products: Product[]): string[] {
  const trimmed = query.trim();

  if (trimmed.length === 0 || products.length === 0) {
    return [];
  }

  const queryTokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);

  const endsWithSpace = /\s$/.test(query);
  const baseTokens = endsWithSpace ? queryTokens : queryTokens.slice(0, -1);
  const prefix = endsWithSpace ? "" : (queryTokens[queryTokens.length - 1] ?? "");

  const counts = new Map<string, number>();

  for (const product of products) {
    const titleTokens = product.title.toLowerCase().split(/\s+/).filter(Boolean);

    const baseMatches =
      baseTokens.length <= titleTokens.length && baseTokens.every((token, index) => titleTokens[index] === token);

    if (!baseMatches) {
      continue;
    }

    const candidate = titleTokens[baseTokens.length];

    if (!candidate) {
      continue;
    }

    if (prefix.length > 0 && !candidate.startsWith(prefix)) {
      continue;
    }

    if (prefix.length > 0 && candidate === prefix) {
      continue;
    }

    counts.set(candidate, (counts.get(candidate) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([token]) => token);
}

export default function SearchBar({
  placeholder = "Поиск в CocktailDesign",
  categories,
  onOpenChange,
  closeSignal,
}: Props) {
  const router = useRouter();
  const panelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);

  // Состояние панели и строки поиска
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = usePagedSearch(query, isOpen, searchProducts);

  // Данные поиска

  const [randomProducts, setRandomProducts] = useState<Product[]>([]);

  // Служебное состояние интерфейса
  const [activeIndex, setActiveIndex] = useState(-1);

  const [showAllCategories, setShowAllCategories] = useState(false);

  // Производные значения
  const trimmed = query.trim();


  const visibleCategories = showAllCategories ? categories : categories.slice(0, CATEGORIES_LIMIT);

  const visibleProducts = results.ready ? results.items : [];
  const viewStatus = !isOpen || !trimmed ? "idle" : results.isFetching ? "loading" :
    results.ready && results.error && !visibleProducts.length ? "error" : visibleProducts.length ? "success" : "empty";
  const chips = viewStatus === "success" ? buildChips(query, visibleProducts.slice(0, SEARCH_PAGE_SIZE)) : [];

  // Загружаем случайные товары, когда панель открыта и строка поиска пустая
  useEffect(() => {
    if (!isOpen || trimmed.length > 0) {
      return;
    }

    let isCancelled = false;

    async function loadRandomProducts() {
      const result = await fetchRandomProducts(RANDOM_PRODUCTS_COUNT);

      if (!isCancelled) {
        setRandomProducts(result);
      }
    }

    void loadRandomProducts().catch(() => { if (!isCancelled) setRandomProducts([]); });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, trimmed]);

  // Внешний сигнал закрытия — когда closeSignal меняется, закрываем панель.
  // Пропускаем первый рендер (когда значение приходит впервые).
  const isFirstCloseSignalRef = useRef(true);

  useEffect(() => {
    if (closeSignal === undefined) {
      return;
    }

    if (isFirstCloseSignalRef.current) {
      isFirstCloseSignalRef.current = false;
      return;
    }

    closePanel();
    // closePanel — стабильный обработчик внутри компонента, eslint можно не ругать
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeSignal]);

  function openPanel() {
    setIsOpen(true);
    if (onOpenChange) {
      onOpenChange(true);
    }
  }

  function closePanel() {
    setIsOpen(false);
    if (onOpenChange) {
      onOpenChange(false);
    }
    setActiveIndex(-1);
    setRandomProducts([]);
    setShowAllCategories(false);


  }

  function focusInput() {
    queueMicrotask(() => {
      inputRef.current?.focus();
    });
  }

  function clearQuery() {
    resetScroll();
    setQuery("");
    setActiveIndex(-1);
    focusInput();
  }

  function goToProduct(product: Product) {
    closePanel();

    if (!product.slug) {
      return;
    }

    const productUrl = product.variantId
      ? `/catalog/product/${product.slug}?variant=${encodeURIComponent(product.variantId)}`
      : `/catalog/product/${product.slug}`;

    router.push(productUrl);
  }

  function applyPopularQuery(popularQuery: string) {
    resetScroll();
    setQuery(popularQuery);
    setActiveIndex(-1);

    openPanel();
    focusInput();
  }

  function applyChip(token: string) {
    const endsWithSpace = /\s$/.test(query);

    let nextQuery = "";

    if (endsWithSpace) {
      nextQuery = `${query}${token} `;
    } else {
      const parts = query.trimEnd().split(/\s+/);
      parts[parts.length - 1] = token;
      nextQuery = `${parts.join(" ")} `;
    }

    resetScroll();
    setQuery(nextQuery);
    setActiveIndex(-1);

    focusInput();
  }

  function resetScroll() { if (panelContentRef.current) panelContentRef.current.scrollTop = 0; }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    openPanel();
    if (results.error) results.retry();
    focusInput();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setActiveIndex(-1);
    resetScroll();
    if (!isOpen) openPanel();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closePanel();
      return;
    }

    if (viewStatus !== "success" || visibleProducts.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const index = Math.min(activeIndex < 0 ? 0 : activeIndex + 1, visibleProducts.length - 1);
      setActiveIndex(index);
      document.getElementById(`${panelId}-item-${index}`)?.scrollIntoView({ block: "nearest" });
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const index = Math.max(activeIndex - 1, 0);
      setActiveIndex(index);
      document.getElementById(`${panelId}-item-${index}`)?.scrollIntoView({ block: "nearest" });
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();

      const product = visibleProducts[activeIndex];

      if (product) {
        goToProduct(product);
      }
    }
  }

  return (
    <div className={styles.searchContainer}>
      {/* Затемнение страницы при открытой панели */}
      <div className={isOpen ? styles.overlayOpen : styles.overlay} aria-hidden="true" onClick={closePanel} />

      {/* Форма поиска */}
      <form className={styles.search} role="search" onSubmit={handleSubmit}>
        <div className={styles.inputRow}>
          <span className={styles.searchIconBox} aria-hidden="true">
            <SearchIcon className={styles.searchIcon} />
          </span>
          <input
            ref={inputRef}
            role="combobox"
            className={styles.input}
            type="search"
            maxLength={160}
            name="query"
            placeholder={placeholder}
            autoComplete="off"
            value={query}
            onFocus={openPanel}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-haspopup="dialog"
            enterKeyHint="search"
          />

          {trimmed.length > 0 && (
            <button type="button" className={styles.resetButton} aria-label="Очистить поиск" onClick={clearQuery}>
              <ResetIcon className={styles.resetIcon} />
            </button>
          )}

          <button className={styles.button} type="submit" aria-label="Найти товары">
            <SearchIcon />
          </button>
        </div>
      </form>

      {/* Выпадающая панель */}
      <div
        id={panelId}
        role="dialog"
        aria-label="Панель поиска"
        className={isOpen ? styles.searchPanelOpen : styles.searchPanel}>
        <div ref={panelContentRef} className={styles.searchPanelContent}>
          {/* Быстрые подсказки */}
          {chips.length > 0 && (
            <div className={styles.chipsRow} aria-label="Быстрые подсказки">
              {chips.map((chip) => (
                <button key={chip} type="button" className={styles.chip} onClick={() => applyChip(chip)}>
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Пустое состояние */}
          {viewStatus === "idle" && (
            <div className={styles.idleSection}>
              <div className={styles.sectionTitle}>Популярные запросы</div>

              <div className={styles.populateLayout}>
                <ul className={styles.list}>
                  {POPULAR_QUERIES.map((item) => (
                    <li key={item}>
                      <button type="button" className={styles.listButton} onClick={() => applyPopularQuery(item)}>
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>

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
                              src={product.imageUrl ?? PLACEHOLDER_IMG}
                              alt={product.title}
                              fill
                              className={styles.image}
                              sizes="20vw"
                            />

                            <ProductBadges
                              isNew={product.isNew}
                              noveltyBadgeColor={product.noveltyBadgeColor}
                              isSampleSale={product.isSampleSale}
                              badges={product.badges}
                              desktopLimit={1}
                              mobileLimit={1}
                              overlay
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

                {!showAllCategories && categories.length > CATEGORIES_LIMIT && (
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

          {/* Результаты поиска */}
          {viewStatus === "success" && (
            <div>
              <div className={styles.sectionTitle}>Товары</div>

              <ul className={styles.productsList}>
                {visibleProducts.map((product, index) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      id={`${panelId}-item-${index}`}
                      className={`${styles.productButton} ${index === activeIndex ? styles.productButtonActive : ""}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => goToProduct(product)}>
                      <Image
                        className={styles.previewImageImg}
                        src={product.imageUrl ?? PLACEHOLDER_IMG}
                        alt={product.title}
                        width={48}
                        height={48}
                        loading="lazy"
                      />

                      <span className={styles.productInfo}>
                        <span className={styles.productTitle}>{product.title}</span>

                        <ProductBadges
                          isNew={product.isNew}
                          noveltyBadgeColor={product.noveltyBadgeColor}
                          isSampleSale={product.isSampleSale}
                          badges={product.badges}
                          desktopLimit={2}
                          mobileLimit={1}
                          className={styles.searchProductBadges}
                        />

                        {product.code && <span className={styles.productCategory}>Артикул: {product.code}</span>}

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
          {viewStatus === "empty" && <div className={styles.empty}>{trimmed.length < SEARCH_MIN_LENGTH ? "Введите хотя бы 2 символа" : "Ничего не найдено"}</div>}
          {viewStatus === "error" && <div className={styles.empty} role="status">
            <p>{results.error}</p><button type="button" className={styles.moreButton} onClick={results.retry}>Повторить поиск</button>
          </div>}
        </div>
        {viewStatus === "success" && <div className={styles.resultsFooter}>
          <span className={styles.resultCount} role="status" aria-live="polite">Показано {visibleProducts.length} из {results.total} товаров</span>
          {results.error && <p className={styles.resultError} role="status">{results.error}</p>}
          {results.changed ? <button type="button" className={styles.moreButton} onClick={() => { setActiveIndex(-1); resetScroll(); results.retry(); }}>Обновить поиск</button> :
            results.hasMore && <button type="button" className={styles.moreButton} disabled={results.more} onClick={() => void results.loadMore()}>
              {results.more ? "Загружаем…" : results.error ? "Повторить загрузку" : `Показать ещё ${Math.min(SEARCH_PAGE_SIZE, results.total - visibleProducts.length)}`}
            </button>}
        </div>}
      </div>
    </div>
  );
}
