/**
 * Settlements Page
 * 
 * Shows settlement history for merchants.
 * Allows generating new settlements for the last 30 days.
 */
import { useState, useEffect } from 'react';
import API from '../api/axios';

const Settlements = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      const res = await API.get('/settlements');
      setSettlements(res.data.data);
    } catch (err) {
      setError('Failed to fetch settlements');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setError('');
    setSuccess('');

    try {
      const res = await API.post('/settlements/generate');
      setSuccess('Settlement generated successfully!');
      fetchSettlements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate settlement');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Settlements</h1>
        <button className="btn btn-primary" onClick={handleGenerate}>
          Generate Settlement (Last 30 Days)
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {settlements.length === 0 ? (
        <p className="empty-message">No settlements yet. Generate one from your successful transactions.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Settlement ID</th>
                <th>Gross Amount (₹)</th>
                <th>Fees (₹)</th>
                <th>Net Amount (₹)</th>
                <th>Status</th>
                <th>Period</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s._id}>
                  <td className="txn-id">{s.settlementId}</td>
                  <td>₹{s.grossAmount}</td>
                  <td>₹{s.totalFees}</td>
                  <td><strong>₹{s.netAmount}</strong></td>
                  <td>
                    <span className={`badge ${s.status === 'processed' ? 'badge-success' : 'badge-warning'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    {new Date(s.periodStart).toLocaleDateString()} - {new Date(s.periodEnd).toLocaleDateString()}
                  </td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Settlements;
