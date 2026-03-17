// src/app/api/cart-export/route.ts
import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";

// Тип одного товара — такой же как CartItem в store
type CartItemData = {
  id: string;
  name: string;
  price: number;
  slug: string;
  quantity: number;
  engraving: boolean;
};

const DARK_BLUE = "1A2C5B";
const LIGHT_GRAY = "F5F5F5";

function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const items: CartItemData[] = body.items ?? [];

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Корзина");

  // Ширина колонок
  ws.columns = [
    { key: "A", width: 56 },
    { key: "B", width: 33 },
    { key: "C", width: 15 },
    { key: "D", width: 23 },
    { key: "E", width: 5 },
    { key: "F", width: 5 },
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

  // Объединяем C1:F1 для примечания
  ws.mergeCells("C1:F1");
  const cellC1 = ws.getCell("C1");
  cellC1.value =
    "Цены действительны на момент выгрузки.\nАктуальные цены и сроки акций всегда можно узнать на нашем сайте или по телефону.";
  cellC1.font = { italic: true, size: 11, color: { argb: "FF555555" }, name: "Calibri" };
  cellC1.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  cellC1.border = {
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

  const headers = ["Наименование товара", "Цена за 1 шт., руб.", "Кол-во, шт.", "Стоимость, руб."];
  const headerCols = ["A", "B", "C", "D"];

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
    cellName.value = {
      text: item.engraving ? `${item.name} (+ Гравировка)` : item.name,
      hyperlink: `https://new.cocktaildesign.ru/catalog/product/${item.slug}`,
    };
    cellName.font = { size: 14, color: { argb: "FF" + DARK_BLUE }, underline: true, name: "Calibri" };
    cellName.alignment = { vertical: "middle", wrapText: true };
    cellName.border = {
      top: { style: "thin", color: { argb: "FFDDDDDD" } },
      bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
      left: { style: "thin", color: { argb: "FFDDDDDD" } },
      right: { style: "thin", color: { argb: "FFDDDDDD" } },
    };

    // Цена
    const cellPrice = ws.getCell(`B${rowNum}`);
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
    const cellQty = ws.getCell(`C${rowNum}`);
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
    const cellTotal = ws.getCell(`D${rowNum}`);
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

  const cellTotalQty = ws.getCell(`C${totalRowNum}`);
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

  const cellTotalPrice = ws.getCell(`D${totalRowNum}`);
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
}
