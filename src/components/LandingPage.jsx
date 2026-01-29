import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Users,
  BarChart2,
  Shield,
  Zap,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  ChevronRight,
  Star
} from 'lucide-react';
import heroBg from '../assets/hero-bg.png';
import aboutUsImg from '../assets/about-us.png';

import AuthWrapper from './Auth/AuthWrapper';

const LandingPage = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: <Users className="w-12 h-12 text-blue-600" />,
      title: "Employee Management",
      description: "Effortlessly manage employee profiles, departments, and roles in one centralized system."
    },
    {
      icon: <BarChart2 className="w-12 h-12 text-blue-600" />,
      title: "Performance Analytics",
      description: "Track key metrics and visualize team performance with intuitive dashboards."
    },
    {
      icon: <Shield className="w-12 h-12 text-blue-600" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security ensures your sensitive data is always protected."
    },
    {
      icon: <Zap className="w-12 h-12 text-blue-600" />,
      title: "Automation",
      description: "Automate routine tasks like attendance tracking and payroll processing."
    }
  ];

  const reviews = [
    {
      name: "Sarah Johnson",
      role: "HR Director",
      content: "This EMS transformed how we handle employee data. The dashboard is incredibly intuitive.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Team Lead",
      content: "The performance tracking features have helped our team align on goals like never before.",
      rating: 5
    },
    {
      name: "Jessica Williams",
      role: "Operations Manager",
      content: "Seamless integration and excellent support. Highly recommended for growing companies.",
      rating: 4
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">

      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tighter text-blue-800 cursor-pointer" onClick={() => scrollToSection('home')}>
            EMS<span className="text-blue-500">Master</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'About Us', 'Features', 'Reviews', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                className={`text-sm font-medium hover:text-blue-600 transition-colors ${isScrolled ? 'text-gray-700' : 'text-white'}`}
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-transform transform hover:scale-105 shadow-lg"
            >
              Login / Register
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`${isScrolled ? 'text-gray-800' : 'text-white'}`}>
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden flex flex-col items-center py-6 space-y-4">
            {['Home', 'About Us', 'Features', 'Reviews', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                className="text-gray-800 font-medium hover:text-blue-600"
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setShowLoginModal(true);
              }}
              className="bg-blue-600 text-white px-8 py-2 rounded-full"
            >
              Login / Register
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/80"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
            Empower Your Workforce
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100 opacity-90">
            Streamline operations, boost productivity, and foster a connected culture with our comprehensive Employee Management System.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button
              onClick={() => scrollToSection('features')}
              className="px-8 py-3 bg-white text-blue-900 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg flex items-center justify-center"
            >
              Explore Features <ChevronRight className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform">
                <img src={aboutUsImg} alt="Team Collaboration" className="w-full h-auto" />
                <div className="absolute inset-0 bg-blue-600/10"></div>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                ABOUT US
              </div>
              <h2 className="text-4xl font-bold mb-6 text-gray-900">Why We Make This</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe that great companies are built by great people. Our mission is to provide the tools that allow organizations to focus on what matters most—nurturing talent and driving innovation.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-lg mr-4 text-green-600">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Efficiency First</h4>
                    <p className="text-gray-600">Eliminate manual paperwork and redundant processes.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 p-2 rounded-lg mr-4 text-purple-600">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Data-Driven</h4>
                    <p className="text-gray-600">Make informed decisions with real-time insights.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your organization effectively, all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-blue-500 hover:-translate-y-2 transform duration-300">
                <div className="mb-6 bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Loved by Teams</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl relative">
                <div className="absolute top-6 right-8 text-yellow-400 flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6 pt-4">"{review.content}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{review.name}</h4>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">{review.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-blue-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-800 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-900 rounded-full blur-3xl opacity-50 -ml-10 -mb-10"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-16">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
              <p className="text-blue-200 mb-8 text-lg">
                Ready to transform your employee management experience? Contact us for a demo or custom quote.
              </p>

              <div className="space-y-6">
                <div className="flex items-center">
                  <Mail className="mr-4 text-blue-300" />
                  <span>support@emsmaster.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-4 text-blue-300" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-4 text-blue-300" />
                  <span>123 Tech Park, Innovation Way</span>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-blue-400 text-white placeholder-white/50" placeholder="Your Name" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-blue-400 text-white placeholder-white/50" placeholder="your@email.com" />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/10 focus:outline-none focus:border-blue-400 text-white placeholder-white/50 h-32" placeholder="How can we help?"></textarea>
                </div>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-6">
            <span className="text-2xl font-bold text-white tracking-tighter">EMS<span className="text-blue-500">Master</span></span>
          </div>
          <div className="flex justify-center space-x-6 mb-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Help Center</a>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} EMS Master. All rights reserved.</p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <AuthWrapper onAuthSuccess={(userType, data) => {
              if (onAuthSuccess) {
                onAuthSuccess(userType, data);
              }
              setShowLoginModal(false);
              navigate('/dashboard');
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
