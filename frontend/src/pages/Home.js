import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'Admin';

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
    eggBalance: 0,
    totalEggsSold: 0,
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
          <div className="mb-2">
            <span className="badge bg-light text-dark fw-bold px-3 py-2 rounded-pill fs-7">
              {isAdmin ? '👑 Administrator Portal' : '👨‍🌾 Staff Operations Portal'}
            </span>
          </div>
          <h1 className="hero-title fw-bold mb-3">
            🐔 Welcome to Smart Poultry Farm Management
          </h1>
          <p className="hero-subtitle lead mb-4 mx-auto" style={{ maxWidth: '750px' }}>
            {isAdmin
              ? 'Oversee farm business metrics, comprehensive financial analytics, and employee management.'
              : 'Record flock health, monitor feed inventory, manage vaccinations, log egg yields, and track sales.'}
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            {isAdmin ? (
              <>
                <Link to="/dashboard" className="btn btn-warning btn-lg fw-bold px-4 hero-btn">
                  📊 View Analytics Dashboard
                </Link>
                <Link to="/employees" className="btn btn-outline-light btn-lg fw-bold px-4 hero-btn">
                  👨‍🌾 Manage Employees
                </Link>
              </>
            ) : (
              <>
                <Link to="/chickens" className="btn btn-warning btn-lg fw-bold px-4 hero-btn">
                  🐔 Manage Chickens
                </Link>
                <Link to="/feed" className="btn btn-outline-light btn-lg fw-bold px-4 hero-btn">
                  🌾 Manage Feed
                </Link>
              </>
            )}
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
            <p className="text-muted">Real-time inventory and operations summary</p>
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

            {/* Egg Balance */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card overview-card card-eggs h-100 shadow-sm border-0">
                <div className="card-body d-flex align-items-center justify-content-between p-4">
                  <div>
                    <span className="card-subtitle text-muted fw-semibold display-block">Egg Balance</span>
                    <h3 className="card-value fw-extrabold mt-1 mb-0 text-success">
                      {(summary.eggBalance !== undefined ? summary.eggBalance : Math.max(0, (summary.goodEggsCount || summary.totalEggs) - (summary.totalEggsSold || 0))).toLocaleString()}
                    </h3>
                    <small className="text-muted fw-semibold">🥚 Available in farm ({summary.totalEggs} produced)</small>
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

            {/* Employees: Only visible to Admin */}
            {isAdmin && (
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
            )}

            {/* Total Sales */}
            <div className="col-12 col-sm-6 col-lg-4">
              <div className="card overview-card card-sales h-100 shadow-sm border-0">
                <div className="card-body d-flex align-items-center justify-content-between p-4">
                  <div>
                    <span className="card-subtitle text-muted fw-semibold display-block">Revenue</span>
                    <h3 className="card-value fw-extrabold mt-1 mb-0">₹{summary.totalSales.toLocaleString()}</h3>
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
                    <h3 className="card-value fw-extrabold mt-1 mb-0">₹{summary.totalExpenses.toLocaleString()}</h3>
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
              <span className="me-2">⚡</span>{' '}
              {isAdmin ? 'Admin Modules' : 'Staff Operations Modules'}
            </h2>
            <p className="text-muted">
              {isAdmin
                ? 'Authorized access for Farm Administrators'
                : 'Authorized access for Farm Staff'}
            </p>
          </div>

          <div className="row g-4">
            {/* ADMIN ONLY MODULES */}
            {isAdmin ? (
              <>
                {/* Analytics Dashboard */}
                <div className="col-12 col-md-6">
                  <div className="card module-card text-center p-4 shadow-sm h-100">
                    <div className="module-icon mb-3">📊</div>
                    <h4 className="fw-bold mb-2">Analytics & Financial Dashboard</h4>
                    <p className="text-muted mb-4 fs-7">
                      Comprehensive farm overview, monthly revenue vs expenses charts, egg yield trends, and profit margins.
                    </p>
                    <Link to="/dashboard" className="btn btn-success fw-bold mt-auto w-100 py-2">
                      Open Analytics Dashboard
                    </Link>
                  </div>
                </div>

                {/* Employee Management */}
                <div className="col-12 col-md-6">
                  <div className="card module-card text-center p-4 shadow-sm h-100">
                    <div className="module-icon mb-3">👨‍🌾</div>
                    <h4 className="fw-bold mb-2">Employee Management</h4>
                    <p className="text-muted mb-4 fs-7">
                      Add, update, and manage employee records, job designations, monthly salaries, and work contact details.
                    </p>
                    <Link to="/employees" className="btn btn-outline-success fw-bold mt-auto w-100 py-2">
                      Open Employee Module
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              /* USER / STAFF ONLY MODULES */
              <>
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

                {/* Sales Management */}
                <div className="col-12 col-md-6 col-lg-4">
                  <div className="card module-card text-center p-4 shadow-sm h-100">
                    <div className="module-icon mb-3">💰</div>
                    <h4 className="fw-bold mb-2">Sales Management</h4>
                    <p className="text-muted mb-4 fs-7">
                      Record chicken and egg sales, customer names, payment methods, and invoices.
                    </p>
                    <Link to="/sales" className="btn btn-outline-success fw-bold mt-auto w-100">
                      Open Sales Module
                    </Link>
                  </div>
                </div>

                {/* Expense Management */}
                <div className="col-12 col-md-6 col-lg-4">
                  <div className="card module-card text-center p-4 shadow-sm h-100">
                    <div className="module-icon mb-3">💸</div>
                    <h4 className="fw-bold mb-2">Expense Management</h4>
                    <p className="text-muted mb-4 fs-7">
                      Track utility bills, medical supplies, maintenance, and farm operational expenditures.
                    </p>
                    <Link to="/expenses" className="btn btn-outline-danger fw-bold mt-auto w-100">
                      Open Expense Module
                    </Link>
                  </div>
                </div>
              </>
            )}
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
