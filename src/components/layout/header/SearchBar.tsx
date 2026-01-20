"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./SearchBar.module.css";
import Image from "next/image";
import ResetIcon from "@/components/icons/ResetIcon";

/**
 * Статус панели.
 *
 * idle    — панель закрыта ИЛИ запрос пустой: показываем популярные запросы.
 * loading — пользователь печатает: debouncedQuery ещё не равен query.trim().
 * success — debounce “догнал”: можно показывать результаты поиска.
 * empty   — debounce “догнал”, но результатов 0: показываем “Ничего не найдено”.
 * error   — резерв на будущее для API-ошибок (сейчас не используется).
 */
type PanelStatus = "idle" | "loading" | "success" | "empty" | "error";

/** Пропсы: placeholder опциональный, ниже есть дефолт. */
type Props = {
  placeholder?: string;
};

/** Мини-тип товара для демо (моки). */
type Product = {
  id: string;
  title: string;
  priceRub: number;
  categoryTitle?: string;
  imageUrl?: string;
};

/** Список быстрых вариантов, когда пользователь ещё ничего не ввёл. */
const POPULAR_QUERIES = ["Бостонский шейкер", "Джиггер", "Барная ложка", "Стрейнер", "Сироп"];

/**
 * Моки товаров.
 * Используются в findProducts/findChipSuggestions.
 */

const MOCK_PRODUCTS: Product[] = [
  // Шейкеры
  { id: "p1", title: "Бостонский шейкер (нерж.)", priceRub: 1290, categoryTitle: "Шейкеры" },
  { id: "p2", title: "Кобблер шейкер классический", priceRub: 890, categoryTitle: "Шейкеры" },
  { id: "p3", title: "Бостонский шейкер (стекло + метал)", priceRub: 1590, categoryTitle: "Шейкеры" },
  { id: "p4", title: "Шейкер для маргариты", priceRub: 650, categoryTitle: "Шейкеры" },
  { id: "p5", title: "Шейкер карманный нерж. 500мл", priceRub: 790, categoryTitle: "Шейкеры" },

  // Джиггеры
  { id: "p6", title: "Джиггер Золотой 25/50 мл", priceRub: 490, categoryTitle: "Джиггеры" },
  { id: "p7", title: "Джиггер 30/60 мл", priceRub: 520, categoryTitle: "Джиггеры" },
  { id: "p8", title: "Джиггер 15/30 мл премиум", priceRub: 620, categoryTitle: "Джиггеры" },
  { id: "p9", title: "Джиггер двойной 20/40 мл", priceRub: 450, categoryTitle: "Джиггеры" },
  { id: "p10", title: "Джиггер набор 3в1 (20/25/50)", priceRub: 1190, categoryTitle: "Джиггеры" },

  // Барные ложки
  { id: "p11", title: "Барная ложка витая 30 см", priceRub: 390, categoryTitle: "Барные ложки" },
  { id: "p12", title: "Барная ложка мюддлер 30 см", priceRub: 420, categoryTitle: "Барные ложки" },
  { id: "p13", title: "Барная ложка японская 30 см", priceRub: 380, categoryTitle: "Барные ложки" },
  { id: "p14", title: "Барная ложка витая 32 см премиум", priceRub: 490, categoryTitle: "Барные ложки" },
  { id: "p15", title: "Мюддлер барный 28 см", priceRub: 350, categoryTitle: "Барные ложки" },

  // Стрейнеры
  { id: "p16", title: "Стрейнер Hawthorne", priceRub: 690, categoryTitle: "Стрейнеры" },
  { id: "p17", title: "Стрейнер Julep", priceRub: 620, categoryTitle: "Стрейнеры" },
  { id: "p18", title: "Стрейнер комбинированный", priceRub: 890, categoryTitle: "Стрейнеры" },
  { id: "p19", title: "Стрейнер двойной Hawthorne", priceRub: 1290, categoryTitle: "Стрейнеры" },
  { id: "p20", title: "Стрейнер мелкоячеистый", priceRub: 750, categoryTitle: "Стрейнеры" },

  // Мюддлеры
  { id: "p21", title: "Мюддлер деревянный", priceRub: 340, categoryTitle: "Мюддлеры" },
  { id: "p22", title: "Мюддлер пластиковый", priceRub: 190, categoryTitle: "Мюддлеры" },
  { id: "p23", title: "Мюддлер нерж. с шариком", priceRub: 520, categoryTitle: "Мюддлеры" },
  { id: "p24", title: "Мюддлер комбинированный 2в1", priceRub: 680, categoryTitle: "Мюддлеры" },
  { id: "p25", title: "Мюддлер рифленый нерж.", priceRub: 450, categoryTitle: "Мюддлеры" },

  // Ситечки
  { id: "p26", title: "Ситечко мелкое 2 мм", priceRub: 580, categoryTitle: "Ситечки" },
  { id: "p27", title: "Ситечко среднее 4 мм", priceRub: 520, categoryTitle: "Ситечки" },
  { id: "p28", title: "Ситечко набор 3 шт", priceRub: 1490, categoryTitle: "Ситечки" },
  { id: "p29", title: "Ситечко силиконовое складное", priceRub: 390, categoryTitle: "Ситечки" },
  { id: "p30", title: "Ситечко для стрейнера", priceRub: 450, categoryTitle: "Ситечки" },

  // Пуллеры льда
  { id: "p31", title: "Пуллер для льда прямой", priceRub: 290, categoryTitle: "Пуллеры льда" },
  { id: "p32", title: "Пуллер для льда изогнутый", priceRub: 320, categoryTitle: "Пуллеры льда" },
  { id: "p33", title: "Пуллер для льда раздвижной", priceRub: 450, categoryTitle: "Пуллеры льда" },
  { id: "p34", title: "Щипцы для льда 20 см", priceRub: 380, categoryTitle: "Пуллеры льда" },
  { id: "p35", title: "Ледоруб нерж. сталь", priceRub: 890, categoryTitle: "Пуллеры льда" },

  // Декорирование
  { id: "p36", title: "Цедра для цитруса Y-образная", priceRub: 420, categoryTitle: "Декорирование" },
  { id: "p37", title: "Цедра спиральная", priceRub: 390, categoryTitle: "Декорирование" },
  { id: "p38", title: "Ножик для канапе 2в1", priceRub: 320, categoryTitle: "Декорирование" },
  { id: "p39", title: "Канелька для палочек корицы", priceRub: 280, categoryTitle: "Декорирование" },
  { id: "p40", title: "Соломинки многоразовые нерж.", priceRub: 290, categoryTitle: "Декорирование" },

  // Измерение
  { id: "p41", title: "Шприц мерный 50 мл", priceRub: 340, categoryTitle: "Измерение" },
  { id: "p42", title: "Мерный цилиндр 500 мл", priceRub: 520, categoryTitle: "Измерение" },
  { id: "p43", title: "Весы электронные 5 кг", priceRub: 1890, categoryTitle: "Измерение" },
  { id: "p44", title: "Гидрометр для сиропов", priceRub: 680, categoryTitle: "Измерение" },
  { id: "p45", title: "Спиртометр 0-100%", priceRub: 590, categoryTitle: "Измерение" },

  // Шпатели
  { id: "p46", title: "Шпатель силиконовый 25 см", priceRub: 280, categoryTitle: "Шпатели" },
  { id: "p47", title: "Лопатка для перемешивания", priceRub: 310, categoryTitle: "Шпатели" },
  { id: "p48", title: "Шпатель гибкий нерж.", priceRub: 400, categoryTitle: "Шпатели" },
  { id: "p49", title: "Комбинированный инструмент 3в1", priceRub: 520, categoryTitle: "Шпатели" },
  { id: "p50", title: "Шпатель для чистки края бокала", priceRub: 250, categoryTitle: "Шпатели" },
];

/**
 * Приводит строку к массиву “слов” (токенов):
 * - убираем края, приводим к нижнему регистру
 * - режем по любому числу пробелов
 * Это делает поиск по словам стабильным.
 */
function normalizeTokens(value: string): string[] {
  return value.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * true, если в конце строки пробел.
 * Это “сигнал” что слово закончено (важно для логики чипов).
 */
function hasTrailingSpace(value: string): boolean {
  return /\s$/.test(value);
}

/**
 * Добавляет пробел в конце, если его нет.
 * После выбора чипа это позволяет сразу печатать следующее слово.
 */
function ensureTrailingSpace(value: string): string {
  return hasTrailingSpace(value) ? value : `${value} `;
}

/**
 * Проверяет совпадение “по всем токенам”.
 * Каждый токен из query должен встречаться в text как подстрока.
 *
 * Пример:
 * query: "барная л" -> ["барная","л"]
 * text:  "барная ложка витая" -> true
 */
function matchesByTokens(text: string, query: string): boolean {
  const normalizedText = text.trim().toLowerCase();
  const tokens = normalizeTokens(query);
  if (tokens.length === 0) return false;
  return tokens.every((token) => normalizedText.includes(token));
}

/**
 * Находит товары по запросу:
 * - если запрос пустой -> []
 * - фильтруем MOCK_PRODUCTS по совпадению токенов
 * - ограничиваем выдачу 6 элементами
 */
function findProducts(query: string): Product[] {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length === 0) return [];

  return MOCK_PRODUCTS.filter((p) => {
    // защита от “битых” данных
    if (typeof p.title !== "string" || p.title.trim().length === 0) return false;
    return matchesByTokens(p.title, normalizedQuery);
  }).slice(0, 6);
}

/**
 * Подбирает чипы для автодополнения последнего слова.
 *
 * Механика:
 * - если запрос заканчивается пробелом -> последнее слово завершено,
 *   предлагаем СЛЕДУЮЩЕЕ слово из названия товара.
 * - если пробела нет -> пользователь печатает слово,
 *   предлагаем варианты, начинающиеся с введённого префикса.
 *
 * Выдача:
 * - собираем кандидатов и сортируем по частоте встречаемости
 * - отдаём до 6 подсказок
 */
function findChipSuggestions(query: string): string[] {
  const raw = query;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return [];

  const endsWithSpace = hasTrailingSpace(raw);

  const qTokens = normalizeTokens(raw);
  if (qTokens.length === 0) return [];

  const lastToken = qTokens[qTokens.length - 1] ?? "";
  const baseTokens = endsWithSpace ? qTokens : qTokens.slice(0, -1);

  // если пробел есть -> предлагаем следующее слово, префикс пустой
  // если пробела нет -> дополняем текущее слово, префикс = lastToken
  const tokenPrefix = endsWithSpace ? "" : lastToken;

  // Map<слово, сколько раз встречается> для сортировки “по популярности”
  const counts = new Map<string, number>();

  for (const p of MOCK_PRODUCTS) {
    const titleTokens = normalizeTokens(p.title);
    if (titleTokens.length === 0) continue;

    // baseTokens должны совпасть с НАЧАЛОМ titleTokens
    const baseMatches = baseTokens.length <= titleTokens.length && baseTokens.every((t, i) => titleTokens[i] === t);
    if (!baseMatches) continue;

    // кандидат — слово сразу после baseTokens
    const candidate = titleTokens[baseTokens.length];
    if (!candidate) continue;

    // если дополняем текущее слово — кандидат должен начинаться с префикса
    if (tokenPrefix.length > 0 && !candidate.startsWith(tokenPrefix)) continue;

    // не показываем “подсказку”, которая уже полностью введена
    if (tokenPrefix.length > 0 && candidate === tokenPrefix) continue;

    counts.set(candidate, (counts.get(candidate) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([token]) => token);
}

export default function SearchBar({ placeholder = "Поиск в CocktailDesign" }: Props) {
  /** Открыта ли панель (оверлей + выпадающий блок). */
  const [isOpen, setIsOpen] = useState(false);

  /** Значение поля ввода (то, что пользователь печатает). */
  const [query, setQuery] = useState("");

  /** Индекс активного товара в списке результатов (-1 = ничего не выделено). */
  const [activeIndex, setActiveIndex] = useState(-1);

  /** “Задержанное” значение query: используется для результатов, чтобы не искать на каждую букву. */
  const [debouncedQuery, setDebouncedQuery] = useState("");

  /**
   * Debounce-эффект: обновляем debouncedQuery с задержкой.
   * Работает только когда панель открыта.
   *
   * Почему:
   * - пока человек печатает, мы показываем loading
   * - когда пауза ~250ms, debouncedQuery догоняет query.trim()
   */
  useEffect(() => {
    if (!isOpen) return;

    const next = query.trim();

    const timeoutId = window.setTimeout(
      () => {
        setDebouncedQuery(next);
      },
      next.length === 0 ? 0 : 250,
    );

    // cleanup: при новом вводе отменяем старый таймер
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query, isOpen]);

  /** id для aria-controls: связывает input (combobox) и панель результатов. */
  const panelId = useId();

  /** query без пробелов по краям. */
  const trimmedQuery = query.trim();

  /** true пока debounce не догнал ввод. */
  const isTyping = debouncedQuery !== trimmedQuery;

  /**
   * Базовый статус:
   * - idle: панель закрыта или запрос пустой
   * - loading: печатает (debounce не догнал)
   * - success: debounce догнал (можно показывать результаты)
   */
  const status: PanelStatus = !isOpen ? "idle" : trimmedQuery.length === 0 ? "idle" : isTyping ? "loading" : "success";

  /**
   * Список товаров:
   * считаем только когда панель открыта и debouncedQuery не пустой.
   */
  const products = isOpen && debouncedQuery.length > 0 ? findProducts(debouncedQuery) : [];

  /**
   * Отображаемый статус:
   * если success, но результатов 0 -> empty.
   */
  const viewStatus: PanelStatus = status === "success" && products.length === 0 ? "empty" : status;

  /**
   * Чипы для подсказок:
   * показываем только когда панель открыта и пользователь что-то ввёл.
   */
  const chipsToShow = isOpen && query.trim().length > 0 ? findChipSuggestions(query) : [];

  /** ref на input: нужен чтобы вернуть фокус после выбора чипа. */
  const inputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Открывает панель.
   * Плюс синхронизируем debouncedQuery, чтобы результаты появились сразу (без ожидания 250ms).
   */
  function open() {
    setIsOpen(true);
    setDebouncedQuery(query.trim());
  }

  /**
   * Очищаем запрос и состояние навигации по результатам.
   * Фокус возвращаем в input, чтобы пользователь мог продолжить ввод без клика.
   */
  function handleReset() {
    setQuery("");
    setDebouncedQuery("");
    setActiveIndex(-1);

    // Возвращаем фокус в input, чтобы пользователь сразу продолжил печатать
    queueMicrotask(() => {
      inputRef.current?.focus();
    });
  }

  /**
   * Закрывает панель и очищает debouncedQuery.
   * query не трогаем: пользователь может открыть и продолжить ввод.
   */
  function close() {
    setIsOpen(false);
    setDebouncedQuery("");
    setActiveIndex(-1); // Клавиатура: сбрасываем активный элемент при закрытии панели
  }

  /** Сабмит формы: не перезагружаем страницу, запускаем runSearch. */
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch(query);
  }

  /** Escape закрывает панель */
  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    // Клавиатура: навигация доступна только когда показываем список товаров.
    const canNavigate = isOpen && viewStatus === "success" && products.length > 0;
    if (!canNavigate) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();

      const nextIndex = activeIndex < 0 ? 0 : Math.min(activeIndex + 1, products.length - 1);
      setActiveIndex(nextIndex);
      return;
    }

    if (event.key === "ArrowUp") {
      if (activeIndex <= 0) return;

      event.preventDefault();
      setActiveIndex(activeIndex - 1);
      return;
    }

    if (event.key === "Enter") {
      if (activeIndex < 0) return;

      event.preventDefault();

      const activeProduct = products[activeIndex];
      if (activeProduct) {
        runSearch(activeProduct.title);
      }
    }
  }

  /**
   * Обработка ввода:
   * - обновляем query
   * - если панель была закрыта, открываем её при первом вводе
   */
  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;

    setQuery(nextValue);
    setActiveIndex(-1); // Клавиатура: любой ввод сбрасывает выделение результата

    if (!isOpen) open();
  }

  /**
   * “Выполнить поиск”.
   * Сейчас — просто нормализуем строку, логируем, закрываем панель.
   * Позже — здесь обычно будет роутинг на страницу /search?q=...
   */
  function runSearch(nextQuery: string) {
    const normalized = nextQuery.trim();
    if (normalized.length === 0) return;

    setQuery(normalized);
    close();
  }

  /**
   * Применение чипа:
   * - если строка оканчивается пробелом -> добавляем слово в конец
   * - иначе -> заменяем последнее слово на выбранный чип
   * - затем добавляем пробел (готовим ввод следующего слова)
   * - обновляем debouncedQuery сразу, чтобы результаты не “ждали” таймер
   * - возвращаем фокус в input
   */
  function applyChip(token: string) {
    const t = token.trim();
    if (t.length === 0) return;

    const raw = query;
    const endsWithSpace = hasTrailingSpace(raw);

    let nextQuery: string;

    if (endsWithSpace) {
      nextQuery = `${raw}${t}`;
    } else {
      const parts = raw.trim().split(/\s+/);
      parts[parts.length - 1] = t;
      nextQuery = parts.join(" ");
    }

    nextQuery = ensureTrailingSpace(nextQuery);

    setQuery(nextQuery);
    setActiveIndex(-1); // Клавиатура: чип меняет строку => сбрасываем выделение
    setDebouncedQuery(nextQuery.trim());

    // microtask: фокус после setState, чтобы React успел обновить DOM
    queueMicrotask(() => {
      inputRef.current?.focus();
    });
  }

  return (
    <div className={styles.searchContainer}>
      {/* Оверлей затемняет фон и закрывает панель по клику. */}
      <div className={isOpen ? styles.overlayOpen : styles.overlay} aria-hidden="true" onClick={close} />

      {/* Форма поиска (role="search" — семантика). */}
      <form className={styles.search} role="search" onSubmit={onSubmit}>
        <div className={styles.inputRow}>
          {/* input как combobox: связан с панелью через aria-controls */}
          <input
            ref={inputRef}
            role="combobox"
            className={styles.input}
            type="search"
            name="query"
            placeholder={placeholder}
            autoComplete="off"
            onFocus={open}
            onKeyDown={onKeyDown}
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-haspopup="listbox"
            value={query}
            onChange={onChange}
          />

          {query.trim().length > 0 && (
            <button type="button" className={styles.resetButton} aria-label="Очистить поиск" onClick={handleReset}>
              <ResetIcon className={styles.resetIcon} />
            </button>
          )}

          {/* submit кнопка запускает onSubmit */}
          <button className={styles.button} type="submit">
            Найти
          </button>
        </div>

        {/* Чипы: показываем только когда есть ввод и есть что подсказать */}
        {isOpen && query.trim().length > 0 && chipsToShow.length > 0 && (
          <div className={styles.chipsRow} aria-label="Быстрые подсказки">
            {chipsToShow.map((value) => (
              <button key={value} type="button" className={styles.chip} onClick={() => applyChip(value)}>
                {value}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Панель выпадающих результатов / популярных запросов */}
      <div
        className={isOpen ? styles.searchPanelOpen : styles.searchPanel}
        role="region"
        aria-label="Панель поиска"
        id={panelId}>
        <div className={styles.searchPanelContent}>
          {/* idle: ничего не введено -> популярные запросы */}
          {viewStatus === "idle" && (
            <div>
              <div className={styles.sectionTitle}>Популярные запросы</div>
              <ul className={styles.list}>
                {POPULAR_QUERIES.map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      className={styles.listButton}
                      onClick={() => {
                        setActiveIndex(-1); // Клавиатура: программный выбор запроса => сбрасываем выделение
                        runSearch(item);
                      }}>
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* loading: пользователь печатает -> показываем индикатор */}
          {viewStatus === "loading" && <div className={styles.empty}>Ищем…</div>}

          {/* success: показываем найденные товары */}
          {viewStatus === "success" && (
            <div>
              <div className={styles.sectionTitle}>Товары</div>
              <ul className={styles.productsList}>
                {products.map((product, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <li key={product.id}>
                      <button
                        type="button"
                        aria-current={isActive ? "true" : undefined}
                        className={`${styles.productButton} ${isActive ? styles.productButtonActive : ""}`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => runSearch(product.title)}>
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
                  );
                })}
              </ul>
            </div>
          )}

          {/* empty: результатов нет */}
          {viewStatus === "empty" && <div className={styles.empty}>Ничего не найдено</div>}
        </div>
      </div>
    </div>
  );
}
