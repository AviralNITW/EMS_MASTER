import React, { useState } from 'react';
import { User, Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';

const Signup = ({ handleSignup, switchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Admin', // default role selection
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Password must meet strict criteria (see below)';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await handleSignup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full bg-[#0a0f1e]/90 text-white p-1">
      <div className="w-full max-w-md p-8 rounded-2xl border border-white/[0.08] bg-[#0c1224] shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="text-center mb-6 relative z-10">
          <h2 className="text-2xl font-heading font-bold text-white mb-2">Create Account</h2>
          <p className="text-sm text-gray-400">Join EMS-master and select your system role</p>
        </div>

        <form onSubmit={submitHandler} className="flex flex-col space-y-4 relative z-10">
          <div>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full bg-white/[0.03] border ${
                  errors.name ? 'border-red-500' : 'border-white/[0.08]'
                } focus:border-primary/50 text-white font-medium text-sm py-3.5 pl-12 pr-4 rounded-xl placeholder:text-gray-500 focus:outline-none transition-all duration-200`}
                type="text"
                placeholder="Full Name"
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1 ml-4">{errors.name}</p>}
          </div>

          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full bg-white/[0.03] border ${
                  errors.email ? 'border-red-500' : 'border-white/[0.08]'
                } focus:border-primary/50 text-white font-medium text-sm py-3.5 pl-12 pr-4 rounded-xl placeholder:text-gray-500 focus:outline-none transition-all duration-200`}
                type="email"
                placeholder="Email Address"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 ml-4">{errors.email}</p>}
          </div>

          {/* Role Selection dropdown - Restricted to Admin */}
          <div>
            <div className="relative">
              <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled
                className="w-full bg-[#0c1224] border border-white/[0.08] text-gray-400 font-medium text-sm py-3.5 pl-12 pr-4 rounded-xl cursor-not-allowed appearance-none"
              >
                <option value="Admin">Admin Account</option>
              </select>
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full bg-white/[0.03] border ${
                  errors.password ? 'border-red-500' : 'border-white/[0.08]'
                } focus:border-primary/50 text-white font-medium text-sm py-3.5 pl-12 pr-4 rounded-xl placeholder:text-gray-500 focus:outline-none transition-all duration-200`}
                type="password"
                placeholder="Password"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 ml-4">{errors.password}</p>}
            <p className="text-[10px] text-gray-500 mt-2 ml-4 leading-tight">
              At least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char.
            </p>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full bg-white/[0.03] border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-white/[0.08]'
                } focus:border-primary/50 text-white font-medium text-sm py-3.5 pl-12 pr-4 rounded-xl placeholder:text-gray-500 focus:outline-none transition-all duration-200`}
                type="password"
                placeholder="Confirm Password"
              />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-4">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative inline-flex items-center justify-center py-3.5 px-8 w-full rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 bg-primary hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_24px_rgba(124,92,255,0.45)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-brand-purple" />
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? 'Processing...' : 'Sign Up & Verify'}
              {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
            </span>
          </button>
        </form>

        <div className="text-center mt-6 relative z-10">
          <p className="text-xs text-gray-400">
            Already have an account?{' '}
            <button
              onClick={switchToLogin}
              className="text-primary hover:text-white font-bold transition-colors underline"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
