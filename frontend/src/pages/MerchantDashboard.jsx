/**
 * Merchant Dashboard
 * 
 * Shows:
 * - Incoming payment stats
 * - Revenue and settlement estimates
 * - Transaction table
 * - Real-time Socket.io payment notifications
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import API from '../api/axios';
import StatCard from '../components/StatCard';
import TransactionTable from '../components/TransactionTable';

const MerchantDashboard = () => {
  const [merchant, setMerchant] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchData();

    // Socket.io for real-time payment notifications
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');

    socket.on('paymentCreated', (data) => {
      setNotification(`💰 New payment received: ₹${data.amount} - ${data.status}`);
      fetchData();
      setTimeout(() => setNotification(''), 5000);
    });

    socket.on('refundRequested', (data) => {
      setNotification(`⚠️ New refund request: ₹${data.amount} for "${data.reason}"`);
      fetchData();
      setTimeout(() => setNotification(''), 6000);
    });

    return () => socket.disconnect();
  }, []);

  const fetchData = async () => {
    try {
      // Get merchant's own profile
      const merchantsRes = await API.get('/merchants');
      const allMerchants = merchantsRes.data.data;

      // We need to find our own merchant profile — get it from merchant list
      // For a simple approach, get the first one that matches (merchant sees their own)
      if (allMerchants.length > 0) {
        const myMerchant = allMerchants[0]; // Will refine with proper endpoint
        setMerchant(myMerchant);

        // Get transactions for this merchant
        const txnRes = await API.get(`/merchants/${myMerchant._id}/transactions`);
        setTransactions(txnRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch merchant data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  if (!merchant) {
    return (
      <div className="page">
        <h1>Merchant Dashboard</h1>
        <div className="card">
          <p>You don't have a merchant profile yet.</p>
          <p>Register your business to start accepting payments.</p>
        </div>
      </div>
    );
  }

  const totalPayments = transactions.length;
  const successPayments = transactions.filter((t) => t.status === 'success').length;
  const pendingPayments = transactions.filter((t) => t.status === 'pending').length;
  const totalRevenue = transactions
    .filter((t) => t.status === 'success')
    .reduce((sum, t) => sum + t.netAmount, 0);

  return (
    <div className="page">
      <h1>{merchant.businessName} - Dashboard</h1>

      {notification && (
        <div className="alert alert-info">{notification}</div>
      )}

      <div className="stats-grid">
        <StatCard title="Total Payments" value={totalPayments} icon="💳" color="#4f46e5" />
        <StatCard title="Successful" value={successPayments} icon="✅" color="#16a34a" />
        <StatCard title="Pending" value={pendingPayments} icon="⏳" color="#f59e0b" />
        <StatCard title="Revenue" value={`₹${totalRevenue.toFixed(2)}`} icon="💰" color="#7c3aed" />
      </div>

      <div className="quick-actions">
        <Link to="/merchant-api-keys" className="btn btn-secondary">🔑 API Keys</Link>
        <Link to="/settlements" className="btn btn-primary">📊 Settlements</Link>
        <Link to="/refunds" className="btn btn-secondary">🔄 Refunds</Link>
      </div>

      <h2>Incoming Payments</h2>
      <TransactionTable transactions={transactions.slice(0, 10)} />
    </div>
  );
};

export default MerchantDashboard;
