/**
 * types/index.ts
 * Все типы приложения в одном месте
 */

// ==================== CART ====================
export interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

// ==================== PRODUCT ====================
export interface Product {
  id: number;
  title: string;
  price: number;
  category_id: number;
  category: string;
  description: string;
  image: string;
  is_new?: boolean;
  is_on_sale?: boolean;
  discount_price?: number | null;
  discount_percent?: number;
  rating?: number;
  reviews?: number;
  in_stock?: boolean;
  sku?: string;
}

// ==================== CATEGORY ====================
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string; // Делаем опциональным для подкатегорий
  parent_id: number | null;
  level: number;
  children?: Category[];
}

export interface CategoriesResponse {
  data: Category[];
  status: string;
  total: number;
}
