import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import MenuItem from '../components/MenuItem';
import StarIcon from '../components/icons/StarIcon';
import { Vendor } from '../types';

const VendorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchVendorWithMenu } = useData();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadVendor = async () => {
        setLoading(true);
        const vendorData = await fetchVendorWithMenu(id);
        setVendor(vendorData);
        setLoading(false);
      };
      loadVendor();
    }
  }, [id, fetchVendorWithMenu]);

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold text-red-500">Vendor not found!</h1>
      </div>
    );
  }

  return (
    <div>
      {/* Vendor Header */}
      <div className="relative h-64 md:h-80">
        <img
          src={vendor.imageUrl}
          alt={`Cover for ${vendor.name}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-end">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">{vendor.name}</h1>
            <p className="text-lg text-slate-200 mt-2">{vendor.cuisine}</p>
            <div className="mt-4 inline-flex items-center gap-4 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-semibold w-fit">
                <div className="flex items-center gap-1.5">
                    <StarIcon className="w-5 h-5 text-yellow-400"/>
                    <span>{vendor.rating}</span>
                </div>
                <div className="h-4 w-px bg-white/50"></div> {/* Vertical separator */}
                <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{vendor.deliveryTime} دقيقة</span>
                </div>
            </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">القائمة</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vendor.menu.map(dish => (
            <MenuItem key={dish.id} dish={dish} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorPage;