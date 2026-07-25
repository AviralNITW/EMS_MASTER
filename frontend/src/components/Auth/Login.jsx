import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight } from 'lucide-react';

const Login = ({ handleLogin, handleEmployeeLogin, handlePasswordlessLogin, handleVerifyOtp, switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordless, setIsPasswordless] = useState(false); // Default to password login
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft > 0 && otpSent) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft, otpSent]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isPasswordless) {
        if (!otpSent) {
          const success = await handlePasswordlessLogin(email);
          if (success) {
            setOtpSent(true);
            setTimeLeft(90);
          }
        } else {
          await handleVerifyOtp(email, otp);
        }
      } else {
        // Fallback to legacy password authentication
        await handleLogin(email, password);
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = (passwordless) => {
    setIsPasswordless(passwordless);
    setOtpSent(false);
    setOtp('');
    setTimeLeft(0);
  };

  return (
    <div className="flex items-center justify-center w-full bg-[#0a0f1e]/90 text-white p-1">
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/[0.08] bg-[#0c1224] shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="text-center mb-6 relative z-10">
          <h2 className="text-2xl font-heading font-bold text-white mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-gray-400">
            {isPasswordless 
              ? 'Enter your email to instantly access your role panel' 
              : 'Enter credentials to access your dashboard'}
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex mb-6 bg-white/[0.03] border border-white/[0.08] rounded-xl p-1 relative z-10">
          <button
            type="button"
            onClick={() => handleModeSwitch(true)}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isPasswordless
                ? 'bg-gradient-to-r from-primary to-brand-purple text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Passwordless Login
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch(false)}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-all duration-200 ${
              !isPasswordless
                ? 'bg-gradient-to-r from-primary to-brand-purple text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Password Login
          </button>
        </div>

        <form onSubmit={submitHandler} className="flex flex-col space-y-4 relative z-10">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpSent}
              required
              className={`w-full bg-white/[0.03] border border-white/[0.08] hover:border-white/20 focus:border-primary/50 text-white font-medium text-sm py-3.5 pl-12 pr-4 rounded-xl placeholder:text-gray-500 focus:outline-none transition-all duration-200 ${otpSent ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="email"
              placeholder="Enter your email address"
            />
          </div>

          {isPasswordless && otpSent && (
            <div className="relative animate-fade-in flex flex-col space-y-2">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full bg-white/[0.03] border border-white/[0.08] hover:border-white/20 focus:border-primary/50 text-white font-medium text-center tracking-[0.5em] text-lg py-3.5 px-4 rounded-xl placeholder:text-gray-500 placeholder:tracking-normal placeholder:text-sm focus:outline-none transition-all duration-200"
                type="text"
                placeholder="Enter 6-digit OTP"
              />
              <div className="flex justify-between items-center px-2 pt-1">
                <span className="text-xs text-gray-400">
                  {timeLeft > 0 ? `Resend OTP in ${timeLeft}s` : 'Did not receive OTP?'}
                </span>
                <button
                  type="button"
                  disabled={timeLeft > 0}
                  onClick={async () => {
                    const success = await handlePasswordlessLogin(email);
                    if (success) setTimeLeft(90);
                  }}
                  className={`text-xs font-semibold ${timeLeft > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-primary hover:text-white transition-colors'}`}
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {!isPasswordless && (
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/[0.03] border border-white/[0.08] hover:border-white/20 focus:border-primary/50 text-white font-medium text-sm py-3.5 px-4 rounded-xl placeholder:text-gray-500 focus:outline-none transition-all duration-200"
              type="password"
              placeholder="Enter password"
            />
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`group relative inline-flex items-center justify-center py-3.5 px-8 w-full rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 ${
              isLoading
                ? 'bg-gray-700 cursor-not-allowed opacity-50'
                : 'bg-primary hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_24px_rgba(124,92,255,0.45)]'
            }`}
          >
            {/* Button Gradient */}
            {!isLoading && <div className="absolute inset-0 bg-gradient-to-r from-primary to-brand-purple" />}
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? 'Checking...' : isPasswordless ? (otpSent ? 'Verify OTP & Login' : 'Request OTP') : 'Sign In'}
              {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
            </span>
          </button>
        </form>

        <div className="text-center mt-6 relative z-10">
          <p className="text-xs text-gray-500">
            Don't have an account?{' '}
            <button 
              type="button" 
              onClick={switchToSignup}
              className="text-primary hover:text-white font-medium transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>

        {/* Demo Credentials Hint */}
        {!isPasswordless && (
          <div className="mt-6 pt-5 border-t border-white/[0.04] text-center relative z-10">
            <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider font-bold">Quick Demo Accounts</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {[
                { r: 'Admin', e: 'admin@example.com' },
                { r: 'HR', e: 'hr@example.com' },
                { r: 'Manager', e: 'manager@example.com' },
                { r: 'Employee', e: 'jim@example.com' }
              ].map(demo => (
                <button
                  key={demo.e}
                  onClick={() => {
                    setEmail(demo.e);
                    if (!isPasswordless) {
                      setPassword('123');
                    }
                  }}
                  className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06] hover:bg-primary/20 hover:border-primary/50 text-[10px] text-gray-400 hover:text-white transition-all font-medium"
                >
                  {demo.r}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;