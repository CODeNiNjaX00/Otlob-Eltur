import React from 'react';
import { CartItem as CartItemType } from '../types';
import { useCart } from '../contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { addToCart, decrementItem, removeFromCart } = useCart();

  return (
    <div className="flex items-start justify-between p-4">
      <div className="flex items-start">
        <img src={item.dish.imageUrl} alt={item.dish.name} className="w-20 h-20 rounded-lg object-cover" />
        <div className="mr-4">
          <h4 className="font-semibold text-slate-800 dark:text-slate-100">{item.dish.name}</h4>
          <p className="text-slate-600 dark:text-slate-400">{item.dish.price} جنيه</p>
          {item.notes && (
            <p className="mt-1 text-sm text-primary-600 dark:text-primary-500 bg-primary-50 dark:bg-slate-700 px-2 py-1 rounded">
              ملاحظات: {item.notes}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-i-3">
        <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg">
          <button onClick={() => addToCart(item.dish, item.notes)} className="px-3 py-1 text-lg font-bold text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-md">+</button>
          <span className="px-4 py-1 font-bold">{item.quantity}</span>
          <button onClick={() => decrementItem(item.id)} className="px-3 py-1 text-lg font-bold text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-l-md">-</button>
        </div>
        <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItem;