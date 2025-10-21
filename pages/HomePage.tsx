import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import CategoryCard from '../components/CategoryCard';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { dataState } = useData();
  const { categories } = dataState;
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/category/${categoryName}`);
  };

  const trimmedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredCategories = categories.filter(category =>
    trimmedSearchTerm === '' ? true : // Show all categories if search is empty
    category.name.toLowerCase().includes(trimmedSearchTerm)
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-primary-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 text-center py-20 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-4">
          أسرع توصيل في <span className="text-primary-500">طور سيناء</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          اطلب من مطاعمك المفضلة أو من المحلات , بقالة، صيدلية، مخبز وغيرها  واستمتع بتوصيل سريع وآمن لطلباتك.
        </p>
        <div className="mt-8 max-w-xl mx-auto">
          <form className="relative" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="ابحث عن قسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 text-lg rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
              aria-label="ابحث عن قسم"
            />
            <button 
              type="submit"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary-600 transition-colors"
            >
              بحث
            </button>
          </form>
        </div>
      </div>

      {/* Categories List */}
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white text-center">
          الأقسام المتاحة
        </h2>
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCategories.map(category => (
              <CategoryCard key={category.id} category={category} onClick={() => handleCategoryClick(category.name)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-2xl font-semibold text-slate-600 dark:text-slate-300">
              عفواً، لم يتم العثور على أقسام.
            </p>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              حاول البحث بكلمات مختلفة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
