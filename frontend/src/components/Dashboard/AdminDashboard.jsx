import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, Shield, Bell, Download, Search, LayoutDashboard,
  CalendarDays, CheckSquare, DollarSign, FileText, BarChart3, 
  Activity, FileClock, Settings, SlidersHorizontal, Database,
  TrendingUp, TrendingDown, MoreHorizontal, CheckCircle2, UserPlus, FileSpreadsheet, HardDrive, Menu, LogOut, Sun, Moon
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { userAPI, leaveAPI, taskAPI } from '../../services/api';
import { useAuth } from '../../context/AuthProvider';
import { useTheme } from '../../context/ThemeContext';
import SkeletonLoader from '../UI/SkeletonLoader';
import UserFormModal from '../UI/UserFormModal';
import TaskFormModal from '../UI/TaskFormModal';
import EmployeeManagementView from '../Views/EmployeeManagementView';
import DepartmentManagementView from '../Views/DepartmentManagementView';
import LeaveManagementView from '../Views/LeaveManagementView';
import TaskManagementView from '../Views/TaskManagementView';
import PayrollView from '../Views/PayrollView';
import AttendanceView from '../Views/AttendanceView';
import AnnouncementsView from '../Views/AnnouncementsView';
import ReportsAnalyticsView from '../Views/ReportsAnalyticsView';
import RolesPermissionsView from '../Views/RolesPermissionsView';
import AuditLogsView from '../Views/AuditLogsView';
import SystemConfigView from '../Views/SystemConfigView';
import BackupRestoreView from '../Views/BackupRestoreView';
import AnalyticsView from '../Views/AnalyticsView';
import SettingsView from '../Views/SettingsView';
import DocumentsView from '../Views/DocumentsView';
import { toast } from 'react-toastify';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];
const PIE_COLORS = { approved: '#10b981', pending: '#f59e0b', rejected: '#ef4444' };

const AdminDashboard = ({ changeUser }) => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  
  // Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [usersData, tasksData, leavesData] = await Promise.all([
          userAPI.getAll(),
          taskAPI.getAll(),
          leaveAPI.getAll()
        ]);
        setUsers(usersData || []);
        setTasks(tasksData || []);
        setLeaves(leavesData || []);
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
      const [usersData, tasksData, leavesData] = await Promise.all([
        userAPI.getAll(),
        taskAPI.getAll(),
        leaveAPI.getAll()
      ]);
      setUsers(usersData || []);
      setTasks(tasksData || []);
      setLeaves(leavesData || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLeaveAction = async (id, status) => {
    try {
      await leaveAPI.updateStatus(id, status, 'Reviewed by Admin');
      toast.success(`Leave request ${status === 'Approved' ? 'approved' : 'rejected'}`);
      setLeaves(leaves.map(l => l._id === id ? { ...l, status } : l));
    } catch (error) {
      toast.error('Failed to process leave request');
    }
  };

  const handleTaskAction = async (id, status) => {
    try {
      await taskAPI.updateStatus(id, status);
      toast.success(`Task marked as ${status}`);
      setTasks(tasks.map(t => t._id === id ? { ...t, status } : t));
    } catch (error) {
      toast.error('Failed to process task');
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
  const activeEmployees = users.filter(u => u.status !== 'Inactive').length;
  const inactiveEmployees = totalUsers - activeEmployees;
  const attritionRate = totalUsers > 0 ? ((inactiveEmployees / totalUsers) * 100).toFixed(1) : 0;
  
  const departments = [...new Set(users.map(u => u.department).filter(Boolean))];
  const numDepartments = departments.length;
  
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

  // Real Growth Data
  const calculateGrowthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    return months.map((month, index) => {
      const count = users.filter(u => {
        const d = new Date(u.createdAt || u.joiningDate || new Date());
        return d.getFullYear() < currentYear || (d.getFullYear() === currentYear && d.getMonth() <= index);
      }).length;
      return { name: month, employees: count };
    });
  };
  const growthData = calculateGrowthData();

  // Headcount Breakdown (Mocked based on total)
  const maleCount = Math.floor(totalUsers * 0.56);
  const femaleCount = Math.floor(totalUsers * 0.43);
  const contractorCount = totalUsers - maleCount - femaleCount;

  // Leave Summary
  const leaveSummary = [
    { name: 'Approved', value: leaves.filter(l => l.status === 'HR_Approved' || l.status === 'Approved').length, color: PIE_COLORS.approved },
    { name: 'Pending', value: leaves.filter(l => l.status === 'Pending' || l.status === 'Manager_Approved').length, color: PIE_COLORS.pending },
    { name: 'Rejected', value: leaves.filter(l => l.status === 'Rejected').length, color: PIE_COLORS.rejected },
  ];
  
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').slice(0, 3);
  const submittedTasks = tasks.filter(t => t.status === 'Completed').slice(0, 3);

  const recentApprovals = leaves
    .filter(l => l.status === 'Manager_Approved' || l.status === 'Pending')
    .slice(0, 3)
    .map(l => ({
      title: `Leave: ${l.employeeId?.firstName || 'User'}`,
      count: 1
    }));

  const recentActivities = [
    ...users.map(u => ({
      title: 'New employee added',
      desc: `${u.firstName} ${u.lastName}`,
      time: new Date(u.createdAt || u.joiningDate || new Date()),
      icon: <UserPlus size={14} />,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    })),
    ...leaves.map(l => ({
      title: `Leave ${l.status.replace('_', ' ').toLowerCase()}`,
      desc: l.employeeId?.firstName ? `${l.employeeId.firstName} ${l.employeeId.lastName}` : 'Employee',
      time: new Date(l.updatedAt || l.createdAt),
      icon: <CheckCircle2 size={14} />,
      color: l.status.includes('Approved') ? 'text-emerald-400' : 'text-purple-400',
      bg: l.status.includes('Approved') ? 'bg-emerald-400/10' : 'bg-purple-400/10'
    })),
    ...tasks.map(t => ({
      title: `Task ${t.status.replace('_', ' ').toLowerCase()}`,
      desc: t.title,
      time: new Date(t.updatedAt || t.createdAt),
      icon: <CheckSquare size={14} />,
      color: t.status === 'Completed' || t.status === 'Verified' ? 'text-emerald-400' : 'text-blue-400',
      bg: t.status === 'Completed' || t.status === 'Verified' ? 'bg-emerald-400/10' : 'bg-blue-400/10'
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
    <div onClick={comingSoon ? undefined : onClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${comingSoon ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${active ? 'bg-primary/20 text-primary font-medium' : comingSoon ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}>
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
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">Management</p>
              <SidebarItem icon={Users} label="Users" active={activeView === 'Users'} onClick={() => setActiveView('Users')} />
              <SidebarItem icon={Building2} label="Departments" active={activeView === 'Departments'} onClick={() => setActiveView('Departments')} comingSoon={true} />
              <SidebarItem icon={Shield} label="Roles & Permissions" active={activeView === 'Roles & Permissions'} onClick={() => setActiveView('Roles & Permissions')} comingSoon={true} />
              <SidebarItem icon={Bell} label="Announcements" active={activeView === 'Announcements'} onClick={() => setActiveView('Announcements')} />
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">Operations</p>
              <SidebarItem icon={CalendarDays} label="Leave Management" active={activeView === 'Leave Management'} onClick={() => setActiveView('Leave Management')} />
              <SidebarItem icon={CheckSquare} label="Task Management" active={activeView === 'Task Management'} onClick={() => setActiveView('Task Management')} />
              <SidebarItem icon={DollarSign} label="Payroll" active={activeView === 'Payroll'} onClick={() => setActiveView('Payroll')} comingSoon={true} />
              <SidebarItem icon={FileText} label="Documents" active={activeView === 'Documents'} onClick={() => setActiveView('Documents')} comingSoon={true} />
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">Analytics</p>
              <SidebarItem icon={BarChart3} label="Reports" active={activeView === 'Reports'} onClick={() => setActiveView('Reports')} comingSoon={true} />
              <SidebarItem icon={Activity} label="Analytics" active={activeView === 'Analytics'} onClick={() => setActiveView('Analytics')} comingSoon={true} />
              <SidebarItem icon={FileClock} label="Audit Logs" active={activeView === 'Audit Logs'} onClick={() => setActiveView('Audit Logs')} comingSoon={true} />
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">System</p>
              <SidebarItem icon={Settings} label="Settings" active={activeView === 'Settings'} onClick={() => setActiveView('Settings')} comingSoon={true} />
              <SidebarItem icon={SlidersHorizontal} label="System Config" active={activeView === 'System Config'} onClick={() => setActiveView('System Config')} comingSoon={true} />
              <SidebarItem icon={Database} label="Backup & Restore" active={activeView === 'Backup & Restore'} onClick={() => setActiveView('Backup & Restore')} comingSoon={true} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/5 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-white/5">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
              {currentUser?.firstName?.charAt(0) || 'S'}A
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-semibold truncate">{currentUser?.firstName || 'System Admin'}</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Super Administrator</p>
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
              <h1 className="text-xl lg:text-2xl font-heading font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Welcome back, System. Here is the complete organization overview.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-64 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-12 py-2 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white"
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
            
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(124,92,255,0.3)]">
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
              {/* KPI Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                
                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5 relative overflow-hidden group hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Total Users</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{totalUsers}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Users size={20} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-3">
                    <TrendingUp size={14} />
                    <span className="font-medium">12.5%</span>
                    <span className="text-gray-500">from last month</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Departments</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{numDepartments}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <Building2 size={20} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-3">
                    <TrendingUp size={14} />
                    <span className="font-medium">8.2%</span>
                    <span className="text-gray-500">from last month</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Active Employees</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{activeEmployees}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <UserPlus size={20} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-3">
                    <TrendingUp size={14} />
                    <span className="font-medium">10.1%</span>
                    <span className="text-gray-500">from last month</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5 relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Attrition Rate</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{attritionRate}%</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                      <TrendingDown size={20} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-3">
                    <TrendingDown size={14} />
                    <span className="font-medium">1.2%</span>
                    <span className="text-gray-500">from last month</span>
                  </div>
                </div>

              </div>

              {/* Main Dashboard Grid */}
              <div className="flex flex-col xl:flex-row gap-6 mb-6">
                
                {/* Center Column (Charts & Lists) */}
                <div className="flex-1 flex flex-col gap-6">
                  
                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Growth Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold">Employee Growth</h3>
                        <select className="bg-[#1F2937] border-none text-xs text-gray-700 dark:text-gray-300 rounded px-2 py-1 outline-none cursor-pointer">
                          <option>This Year</option>
                          <option>Last Year</option>
                        </select>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
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
                            <Area type="monotone" dataKey="employees" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Donut Chart */}
                    <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5">
                      <h3 className="text-sm font-bold mb-4">Department Distribution</h3>
                      <div className="h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={deptData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                              stroke="none"
                            >
                              {deptData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</span>
                          <span className="text-[10px] text-gray-500 font-semibold">Total</span>
                        </div>
                      </div>
                      
                      {/* Custom Legend */}
                      <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4 pl-4">
                        {deptData.map((dept, idx) => (
                          <div key={dept.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                              <span className="text-gray-700 dark:text-gray-300 truncate max-w-[80px]" title={dept.name}>{dept.name}</span>
                            </div>
                            <span className="text-gray-500 font-medium">{Math.round((dept.value / totalUsers) * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pending Approvals Section */}
                  <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold">Pending Approvals</h3>
                      <button className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors">View All</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                      
                      {/* Leave Requests Col */}
                      <div className="flex flex-col border-r border-gray-200 dark:border-white/5 pr-4 last:border-0 last:pr-0">
                        <div className="flex items-center gap-2 mb-4">
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Leave Requests</h4>
                          <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingLeaves.length}</span>
                        </div>
                        <div className="flex flex-col gap-3 flex-1">
                          {pendingLeaves.length === 0 ? (
                            <p className="text-xs text-gray-500 italic mt-2">No pending leaves</p>
                          ) : (
                            pendingLeaves.map(leave => (
                              <div key={leave._id} className="flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center">
                                    <CalendarDays size={14} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-200">{leave.employeeId?.firstName || 'Employee'}</p>
                                    <p className="text-[10px] text-gray-500">{leave.type}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-gray-500 font-medium group-hover:hidden">
                                    {Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24))} days
                                  </span>
                                  <div className="hidden group-hover:flex gap-1">
                                    <button onClick={() => handleLeaveAction(leave._id, 'Approved')} className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded">
                                      <CheckCircle2 size={12} />
                                    </button>
                                    <button onClick={() => handleLeaveAction(leave._id, 'Rejected')} className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded flex items-center justify-center">
                                      <span className="text-[14px] font-bold leading-none mt-[-2px]">×</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <button className="text-[11px] text-primary hover:text-primary/80 font-medium text-left mt-4 inline-flex items-center gap-1 transition-colors">
                          View all leave requests &rarr;
                        </button>
                      </div>

                      {/* Task Submissions Col */}
                      <div className="flex flex-col border-r border-gray-200 dark:border-white/5 pr-4 last:border-0 last:pr-0">
                        <div className="flex items-center gap-2 mb-4">
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Task Submissions</h4>
                          <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{submittedTasks.length}</span>
                        </div>
                        <div className="flex flex-col gap-3 flex-1">
                          {submittedTasks.length === 0 ? (
                            <p className="text-xs text-gray-500 italic mt-2">No pending tasks</p>
                          ) : (
                            submittedTasks.map(task => (
                              <div key={task._id} className="flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                    <CheckSquare size={14} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-gray-200">{task.assignedTo?.firstName || 'Employee'}</p>
                                    <p className="text-[10px] text-gray-500 truncate max-w-[100px]">{task.title}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-emerald-500 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded group-hover:hidden">
                                    Submitted
                                  </span>
                                  <div className="hidden group-hover:flex gap-1">
                                    <button onClick={() => handleTaskAction(task._id, 'Verified')} className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded">
                                      <CheckCircle2 size={12} />
                                    </button>
                                    <button onClick={() => handleTaskAction(task._id, 'Rejected')} className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded flex items-center justify-center">
                                      <span className="text-[14px] font-bold leading-none mt-[-2px]">×</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <button className="text-[11px] text-blue-400 hover:text-blue-300 font-medium text-left mt-4 inline-flex items-center gap-1 transition-colors">
                          View all tasks &rarr;
                        </button>
                      </div>

                      {/* HR Approvals Col */}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">HR Approvals</h4>
                          <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{recentApprovals.length}</span>
                        </div>
                        <div className="flex flex-col gap-3 flex-1">
                          {recentApprovals.map((hr, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{hr.title}</p>
                              <span className="text-[10px] text-gray-500 font-medium">{hr.count} request{hr.count > 1 ? 's' : ''}</span>
                            </div>
                          ))}
                        </div>
                        <button className="text-[11px] text-yellow-500 hover:text-yellow-400 font-medium text-left mt-4 inline-flex items-center gap-1 transition-colors">
                          View all approvals &rarr;
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 flex flex-col justify-between">
                      <h3 className="text-sm font-bold mb-4">Quick Actions</h3>
                      <div className="flex justify-between items-center px-2">
                        <div onClick={() => setIsUserModalOpen(true)} className="flex flex-col items-center gap-2 group cursor-pointer">
                          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                            <UserPlus size={20} />
                          </div>
                          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 text-center">Add<br/>User</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <Building2 size={20} />
                          </div>
                          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 text-center">Add<br/>Department</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <Users size={20} />
                          </div>
                          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 text-center">Import<br/>Users</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                          <div className="w-12 h-12 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-all">
                            <FileSpreadsheet size={20} />
                          </div>
                          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 text-center">Generate<br/>Report</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 group cursor-pointer">
                          <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                            <Database size={20} />
                          </div>
                          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 text-center">System<br/>Backup</span>
                        </div>
                      </div>
                    </div>

                    {/* Headcount Overview */}
                    <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold">Headcount Overview</h3>
                        <select className="bg-[#1F2937] border-none text-[10px] text-gray-700 dark:text-gray-300 rounded px-2 py-1 outline-none cursor-pointer">
                          <option>This Year</option>
                        </select>
                      </div>
                      
                      <div className="flex justify-between mb-4">
                        <div>
                          <p className="text-[10px] text-gray-500 font-medium">Total Headcount</p>
                          <p className="text-xl font-bold">{totalUsers}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-medium">Male</p>
                          <p className="text-sm font-bold">{maleCount} <span className="text-[10px] text-gray-500 font-normal">({Math.round((maleCount/totalUsers)*100)}%)</span></p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-medium">Female</p>
                          <p className="text-sm font-bold">{femaleCount} <span className="text-[10px] text-gray-500 font-normal">({Math.round((femaleCount/totalUsers)*100)}%)</span></p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-medium">Contractors</p>
                          <p className="text-sm font-bold">{contractorCount} <span className="text-[10px] text-gray-500 font-normal">({Math.round((contractorCount/totalUsers)*100)}%)</span></p>
                        </div>
                      </div>

                      {/* Stacked Bar Mock */}
                      <div className="w-full h-3 rounded-full overflow-hidden flex mt-2">
                        <div style={{ width: `${(maleCount/totalUsers)*100}%` }} className="h-full bg-primary"></div>
                        <div style={{ width: `${(femaleCount/totalUsers)*100}%` }} className="h-full bg-pink-500"></div>
                        <div style={{ width: `${(contractorCount/totalUsers)*100}%` }} className="h-full bg-yellow-500"></div>
                      </div>
                    </div>

                    {/* Leave Summary */}
                    <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 flex">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold mb-4">Leave Summary <span className="text-[10px] text-gray-500 font-normal">(This Month)</span></h3>
                        <div className="flex flex-col gap-2 mt-4">
                          {leaveSummary.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }}></span>
                                <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                              </div>
                              <span className="font-bold">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="w-24 h-24 relative self-end mb-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={leaveSummary}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={45}
                              paddingAngle={3}
                              dataKey="value"
                              stroke="none"
                            >
                              {leaveSummary.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{leaves.length}</span>
                          <span className="text-[8px] text-gray-500 font-semibold">Total</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right Sidebar (System Activity) */}
                <div className="w-full xl:w-72 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 flex flex-col shrink-0">
                  <h3 className="text-sm font-bold mb-6">Recent System Activity</h3>
                  
                  <div className="flex-1 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200 dark:bg-white/10"></div>
                    
                    <div className="flex flex-col gap-6 relative z-10">
                      {recentActivities.map((act, idx) => (
                        <div key={idx} className="flex gap-4 group cursor-pointer">
                          <div className={`w-8 h-8 rounded-full ${act.bg} ${act.color} flex items-center justify-center shrink-0 ring-4 ring-[#111827] transition-transform group-hover:scale-110`}>
                            {act.icon}
                          </div>
                          <div className="pt-1">
                            <p className="text-xs font-semibold text-gray-200 leading-tight">{act.title}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{act.desc}</p>
                            <p className="text-[10px] text-gray-600 mt-1">{act.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </>
            )
          ) : activeView === 'Users' ? (
            <EmployeeManagementView 
              users={users} 
              loading={loading} 
              role={currentUser?.role || 'Admin'}
              onAddClick={() => setIsUserModalOpen(true)}
              onDeleteClick={handleDeleteUser}
            />
          ) : activeView === 'Leave Management' ? (
            <LeaveManagementView
              leaves={leaves}
              loading={loading}
              role={currentUser?.role || 'Admin'}
              onLeaveAction={handleLeaveAction}
            />
          ) : activeView === 'Task Management' ? (
            <TaskManagementView
              tasks={tasks}
              loading={loading}
              role={currentUser?.role || 'Admin'}
              onTaskAction={handleTaskAction}
              onAddClick={() => setIsTaskModalOpen(true)}
            />
          ) : activeView === 'Departments' ? (
            <DepartmentManagementView role={currentUser?.role || 'Admin'} />
          ) : activeView === 'Roles & Permissions' ? (
            <RolesPermissionsView />
          ) : activeView === 'Audit Logs' ? (
            <AuditLogsView />
          ) : activeView === 'System Config' ? (
            <SystemConfigView />
          ) : activeView === 'Backup & Restore' ? (
            <BackupRestoreView />
          ) : activeView === 'Payroll' ? (
            <PayrollView
              users={users}
              loading={loading}
              role={currentUser?.role || 'Admin'}
            />
          ) : activeView === 'Attendance' ? (
            <AttendanceView
              users={users}
              loading={loading}
              role={currentUser?.role || 'Admin'}
            />
          ) : activeView === 'Announcements' ? (
            <AnnouncementsView role={currentUser?.role || 'Admin'} />
          ) : activeView === 'Reports' ? (
            <ReportsAnalyticsView
              users={users}
              tasks={tasks}
              leaves={leaves}
              loading={loading}
              role={currentUser?.role || 'Admin'}
            />
          ) : activeView === 'Analytics' ? (
            <AnalyticsView />
          ) : activeView === 'Documents' ? (
            <DocumentsView role={currentUser?.role || 'Admin'} />
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
      <TaskFormModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSuccess={refreshData}
        currentRole={currentUser?.role}
      />
    </div>
  );
};

export default AdminDashboard;