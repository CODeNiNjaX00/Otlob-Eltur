import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Order } from '../types';
import { Link } from 'react-router-dom';

const MyOrdersPage: React.FC = () => {
    const { user } = useAuth();
    const { dataState } = useData();

    const myOrders = user ? dataState.orders.filter(order => order.customerName === user.name) : [];

    const getStatusChip = (status: Order['status']) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case 'out_for_delivery': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            case 'pending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
        }
    };
    
    const getStatusText = (status: Order['status']) => {
        const statusMap = {
            'pending': 'قيد الانتظار',
            'in_progress': 'قيد التجهيز',
            'out_for_delivery': 'في الطريق',
            'delivered': 'تم التوصيل',
            'cancelled': 'ملغي'
        };
        return statusMap[status];
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">طلباتي</h1>
            {myOrders.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                    <p className="text-xl font-semibold text-slate-500 dark:text-slate-400">لا يوجد لديك طلبات سابقة.</p>
                     <Link to="/" className="mt-6 inline-block bg-primary-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-600 transition-transform hover:scale-105">
                        اطلب الآن
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {myOrders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md transition-shadow hover:shadow-lg">
                             <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-slate-700 flex-wrap gap-2">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">طلب رقم #{order.id}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{order.date}</p>
                                </div>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusChip(order.status)}`}>
                                    {getStatusText(order.status)}
                                </span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-white">من متجر: {order.vendorName}</h4>
                                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1 mt-2">
                                    {order.items.map((item, index) => (
                                        <li key={item.id || index}>
                                            {item.quantity} x {item.dish.name}
                                            {item.notes && <span className="block text-xs text-primary-600 dark:text-primary-500 ml-4">- {item.notes}</span>}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-right font-bold text-lg mt-4 text-primary-600 dark:text-primary-500">
                                    الإجمالي: {order.totalPrice} جنيه
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;