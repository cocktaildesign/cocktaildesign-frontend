import { create } from "zustand";

export interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

// Загружаем корзину из localStorage при создании store
const loadCartFromStorage = (): CartItem[] => {
  try {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Ошибка при загрузке корзины:", error);
    return [];
  }
};

export const useCart = create<CartStore>((set) => ({
  items: loadCartFromStorage(), // ← загружаем при инициализации

  addItem: (product) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      let newItems;

      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + product.quantity } : item
        );
      } else {
        newItems = [...state.items, product];
      }

      localStorage.setItem("cart", JSON.stringify(newItems));
      return { items: newItems };
    }),

  removeItem: (id) =>
    set((state) => {
      const newItems = state.items.filter((item) => item.id !== id);
      localStorage.setItem("cart", JSON.stringify(newItems));
      return { items: newItems };
    }),

  updateQuantity: (id, quantity) =>
    set((state) => {
      const newItems = state.items.map((item) => (item.id === id ? { ...item, quantity } : item));
      localStorage.setItem("cart", JSON.stringify(newItems));
      return { items: newItems };
    }),

  clearCart: () => {
    localStorage.removeItem("cart");
    set({ items: [] });
  },
}));
