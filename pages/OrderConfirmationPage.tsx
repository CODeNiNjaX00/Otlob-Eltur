import React from 'react';
import { Link, useParams } from 'react-router-dom';

const OrderConfirmationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
            <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mt-10">
                <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-2xl font-bold mt-6 text-slate-800 dark:text-white">تم استلام طلبك بنجاح!</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-2">
                    طلبك رقم <span className="font-bold text-primary-500">#{id}</span> قيد التجهيز الآن.
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    سيتم توصيله إليك في أقرب وقت ممكن.
                </p>
                <div className="mt-8">
                    <Link to="/" className="inline-block bg-primary-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-600 transition-transform hover:scale-105">
                        العودة للصفحة الرئيسية
                    </Link>
                </div>
                 <div className="mt-4">
                     <Link to="/my-orders" className="text-sm text-primary-500 hover:underline">
                        عرض طلباتي
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
