import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from './utils';

const BASE = import.meta.env.BASE_URL;

const Navbar = ({ onLoginClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = ['Features', 'Solutions', 'Pricing', 'About'];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-4 font-sans">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative w-full max-w-6xl rounded-2xl transition-all duration-500 ease-out",
          "border border-white/[0.08]",
          "backdrop-blur-xl",
          isScrolled
            ? "bg-[#0a0f1e]/80 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(124,92,255,0.1)] py-3 px-6"
            : "bg-white/[0.03] shadow-[0_4px_24px_rgba(0,0,0,0.2)] py-4 px-8"
        )}
      >
        {/* Subtle gradient border glow on scroll */}
        <div className={cn(
          "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 pointer-events-none",
          "bg-gradient-to-r from-primary/20 via-transparent to-brand-purple/20",
          isScrolled && "opacity-100"
        )} />

        <div className="relative z-10 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative">
              <img
                src={`${BASE}ems_logo.png`}
                alt="EMS-master Logo"
                className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-heading font-bold text-white tracking-tight leading-none">
                EMS-master
              </span>
              <span className="text-[9px] text-gray-500 tracking-widest uppercase leading-none mt-0.5 hidden sm:block">
                Employee Management System
              </span>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(link.toLowerCase());
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="relative px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-all duration-200 rounded-xl hover:bg-white/[0.06] group"
              >
                {link}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-primary to-brand-purple rounded-full group-hover:w-4 transition-all duration-300" />
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onLoginClick}
              className="group relative inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_rgba(124,92,255,0.4)]"
            >
              {/* Button gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-brand-purple rounded-xl" />
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              <span className="relative z-10">Book a Demo</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-white/[0.08] flex flex-col gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link}
                    onClick={() => {
                      const element = document.getElementById(link.toLowerCase());
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left text-gray-400 hover:text-white text-base font-medium px-4 py-3 rounded-xl hover:bg-white/[0.06] transition-all"
                  >
                    {link}
                  </button>
                ))}
                <div className="pt-3 mt-2 border-t border-white/[0.08]">
                  <button
                    onClick={() => {
                      onLoginClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-primary to-brand-purple text-white rounded-xl font-semibold text-sm"
                  >
                    Book a Demo
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
};

export default Navbar;
