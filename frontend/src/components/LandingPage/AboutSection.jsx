import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, MapPin, Briefcase, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;

const AboutSection = () => {
  return (
    <section id="about" className="py-28 relative z-10 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-6xl relative">

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-secondary font-semibold text-xs uppercase tracking-widest mb-3">The Developer</p>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white leading-tight">
            Built by One,{' '}
            <span className="text-gradient">Engineered for Many</span>
          </h2>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative p-8 md:p-12 rounded-3xl border border-white/[0.08] bg-[#0a0f1e]/90 overflow-hidden">
            {/* Corner glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/8 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">

              {/* Profile Photo */}
              <div className="shrink-0">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary to-brand-purple p-[2px] shadow-[0_0_32px_rgba(124,92,255,0.3)]">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-[#0a0f1e]">
                    <img
                      src={`${BASE}profile.jpg`}
                      alt="Aviral Mishra"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-3xl font-heading font-extrabold text-white">AM</div>';
                      }}
                    />
                  </div>
                </div>

                {/* Open to work */}
                <div className="mt-3 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    Open to Work
                  </span>
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-1">
                  Aviral Mishra
                </h3>
                <p className="text-primary font-semibold text-sm mb-4">
                  Full-Stack Developer · Solo Builder
                </p>

                {/* Meta info */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2 text-xs text-gray-400 mb-5">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-primary" />
                    NIT Warangal — MCA '27
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-primary" />
                    Warangal, India
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={13} className="text-primary" />
                    Full-Stack · AI · System Design
                  </span>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-lg">
                  I'm the solo developer behind EMS-master — an enterprise HR platform built with React, Node.js & MongoDB. I specialize in building scalable full-stack apps, real-time pipelines, and clean UX experiences.
                </p>

                {/* Tech pills */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6">
                  {['React.js', 'Node.js', 'MongoDB', 'TailwindCSS', 'JWT Auth', 'REST APIs'].map(tech => (
                    <span key={tech} className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-gray-300 font-medium">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Social links */}
                <div className="flex justify-center sm:justify-start gap-3">
                  <a
                    href="https://github.com/AviralNITW"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-primary/40 hover:bg-primary/10 text-xs text-gray-300 hover:text-white transition-all duration-200"
                  >
                    <Github size={14} /> GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/aviral-mishra-482325324"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-secondary/40 hover:bg-secondary/10 text-xs text-gray-300 hover:text-white transition-all duration-200"
                  >
                    <Linkedin size={14} /> LinkedIn
                  </a>
                  <a
                    href="mailto:aviralmishra756@gmail.com"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 text-xs text-gray-300 hover:text-white transition-all duration-200"
                  >
                    <Mail size={14} /> Contact
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default AboutSection;
