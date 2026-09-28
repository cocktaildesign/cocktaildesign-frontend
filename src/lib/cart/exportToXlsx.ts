// src/lib/cart/exportToXlsx.ts
import type { CartItem } from "@/lib/cart/cartStore";
import type { QuotePricing } from "./cartQuote";

export async function exportCartToXlsx(items: CartItem[], pricing: QuotePricing): Promise<void> {
  // Отправляем данные корзины на сервер
  const response = await fetch("/api/cart-export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, pricing }),
  });

  if (!response.ok) {
    throw new Error("quote_export_failed");
  }

  // Получаем файл и скачиваем
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  // Создаём ссылку и кликаем — браузер скачает файл
  const link = document.createElement("a");
  link.href = url;
  link.download = "cocktaildesign-cart.xlsx";
  link.click();

  // Освобождаем память
  URL.revokeObjectURL(url);
}
