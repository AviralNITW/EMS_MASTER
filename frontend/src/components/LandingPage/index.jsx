import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesBento from './FeaturesBento';
import Statistics from './Statistics';
import RoleSection from './RoleSection';
import PricingSection from './PricingSection';
import AboutSection from './AboutSection';
import CTASection from './CTASection';
import Footer from './Footer';

import AuthWrapper from '../Auth/AuthWrapper';

const LandingPage = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="dark-theme-page min-h-screen bg-[#050816] selection:bg-primary/30 selection:text-white overflow-hidden font-sans">
      <Navbar onLoginClick={() => setShowLoginModal(true)} />

      <main>
        <HeroSection onGetStartedClick={() => setShowLoginModal(true)} />
        <FeaturesBento />
        <Statistics />
        <RoleSection />
        <PricingSection onSelectPlan={(plan) => setShowLoginModal(true)} />
        <AboutSection />
        <CTASection onLoginClick={() => setShowLoginModal(true)} />
      </main>

      <Footer />

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-md"
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute -top-12 right-0 text-gray-400 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>

              <div className="bg-[#111827] rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative">
                <AuthWrapper onAuthSuccess={(userType, data) => {
                  if (onAuthSuccess) {
                    onAuthSuccess(userType, data);
                  }
                  setShowLoginModal(false);
                  navigate('/dashboard');
                }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
