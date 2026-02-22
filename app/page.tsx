'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight, Zap, Smartphone, Wallet, Users, Shield, TrendingUp, Globe } from 'lucide-react';

// ============ ANIMATIONS ============
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.32, 0.72, 0, 1] },
  }),
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// ============ NAVIGATION ============
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/50 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 relative">
            <Image src="/logo.png" alt="SaukiMart" fill className="object-contain" />
          </div>
          <span className="font-bold text-xl text-gray-900 hidden sm:inline">SaukiMart</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-12">
          {['Shop', 'Agents', 'Support', 'About'].map((item) => (
            <a
              key={item}
              href={item === 'Shop' ? '/app' : '#'}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/app"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Enter App
          </Link>
          <a
            href="https://play.google.com/store/apps/details?id=online.saukimart.twa"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 border border-gray-300 text-gray-900 rounded-full font-semibold text-sm hover:border-gray-400 transition-colors"
          >
            Download
          </a>
        </div>

        {/* Mobile Menu */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 md:hidden">
            <div className="flex flex-col gap-4 p-6">
              <Link href="/app" className="font-semibold text-gray-900">
                Shop
              </Link>
              <Link href="/app" className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold text-center">
                Enter App
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  );
}

// ============ HERO SECTION ============
function HeroSection() {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-32 px-6 bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-8">
            <motion.h1
              variants={fadeInUp}
              custom={0}
              className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight"
            >
              Nigeria's Trusted Digital Marketplace
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={0.1}
              className="text-xl text-gray-600 leading-relaxed max-w-lg"
            >
              Buy instant data, premium devices, and manage your finances securely. Trusted by thousands across Nigeria.
            </motion.p>

            <motion.div variants={fadeInUp} custom={0.2} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/app"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-colors group"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://play.google.com/store/apps/details?id=online.saukimart.twa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-900 rounded-full font-bold text-lg hover:border-gray-400 transition-colors"
              >
                Download App
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={fadeInUp} custom={0.3} className="flex flex-wrap gap-6 pt-8 border-t border-gray-200">
              {[
                { label: '10,000+', desc: 'Active Users' },
                { label: 'Instant', desc: 'Delivery' },
                { label: '24/7', desc: 'Support' },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Feature Cards */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-4"
          >
            {[
              { icon: Zap, title: 'Instant Data', desc: 'MTN, Airtel, Glo in seconds' },
              { icon: Smartphone, title: 'Premium Devices', desc: 'Curated electronics & gadgets' },
              { icon: Wallet, title: 'Secure Wallet', desc: 'PCI-DSS compliant payments' },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                custom={0.1 + i * 0.1}
                className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <item.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============ FEATURES DETAILED ============
function FeaturesSection() {
  const features = [
    {
      title: 'Instant Data & Airtime',
      desc: 'Buy from MTN, Airtel, and Glo data plans instantly. Direct delivery to your phone number within seconds.',
      icon: Zap,
      color: 'bg-blue-100',
    },
    {
      title: 'Premium Gadget Store',
      desc: 'Carefully curated electronics and accessories with professional descriptions, images, and secure checkout.',
      icon: Smartphone,
      color: 'bg-purple-100',
    },
    {
      title: 'Secure Wallet System',
      desc: 'Pre-load funds for quick purchases. PCI-DSS Level 1 compliant with Flutterwave integration.',
      icon: Wallet,
      color: 'bg-green-100',
    },
    {
      title: 'Agent Network',
      desc: 'Become an agent and earn 5-10% commissions. Access dashboard, analytics, and weekly payouts.',
      icon: Users,
      color: 'bg-orange-100',
    },
    {
      title: 'Transaction Tracking',
      desc: 'View complete history, search transactions, download receipts, and verify payment status anytime.',
      icon: TrendingUp,
      color: 'bg-pink-100',
    },
    {
      title: '24/7 Support',
      desc: 'Live support team available via WhatsApp, email, and in-app chat. Quick issue resolution guaranteed.',
      icon: Globe,
      color: 'bg-cyan-100',
    },
  ];

  return (
    <section className="py-24 md:py-32 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need in One Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whether you're a customer or an agent, SaukiMart provides all the tools you need to succeed.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              custom={i * 0.05}
              className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all"
            >
              <div className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============ SECURITY & TRUST SECTION ============
function SecuritySection() {
  const badges = [
    { icon: '✓', label: 'SMEDAN Certified' },
    { icon: '🔐', label: 'PCI-DSS Level 1' },
    { icon: '🛡️', label: 'Flutterwave Partner' },
    { icon: '📱', label: 'Firebase Verified' },
  ];

  return (
    <section className="py-24 md:py-32 px-6 bg-gradient-to-r from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Secure & Trustworthy
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your data and payments are protected with industry-leading security standards.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {badges.map((badge, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              custom={i * 0.1}
              className="text-center p-6 rounded-2xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-4">{badge.icon}</div>
              <p className="font-semibold text-gray-900">{badge.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          custom={0.5}
          className="mt-16 p-8 rounded-2xl bg-white border border-gray-200"
        >
          <Shield className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Matters</h3>
          <p className="text-gray-600 mb-6">
            We employ industry-standard encryption, secure payment gateways, fraud detection systems, and transparent data practices. No data selling policy. Easy account deletion anytime.
          </p>
          <Link href="/privacy" className="text-blue-600 font-semibold hover:text-blue-700">
            Read our Privacy Policy →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ============ PAYMENT METHODS ============
function PaymentSection() {
  const methods = [
    { icon: '💳', title: 'Debit Cards', desc: 'Visa, Mastercard' },
    { icon: '🏦', title: 'Bank Transfers', desc: 'Direct bank payments' },
    { icon: '👛', title: 'Wallet', desc: 'Pre-load funds' },
    { icon: '📱', title: 'Agent Wallet', desc: 'Through agents' },
  ];

  return (
    <section className="py-24 md:py-32 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Flexible Payment Options
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Multiple ways to pay, whatever works best for you.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {methods.map((method, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              custom={i * 0.1}
              className="text-center p-8 rounded-2xl bg-gray-50 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <div className="text-5xl mb-4">{method.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{method.title}</h3>
              <p className="text-sm text-gray-600">{method.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============ AGENT SECTION ============
function AgentSection() {
  const steps = [
    { num: '1', title: 'Apply', desc: 'Fill the registration form with your business details' },
    { num: '2', title: 'Get Approved', desc: 'Approved within 24-48 hours with dashboard access' },
    { num: '3', title: 'Start Selling', desc: 'Earn 5-10% commissions on every sale' },
    { num: '4', title: 'Grow', desc: 'Monitor analytics, optimize pricing, scale sales' },
  ];

  return (
    <section className="py-24 md:py-32 px-6 bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Become a SaukiMart Agent
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start your own business and earn competitive commissions. Join our growing agent network.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {steps.map((step, i) => (
            <motion.div key={i} variants={fadeInUp} custom={i * 0.1}>
              <div className="flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xl mb-4">
                  {step.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
              {i < steps.length - 1 && <div className="hidden lg:block h-12 border-r-2 border-gray-200 mt-4 -ml-6"></div>}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          custom={0.5}
          className="text-center pt-8 border-t border-gray-200"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Agent Benefits</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              'Real-time balance management',
              'Detailed analytics & metrics',
              'Weekly payouts to account',
              'Cashback wallet system',
              'Customer management tools',
              'Goal tracking & insights',
            ].map((benefit, i) => (
              <div key={i} className="p-4 rounded-lg bg-blue-50 text-left">
                <p className="font-semibold text-gray-900">✓ {benefit}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============ CTA SECTION ============
function CTASection() {
  return (
    <section className="py-24 md:py-32 px-6 bg-gradient-to-r from-blue-600 to-blue-700">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100">
            Join thousands of customers and agents already using SaukiMart. Download the app or access the web app today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors group"
            >
              Enter Web App
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://play.google.com/store/apps/details?id=online.saukimart.twa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-colors"
            >
              Download Android App
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============ SUPPORT SECTION ============
function SupportSection() {
  return (
    <section className="py-24 md:py-32 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            24/7 Customer Support
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our support team is always available to help. Choose your preferred contact method.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            { title: 'Email', value: 'saukidatalinks@gmail.com', href: 'mailto:saukidatalinks@gmail.com' },
            { title: 'WhatsApp', value: '+234 806 193 4056', href: 'https://wa.me/2348061934056' },
            { title: 'WhatsApp Alt', value: '+234 704 464 7081', href: 'https://wa.me/2347044647081' },
          ].map((contact, i) => (
            <motion.a
              key={i}
              href={contact.href}
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeInUp}
              custom={i * 0.1}
              className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all text-center"
            >
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{contact.title}</h3>
              <p className="text-blue-600 font-semibold hover:underline">{contact.value}</p>
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          custom={0.5}
          className="mt-16 p-8 rounded-2xl bg-blue-50 border border-blue-200 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Quick Responses Guaranteed</h3>
          <p className="text-gray-700 mb-6">
            WhatsApp is our fastest contact method. File complaints, report issues, or get support anytime. Our team follows up within 24 hours.
          </p>
          <a
            href="https://wa.me/2348061934056"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors"
          >
            💬 Chat on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ============ FOOTER ============
function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 relative">
                <Image src="/logo.png" alt="SaukiMart" fill className="object-contain" />
              </div>
              <span className="font-bold text-white">SaukiMart</span>
            </div>
            <p className="text-gray-400 text-sm">Nigeria's trusted digital marketplace for instant data, devices, and secure payments.</p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/app" className="hover:text-white transition-colors">Web App</Link></li>
              <li><a href="https://play.google.com/store/apps/details?id=online.saukimart.twa" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Android App</a></li>
              <li><Link href="/giveaway" className="hover:text-white transition-colors">Giveaway</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><a href="https://wa.me/2348061934056" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a></li>
              <li><a href="mailto:saukidatalinks@gmail.com" className="hover:text-white transition-colors">Email</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Certifications</h3>
            <ul className="space-y-2 text-sm">
              <li>✅ SMEDAN Certified</li>
              <li>🔐 PCI-DSS Level 1</li>
              <li>🛡️ Flutterwave Partner</li>
              <li>📱 Firebase Verified</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© {year} Sauki Mart. All rights reserved. SMEDAN Certified Business.</p>
            <div className="flex gap-6">
              <a href="https://wa.me/2348061934056" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">WhatsApp</a>
              <a href="mailto:saukidatalinks@gmail.com" className="text-gray-400 hover:text-white text-sm transition-colors">Email</a>
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
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <main className="bg-white text-gray-900 overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <SecuritySection />
      <PaymentSection />
      <AgentSection />
      <SupportSection />
      <CTASection />
      <Footer />
    </main>
  );
}