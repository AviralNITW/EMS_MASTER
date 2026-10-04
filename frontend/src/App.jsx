import React, { useContext, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthWrapper from './components/Auth/AuthWrapper';
import LandingPage from './components/LandingPage/index';
import { AuthContext } from './context/AuthProvider';

// Lazy-load heavy dashboard components — each is ~40-50KB
// They only load after the user is authenticated, not on initial page load
const EmployeeDashboard = lazy(() => import('./components/Dashboard/EmployeeDashboard'));
const AdminDashboard = lazy(() => import('./components/Dashboard/AdminDashboard'));
const HRDashboard = lazy(() => import('./components/Dashboard/HRDashboard'));
const ManagerDashboard = lazy(() => import('./components/Dashboard/ManagerDashboard'));

// Lightweight dashboard skeleton shown while JS chunk downloads
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-[#050816] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-gray-400 text-sm">Loading dashboard...</p>
    </div>
  </div>
);

const App = () => {
  const { currentUser, updateCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAuthSuccess = (userType, userData) => {
    // Store user data in context (which also handles localStorage)
    updateCurrentUser(userData);
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = () => {
    updateCurrentUser(null);
    navigate('/', { replace: true });
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage onAuthSuccess={handleAuthSuccess} />} />
        <Route 
          path="/login" 
          element={
            !currentUser ? (
              <div className="min-h-screen bg-[#050816] flex items-center justify-center">
                <AuthWrapper onAuthSuccess={handleAuthSuccess} />
              </div>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            currentUser ? (
              <Suspense fallback={<DashboardSkeleton />}>
                <div className="min-h-screen bg-[#050816]">
                  {currentUser.role === 'Admin' || currentUser.userType === 'admin' ? (
                    <AdminDashboard changeUser={handleLogout} />
                  ) : currentUser.role === 'HR' || currentUser.userType === 'hr' ? (
                    <HRDashboard changeUser={handleLogout} />
                  ) : currentUser.role === 'Manager' || currentUser.userType === 'manager' ? (
                    <ManagerDashboard changeUser={handleLogout} />
                  ) : (
                    <EmployeeDashboard changeUser={handleLogout} />
                  )}
                </div>
              </Suspense>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
      <ToastContainer position="bottom-right" theme="dark" autoClose={5000} />
    </>
  );
};

export default App;