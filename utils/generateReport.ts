import { Order } from '../types';

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

export const printOrderReport = (orders: Order[], title: string) => {
    // 1. Generate HTML string for the report
    const totalRevenue = orders.reduce((sum, order) => order.status === 'delivered' ? sum + order.totalPrice : sum, 0);
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

    const tableRows = orders.map(order => `
        <tr class="border-b dark:border-slate-700">
            <td class="p-2">${order.id}</td>
            <td class="p-2">${order.customerName}</td>
            <td class="p-2">${order.restaurantName}</td>
            <td class="p-2">${order.date}</td>
            <td class="p-2">${order.totalPrice.toFixed(2)} جنيه</td>
            <td class="p-2">${getStatusText(order.status)}</td>
        </tr>
    `).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Cairo', sans-serif;
                    -webkit-print-color-adjust: exact !important; /* Ensures background colors are printed */
                    print-color-adjust: exact !important;
                }
                h1, h2, h3 {
                    font-family: 'Amiri', serif;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 1rem;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            </style>
        </head>
        <body class="bg-white text-slate-800 p-8">
            <header class="text-center mb-8 border-b border-slate-200 pb-4">
                <h1 class="text-3xl font-bold text-slate-900">تقرير Otlob - Eltūr</h1>
                <h2 class="text-xl text-slate-700">${title}</h2>
                <p class="text-slate-500">${new Date().toLocaleString('ar-EG-u-nu-latn')}</p>
            </header>

            <section class="mb-8">
                <h3 class="text-2xl font-bold mb-3">ملخص التقرير</h3>
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div class="p-4 bg-slate-100 rounded-lg">
                        <span class="block text-slate-500">إجمالي الطلبات</span>
                        <span class="block text-2xl font-bold">${totalOrders}</span>
                    </div>
                    <div class="p-4 bg-slate-100 rounded-lg">
                        <span class="block text-slate-500">الطلبات المكتملة</span>
                        <span class="block text-2xl font-bold">${deliveredOrders}</span>
                    </div>
                    <div class="p-4 bg-green-100 rounded-lg">
                        <span class="block text-green-700">الإيرادات المحققة</span>
                        <span class="block text-2xl font-bold text-green-800">${totalRevenue.toFixed(2)} جنيه</span>
                    </div>
                </div>
            </section>

            <main>
                <table class="w-full text-right border-collapse">
                    <thead>
                        <tr class="bg-orange-500 text-white">
                            <th class="p-3 text-sm font-bold uppercase">رقم الطلب</th>
                            <th class="p-3 text-sm font-bold uppercase">العميل</th>
                            <th class="p-3 text-sm font-bold uppercase">المطعم</th>
                            <th class="p-3 text-sm font-bold uppercase">التاريخ</th>
                            <th class="p-3 text-sm font-bold uppercase">الإجمالي</th>
                            <th class="p-3 text-sm font-bold uppercase">الحالة</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white">
                        ${tableRows}
                    </tbody>
                </table>
            </main>

        </body>
        </html>
    `;

    // 2. Open a new window, write the HTML, and trigger the print dialog
    const printWindow = window.open('', '_blank', 'height=600,width=800');
    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        // A timeout ensures that all assets like fonts and Tailwind CSS are loaded before printing.
        setTimeout(() => {
            printWindow.focus(); // required for some browsers
            printWindow.print();
            printWindow.close();
        }, 500);
    } else {
        alert('Please allow pop-ups for this website to print the report.');
    }
};
