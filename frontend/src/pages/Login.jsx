/**
 * Login Page
 * 
 * Supports two login methods:
 * 1. Local login (email/password → backend JWT)
 * 2. Firebase login (Firebase Auth → backend JWT)
 * 
 * Toggle between them with a button.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useFirebase, setUseFirebase] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, firebaseLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;

      if (useFirebase) {
        // Firebase Auth flow
        result = await firebaseLogin(email, password);
      } else {
        // Local JWT flow
        result = await login(email, password);
      }

      // Redirect based on role
      const role = result.data.user.role;
      if (role === 'admin') navigate('/admin-dashboard');
      else if (role === 'merchant') navigate('/merchant-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🔒 PaySecure</h1>
        <h2>Login</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useFirebase}
                onChange={(e) => setUseFirebase(e.target.checked)}
              />
              Use Firebase Authentication
            </label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>

        <div className="demo-credentials">
          <h4>Demo Credentials</h4>
          <p><strong>Admin:</strong> admin@paysecure.com / admin123</p>
          <p><strong>Customer:</strong> customer@paysecure.com / customer123</p>
          <p><strong>Merchant:</strong> merchant@paysecure.com / merchant123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
