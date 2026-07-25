import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, Bell, Search, LayoutDashboard,
  CalendarDays, CheckSquare, Settings, Activity, Clock,
  FileText, LogOut, ChevronDown, CheckCircle2, XCircle, Shield,
  MoreHorizontal, Eye, Plus, ChevronLeft, ChevronRight, UserCircle, RefreshCcw, BellRing, Plane, Pill, Briefcase, Menu, Sun, Moon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { taskAPI, leaveAPI, announcementAPI } from '../../services/api';
import { useAuth } from '../../context/AuthProvider';
import { useTheme } from '../../context/ThemeContext';
import SkeletonLoader from '../UI/SkeletonLoader';
import LeaveFormModal from '../UI/LeaveFormModal';
import LeaveManagementView from '../Views/LeaveManagementView';
import TaskManagementView from '../Views/TaskManagementView';
import AttendanceView from '../Views/AttendanceView';
import AnnouncementsView from '../Views/AnnouncementsView';
import DocumentsView from '../Views/DocumentsView';
import SettingsView from '../Views/SettingsView';
import PayrollView from '../Views/PayrollView';
import { toast } from 'react-toastify';

const STATUS_COLORS = {
  To_Do: '#3b82f6', // blue-500
  In_Progress: '#f59e0b', // yellow-500
  Verification: '#8b5cf6', // purple-500
  Completed: '#10b981', // emerald-500
  Rejected: '#ef4444', // red-500
};

const EmployeeDashboard = ({ changeUser }) => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [activeView, setActiveView] = useState('Dashboard');
  
  // Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchTasksAndLeaves = async () => {
    try {
      setLoading(true);
      const [allTasks, allLeaves, allAnnouncements] = await Promise.all([
        taskAPI.getAll(),
        leaveAPI.getAll(),
        announcementAPI.getAll()
      ]);
      
      const myTasks = allTasks.filter(t => t.assignedTo === currentUser?._id || t.assignedTo?._id === currentUser?._id);
      const myLeaves = allLeaves.filter(l => l.employeeId === currentUser?._id || l.employeeId?._id === currentUser?._id);
      
      setTasks(myTasks);
      setLeaves(myLeaves);
      setAnnouncements(allAnnouncements || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndLeaves();
  }, [currentUser]);

  const handleTaskAction = async (id, status) => {
    try {
      await taskAPI.updateStatus(id, status);
      toast.success(`Task marked as ${status.replace('_', ' ')}`);
      fetchTasksAndLeaves();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  // Derived Metrics
  const totalTasks = tasks.length;
  const tasksToDo = tasks.filter(t => t.status === 'Assigned').length;
  const tasksInProgress = tasks.filter(t => t.status === 'In_Progress').length;
  const tasksVerification = tasks.filter(t => t.status === 'Completed').length; // Assuming 'Completed' is actually Verification, and we need a Verified state
  const tasksCompleted = tasks.filter(t => t.status === 'Verified').length;
  const tasksRejected = tasks.filter(t => t.status === 'Rejected').length;

  // Donut Chart Data
  const pieData = [
    { name: 'To Do', value: tasksToDo, color: STATUS_COLORS.To_Do },
    { name: 'In Progress', value: tasksInProgress, color: STATUS_COLORS.In_Progress },
    { name: 'Verification', value: tasksVerification, color: STATUS_COLORS.Verification },
    { name: 'Completed', value: tasksCompleted, color: STATUS_COLORS.Completed },
    { name: 'Rejected', value: tasksRejected, color: STATUS_COLORS.Rejected },
  ];

  // Upcoming Deadlines (Active tasks sorted by due date)
  const upcomingDeadlines = tasks
    .filter(t => t.status !== 'Completed' && t.status !== 'Verified' && t.status !== 'Rejected' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'All') return true;
    if (activeTab === 'To Do') return t.status === 'Assigned';
    if (activeTab === 'In Progress') return t.status === 'In_Progress';
    if (activeTab === 'Verification') return t.status === 'Completed';
    if (activeTab === 'Completed') return t.status === 'Verified';
    if (activeTab === 'Rejected') return t.status === 'Rejected';
    return true;
  });

  // Leave Balances
  const calculateLeaveDays = (type) => {
    return leaves
      .filter(l => l.type === type && (l.status === 'Approved' || l.status === 'HR_Approved' || l.status === 'Manager_Approved'))
      .reduce((total, l) => total + (Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) || 1), 0);
  };
  
  const vacationBal = 20 - calculateLeaveDays('vacation');
  const sickBal = 10 - calculateLeaveDays('sick');
  const personalBal = 5 - calculateLeaveDays('personal');
  const compOffBal = 5 - calculateLeaveDays('other');

  const SidebarItem = ({ icon: Icon, label, active, badge, onClick, comingSoon }) => (
    <div onClick={comingSoon ? undefined : onClick} className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all ${comingSoon ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${active ? 'bg-primary/20 text-primary font-medium' : comingSoon ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}`}>
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {comingSoon && (
          <span className="px-1.5 py-0.5 bg-gray-500/20 text-gray-500 dark:text-gray-400 text-[8px] font-bold uppercase rounded-full">
            SOON
          </span>
        )}
        {badge && (
          <div className="w-5 h-5 rounded-full bg-red-500 text-gray-900 dark:text-white flex items-center justify-center text-[10px] font-bold">
            {badge}
          </div>
        )}
      </div>
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
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-gray-900 dark:text-white flex items-center justify-center font-bold text-xs">
                {currentUser?.firstName?.charAt(0) || 'J'}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-semibold truncate">{currentUser?.firstName || 'Jim'} {currentUser?.lastName || 'Halpert'}</h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate uppercase tracking-widest font-bold">Employee</p>
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
              <SidebarItem icon={CheckSquare} label="My Tasks" active={activeView === 'My Tasks'} onClick={() => setActiveView('My Tasks')} />
              <SidebarItem icon={CalendarDays} label="Leave Requests" active={activeView === 'Leave Requests'} onClick={() => setActiveView('Leave Requests')} />
              <SidebarItem icon={FileText} label="My Documents" active={activeView === 'My Documents'} onClick={() => setActiveView('My Documents')} comingSoon={true} />
              <SidebarItem icon={UserCircle} label="My Profile" active={activeView === 'My Profile'} onClick={() => setActiveView('My Profile')} comingSoon={true} />
              <SidebarItem icon={FileText} label="Payslip" active={activeView === 'Payslip'} onClick={() => setActiveView('Payslip')} comingSoon={true} />
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-2">Communication</p>
              <SidebarItem icon={Bell} label="Announcements" active={activeView === 'Announcements'} onClick={() => setActiveView('Announcements')} />
              <SidebarItem icon={BellRing} label="Notifications" badge={announcements.length > 0 ? announcements.length : null} active={activeView === 'Notifications'} onClick={() => setActiveView('Notifications')} />
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
              <h1 className="text-xl lg:text-2xl font-heading font-bold text-gray-900 dark:text-white">Employee Dashboard</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Welcome back, {currentUser?.firstName || 'Jim'}! Here's your work overview.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search tasks, documents..." 
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
              {announcements.length > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-[#090D14] text-[8px] font-bold flex items-center justify-center text-gray-900 dark:text-white">{announcements.length}</span>}
            </button>
            
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-gray-900 dark:text-white flex items-center justify-center font-bold text-xs">
                {currentUser?.firstName?.charAt(0) || 'J'}
              </div>
              <span className="text-sm font-semibold">{currentUser?.firstName || 'Jim'} {currentUser?.lastName || 'Halpert'}</span>
              <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar relative">
          
          {activeView === 'Dashboard' ? (
            loading ? (
              <SkeletonLoader type="card" count={4} />
            ) : (
              <>
              {/* KPI Cards Row (6 Cards) */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                
                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5 flex flex-col justify-between h-[100px]">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">My Tasks</p>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <CalendarDays size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{totalTasks}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Total Tasks</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5 flex flex-col justify-between h-[100px]">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">To Do</p>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{tasksToDo}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Tasks</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5 flex flex-col justify-between h-[100px]">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">In Progress</p>
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                      <RefreshCcw size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{tasksInProgress}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Tasks</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5 flex flex-col justify-between h-[100px]">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">Verification</p>
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <Shield size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{tasksVerification}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Tasks</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5 flex flex-col justify-between h-[100px]">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">Completed</p>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <CheckCircle size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{tasksCompleted}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Tasks</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-gray-200 dark:border-white/5 flex flex-col justify-between h-[100px]">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">Rejected</p>
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                      <XCircle size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{tasksRejected}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Tasks</p>
                  </div>
                </div>

              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
                
                {/* Donut Chart */}
                <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5">
                  <h3 className="text-sm font-bold mb-4">Tasks Overview</h3>
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
                        <span className="text-2xl font-bold text-gray-900 dark:text-white mb-[-4px]">{totalTasks}</span>
                        <span className="text-[10px] text-gray-500 font-semibold">Total</span>
                      </div>
                    </div>
                    <div className="w-1/2 flex flex-col gap-2 pl-4 justify-center">
                      {pieData.map((data, idx) => (
                        <div key={data.name} className="flex justify-between items-center text-[10px]">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: data.color }}></span>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{data.name}</span>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <span className="text-gray-900 dark:text-white font-medium w-3">{data.value}</span>
                            <span className="text-gray-500">({Math.round((data.value / (totalTasks || 1)) * 100)}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Task Workflow Pipeline */}
                <div className="xl:col-span-2 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 flex flex-col">
                  <h3 className="text-sm font-bold mb-8">Task Workflow</h3>
                  
                  <div className="flex-1 flex flex-col justify-center relative">
                    <div className="flex justify-between items-center w-full px-6 relative z-10">
                      
                      {/* Nodes */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                          <FileText size={20} className="text-blue-500" />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{tasksToDo}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">To Do</p>
                        </div>
                      </div>

                      <span className="text-blue-500">&rarr;</span>

                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                          <RefreshCcw size={20} className="text-yellow-500" />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{tasksInProgress}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">In Progress</p>
                        </div>
                      </div>

                      <span className="text-yellow-500">&rarr;</span>

                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                          <Shield size={20} className="text-purple-500" />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{tasksVerification}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Verification</p>
                        </div>
                      </div>

                      <span className="text-purple-500">&rarr;</span>

                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                          <CheckCircle2 size={20} className="text-emerald-500" />
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{tasksCompleted}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Completed</p>
                        </div>
                      </div>
                      
                      <span className="text-red-500 ml-4">&rarr;</span>
                      
                      <div className="flex flex-col items-center gap-3 ml-2">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
                          <XCircle size={16} className="text-red-500" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{tasksRejected}</p>
                          <p className="text-[9px] text-gray-500 dark:text-gray-400 font-medium">Rejected</p>
                        </div>
                      </div>

                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-between items-end border-t border-gray-200 dark:border-white/5 pt-4">
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Tasks in Verification will be moved to Completed or Rejected.</p>
                      <p className="text-[10px] text-gray-500">Rejected tasks can return to In Progress if the deadline has not passed.</p>
                    </div>
                    <button className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors font-medium">
                      View Workflow Guide
                    </button>
                  </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold">Upcoming Deadlines</h3>
                    <button className="text-[10px] text-primary hover:text-primary/80 font-medium transition-colors">View All</button>
                  </div>
                  <div className="flex flex-col gap-4 flex-1">
                    {upcomingDeadlines.length === 0 ? (
                      <p className="text-xs text-gray-500 italic mt-2">No upcoming deadlines</p>
                    ) : (
                      upcomingDeadlines.map((task, idx) => {
                        const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                        let tagText = `${daysLeft} days left`;
                        let tagColor = 'text-yellow-500';
                        if (daysLeft === 1) { tagText = 'Due Tomorrow'; tagColor = 'text-red-400'; }
                        else if (daysLeft < 0) { tagText = 'Overdue'; tagColor = 'text-red-500'; }
                        else if (daysLeft <= 3) { tagText = `Due in ${daysLeft} days`; tagColor = 'text-orange-400'; }
                        else { tagText = `Due in ${daysLeft} days`; tagColor = 'text-emerald-500'; }
                        
                        const iconColors = ['bg-blue-500/20 text-blue-500 border-blue-500/30', 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30', 'bg-blue-500/20 text-blue-500 border-blue-500/30', 'bg-blue-500/20 text-blue-500 border-blue-500/30'];

                        return (
                          <div key={task._id} className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg border ${iconColors[idx % 4]} flex items-center justify-center shrink-0`}>
                                {task.status === 'Completed' ? <Shield size={14}/> : <CalendarDays size={14} />}
                              </div>
                              <div>
                                <p className="text-[11px] font-semibold text-gray-200 truncate max-w-[150px]">{task.title}</p>
                                <p className="text-[9px] text-gray-500">{task.status.replace('_', ' ')}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-[10px] font-bold ${tagColor}`}>{tagText}</p>
                              <p className="text-[9px] text-gray-500">{new Date(task.dueDate).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* My Tasks Table */}
                <div className="xl:col-span-2 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold">My Tasks</h3>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#090D14] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 cursor-pointer">
                      <Settings size={12} className="text-gray-500 dark:text-gray-400" />
                      <span className="text-[10px] text-gray-700 dark:text-gray-300">All Priorities</span>
                      <ChevronDown size={12} className="text-gray-500 dark:text-gray-400 ml-1" />
                    </div>
                  </div>
                  
                  <div className="flex gap-6 text-[11px] font-medium text-gray-500 border-b border-gray-200 dark:border-white/5 mb-4">
                    {['All', 'To Do', 'In Progress', 'Verification', 'Completed', 'Rejected'].map(tab => {
                      const counts = {
                        'All': totalTasks, 'To Do': tasksToDo, 'In Progress': tasksInProgress,
                        'Verification': tasksVerification, 'Completed': tasksCompleted, 'Rejected': tasksRejected
                      };
                      return (
                        <div 
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`pb-3 cursor-pointer relative ${activeTab === tab ? 'text-gray-900 dark:text-white' : 'hover:text-gray-300'}`}
                        >
                          {tab} ({counts[tab]})
                          {activeTab === tab && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-primary rounded-t-full"></div>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-white/5 text-[9px] uppercase tracking-wider text-gray-500">
                          <th className="pb-3 font-semibold">Task</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Priority</th>
                          <th className="pb-3 font-semibold">Due Date</th>
                          <th className="pb-3 font-semibold">Assigned By</th>
                          <th className="pb-3 font-semibold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {filteredTasks.slice(0, 5).map((task) => {
                          let statusTag = { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'To Do', border: 'border-blue-500/20' };
                          if (task.status === 'In_Progress') statusTag = { bg: 'bg-blue-600/20', text: 'text-blue-400', label: 'In Progress', border: 'border-blue-500/20' };
                          if (task.status === 'Completed') statusTag = { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Verification', border: 'border-yellow-500/20' };
                          if (task.status === 'Verified') statusTag = { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Completed', border: 'border-emerald-500/20' };
                          if (task.status === 'Rejected') statusTag = { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Rejected (Deadline)', border: 'border-red-500/20' };

                          const priorityColors = {
                            High: 'bg-red-500/10 text-red-500 border border-red-500/20',
                            Medium: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
                            Low: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          };
                          
                          const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

                          return (
                            <tr key={task._id} className="border-b border-gray-200 dark:border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                              <td className="py-3">
                                <div>
                                  <p className="font-semibold text-gray-200 text-[11px]">{task.title}</p>
                                  <p className="text-[9px] text-gray-500">{task.department || 'Department'}</p>
                                </div>
                              </td>
                              <td className="py-3">
                                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${statusTag.bg} ${statusTag.text} ${statusTag.border} border`}>
                                  {statusTag.label}
                                </span>
                              </td>
                              <td className="py-3">
                                <span className={`text-[9px] font-bold px-3 py-1 rounded ${priorityColors[task.priority || 'Medium']}`}>
                                  {task.priority || 'Medium'}
                                </span>
                              </td>
                              <td className="py-3">
                                <div>
                                  <p className="text-[11px] text-gray-700 dark:text-gray-300">{new Date(task.dueDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</p>
                                  <p className={`text-[9px] font-medium ${daysLeft === 1 ? 'text-red-400' : daysLeft < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {daysLeft === 1 ? 'Tomorrow' : daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `In ${daysLeft} days`}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3">
                                <div>
                                  <p className="text-[11px] text-gray-700 dark:text-gray-300">{task.assignedBy?.firstName || 'Michael'} {task.assignedBy?.lastName || 'Scott'}</p>
                                  <p className="text-[9px] text-gray-500">{task.assignedBy?.role === 'Manager' ? 'Team Manager' : 'Team Manager'}</p>
                                </div>
                              </td>
                              <td className="py-3 text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 group">
                                  {task.status === 'Assigned' && (
                                    <button onClick={() => handleTaskAction(task._id, 'In_Progress')} className="hidden group-hover:block px-2 py-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded text-[9px] font-bold">Start</button>
                                  )}
                                  {task.status === 'In_Progress' && (
                                    <button onClick={() => handleTaskAction(task._id, 'Completed')} className="hidden group-hover:block px-2 py-1 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded text-[9px] font-bold">Submit</button>
                                  )}
                                  <button className="hover:text-gray-900 dark:hover:text-white transition-colors p-1"><Eye size={14}/></button>
                                  <button className="hover:text-gray-900 dark:hover:text-white transition-colors p-1 group-hover:hidden"><MoreHorizontal size={14}/></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-white/5 mt-auto">
                    <span className="text-[10px] text-gray-500">Showing 1 to {Math.min(5, filteredTasks.length)} of {filteredTasks.length} tasks</span>
                    <div className="flex items-center gap-1">
                      <button className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"><ChevronLeft size={12}/></button>
                      <button className="w-6 h-6 flex items-center justify-center rounded bg-primary/20 text-primary text-[10px] font-bold">1</button>
                      <button className="w-6 h-6 flex items-center justify-center rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 text-[10px]">2</button>
                      <button className="w-6 h-6 flex items-center justify-center rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 text-[10px]">3</button>
                      <button className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"><ChevronRight size={12}/></button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Leave Balance & Announcements */}
                <div className="flex flex-col gap-6">
                  
                  {/* Leave Balance */}
                  <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold">Leave Balance</h3>
                      <button onClick={() => setIsLeaveModalOpen(true)} className="text-[10px] bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1.5 rounded-lg font-medium transition-colors">Request Leave</button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-semibold mb-2">
                          <Plane size={12}/> Vacation Leave
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{vacationBal} <span className="text-[10px] text-gray-500 font-normal">days</span></h4>
                        <p className="text-[9px] text-emerald-600/80 font-medium mt-1">Available</p>
                      </div>
                      
                      <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-semibold mb-2">
                          <Pill size={12}/> Sick Leave
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{sickBal} <span className="text-[10px] text-gray-500 font-normal">days</span></h4>
                        <p className="text-[9px] text-red-600/80 font-medium mt-1">Available</p>
                      </div>

                      <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-blue-500 text-[10px] font-semibold mb-2">
                          <UserCircle size={12}/> Personal Leave
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{personalBal} <span className="text-[10px] text-gray-500 font-normal">days</span></h4>
                        <p className="text-[9px] text-blue-600/80 font-medium mt-1">Available</p>
                      </div>

                      <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-purple-500 text-[10px] font-semibold mb-2">
                          <Briefcase size={12}/> Comp Off
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{compOffBal} <span className="text-[10px] text-gray-500 font-normal">days</span></h4>
                        <p className="text-[9px] text-purple-600/80 font-medium mt-1">Available</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Announcements */}
                  <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-xl p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold">Recent Announcements</h3>
                      <button className="text-[10px] text-primary hover:text-primary/80 font-medium transition-colors">View All</button>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {announcements.length === 0 ? (
                        <p className="text-xs text-gray-500 italic mt-2">No recent announcements</p>
                      ) : (
                        announcements.slice(0, 3).map((ann, idx) => {
                          const iconColors = ['bg-primary/20 text-primary', 'bg-blue-500/20 text-blue-500', 'bg-yellow-500/20 text-yellow-500'];
                          const daysAgo = Math.floor((new Date() - new Date(ann.createdAt)) / (1000 * 60 * 60 * 24));
                          
                          return (
                            <div key={ann._id || idx} className="flex justify-between items-start">
                              <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-lg ${iconColors[idx % 3]} flex items-center justify-center shrink-0`}>
                                  <Bell size={14}/>
                                </div>
                                <div>
                                  <p className="text-[11px] font-semibold text-gray-200">{ann.title}</p>
                                  <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">{ann.content}</p>
                                </div>
                              </div>
                              <span className="text-[9px] text-gray-500 shrink-0 ml-2">
                                {daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </>
            )
          ) : activeView === 'Leave Requests' ? (
            <LeaveManagementView
              leaves={leaves}
              loading={loading}
              role={currentUser?.role || 'Employee'}
              onAddClick={() => setIsLeaveModalOpen(true)}
            />
          ) : activeView === 'My Tasks' ? (
            <TaskManagementView
              tasks={tasks}
              loading={loading}
              role={currentUser?.role || 'Employee'}
              onTaskAction={handleTaskAction}
            />
          ) : activeView === 'Attendance' ? (
            <AttendanceView
              users={[currentUser]}
              loading={loading}
              role={currentUser?.role || 'Employee'}
            />
          ) : activeView === 'Announcements' || activeView === 'Notifications' ? (
            <AnnouncementsView role={currentUser?.role || 'Employee'} />
          ) : activeView === 'My Documents' ? (
            <DocumentsView role={currentUser?.role || 'Employee'} />
          ) : activeView === 'My Profile' ? (
            <SettingsView user={currentUser} />
          ) : activeView === 'Payslip' ? (
            <PayrollView
              users={[currentUser]}
              loading={loading}
              role={currentUser?.role || 'Employee'}
            />
          ) : activeView === 'Settings' ? (
            <SettingsView user={currentUser} />
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
      <LeaveFormModal 
        isOpen={isLeaveModalOpen} 
        onClose={() => setIsLeaveModalOpen(false)} 
        onSuccess={fetchTasksAndLeaves}
      />
    </div>
  );
};

export default EmployeeDashboard;