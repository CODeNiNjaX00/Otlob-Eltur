

import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { CartItem, Dish } from '../types';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { dish: Dish; notes?: string } }
  | { type: 'REMOVE_ITEM'; payload: { cartItemId: string } }
  | { type: 'DECREMENT_ITEM'; payload: { cartItemId: string } }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { dish, notes } = action.payload;
      const existingItem = state.items.find(
        item => item.dish.id === dish.id && item.notes === notes
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      
      const newItem: CartItem = {
        id: `${dish.id}-${notes || ''}-${Date.now()}`,
        dish,
        quantity: 1,
        notes,
      };
      return {
        ...state,
        items: [...state.items, newItem],
      };
    }
    case 'DECREMENT_ITEM': {
        const { cartItemId } = action.payload;
        const existingItem = state.items.find(item => item.id === cartItemId);
        if (existingItem && existingItem.quantity > 1) {
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === cartItemId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
            }
        }
        return {
            ...state,
            items: state.items.filter(item => item.id !== cartItemId)
        }
    }
    case 'REMOVE_ITEM': {
      const { cartItemId } = action.payload;
      return {
        ...state,
        items: state.items.filter(item => item.id !== cartItemId),
      };
    }
    case 'CLEAR_CART':
      return { items: [] };
    default:
      return state;
  }
};

interface CartContextType {
  cartState: CartState;
  addToCart: (dish: Dish, notes?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  decrementItem: (cartItemId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartState, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = (dish: Dish, notes?: string) => dispatch({ type: 'ADD_ITEM', payload: { dish, notes } });
  const removeFromCart = (cartItemId: string) => dispatch({ type: 'REMOVE_ITEM', payload: { cartItemId } });
  const decrementItem = (cartItemId: string) => dispatch({ type: 'DECREMENT_ITEM', payload: { cartItemId } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const getCartTotal = () => {
    return cartState.items.reduce((total, item) => total + item.dish.price * item.quantity, 0);
  };
  
  const getCartItemCount = () => {
    return cartState.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cartState, addToCart, removeFromCart, decrementItem, clearCart, getCartTotal, getCartItemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};