import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, Shield, Bell, Download, Search, LayoutDashboard,
  CalendarDays, CheckSquare, DollarSign, FileText, BarChart3, 
  Activity, FileClock, Settings, SlidersHorizontal, Database,
  TrendingUp, TrendingDown, MoreHorizontal, CheckCircle2, UserPlus, 
  FileSpreadsheet, HardDrive, UserCog, Clock, FileCheck, Mail, Users2, LogOut, Menu, Sun, Moon
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { userAPI, leaveAPI, documentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthProvider';
import { useTheme } from '../../context/ThemeContext';
import SkeletonLoader from '../UI/SkeletonLoader';
import UserFormModal from '../UI/UserFormModal';
import EmployeeManagementView from '../Views/EmployeeManagementView';
import DepartmentManagementView from '../Views/DepartmentManagementView';
import LeaveManagementView from '../Views/LeaveManagementView';
import PayrollView from '../Views/PayrollView';
import AttendanceView from '../Views/AttendanceView';
import AnnouncementsView from '../Views/AnnouncementsView';
import ReportsAnalyticsView from '../Views/ReportsAnalyticsView';
import AnalyticsView from '../Views/AnalyticsView';
import ExportDataView from '../Views/ExportDataView';
import AuditLogsView from '../Views/AuditLogsView';
import SettingsView from '../Views/SettingsView';
import DocumentsView from '../Views/DocumentsView';
import { toast } from 'react-toastify';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];

const HRDashboard = ({ changeUser }) => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [usersData, leavesData, documentsData] = await Promise.all([
          userAPI.getAll(),
          leaveAPI.getAll(),
          documentAPI.getAll()
        ]);
        setUsers(usersData || []);
        setLeaves(leavesData || []);
        setDocuments(documentsData || []);
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const refreshData = async () => {
    try {
      const usersData = await userAPI.getAll();
      setUsers(usersData || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLeaveAction = async (id, status) => {
    try {
      await leaveAPI.updateStatus(id, status, 'Reviewed by HR');
      toast.success(`Leave request ${status === 'HR_Approved' ? 'approved' : 'rejected'}`);
      setLeaves(leaves.map(l => l._id === id ? { ...l, status } : l));
    } catch (error) {
      toast.error('Failed to process leave request');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userAPI.delete(id);
      toast.success('User deleted successfully');
      refreshData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  // --- Derived Metrics ---
  const totalUsers = users.length;
  const newHires = users.filter(u => {
    // Mock: if joiningDate is within 30 days, else random mock
    if (u.joiningDate) {
      return (new Date() - new Date(u.joiningDate)) < 30 * 24 * 60 * 60 * 1000;
    }
    return false;
  }).length;

  // Department Distribution Data
  const deptCount = users.reduce((acc, user) => {
    if (user.department) {
      acc[user.department] = (acc[user.department] || 0) + 1;
    }
    return acc;
  }, {});
  
  const deptData = Object.entries(deptCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5

  // Real Growth Data (fallback if no users)
  const calculateGrowthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    if (totalUsers < 3) {
      return [
        { name: 'Jan', employees: 2 }, { name: 'Feb', employees: 3 },
        { name: 'Mar', employees: 3 }, { name: 'Apr', employees: 5 },
        { name: 'May', employees: 6 }, { name: 'Jun', employees: 8 },
        { name: 'Jul', employees: 9 }, { name: 'Aug', employees: 11 },
        { name: 'Sep', employees: 12 }, { name: 'Oct', employees: 15 },
        { name: 'Nov', employees: 16 }, { name: 'Dec', employees: 20 },
      ];
    }

    return months.map((month, index) => {
      const count = users.filter(u => {
        const d = new Date(u.createdAt || u.joiningDate || new Date());
        return d.getFullYear() < currentYear || (d.getFullYear() === currentYear && d.getMonth() <= index);
      }).length;
      return { name: month, employees: count };
    });
  };
  const growthData = calculateGrowthData();
  
  // Payroll & Attendance Estimations
  const totalPayroll = (totalUsers * 5200).toLocaleString(); // Estimated $5200 avg per employee
  const attendanceRate = Math.max(85, 100 - (leaves.filter(l => l.status === 'Approved' || l.status === 'HR_Approved').length * 0.5)).toFixed(1);

  // Leave Summary
  const pendingLeaves = leaves.filter(l => l.status === 'Pending' || l.status === 'Manager_Approved').slice(0, 4);
  const totalLeaveRequests = leaves.length;
  
  // Documents mapped from DB
  const recentDocuments = documents
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)
    .map(doc => ({
      title: doc.title || doc.fileUrl?.split('/').pop() || 'Document',
      count: 1
    }));

  // Activities derived from DB
  const recentActivities = [
    ...users.map(u => ({
      title: 'New employee added',
      desc: `${u.firstName} ${u.lastName}`,
      time: new Date(u.createdAt || u.joiningDate),
      icon: <UserPlus size={14} />,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    })),
    ...leaves.map(l => ({
      title: `Leave ${l.status.replace('_', ' ').toLowerCase()}`,
      desc: l.employeeId?.firstName ? `${l.employeeId.firstName} ${l.employeeId.lastName}` : 'Employee',
      time: new Date(l.updatedAt || l.createdAt),
      icon: <CheckCircle2 size={14} />,
      color: l.status.includes('Approved') ? 'text-emerald-400' : 'text-blue-400',
      bg: l.status.includes('Approved') ? 'bg-emerald-400/10' : 'bg-blue-400/10'
    }))
  ].sort((a, b) => b.time - a.time).slice(0, 5).map(act => ({
    ...act,
    time: (() => {
      const mins = Math.floor((new Date() - act.time) / 60000);
      if (mins < 60) return `${Math.max(1, mins)} min ago`;
      if (mins < 1440) return `${Math.floor(mins/60)} hr ago`;
      return `${Math.floor(mins/1440)} days ago`;
    })()
  }));

  const SidebarItem = ({ icon: Icon, label, active, onClick, comingSoon }) => (
    <div onClick={comingSoon ? undefined : onClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${comingSoon ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${active ? 'bg-primary border border-primary/20 text-gray-900 dark:text-white font-medium' : comingSoon ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}>
      <div className="flex items-center gap-3 flex-1">
        <Icon size={18} />
        <span className="text-sm">{label}</span>
      </div>
      {comingSoon && (
        <span className="px-1.5 py-0.5 bg-gray-500/20 text-gray-500 dark:text-gray-400 text-[8px] font-bold uppercase rounded-full">
          SOON
        </span>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-white font-sans overflow-hidden">
      
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-white/5 flex flex-col justify-between fixed lg:relative z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} h-full flex-shrink-0`}>
        <div className="p-5 flex-1 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src={`${import.meta.env.BASE_URL || '/'}ems_logo.png`} alt="EMS-master Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm">EMS-master</h2>
              <p className="text-[10px] text-gray-500 leading-tight">Employee Management System</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'Dashboard'} onClick={() => setActiveView('Dashboard')} />
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">HR Operations</p>
              <SidebarItem icon={Users} label="Employee Management" active={activeView === 'Employee Management'} onClick={() => setActiveView('Employee Management')} />
              <SidebarItem icon={Building2} label="Departments" active={activeView === 'Departments'} onClick={() => setActiveView('Departments')} comingSoon={true} />
              <SidebarItem icon={CalendarDays} label="Leave Management" active={activeView === 'Leave Management'} onClick={() => setActiveView('Leave Management')} />
              <SidebarItem icon={DollarSign} label="Payroll & Benefits" active={activeView === 'Payroll & Benefits'} onClick={() => setActiveView('Payroll & Benefits')} comingSoon={true} />
              <SidebarItem icon={Clock} label="Attendance" active={activeView === 'Attendance'} onClick={() => setActiveView('Attendance')} comingSoon={true} />
              <SidebarItem icon={FileText} label="Documents" active={activeView === 'Documents'} onClick={() => setActiveView('Documents')} comingSoon={true} />
              <SidebarItem icon={Bell} label="Announcements" active={activeView === 'Announcements'} onClick={() => setActiveView('Announcements')} />
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">Reports & Analytics</p>
              <SidebarItem icon={BarChart3} label="Reports" active={activeView === 'Reports'} onClick={() => setActiveView('Reports')} comingSoon={true} />
              <SidebarItem icon={Activity} label="Analytics" active={activeView === 'Analytics'} onClick={() => setActiveView('Analytics')} comingSoon={true} />
              <SidebarItem icon={Download} label="Export Data" active={activeView === 'Export Data'} onClick={() => setActiveView('Export Data')} comingSoon={true} />
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">System</p>
              <SidebarItem icon={Settings} label="Settings" active={activeView === 'Settings'} onClick={() => setActiveView('Settings')} comingSoon={true} />
              <SidebarItem icon={FileClock} label="Audit Logs" active={activeView === 'Audit Logs'} onClick={() => setActiveView('Audit Logs')} comingSoon={true} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/5 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-white/5">
            <div className="w-8 h-8 rounded-full bg-primary text-gray-900 dark:text-white flex items-center justify-center font-bold text-xs">
              {currentUser?.firstName?.charAt(0) || 'H'}R
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-semibold truncate">{currentUser?.firstName || 'HR Manager'}</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Human Resources</p>
            </div>
          </div>
          <button 
            onClick={changeUser}
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-red-500/20 hover:bg-red-500/10 text-red-400 rounded-xl font-semibold text-xs transition-colors"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-4 lg:px-8 border-b border-gray-200 dark:border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl lg:text-2xl font-heading font-bold text-gray-900 dark:text-white">HR Dashboard</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Welcome back, {currentUser?.firstName || 'Sarah'}! Here's what's happening in HR today.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search employees, leaves, documents..." 
                className="w-72 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-12 py-2 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-white/10 rounded text-[10px] font-sans text-gray-500 dark:text-gray-400">⌘K</kbd>
              </div>
            </div>
            
            <button 
              onClick={toggleTheme}
              className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0B0F19]"></span>
            </button>
            
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar">
          
          {activeView === 'Dashboard' ? (
            loading ? (
              <SkeletonLoader type="card" count={4} />
            ) : (
              <>
              {/* KPI Cards Row (5 Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                
                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Total Employees</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Users size={18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
                    <TrendingUp size={12} />
                    <span className="font-medium">12.5%</span>
                    <span className="text-gray-500">from last month</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-blue-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">New Hires (This Month)</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{newHires}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <UserPlus size={18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
                    <TrendingUp size={12} />
                    <span className="font-medium">9.1%</span>
                    <span className="text-gray-500">from last month</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-yellow-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Leave Requests</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalLeaveRequests}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                      <CalendarDays size={18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-yellow-500 mt-2">
                    <span className="font-medium">{leaves.filter(l => l.status === 'Pending').length} pending approval</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-emerald-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Payroll This Month</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${totalPayroll}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <DollarSign size={18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
                    <TrendingUp size={12} />
                    <span className="font-medium">8.7%</span>
                    <span className="text-gray-500">from last month</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5 hover:border-purple-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Attendance Rate</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{attendanceRate}%</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
                    <TrendingUp size={12} />
                    <span className="font-medium">2.5%</span>
                    <span className="text-gray-500">from last month</span>
                  </div>
                </div>

              </div>

              {/* Charts & Quick Actions Row */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
                
                {/* Growth Chart */}
                <div className="xl:col-span-2 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold">Employee Headcount Trend</h3>
                    <select className="bg-[#1F2937] border-none text-xs text-gray-700 dark:text-gray-300 rounded px-2 py-1 outline-none cursor-pointer">
                      <option>This Year</option>
                      <option>Last Year</option>
                    </select>
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorGrowthHR" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="employees" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowthHR)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5">
                  <h3 className="text-sm font-bold mb-4">Employees by Department</h3>
                  <div className="flex h-full items-center">
                    <div className="w-1/2 h-40 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={deptData.length ? deptData : [{name: 'None', value: 1}]}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {(deptData.length ? deptData : [{name: 'None', value: 1}]).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">{totalUsers}</span>
                        <span className="text-[9px] text-gray-500 font-semibold">Total</span>
                      </div>
                    </div>
                    <div className="w-1/2 flex flex-col gap-2 pl-2">
                      {deptData.map((dept, idx) => (
                        <div key={dept.name} className="flex justify-between items-center text-[10px]">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[50px]">{dept.name}</span>
                          </div>
                          <span className="text-gray-500 font-medium">{Math.round((dept.value / totalUsers) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions (2x3 Grid) */}
                <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5">
                  <h3 className="text-sm font-bold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div onClick={() => setIsUserModalOpen(true)} className="bg-gray-100 dark:bg-white/5 hover:bg-primary/10 border border-gray-200 dark:border-white/5 hover:border-primary/20 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
                      <UserPlus size={18} className="text-purple-400 group-hover:text-primary" />
                      <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400 text-center">Add<br/>Employee</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-white/5 hover:bg-emerald-500/10 border border-gray-200 dark:border-white/5 hover:border-emerald-500/20 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
                      <Users size={18} className="text-emerald-400 group-hover:text-emerald-500" />
                      <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400 text-center">Import<br/>Employees</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-white/5 hover:bg-yellow-500/10 border border-gray-200 dark:border-white/5 hover:border-yellow-500/20 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
                      <CalendarDays size={18} className="text-yellow-400 group-hover:text-yellow-500" />
                      <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400 text-center">Bulk Leave<br/>Update</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-white/5 hover:bg-blue-500/10 border border-gray-200 dark:border-white/5 hover:border-blue-500/20 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
                      <FileText size={18} className="text-blue-400 group-hover:text-blue-500" />
                      <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400 text-center">Generate<br/>Report</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-white/5 hover:bg-pink-500/10 border border-gray-200 dark:border-white/5 hover:border-pink-500/20 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
                      <Shield size={18} className="text-pink-400 group-hover:text-pink-500" />
                      <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400 text-center">Company<br/>Policy</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-white/5 hover:bg-emerald-500/10 border border-gray-200 dark:border-white/5 hover:border-emerald-500/20 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
                      <Bell size={18} className="text-emerald-400 group-hover:text-emerald-500" />
                      <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400 text-center">Announce<br/>Update</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Middle Row (Lists) */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                
                {/* Pending Leave Approvals */}
                <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold">Pending Leave Approvals</h3>
                    <button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">View All</button>
                  </div>
                  <div className="flex flex-col gap-4 flex-1">
                    {pendingLeaves.length === 0 ? (
                      <p className="text-xs text-gray-500 italic mt-2">No pending leaves</p>
                    ) : (
                      pendingLeaves.map((leave, idx) => {
                        const colors = ['bg-pink-500', 'bg-emerald-500', 'bg-primary', 'bg-yellow-500'];
                        const initials = leave.employeeId?.firstName?.charAt(0) || 'U';
                        const days = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) || 1;
                        
                        return (
                          <div key={leave._id} className="flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full ${colors[idx % colors.length]} flex items-center justify-center text-xs font-bold`}>
                                {initials}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-200">{leave.employeeId?.firstName || 'Employee'}</p>
                                <p className="text-[10px] text-gray-500">{leave.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right hidden sm:block">
                                <p className="text-[10px] text-gray-700 dark:text-gray-300">{days} day{days > 1 ? 's' : ''}</p>
                                <p className="text-[9px] text-gray-500">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                              </div>
                              
                              {/* HR Approval Action Hover */}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-12 bg-white dark:bg-[#111827] px-2">
                                <button onClick={() => handleLeaveAction(leave._id, 'HR_Approved')} className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded">
                                  <CheckCircle2 size={14} />
                                </button>
                                <button onClick={() => handleLeaveAction(leave._id, 'Rejected')} className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded">
                                  <span className="text-[14px] font-bold leading-none px-1">×</span>
                                </button>
                              </div>
                              
                              <span className="bg-yellow-500/20 text-yellow-500 text-[9px] font-bold px-2 py-0.5 rounded border border-yellow-500/20 group-hover:opacity-0 transition-opacity">
                                Pending
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Pending Documents */}
                <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold">Pending Documents</h3>
                    <button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">View All</button>
                  </div>
                  <div className="flex flex-col gap-4 flex-1">
                    {recentDocuments.map((doc, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-gray-500 dark:text-gray-400" />
                          <p className="text-xs font-semibold text-gray-200">{doc.title}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{doc.count} employees</p>
                          <span className="bg-yellow-500/20 text-yellow-500 text-[9px] font-bold px-2 py-0.5 rounded border border-yellow-500/20">
                            Pending
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold">Recent Activity</h3>
                    <button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">View All</button>
                  </div>
                  <div className="flex flex-col gap-4 flex-1">
                    {recentActivities.map((act, idx) => (
                      <div key={idx} className="flex justify-between items-start group">
                        <div className="flex gap-3">
                          <div className={`w-6 h-6 rounded-full ${act.bg} ${act.color} flex items-center justify-center shrink-0`}>
                            {act.icon}
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{act.title}: <span className="text-gray-500 dark:text-gray-400">{act.desc}</span></p>
                          </div>
                        </div>
                        <span className="text-[9px] text-gray-500 whitespace-nowrap shrink-0">{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Bottom Row (Recent Employees Table) */}
              <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold">Recent Employees</h3>
                  <button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">View All Employees</button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-white/5 text-[10px] uppercase tracking-wider text-gray-500">
                        <th className="pb-3 font-semibold">Name</th>
                        <th className="pb-3 font-semibold">Email</th>
                        <th className="pb-3 font-semibold">Department</th>
                        <th className="pb-3 font-semibold">Designation</th>
                        <th className="pb-3 font-semibold">Joining Date</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      {users.slice(0, 4).map((user, idx) => {
                        const initials = user.firstName?.charAt(0) || 'U';
                        const joiningDate = user.joiningDate ? new Date(user.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Jul 2026';
                        
                        return (
                          <tr key={user._id} className="border-b border-gray-200 dark:border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-700 text-gray-900 dark:text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {initials}
                                </div>
                                <span className="font-semibold text-gray-200">{user.firstName} {user.lastName}</span>
                              </div>
                            </td>
                            <td className="py-3 text-gray-500 dark:text-gray-400">{user.email}</td>
                            <td className="py-3 text-gray-700 dark:text-gray-300">{user.department || 'Not Assigned'}</td>
                            <td className="py-3 text-gray-700 dark:text-gray-300">{user.role}</td>
                            <td className="py-3 text-gray-500 dark:text-gray-400">{joiningDate}</td>
                            <td className="py-3">
                              <span className="text-emerald-400 text-[10px] font-semibold">Active</span>
                            </td>
                            <td className="py-3 text-right">
                              <button className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <MoreHorizontal size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
            )
          ) : activeView === 'Employee Management' ? (
            <EmployeeManagementView 
              users={users} 
              loading={loading} 
              role={currentUser?.role || 'HR'}
              onAddClick={() => setIsUserModalOpen(true)}
              onDeleteClick={() => toast.error("HR cannot delete users. Please contact Admin.")}
            />
          ) : activeView === 'Departments' ? (
            <DepartmentManagementView role={currentUser?.role || 'HR'} />
          ) : activeView === 'Leave Management' ? (
            <LeaveManagementView
              leaves={leaves}
              loading={loading}
              role={currentUser?.role || 'HR'}
              onLeaveAction={handleLeaveAction}
            />
          ) : activeView === 'Payroll & Benefits' ? (
            <PayrollView
              users={users}
              loading={loading}
              role={currentUser?.role || 'HR'}
            />
          ) : activeView === 'Attendance' ? (
            <AttendanceView
              users={users}
              loading={loading}
              role={currentUser?.role || 'HR'}
            />
          ) : activeView === 'Announcements' ? (
            <AnnouncementsView role={currentUser?.role || 'HR'} />
          ) : activeView === 'Reports' ? (
            <ReportsAnalyticsView
              users={users}
              tasks={[]}
              leaves={leaves}
              loading={loading}
              role={currentUser?.role || 'HR'}
            />
          ) : activeView === 'Analytics' ? (
            <AnalyticsView />
          ) : activeView === 'Export Data' ? (
            <ExportDataView />
          ) : activeView === 'Audit Logs' ? (
            <AuditLogsView />
          ) : activeView === 'Documents' ? (
            <DocumentsView role={currentUser?.role || 'HR'} />
          ) : activeView === 'Settings' ? (
            <SettingsView />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <Settings size={48} className="mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{activeView} Module</h2>
              <p>This module is currently being built.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <UserFormModal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        onSuccess={refreshData}
        currentRole={currentUser?.role}
      />
    </div>
  );
};

export default HRDashboard;
