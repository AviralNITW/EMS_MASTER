import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Zap, HeadphonesIcon } from 'lucide-react';
import { cn } from './utils';

const stats = [
  { icon: Building2, value: '4', label: 'User Roles Supported', color: 'text-brand-purple' },
  { icon: Users, value: '30+', label: 'HR Features Included', color: 'text-primary' },
  { icon: Zap, value: '100%', label: 'Secure Data Handling', color: 'text-secondary' },
  { icon: HeadphonesIcon, value: '24/7', label: 'System Availability', color: 'text-blue-400' },
];

const Statistics = () => {
  return (
    <section className="py-12 relative z-10 border-y border-white/5 bg-white/[0.01]">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <stat.icon className={stat.color} size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-heading font-bold text-white">{stat.value}</span>
                <span className="text-xs md:text-sm text-gray-500">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
