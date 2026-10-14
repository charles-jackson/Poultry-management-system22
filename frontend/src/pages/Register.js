import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
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
        setError(err.message || 'Registration failed');
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
          <h2 className="fw-extrabold text-success mb-1">Create Admin Account</h2>
          <p className="text-muted fs-7">Register as a farm manager to access the full system</p>
        </div>

        {error && <div className="alert alert-danger fw-semibold shadow-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Full Name</label>
            <input
              type="text"
              className="form-control form-control-lg rounded-3"
              required
              placeholder="Farm Manager Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Email Address</label>
            <input
              type="email"
              className="form-control form-control-lg rounded-3"
              required
              placeholder="manager@poultryfarm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="row g-3 mb-4">
            <div className="col-6">
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
            <div className="col-6">
              <label className="form-label fw-bold">Confirm Password</label>
              <input
                type="password"
                className="form-control form-control-lg rounded-3"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-success btn-lg w-100 fw-bold auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating Account...
              </>
            ) : (
              'Register & Launch Dashboard'
            )}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top">
          <p className="text-muted mb-0">
            Already registered?{' '}
            <Link to="/login" className="text-success fw-bold text-decoration-none">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
