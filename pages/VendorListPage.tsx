import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import VendorCard from '../components/VendorCard';
import { Vendor } from '../types';

const VendorListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { categoryName } = useParams<{ categoryName: string }>();
  const { dataState } = useData();
  const { vendors, categories } = dataState;

  const selectedCategory = useMemo(() => 
    categories.find(c => c.name === categoryName)
  , [categories, categoryName]);

  const filteredVendors = useMemo(() => {
    if (!selectedCategory) return [];
    
    const vendorsInCategory = vendors.filter(vendor => vendor.category_id === selectedCategory.id);
    
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();
    if (trimmedSearchTerm === '') return vendorsInCategory;

    return vendorsInCategory.filter(vendor =>
      vendor.name.toLowerCase().includes(trimmedSearchTerm) ||
      vendor.cuisine.toLowerCase().includes(trimmedSearchTerm)
    );
  }, [vendors, selectedCategory, searchTerm]);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-2 text-center">
          {categoryName}
        </h1>
        <p className="text-center text-slate-600 dark:text-slate-300 mb-8">تصفح المتاح في هذا القسم</p>

        <div className="mt-8 mb-12 max-w-xl mx-auto">
          <form className="relative" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder={`ابحث في قسم ${categoryName}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 text-lg rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
              aria-label={`ابحث في قسم ${categoryName}`}
            />
            <button 
              type="submit"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary-500 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary-600 transition-colors"
            >
              بحث
            </button>
          </form>
        </div>

        {filteredVendors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredVendors.map(vendor => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-2xl font-semibold text-slate-600 dark:text-slate-300">
              عفواً، لا توجد متاجر متاحة في هذا القسم حالياً.
            </p>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              تحقق مرة أخرى قريباً!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorListPage;
