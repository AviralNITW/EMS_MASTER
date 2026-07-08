import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import { Mail, CheckCircle2, RefreshCw } from 'lucide-react';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AuthWrapper = ({ onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');
  
  // Standard login using backend API
  const handleLogin = async (email, password) => {
    try {
      setError('');
      const response = await authAPI.login({ email, password });
      
      if (response && response.token) {
        completeAuth(response.user.role, response.user, response.token);
      } else {
        setError('Invalid credentials.');
      }
    } catch (e) {
      setError(e.message || 'Login failed. Please try again.');
      toast.error('Failed to log in');
    }
  };

  // Legacy employee login mapping
  const handleEmployeeLogin = async (email, password) => {
    return handleLogin(email, password);
  };

  const handlePasswordlessLogin = async (email) => {
    try {
      setError('');
      await authAPI.requestOtp(email);
      toast.success('OTP sent to your email');
      return true; // Indicate success to the UI
    } catch (e) {
      setError(e.message || 'Failed to send OTP.');
      toast.error('Failed to send OTP');
      return false;
    }
  };

  const handleVerifyOtp = async (email, otp) => {
    try {
      setError('');
      const response = await authAPI.loginOtp(email, otp);
      if (response && response.token) {
        completeAuth(response.user.role, response.user, response.token);
        return true;
      }
    } catch (e) {
      setError(e.message || 'Invalid OTP.');
      toast.error('Invalid OTP');
      return false;
    }
  };

  // Signup using backend API
  const handleSignup = async (userData) => {
    try {
      setError('');
      // In the new API, only admin signup might be enabled openly, or it creates a standard user
      const response = await authAPI.signup(userData);
      
      if (response && response.token) {
        toast.success('Account created successfully');
        completeAuth(response.user.role, response.user, response.token);
      }
    } catch (e) {
      setError(e.message || 'Signup failed.');
    }
  };

  const completeAuth = (role, userData, token) => {
    localStorage.setItem('token', token);
    
    const completeUserData = {
      ...userData,
      userType: role,
      role: role,
      _id: userData._id || userData.id
    };

    onAuthSuccess(role, completeUserData);
  };

  const switchToLogin = () => {
    setIsLoginMode(true);
    setError('');
  };

  const switchToSignup = () => {
    setIsLoginMode(false);
    setError('');
  };

  return (
    <div className="relative">
      {/* Toast Alert Notification */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 border border-red-500/20 text-white px-5 py-3 rounded-xl shadow-[0_4px_24px_rgba(239,68,68,0.3)] z-50 max-w-sm flex items-center justify-between gap-4 backdrop-blur-md">
          <span className="text-xs font-semibold">{error}</span>
          <button onClick={() => setError('')} className="text-white/80 hover:text-white font-bold text-lg">×</button>
        </div>
      )}

      {isLoginMode ? (
        <Login
          handleLogin={handleLogin}
          handleEmployeeLogin={handleEmployeeLogin}
          handlePasswordlessLogin={handlePasswordlessLogin}
          handleVerifyOtp={handleVerifyOtp}
          switchToSignup={switchToSignup}
        />
      ) : (
        <Signup
          handleSignup={handleSignup}
          switchToLogin={switchToLogin}
        />
      )}
    </div>
  );
};

export default AuthWrapper;
