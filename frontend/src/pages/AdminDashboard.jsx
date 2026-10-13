/**
 * Admin Dashboard
 * 
 * Shows:
 * - Platform-wide stats (from /api/admin/reports)
 * - Fee configuration
 * - Settlement rules configuration
 * - Recent transactions
 * - User/merchant management links
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import StatCard from '../components/StatCard';
import TransactionTable from '../components/TransactionTable';

const AdminDashboard = () => {
  const [report, setReport] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [users, setUsers] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fee/settlement form
  const [feePercentage, setFeePercentage] = useState('');
  const [settlementFrequency, setSettlementFrequency] = useState('');
  const [minSettlement, setMinSettlement] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportRes, txnRes, settingsRes, usersRes, merchantsRes, disputesRes] = await Promise.all([
        API.get('/admin/reports'),
        API.get('/admin/transactions'),
        API.get('/admin/settings'),
        API.get('/admin/users'),
        API.get('/admin/merchants'),
        API.get('/admin/disputes'),
      ]);

      setReport(reportRes.data.data);
      setTransactions(txnRes.data.data);
      setSettings(settingsRes.data.data);
      setUsers(usersRes.data.data);
      setMerchants(merchantsRes.data.data);
      setDisputes(disputesRes.data.data || []);

      setFeePercentage(settingsRes.data.data.transactionFeePercentage);
      setSettlementFrequency(settingsRes.data.data.settlementFrequency);
      setMinSettlement(settingsRes.data.data.minimumSettlementAmount);
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.put('/admin/fees', {
        transactionFeePercentage: parseFloat(feePercentage),
      });
      setSuccess('Transaction fee updated!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update fee');
    }
  };

  const handleUpdateSettlement = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.put('/admin/settlement-rules', {
        settlementFrequency,
        minimumSettlementAmount: parseFloat(minSettlement),
      });
      setSuccess('Settlement rules updated!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settlement rules');
    }
  };

  const handleToggleUser = async (userId, isActive) => {
    try {
      await API.put(`/admin/users/${userId}`, { isActive: !isActive });
      setSuccess(`User ${!isActive ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (err) {
      setError('Failed to update user');
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Platform Stats */}
      {report && (
        <div className="stats-grid">
          <StatCard title="Total Transactions" value={report.totalTransactions} icon="💳" color="#4f46e5" />
          <StatCard title="Successful" value={report.successful} icon="✅" color="#16a34a" />
          <StatCard title="Failed" value={report.failed} icon="❌" color="#dc2626" />
          <StatCard title="Pending" value={report.pending} icon="⏳" color="#f59e0b" />
          <StatCard title="Volume" value={`₹${report.transactionVolume}`} icon="📊" color="#7c3aed" />
          <StatCard title="Revenue" value={`₹${report.gatewayRevenue}`} icon="💰" color="#0891b2" />
          <StatCard title="Refunds" value={`₹${report.totalRefunds}`} icon="🔄" color="#ea580c" />
          <StatCard title="Fraud Flags" value={report.fraudFlags} icon="🚨" color="#dc2626" />
        </div>
      )}

      <div className="quick-actions">
        <Link to="/fraud-reports" className="btn btn-danger">🚨 Fraud Reports</Link>
      </div>

      {/* Configuration Section */}
      <div className="admin-config-grid">
        {/* Fee Configuration */}
        <div className="card form-card">
          <h3>💸 Transaction Fee</h3>
          <form onSubmit={handleUpdateFee}>
            <div className="form-group">
              <label>Fee Percentage (%)</label>
              <input
                type="number"
                value={feePercentage}
                onChange={(e) => setFeePercentage(e.target.value)}
                min="0"
                max="20"
                step="0.1"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Update Fee</button>
          </form>
        </div>

        {/* Settlement Rules */}
        <div className="card form-card">
          <h3>📅 Settlement Rules</h3>
          <form onSubmit={handleUpdateSettlement}>
            <div className="form-group">
              <label>Frequency</label>
              <select value={settlementFrequency} onChange={(e) => setSettlementFrequency(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="form-group">
              <label>Minimum Amount (₹)</label>
              <input
                type="number"
                value={minSettlement}
                onChange={(e) => setMinSettlement(e.target.value)}
                min="0"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Update Rules</button>
          </form>
        </div>
      </div>

      {/* User Management */}
      <h2>Users ({users.length})</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge badge-info">{u.role}</span></td>
                <td>
                  <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${u.isActive ? 'btn-warning' : 'btn-secondary'}`}
                    onClick={() => handleToggleUser(u._id, u.isActive)}
                  >
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Merchants */}
      <h2>Merchants ({merchants.length})</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {merchants.map((m) => (
              <tr key={m._id}>
                <td>{m.businessName}</td>
                <td>{m.email}</td>
                <td>
                  <span className={`badge ${m.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {m.status}
                  </span>
                </td>
                <td>₹{m.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Transactions */}
      <h2>Recent Transactions</h2>
      <TransactionTable transactions={transactions.slice(0, 10)} />
    </div>
  );
};

export default AdminDashboard;
