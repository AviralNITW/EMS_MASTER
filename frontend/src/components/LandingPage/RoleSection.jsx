import React from 'react';
import { motion } from 'framer-motion';

const BASE = import.meta.env.BASE_URL;

const roles = [
  {
    title: 'HR Professionals',
    description: 'Automate HR processes, manage employee data, and streamline workflows.',
    image: `${BASE}hr.png`,
    widget: { label: 'Leave Request', value: 'John Doe', sub: 'Annual Leave · 3 days' },
    glow: 'rgba(91,140,255,0.15)',
  },
  {
    title: 'Managers',
    description: 'Assign tasks, track progress, review submissions, and manage your team effectively.',
    image: `${BASE}manager.png`,
    widget: { label: 'Team Progress', value: '85%', sub: '+12% this week' },
    glow: 'rgba(124,92,255,0.15)',
  },
  {
    title: 'Employees',
    description: 'View tasks, submit documents, manage profile, and stay productive.',
    image: `${BASE}employee.png`,
    widget: { label: 'My Tasks', value: '5', sub: 'Pending Tasks' },
    glow: 'rgba(91,140,255,0.15)',
  },
  {
    title: 'Enterprise Admins',
    description: 'Manage users, roles, permissions, and ensure system security and compliance.',
    image: `${BASE}admin.png`,
    widget: { label: 'System Health', value: '99.9%', sub: 'All Systems Operational' },
    glow: 'rgba(124,92,255,0.15)',
  },
];

const RoleSection = () => {
  return (
    <section id="solutions" className="py-24 relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-14">
          <p className="text-secondary font-semibold text-xs uppercase tracking-widest mb-2">Built For Everyone</p>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white">
            Perfect for Every Role in{' '}
            <span className="text-gradient">Your Organization</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map((role, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: 'linear-gradient(145deg, #111827 0%, #0d1220 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              whileHover={{
                borderColor: 'rgba(124,92,255,0.4)',
                boxShadow: `0 0 32px ${role.glow}, inset 0 0 32px rgba(124,92,255,0.04)`,
              }}
            >
              {/* Top glow on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(124,92,255,0.6), transparent)' }}
              />

              {/* Text Content */}
              <div className="p-5 pb-3 flex-shrink-0">
                <h3 className="text-base font-heading font-bold text-white mb-1.5">{role.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">{role.description}</p>

                {/* Mini Widget */}
                <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3">
                  <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider mb-1">{role.widget.label}</p>
                  <p className="text-xl font-heading font-bold text-white leading-none mb-1">{role.widget.value}</p>
                  <p className="text-[9px] text-primary font-medium">{role.widget.sub}</p>
                </div>
              </div>

              {/* Person Image — cropped at bottom */}
              <div className="relative flex-1 min-h-[180px] overflow-hidden">
                {/* Shadow floor */}
                <div className="absolute bottom-0 left-0 right-0 h-16 z-10"
                  style={{ background: 'linear-gradient(to top, #0d1220 0%, transparent 100%)' }}
                />
                <img
                  src={role.image}
                  alt={role.title}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[200px] w-auto object-contain object-bottom group-hover:scale-105 transition-transform duration-500 z-0"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleSection;
