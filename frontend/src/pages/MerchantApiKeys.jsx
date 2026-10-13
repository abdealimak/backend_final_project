/**
 * Merchant API Keys Page
 * 
 * Allows merchants to:
 * - Generate new API keys
 * - View existing keys (masked)
 * - Revoke/delete keys
 */
import { useState, useEffect } from 'react';
import API from '../api/axios';

const MerchantApiKeys = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newKey, setNewKey] = useState(null); // Store newly created key to show once
  const [keyName, setKeyName] = useState('');

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await API.get('/merchants/keys');
      setKeys(res.data.data);
    } catch (err) {
      setError('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setNewKey(null);

    try {
      const res = await API.post('/merchants/keys', {
        name: keyName || 'API Key',
      });

      setNewKey(res.data.data.key);
      setSuccess('API key generated! Copy it now — it won\'t be shown in full again.');
      setKeyName('');
      fetchKeys();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate API key');
    }
  };

  const handleRevoke = async (id) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;

    try {
      await API.delete(`/merchants/keys/${id}`);
      setSuccess('API key revoked');
      fetchKeys();
    } catch (err) {
      setError('Failed to revoke API key');
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(newKey);
    setSuccess('Key copied to clipboard!');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <h1>API Keys</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* New key display */}
      {newKey && (
        <div className="card" style={{ background: '#f0fdf4', border: '2px solid #16a34a' }}>
          <h3>🔑 Your New API Key</h3>
          <p>Save this key securely. It will not be shown in full again.</p>
          <code className="api-key-display">{newKey}</code>
          <button className="btn btn-secondary btn-sm" onClick={copyKey} style={{ marginTop: '8px' }}>
            📋 Copy
          </button>
        </div>
      )}

      {/* Generate form */}
      <div className="card form-card">
        <h3>Generate New API Key</h3>
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Key Name</label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g., Production Key"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Generate Key
          </button>
        </form>
      </div>

      {/* Existing keys */}
      <h2>Your API Keys</h2>
      {keys.length === 0 ? (
        <p className="empty-message">No API keys yet.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key (masked)</th>
                <th>Status</th>
                <th>Last Used</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id}>
                  <td>{k.name}</td>
                  <td><code>{k.key}</code></td>
                  <td>
                    <span className={`badge ${k.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {k.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td>{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}</td>
                  <td>{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td>
                    {k.isActive && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRevoke(k.id)}
                      >
                        Revoke
                      </button>
                    )}
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

export default MerchantApiKeys;
