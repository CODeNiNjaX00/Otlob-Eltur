import React, { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import GoogleIcon from '../components/icons/GoogleIcon';
import FacebookIcon from '../components/icons/FacebookIcon';

const neighborhoods = [
  'الآمل',
  'ابن بيتك',
  'الجامعة',
  'التجارية',
  'الجبـل',
  'الزهراء',
  'الزهور',
  'الشروق',
  'المنشية',
  'النصر',
  'الوادي',
  'توشكي',
  'حي السلام',
  'حي النادي',
  'عمائر البنك',
  'مصيّد',
  'مبارك الجديد',
  'مبارك القديم',
  'الفيـروز',
  'أرض الجمعية',
];

const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [phone, setPhone] = useState('');
  
  const { login, register, user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور.');
        return;
    }
    setError('');
    try {
      await login(email, password);
      // Redirect handled by useEffect
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone || !neighborhood || !addressDetails) {
        setError('الرجاء تعبئة جميع الحقول.');
        return;
    }
    setError('');
    try {
        await register({ 
            name, 
            email, 
            password, 
            phone_number: phone, 
            district: neighborhood, 
            address_details: addressDetails 
        });
        // Redirect handled by useEffect
    } catch (err: any) {
        setError(err.message);
    }
  };



  React.useEffect(() => {
    if (user) {
        switch(user.role) {
            case UserRole.ADMIN:
                navigate('/admin');
                break;
            case UserRole.DELIVERY:
                navigate('/delivery');
                break;
            case UserRole.RESTAURANT:
                navigate('/restaurant-dashboard');
                break;
            default:
                navigate('/');
                break;
        }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
          <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
            <button 
              onClick={() => setIsRegister(false)}
              className={`w-1/2 py-4 text-center font-semibold transition-colors ${!isRegister ? 'text-primary-500 border-b-2 border-primary-500' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`w-1/2 py-4 text-center font-semibold transition-colors ${isRegister ? 'text-primary-500 border-b-2 border-primary-500' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              إنشاء حساب
            </button>
          </div>

          {isRegister ? (
            /* Registration Form */
            <form className="space-y-4" onSubmit={handleRegister}>
              <h2 className="text-xl font-bold text-center text-slate-800 dark:text-white mb-4">إنشاء حساب جديد</h2>
              <input type="text" placeholder="الاسم الكامل" value={name} onChange={(e) => setName(e.target.value)} required className="input-field" />
              <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" />
              <input type="tel" placeholder="رقم الهاتف" value={phone} onChange={(e) => setPhone(e.target.value)} required className="input-field" style={{ textAlign: 'right' }} />
              <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" />
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                required
                className="input-field"
              >
                <option value="" disabled>اختر الحي</option>
                {neighborhoods.map((hood) => (
                  <option key={hood} value={hood}>{hood}</option>
                ))}
              </select>
               <input 
                type="text" 
                placeholder="العنوان بالتفصيل (الشارع، رقم العمارة، الشقة)" 
                value={addressDetails} 
                onChange={(e) => setAddressDetails(e.target.value)} 
                required 
                className="input-field" 
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}</button>
            </form>
          ) : (
            /* Login Form */
            <form className="space-y-4" onSubmit={handleLogin}>
                <h2 className="text-xl font-bold text-center text-slate-800 dark:text-white mb-4">مرحباً بعودتك!</h2>
              <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" />
              <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'جاري الدخول...' : 'تسجيل الدخول'}</button>
            </form>
          )}


        </div>
      </div>
    </div>
  );
};

// Add some base styles to a style tag to avoid repeating them
const style = document.createElement('style');
style.innerHTML = `
  .input-field {
    appearance: none;
    position: relative;
    display: block;
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid;
    border-radius: 0.5rem;
    transition: all 0.2s;
  }
  .light .input-field {
    border-color: #cbd5e1;
    background-color: #fff;
    color: #1e293b;
  }
  .dark .input-field {
    border-color: #475569;
    background-color: #334155;
    color: #f1f5f9;
  }
  .input-field:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
    border-color: #f97316;
    --tw-ring-color: #f97316;
    box-shadow: 0 0 0 2px var(--tw-ring-color);
  }
  .btn-primary {
    display: flex;
    justify-content: center;
    padding: 0.75rem 1rem;
    border: 1px solid transparent;
    font-weight: 600;
    border-radius: 0.5rem;
    color: white;
    background-color: #f97316;
    transition: background-color 0.2s;
  }
  .btn-primary:hover {
    background-color: #ea580c;
  }
  .btn-primary:disabled {
    background-color: #fb923c;
    cursor: not-allowed;
  }
  .social-btn {
    width: 100%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid;
    border-radius: 0.5rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    font-weight: 500;
    transition: background-color 0.2s;
  }
  .light .social-btn {
     border-color: #e2e8f0;
     background-color: #fff;
     color: #475569;
  }
   .dark .social-btn {
     border-color: #475569;
     background-color: #334155;
     color: #cbd5e1;
  }
  .light .social-btn:hover {
      background-color: #f8fafc;
  }
  .dark .social-btn:hover {
      background-color: #475569;
  }
`;
document.head.appendChild(style);


export default LoginPage;
