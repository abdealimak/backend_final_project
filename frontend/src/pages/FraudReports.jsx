/**
 * Fraud Reports Page (Admin)
 * 
 * Displays all fraud-flagged transactions.
 */
import { useState, useEffect } from 'react';
import API from '../api/axios';

const FraudReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get('/fraud/reports');
        setReports(res.data.data);
      } catch (err) {
        setError('Failed to fetch fraud reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const getRiskClass = (level) => {
    if (level === 'high') return 'badge badge-danger';
    if (level === 'medium') return 'badge badge-warning';
    return 'badge badge-info';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <h1>🚨 Fraud Reports</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {reports.length === 0 ? (
        <p className="empty-message">No fraud reports found. That's good! 🎉</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Merchant</th>
                <th>Risk Level</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td className="txn-id">
                    {r.transactionId?.transactionId || 'N/A'}
                  </td>
                  <td>{r.customerId?.name || 'N/A'} ({r.customerId?.email || ''})</td>
                  <td>{r.merchantId?.businessName || 'N/A'}</td>
                  <td>
                    <span className={getRiskClass(r.riskLevel)}>
                      {r.riskLevel.toUpperCase()}
                    </span>
                  </td>
                  <td>{r.reason}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FraudReports;
