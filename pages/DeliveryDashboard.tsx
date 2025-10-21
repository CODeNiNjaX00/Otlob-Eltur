import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import LocationIcon from '../components/icons/LocationIcon';
import { useData } from '../contexts/DataContext';
import { Modal } from './AdminDashboard';
import { useAuth } from '../contexts/AuthContext';

const DeliveryDashboard: React.FC = () => {
    const { dataState, updateOrderStatus, applyForOrder } = useData();
    const { user } = useAuth();
    const [problemOrder, setProblemOrder] = useState<Order | null>(null);
    const [problemNotes, setProblemNotes] = useState('');

    const deliveryId = user!.id;

    const availableOrders = useMemo(() => dataState.orders.filter(o => 
        o.status === 'in_progress' && 
        !o.applicantIds.includes(deliveryId)
    ), [dataState.orders, deliveryId]);

    const myActiveOrders = useMemo(() => dataState.orders.filter(o => 
        (o.status === 'in_progress' && o.applicantIds.includes(deliveryId)) ||
        (o.status === 'out_for_delivery' && o.assignedDeliveryId === deliveryId)
    ), [dataState.orders, deliveryId]);


    const handleDelivered = (orderId: number) => {
        updateOrderStatus(orderId, 'delivered');
    };

    const handleOpenProblemModal = (order: Order) => {
        setProblemOrder(order);
        setProblemNotes('');
    };

    const handleCancelOrder = () => {
        if (problemOrder && problemNotes.trim()) {
            updateOrderStatus(problemOrder.id, 'cancelled', problemNotes);
            setProblemOrder(null);
        } else {
            alert('يرجى كتابة سبب المشكلة.');
        }
    };

    const OrderCard: React.FC<{ order: Order, isMyOrder: boolean }> = ({ order, isMyOrder }) => (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-slate-700">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">طلب رقم #{order.id}</h3>
                 <span className="text-sm font-semibold text-slate-500 dark:text-slate-300">{order.vendorName}</span>
            </div>
            
            <p className="text-slate-700 dark:text-slate-300"><span className="font-semibold text-slate-500 dark:text-slate-400">العميل:</span> {order.customerName}</p>
            <div className="flex items-start mt-3 text-slate-600 dark:text-slate-400">
                <LocationIcon className="w-5 h-5 mt-1 ms-2 flex-shrink-0 text-slate-400" />
                <p>{order.deliveryAddress}</p>
            </div>
            <div className="mt-4 pt-4 border-t dark:border-slate-700">
                <h4 className="font-semibold mb-2 text-slate-800 dark:text-white">الطلبات:</h4>
                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    {order.items.map((item, index) => (
                        <li key={item.id || index}>
                            {item.quantity} x {item.dish.name}
                            {item.notes && <span className="block text-xs text-primary-600 dark:text-primary-500 ml-4">- {item.notes}</span>}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 justify-end">
                {!isMyOrder ? (
                     <button 
                        onClick={() => applyForOrder(order.id, deliveryId)}
                        className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors w-full">
                        طلب استلام الاوردر
                    </button>
                ) : (
                    order.status === 'in_progress' ? (
                        <div className="w-full text-center px-3 py-2 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                            في انتظار موافقة المطعم
                        </div>
                    ) : (
                    <>
                        <div className="w-full text-center px-3 py-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 mb-2">
                            لقد تم اختيارك لهذا الطلب
                        </div>
                        <button onClick={() => handleOpenProblemModal(order)} className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">إبلاغ عن مشكلة</button>
                        <button 
                            onClick={() => handleDelivered(order.id)}
                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors">
                            تم التوصيل
                        </button>
                    </>
                    )
                )}
            </div>
        </div>
    );
    
  return (
    <>
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">لوحة تحكم التوصيل</h1>
           
           <div className="mb-10">
                <h2 className="text-2xl font-bold mb-4 text-slate-700 dark:text-slate-200">طلبات متاحة للتقديم ({availableOrders.length})</h2>
                {availableOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableOrders.map(order => <OrderCard key={order.id} order={order} isMyOrder={false} />)}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400">لا توجد طلبات متاحة حالياً.</p>
                    </div>
                )}
           </div>

           <div>
                <h2 className="text-2xl font-bold mb-4 text-slate-700 dark:text-slate-200">طلباتي النشطة ({myActiveOrders.length})</h2>
                {myActiveOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myActiveOrders.map(order => <OrderCard key={order.id} order={order} isMyOrder={true} />)}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <p className="text-slate-500 dark:text-slate-400">ليس لديك طلبات نشطة.</p>
                    </div>
                )}
           </div>
        </div>

        <Modal isOpen={!!problemOrder} onClose={() => setProblemOrder(null)} title={`الإبلاغ عن مشكلة للطلب #${problemOrder?.id}`}>
            <div className="p-6 space-y-4">
                <textarea 
                    value={problemNotes}
                    onChange={(e) => setProblemNotes(e.target.value)}
                    placeholder="اكتب سبب المشكلة بالتفصيل (مثال: العميل لا يرد، العنوان خاطئ...)"
                    className="input-field min-h-[100px]"
                />
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                <button type="button" onClick={() => setProblemOrder(null)} className="btn-secondary">إغلاق</button>
                <button type="button" onClick={handleCancelOrder} className="btn-primary bg-red-600 hover:bg-red-700">إلغاء الطلب</button>
            </div>
        </Modal>
    </>
  );
};

export default DeliveryDashboard;