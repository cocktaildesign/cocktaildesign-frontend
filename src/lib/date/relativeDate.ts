// src/lib/date/relativeDate.ts

// Форма слова для русского языка: 1 день, 2 дня, 5 дней
function pluralRu(count: number, one: string, few: string, many: string): string {
  // Берём последние две цифры, чтобы корректно обработать 11–14
  const mod100 = count % 100;

  // 11–14 всегда "many": 11 дней, 12 дней...
  if (mod100 >= 11 && mod100 <= 14) {
    return many;
  }

  // Берём последнюю цифру
  const mod10 = count % 10;

  // 1 → "one": 1 день
  if (mod10 === 1) {
    return one;
  }

  // 2–4 → "few": 2 дня, 3 дня, 4 дня
  if (mod10 >= 2 && mod10 <= 4) {
    return few;
  }

  // 0, 5–9 → "many": 5 дней, 10 дней
  return many;
}

// Парсим YYYY-MM-DD как дату в UTC, чтобы не ловить смещения часового пояса
function parseIsoDateToUtc(isoDate: string): Date {
  // Превращаем "2026-01-10" в "2026-01-10T00:00:00.000Z"
  return new Date(`${isoDate}T00:00:00.000Z`);
}

const MS_IN_DAY = 24 * 60 * 60 * 1000;

export function formatRelativeFromIsoDate(isoDate: string, now: Date = new Date()): string {
  const from = parseIsoDateToUtc(isoDate);
  const days = Math.floor((now.getTime() - from.getTime()) / MS_IN_DAY);

  if (days <= 0) {
    return "сегодня";
  }

  if (days < 28) {
    const word = pluralRu(days, "день", "дня", "дней");
    return `${days} ${word} назад`;
  }

  if (days < 365) {
    const months = Math.max(1, Math.floor(days / 30));
    const word = pluralRu(months, "месяц", "месяца", "месяцев");
    return `${months} ${word} назад`;
  }

  const years = Math.floor(days / 365);
  const word = pluralRu(years, "год", "года", "лет");
  return `${years} ${word} назад`;
}
