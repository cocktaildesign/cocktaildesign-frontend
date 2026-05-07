import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";

type CartExportErrorCode =
  | "unsupported_content_type"
  | "payload_too_large"
  | "invalid_json"
  | "invalid_payload"
  | "too_many_items"
  | "invalid_item_name"
  | "invalid_item_slug"
  | "invalid_item_code"
  | "invalid_item_price"
  | "invalid_item_quantity"
  | "export_failed";

// Данные товара после серверной проверки.
// Не используем весь объект из корзины напрямую.
type CartItemData = {
  name: string;
  price: number;
  slug: string;
  quantity: number;
  engraving: boolean;
  code: string | null;
};

const DARK_BLUE = "1A2C5B";
const LIGHT_GRAY = "F5F5F5";

// Лимиты под большой B2B/B2C интернет-магазин.
// Не ставим маленький лимит 100 товаров, потому что корзина может быть крупной.
const MAX_BODY_BYTES = 2_000_000; // 2 MB
const MAX_ITEMS = 1000;
const MAX_QUANTITY = 10_000;
const MAX_PRICE = 100_000_000;

const MAX_NAME_LENGTH = 200;
const MAX_SLUG_LENGTH = 150;
const MAX_CODE_LENGTH = 64;

function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}:${pad(date.getSeconds())}`;
}

function createErrorResponse(error: CartExportErrorCode, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

// Защита от XLSX/Excel formula injection.
// Если строка начинается с = + - @, Excel может воспринять её как формулу.
function escapeXlsxFormula(value: string): string {
  const trimmedValue = value.trim();

  if (/^[=+\-@]/.test(trimmedValue)) {
    return `'${trimmedValue}`;
  }

  return trimmedValue;
}

function validateRequiredString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue.length > maxLength) {
    return null;
  }

  return escapeXlsxFormula(trimmedValue);
}

function validateSlug(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue.length > MAX_SLUG_LENGTH) {
    return null;
  }

  return trimmedValue;
}

function validateOptionalCode(value: unknown): string | null | "invalid" {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    return "invalid";
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (trimmedValue.length > MAX_CODE_LENGTH) {
    return "invalid";
  }

  return escapeXlsxFormula(trimmedValue);
}

function validatePrice(value: unknown): number | null {
  if (typeof value !== "number") {
    return null;
  }

  if (!Number.isFinite(value) || value < 0 || value > MAX_PRICE) {
    return null;
  }

  return value;
}

function validateQuantity(value: unknown): number | null {
  if (!Number.isInteger(value)) {
    return null;
  }

  const quantity = value as number;

  if (quantity < 1 || quantity > MAX_QUANTITY) {
    return null;
  }

  return quantity;
}

function sanitizeCartItems(body: unknown): CartItemData[] | { error: CartExportErrorCode } {
  if (!isRecord(body)) {
    return { error: "invalid_payload" };
  }

  const { items } = body;

  if (!Array.isArray(items)) {
    return { error: "invalid_payload" };
  }

  if (items.length > MAX_ITEMS) {
    return { error: "too_many_items" };
  }

  const sanitizedItems: CartItemData[] = [];

  for (const item of items) {
    if (!isRecord(item)) {
      return { error: "invalid_payload" };
    }

    const name = validateRequiredString(item.name, MAX_NAME_LENGTH);
    if (!name) {
      return { error: "invalid_item_name" };
    }

    const slug = validateSlug(item.slug);
    if (!slug) {
      return { error: "invalid_item_slug" };
    }

    const code = validateOptionalCode(item.code);
    if (code === "invalid") {
      return { error: "invalid_item_code" };
    }

    const price = validatePrice(item.price);
    if (price === null) {
      return { error: "invalid_item_price" };
    }

    const quantity = validateQuantity(item.quantity);
    if (quantity === null) {
      return { error: "invalid_item_quantity" };
    }

    sanitizedItems.push({
      name,
      slug,
      code,
      price,
      quantity,
      engraving: typeof item.engraving === "boolean" ? item.engraving : false,
    });
  }

  return sanitizedItems;
}

type ParsedBodyResult =
  | {
      ok: true;
      body: unknown;
    }
  | {
      ok: false;
      error: CartExportErrorCode;
      status: number;
    };

async function parseRequestBody(request: NextRequest): Promise<ParsedBodyResult> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return { ok: false, error: "unsupported_content_type", status: 415 };
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const contentLengthNumber = Number(contentLength);

    if (Number.isFinite(contentLengthNumber) && contentLengthNumber > MAX_BODY_BYTES) {
      return { ok: false, error: "payload_too_large", status: 413 };
    }
  }

  let rawBody = "";

  try {
    rawBody = await request.text();
  } catch {
    return { ok: false, error: "invalid_payload", status: 400 };
  }

  if (rawBody.length > MAX_BODY_BYTES) {
    return { ok: false, error: "payload_too_large", status: 413 };
  }

  try {
    return { ok: true, body: JSON.parse(rawBody) as unknown };
  } catch {
    return { ok: false, error: "invalid_json", status: 400 };
  }
}

export async function POST(request: NextRequest) {
  const parsedBody = await parseRequestBody(request);

  if (!parsedBody.ok) {
    return createErrorResponse(parsedBody.error, parsedBody.status);
  }

  const sanitizedItems = sanitizeCartItems(parsedBody.body);

  if (!Array.isArray(sanitizedItems)) {
    return createErrorResponse(sanitizedItems.error);
  }

  const items = sanitizedItems;

  try {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Корзина");

    // Ширина колонок
    ws.columns = [
      { key: "A", width: 56 }, // Наименование
      { key: "B", width: 22 }, // Артикул
      { key: "C", width: 33 }, // Цена
      { key: "D", width: 15 }, // Кол-во
      { key: "E", width: 23 }, // Стоимость
      { key: "F", width: 5 },
      { key: "G", width: 5 },
    ];

    // ============================================================
    // Строка 1 — дата + примечание
    // ============================================================
    const row1 = ws.getRow(1);
    row1.height = 52;

    const cellA1 = ws.getCell("A1");
    cellA1.value = "Дата выгрузки";
    cellA1.font = { bold: true, size: 14, name: "Calibri" };
    cellA1.alignment = { vertical: "middle" };
    cellA1.border = {
      top: { style: "thin", color: { argb: "FF" + DARK_BLUE } },
      bottom: { style: "thin", color: { argb: "FF" + DARK_BLUE } },
      left: { style: "thin", color: { argb: "FF" + DARK_BLUE } },
      right: { style: "thin", color: { argb: "FFDDDDDD" } },
    };

    const cellB1 = ws.getCell("B1");
    cellB1.value = formatDate(new Date());
    cellB1.font = { size: 14, name: "Calibri" };
    cellB1.alignment = { horizontal: "center", vertical: "middle" };
    cellB1.border = {
      top: { style: "thin", color: { argb: "FF" + DARK_BLUE } },
      bottom: { style: "thin", color: { argb: "FF" + DARK_BLUE } },
      left: { style: "thin", color: { argb: "FFDDDDDD" } },
      right: { style: "thin", color: { argb: "FFDDDDDD" } },
    };

    const cellC1 = ws.getCell("C1");
    cellC1.border = {
      top: { style: "thin", color: { argb: "FF" + DARK_BLUE } },
      bottom: { style: "thin", color: { argb: "FF" + DARK_BLUE } },
      left: { style: "thin", color: { argb: "FFDDDDDD" } },
      right: { style: "thin", color: { argb: "FFDDDDDD" } },
    };

    // Объединяем D1:G1 для примечания
    ws.mergeCells("D1:G1");
    const cellD1 = ws.getCell("D1");
    cellD1.value =
      "Цены действительны на момент выгрузки.\nАктуальные цены и сроки акций всегда можно узнать на нашем сайте или по телефону.";
    cellD1.font = { italic: true, size: 11, color: { argb: "FF555555" }, name: "Calibri" };
    cellD1.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cellD1.border = {
      top: { style: "thin", color: { argb: "FF" + DARK_BLUE } },
      bottom: { style: "thin", color: { argb: "FF" + DARK_BLUE } },
      left: { style: "thin", color: { argb: "FFDDDDDD" } },
      right: { style: "thin", color: { argb: "FF" + DARK_BLUE } },
    };

    // ============================================================
    // Строка 2 — пустая
    // ============================================================
    ws.getRow(2).height = 24;

    // ============================================================
    // Строка 3 — сайт + email
    // ============================================================
    ws.getRow(3).height = 24;

    const cellA3 = ws.getCell("A3");
    cellA3.value = {
      text: "CocktailDesign.ru",
      hyperlink: "https://new.cocktaildesign.ru",
    };
    cellA3.font = { bold: true, size: 15, color: { argb: "FF" + DARK_BLUE }, underline: true, name: "Calibri" };
    cellA3.alignment = { vertical: "middle" };

    const cellB3 = ws.getCell("B3");
    cellB3.value = {
      text: "cocktaildesign@yandex.ru",
      hyperlink: "mailto:cocktaildesign@yandex.ru",
    };
    cellB3.font = { size: 14, color: { argb: "FF" + DARK_BLUE }, underline: true, name: "Calibri" };
    cellB3.alignment = { vertical: "middle" };

    // ============================================================
    // Строка 4 — телефон
    // ============================================================
    ws.getRow(4).height = 24;

    const cellA4 = ws.getCell("A4");
    cellA4.value = "Контактная информация:";
    cellA4.font = { bold: true, size: 14, name: "Calibri" };
    cellA4.alignment = { vertical: "middle" };

    const cellB4 = ws.getCell("B4");
    cellB4.value = "8 (995) 622-62-02";
    cellB4.font = { size: 14, name: "Calibri" };
    cellB4.alignment = { vertical: "middle" };

    // ============================================================
    // Строка 5 — пустая
    // ============================================================
    ws.getRow(5).height = 24;

    // ============================================================
    // Строка 6 — заголовки таблицы
    // ============================================================
    ws.getRow(6).height = 36;

    const headers = ["Наименование товара", "Артикул", "Цена за 1 шт., руб.", "Кол-во, шт.", "Стоимость, руб."];
    const headerCols = ["A", "B", "C", "D", "E"];

    for (let i = 0; i < headers.length; i++) {
      const cell = ws.getCell(`${headerCols[i]}6`);
      cell.value = headers[i];
      cell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" }, name: "Calibri" };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + DARK_BLUE } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "medium", color: { argb: "FF" + DARK_BLUE } },
        bottom: { style: "medium", color: { argb: "FF" + DARK_BLUE } },
        left: { style: "thin", color: { argb: "FFDDDDDD" } },
        right: { style: "thin", color: { argb: "FFDDDDDD" } },
      };
    }

    // ============================================================
    // Строки товаров
    // ============================================================
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNum = 7 + i;
      ws.getRow(rowNum).height = 48;

      // Название — ссылка
      const cellName = ws.getCell(`A${rowNum}`);
      const itemName = item.engraving ? `${item.name} (+ Гравировка)` : item.name;

      cellName.value = {
        text: itemName,
        hyperlink: `https://new.cocktaildesign.ru/catalog/product/${encodeURIComponent(item.slug)}`,
      };
      cellName.font = { size: 14, color: { argb: "FF" + DARK_BLUE }, underline: true, name: "Calibri" };
      cellName.alignment = { vertical: "middle", wrapText: true };
      cellName.border = {
        top: { style: "thin", color: { argb: "FFDDDDDD" } },
        bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
        left: { style: "thin", color: { argb: "FFDDDDDD" } },
        right: { style: "thin", color: { argb: "FFDDDDDD" } },
      };

      // Артикул
      const cellCode = ws.getCell(`B${rowNum}`);
      cellCode.value = item.code ?? "—";
      cellCode.font = { size: 13, name: "Calibri" };
      cellCode.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cellCode.border = {
        top: { style: "thin", color: { argb: "FFDDDDDD" } },
        bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
        left: { style: "thin", color: { argb: "FFDDDDDD" } },
        right: { style: "thin", color: { argb: "FFDDDDDD" } },
      };

      // Цена
      const cellPrice = ws.getCell(`C${rowNum}`);
      cellPrice.value = item.price;
      cellPrice.font = { size: 14, name: "Calibri" };
      cellPrice.alignment = { horizontal: "right", vertical: "middle" };
      cellPrice.border = {
        top: { style: "thin", color: { argb: "FFDDDDDD" } },
        bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
        left: { style: "thin", color: { argb: "FFDDDDDD" } },
        right: { style: "thin", color: { argb: "FFDDDDDD" } },
      };

      // Количество
      const cellQty = ws.getCell(`D${rowNum}`);
      cellQty.value = item.quantity;
      cellQty.font = { size: 14, name: "Calibri" };
      cellQty.alignment = { horizontal: "center", vertical: "middle" };
      cellQty.border = {
        top: { style: "thin", color: { argb: "FFDDDDDD" } },
        bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
        left: { style: "thin", color: { argb: "FFDDDDDD" } },
        right: { style: "thin", color: { argb: "FFDDDDDD" } },
      };

      // Стоимость
      const cellTotal = ws.getCell(`E${rowNum}`);
      cellTotal.value = item.price * item.quantity;
      cellTotal.font = { size: 14, name: "Calibri" };
      cellTotal.alignment = { horizontal: "right", vertical: "middle" };
      cellTotal.border = {
        top: { style: "thin", color: { argb: "FFDDDDDD" } },
        bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
        left: { style: "thin", color: { argb: "FFDDDDDD" } },
        right: { style: "thin", color: { argb: "FFDDDDDD" } },
      };
    }

    // ============================================================
    // Пустая строка перед итогом
    // ============================================================
    const emptyRowNum = 7 + items.length;
    ws.getRow(emptyRowNum).height = 24;

    // ============================================================
    // Итоговая строка
    // ============================================================
    const totalRowNum = 7 + items.length + 1;
    ws.getRow(totalRowNum).height = 32;

    let totalPrice = 0;
    let totalQuantity = 0;

    for (const item of items) {
      totalPrice += item.price * item.quantity;
      totalQuantity += item.quantity;
    }

    const cellTotalLabel = ws.getCell(`A${totalRowNum}`);
    cellTotalLabel.value = "Итого";
    cellTotalLabel.font = { bold: true, size: 15, name: "Calibri" };
    cellTotalLabel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + LIGHT_GRAY } };
    cellTotalLabel.alignment = { vertical: "middle" };
    cellTotalLabel.border = {
      top: { style: "medium", color: { argb: "FF" + DARK_BLUE } },
      bottom: { style: "medium", color: { argb: "FF" + DARK_BLUE } },
      left: { style: "thin", color: { argb: "FFDDDDDD" } },
      right: { style: "thin", color: { argb: "FFDDDDDD" } },
    };

    const cellTotalB = ws.getCell(`B${totalRowNum}`);
    cellTotalB.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + LIGHT_GRAY } };
    cellTotalB.border = {
      top: { style: "medium", color: { argb: "FF" + DARK_BLUE } },
      bottom: { style: "medium", color: { argb: "FF" + DARK_BLUE } },
      left: { style: "thin", color: { argb: "FFDDDDDD" } },
      right: { style: "thin", color: { argb: "FFDDDDDD" } },
    };

    const cellTotalC = ws.getCell(`C${totalRowNum}`);
    cellTotalC.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + LIGHT_GRAY } };
    cellTotalC.border = {
      top: { style: "medium", color: { argb: "FF" + DARK_BLUE } },
      bottom: { style: "medium", color: { argb: "FF" + DARK_BLUE } },
      left: { style: "thin", color: { argb: "FFDDDDDD" } },
      right: { style: "thin", color: { argb: "FFDDDDDD" } },
    };

    const cellTotalQty = ws.getCell(`D${totalRowNum}`);
    cellTotalQty.value = totalQuantity;
    cellTotalQty.font = { bold: true, size: 15, name: "Calibri" };
    cellTotalQty.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + LIGHT_GRAY } };
    cellTotalQty.alignment = { horizontal: "center", vertical: "middle" };
    cellTotalQty.border = {
      top: { style: "medium", color: { argb: "FF" + DARK_BLUE } },
      bottom: { style: "medium", color: { argb: "FF" + DARK_BLUE } },
      left: { style: "thin", color: { argb: "FFDDDDDD" } },
      right: { style: "thin", color: { argb: "FFDDDDDD" } },
    };

    const cellTotalPrice = ws.getCell(`E${totalRowNum}`);
    cellTotalPrice.value = totalPrice;
    cellTotalPrice.font = { bold: true, size: 15, name: "Calibri" };
    cellTotalPrice.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + LIGHT_GRAY } };
    cellTotalPrice.alignment = { horizontal: "right", vertical: "middle" };
    cellTotalPrice.border = {
      top: { style: "medium", color: { argb: "FF" + DARK_BLUE } },
      bottom: { style: "medium", color: { argb: "FF" + DARK_BLUE } },
      left: { style: "thin", color: { argb: "FFDDDDDD" } },
      right: { style: "thin", color: { argb: "FFDDDDDD" } },
    };

    // Генерируем буфер и отдаём файл
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=cocktaildesign-cart.xlsx",
      },
    });
  } catch {
    return createErrorResponse("export_failed", 500);
  }
}
