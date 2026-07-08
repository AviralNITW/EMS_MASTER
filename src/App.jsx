import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthWrapper from './components/Auth/AuthWrapper';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import HRDashboard from './components/Dashboard/HRDashboard';
import ManagerDashboard from './components/Dashboard/ManagerDashboard';
import LandingPage from './components/LandingPage/index';
import { AuthContext } from './context/AuthProvider';

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