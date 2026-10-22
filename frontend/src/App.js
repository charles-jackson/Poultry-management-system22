import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ChickenManagement from './pages/ChickenManagement';
import FeedManagement from './pages/FeedManagement';
import Vaccination from './pages/Vaccination';
import EggManagement from './pages/EggManagement';
import EmployeeManagement from './pages/EmployeeManagement';
import SalesManagement from './pages/SalesManagement';
import ExpenseManagement from './pages/ExpenseManagement';
import Login from './pages/Login';
import Register from './pages/Register';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/custom.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Home is protected - requires login, accessible to both Admin & User */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />

              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Admin-Only Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <EmployeeManagement />
                  </ProtectedRoute>
                }
              />

              {/* User-Only Routes */}
              <Route
                path="/chickens"
                element={
                  <ProtectedRoute allowedRoles={['User']}>
                    <ChickenManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feed"
                element={
                  <ProtectedRoute allowedRoles={['User']}>
                    <FeedManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vaccination"
                element={
                  <ProtectedRoute allowedRoles={['User']}>
                    <Vaccination />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/eggs"
                element={
                  <ProtectedRoute allowedRoles={['User']}>
                    <EggManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <ProtectedRoute allowedRoles={['User']}>
                    <SalesManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute allowedRoles={['User']}>
                    <ExpenseManagement />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
