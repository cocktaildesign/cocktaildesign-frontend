import ExcelJS from "exceljs";
import { ENGRAVING_PRICE_NOTE } from "./engraving";
import { type CartQuote, quoteSummaryRows, QUOTE_PRICE_NOTE, QUOTE_ROUNDING_NOTE } from "./cartQuote";

const BLUE = "FF1A2C5B";
const GRAY = "FFF3F5F8";
const MONEY = '#,##0.00';

function safeText(value: string): string {
  return /^[=+\-@]/.test(value.trim()) ? "'" + value.trim() : value;
}

export async function createQuoteWorkbook(quote: CartQuote): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Cocktail Design";
  const ws = workbook.addWorksheet("Коммерческое предложение", {
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0,
      margins: { left: 0.25, right: 0.25, top: 0.4, bottom: 0.4, header: 0.15, footer: 0.15 } },
    views: [{ state: "frozen", ySplit: 6, showGridLines: false }],
  });
  ws.columns = [46, 19, 19, 18, 20, 10, 22].map(width => ({ width }));
  ws.mergeCells("A1:G1");
  ws.getCell("A1").value = "Коммерческое предложение";
  ws.getCell("A1").font = { name: "Calibri", size: 20, bold: true, color: { argb: BLUE } };
  ws.getRow(1).height = 34;
  ws.mergeCells("A2:C2");
  ws.getCell("A2").value = { text: "Cocktail Design · cocktaildesign.ru", hyperlink: "https://new.cocktaildesign.ru" };
  ws.getCell("A2").font = { name: "Calibri", size: 12, color: { argb: BLUE }, underline: true };
  ws.mergeCells("E2:G2");
  ws.getCell("E2").value = `Дата: ${new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow" }).format(new Date())}`;
  ws.getCell("E2").alignment = { horizontal: "right" };
  ws.mergeCells("A3:G3");
  ws.getCell("A3").value = "8 (995) 622-62-02    ·    cocktaildesign@yandex.ru";
  ws.getRow(3).height = 22;
  ws.mergeCells("A4:G4");
  ws.getCell("A4").value = QUOTE_PRICE_NOTE;
  ws.getCell("A4").font = { name: "Calibri", size: 10, color: { argb: "FF555555" } };
  ws.getCell("A4").alignment = { wrapText: true, vertical: "middle" };
  ws.getRow(4).height = 28;
  ws.getRow(5).height = 10;

  const headers = ["Наименование товара", "Артикул", "Цена на сайте за 1 шт., ₽", "Скидка за 1 шт., ₽",
    "Цена за 1 шт. со скидкой, ₽", "Кол-во, шт.", "Стоимость со скидкой, ₽"];
  const header = ws.getRow(6);
  header.values = headers;
  header.height = 44;
  header.eachCell(cell => {
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BLUE } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  });
  quote.rows.forEach((item, index) => {
    const row = ws.getRow(7 + index);
    const name = safeText(item.name + (item.engraving ? " (Гравировка — стоимость отдельно)" : ""));
    row.values = [{ text: name, hyperlink: `https://new.cocktaildesign.ru/catalog/product/${encodeURIComponent(item.slug)}` },
      safeText(item.code ?? "—"), item.unitCents / 100, item.unitDiscountCents / 100,
      item.unitFinalCents / 100, item.quantity, item.finalCents / 100];
    const nameLines = name.split("\n").reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / 43)), 0);
    row.height = Math.max(36, nameLines * 16 + 10);
    row.eachCell((cell, column) => {
      cell.font = { name: "Calibri", size: 11, color: { argb: column === 1 ? BLUE : "FF20252E" }, underline: column === 1 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: index % 2 ? GRAY : "FFFFFFFF" } };
      cell.alignment = { horizontal: column < 3 ? "left" : column === 6 ? "center" : "right", vertical: "middle", wrapText: column < 3 };
      cell.border = { bottom: { style: "hair", color: { argb: "FFD9DFE8" } } };
      if ([3, 4, 5, 7].includes(column)) cell.numFmt = item.roundedUnit && [4, 5].includes(column) ? '"≈ "' + MONEY : MONEY;
    });
  });
  let rowIndex = 8 + quote.rows.length;
  for (const summary of quoteSummaryRows(quote)) {
    ws.mergeCells(`C${rowIndex}:F${rowIndex}`);
    ws.getCell(`C${rowIndex}`).value = safeText(summary.label);
    ws.getCell(`C${rowIndex}`).alignment = { horizontal: "right", vertical: "middle", wrapText: true };
    ws.getCell(`G${rowIndex}`).value = summary.cents / 100;
    ws.getCell(`G${rowIndex}`).numFmt = MONEY;
    ws.getRow(rowIndex).height = 24;
    rowIndex++;
  }
  ws.mergeCells(`A${rowIndex}:E${rowIndex}`);
  ws.getCell(`A${rowIndex}`).value = "Итого к оплате";
  ws.getCell(`F${rowIndex}`).value = quote.totalQuantity;
  ws.getCell(`G${rowIndex}`).value = quote.finalCents / 100;
  ws.getCell(`G${rowIndex}`).numFmt = MONEY;
  const finalRow = ws.getRow(rowIndex++);
  finalRow.height = 32;
  finalRow.eachCell(cell => {
    cell.font = { name: "Calibri", size: 13, bold: true, color: { argb: BLUE } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GRAY } };
    cell.alignment = { vertical: "middle", horizontal: cell.col === "A" ? "left" : "right" };
    cell.border = { top: { style: "thin", color: { argb: BLUE } } };
  });
  const notes = [
    ...(quote.rows.some(item => item.engraving) ? [ENGRAVING_PRICE_NOTE] : []),
    ...(quote.hasRoundedUnits ? [QUOTE_ROUNDING_NOTE] : []),
    ...(quote.fixedCents > 0 ? ["Денежный промокод вычтен из общей суммы заказа после скидок по товарам, включая уценку."] : []),
    ...(["inventory", "startup"].includes(quote.pricing.promoType) && quote.pricing.bonusMessage ? [quote.pricing.bonusMessage] : []),
    "Цены и скидки действительны на момент выгрузки. Актуальные условия можно уточнить на сайте или по телефону.",
  ];
  for (const note of notes) {
    rowIndex++;
    ws.mergeCells(`A${rowIndex}:G${rowIndex}`);
    const cell = ws.getCell(`A${rowIndex}`);
    cell.value = safeText(note);
    cell.font = { name: "Calibri", size: 10, color: { argb: "FF555555" } };
    cell.alignment = { wrapText: true, vertical: "middle" };
    ws.getRow(rowIndex).height = Math.max(28, note.split("\n").reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / 155)), 0) * 14 + 6);
  }
  ws.pageSetup.printArea = `A1:G${rowIndex}`;
  ws.pageSetup.printTitlesRow = "6:6";
  ws.headerFooter.oddFooter = "&LCocktail Design&RСтраница &P из &N";
  return workbook;
}
