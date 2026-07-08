import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Key, User, Bell, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthProvider';

const SettingsView = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Profile updated successfully');
    }, 1000);
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Settings</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and preferences.</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Settings Navigation */}
        <div className="w-64 bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-4 shadow-xl shrink-0 h-max">
          <nav className="space-y-1">
            {[
              { id: 'Profile', icon: User, label: 'Profile Information' },
              { id: 'Security', icon: Lock, label: 'Security & Password' },
              { id: 'Notifications', icon: Bell, label: 'Notifications' },
              { id: 'General', icon: SettingsIcon, label: 'General Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-8 shadow-xl overflow-y-auto custom-scrollbar">
          {activeTab === 'Profile' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-white/10 pb-4">Profile Information</h3>
              <form onSubmit={handleProfileSave} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">First Name</label>
                    <input 
                      type="text" 
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full bg-[#1f2937] border border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-colors text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Name</label>
                    <input 
                      type="text" 
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full bg-[#1f2937] border border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-colors text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full bg-[#1f2937] border border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-gray-900 dark:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-[0_0_20px_rgba(124,92,255,0.3)]"
                  >
                    <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-white/10 pb-4">Change Password</h3>
              <form onSubmit={handlePasswordSave} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Password</label>
                  <input 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full bg-[#1f2937] border border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full bg-[#1f2937] border border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full bg-[#1f2937] border border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-colors text-sm"
                  />
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-gray-900 dark:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <Key size={16} /> {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {(activeTab === 'Notifications' || activeTab === 'General') && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
              <SettingsIcon size={48} className="mb-4 opacity-50" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{activeTab} Settings</h2>
              <p>These settings are currently under development.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
