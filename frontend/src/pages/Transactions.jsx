/**
 * Transactions Page (Customer)
 * 
 * Shows full transaction history with:
 * - Transaction table
 * - Refund request button for successful transactions
 * - Dispute button
 */
import { useState, useEffect } from 'react';
import API from '../api/axios';
import TransactionTable from '../components/TransactionTable';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/payments');
      setTransactions(res.data.data);
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (txnId) => {
    const reason = prompt('Reason for refund:');
    if (!reason) return;

    setError('');
    setSuccess('');

    try {
      await API.post('/payments/refund', {
        transactionId: txnId,
        reason,
      });
      setSuccess(res.data?.message || 'Refund request submitted! Awaiting merchant approval.');
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Refund failed');
    }
  };

  const handleDispute = async (txnId) => {
    const reason = prompt('Reason for dispute:');
    if (!reason) return;

    setError('');
    setSuccess('');

    try {
      await API.post(`/payments/${txnId}/dispute`, { reason });
      setSuccess('Dispute created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create dispute');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess(`Copied Transaction ID: ${text}`);
    setTimeout(() => setSuccess(''), 2500);
  };

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      (txn.transactionId && txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (txn.description && txn.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (txn.merchantId?.businessName && txn.merchantId.businessName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Transaction History</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1', minWidth: '240px' }}>
            <input
              type="text"
              placeholder="🔍 Search by ID, description, or merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px',
                borderRadius: 'var(--radius)',
                border: '1.5px solid var(--border)',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
            {['all', 'success', 'pending', 'failed', 'refunded'].map((status) => (
              <button
                key={status}
                type="button"
                className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(status)}
                style={{ textTransform: 'capitalize' }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <p className="empty-message">No matching transactions found.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Merchant</th>
                <th>Amount (₹)</th>
                <th>Fee (₹)</th>
                <th>Status</th>
                <th>Description</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => (
                <tr key={txn._id}>
                  <td>
                    <span
                      className="txn-id"
                      onClick={() => copyToClipboard(txn.transactionId)}
                      title="Click to copy ID"
                      style={{ cursor: 'pointer' }}
                    >
                      {txn.transactionId} 📋
                    </span>
                  </td>
                  <td>{txn.merchantId?.businessName || '-'}</td>
                  <td><strong>₹{txn.amount}</strong></td>
                  <td>₹{txn.fee}</td>
                  <td>
                    <span className={`badge badge-${txn.status === 'success' ? 'success' : txn.status === 'failed' ? 'danger' : txn.status === 'refunded' ? 'info' : 'warning'}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td>{txn.description || '-'}</td>
                  <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {txn.status === 'success' && (
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleRefund(txn._id)}
                          title="Request a refund from merchant"
                        >
                          Refund
                        </button>
                      )}
                      {txn.status !== 'refunded' && (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleDispute(txn._id)}
                          title="File a dispute with platform admin"
                        >
                          Dispute
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;
