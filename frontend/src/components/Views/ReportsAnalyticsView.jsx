import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { Download, FileText } from 'lucide-react';
import SkeletonLoader from '../UI/SkeletonLoader';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];
const PIE_COLORS = { Approved: '#10b981', Pending: '#f59e0b', Rejected: '#ef4444' };

const ReportsAnalyticsView = ({ users, tasks, leaves, loading, role }) => {
  // Department Distribution Data
  const deptCount = users.reduce((acc, user) => {
    if (user.department) {
      acc[user.department] = (acc[user.department] || 0) + 1;
    }
    return acc;
  }, {});
  
  const deptData = Object.entries(deptCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Leave Status Data
  const leaveStats = leaves.reduce((acc, leave) => {
    const status = leave.status === 'Manager_Approved' || leave.status === 'HR_Approved' ? 'Approved' : leave.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { Approved: 0, Pending: 0, Rejected: 0 });

  const pieData = Object.entries(leaveStats).map(([name, value]) => ({ name, value }));

  // Mock Performance Data
  const performanceData = [
    { month: 'Jan', performance: 65, avg: 60 },
    { month: 'Feb', performance: 75, avg: 62 },
    { month: 'Mar', performance: 85, avg: 65 },
    { month: 'Apr', performance: 80, avg: 68 },
    { month: 'May', performance: 90, avg: 70 },
    { month: 'Jun', performance: 95, avg: 72 },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Deep dive into company metrics, performance, and resources.</p>
        </div>
        
        <button 
          className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Download size={16} /> Export Report
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
        {loading ? (
          <SkeletonLoader type="chart" count={2} />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Distribution */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-xl">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Workforce by Department</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ fill: '#ffffff05' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {deptData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Leave Status Overview */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-xl flex flex-col">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Leave Requests Overview</h3>
                <div className="flex-1 flex items-center justify-center">
                  <div className="h-[250px] w-full max-w-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Trend */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-white/5 p-6 shadow-xl">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Company Performance Trend</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="performance" name="Performance Score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPerf)" />
                    <Area type="monotone" dataKey="avg" name="Industry Average" stroke="#ec4899" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorAvg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsAnalyticsView;
