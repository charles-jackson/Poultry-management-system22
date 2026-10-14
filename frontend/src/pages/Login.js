import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.response?.status === 503) {
        setError('Backend service is waking up or database is not connected on Render. Please wait a moment and try again.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to backend server. Please verify your internet connection and backend status.');
      } else {
        setError(err.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container d-flex align-items-center justify-content-center py-5">
      <div className="card auth-card shadow-lg border-0 rounded-4 p-4 p-md-5">
        <div className="text-center mb-4">
          <div className="auth-brand-logo mb-2">🐔</div>
          <h2 className="fw-extrabold text-success mb-1">Poultry Farm Portal</h2>
          <p className="text-muted fs-7">Sign in to access your farm management dashboard</p>
        </div>

        {error && <div className="alert alert-danger fw-semibold shadow-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Email Address</label>
            <input
              type="email"
              className="form-control form-control-lg rounded-3"
              required
              placeholder="admin@poultryfarm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Password</label>
            <input
              type="password"
              className="form-control form-control-lg rounded-3"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-success btn-lg w-100 fw-bold auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing In...
              </>
            ) : (
              'Sign In to Farm System'
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top">
          <p className="text-muted mb-0">
            Don't have an account?{' '}
            <Link to="/register" className="text-success fw-bold text-decoration-none">
              Register New Admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
