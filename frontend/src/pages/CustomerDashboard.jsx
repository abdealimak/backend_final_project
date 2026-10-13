/**
 * Customer Dashboard
 * 
 * Shows:
 * - Payment stats (total, success, pending, failed)
 * - Quick action buttons
 * - Recent transactions
 * - Real-time Socket.io notifications
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from '../api/axios';
import StatCard from '../components/StatCard';
import TransactionTable from '../components/TransactionTable';

const CustomerDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchTransactions();

    // Connect to Socket.io for real-time updates
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');

    socket.on('paymentCreated', (data) => {
      setNotification(`💰 New payment: ₹${data.amount} - ${data.status}`);
      fetchTransactions(); // Refresh data
      setTimeout(() => setNotification(''), 5000);
    });

    socket.on('paymentRefunded', (data) => {
      setNotification(`🔄 Refund processed: ₹${data.amount}`);
      fetchTransactions();
      setTimeout(() => setNotification(''), 5000);
    });

    return () => socket.disconnect();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/payments');
      setTransactions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalPayments = transactions.length;
  const successPayments = transactions.filter((t) => t.status === 'success').length;
  const pendingPayments = transactions.filter((t) => t.status === 'pending').length;
  const failedPayments = transactions.filter((t) => t.status === 'failed').length;

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="page">
      <h1>Customer Dashboard</h1>

      {notification && (
        <div className="alert alert-info">{notification}</div>
      )}

      <div className="stats-grid">
        <StatCard title="Total Payments" value={totalPayments} icon="💳" color="#4f46e5" />
        <StatCard title="Successful" value={successPayments} icon="✅" color="#16a34a" />
        <StatCard title="Pending" value={pendingPayments} icon="⏳" color="#f59e0b" />
        <StatCard title="Failed" value={failedPayments} icon="❌" color="#dc2626" />
      </div>

      <div className="quick-actions">
        <Link to="/payment-methods" className="btn btn-secondary">💳 Payment Methods</Link>
        <Link to="/make-payment" className="btn btn-primary">💰 Make Payment</Link>
        <Link to="/transactions" className="btn btn-secondary">📋 All Transactions</Link>
        <Link to="/refunds" className="btn btn-secondary">🔄 My Refunds</Link>
      </div>

      <h2>Recent Transactions</h2>
      <TransactionTable transactions={transactions.slice(0, 5)} />
    </div>
  );
};

export default CustomerDashboard;
