import React from 'react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../types';
import StarIcon from './icons/StarIcon';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="block overflow-hidden rounded-xl shadow-lg hover:shadow-2xl focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-300 bg-white dark:bg-slate-800 group">
      <div className="relative">
        <img
          src={restaurant.imageUrl}
          alt={`مطعم ${restaurant.name}`}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {restaurant.deliveryTime} دقيقة
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{restaurant.name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{restaurant.cuisine}</p>
        <div className="flex items-center mt-3">
          <StarIcon className="w-5 h-5 text-yellow-400 ms-1"/>
          <span className="text-slate-700 dark:text-slate-300 font-semibold">{restaurant.rating}</span>
          <span className="text-slate-500 dark:text-slate-400 text-sm mr-1">(تقييم)</span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;