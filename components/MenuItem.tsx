import React, { useState } from 'react';
import { Dish } from '../types';
import { useCart } from '../contexts/CartContext';

interface MenuItemProps {
  dish: Dish;
}

const MenuItem: React.FC<MenuItemProps> = ({ dish }) => {
  const { addToCart } = useCart();
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const handleAddToCart = () => {
    addToCart(dish, notes || undefined);
    setNotes('');
    setShowNotes(false);
  };

  return (
    <div className="flex flex-col p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between w-full">
        <div className="flex-grow mr-4">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{dish.name}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{dish.description}</p>
          <p className="text-md font-bold text-primary-600 dark:text-primary-500 mt-2">{dish.price} جنيه</p>
        </div>
        <div className="flex-shrink-0">
          <img src={dish.imageUrl || 'https://via.placeholder.com/150'} alt={dish.name} className="w-24 h-24 rounded-lg object-cover" />
        </div>
      </div>
      
      <div className="mt-3">
        {showNotes && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أضف ملاحظات (مثال: بدون بصل، حار زيادة...)"
            className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition dark:bg-slate-700 mb-2"
            rows={2}
          />
        )}
        <div className="flex items-center gap-2">
           <button
            onClick={handleAddToCart}
            className="flex-grow px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-200"
          >
            أضف للسلة
          </button>
          <button
            onClick={() => setShowNotes(!showNotes)}
            title="إضافة ملاحظات"
            className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;