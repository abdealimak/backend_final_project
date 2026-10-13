/**
 * Payment Methods Page
 * 
 * Allows customers to:
 * - View their saved payment methods
 * - Add new card/UPI/wallet
 * - Delete existing methods
 */
import { useState, useEffect } from 'react';
import API from '../api/axios';

const PaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('card');
  const [provider, setProvider] = useState('');
  const [last4, setLast4] = useState('');
  const [upiId, setUpiId] = useState('');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const res = await API.get('/payment-methods');
      setMethods(res.data.data);
    } catch (err) {
      setError('Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await API.post('/payment-methods', {
        type,
        provider,
        last4: type === 'card' ? last4 : undefined,
        upiId: type === 'upi' ? upiId : undefined,
        nickname,
      });

      setSuccess('Payment method added!');
      setShowForm(false);
      setProvider('');
      setLast4('');
      setUpiId('');
      setNickname('');
      fetchMethods();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add payment method');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this payment method?')) return;

    try {
      await API.delete(`/payment-methods/${id}`);
      setSuccess('Payment method removed');
      fetchMethods();
    } catch (err) {
      setError('Failed to remove payment method');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Payment Methods</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add Method'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="card form-card">
          <h3>Add Payment Method</h3>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="wallet">Wallet</option>
              </select>
            </div>

            <div className="form-group">
              <label>Provider</label>
              <input
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder={
                  type === 'card' ? 'Visa, Mastercard...' :
                  type === 'upi' ? 'Google Pay, PhonePe...' :
                  'Paytm, PhonePe...'
                }
                required
              />
            </div>

            {type === 'card' && (
              <div className="form-group">
                <label>Last 4 Digits</label>
                <input
                  type="text"
                  value={last4}
                  onChange={(e) => setLast4(e.target.value)}
                  placeholder="4242"
                  maxLength={4}
                  pattern="\d{4}"
                  required
                />
              </div>
            )}

            {type === 'upi' && (
              <div className="form-group">
                <label>UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Nickname (optional)</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="My Visa Card"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Add Payment Method
            </button>
          </form>
        </div>
      )}

      <div className="methods-grid">
        {methods.length === 0 ? (
          <p className="empty-message">No payment methods yet. Add one to start making payments.</p>
        ) : (
          methods.map((m) => (
            <div className="card method-card" key={m._id}>
              <div className="method-icon">
                {m.type === 'card' ? '💳' : m.type === 'upi' ? '📱' : '👛'}
              </div>
              <div className="method-info">
                <h3>{m.nickname || m.provider}</h3>
                <p className="method-type">{m.type.toUpperCase()} • {m.provider}</p>
                {m.last4 && <p>•••• {m.last4}</p>}
                {m.upiId && <p>{m.upiId}</p>}
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(m._id)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentMethods;
