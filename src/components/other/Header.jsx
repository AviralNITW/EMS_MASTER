import React from 'react';
import { LogOut } from 'lucide-react';

const Header = ({ changeUser }) => {
  let displayName = 'User';
  let displayRole = 'Team Member';
  
  const loggedInUser = localStorage.getItem('user') || localStorage.getItem('loggedInUser');
  
  if (loggedInUser) {
    try {
      const parsed = JSON.parse(loggedInUser);
      // Handle different storage shapes (directly user object, or {role, data})
      const user = parsed.data || parsed;
      const role = parsed.role || parsed.userType;
      
      if (user.name) {
        displayName = user.name;
      } else if (user.firstName) {
        displayName = user.firstName;
      } else if (role === 'admin') {
        displayName = 'Administrator';
      }

      if (role === 'admin') {
        displayRole = 'System Administrator';
      } else if (role === 'hr') {
        displayRole = 'HR Manager';
      } else if (role === 'manager') {
        displayRole = 'Team Manager';
      } else if (role === 'employee') {
        displayRole = 'Employee';
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }

  const handleLogout = () => {
    if (changeUser) {
      changeUser('');
    }
  };

  return (
    <div className="flex justify-between items-center w-full bg-[#0a0f1e]/80 border border-white/[0.08] backdrop-blur-md p-6 rounded-2xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-brand-purple flex items-center justify-center font-heading font-extrabold text-white text-lg shadow-[0_0_16px_rgba(124,92,255,0.3)]">
          {displayName.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block">{displayRole}</span>
          <h1 className="text-xl font-heading font-bold text-white">
            Hello, {displayName} 👋
          </h1>
        </div>
      </div>
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-semibold text-xs rounded-xl transition-all"
      >
        <LogOut size={14} /> Logout
      </button>
    </div>
  );
};

export default Header;