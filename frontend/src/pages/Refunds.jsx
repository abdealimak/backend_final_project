/**
 * Refunds Management Page
 * 
 * Allows:
 * - Merchants: view refund requests, approve or reject them with real-time updates
 * - Customers: track the status of their requested refunds
 * - Admins: monitor all platform refund activity
 */
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';

const Refunds = () => {
  const { user } = useAuth();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of item being approved/rejected
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [liveNotice, setLiveNotice] = useState('');

  useEffect(() => {
    fetchRefunds();

    // Connect to Socket.io for real-time notifications
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5005');

    socket.on('refundRequested', (data) => {
      setLiveNotice(`🔔 New refund request: ₹${data.amount} for "${data.reason}"`);
      fetchRefunds();
      setTimeout(() => setLiveNotice(''), 6000);
    });

    socket.on('paymentRefunded', (data) => {
      setLiveNotice(`✅ Refund approved: ₹${data.amount}`);
      fetchRefunds();
      setTimeout(() => setLiveNotice(''), 6000);
    });

    socket.on('refundRejected', () => {
      setLiveNotice(`❌ A refund request was rejected`);
      fetchRefunds();
      setTimeout(() => setLiveNotice(''), 6000);
    });

    return () => socket.disconnect();
  }, []);

  const fetchRefunds = async () => {
    try {
      const res = await API.get('/refunds');
      setRefunds(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch refunds');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this refund? The funds will be deducted from your account.')) {
      return;
    }

    setError('');
    setSuccess('');
    setActionLoading(id);

    try {
      const res = await API.put(`/refunds/${id}/approve`);
      setSuccess(res.data?.message || 'Refund approved successfully!');
      fetchRefunds();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve refund');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this refund request?')) {
      return;
    }

    setError('');
    setSuccess('');
    setActionLoading(id);

    try {
      const res = await API.put(`/refunds/${id}/reject`);
      setSuccess(res.data?.message || 'Refund request rejected.');
      fetchRefunds();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject refund');
    } finally {
      setActionLoading(null);
    }
  };

  // Stats calculation
  const totalCount = refunds.length;
  const pendingCount = refunds.filter((r) => r.status === 'requested').length;
  const approvedCount = refunds.filter((r) => r.status === 'refunded' || r.status === 'approved').length;
  const rejectedCount = refunds.filter((r) => r.status === 'rejected').length;

  if (loading) return <div className="loading">Loading refunds...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{user.role === 'customer' ? 'My Refund Requests' : 'Refund Management'}</h1>
      </div>

      {liveNotice && <div className="alert alert-info">{liveNotice}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Summary Stat Cards */}
      <div className="stats-grid">
        <StatCard title="Total Refunds" value={totalCount} icon="🔄" color="#4f46e5" />
        <StatCard title="Pending Review" value={pendingCount} icon="⏳" color="#f59e0b" />
        <StatCard title="Approved / Refunded" value={approvedCount} icon="✅" color="#16a34a" />
        <StatCard title="Rejected" value={rejectedCount} icon="❌" color="#dc2626" />
      </div>

      <h2>Refund Requests</h2>

      {refunds.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="empty-message">
            {user.role === 'customer'
              ? 'You have not requested any refunds yet. You can request a refund from your Transaction History page.'
              : 'No refund requests found.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Refund ID</th>
                {user.role !== 'customer' && <th>Customer</th>}
                {user.role === 'customer' && <th>Merchant</th>}
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Requested On</th>
                {(user.role === 'merchant' || user.role === 'admin') && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {refunds.map((r) => {
                const isPending = r.status === 'requested';
                const isApproved = r.status === 'refunded' || r.status === 'approved';

                return (
                  <tr key={r._id}>
                    <td className="txn-id">{r._id.slice(-8).toUpperCase()}</td>

                    {user.role !== 'customer' && (
                      <td>
                        <strong>{r.customerId?.name || 'Customer'}</strong>
                        <br />
                        <small style={{ color: 'var(--text-light)' }}>{r.customerId?.email}</small>
                      </td>
                    )}

                    {user.role === 'customer' && (
                      <td>{r.merchantId?.businessName || 'Merchant'}</td>
                    )}

                    <td className="txn-id">
                      {r.transactionId?.transactionId || (typeof r.transactionId === 'string' ? r.transactionId : 'N/A')}
                    </td>

                    <td><strong>₹{r.amount}</strong></td>

                    <td>
                      <span title={r.reason}>
                        {r.reason.length > 35 ? `${r.reason.substring(0, 35)}...` : r.reason}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          isApproved
                            ? 'badge-success'
                            : isPending
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {isPending ? 'Pending' : isApproved ? 'Refunded' : 'Rejected'}
                      </span>
                    </td>

                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>

                    {(user.role === 'merchant' || user.role === 'admin') && (
                      <td>
                        {isPending ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleApprove(r._id)}
                              disabled={actionLoading === r._id}
                            >
                              {actionLoading === r._id ? '...' : '✓ Approve'}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(r._id)}
                              disabled={actionLoading === r._id}
                            >
                              {actionLoading === r._id ? '...' : '✕ Reject'}
                            </button>
                          </div>
                        ) : (
                          <small style={{ color: 'var(--text-light)' }}>
                            {isApproved ? 'Processed' : 'Closed'}
                          </small>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Refunds;
