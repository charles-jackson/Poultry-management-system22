import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import './Home.css';

const Home = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await API.get('/dashboard');
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard summary on Home page:', error);
    } finally {
      setLoading(false);
    }
  };

  const summary = dashboardData?.summary || {
    totalChickens: 0,
    totalEggs: 0,
    feedStock: 0,
    totalEmployees: 0,
    totalSales: 0,
    totalExpenses: 0,
  };

  const activities = dashboardData?.recentActivities || [];

  return (
    <div className="home-container pb-5">
      {/* Hero Banner Section */}
      <section className="hero-banner text-white text-center py-5 mb-4">
        <div className="container">
          <h1 className="hero-title fw-bold mb-3">
            🐔 Welcome to Smart Poultry Farm Management
          </h1>
          <p className="hero-subtitle lead mb-4 mx-auto" style={{ maxWidth: '750px' }}>
            Monitor flock health, feed inventory, egg production, vaccinations, staff attendance, sales & expenses with ease and precision.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/dashboard" className="btn btn-warning btn-lg fw-bold px-4 hero-btn">
              📊 View Analytics Dashboard
            </Link>
            <Link to="/chickens" className="btn btn-outline-light btn-lg fw-bold px-4 hero-btn">
              🐔 Manage Chickens
            </Link>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Section 1: Farm Overview */}
        <section className="overview-section mb-5">
          <div className="section-header mb-4">
            <h2 className="section-title text-success fw-bold">
              <span className="me-2">📊</span> Farm Overview
            </h2>
            <p className="text-muted">Real-time inventory and financial metrics</p>
          </div>

          <div className="row g-4">
            {/* Total Chickens */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card overview-card card-chickens h-100 shadow-sm border-0">
                <div className="card-body d-flex align-items-center justify-content-between p-4">
                  <div>
                    <span className="card-subtitle text-muted fw-semibold display-block">Flock Count</span>
                    <h3 className="card-value fw-extrabold mt-1 mb-0">{summary.totalChickens.toLocaleString()}</h3>
                    <small className="text-success fw-semibold">🐔 Total Chickens</small>
                  </div>
                  <div className="icon-wrapper icon-chickens">🐔</div>
                </div>
              </div>
            </div>

            {/* Eggs Produced */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card overview-card card-eggs h-100 shadow-sm border-0">
                <div className="card-body d-flex align-items-center justify-content-between p-4">
                  <div>
                    <span className="card-subtitle text-muted fw-semibold display-block">Egg Yield</span>
                    <h3 className="card-value fw-extrabold mt-1 mb-0">{summary.totalEggs.toLocaleString()}</h3>
                    <small className="text-warning fw-semibold">🥚 Eggs Produced</small>
                  </div>
                  <div className="icon-wrapper icon-eggs">🥚</div>
                </div>
              </div>
            </div>

            {/* Feed Stock */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card overview-card card-feed h-100 shadow-sm border-0">
                <div className="card-body d-flex align-items-center justify-content-between p-4">
                  <div>
                    <span className="card-subtitle text-muted fw-semibold display-block">Inventory</span>
                    <h3 className="card-value fw-extrabold mt-1 mb-0">{summary.feedStock.toLocaleString()} Kg</h3>
                    <small className="text-success fw-semibold">🌾 Feed Stock</small>
                  </div>
                  <div className="icon-wrapper icon-feed">🌾</div>
                </div>
              </div>
            </div>

            {/* Employees */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card overview-card card-employees h-100 shadow-sm border-0">
                <div className="card-body d-flex align-items-center justify-content-between p-4">
                  <div>
                    <span className="card-subtitle text-muted fw-semibold display-block">Active Staff</span>
                    <h3 className="card-value fw-extrabold mt-1 mb-0">{summary.totalEmployees}</h3>
                    <small className="text-info fw-semibold">👨‍🌾 Employees</small>
                  </div>
                  <div className="icon-wrapper icon-employees">👨‍🌾</div>
                </div>
              </div>
            </div>

            {/* Total Sales */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card overview-card card-sales h-100 shadow-sm border-0">
                <div className="card-body d-flex align-items-center justify-content-between p-4">
                  <div>
                    <span className="card-subtitle text-muted fw-semibold display-block">Revenue</span>
                    <h3 className="card-value fw-extrabold mt-1 mb-0">${summary.totalSales.toLocaleString()}</h3>
                    <small className="text-success fw-semibold">💰 Total Sales</small>
                  </div>
                  <div className="icon-wrapper icon-sales">💰</div>
                </div>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card overview-card card-expenses h-100 shadow-sm border-0">
                <div className="card-body d-flex align-items-center justify-content-between p-4">
                  <div>
                    <span className="card-subtitle text-muted fw-semibold display-block">Operational Costs</span>
                    <h3 className="card-value fw-extrabold mt-1 mb-0">${summary.totalExpenses.toLocaleString()}</h3>
                    <small className="text-danger fw-semibold">💸 Total Expenses</small>
                  </div>
                  <div className="icon-wrapper icon-expenses">💸</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Farm Management Modules */}
        <section className="modules-section mb-5">
          <div className="section-header mb-4">
            <h2 className="section-title text-success fw-bold">
              <span className="me-2">⚡</span> Management Modules
            </h2>
            <p className="text-muted">Access farm control features directly</p>
          </div>

          <div className="row g-4">
            {/* Chicken Management */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card module-card text-center p-4 shadow-sm h-100">
                <div className="module-icon mb-3">🐔</div>
                <h4 className="fw-bold mb-2">Chicken Management</h4>
                <p className="text-muted mb-4 fs-7">
                  Track chicken breeds, quantities, ages, health status, and flock purchases.
                </p>
                <Link to="/chickens" className="btn btn-outline-success fw-bold mt-auto w-100">
                  Open Chicken Module
                </Link>
              </div>
            </div>

            {/* Feed Management */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card module-card text-center p-4 shadow-sm h-100">
                <div className="module-icon mb-3">🌾</div>
                <h4 className="fw-bold mb-2">Feed Management</h4>
                <p className="text-muted mb-4 fs-7">
                  Manage feed stock levels, types (Starter, Layer, Broiler), and supplier costs.
                </p>
                <Link to="/feed" className="btn btn-outline-success fw-bold mt-auto w-100">
                  Open Feed Module
                </Link>
              </div>
            </div>

            {/* Vaccination Management */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card module-card text-center p-4 shadow-sm h-100">
                <div className="module-icon mb-3">💉</div>
                <h4 className="fw-bold mb-2">Vaccination Schedule</h4>
                <p className="text-muted mb-4 fs-7">
                  Record vaccination dates, vaccine names, upcoming booster doses, and remarks.
                </p>
                <Link to="/vaccination" className="btn btn-outline-success fw-bold mt-auto w-100">
                  Open Vaccination Module
                </Link>
              </div>
            </div>

            {/* Egg Management */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card module-card text-center p-4 shadow-sm h-100">
                <div className="module-icon mb-3">🥚</div>
                <h4 className="fw-bold mb-2">Egg Management</h4>
                <p className="text-muted mb-4 fs-7">
                  Log daily egg production, track broken vs good eggs, and compute total revenues.
                </p>
                <Link to="/eggs" className="btn btn-outline-success fw-bold mt-auto w-100">
                  Open Egg Module
                </Link>
              </div>
            </div>

            {/* Employee Management */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card module-card text-center p-4 shadow-sm h-100">
                <div className="module-icon mb-3">👨‍🌾</div>
                <h4 className="fw-bold mb-2">Employee Management</h4>
                <p className="text-muted mb-4 fs-7">
                  Manage worker records, job roles, joining dates, salaries, and attendance status.
                </p>
                <Link to="/employees" className="btn btn-outline-success fw-bold mt-auto w-100">
                  Open Employee Module
                </Link>
              </div>
            </div>

            {/* Sales & Expenses */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="card module-card text-center p-4 shadow-sm h-100">
                <div className="module-icon mb-3">💵</div>
                <h4 className="fw-bold mb-2">Sales & Expenses</h4>
                <p className="text-muted mb-4 fs-7">
                  Track product sales, customer details, operational expenses, and profitability.
                </p>
                <div className="d-flex gap-2 mt-auto">
                  <Link to="/sales" className="btn btn-outline-success fw-bold flex-fill">
                    Sales
                  </Link>
                  <Link to="/expenses" className="btn btn-outline-danger fw-bold flex-fill">
                    Expenses
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Recent Farm Activities */}
        <section className="activities-section mb-4">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="card-header bg-success text-white p-3 d-flex align-items-center justify-content-between">
              <h5 className="mb-0 fw-bold">
                <span className="me-2">📋</span> Recent Farm Activities
              </h5>
              <span className="badge bg-light text-success fw-bold">Live Stream</span>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-success" role="status"></div>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p className="fs-5 mb-1">No activities logged yet.</p>
                  <small>Start adding records in Chickens, Feed, Eggs, Sales or Expenses to see them here.</small>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 activity-table">
                    <thead className="table-light">
                      <tr>
                        <th>Category</th>
                        <th>Details</th>
                        <th>Date</th>
                        <th>Status / Metric</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((act, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className={`badge ${act.badgeClass} px-3 py-2 fs-7`}>
                              {act.type}
                            </span>
                          </td>
                          <td className="fw-semibold text-dark">{act.title}</td>
                          <td className="text-muted fs-7">
                            {new Date(act.date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td>
                            <span className="fw-bold text-success">{act.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
