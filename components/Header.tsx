import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import ShoppingCartIcon from './icons/ShoppingCartIcon';
import UserIcon from './icons/UserIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import HomeIcon from './icons/HomeIcon';
import { UserRole } from '../types';
import DashboardIcon from './icons/DashboardIcon';
import TruckIcon from './icons/TruckIcon';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const cartItemCount = getCartItemCount();

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 w-full shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-primary-500" dir="ltr">
              Otlob - Eltūr
            </Link>
          </div>

          {/* Navigation Links for larger screens */}
          <nav className="hidden md:flex md:space-i-8">
            <NavLink to="/" className={({ isActive }) => `text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-colors ${isActive ? 'text-primary-500 font-semibold' : ''}`}>
              الرئيسية
            </NavLink>
            {user?.role === UserRole.ADMIN && (
              <NavLink to="/admin" className={({ isActive }) => `text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-colors ${isActive ? 'text-primary-500 font-semibold' : ''}`}>
                لوحة التحكم
              </NavLink>
            )}
            {user?.role === UserRole.DELIVERY && (
              <NavLink to="/delivery" className={({ isActive }) => `text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-colors ${isActive ? 'text-primary-500 font-semibold' : ''}`}>
                طلبات التوصيل
              </NavLink>
            )}
            {user?.role === UserRole.RESTAURANT && (
                <NavLink to="/restaurant-dashboard" className={({ isActive }) => `text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-colors ${isActive ? 'text-primary-500 font-semibold' : ''}`}>
                    لوحة تحكم المطعم
                </NavLink>
            )}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-i-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>

            <Link to="/" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Go to homepage">
              <HomeIcon className="w-6 h-6" />
            </Link>

            {user?.role === UserRole.ADMIN && (
              <Link to="/admin" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Admin Dashboard">
                <DashboardIcon className="w-6 h-6" />
              </Link>
            )}
            {user?.role === UserRole.DELIVERY && (
              <Link to="/delivery" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Delivery Dashboard">
                <TruckIcon className="w-6 h-6" />
              </Link>
            )}
            {user?.role === UserRole.RESTAURANT && (
              <Link to="/restaurant-dashboard" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Restaurant Dashboard">
                <DashboardIcon className="w-6 h-6" />
              </Link>
            )}

            <Link to="/cart" className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ShoppingCartIcon className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            <div className="relative group">
               <Link to={user ? '#' : '/login'} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors block">
                 <UserIcon className="w-6 h-6" />
               </Link>
               {user && (
                 <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200">
                   <div className="px-4 py-2 text-sm text-slate-700 dark:text-slate-200 border-b dark:border-slate-700">
                     <p className="font-semibold">{user.name}</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                   </div>
                   {user.role === UserRole.CUSTOMER && (
                       <Link
                         to="/my-orders"
                         className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                       >
                         طلباتي
                       </Link>
                   )}
                   <button
                     onClick={logout}
                     className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                   >
                     تسجيل الخروج
                   </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
