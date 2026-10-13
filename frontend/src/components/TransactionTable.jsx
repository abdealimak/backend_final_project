/**
 * TransactionTable Component
 * 
 * Reusable table to display transactions.
 * Used by Customer, Merchant, and Admin dashboards.
 */
const TransactionTable = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return <p className="empty-message">No transactions found.</p>;
  }

  // Helper to get status badge class
  const getStatusClass = (status) => {
    if (status === 'success') return 'badge badge-success';
    if (status === 'failed') return 'badge badge-danger';
    if (status === 'refunded') return 'badge badge-info';
    return 'badge badge-warning';
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Amount (₹)</th>
            <th>Fee (₹)</th>
            <th>Status</th>
            <th>Description</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn._id}>
              <td className="txn-id">{txn.transactionId}</td>
              <td>₹{txn.amount}</td>
              <td>₹{txn.fee}</td>
              <td>
                <span className={getStatusClass(txn.status)}>
                  {txn.status}
                </span>
              </td>
              <td>{txn.description || '-'}</td>
              <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
