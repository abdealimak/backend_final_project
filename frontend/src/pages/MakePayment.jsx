/**
 * Make Payment Page
 * 
 * Form for customers to:
 * 1. Select a merchant
 * 2. Select a payment method
 * 3. Enter amount and description
 * 4. Submit payment
 * 5. See result (transaction ID, status, fee)
 */
import { useState, useEffect } from 'react';
import API from '../api/axios';

const MakePayment = () => {
  const [merchants, setMerchants] = useState([]);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Form state
  const [merchantId, setMerchantId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [merchantRes, methodRes] = await Promise.all([
          API.get('/merchants'),
          API.get('/payment-methods'),
        ]);
        setMerchants(merchantRes.data.data);
        setMethods(methodRes.data.data);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setSubmitting(true);

    try {
      const res = await API.post('/payments', {
        merchantId,
        paymentMethodId,
        amount: parseFloat(amount),
        description,
      });

      setResult(res.data.data);
      // Clear form
      setAmount('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fillScenario = (testAmount, testDesc) => {
    setAmount(testAmount);
    setDescription(testDesc);
    if (!merchantId && merchants.length > 0) {
      setMerchantId(merchants[0]._id);
    }
    if (!paymentMethodId && methods.length > 0) {
      setPaymentMethodId(methods[0]._id);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <h1>Make Payment</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Quick Test Demo Presets */}
      <div className="card" style={{ marginBottom: '24px', background: '#f8fafc' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px', color: '#334155' }}>
          ⚡ Quick Demo Scenarios (1-Click Test)
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Click any preset to automatically configure demo values and test the backend rules:
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => fillScenario('500', 'T-shirt purchase')}
          >
            ✅ Normal Payment (₹500)
          </button>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => fillScenario('13', 'Simulated failure trigger')}
          >
            ❌ Trigger Failure (₹13)
          </button>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => fillScenario('55000', 'Luxury watch purchase')}
          >
            🚨 Fraud Alert (₹55,000)
          </button>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => fillScenario('120000', 'Wholesale gadgets')}
          >
            ⏳ Manual Review (₹1,20,000)
          </button>
        </div>
      </div>

      {/* Payment Result */}
      {result && (
        <div className={`card result-card result-${result.status}`}>
          <h2>
            {result.status === 'success' ? '✅' : result.status === 'pending' ? '⏳' : '❌'}
            {' '}Payment {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
          </h2>
          <div className="result-details">
            <p><strong>Transaction ID:</strong> {result.transactionId}</p>
            <p><strong>Amount:</strong> ₹{result.amount}</p>
            <p><strong>Fee:</strong> ₹{result.fee}</p>
            <p><strong>Net Amount:</strong> ₹{result.netAmount}</p>
            <p><strong>Status:</strong> <span className={`badge badge-${result.status === 'success' ? 'success' : result.status === 'pending' ? 'warning' : 'danger'}`}>{result.status}</span></p>
            {result.fraudCheck?.flagged && (
              <p className="fraud-warning">
                ⚠️ Fraud Alert: {result.fraudCheck.reason} (Risk: {result.fraudCheck.riskLevel})
              </p>
            )}
          </div>
        </div>
      )}

      {/* Payment Form */}
      <div className="card form-card">
        <form onSubmit={handlePayment}>
          <div className="form-group">
            <label>Merchant</label>
            <select
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              required
            >
              <option value="">Select a merchant</option>
              {merchants.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.businessName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              value={paymentMethodId}
              onChange={(e) => setPaymentMethodId(e.target.value)}
              required
            >
              <option value="">Select payment method</option>
              {methods.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.nickname || m.provider} ({m.type}
                  {m.last4 ? ` •••• ${m.last4}` : ''}
                  {m.upiId ? ` ${m.upiId}` : ''})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              step="0.01"
              required
            />
            <small className="form-hint">
              Tip: ₹13 = simulated failure | ₹100001+ = pending for review | ₹50001+ = fraud flag
            </small>
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., T-shirt purchase"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MakePayment;
