import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import VendorPage from './pages/VendorPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import DeliveryDashboard from './pages/DeliveryDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import MyOrdersPage from './pages/MyOrdersPage';
import VendorDashboard from './pages/VendorDashboard';
import { UserRole } from './types';
import ErrorBoundary from './components/ErrorBoundary';
import VendorListPage from './pages/VendorListPage';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <CartProvider>
            <HashRouter>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/category/:categoryName" element={<VendorListPage />} />
                    <Route path="/vendor/:id" element={<VendorPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />

                    <Route path="/my-orders" element={
                      <ProtectedRoute roles={[UserRole.CUSTOMER]}>
                        <MyOrdersPage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/delivery" element={
                      <ProtectedRoute roles={[UserRole.DELIVERY, UserRole.ADMIN]}>
                        <DeliveryDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <ProtectedRoute roles={[UserRole.ADMIN]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                     <Route path="/vendor-dashboard" element={
                      <ProtectedRoute roles={[UserRole.RESTAURANT, UserRole.ADMIN]}>
                        <VendorDashboard />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </main>
                <Footer />
              </div>
            </HashRouter>
          </CartProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactElement; roles: UserRole[] }> = ({ children, roles }) => {
    const { user } = useAuth();
  
    if (!user) {
      return <Navigate to="/login" replace />;
    }
  
    if (!roles.includes(user.role)) {
      // User is logged in, but doesn't have the right role. Redirect them to a sensible default page.
      if (user.role === UserRole.ADMIN) return <Navigate to="/admin" replace />;
      if (user.role === UserRole.DELIVERY) return <Navigate to="/delivery" replace />;
      if (user.role === UserRole.RESTAURANT) return <Navigate to="/vendor-dashboard" replace />;
      return <Navigate to="/" replace />; // Customer default
    }
  
    return children;
};


export default App;