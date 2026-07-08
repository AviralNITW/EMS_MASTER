import React from 'react';
import { Twitter, Linkedin, Github, ExternalLink } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] bg-[#030712] pt-16 pb-8">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">

          {/* Brand column */}
          <div className="col-span-2 flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <img src={`${BASE}ems_logo.png`} alt="EMS-master Logo" className="w-8 h-8 object-contain" />
              <div>
                <span className="text-base font-heading font-bold text-white tracking-tight block">EMS-master</span>
                <span className="text-[10px] text-gray-500 tracking-widest uppercase">Employee Management System</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              The modern, all-in-one workforce management platform designed to scale with your growing team.
            </p>
            {/* Integrations badge strip */}
            <div className="flex flex-wrap gap-2">
              {['Razorpay', 'Stripe', 'Twilio', 'Slack', 'Google SSO'].map((badge) => (
                <span key={badge} className="text-[10px] text-gray-500 px-2.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.03]">
                  {badge}
                </span>
              ))}
            </div>
            <div className="flex gap-4 mt-1">
              <a href="/" className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all">
                <Twitter size={16} />
              </a>
              <a href="/" className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all">
                <Linkedin size={16} />
              </a>
              <a href="https://github.com/AviralNaithani" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all">
                <Github size={16} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-semibold text-sm mb-1">Product</h4>
            {[
              { label: 'Features', id: 'features' },
              { label: 'Solutions', id: 'solutions' },
              { label: 'Pricing', id: 'pricing' },
              { label: 'Resources', id: 'resources' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => item.id ? scrollTo(item.id) : window.scrollTo(0,0)}
                className="text-left text-gray-400 hover:text-white text-sm transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Company */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-semibold text-sm mb-1">Company</h4>
            {[
              { label: 'About Us', id: 'about' },
              { label: 'Careers', id: null },
              { label: 'Blog', id: null },
              { label: 'Contact', id: null },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => item.id ? scrollTo(item.id) : window.scrollTo(0,0)}
                className="text-left text-gray-400 hover:text-white text-sm transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Legal & Trust */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-semibold text-sm mb-1">Legal & Trust</h4>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map((item) => (
              <a key={item} href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Compliance badges */}
        <div className="flex flex-wrap gap-3 mb-8">
          {['SOC2 Compliant', 'GDPR Ready', 'ISO 27001', '99.9% SLA', 'End-to-End Encrypted'].map((badge) => (
            <div key={badge} className="flex items-center gap-1.5 text-[11px] text-gray-500 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              {badge}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} EMS-master. All rights reserved. Built with ❤️ for enterprise teams.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-gray-500 text-sm">All systems operational</span>
            </div>
            <a
              href="#"
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Status Page <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
