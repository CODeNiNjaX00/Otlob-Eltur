import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import CartItem from '../components/CartItem';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const CartPage: React.FC = () => {
  const { cartState, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { dataState, addOrder } = useData();
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const total = getCartTotal();
  const deliveryFee = 20;
  const grandTotal = total + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!user) {
        navigate('/login?redirect=/cart');
        return;
    }
    if (cartState.items.length === 0) return;

    setIsPlacingOrder(true);

    const firstItemDishId = cartState.items[0].dish.id;
    const restaurant = dataState.restaurants.find(r => r.menu.some(dish => dish.id === firstItemDishId));

    const newOrderData = {
        customerName: user.name,
        restaurantName: restaurant ? restaurant.name : 'مطعم غير معروف',
        deliveryAddress: user.address || 'لا يوجد عنوان',
        totalPrice: grandTotal,
        items: cartState.items,
    };

    try {
        const newOrder = await addOrder(newOrderData);
        clearCart();
        navigate(`/order-confirmation/${newOrder.id}`);
    } catch (error) {
        console.error("Failed to place order:", error);
    } finally {
        setIsPlacingOrder(false);
    }
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">سلة التسوق</h1>
      {cartState.items.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <p className="text-2xl font-semibold text-slate-600 dark:text-slate-300">سلتك فارغة!</p>
            <p className="text-slate-500 dark:text-slate-400 mt-2">يبدو أنك لم تقم بإضافة أي شيء بعد.</p>
            <Link to="/" className="mt-6 inline-block bg-primary-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-600 transition-transform hover:scale-105">
                ابدأ التسوق الآن
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-md divide-y divide-slate-200 dark:divide-slate-700">
            {cartState.items.map(item => (
              <CartItem key={item.dish.id} item={item} />
            ))}
          </div>
          <div className="lg:col-span-1">
             <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">ملخص الطلب</h2>
                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                        <span>المجموع الفرعي</span>
                        <span className="font-semibold">{total} جنيه</span>
                    </div>
                     <div className="flex justify-between">
                        <span>رسوم التوصيل</span>
                        <span className="font-semibold">{deliveryFee} جنيه</span>
                    </div>
                </div>
                <hr className="my-4 border-slate-200 dark:border-slate-700"/>
                 <div className="flex justify-between font-bold text-lg text-slate-800 dark:text-white">
                    <span>الإجمالي</span>
                    <span>{grandTotal} جنيه</span>
                </div>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full mt-6 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors text-lg disabled:bg-green-300 dark:disabled:bg-green-800 disabled:cursor-not-allowed"
                >
                    {isPlacingOrder ? 'جاري إرسال الطلب...' : 'إتمام الطلب'}
                </button>
                 <button 
                    onClick={clearCart}
                    className="w-full mt-3 bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900/75 transition-colors">
                    إفراغ السلة
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
