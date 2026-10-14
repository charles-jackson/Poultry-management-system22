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
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Management Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chickens"
                element={
                  <ProtectedRoute>
                    <ChickenManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feed"
                element={
                  <ProtectedRoute>
                    <FeedManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vaccination"
                element={
                  <ProtectedRoute>
                    <Vaccination />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/eggs"
                element={
                  <ProtectedRoute>
                    <EggManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees"
                element={
                  <ProtectedRoute>
                    <EmployeeManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <ProtectedRoute>
                    <SalesManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute>
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
