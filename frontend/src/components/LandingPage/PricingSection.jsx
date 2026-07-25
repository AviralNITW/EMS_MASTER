import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Building2, Rocket, Crown } from 'lucide-react';
import { cn } from './utils';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { toast } from 'react-toastify';

const plans = [
  {
    name: 'Starter',
    icon: Zap,
    price: { monthly: 0, annually: 0 },
    description: 'Perfect for small teams getting started with employee management.',
    badge: null,
    color: 'from-gray-500 to-gray-600',
    features: [
      { text: 'Up to 10 employees', included: true },
      { text: 'Basic attendance tracking', included: true },
      { text: 'Leave management', included: true },
      { text: 'Email support', included: true },
      { text: 'Basic reports', included: true },
      { text: 'Role-based access (2 roles)', included: true },
      { text: 'API access', included: false },
      { text: 'Custom integrations', included: false },
      { text: 'Audit logs', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started Free',
    ctaStyle: 'border border-white/10 hover:bg-white/5 text-white',
  },
  {
    name: 'Professional',
    icon: Building2,
    price: { monthly: 499, annually: 399 },
    description: 'For growing teams that need automation and deeper insights.',
    badge: 'Most Popular',
    color: 'from-primary to-brand-purple',
    features: [
      { text: 'Up to 100 employees', included: true },
      { text: 'Advanced attendance & GPS tracking', included: true },
      { text: 'Leave & payroll management', included: true },
      { text: 'Priority email & chat support', included: true },
      { text: 'Advanced analytics dashboard', included: true },
      { text: 'Role-based access (5 roles)', included: true },
      { text: 'REST API access', included: true },
      { text: 'Slack & Teams integration', included: true },
      { text: 'Audit logs (30 days)', included: true },
      { text: 'SSO with Google/Microsoft', included: false },
    ],
    cta: 'Start 14-Day Free Trial',
    ctaStyle: 'bg-gradient-to-r from-primary to-brand-purple text-white hover:shadow-[0_0_30px_rgba(124,92,255,0.4)]',
  },
  {
    name: 'Business',
    icon: Rocket,
    price: { monthly: 999, annually: 799 },
    description: 'For mid-size companies needing compliance and full integration.',
    badge: 'Best Value',
    color: 'from-secondary to-emerald-500',
    features: [
      { text: 'Up to 500 employees', included: true },
      { text: 'Everything in Professional', included: true },
      { text: 'Payroll with tax automation', included: true },
      { text: '24/7 priority support', included: true },
      { text: 'Custom report builder', included: true },
      { text: 'Unlimited custom roles', included: true },
      { text: 'Full API + Webhooks', included: true },
      { text: 'Razorpay/Stripe payment gateway', included: true },
      { text: 'Audit logs (1 year)', included: true },
      { text: 'SSO with Google/Microsoft/SAML', included: true },
    ],
    cta: 'Start Free Trial',
    ctaStyle: 'bg-gradient-to-r from-secondary to-emerald-500 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]',
  },
  {
    name: 'Enterprise',
    icon: Crown,
    price: { monthly: null, annually: null },
    description: 'For large organizations with custom compliance and deployment needs.',
    badge: null,
    color: 'from-amber-400 to-orange-500',
    features: [
      { text: 'Unlimited employees', included: true },
      { text: 'Everything in Business', included: true },
      { text: 'On-premise / private cloud deploy', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'White-label branding', included: true },
      { text: 'Custom SLA & uptime guarantees', included: true },
      { text: 'Advanced security (SOC2, GDPR)', included: true },
      { text: 'Custom integration development', included: true },
      { text: 'Unlimited audit log retention', included: true },
      { text: 'OTP/2FA + Twilio/MSG91 integration', included: true },
    ],
    cta: 'Contact Sales',
    ctaStyle: 'border border-amber-400/30 hover:bg-amber-400/10 text-amber-400',
  },
];

const PricingSection = ({ onSelectPlan }) => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleCtaClick = (plan) => {
    if (plan.name === 'Starter') {
      if (onSelectPlan) onSelectPlan('Starter');
      return;
    }

    if (plan.name === 'Enterprise') {
      toast.info('📩 Thank you for your interest! Please contact us at sales@ems-master.com to set up a custom deployment.', {
        position: 'bottom-right'
      });
      return;
    }

    const amount = isAnnual ? plan.price.annually : plan.price.monthly;
    
    openRazorpayCheckout({
      amount: amount,
      planName: plan.name,
      onPaymentSuccess: handlePaymentSuccess
    });
  };

  const handlePaymentSuccess = (res) => {
    toast.success(`🎉 Payment Successful! ID: ${res.paymentId}. Directing to sign up.`, {
      position: 'bottom-right'
    });
    if (onSelectPlan) onSelectPlan(res.planName);
  };

  return (
    <section id="pricing" className="py-24 relative z-10">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />



      <div className="container mx-auto px-6 max-w-7xl relative">
        <div className="text-center mb-12">
          <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-2">
            Simple & Transparent
          </p>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            Plans That Scale With You
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Start free, upgrade as your team grows. No hidden fees, no surprises.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={cn("text-sm font-medium transition-colors", !isAnnual ? "text-white" : "text-gray-500")}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 bg-white/10 rounded-full p-1 border border-white/10 transition-colors hover:bg-white/15"
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={cn(
                  "w-5 h-5 rounded-full shadow-md",
                  isAnnual ? "bg-gradient-to-r from-primary to-brand-purple ml-auto" : "bg-gray-400"
                )}
              />
            </button>
            <span className={cn("text-sm font-medium transition-colors", isAnnual ? "text-white" : "text-gray-500")}>
              Annually
            </span>
            {isAnnual && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20"
              >
                Save 20%
              </motion.span>
            )}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const price = isAnnual ? plan.price.annually : plan.price.monthly;
            const isPopular = plan.badge === 'Most Popular';

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-6 transition-all duration-300",
                  isPopular
                    ? "border-primary/40 bg-[#0d1225] shadow-[0_0_40px_rgba(124,92,255,0.15)] scale-[1.02]"
                    : "border-white/[0.08] bg-[#0a0f1e]/80 hover:border-white/20"
                )}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-4 py-1 rounded-full",
                    isPopular
                      ? "bg-gradient-to-r from-primary to-brand-purple text-white"
                      : "bg-gradient-to-r from-secondary to-emerald-500 text-white"
                  )}>
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", plan.color)}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-white">{plan.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-4">
                  {price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-heading font-extrabold text-white">₹{price}</span>
                      <span className="text-gray-500 text-sm">/user/mo</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-heading font-extrabold text-white">Custom</div>
                  )}
                </div>

                <p className="text-sm text-gray-400 mb-6 leading-relaxed">{plan.description}</p>

                {/* Features */}
                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm">
                      {f.included ? (
                        <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                      ) : (
                        <X size={16} className="text-gray-600 mt-0.5 shrink-0" />
                      )}
                      <span className={cn(f.included ? "text-gray-300" : "text-gray-600")}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button 
                  onClick={() => handleCtaClick(plan)}
                  className={cn(
                    "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                    plan.ctaStyle
                  )}
                >
                  {plan.cta}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Trust line */}
        <p className="text-center text-gray-500 text-sm mt-10">
          All plans include SSL encryption, daily backups, and 99.9% uptime SLA.
          <span className="text-gray-400"> No credit card required for free trial.</span>
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
