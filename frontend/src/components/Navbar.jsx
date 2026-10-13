/**
 * Navbar Component
 * 
 * Shows navigation links based on user role.
 * Different menus for customer, merchant, and admin.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🔒 PaySecure</Link>
      </div>

      <div className="navbar-links">
        {/* Customer Navigation */}
        {user.role === 'customer' && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/payment-methods">Payment Methods</Link>
            <Link to="/make-payment">Make Payment</Link>
            <Link to="/transactions">Transactions</Link>
            <Link to="/refunds">Refunds</Link>
          </>
        )}

        {/* Merchant Navigation */}
        {user.role === 'merchant' && (
          <>
            <Link to="/merchant-dashboard">Dashboard</Link>
            <Link to="/merchant-api-keys">API Keys</Link>
            <Link to="/settlements">Settlements</Link>
            <Link to="/refunds">Refunds</Link>
          </>
        )}

        {/* Admin Navigation */}
        {user.role === 'admin' && (
          <>
            <Link to="/admin-dashboard">Dashboard</Link>
            <Link to="/fraud-reports">Fraud Reports</Link>
            <Link to="/refunds">Refunds</Link>
          </>
        )}

        <div className="navbar-user">
          <span className="navbar-role">{user.role}</span>
          <span className="navbar-name">{user.name}</span>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
