import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [role, setRole] = useState('User'); // 'User' or 'Admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, role);
      // Directs to Home page as requested
      navigate('/');
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
      <div className="card auth-card shadow-lg border-0 p-4 p-md-5">
        <div className="text-center mb-3">
          <div className="auth-brand-logo mb-2">🐔</div>
          <h2 className="fw-extrabold text-success mb-1">Poultry Farm Portal</h2>
          <p className="text-muted fs-7">
            {role === 'Admin'
              ? '👑 Administrator Portal (Dashboard & Staff Management)'
              : '👨‍🌾 Staff Portal (Chickens, Feed, Eggs, Sales & Expenses)'}
          </p>
        </div>

        {/* Admin vs User Tab Selector */}
        <div className="auth-role-tabs mb-4">
          <button
            type="button"
            className={`auth-role-tab ${role === 'User' ? 'active' : ''}`}
            onClick={() => handleRoleChange('User')}
          >
            <span>👨‍🌾 Staff / User</span>
            <span className="auth-role-badge">Farm</span>
          </button>
          <button
            type="button"
            className={`auth-role-tab ${role === 'Admin' ? 'active' : ''}`}
            onClick={() => handleRoleChange('Admin')}
          >
            <span>👑 Admin</span>
            <span className="auth-role-badge">Manager</span>
          </button>
        </div>

        {error && <div className="alert alert-danger fw-semibold shadow-sm py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">
              {role === 'Admin' ? 'Admin Email Address' : 'User / Staff Email Address'}
            </label>
            <input
              type="email"
              className="form-control form-control-lg rounded-3"
              required
              placeholder={role === 'Admin' ? 'admin@poultryfarm.com' : 'staff@poultryfarm.com'}
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
            className={`btn btn-lg w-100 auth-submit-btn text-white ${
              role === 'Admin' ? 'auth-submit-btn-admin' : ''
            }`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Signing In...
              </>
            ) : role === 'Admin' ? (
              '👑 Sign In as Admin'
            ) : (
              '👨‍🌾 Sign In as Staff / User'
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top">
          <p className="text-muted mb-0">
            Don't have an account?{' '}
            <Link to="/register" className="text-success fw-bold text-decoration-none">
              Register New Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
