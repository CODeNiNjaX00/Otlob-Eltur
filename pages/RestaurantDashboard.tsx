import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Order } from '../types';
import MenuManagement from '../components/MenuManagement';
import { Modal } from './AdminDashboard';

const RestaurantDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
    const { user } = useAuth();
    const { dataState, updateOrderStatus, updateRestaurant } = useData();

    const myRestaurant = dataState.restaurants.find(r => r.id === user?.restaurantId);
    
    if (!myRestaurant) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl text-red-500">خطأ: لم يتم العثور على مطعم مرتبط بهذا الحساب.</h1>
            </div>
        );
    }
    
    const restaurantOrders = dataState.orders.filter(o => o.restaurantName === myRestaurant.name);
    
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">لوحة تحكم مطعم {myRestaurant.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">مرحباً {user?.name}، يمكنك إدارة طلباتك وقائمة طعامك من هنا.</p>
            
             <div className="mb-8 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-i-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('orders')} className={`whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm transition-colors ${ activeTab === 'orders' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600' }`}>
                        إدارة الطلبات
                    </button>
                    <button onClick={() => setActiveTab('menu')} className={`whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm transition-colors ${ activeTab === 'menu' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600' }`}>
                        إدارة المنيو
                    </button>
                </nav>
            </div>

            {activeTab === 'orders' && <RestaurantOrders orders={restaurantOrders} updateOrderStatus={updateOrderStatus} />}
            {activeTab === 'menu' && <MenuManagement restaurant={myRestaurant} onUpdate={updateRestaurant} />}
        </div>
    );
};

// Orders Component for Restaurant Dashboard
const RestaurantOrders: React.FC<{ orders: Order[], updateOrderStatus: (id: number, status: Order['status']) => void }> = ({ orders, updateOrderStatus }) => {
    const newOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'in_progress');
    const [assignModalOrder, setAssignModalOrder] = useState<Order | null>(null);

    const OrderCard: React.FC<{ order: Order }> = ({ order }) => (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-md flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-800 dark:text-white">طلب #{order.id}</h3>
                <span className="text-sm text-slate-500 dark:text-slate-400">{order.customerName}</span>
            </div>
            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1 border-t dark:border-slate-700 pt-3 flex-grow">
                {order.items.map((item, index) => (
                    <li key={item.id || index}>
                        {item.quantity} x {item.dish.name}
                        {item.notes && <span className="block text-xs text-primary-600 dark:text-primary-500 ml-4">- {item.notes}</span>}
                    </li>
                ))}
            </ul>
             {order.status === 'pending' && (
                <div className="mt-4 pt-4 border-t dark:border-slate-700 flex gap-2">
                    <button onClick={() => updateOrderStatus(order.id, 'in_progress')} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors">قبول</button>
                    <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors">رفض</button>
                </div>
            )}
            {order.status === 'in_progress' && (
                 <div className="mt-4 pt-4 border-t dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        عدد المتقدمين: <span className="font-bold text-lg">{order.applicantIds.length}</span>
                    </p>
                    <button 
                        onClick={() => setAssignModalOrder(order)}
                        disabled={order.applicantIds.length === 0}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
                        إسناد لمندوب
                    </button>
                </div>
            )}
        </div>
    );
    
    return (
        <div>
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">طلبات جديدة ({newOrders.length})</h2>
                {newOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {newOrders.map(o => <OrderCard key={o.id} order={o} />)}
                    </div>
                ) : <p className="text-slate-500 dark:text-slate-400">لا توجد طلبات جديدة في الانتظار.</p>}
            </div>
             <div>
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">طلبات قيد التجهيز ({preparingOrders.length})</h2>
                {preparingOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {preparingOrders.map(o => <OrderCard key={o.id} order={o} />)}
                    </div>
                ) : <p className="text-slate-500 dark:text-slate-400">لا توجد طلبات قيد التجهيز حالياً.</p>}
            </div>
            <AssignDeliveryModal 
                isOpen={!!assignModalOrder} 
                onClose={() => setAssignModalOrder(null)} 
                order={assignModalOrder}
            />
        </div>
    )
};

const AssignDeliveryModal: React.FC<{ isOpen: boolean; onClose: () => void; order: Order | null; }> = ({ isOpen, onClose, order }) => {
    const { dataState, assignDelivery } = useData();

    if (!order) return null;

    const applicants = dataState.users.filter(user => order.applicantIds.includes(user.id));

    const handleAssign = (deliveryId: number) => {
        assignDelivery(order.id, deliveryId);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`اختر مندوب للطلب #${order.id}`}>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
                {applicants.length > 0 ? (
                    <ul className="space-y-3">
                        {applicants.map(applicant => (
                            <li key={applicant.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/80 rounded-md">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{applicant.name}</span>
                                <button onClick={() => handleAssign(applicant.id)} className="btn-primary-small">إسناد</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">لا يوجد متقدمين لهذا الطلب بعد.</p>
                )}
            </div>
             <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                <button type="button" onClick={onClose} className="btn-secondary">إغلاق</button>
            </div>
        </Modal>
    );
}

export default RestaurantDashboard;