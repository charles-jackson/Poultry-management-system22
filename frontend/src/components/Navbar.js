import React, { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-xl poultry-navbar sticky-top">
      <div className="container-fluid px-3 px-lg-4">
        <Link className="navbar-brand poultry-brand" to="/">
          <span className="brand-icon">🐔</span>
          <span className="brand-text">Poultry Farm Management</span>
        </Link>
        <button
          className="navbar-toggler custom-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#poultryNavbarContent"
          aria-controls="poultryNavbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="poultryNavbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 nav-links-container">
            {user && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/">
                  Home
                </NavLink>
              </li>
            )}

            {/* Admin Links: Home, Dashboard, Employees */}
            {user && user.role === 'Admin' && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/dashboard">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/employees">
                    Employees
                  </NavLink>
                </li>
              </>
            )}

            {/* User Links: Chickens, Feed, Vaccination, Eggs, Sales, Expenses */}
            {user && user.role === 'User' && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/chickens">
                    Chickens
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/feed">
                    Feed
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/vaccination">
                    Vaccination
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/eggs">
                    Eggs
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/sales">
                    Sales
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/expenses">
                    Expenses
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3 auth-section flex-wrap">
            {user ? (
              <>
                <span className="user-badge">
                  {user.role === 'Admin' ? '👑 Admin' : '👨‍🌾 Staff'}: {user.name}
                </span>
                <button className="btn btn-logout-glow btn-sm fw-bold px-3 py-1" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm fw-bold px-3">
                  Login
                </Link>
                <Link to="/register" className="btn btn-register-glow btn-sm fw-bold px-3">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
