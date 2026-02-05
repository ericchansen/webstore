"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  isLoading: boolean;
  addItem: (item: Omit<CartItem, "id" | "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "webstore-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      console.error("Failed to load cart from localStorage");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage when items change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch {
        console.error("Failed to save cart to localStorage");
      }
    }
  }, [items, isLoading]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const addItem = useCallback(
    (newItem: Omit<CartItem, "id" | "quantity">, quantity: number = 1) => {
      setItems((current) => {
        const existingIndex = current.findIndex(
          (item) => item.productId === newItem.productId
        );

        if (existingIndex >= 0) {
          const updated = [...current];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        }

        return [
          ...current,
          {
            ...newItem,
            id: crypto.randomUUID(),
            quantity,
          },
        ];
      });
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId)
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      setItems((current) =>
        current.filter((item) => item.productId !== productId)
      );
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isOpen,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
