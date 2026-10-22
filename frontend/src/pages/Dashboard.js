import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await API.get('/dashboard');
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const summary = dashboardData?.summary || {
    totalChickens: 0,
    totalEggs: 0,
    goodEggsCount: 0,
    totalEggsSold: 0,
    eggBalance: 0,
    feedStock: 0,
    totalEmployees: 0,
    totalSales: 0,
    totalExpenses: 0,
    profit: 0,
  };

  // Prepare chart data
  const financialData = [
    { name: 'Total Sales', amount: summary.totalSales, fill: '#2e7d32' },
    { name: 'Total Expenses', amount: summary.totalExpenses, fill: '#d32f2f' },
    { name: 'Net Profit', amount: summary.profit, fill: summary.profit >= 0 ? '#1976d2' : '#ed6c02' },
  ];

  const COLORS = ['#2e7d32', '#1976d2', '#ed6c02', '#9c27b0', '#00bcd4', '#795548', '#607d8b'];

  const expenseCategoryData = dashboardData?.expenseByCategory
    ? dashboardData.expenseByCategory.map((item) => ({
        name: item._id || 'Other',
        value: item.total,
      }))
    : [];

  return (
    <div className="dashboard-container py-4">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="dashboard-title text-success fw-bold mb-1">
              📊 Executive Farm Dashboard
            </h1>
            <p className="text-muted mb-0">Overview of operational metrics, sales, expenses and net profit</p>
          </div>
          <button className="btn btn-outline-success fw-bold shadow-sm" onClick={fetchDashboard}>
            🔄 Refresh Metrics
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-3 text-muted">Calculating farm analytics...</p>
          </div>
        ) : (
          <>
            {/* KPI Statistic Cards Grid */}
            <div className="row g-4 mb-5">
              {/* Total Chickens */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card stat-card stat-chickens shadow-sm border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="stat-label text-muted fw-bold">TOTAL CHICKENS</span>
                      <span className="stat-icon">🐔</span>
                    </div>
                    <h2 className="stat-number fw-bold text-dark">{summary.totalChickens.toLocaleString()}</h2>
                    <small className="text-success fw-semibold">Live flock count</small>
                  </div>
                </div>
              </div>

              {/* Available Egg Balance */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card stat-card stat-eggs shadow-sm border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="stat-label text-muted fw-bold">EGG BALANCE</span>
                      <span className="stat-icon">🥚</span>
                    </div>
                    <h2 className="stat-number fw-bold text-success">
                      {(summary.eggBalance !== undefined ? summary.eggBalance : Math.max(0, summary.goodEggsCount - (summary.totalEggsSold || 0))).toLocaleString()}
                    </h2>
                    <small className="text-muted fw-semibold">
                      {summary.totalEggsSold || 0} sold • {summary.totalEggs} harvested
                    </small>
                  </div>
                </div>
              </div>

              {/* Feed Stock */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card stat-card stat-feed shadow-sm border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="stat-label text-muted fw-bold">FEED STOCK</span>
                      <span className="stat-icon">🌾</span>
                    </div>
                    <h2 className="stat-number fw-bold text-dark">{summary.feedStock.toLocaleString()} <small className="fs-6">Kg</small></h2>
                    <small className="text-info fw-semibold">Current feed balance</small>
                  </div>
                </div>
              </div>

              {/* Employees */}
              <div className="col-12 col-sm-6 col-lg-3">
                <div className="card stat-card stat-employees shadow-sm border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="stat-label text-muted fw-bold">EMPLOYEES</span>
                      <span className="stat-icon">👨‍🌾</span>
                    </div>
                    <h2 className="stat-number fw-bold text-dark">{summary.totalEmployees}</h2>
                    <small className="text-secondary fw-semibold">Active staff on duty</small>
                  </div>
                </div>
              </div>

              {/* Total Sales */}
              <div className="col-12 col-sm-6 col-lg-4">
                <div className="card stat-card stat-sales shadow-sm border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="stat-label text-muted fw-bold">TOTAL SALES</span>
                      <span className="stat-icon">💰</span>
                    </div>
                    <h2 className="stat-number fw-bold text-success">${summary.totalSales.toLocaleString()}</h2>
                    <small className="text-success fw-semibold">Total gross revenue</small>
                  </div>
                </div>
              </div>

              {/* Total Expenses */}
              <div className="col-12 col-sm-6 col-lg-4">
                <div className="card stat-card stat-expenses shadow-sm border-0 h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="stat-label text-muted fw-bold">TOTAL EXPENSES</span>
                      <span className="stat-icon">💸</span>
                    </div>
                    <h2 className="stat-number fw-bold text-danger">${summary.totalExpenses.toLocaleString()}</h2>
                    <small className="text-danger fw-semibold">Operational expenditure</small>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="col-12 col-sm-12 col-lg-4">
                <div className={`card stat-card stat-profit shadow-sm border-0 h-100 ${summary.profit >= 0 ? 'bg-profit-positive' : 'bg-profit-negative'}`}>
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="stat-label fw-bold text-uppercase">NET PROFIT / LOSS</span>
                      <span className="stat-icon">📈</span>
                    </div>
                    <h2 className={`stat-number fw-extrabold ${summary.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                      ${summary.profit.toLocaleString()}
                    </h2>
                    <small className="fw-semibold text-dark">
                      {summary.profit >= 0 ? '✅ Profitable Operation' : '⚠️ Net Loss Detected'}
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Analytics Charts Section */}
            <div className="row g-4 mb-4">
              {/* Financial Performance Bar Chart */}
              <div className="col-12 col-lg-7">
                <div className="card chart-card shadow-sm border-0 rounded-4 p-4 h-100">
                  <h5 className="card-title fw-bold text-success mb-4">
                    💰 Financial Comparison (Sales vs Expenses vs Profit)
                  </h5>
                  <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="name" stroke="#555" fontWeight="bold" />
                        <YAxis stroke="#555" />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                          {financialData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Expense Category Breakdown Pie Chart */}
              <div className="col-12 col-lg-5">
                <div className="card chart-card shadow-sm border-0 rounded-4 p-4 h-100">
                  <h5 className="card-title fw-bold text-success mb-4">
                    🍰 Expense Breakdown by Category
                  </h5>
                  {expenseCategoryData.length === 0 ? (
                    <div className="d-flex align-items-center justify-content-center h-75 text-muted">
                      No expense categories logged yet
                    </div>
                  ) : (
                    <div style={{ width: '100%', height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseCategoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {expenseCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
