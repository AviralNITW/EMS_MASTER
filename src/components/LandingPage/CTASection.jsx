import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, ArrowRight } from 'lucide-react';

const CTASection = ({ onLoginClick }) => {
  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-[32px] p-12 md:p-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-br from-[#111827] to-[#0A101C] border border-white/10 premium-shadow"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
          
          <div className="relative z-10 flex items-center gap-6 md:gap-8 flex-col md:flex-row">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-brand-purple p-0.5 flex-shrink-0">
              <div className="w-full h-full bg-[#111827] rounded-[15px] flex items-center justify-center">
                <Rocket size={32} className="text-white" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
                Ready to Transform Your <br className="hidden md:block" />
                Workforce Management?
              </h2>
              <p className="text-gray-400 text-sm md:text-base">
                Join growing teams that trust EMS-master to manage their most valuable asset – their people.
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col gap-3 min-w-[200px]">
            <button 
              onClick={onLoginClick}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-primary rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-brand-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button 
              onClick={onLoginClick}
              className="px-8 py-4 rounded-full text-base font-medium text-white border border-white/10 hover:bg-white/5 transition-colors w-full"
            >
              Book a Demo
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              No credit card required • 14-day free trial
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
