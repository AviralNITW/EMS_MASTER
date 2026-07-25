import React from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, Shield, MessageSquare, Smartphone, Lock, Globe,
  Bell, Mail, FileText, Webhook, Cloud, Database,
  ArrowRight
} from 'lucide-react';
import { cn } from './utils';

const integrations = [
  {
    category: 'Payment Gateway',
    icon: CreditCard,
    color: 'from-blue-500 to-cyan-400',
    glow: 'rgba(59,130,246,0.3)',
    items: [
      { name: 'Razorpay', desc: 'UPI, Cards, Netbanking for Indian payments', logo: '₹' },
      { name: 'Stripe', desc: 'Global payments, invoicing & subscriptions', logo: '$' },
      { name: 'PayPal', desc: 'International payment processing', logo: 'P' },
    ]
  },
  {
    category: 'Authentication & SSO',
    icon: Lock,
    color: 'from-emerald-500 to-teal-400',
    glow: 'rgba(16,185,129,0.3)',
    items: [
      { name: 'Google OAuth 2.0', desc: 'One-click sign-in with Google workspace', logo: 'G' },
      { name: 'Microsoft Azure AD', desc: 'Enterprise SSO for Office 365 users', logo: 'M' },
      { name: 'SAML / LDAP', desc: 'Custom enterprise identity provider support', logo: 'S' },
    ]
  },
  {
    category: 'OTP & Verification',
    icon: Smartphone,
    color: 'from-violet-500 to-purple-400',
    glow: 'rgba(139,92,246,0.3)',
    items: [
      { name: 'Twilio', desc: 'SMS, WhatsApp OTP & voice verification', logo: 'T' },
      { name: 'MSG91', desc: 'India-optimized OTP & transactional SMS', logo: 'M' },
      { name: 'Firebase Auth', desc: 'Phone number auth with auto-verify', logo: 'F' },
    ]
  },
  {
    category: 'Messaging & Notifications',
    icon: MessageSquare,
    color: 'from-orange-500 to-amber-400',
    glow: 'rgba(249,115,22,0.3)',
    items: [
      { name: 'SendGrid', desc: 'Transactional emails & HR notifications', logo: 'S' },
      { name: 'Slack', desc: 'Team alerts for approvals & task updates', logo: '#' },
      { name: 'Microsoft Teams', desc: 'Enterprise messaging & bot integrations', logo: 'T' },
    ]
  },
  {
    category: 'Security & Compliance',
    icon: Shield,
    color: 'from-red-500 to-rose-400',
    glow: 'rgba(239,68,68,0.3)',
    items: [
      { name: 'JWT + Bcrypt', desc: 'Industry-standard token auth & hashing', logo: '🔑' },
      { name: 'Helmet.js + CORS', desc: 'HTTP security headers & origin control', logo: '🛡️' },
      { name: 'Rate Limiter', desc: 'DDoS protection & brute-force prevention', logo: '⚡' },
    ]
  },
  {
    category: 'Cloud & Storage',
    icon: Cloud,
    color: 'from-cyan-500 to-blue-400',
    glow: 'rgba(6,182,212,0.3)',
    items: [
      { name: 'AWS S3', desc: 'Document & profile image storage', logo: 'S3' },
      { name: 'Cloudinary', desc: 'Image optimization & CDN delivery', logo: 'C' },
      { name: 'MongoDB Atlas', desc: 'Managed database with auto-scaling', logo: 'M' },
    ]
  },
];

const resources = [
  {
    icon: FileText,
    title: 'API Documentation',
    description: 'Complete REST API reference with code examples in cURL, Node.js, and Python.',
    link: '#',
    color: 'text-blue-400',
  },
  {
    icon: Globe,
    title: 'Developer Portal',
    description: 'SDKs, webhooks, and sandbox environment for building custom integrations.',
    link: '#',
    color: 'text-emerald-400',
  },
  {
    icon: Bell,
    title: 'Changelog',
    description: 'Stay updated with the latest features, improvements, and bug fixes.',
    link: '#',
    color: 'text-amber-400',
  },
  {
    icon: Mail,
    title: 'Help Center',
    description: 'Guides, FAQs, and video tutorials to get the most out of EMS-master.',
    link: '#',
    color: 'text-purple-400',
  },
  {
    icon: Webhook,
    title: 'Webhook Events',
    description: 'Real-time event notifications for employee actions, approvals, and system events.',
    link: '#',
    color: 'text-rose-400',
  },
  {
    icon: Database,
    title: 'Status Page',
    description: 'Real-time system health, uptime monitoring, and incident history.',
    link: '#',
    color: 'text-cyan-400',
  },
];

const ResourcesSection = () => {
  return (
    <section id="resources" className="py-24 relative z-10">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-2">
            Industry-Standard Integrations
          </p>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            Built for Production, <br className="hidden md:block" />
            Ready for Enterprise
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Powered by the same third-party services used by Stripe, Razorpay, Slack, and Fortune 500 companies.
          </p>
        </div>

        {/* Integration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {integrations.map((group, i) => {
            const Icon = group.icon;
            return (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/80 p-6 hover:border-white/20 transition-all duration-300 relative overflow-hidden"
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(300px circle at 50% 0%, ${group.glow}, transparent 70%)`,
                  }}
                />

                <div className="relative z-10">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", group.color)}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-heading font-bold text-white">{group.category}</h3>
                  </div>

                  {/* Items */}
                  <div className="flex flex-col gap-3">
                    {group.items.map((item, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg bg-white/[0.08] flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {item.logo}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-500 leading-snug">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Resources Section */}
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
            Developer Resources
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
            Everything You Need to Build & Integrate
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((res, i) => {
            const Icon = res.icon;
            return (
              <motion.a
                key={res.title}
                href={res.link}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group flex items-start gap-4 p-5 rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/60 hover:border-white/20 hover:bg-[#0d1225] transition-all duration-300"
              >
                <div className={cn("mt-1 shrink-0", res.color)}>
                  <Icon size={22} />
                </div>
                <div>
                  <h4 className="text-base font-heading font-bold text-white mb-1 flex items-center gap-2">
                    {res.title}
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-gray-400" />
                  </h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{res.description}</p>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
