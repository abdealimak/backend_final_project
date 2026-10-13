/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication.
 * - If not logged in → redirect to /login
 * - If logged in but wrong role → redirect to appropriate dashboard
 * - If loading → show loading indicator
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Logged in but not authorized for this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    if (user.role === 'customer') return <Navigate to="/dashboard" />;
    if (user.role === 'merchant') return <Navigate to="/merchant-dashboard" />;
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
