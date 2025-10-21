import React from 'react';
import { supabase } from '../utils/supabaseClient';
import { useTheme } from '../contexts/ThemeContext';

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    description?: string;
    image_url?: string;
  };
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const { theme } = useTheme();
  let imageUrl = 'https://source.unsplash.com/100x100/?food'; // Default fallback

  if (category.image_url) {
    imageUrl = supabase.storage.from('category-images').getPublicUrl(category.image_url).data.publicUrl;
  }

  return (
    <div
      className="flex items-center rounded-lg p-4 cursor-pointer transition-transform transform hover:scale-105 bg-white shadow dark:bg-gray-800"
      onClick={onClick}
      dir="rtl" // Set direction to right-to-left
    >
      <div className="flex-shrink-0">
        <img className="h-16 w-16 rounded-full border-2 border-gray-200 dark:border-black" src={imageUrl} alt={category.name} />
      </div>
      <div className="flex-grow mr-6"> {/* Changed ml-4 to mr-6 for RTL */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white text-right">{category.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-right">{category.description || `اعثر على أفضل ${category.name}`}</p>
      </div>
      <div className="flex-shrink-0">
        <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /> {/* Left-pointing chevron */}
        </svg>
      </div>
    </div>
  );
};

export default CategoryCard;
