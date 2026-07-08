import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, Bell, Search, LayoutDashboard,
  CalendarDays, CheckSquare, BarChart3, Activity, Settings, 
  TrendingUp, TrendingDown, Clock, FileText, Download, LogOut, Plus,
  ChevronDown, ChevronLeft, ChevronRight, X, UserCog, Menu, Sun, Moon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { taskAPI, userAPI, leaveAPI } from '../../services/api';
import { useAuth } from '../../context/AuthProvider';
import { useTheme } from '../../context/ThemeContext';
import SkeletonLoader from '../UI/SkeletonLoader';
import TaskFormModal from '../UI/TaskFormModal';
import EmployeeManagementView from '../Views/EmployeeManagementView';
import LeaveManagementView from '../Views/LeaveManagementView';
import TaskManagementView from '../Views/TaskManagementView';
import AnnouncementsView from '../Views/AnnouncementsView';
import ReportsAnalyticsView from '../Views/ReportsAnalyticsView';
import SettingsView from '../Views/SettingsView';
import DocumentsView from '../Views/DocumentsView';
import { toast } from 'react-toastify';

const STATUS_COLORS = {
  Completed: '#10b981', // emerald-500
  In_Progress: '#3b82f6', // blue-500
  To_Do: '#8b5cf6', // purple-500
  Assigned: '#8b5cf6', 
};

const ManagerDashboard = ({ changeUser }) => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [leaves, setLeaves] = useState([]);
  
  // Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', dueDate: '', priority: 'Medium' });

  const refreshData = async () => {
    try {
      const [usersData, tasksData, leavesData] = await Promise.all([
        userAPI.getAll(),
        taskAPI.getAll(),
        leaveAPI.getAll()
      ]);
      const myTeam = usersData.filter(u => u.managerId === currentUser?._id || u.department === currentUser?.department);
      const teamLeaves = leavesData.filter(l => myTeam.some(emp => emp._id === l.employeeId?._id));
      const myTasks = tasksData.filter(t => myTeam.some(emp => emp._id === t.assignedTo?._id));
      
      setTeam(myTeam);
      setLeaves(teamLeaves);
      setTasks(myTasks);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleVerifyTask = async (id, status) => {
    try {
      await taskAPI.updateStatus(id, status);
      toast.success(`Task ${status === 'Verified' ? 'verified' : 'rejected'}`);
      refreshData();
    } catch (error) {
      toast.error('Failed to process task');
    }
  };

  const handleLeaveAction = async (id, status) => {
    try {
      await leaveAPI.updateStatus(id, status, 'Reviewed by Manager');
      toast.success(`Leave request ${status === 'Manager_Approved' ? 'approved' : 'rejected'}`);
      refreshData();
    } catch (error) {
      toast.error('Failed to process leave');
    }
  };

  // Derived Metrics
  const totalTeam = team.length;
  const tasksInProgress = tasks.filter(t => t.status === 'In_Progress').length;
  const tasksCompleted = tasks.filter(t => t.status === 'Completed' || t.status === 'Verified').length;
  
  const pendingTaskApprovals = tasks.filter(t => t.status === 'Completed');
  const pendingLeaveRequests = leaves.filter(l => l.status === 'Pending');
  const pendingApprovalsCount = pendingTaskApprovals.length + pendingLeaveRequests.length;
  
  // Combine pending approvals for the middle list
  const pendingList = [
    ...pendingLeaveRequests.map(l => ({ ...l, type: 'Leave' })),
    ...pendingTaskApprovals.map(t => ({ ...t, type: 'Task' }))
  ].sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));

  // Upcoming Deadlines (Active tasks sorted by due date)
  const upcomingDeadlines = tasks
    .filter(t => t.status !== 'Completed' && t.status !== 'Verified' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  // Status Pie Chart Data
  const tasksToDo = tasks.filter(t => t.status === 'Assigned').length;
  const totalTasksCount = tasksInProgress + tasksCompleted + tasksToDo || 1; // avoid divide by 0
  const pieData = [
    { name: 'Completed', value: tasksCompleted, color: STATUS_COLORS.Completed },
    { name: 'In Progress', value: tasksInProgress, color: STATUS_COLORS.In_Progress },
    { name: 'To Do', value: tasksToDo, color: STATUS_COLORS.To_Do },
  ];

  // Team Performance Data (Completion % per employee)
  const teamPerformance = team.map(emp => {
    const empTasks = tasks.filter(t => t.assignedTo?._id === emp._id || t.assignedTo === emp._id);
    const completed = empTasks.filter(t => t.status === 'Completed' || t.status === 'Verified').length;
    const total = empTasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { ...emp, completionRate };
  }).sort((a, b) => b.completionRate - a.completionRate).slice(0, 5); // top 5
  
  const avgTeamPerformance = teamPerformance.length > 0 
    ? Math.round(teamPerformance.reduce((acc, curr) => acc + curr.completionRate, 0) / teamPerformance.length) 
    : 0;

  // Dynamic Line Chart Data (Last 7 Days)
  const lineData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    // For a real app, this would query a daily snapshot or task logs.
    // Here we'll just distribute current tasks based on updated/created dates roughly matching the day.
    const dayTasks = tasks.filter(t => {
      const tDate = new Date(t.updatedAt || t.createdAt);
      return tDate.toDateString() === d.toDateString();
    });

    return {
      name: dayName,
      completed: dayTasks.filter(t => t.status === 'Completed' || t.status === 'Verified').length,
      inProgress: dayTasks.filter(t => t.status === 'In_Progress').length,
      toDo: dayTasks.filter(t => t.status === 'Assigned').length,
    };
  });

  const recentActivities = [
    ...leaves.map(l => ({
      title: `Leave ${l.status.replace('_', ' ').toLowerCase()}`,
      desc: l.employeeId?.firstName ? `${l.employeeId.firstName} ${l.employeeId.lastName}` : 'Employee',
      time: new Date(l.updatedAt || l.createdAt),
      icon: <CalendarDays size={14} />,
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

          <div className="mb-6 p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-between cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 text-gray-900 dark:text-white flex items-center justify-center font-bold text-xs">
                {currentUser?.firstName?.charAt(0) || 'M'}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-semibold truncate">{currentUser?.firstName || 'Manager'}</h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate uppercase tracking-widest font-bold">Team Manager</p>
              </div>
            </div>
            <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
          </div>

          <div className="space-y-6">
            <div>
              <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'Dashboard'} onClick={() => setActiveView('Dashboard')} />
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">Management</p>
              <SidebarItem icon={Users} label="Team Members" active={activeView === 'Team Members'} onClick={() => setActiveView('Team Members')} />
              <SidebarItem icon={CheckSquare} label="Task Management" active={activeView === 'Task Management'} onClick={() => setActiveView('Task Management')} />
              <SidebarItem icon={CalendarDays} label="Leave Approvals" active={activeView === 'Leave Approvals'} onClick={() => setActiveView('Leave Approvals')} />
              <SidebarItem icon={TrendingUp} label="My Team Performance" active={activeView === 'My Team Performance'} onClick={() => setActiveView('My Team Performance')} comingSoon={true} />
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">Reports</p>
              <SidebarItem icon={FileText} label="Team Reports" active={activeView === 'Team Reports'} onClick={() => setActiveView('Team Reports')} comingSoon={true} />
              <SidebarItem icon={Activity} label="Analytics" active={activeView === 'Analytics'} onClick={() => setActiveView('Analytics')} comingSoon={true} />
              <SidebarItem icon={Download} label="Export Data" active={activeView === 'Export Data'} onClick={() => setActiveView('Export Data')} comingSoon={true} />
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">Settings</p>
              <SidebarItem icon={Settings} label="Profile Settings" active={activeView === 'Profile Settings'} onClick={() => setActiveView('Profile Settings')} comingSoon={true} />
              <SidebarItem icon={Bell} label="Notification Settings" active={activeView === 'Notification Settings'} onClick={() => setActiveView('Notification Settings')} comingSoon={true} />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-white/5">
          <button 
            onClick={changeUser}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-xs transition-colors"
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
              <h1 className="text-xl lg:text-2xl font-heading font-bold text-gray-900 dark:text-white">Manager Dashboard</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Welcome back, {currentUser?.firstName || 'Michael'}! Here's what's happening with your team.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search tasks, employees..." 
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
              {pendingApprovalsCount > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-[#090D14] text-[8px] font-bold flex items-center justify-center text-gray-900 dark:text-white">{pendingApprovalsCount}</span>}
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
                
                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Total Team Members</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{totalTeam}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Users size={18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
                    <TrendingUp size={12} />
                    <span className="font-medium">2 new</span>
                    <span className="text-gray-500">this month</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Tasks In Progress</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{tasksInProgress}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <CalendarDays size={18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
                    <TrendingUp size={12} />
                    <span className="font-medium">16.7%</span>
                    <span className="text-gray-500">from last week</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Tasks Completed</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{tasksCompleted}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <CheckCircle size={18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
                    <TrendingUp size={12} />
                    <span className="font-medium">28.6%</span>
                    <span className="text-gray-500">from last week</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Pending Approvals</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{pendingApprovalsCount}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                      <Clock size={18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-red-400 mt-2">
                    <TrendingDown size={12} />
                    <span className="font-medium">20%</span>
                    <span className="text-gray-500">from last week</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Team Performance</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{avgTeamPerformance}%</h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
                    <TrendingUp size={12} />
                    <span className="font-medium">5%</span>
                    <span className="text-gray-500">from last month</span>
                  </div>
                </div>

              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                
                {/* Line Chart */}
                <div className="lg:col-span-1 xl:col-span-1 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5" style={{ flexGrow: 1.5 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold">Task Overview</h3>
                    <select className="bg-[#1F2937] border-none text-[10px] text-gray-700 dark:text-gray-300 rounded px-2 py-1 outline-none cursor-pointer">
                      <option>This Week</option>
                    </select>
                  </div>
                  <div className="flex gap-4 mb-4 text-[10px] font-medium pl-4">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Completed</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div>In Progress</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div>To Do</span>
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px' }} itemStyle={{ color: '#fff', fontSize: '12px' }} />
                        <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="inProgress" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="toDo" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5">
                  <h3 className="text-sm font-bold mb-4">Tasks by Status</h3>
                  <div className="flex h-48 items-center">
                    <div className="w-1/2 h-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] text-gray-500 font-semibold mb-[-4px]">Total</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalTasksCount}</span>
                      </div>
                    </div>
                    <div className="w-1/2 flex flex-col gap-4 pl-4 justify-center">
                      {pieData.map((data, idx) => (
                        <div key={data.name} className="flex justify-between items-center text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.color }}></span>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{data.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-gray-900 dark:text-white font-medium mr-1">{data.value}</span>
                            <span className="text-gray-500">({Math.round((data.value / totalTasksCount) * 100)}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Team Performance List */}
                <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold">Team Performance</h3>
                    <select className="bg-[#1F2937] border-none text-[10px] text-gray-700 dark:text-gray-300 rounded px-2 py-1 outline-none cursor-pointer">
                      <option>This Month</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-4 flex-1">
                    {teamPerformance.map((emp, idx) => {
                      const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
                      const hexColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
                      const initials = emp.firstName?.charAt(0) || 'U';
                      
                      return (
                        <div key={emp._id} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${colors[idx % colors.length]}/20 text-gray-900 dark:text-white flex items-center justify-center text-[10px] font-bold shrink-0 border border-${colors[idx % colors.length].split('-')[1]}-500/30`}>
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-[11px] font-semibold text-gray-200 truncate">{emp.firstName} {emp.lastName}</p>
                            <p className="text-[9px] text-gray-500 truncate">{emp.role}</p>
                          </div>
                          <div className="w-24 shrink-0 flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${emp.completionRate}%`, backgroundColor: hexColors[idx % hexColors.length] }}></div>
                            </div>
                            <span className="text-[10px] font-bold w-6 text-right">{emp.completionRate}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button className="text-[10px] text-primary hover:text-primary/80 font-medium text-left mt-4 transition-colors">
                    View full performance &rarr;
                  </button>
                </div>

              </div>

              {/* Lists Row */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                
                {/* My Team Tasks */}
                <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold">My Team Tasks</h3>
                    <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors bg-primary/10 px-3 py-1 rounded-lg">View All</button>
                  </div>
                  <div className="flex gap-4 text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-4 border-b border-gray-200 dark:border-white/5 pb-2">
                    <span className="text-primary border-b border-primary pb-2 -mb-[9px] cursor-pointer">All Tasks</span>
                    <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">To Do</span>
                    <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">In Progress</span>
                    <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">Completed</span>
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    {tasks.slice(0, 4).map((task) => (
                      <div key={task._id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors group">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-1.5 h-1.5 rounded-full ${task.status === 'Completed' || task.status === 'Verified' ? 'bg-emerald-500' : task.status === 'In_Progress' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                          <div>
                            <p className="text-xs font-semibold text-gray-200">{task.title}</p>
                            <p className="text-[10px] text-gray-500">{task.assignedTo?.firstName || 'Unassigned'} • {task.assignedTo?.department || 'Employee'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${task.status === 'Completed' || task.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : task.status === 'In_Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${task.priority === 'High' ? 'bg-red-500/10 text-red-400' : task.priority === 'Low' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                            {task.priority || 'Medium'}
                          </span>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 w-20 justify-end">
                            <CalendarDays size={10} />
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year:'numeric'}) : 'No Date'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="text-[10px] text-primary hover:text-primary/80 font-medium text-left mt-4 transition-colors">
                    View all tasks &rarr;
                  </button>
                </div>

                {/* Pending Approvals */}
                <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold">Pending Approvals</h3>
                    <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors bg-primary/10 px-3 py-1 rounded-lg">View All</button>
                  </div>
                  <div className="flex flex-col gap-4 flex-1">
                    {pendingList.slice(0, 4).map((item, idx) => {
                      const isLeave = item.type === 'Leave';
                      const title = isLeave ? 'Leave Request' : 'Task Completion';
                      const name = isLeave ? item.employeeId?.firstName : item.assignedTo?.firstName;
                      const desc = isLeave ? `${item.type} (${Math.ceil((new Date(item.endDate) - new Date(item.startDate)) / (1000 * 60 * 60 * 24)) || 1} days)` : item.title;
                      
                      return (
                        <div key={item._id} className="flex justify-between items-center group relative">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center">
                              {isLeave ? <CalendarDays size={14} className="text-gray-500 dark:text-gray-400" /> : <CheckSquare size={14} className="text-gray-500 dark:text-gray-400" />}
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold text-gray-200">{title}</p>
                              <p className="text-[9px] text-gray-500 dark:text-gray-400">{name}</p>
                              <p className="text-[9px] text-gray-500 truncate max-w-[150px]">{desc}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {/* Actions on Hover */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-24 bg-white dark:bg-[#111827] px-2">
                                <button 
                                  onClick={() => isLeave ? handleLeaveAction(item._id, 'Manager_Approved') : handleVerifyTask(item._id, 'Verified')} 
                                  className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button 
                                  onClick={() => isLeave ? handleLeaveAction(item._id, 'Rejected') : handleVerifyTask(item._id, 'In_Progress')} 
                                  className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded"
                                >
                                  <X size={14} />
                                </button>
                            </div>
                            
                            <span className="bg-yellow-500/10 text-yellow-500 text-[9px] font-bold px-2 py-0.5 rounded border border-yellow-500/20 group-hover:opacity-0 transition-opacity">
                              Pending
                            </span>
                            <div className="text-[9px] text-gray-500 flex items-center gap-1 w-20 justify-end text-right">
                              {isLeave ? <CalendarDays size={10} /> : ''}
                              {isLeave 
                                ? `${new Date(item.startDate).toLocaleDateString('en-GB', {day:'2-digit', month:'short'})} - ${new Date(item.endDate).toLocaleDateString('en-GB', {day:'2-digit', month:'short'})}`
                                : `Submitted ${new Date(item.updatedAt || Date.now()).toLocaleDateString('en-GB', {day:'2-digit', month:'short'})}`
                              }
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {pendingList.length === 0 && <p className="text-xs text-gray-500 italic mt-2">No pending approvals</p>}
                  </div>
                  <button className="text-[10px] text-primary hover:text-primary/80 font-medium text-left mt-4 transition-colors">
                    View all approvals &rarr;
                  </button>
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold">Upcoming Deadlines</h3>
                  </div>
                  <div className="flex flex-col gap-4 flex-1">
                    {upcomingDeadlines.length === 0 ? (
                      <p className="text-xs text-gray-500 italic mt-2">No upcoming deadlines</p>
                    ) : (
                      upcomingDeadlines.map((task, idx) => {
                        const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                        const isUrgent = daysLeft <= 3;
                        
                        return (
                          <div key={task._id} className="flex justify-between items-center">
                            <div className="flex items-start gap-3">
                              <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${isUrgent ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                              <div>
                                <p className="text-xs font-semibold text-gray-200">{task.title}</p>
                                <p className="text-[10px] text-gray-500">{task.assignedTo?.firstName || 'Unassigned'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isUrgent ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                              </span>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 w-16 text-right">
                                {new Date(task.dueDate).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <button className="text-[10px] text-primary hover:text-primary/80 font-medium text-left mt-4 transition-colors">
                    View calendar &rarr;
                  </button>
                </div>

              </div>

              {/* Bottom Row - Recent Activity */}
              <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 mb-4 relative group">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold">Recent Activity</h3>
                  <div className="flex gap-2">
                    <button className="p-1 rounded bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"><ChevronLeft size={14}/></button>
                    <button className="p-1 rounded bg-gray-200 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"><ChevronRight size={14}/></button>
                  </div>
                </div>
                
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {recentActivities.length === 0 ? (
                    <p className="text-xs text-gray-500 italic mt-2 ml-2">No recent activity</p>
                  ) : (
                    recentActivities.map((act, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-lg min-w-[280px] shrink-0 border border-gray-200 dark:border-white/5 group hover:bg-white/[0.04] transition-colors">
                        <div className={`w-8 h-8 rounded-full ${act.bg} ${act.color} flex items-center justify-center shrink-0`}>
                          {act.icon}
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{act.title}</p>
                          <p className="text-[9px] text-gray-500 dark:text-gray-400">{act.desc}</p>
                          <p className="text-[9px] text-gray-500 mt-0.5">{act.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
            )
          ) : activeView === 'Team Members' ? (
            <EmployeeManagementView 
              users={team} 
              loading={loading} 
              role={currentUser?.role || 'Manager'}
              onAddClick={() => {}} 
              onDeleteClick={() => {}} 
            />
          ) : activeView === 'Leave Approvals' ? (
            <LeaveManagementView
              leaves={leaves}
              loading={loading}
              role={currentUser?.role || 'Manager'}
              onLeaveAction={handleLeaveAction}
            />
          ) : activeView === 'Task Management' ? (
            <TaskManagementView
              tasks={tasks}
              loading={loading}
              role={currentUser?.role || 'Manager'}
              onTaskAction={handleVerifyTask}
              onAddClick={() => setIsAssignModalOpen(true)}
            />
          ) : activeView === 'Announcements' ? (
            <AnnouncementsView role={currentUser?.role || 'Manager'} />
          ) : activeView === 'Performance' ? (
            <ReportsAnalyticsView
              users={team}
              tasks={tasks}
              leaves={leaves}
              loading={loading}
              role={currentUser?.role || 'Manager'}
            />
          ) : activeView === 'Settings' && currentUser ? (
            <SettingsView user={currentUser} />
          ) : activeView === 'Documents' ? (
            <DocumentsView role={currentUser?.role} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <Settings size={48} className="mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{activeView} Module</h2>
              <p>This module is currently being built.</p>
            </div>
          )}
        </div>

        {/* Task Creation Modal */}
        <TaskFormModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={refreshData}
          currentRole={currentUser?.role}
        />

      </div>
    </div>
  );
};

export default ManagerDashboard;
