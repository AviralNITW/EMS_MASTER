import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, Lock, BarChart2, FileSpreadsheet } from 'lucide-react';
import { cn } from './utils';

const BentoCard = ({ title, description, icon: Icon, children, className }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={cn(
      "glass-card p-6 flex flex-col gap-4 relative overflow-hidden group border border-white/5 bg-white/[0.02]",
      className
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-brand-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="flex items-start justify-between relative z-10">
      <div className="flex flex-col gap-2">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <Icon className="text-white" size={20} />
        </div>
        <h3 className="text-lg font-heading font-bold text-white mt-2">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed max-w-sm">{description}</p>
      </div>
    </div>
    
    <div className="flex-1 relative z-10 mt-4">
      {children}
    </div>
  </motion.div>
);

const FeaturesBento = () => {
  return (
    <section id="features" className="py-24 relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Powerful Features</p>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white">
            Everything You Need to Manage <br className="hidden md:block" />
            Your Workforce Efficiently
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          
          {/* RBAC */}
          <BentoCard 
            title="Role-Based Access Control"
            description="Granular permissions and dashboards tailored for Admins, HR, Managers, and Employees."
            icon={Shield}
            className="md:col-span-1 md:row-span-2"
          >
            <div className="flex flex-col gap-3 mt-4 h-full bg-black/20 rounded-xl p-4 border border-white/5">
              {[
                { r: 'Admin', d: 'Full Access', c: 'bg-blue-500' },
                { r: 'HR Manager', d: 'Manage HR Operations', c: 'bg-purple-500' },
                { r: 'Team Manager', d: 'Manage Team', c: 'bg-green-500' },
                { r: 'Employee', d: 'Views Only', c: 'bg-gray-500' }
              ].map(role => (
                <div key={role.r} className="flex items-center gap-3">
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", role.c)}>
                    <div className="w-3 h-3 bg-white/30 rounded-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-medium">{role.r}</span>
                    <span className="text-gray-500 text-[10px]">{role.d}</span>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Workflow Automation */}
          <BentoCard 
            title="Task & Workflow Automation"
            description="Assign tasks, track progress, review submissions, and automate approval workflows seamlessly."
            icon={CheckCircle}
            className="md:col-span-2 bg-gradient-to-br from-[#111827] to-[#0A101C]"
          >
            <div className="flex items-center justify-center h-full pt-4">
              <div className="flex items-center gap-2 text-xs">
                <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" /> Assigned
                </div>
                <div className="h-[1px] w-8 bg-white/20" />
                <div className="px-4 py-2 rounded-full bg-primary/20 border border-primary/50 text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-blue" /> In Progress
                </div>
                <div className="h-[1px] w-8 bg-white/20" />
                <div className="px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" /> Submitted
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Audit Logs */}
          <BentoCard 
            title="Enterprise Compliance & Audit Logs"
            description="Track every action with detailed audit logs. Ensure compliance and maintain transparency."
            icon={Lock}
            className="md:col-span-2"
          >
             <div className="flex flex-col gap-2 mt-4">
              {[
                { title: 'User Login', desc: 'Admin logged in', time: '2 min ago', icon: '👤' },
                { title: 'Data Export', desc: 'Employee data exported', time: '15 min ago', icon: '📄' },
                { title: 'Role Updated', desc: 'HR role permissions updated', time: '1 hr ago', icon: '🛡️' }
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm">{log.icon}</div>
                    <div className="flex flex-col">
                      <span className="text-white text-xs font-medium">{log.title}</span>
                      <span className="text-gray-500 text-[10px]">{log.desc}</span>
                    </div>
                  </div>
                  <span className="text-gray-500 text-[10px]">{log.time}</span>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Analytics */}
          <BentoCard 
            title="Advanced Analytics Dashboard"
            description="Real-time insights and customizable reports to track performance, productivity, and key HR metrics."
            icon={BarChart2}
            className="md:col-span-1"
          >
             <div className="flex items-end justify-center gap-2 h-24 mt-4 opacity-50 hover:opacity-100 transition-opacity">
               {[40, 70, 45, 90, 65, 30].map((h, i) => (
                 <div key={i} className="w-8 rounded-t-sm bg-gradient-to-t from-primary/20 to-brand-purple" style={{ height: `${h}%` }} />
               ))}
             </div>
          </BentoCard>

          {/* Onboarding */}
          <BentoCard 
            title="Frictionless Onboarding"
            description="Bulk import/export employee data using CSV/Excel. Onboard your entire team in just a few clicks."
            icon={FileSpreadsheet}
            className="md:col-span-2"
          >
            <div className="flex items-center justify-center gap-8 h-full mt-4">
              <div className="w-16 h-16 rounded-xl bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-400 text-2xl font-bold">
                X
              </div>
              <div className="flex items-center text-gray-500">
                 → 
              </div>
              <div className="w-16 h-16 rounded-xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
            </div>
          </BentoCard>

        </div>
      </div>
    </section>
  );
};

export default FeaturesBento;
