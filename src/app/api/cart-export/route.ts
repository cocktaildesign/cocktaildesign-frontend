import { NextRequest, NextResponse } from "next/server";
import { buildCartQuote, NO_QUOTE_DISCOUNTS, type QuotePricing } from "@/lib/cart/cartQuote";
import { createQuoteWorkbook } from "@/lib/cart/quoteXlsx";

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
  | "invalid_discount_data"
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
  discountExcluded: boolean;
};


// Лимиты под большой B2B/B2C интернет-магазин.
// Не ставим маленький лимит 100 товаров, потому что корзина может быть крупной.
const MAX_BODY_BYTES = 2_000_000; // 2 MB
const MAX_ITEMS = 1000;
const MAX_QUANTITY = 10_000;
const MAX_PRICE = 100_000_000;

const MAX_NAME_LENGTH = 200;
const MAX_SLUG_LENGTH = 150;
const MAX_CODE_LENGTH = 64;

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
    if (body.pricing !== undefined && typeof item.discountExcluded !== "boolean") {
      return { error: "invalid_discount_data" };
    }

    sanitizedItems.push({
      name,
      slug,
      code,
      price,
      quantity,
      engraving: typeof item.engraving === "boolean" ? item.engraving : false,
      discountExcluded: item.discountExcluded === true,
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

function parsePricing(body: unknown): QuotePricing | null {
  if (!isRecord(body)) return null;
  // Older open tabs send only items. Preserve that contract with no extra discount.
  if (body.pricing === undefined) return { ...NO_QUOTE_DISCOUNTS };
  const p = body.pricing;
  if (!isRecord(p) || typeof p.volumeDiscount !== "number" || typeof p.promoDiscount !== "number" ||
      !Number.isFinite(p.volumeDiscount) || !Number.isFinite(p.promoDiscount) ||
      p.volumeDiscount < 0 || p.promoDiscount < 0 ||
      !["", "fixed", "percent", "startup", "inventory"].includes(String(p.promoType)) ||
      typeof p.promoCode !== "string" || p.promoCode.length > 128 ||
      typeof p.bonusMessage !== "string" || p.bonusMessage.length > 2000) return null;
  return { volumeDiscount: p.volumeDiscount, promoDiscount: p.promoDiscount,
    promoType: p.promoType as QuotePricing["promoType"],
    promoCode: escapeXlsxFormula(p.promoCode), bonusMessage: escapeXlsxFormula(p.bonusMessage) };
}

export async function POST(request: NextRequest) {
  const parsedBody = await parseRequestBody(request);
  if (!parsedBody.ok) return createErrorResponse(parsedBody.error, parsedBody.status);
  const items = sanitizeCartItems(parsedBody.body);
  if (!Array.isArray(items)) return createErrorResponse(items.error);
  const pricing = parsePricing(parsedBody.body);
  if (!pricing) return createErrorResponse("invalid_discount_data");
  let quote;
  try {
    quote = buildCartQuote(items, pricing);
  } catch {
    return createErrorResponse("invalid_discount_data");
  }
  try {
    const workbook = await createQuoteWorkbook(quote);
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=cocktaildesign-cart.xlsx",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return createErrorResponse("export_failed", 500);
  }
}
