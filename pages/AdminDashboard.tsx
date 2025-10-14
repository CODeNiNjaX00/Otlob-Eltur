import React, { useState, FormEvent, useEffect, useMemo } from 'react';
import { Order, UserRole, Restaurant, Dish, User } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import MenuManagement from '../components/MenuManagement';
import { printOrderReport } from '../utils/generateReport';


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
const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);


type AdminTab = 'dashboard' | 'orders' | 'restaurants' | 'users';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const { dataState, loading, addRestaurant, updateRestaurant, deleteRestaurant, addUser, updateUser, deleteUser, updateOrderStatus } = useData();
    const { restaurants, users, orders } = dataState;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-slate-500 dark:text-slate-400">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">لوحة تحكم المدير</h1>
            
            <div className="mb-8 border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-i-6 overflow-x-auto" aria-label="Tabs">
                    <TabButton name="Dashboard" tab="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton name="الطلبات والتقارير" tab="orders" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton name="المطاعم" tab="restaurants" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton name="المستخدمين" tab="users" activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </div>

            <div>
                {activeTab === 'dashboard' && <DashboardContent restaurants={restaurants} users={users} orders={orders} />}
                {activeTab === 'orders' && <OrdersContent orders={orders} updateOrderStatus={updateOrderStatus} />}
                {activeTab === 'restaurants' && <RestaurantsContent restaurants={restaurants} addRestaurant={addRestaurant} updateRestaurant={updateRestaurant} deleteRestaurant={deleteRestaurant} />}
                {activeTab === 'users' && <UsersContent users={users} restaurants={restaurants} addUser={addUser} updateUser={updateUser} deleteUser={deleteUser} />}
            </div>
        </div>
    );
};

// --- Reusable Modal Component ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                </div>
                {children}
            </div>
        </div>
    );
};

// --- Tab Button Component ---
interface TabButtonProps { name: string; tab: AdminTab; activeTab: AdminTab; setActiveTab: (tab: AdminTab) => void; }
const TabButton: React.FC<TabButtonProps> = ({ name, tab, activeTab, setActiveTab }) => (
    <button onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm transition-colors ${ activeTab === tab ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600' }`}>
        {name}
    </button>
);

// --- Dashboard Content ---
const DashboardContent: React.FC<{ restaurants: Restaurant[], users: User[], orders: Order[] }> = ({ restaurants, users, orders }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // FIX: Use local date instead of UTC to correctly identify 'today', preventing timezone errors.
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, '0');
    const day = String(currentTime.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const todaysOrders = orders.filter(o => o.date === todayStr);
    
    const deliveredTodaysOrders = todaysOrders.filter(o => o.status === 'delivered');
    const todaysRevenue = deliveredTodaysOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    const totalCustomers = users.filter(u => u.role === UserRole.CUSTOMER).length;
    const totalRestaurants = restaurants.length;

    const StatCard: React.FC<{ title: string; value: string | number; children?: React.ReactNode }> = ({ title, value, children }) => (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
            <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
            {children && <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{children}</div>}
        </div>
    );

    return (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                title="إيرادات اليوم" 
                value={`${todaysRevenue} جنيه`}
            >
                <div className='border-t dark:border-slate-700 mt-2 pt-2'>
                  <p>من {deliveredTodaysOrders.length} طلبات مكتملة</p>
                  <p className="font-mono text-base dark:text-slate-300 mt-1" dir="ltr">
                    {currentTime.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    <br />
                    {currentTime.toLocaleTimeString('ar-EG')}
                  </p>
                </div>
            </StatCard>
            <StatCard title="طلبات اليوم" value={todaysOrders.length} />
            <StatCard title="إجمالي العملاء" value={totalCustomers} />
            <StatCard title="إجمالي المطاعم" value={totalRestaurants} />
        </div>
    );
};

// --- Orders Content ---
const getStatusChipClass = (status: Order['status']) => {
    const statusMap = {
        delivered: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        out_for_delivery: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
    };
    return statusMap[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
};

const OrderCard: React.FC<{ order: Order, updateOrderStatus: (id: number, status: Order['status']) => void, onViewNotes: (order: Order) => void }> = ({ order, updateOrderStatus, onViewNotes }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap justify-between items-center pb-3 mb-3 border-b dark:border-slate-700 gap-2">
            <div>
                <h3 className="font-bold text-slate-900 dark:text-white">طلب #{order.id}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{order.date}</p>
            </div>
            <div className="flex items-center gap-2">
                {order.problemNotes && (
                    <button onClick={() => onViewNotes(order)} className="text-slate-400 hover:text-primary-500 transition-colors" aria-label={`View notes for order #${order.id}`}>
                        <InfoIcon className="w-5 h-5" />
                    </button>
                )}
                <select 
                    value={order.status} 
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                    className={`py-1 pl-2 pr-7 text-xs font-semibold border-transparent rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 ${getStatusChipClass(order.status)}`}
                    aria-label={`Change status for order ${order.id}`}
                >
                    <option value="pending">قيد الانتظار</option>
                    <option value="in_progress">قيد التجهيز</option>
                    <option value="out_for_delivery" disabled>في الطريق (عبر المطعم)</option>
                    <option value="delivered">تم التوصيل</option>
                    <option value="cancelled">ملغي</option>
                </select>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="text-slate-500 dark:text-slate-400">العميل:</div><div className="font-medium text-slate-700 dark:text-slate-200">{order.customerName}</div>
            <div className="text-slate-500 dark:text-slate-400">المطعم:</div><div className="font-medium text-slate-700 dark:text-slate-200">{order.restaurantName}</div>
            <div className="text-slate-500 dark:text-slate-400">الإجمالي:</div><div className="font-bold text-primary-600 dark:text-primary-500">{order.totalPrice} جنيه</div>
        </div>
    </div>
);

const OrdersContent: React.FC<{ orders: Order[], updateOrderStatus: (id: number, status: Order['status']) => void }> = ({ orders, updateOrderStatus }) => {
    const [viewingNotesForOrder, setViewingNotesForOrder] = useState<Order | null>(null);
    const [filterType, setFilterType] = useState('all');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const filteredOrders = useMemo(() => {
        if (filterType === 'day') return orders.filter(o => o.date === selectedDate);
        if (filterType === 'month') return orders.filter(o => o.date.startsWith(selectedMonth));
        return orders;
    }, [orders, filterType, selectedDate, selectedMonth]);

    const handleExport = () => {
        const reportTitle = filterType === 'day' 
            ? `تقرير طلبات يوم ${selectedDate}` 
            : filterType === 'month' 
            ? `تقرير طلبات شهر ${selectedMonth}` 
            : 'تقرير جميع الطلبات';
        printOrderReport(filteredOrders, reportTitle);
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">إدارة الطلبات والتقارير</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-field py-2 text-sm">
                            <option value="all">عرض الكل</option>
                            <option value="day">فلترة باليوم</option>
                            <option value="month">فلترة بالشهر</option>
                        </select>
                        {filterType === 'day' && <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="input-field py-1.5 text-sm" />}
                        {filterType === 'month' && <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="input-field py-1.5 text-sm" />}
                        <button onClick={handleExport} className="btn-secondary py-2 px-4 text-sm font-semibold">تصدير وطباعة</button>
                    </div>
                </div>
                {filteredOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOrders.map(order => (
                            <OrderCard key={order.id} order={order} updateOrderStatus={updateOrderStatus} onViewNotes={setViewingNotesForOrder} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8 text-slate-500 dark:text-slate-400">لا توجد طلبات تطابق هذا الفلتر.</p>
                )}
            </div>
            <Modal 
                isOpen={!!viewingNotesForOrder} 
                onClose={() => setViewingNotesForOrder(null)} 
                title={`ملاحظات على الطلب #${viewingNotesForOrder?.id}`}
            >
                <div className="p-6"> <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{viewingNotesForOrder?.problemNotes}</p> </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                    <button type="button" onClick={() => setViewingNotesForOrder(null)} className="btn-secondary">إغلاق</button>
                </div>
            </Modal>
        </>
    );
};


// --- Restaurants Content ---
// ... (The rest of the file remains the same, so I'll omit it for brevity but it is part of the file)
const RestaurantsContent: React.FC<{ 
    restaurants: Restaurant[], 
    addRestaurant: (data: any) => void,
    updateRestaurant: (restaurant: Restaurant) => void, 
    deleteRestaurant: (id: number) => void 
}> = ({ restaurants, addRestaurant, updateRestaurant, deleteRestaurant }) => {
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

    const openModalForNew = () => { setEditingRestaurant(null); setIsModalOpen(true); };
    const openModalForEdit = (restaurant: Restaurant) => { setEditingRestaurant(restaurant); setIsModalOpen(true); };

    const handleSaveRestaurant = async (data: any) => {
        try {
            if (editingRestaurant) {
                await updateRestaurant({ ...editingRestaurant, ...data });
            } else {
                await addRestaurant(data);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save restaurant:", error);
            alert("Failed to save restaurant. Check the console for details.");
        }
    };

    const handleDeleteRestaurant = (id: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المطعم؟ سيتم حذف حساب المدير الخاص به أيضاً.')) {
            deleteRestaurant(id);
        }
    };

    if (selectedRestaurant) {
        return <MenuManagement restaurant={selectedRestaurant} onBack={() => setSelectedRestaurant(null)} />
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <div className="flex flex-wrap justify-between items-center p-4 sm:p-6 gap-3">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">إدارة المطاعم</h2>
                <button onClick={openModalForNew} className="btn-primary-small flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    إضافة مطعم
                </button>
            </div>
            <div className="space-y-4 p-4 sm:p-0 sm:pb-4">
                <div className="hidden sm:grid grid-cols-5 gap-4 px-6 pb-2 border-b dark:border-slate-700">
                    <div className="th-responsive">الاسم</div><div className="th-responsive">المطبخ</div><div className="th-responsive">التقييم</div><div className="th-responsive">التوصيل</div><div className="th-responsive text-left">الإجراءات</div>
                </div>
                {restaurants.map(res => (
                    <div key={res.id} className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-center bg-white dark:bg-slate-800 sm:hover:bg-slate-50 dark:sm:hover:bg-slate-700/50 p-4 sm:px-6 rounded-lg shadow sm:shadow-none sm:rounded-none">
                        <div className="col-span-2 sm:col-span-1 text-lg sm:text-base font-bold sm:font-normal text-slate-800 dark:text-white">{res.name}</div>
                        <div className="text-sm"><span className="sm:hidden text-slate-500">المطبخ: </span>{res.cuisine}</div>
                        <div className="text-sm"><span className="sm:hidden text-slate-500">التقييم: </span>{res.rating}</div>
                        <div className="text-sm"><span className="sm:hidden text-slate-500">التوصيل: </span>{res.deliveryTime} دقيقة</div>
                        <div className="col-span-2 sm:col-span-1 flex justify-start sm:justify-end items-center gap-3 mt-2 sm:mt-0">
                            <button onClick={() => setSelectedRestaurant(res)} className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-semibold">إدارة المنيو</button>
                            <button onClick={() => openModalForEdit(res)} className="text-slate-500 hover:text-blue-600 p-1"><EditIcon className="w-5 h-5"/></button>
                            <button onClick={() => handleDeleteRestaurant(res.id)} className="text-slate-500 hover:text-red-600 p-1"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
            <RestaurantFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveRestaurant} restaurant={editingRestaurant} />
        </div>
    );
};


const UsersContent: React.FC<{ 
    users: User[], 
    restaurants: Restaurant[],
    addUser: (data: Omit<User, 'id'>) => User,
    updateUser: (user: User) => void,
    deleteUser: (id: string) => void
}> = ({ users, restaurants, addUser, updateUser, deleteUser }) => {
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { user: currentUser } = useAuth();

    const openModalForNew = () => { setEditingUser(null); setIsUserModalOpen(true); };
    const openModalForEdit = (user: User) => { setEditingUser(user); setIsUserModalOpen(true); };
    
    const handleSaveUser = (userData: Partial<User>) => {
        if (editingUser) {
            updateUser({ ...editingUser, ...userData });
        } else {
            addUser({
                name: userData.name || '',
                email: userData.email || '',
                password: userData.password || '',
                role: userData.role || UserRole.CUSTOMER,
                address: userData.address || '',
                restaurantId: userData.restaurantId
            });
        }
        setIsUserModalOpen(false);
    };

    const handleDeleteUser = (id: number) => {
        if(window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
            deleteUser(id);
        }
    };
    
    const getRoleName = (role: UserRole) => ({ [UserRole.ADMIN]: 'مدير', [UserRole.CUSTOMER]: 'عميل', [UserRole.DELIVERY]: 'توصيل', [UserRole.RESTAURANT]: 'مطعم' })[role];
    
    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
                <div className="flex flex-wrap justify-between items-center p-4 sm:p-6 gap-3">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">إدارة المستخدمين</h2>
                    <button onClick={openModalForNew} className="btn-primary-small flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" />
                        إضافة مستخدم
                    </button>
                </div>
                 <div className="space-y-4 p-4 sm:p-0 sm:pb-4">
                    <div className="hidden sm:grid grid-cols-4 gap-4 px-6 pb-2 border-b dark:border-slate-700">
                        <div className="th-responsive">الاسم</div><div className="th-responsive col-span-2">البريد الإلكتروني</div><div className="th-responsive text-left">الإجراءات</div>
                    </div>
                    {users.map(user => (
                        <div key={user.id} className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center bg-white dark:bg-slate-800 sm:hover:bg-slate-50 dark:sm:hover:bg-slate-700/50 p-4 sm:px-6 rounded-lg shadow sm:shadow-none sm:rounded-none">
                            <div className="col-span-2 sm:col-span-1">
                                <h4 className="font-bold text-slate-800 dark:text-white">{user.name}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{getRoleName(user.role)}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-2 text-sm text-slate-600 dark:text-slate-300 truncate">{user.email}</div>
                            <div className="col-span-2 sm:col-span-1 flex justify-start sm:justify-end items-center gap-3 mt-2 sm:mt-0">
                                <button onClick={() => openModalForEdit(user)} disabled={user.id === currentUser?.id} className="text-slate-500 hover:text-blue-600 p-1 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:cursor-not-allowed"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleDeleteUser(user.id)} disabled={user.id === currentUser?.id} className="text-slate-500 hover:text-red-600 p-1 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:cursor-not-allowed"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <UserFormModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSave={handleSaveUser} user={editingUser} restaurants={restaurants} />
        </>
    );
};

const RestaurantFormModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (data: any) => void, restaurant: Restaurant | null }> = ({ isOpen, onClose, onSave, restaurant }) => {
    const [formData, setFormData] = useState({ name: '', cuisine: '', rating: '4.5', deliveryTime: '30', imageUrl: 'https://picsum.photos/seed/new/600/400', email: '', password: '' });
    const isEditing = !!restaurant;

    useEffect(() => {
        if (restaurant) {
            setFormData({ name: restaurant.name, cuisine: restaurant.cuisine, rating: String(restaurant.rating), deliveryTime: String(restaurant.deliveryTime), imageUrl: restaurant.imageUrl, email: '', password: '' });
        } else {
            setFormData({ name: '', cuisine: '', rating: '4.5', deliveryTime: '30', imageUrl: 'https://picsum.photos/seed/new/600/400', email: '', password: '' });
        }
    }, [restaurant, isOpen]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const restaurantData = {
            name: formData.name,
            cuisine: formData.cuisine,
            rating: parseFloat(formData.rating),
            deliveryTime: parseInt(formData.deliveryTime, 10),
            imageUrl: formData.imageUrl,
        };
        if (isEditing) {
            onSave(restaurantData);
        } else {
            onSave({ ...restaurantData, email: formData.email, password: formData.password });
        }
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'تعديل مطعم' : 'إضافة مطعم جديد'}>
            <form onSubmit={handleSubmit}><div className="p-6 space-y-4">
                <input type="text" placeholder="اسم المطعم" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="input-field" />
                <input type="text" placeholder="نوع المطبخ" value={formData.cuisine} onChange={e => setFormData({ ...formData, cuisine: e.target.value })} required className="input-field" />
                <input type="number" step="0.1" min="1" max="5" placeholder="التقييم" value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} required className="input-field" />
                <input type="number" placeholder="وقت التوصيل (دقائق)" value={formData.deliveryTime} onChange={e => setFormData({ ...formData, deliveryTime: e.target.value })} required className="input-field" />
                <input type="text" placeholder="رابط الصورة" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} required className="input-field" />
            
                {!isEditing && (
                    <div className="border-t pt-4 mt-4 dark:border-slate-700">
                        <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">إنشاء حساب مدير المطعم</h4>
                        <div className="space-y-4">
                            <input type="email" placeholder="بريد المدير الإلكتروني" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="input-field" />
                            <input type="password" placeholder="كلمة مرور المدير" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required className="input-field" />
                        </div>
                    </div>
                )}
            </div><div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                <button type="button" onClick={onClose} className="btn-secondary">إلغاء</button><button type="submit" className="btn-primary">حفظ</button>
            </div></form>
        </Modal>
    );
};

export const DishFormModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (data: any) => void, dish: Dish | null }> = ({ isOpen, onClose, onSave, dish }) => {
    const [formData, setFormData] = useState({ name: '', description: '', price: '', imageUrl: 'https://picsum.photos/seed/dish/400/300' });
    useEffect(() => {
        if (dish) setFormData({ name: dish.name, description: dish.description, price: String(dish.price), imageUrl: dish.imageUrl });
        else setFormData({ name: '', description: '', price: '', imageUrl: 'https://picsum.photos/seed/dish/400/300' });
    }, [dish, isOpen]);
    const handleSubmit = (e: FormEvent) => { e.preventDefault(); onSave({ ...formData, price: parseFloat(formData.price) }); };
    return (
         <Modal isOpen={isOpen} onClose={onClose} title={dish ? 'تعديل طبق' : 'إضافة طبق جديد'}>
            <form onSubmit={handleSubmit}><div className="p-6 space-y-4">
                <input type="text" placeholder="اسم الطبق" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="input-field" />
                <textarea placeholder="الوصف" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required className="input-field min-h-[80px]" />
                <input type="number" placeholder="السعر" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required className="input-field" />
                <input type="text" placeholder="رابط الصورة" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} required className="input-field" />
            </div><div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                <button type="button" onClick={onClose} className="btn-secondary">إلغاء</button><button type="submit" className="btn-primary">حفظ</button>
            </div></form>
        </Modal>
    );
};

const UserFormModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (data: Partial<User>) => void, user: User | null, restaurants: Restaurant[] }> = ({ isOpen, onClose, onSave, user, restaurants }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: UserRole.CUSTOMER, restaurantId: '' });
    const isEditing = !!user;

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name, email: user.email, password: '', role: user.role, restaurantId: user.restaurantId?.toString() || '' });
        } else {
            setFormData({ name: '', email: '', password: '', role: UserRole.DELIVERY, restaurantId: '' });
        }
    }, [user, isOpen]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const dataToSave: Partial<User> = { ...formData, restaurantId: formData.restaurantId ? parseInt(formData.restaurantId) : undefined };
        if (isEditing && !formData.password) {
            delete dataToSave.password;
        }
        if (formData.role !== UserRole.RESTAURANT) {
            delete dataToSave.restaurantId;
        }
        onSave(dataToSave);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}>
            <form onSubmit={handleSubmit}><div className="p-6 space-y-4">
                <input type="text" placeholder="الاسم الكامل" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="input-field" />
                <input type="email" placeholder="البريد الإلكتروني" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="input-field" />
                <input type="password" placeholder={isEditing ? 'كلمة مرور جديدة (اتركه فارغاً للتجاهل)' : 'كلمة المرور'} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!isEditing} className="input-field" />
                <div>
                    <label htmlFor="role-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الدور</label>
                    <select id="role-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })} required className="input-field">
                        <option value={UserRole.CUSTOMER}>عميل</option>
                        <option value={UserRole.DELIVERY}>توصيل</option>
                        <option value={UserRole.RESTAURANT}>مطعم</option>
                        <option value={UserRole.ADMIN}>مدير</option>
                    </select>
                </div>
                {formData.role === UserRole.RESTAURANT && (
                    <div>
                        <label htmlFor="restaurant-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">المطعم المسؤول عنه</label>
                        <select id="restaurant-select" value={formData.restaurantId} onChange={e => setFormData({ ...formData, restaurantId: e.target.value })} required className="input-field">
                            <option value="" disabled>اختر مطعم...</option>
                            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                )}
            </div><div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                <button type="button" onClick={onClose} className="btn-secondary">إلغاء</button><button type="submit" className="btn-primary">حفظ</button>
            </div></form>
        </Modal>
    );
};

const style = document.createElement('style');
style.innerHTML = `
  .th { padding: 0.75rem 1.5rem; text-align: right; font-size: 0.75rem; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .dark .th { color: #94a3b8; }
  .td { padding: 1rem 1.5rem; white-space: nowrap; font-size: 0.875rem; color: #475569; }
  .dark .td { color: #cbd5e1; }
  .th-responsive { text-align: right; font-size: 0.75rem; font-weight: 500; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .dark .th-responsive { color: #94a3b8; }
  .btn-primary-small { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 600; border-radius: 0.5rem; color: white; background-color: #f97316; transition: background-color 0.2s; }
  .btn-primary-small:hover { background-color: #ea580c; }
  .input-field { appearance: none; position: relative; display: block; width: 100%; padding: 0.75rem 1rem; border: 1px solid; border-radius: 0.5rem; transition: all 0.2s; }
  .light .input-field { border-color: #cbd5e1; background-color: #fff; color: #1e2b3b; }
  .dark .input-field { border-color: #475569; background-color: #334155; color: #f1f5f9; }
  .input-field:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: #f97316; --tw-ring-color: #f97316; box-shadow: 0 0 0 2px var(--tw-ring-color); }
  .btn-primary { display: flex; justify-content: center; padding: 0.6rem 1rem; border: 1px solid transparent; font-weight: 600; border-radius: 0.5rem; color: white; background-color: #f97316; transition: background-color 0.2s; }
  .btn-primary:hover { background-color: #ea580c; }
  .btn-secondary { display: flex; justify-content: center; padding: 0.6rem 1rem; border: 1px solid; font-weight: 600; border-radius: 0.5rem; transition: background-color 0.2s; }
  .light .btn-secondary { border-color: #cbd5e1; background-color: #fff; color: #334155; }
  .dark .btn-secondary { background-color: #475569; border-color: #64748b; color: #e2e8f0; }
  .light .btn-secondary:hover { background-color: #f8fafc; }
  .dark .btn-secondary:hover { background-color: #64748b; }
`;
document.head.appendChild(style);

export default AdminDashboard;