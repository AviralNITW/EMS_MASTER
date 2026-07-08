import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Lock, Activity, Search, Bell, MoreVertical } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from './utils';
import Wave3D from './Wave3D';

const BASE = import.meta.env.BASE_URL;

const areaData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 1842 },
  { name: 'Jun', value: 1600 },
  { name: 'Jul', value: 2000 },
];

const pieData = [
  { name: 'Engineering', value: 42, color: '#5B8CFF' },
  { name: 'Marketing', value: 18, color: '#A855F7' },
  { name: 'HR', value: 15, color: '#FF7C5C' },
  { name: 'Sales', value: 15, color: '#34D399' },
  { name: 'Others', value: 10, color: '#9CA3AF' },
];

const HeroSection = ({ onGetStartedClick }) => {
  return (
    <section id="home" className="relative min-h-screen pt-32 pb-32 overflow-hidden flex items-center">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-brand-purple/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-8"
          >
            <h1 className="text-5xl lg:text-7xl font-heading font-extrabold leading-[1.1] tracking-tight text-white">
              Modernize Your <br />
              Workforce <br />
              <span className="text-gradient">Management</span>
            </h1>
            
            <p className="text-lg text-gray-400 max-w-lg leading-relaxed font-sans">
              EMS-master is an all-in-one platform to streamline HR operations, automate workflows, and unlock the true potential of your people.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={onGetStartedClick}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-primary rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(124,92,255,0.4)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-brand-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <button 
                onClick={() => {
                  const el = document.getElementById('features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 rounded-full text-base font-medium text-white border border-white/10 hover:bg-white/5 transition-colors"
              >
                Explore Features
              </button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-300">
                <ShieldCheck size={16} className="text-green-400" /> SOC2 Ready
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-300">
                <Lock size={16} className="text-blue-400" /> Enterprise Secure
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-300">
                <Activity size={16} className="text-brand-purple" /> 99.9% Uptime
              </div>
            </div>
          </motion.div>

          {/* Right Column - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative lg:h-[600px] w-full"
          >
            <div className="glass-card w-full h-full p-1 overflow-hidden flex flex-col premium-shadow animate-float">
              
              {/* Dashboard Topbar */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Search anything..." 
                      className="bg-black/20 border border-white/5 rounded-full pl-9 pr-4 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-white/20 w-48"
                      disabled
                    />
                  </div>
                  <Bell size={16} className="text-gray-400" />
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 border border-white/20" />
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="flex flex-1 overflow-hidden">
                
                {/* Sidebar */}
                <div className="w-48 border-r border-white/10 p-4 flex flex-col gap-6 hidden sm:flex">
                  <div className="flex items-center gap-2">
                    <img src={`${BASE}ems_logo.png`} alt="EMS-master Logo" className="w-6 h-6 object-contain" />
                    <span className="text-sm font-semibold text-white">EMS-master</span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="px-3 py-2 rounded-lg bg-primary/20 text-primary text-xs font-medium flex items-center gap-2">
                      <Activity size={14} /> Dashboard
                    </div>
                    {['Employees', 'Departments', 'Tasks', 'Leaves', 'Payroll'].map(item => (
                      <div key={item} className="px-3 py-2 rounded-lg text-gray-500 text-xs font-medium hover:text-gray-300 cursor-default flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-600" /> {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Area */}
                <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
                  <div>
                    <h2 className="text-xl font-heading font-bold text-white mb-1">Welcome back, Admin! 👋</h2>
                    <p className="text-xs text-gray-500">Here's what's happening in your organization today.</p>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Employees', value: '2,543', trend: '+12.5%', color: 'text-green-400' },
                      { label: 'Active Tasks', value: '1,286', trend: '+8.2%', color: 'text-green-400' },
                      { label: 'Pending Approvals', value: '48', trend: '-5.4%', color: 'text-red-400' },
                      { label: 'Attrition Rate', value: '8.4%', trend: '+1.2%', color: 'text-yellow-400' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-gray-400 text-[10px] uppercase font-semibold mb-1">{stat.label}</p>
                        <p className="text-2xl font-heading font-bold text-white mb-1">{stat.value}</p>
                        <p className={cn("text-[10px] font-medium", stat.color)}>{stat.trend} from last month</p>
                      </div>
                    ))}
                  </div>

                  {/* Charts */}
                  <div className="grid lg:grid-cols-3 gap-4">
                    <div className="col-span-2 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-semibold text-white">Employee Growth</h3>
                        <span className="text-[10px] text-gray-500">This Year v</span>
                      </div>
                      <div className="h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={areaData}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7C5CFF" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#7C5CFF" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke="#7C5CFF" fillOpacity={1} fill="url(#colorValue)" />
                            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
                      <h3 className="text-xs font-semibold text-white mb-2">Department Distribution</h3>
                      <div className="flex-1 flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={45}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-sm font-bold text-white">2,543</span>
                          <span className="text-[8px] text-gray-500">Total</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Table */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                     <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-semibold text-white">Recent Activities</h3>
                        <span className="text-[10px] text-primary cursor-pointer hover:underline">View All</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {[
                          { user: 'John Doe', action: 'Updated employee profile', module: 'Employees', time: '2 min ago' },
                          { user: 'Sarah Wilson', action: 'Approved leave request', module: 'Leaves', time: '15 min ago' },
                          { user: 'Mike Johnson', action: 'Assigned new task', module: 'Tasks', time: '1 hr ago' },
                        ].map((act, i) => (
                          <div key={i} className="grid grid-cols-4 items-center p-2 rounded-lg hover:bg-white/5 transition-colors text-[10px]">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-gray-700" />
                              <span className="text-white font-medium">{act.user}</span>
                            </div>
                            <span className="text-gray-400">{act.action}</span>
                            <span className="text-gray-400">{act.module}</span>
                            <span className="text-gray-500 text-right">{act.time}</span>
                          </div>
                        ))}
                      </div>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3D Flowing Wave — canvas based */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Wave3D />
      </div>
    </section>
  );
};

export default HeroSection;
