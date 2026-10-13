/**
 * App.jsx — Main Application with Routing
 * 
 * Sets up React Router with:
 * - Public routes (login, register)
 * - Protected routes (dashboards, based on role)
 * - Default redirect based on user role
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import PaymentMethods from './pages/PaymentMethods';
import MakePayment from './pages/MakePayment';
import Transactions from './pages/Transactions';
import MerchantDashboard from './pages/MerchantDashboard';
import MerchantApiKeys from './pages/MerchantApiKeys';
import Settlements from './pages/Settlements';
import Refunds from './pages/Refunds';
import AdminDashboard from './pages/AdminDashboard';
import FraudReports from './pages/FraudReports';
import NotFound from './pages/NotFound';

import './styles/App.css';

/**
 * Home redirector — sends user to their role-specific dashboard
 */
const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin-dashboard" />;
  if (user.role === 'merchant') return <Navigate to="/merchant-dashboard" />;
  return <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Home redirect */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Customer Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/payment-methods" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PaymentMethods />
              </ProtectedRoute>
            } />
            <Route path="/make-payment" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <MakePayment />
              </ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Transactions />
              </ProtectedRoute>
            } />

            {/* Merchant Routes */}
            <Route path="/merchant-dashboard" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantDashboard />
              </ProtectedRoute>
            } />
            <Route path="/merchant-api-keys" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <MerchantApiKeys />
              </ProtectedRoute>
            } />
            <Route path="/settlements" element={
              <ProtectedRoute allowedRoles={['merchant', 'admin']}>
                <Settlements />
              </ProtectedRoute>
            } />
            <Route path="/refunds" element={
              <ProtectedRoute allowedRoles={['customer', 'merchant', 'admin']}>
                <Refunds />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/fraud-reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <FraudReports />
              </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
