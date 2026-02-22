'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight } from 'lucide-react';

// ============ ANIMATIONS & UTILITIES ============
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] } },
};

const headerItem = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// ============ NAVIGATION BAR ============
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Shop', href: '/app' },
    { label: 'Data', href: '/app' },
    { label: 'Devices', href: '/app' },
    { label: 'Giveaway', href: '/giveaway' },
    { label: 'About', href: '#features' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0A0A0A]/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 relative">
                <Image src="/logo.png" alt="SaukiMart" fill className="object-contain" />
              </div>
              <span className="text-white font-bold hidden sm:inline">SaukiMart</span>
            </Link>
          </motion.div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <a
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                >
                  {link.label}
                </a>
              </motion.div>
            ))}
          </div>

          {/* Right CTA Section */}
          <div className="flex items-center gap-3">
            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <Link
                  href="/app"
                  className="px-6 py-2 bg-[#C8922A] text-[#0A0A0A] rounded-lg font-bold text-sm hover:brightness-110 transition-all"
                >
                  Open Web App
                </Link>
              </motion.div>

              {/* Google Play Badge */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <a
                  href="https://play.google.com/store/apps/details?id=online.saukimart.twa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 bg-black border border-gray-700 rounded-lg hover:border-gray-500 transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    fill="white"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 20.5V3.5C3 2.92 3.25 2.5 3.75 2.5H10.25L15 8.5V2.5H20.75C21.25 2.5 21.5 2.92 21.5 3.5V20.5C21.5 21.08 21.25 21.5 20.75 21.5H3.75C3.25 21.5 3 21.08 3 20.5Z" />
                  </svg>
                  <span className="text-white text-xs font-medium">GET IT ON</span>
                </a>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0A0A0A] border-t border-gray-800 py-4"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-gray-300 hover:text-white px-4 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  href="/app"
                  className="mx-4 px-4 py-2 bg-[#C8922A] text-[#0A0A0A] rounded-lg font-bold text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Open Web App
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

// ============ HERO SECTION ============
function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: (e.clientX - rect.left - rect.width / 2) * 0.05,
        y: (e.clientY - rect.top - rect.height / 2) * 0.05,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const words = ['Instant', 'Data', 'Premium', 'Devices', 'Secure', 'Wallet'];
  const randomWords = words.sort(() => Math.random() - 0.5).slice(0, 3);

  return (
    <section className="min-h-screen pt-32 pb-20 bg-gradient-to-b from-[#0A0A0A] to-[#0A0A0A] relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C8922A]/20 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT: Text Content */}
          <motion.div
            ref={containerRef}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
            className="flex flex-col justify-center z-10"
          >
            {/* Main Headline */}
            <motion.h1 variants={item} className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Your trusted{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8922A] to-[#E8C547]">
                digital marketplace
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p variants={item} className="text-xl text-gray-300 mb-12 leading-relaxed max-w-lg">
              Buy instant data, premium devices, and manage your wallet securely. Nigeria's trusted commerce platform trusted by thousands.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/app"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#C8922A] text-[#0A0A0A] rounded-xl font-bold text-lg hover:brightness-110 transition-all group"
              >
                Open Web App
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="https://play.google.com/store/apps/details?id=online.saukimart.twa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-[#C8922A] text-[#C8922A] rounded-xl font-bold text-lg hover:bg-[#C8922A]/10 transition-all"
              >
                Download on Android
              </a>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div variants={item} className="flex flex-wrap gap-8 pt-8 border-t border-gray-800">
              <div>
                <p className="text-3xl font-bold text-white">10K+</p>
                <p className="text-gray-400 text-sm">Happy Customers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">Instant</p>
                <p className="text-gray-400 text-sm">Delivery</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">24/7</p>
                <p className="text-gray-400 text-sm">Support</p>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: iPhone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative w-80 h-96">
              {/* iPhone Frame */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden">
                {/* Screen Content */}
                <motion.div
                  animate={{
                    y: mousePosition.y,
                    x: mousePosition.x,
                  }}
                  transition={{ type: 'spring', stiffness: 100, damping: 30 }}
                  className="w-full h-full relative bg-gradient-to-br from-[#C8922A]/10 to-transparent flex items-center justify-center"
                >
                  <Image
                    src="/render.png"
                    alt="SaukiMart App Interface"
                    fill
                    className="object-cover"
                    priority
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                  {/* Fallback content if image doesn't load */}
                  <div className="absolute inset-0 flex items-center justify-center text-center w-full h-full">
                    <div className="text-white/30 text-sm font-medium">
                      <p>SaukiMart App</p>
                      <p className="text-xs mt-2">Please upload render.png to public folder</p>
                    </div>
                  </div>

                  {/* Screen Shine/Glass Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
                </motion.div>
              </div>

              {/* iPhone Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-10 shadow-lg"></div>

              {/* Floating Shadow */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-64 h-32 bg-[#C8922A] rounded-full filter blur-3xl"
              ></motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============ FEATURES SECTION ============
function FeaturesSection() {
  const features = [
    {
      title: 'Instant Data',
      description: 'Buy MTN, Airtel, and Glo data in seconds. Direct delivery to your phone.',
      icon: '⚡',
    },
    {
      title: 'Premium Devices',
      description: 'Curated selection of electronics and accessories at competitive prices.',
      icon: '📱',
    },
    {
      title: 'Secure Wallet',
      description: 'PCI-compliant payments with end-to-end encryption for peace of mind.',
      icon: '🔒',
    },
    {
      title: 'Agent Network',
      description: 'Become an agent and earn commissions on every sale. Grow your business.',
      icon: '💰',
    },
  ];

  return (
    <section id="features" className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={container}
          className="mb-16"
        >
          <motion.h2 variants={item} className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything You Need
          </motion.h2>
          <motion.p variants={item} className="text-xl text-gray-400">
            From instant data to premium devices, we've got you covered.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={container}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div key={idx} variants={item}>
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-[#C8922A] transition-all duration-300 group">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============ MARQUEE SECTION ============
function MarqueeSection() {
  const categories = ['INSTANT DATA', 'PREMIUM DEVICES', 'SECURE WALLET', 'POCKET MIFI', 'AIRTIME', 'AGENT NETWORK'];

  return (
    <section className="py-16 bg-gradient-to-r from-[#C8922A] via-[#E8C547] to-[#C8922A] overflow-hidden">
      <div className="relative">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...categories, ...categories].map((cat, idx) => (
            <span key={idx} className="text-2xl lg:text-4xl font-black text-[#0A0A0A] tracking-wider">
              {cat}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============ GIVEAWAY SECTION ============
function GiveawaySection() {
  return (
    <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-t from-[#C8922A]/30 to-transparent"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={container}
          className="text-center"
        >
          <motion.h2 variants={item} className="text-5xl lg:text-6xl font-bold text-white mb-6">
            Win Big with <span className="text-[#C8922A]">SaukiMart</span>
          </motion.h2>

          <motion.p variants={item} className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join our exclusive giveaway and stand a chance to win amazing prizes. New winners every week!
          </motion.p>

          <motion.div variants={item}>
            <Link
              href="/giveaway"
              className="inline-flex items-center px-10 py-4 bg-[#C8922A] text-[#0A0A0A] rounded-xl font-bold text-lg hover:brightness-110 transition-all group"
            >
              Enter Giveaway
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============ SOCIAL PROOF SECTION ============
function SocialProofSection() {
  const stats = [
    { value: '10,000+', label: 'Happy Customers', icon: '😊' },
    { value: 'Instant', label: 'Data Delivery', icon: '⚡' },
    { value: '24/7', label: 'Customer Support', icon: '💬' },
    { value: '99.9%', label: 'Uptime', icon: '✅' },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-white text-center mb-16"
        >
          Trusted by Thousands
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={container}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, idx) => (
            <motion.div key={idx} variants={item} className="text-center">
              <p className="text-5xl mb-3">{stat.icon}</p>
              <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
              <p className="text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============ FOOTER ============
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 relative">
                <Image src="/logo.png" alt="SaukiMart" fill className="object-contain" />
              </div>
              <span className="text-white font-bold text-lg">SaukiMart</span>
            </div>
            <p className="text-gray-400 text-sm">
              Nigeria's trusted digital marketplace for instant data, devices, and secure payments.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/app" className="text-gray-400 hover:text-white transition-colors">
                  Web App
                </Link>
              </li>
              <li>
                <a href="https://play.google.com/store/apps/details?id=online.saukimart.twa" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  Android App
                </a>
              </li>
              <li>
                <Link href="/giveaway" className="text-gray-400 hover:text-white transition-colors">
                  Giveaway
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="https://wa.me/2348061934056" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="mailto:saukidatalinks@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                  Email Support
                </a>
              </li>
            </ul>
          </div>

          {/* Download */}
          <div>
            <h3 className="text-white font-bold mb-4">Download</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://play.google.com/store/apps/details?id=online.saukimart.twa" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-black border border-gray-700 rounded-lg hover:border-[#C8922A] transition-all text-sm text-gray-300">
                  <svg className="w-4 h-4" fill="white" viewBox="0 0 24 24">
                    <path d="M3 20.5V3.5C3 2.92 3.25 2.5 3.75 2.5H10.25L15 8.5V2.5H20.75C21.25 2.5 21.5 2.92 21.5 3.5V20.5C21.5 21.08 21.25 21.5 20.75 21.5H3.75C3.25 21.5 3 21.08 3 20.5Z" />
                  </svg>
                  Google Play
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-900 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Sauki Mart. All rights reserved. SMEDAN Certified Business.
            </p>
            <div className="flex gap-4">
              <a href="https://wa.me/2348061934056" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                WhatsApp
              </a>
              <a href="mailto:saukidatalinks@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============ MAIN PAGE ============
export default function HomePage() {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <main className="bg-[#0A0A0A] text-white overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <MarqueeSection />
      <GiveawaySection />
      <SocialProofSection />
      <Footer />
    </main>
  );
}