"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { Book, CartItem } from "@/types";

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD_TO_CART"; book: Book }
  | { type: "REMOVE_FROM_CART"; bookId: string }
  | { type: "INCREMENT"; bookId: string }
  | { type: "DECREMENT"; bookId: string }
  | { type: "CLEAR" };

interface CartContextType {
  items: CartItem[];
  addToCart: (book: Book) => void;
  removeFromCart: (bookId: string) => void;
  incrementQty: (bookId: string) => void;
  decrementQty: (bookId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existing = state.items.find(
        (item) => item.book.id === action.book.id
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.book.id === action.book.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { items: [...state.items, { book: action.book, quantity: 1 }] };
    }
    case "REMOVE_FROM_CART":
      return {
        items: state.items.filter((item) => item.book.id !== action.bookId),
      };
    case "INCREMENT":
      return {
        items: state.items.map((item) =>
          item.book.id === action.bookId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
    case "DECREMENT": {
      const item = state.items.find((i) => i.book.id === action.bookId);
      if (item && item.quantity <= 1) {
        return {
          items: state.items.filter((i) => i.book.id !== action.bookId),
        };
      }
      return {
        items: state.items.map((i) =>
          i.book.id === action.bookId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        ),
      };
    }
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = (book: Book) => dispatch({ type: "ADD_TO_CART", book });
  const removeFromCart = (bookId: string) =>
    dispatch({ type: "REMOVE_FROM_CART", bookId });
  const incrementQty = (bookId: string) =>
    dispatch({ type: "INCREMENT", bookId });
  const decrementQty = (bookId: string) =>
    dispatch({ type: "DECREMENT", bookId });
  const clearCart = () => dispatch({ type: "CLEAR" });

  const getCartTotal = () =>
    state.items.reduce(
      (total, item) => total + item.book.price * item.quantity,
      0
    );

  const getCartCount = () =>
    state.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addToCart,
        removeFromCart,
        incrementQty,
        decrementQty,
        clearCart,
        getCartTotal,
        getCartCount,
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
