import React, { useState, FormEvent, useEffect } from 'react';
import { Vendor, Dish } from '../types';
import { useData } from '../contexts/DataContext';
import { Modal, DishFormModal } from '../pages/AdminDashboard';

// --- Helper Icons ---
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
);
const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const VendorMenuManagement: React.FC<{ vendor: Vendor, onBack?: () => void }> = ({ vendor, onBack }) => {
    const [isDishModalOpen, setIsDishModalOpen] = useState(false);
    const [editingDish, setEditingDish] = useState<Dish | null>(null);
    const { addDish, updateDish, deleteDish } = useData();

    const openModalForNew = () => { setEditingDish(null); setIsDishModalOpen(true); };
    const openModalForEdit = (dish: Dish) => { setEditingDish(dish); setIsDishModalOpen(true); };
    
    const handleSaveDish = async (dishData: Omit<Dish, 'id'>) => {
        try {
            if (editingDish) {
                await updateDish({ ...editingDish, ...dishData });
            } else {
                await addDish(dishData, vendor.id);
            }
            setIsDishModalOpen(false);
        } catch (error) {
            console.error("Failed to save dish:", error);
            // You might want to show an error message to the user here
        }
    };

    const handleDeleteDish = async (dishId: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الطبق؟')) {
            try {
                await deleteDish(dishId);
            } catch (error) {
                console.error("Failed to delete dish:", error);
            }
        }
    };
    
    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <div className="flex flex-wrap justify-between items-center p-4 sm:p-6 gap-3 border-b dark:border-slate-700">
                <div>
                   {onBack && (
                       <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-500 mb-2">
                           <ArrowRightIcon className="w-4 h-4" />
                           العودة للمطاعم
                       </button>
                   )}
                   <h2 className="text-xl font-bold text-slate-800 dark:text-white">إدارة منيو: {vendor.name}</h2>
               </div>
               <button onClick={openModalForNew} className="btn-primary-small flex items-center gap-2">
                   <PlusIcon className="w-5 h-5" />
                   إضافة طبق
               </button>
           </div>
            <div className="space-y-4 p-4 sm:p-0 sm:pb-4">
                <div className="hidden sm:grid grid-cols-4 gap-4 px-6 pb-2">
                    <div className="th-responsive col-span-2">الطبق</div><div className="th-responsive">السعر</div><div className="th-responsive text-left">الإجراءات</div>
                </div>
                {vendor.menu.map(dish => (
                    <div key={dish.id} className="grid grid-cols-3 sm:grid-cols-4 gap-4 items-start bg-white dark:bg-slate-800 sm:hover:bg-slate-50 dark:sm:hover:bg-slate-700/50 p-4 sm:px-6 rounded-lg shadow sm:shadow-none sm:rounded-none">
                        <div className="col-span-3 sm:col-span-2">
                            <h4 className="font-bold text-slate-800 dark:text-white">{dish.name}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{dish.description}</p>
                        </div>
                        <div className="text-sm self-center"><span className="sm:hidden text-slate-500">السعر: </span>{dish.price} جنيه</div>
                        <div className="col-span-3 sm:col-span-1 flex justify-start sm:justify-end items-center gap-3 mt-2 sm:mt-0 self-center">
                            <button onClick={() => openModalForEdit(dish)} className="text-slate-500 hover:text-blue-600 p-1"><EditIcon className="w-5 h-5"/></button>
                            <button onClick={() => handleDeleteDish(dish.id)} className="text-slate-500 hover:text-red-600 p-1"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
           </div>
           <DishFormModal isOpen={isDishModalOpen} onClose={() => setIsDishModalOpen(false)} onSave={handleSaveDish} dish={editingDish} />
       </div>
    )
}

export default VendorMenuManagement;
