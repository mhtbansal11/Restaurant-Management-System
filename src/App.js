import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import SeatingLayout from './pages/SeatingLayout';
import Seating from './pages/Seating';
import Orders from './pages/Orders';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Staff from './pages/Staff';
import StaffProfile from './pages/StaffProfile';
import KDS from './pages/KDS';
import Forecasting from './pages/Forecasting';
import Payments from './pages/Payments';
import Customers from './pages/Customers';
import Expenses from './pages/Expenses';
import ProfitLoss from './pages/ProfitLoss';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';
import './App.css';
import OutletSettings from './pages/OutletSettings';
import { ROLES } from './constants/roles';

// Landing page imports
import LandingLayout from './landing/LandingLayout';
import LandingHome from './landing/pages/Home';
import LandingFeatures from './landing/pages/Features';
import LandingProcess from './landing/pages/Process';
import LandingPricing from './landing/pages/Pricing';
import LandingAbout from './landing/pages/About';
import LandingContact from './landing/pages/Contact';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '10px',
            },
          }}
        />
        <Router>
          <Routes>
            {/* Public landing pages */}
            <Route path="/" element={<LandingLayout><LandingHome /></LandingLayout>} />
            <Route path="/features" element={<LandingLayout><LandingFeatures /></LandingLayout>} />
            <Route path="/process" element={<LandingLayout><LandingProcess /></LandingLayout>} />
            <Route path="/pricing" element={<LandingLayout><LandingPricing /></LandingLayout>} />
            <Route path="/about" element={<LandingLayout><LandingAbout /></LandingLayout>} />
            <Route path="/contact" element={<LandingLayout><LandingContact /></LandingLayout>} />

            {/* Auth pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected app routes */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <NotificationProvider>
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />

                        <Route path="/menu" element={
                          <PrivateRoute allowedRoles={ROLES.ALL}>
                            <Menu />
                          </PrivateRoute>
                        } />

                        <Route path="/seating" element={
                          <PrivateRoute allowedRoles={ROLES.FRONT_DESK}>
                            <Seating />
                          </PrivateRoute>
                        } />

                        <Route path="/seating-editor" element={
                          <PrivateRoute allowedRoles={ROLES.MANAGEMENT}>
                            <SeatingLayout />
                          </PrivateRoute>
                        } />

                        <Route path="/orders" element={
                          <PrivateRoute allowedRoles={ROLES.ALL}>
                            <Orders />
                          </PrivateRoute>
                        } />

                        <Route path="/pos" element={
                          <PrivateRoute allowedRoles={ROLES.POS}>
                            <POS />
                          </PrivateRoute>
                        } />

                        <Route path="/inventory" element={
                          <PrivateRoute allowedRoles={ROLES.KITCHEN}>
                            <Inventory />
                          </PrivateRoute>
                        } />

                        <Route path="/staff" element={
                          <PrivateRoute allowedRoles={ROLES.MANAGEMENT}>
                            <Staff />
                          </PrivateRoute>
                        } />

                        <Route path="/staff-profile" element={
                          <PrivateRoute allowedRoles={ROLES.ALL}>
                            <StaffProfile />
                          </PrivateRoute>
                        } />

                        <Route path="/kds" element={
                          <PrivateRoute allowedRoles={ROLES.KITCHEN}>
                            <KDS />
                          </PrivateRoute>
                        } />

                        <Route path="/forecasting" element={
                          <PrivateRoute allowedRoles={ROLES.MANAGEMENT}>
                            <Forecasting />
                          </PrivateRoute>
                        } />

                        <Route path="/payments" element={
                          <PrivateRoute allowedRoles={ROLES.FINANCE}>
                            <Payments />
                          </PrivateRoute>
                        } />

                        <Route path="/customers" element={
                          <PrivateRoute allowedRoles={ROLES.ALL}>
                            <Customers />
                          </PrivateRoute>
                        } />

                        <Route path="/expenses" element={
                          <PrivateRoute allowedRoles={ROLES.MANAGEMENT}>
                            <Expenses />
                          </PrivateRoute>
                        } />

                        <Route path="/profit-loss" element={
                          <PrivateRoute allowedRoles={ROLES.MANAGEMENT}>
                            <ProfitLoss />
                          </PrivateRoute>
                        } />

                        <Route path="/settings" element={
                          <PrivateRoute allowedRoles={ROLES.MANAGEMENT}>
                            <OutletSettings />
                          </PrivateRoute>
                        } />

                        <Route path="*" element={<Navigate to="/dashboard" />} />
                      </Routes>
                    </Layout>
                  </NotificationProvider>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
