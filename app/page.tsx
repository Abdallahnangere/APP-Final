'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap, Lock, TrendingUp, Users, Smartphone, Download, Shield, Zap as ZapIcon, TrendingUp as TrendingUpIcon } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Apple-style header */}
      <header className="sticky top-0 backdrop-blur-xl bg-white/80 border-b border-slate-200/50 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Sauki Mart" className="h-8 w-auto object-contain" />
            <div className="hidden sm:block">
              <h1 className="text-xs font-black tracking-tight">Sauki Mart</h1>
              <p className="text-[9px] text-slate-500">Nigeria's Premium Platform</p>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-6">
            <a href="#features" className="text-xs text-slate-600 hover:text-slate-900 transition">Features</a>
            <a href="#mockup" className="text-xs text-slate-600 hover:text-slate-900 transition">App</a>
            <Link href="/privacy" className="text-xs text-slate-600 hover:text-slate-900 transition">Privacy</Link>
            <a href="tel:+2348061934056" className="text-xs text-slate-600 hover:text-slate-900 transition">Contact</a>
            <a href="https://play.google.com/store/apps/details?id=online.saukimart.twa" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold transition shadow-md">
              <Download className="w-3 h-3" /> Get App
            </a>
          </nav>

          <a href="https://play.google.com/store/apps/details?id=online.saukimart.twa" target="_blank" rel="noreferrer" className="sm:hidden px-2.5 py-1.5 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-1">
            <Download className="w-3 h-3" /> Get
          </a>
        </div>
      </header>

      {/* Hero Section - Apple Style with Mockup */}
      <section className="max-w-7xl mx-auto px-6 py-20 sm:py-28">
        <div className="space-y-12">
          {/* Main Hero Copy */}
          <div className="space-y-6 max-w-3xl">
            <h2 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight">
              Instant Data.<br/>
              <span className="bg-gradient-to-r from-blue-600 via-indigo-700 to-blue-800 bg-clip-text text-transparent">Premium Commerce.</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
              Nigeria's most trusted platform for instant mobile data, airtime, and premium gadgets. Enterprise-grade security. Professional agent system. Enterprise reliability.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <a href="https://play.google.com/store/apps/details?id=online.saukimart.twa" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition duration-300 group">
                <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Get on Google Play
              </a>
              <Link href="/app" className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-200 hover:border-slate-300 bg-white rounded-full font-semibold transition hover:bg-slate-50">
                Try Web App <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <p className="text-sm text-slate-500 pt-2">✓ Secure Payments · ✓ Instant Delivery · ✓ 24/7 Support · ✓ 2% Cashback</p>
          </div>

          {/* Smartphone Mockup Showcase */}
          <div id="mockup" className="pt-12 overflow-x-auto">
            <div className="flex gap-6 pb-6 min-w-max md:min-w-none md:grid md:grid-cols-5 md:gap-4">
              {[
                { src: '/screenshots/mobile-home.png', label: 'Home Hub', delay: 0 },
                { src: '/screenshots/mobile-store.png', label: 'Premium Store', delay: 0.1 },
                { src: '/screenshots/mobile-data.png', label: 'Instant Data', delay: 0.2 },
                { src: '/screenshots/mobile-agent.png', label: 'Agent Portal', delay: 0.3 },
                { src: '/screenshots/mobile-support.png', label: 'Support', delay: 0.4 }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3 flex-shrink-0 md:flex-shrink">
                  {/* Phone Frame */}
                  <div className="relative w-48 md:w-44 h-96 md:h-80 bg-black rounded-3xl shadow-2xl border-8 border-black overflow-hidden group hover:shadow-blue-500/40 transition-shadow duration-300">
                    {/* Screen Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-10"></div>
                    
                    {/* Screenshot */}
                    <img 
                      src={item.src} 
                      alt={item.label}
                      className="w-full h-full object-cover pt-2"
                    />
                    
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  </div>
                  
                  {/* Label */}
                  <p className="text-sm font-semibold text-slate-900 text-center">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Apple Grid */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wider">Features</p>
            <h3 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">Why Choose Sauki Mart?</h3>
            <p className="text-lg text-slate-600">Built for performance, security, and user experience. Trusted by thousands across Nigeria.</p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'Instant Data', desc: 'MTN, Airtel, GLO data in seconds. Auto-retry on failure.' },
              { icon: '👥', title: 'Agent System', desc: 'Dedicated partner portal with wallet, cashback & analytics.' },
              { icon: '🔐', title: 'Bcrypt Security', desc: 'PIN hashing, rate limiting, input validation & logging.' },
              { icon: '💰', title: '2% Cashback', desc: 'Every agent transaction earns instant cashback rewards.' },
              { icon: '📱', title: 'PWA Support', desc: 'Works offline, installable, push notifications included.' },
              { icon: '🛒', title: 'Premium Store', desc: 'Verified gadgets, secure checkout, fast delivery.' }
            ].map((feature, i) => (
              <div key={i} className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all border border-slate-100 hover:border-blue-200 duration-300">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h4 className="text-lg font-black mb-2 text-slate-900">{feature.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features Deep Dive - Apple Style */}
      <section className="max-w-7xl mx-auto px-6 py-24 space-y-16">
        {/* Feature: Enterprise Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-slate-900">Enterprise-Grade Security</h3>
            <p className="text-lg text-slate-600">Your transactions are protected with military-grade Bcrypt encryption, rate limiting, and multi-layer validation. Every request is logged with structured JSON for forensic analysis.</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <span className="text-slate-700">Bcrypt PIN Hashing (strength 12)</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <span className="text-slate-700">Rate Limiting: 5 logins/15min, 3 registers/1hr</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <span className="text-slate-700">Zod Input Validation on All Endpoints</span>
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <div className="aspect-square bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white">
              <Lock className="w-24 h-24 opacity-20" />
            </div>
          </div>
        </div>

        {/* Feature: Agent Rewards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center md:grid-flow-dense">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
            <div className="aspect-square bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center text-white">
              <TrendingUp className="w-24 h-24 opacity-20" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-slate-900">2% Cashback Rewards</h3>
            <p className="text-lg text-slate-600">Every partner purchase instantly earns 2% cashback. Redeem to your wallet anytime. Build passive income while serving your customers.</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-slate-700">Instant 2% Cashback Credit</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-slate-700">Real-Time Analytics Dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-slate-700">Atomic Wallet Transfers</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature: PWA Technology */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-slate-900">Progressive Web App</h3>
            <p className="text-lg text-slate-600">Works offline, installable on home screen like a native app, and receives push notifications for real-time order updates.</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                <span className="text-slate-700">Installable on Android & iOS</span>
              </li>
              <li className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                <span className="text-slate-700">Push Notifications via Firebase</span>
              </li>
              <li className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                <span className="text-slate-700">Offline Support & Service Worker</span>
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
            <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-700 rounded-xl flex items-center justify-center text-white">
              <Smartphone className="w-24 h-24 opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Apple Style */}
      <section className="bg-slate-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { stat: '50K+', label: 'Active Users' },
              { stat: '2M+', label: 'Transactions' },
              { stat: '99.9%', label: 'Uptime' },
              { stat: '24/7', label: 'Support' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl sm:text-5xl font-black mb-2">{item.stat}</p>
                <p className="text-slate-400 text-sm font-semibold">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Apple Style */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-12 sm:p-16 text-center space-y-8 shadow-2xl overflow-hidden relative">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -mr-48 -mt-48"></div>
          </div>
          
          <div className="relative z-10 space-y-6">
            <h3 className="text-4xl sm:text-5xl font-black">Ready to Get Started?</h3>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">Join thousands of Nigerians enjoying instant data, premium gadgets, and secure payments with Sauki Mart.</p>
            
            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <a href="https://play.google.com/store/apps/details?id=online.saukimart.twa" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition shadow-lg hover:shadow-xl group">
                <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Get on Google Play
              </a>
              <Link href="/app" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition">
                Try Web App <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Apple Style */}
      <footer className="border-t border-slate-200 bg-slate-50 mt-24">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <img src="/logo.png" alt="Sauki Mart" className="h-8 w-auto" />
                <span className="font-black text-sm">Sauki Mart</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Premium mobile commerce platform serving Nigeria. SMEDAN-Certified • ISO-Standard Security • 24/7 Support
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-black text-xs mb-4 uppercase tracking-wider text-slate-900">App</h4>
              <ul className="text-xs text-slate-600 space-y-3">
                <li><Link href="/app" className="hover:text-blue-600 transition">Open App</Link></li>
                <li><a href="https://play.google.com/store/apps/details?id=online.saukimart.twa" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition">Google Play</a></li>
                <li><Link href="/privacy" className="hover:text-blue-600 transition">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-black text-xs mb-4 uppercase tracking-wider text-slate-900">Company</h4>
              <ul className="text-xs text-slate-600 space-y-3">
                <li><a href="#features" className="hover:text-blue-600 transition">Features</a></li>
                <li><a href="mailto:saukidatalinks@gmail.com" className="hover:text-blue-600 transition">Email</a></li>
                <li><a href="tel:+2348061934056" className="hover:text-blue-600 transition">Support</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-black text-xs mb-4 uppercase tracking-wider text-slate-900">Support</h4>
              <ul className="text-xs text-slate-600 space-y-3">
                <li><a href="tel:+2348061934056" className="hover:text-blue-600 transition">📞 0806 193 4056</a></li>
                <li><a href="tel:+2347044647081" className="hover:text-blue-600 transition">📞 0704 464 7081</a></li>
                <li><a href="mailto:saukidatalinks@gmail.com" className="hover:text-blue-600 transition">saukidatalinks@gmail.com</a></li>
              </ul>
            </div>

            {/* Download */}
            <div>
              <h4 className="font-black text-xs mb-4 uppercase tracking-wider text-slate-900">Get App</h4>
              <a href="https://play.google.com/store/apps/details?id=online.saukimart.twa" target="_blank" rel="noreferrer" className="block mb-3 hover:opacity-80 transition">
                <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" className="h-12 w-auto" />
              </a>
              <p className="text-xs text-slate-500 font-medium">Available on Android, iOS (via PWA), and Web</p>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} Sauki Data Links. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="/privacy" className="hover:text-slate-900 transition">Privacy</a>
              <span>•</span>
              <a href="mailto:saukidatalinks@gmail.com" className="hover:text-slate-900 transition">Terms</a>
              <span>•</span>
              <p>Built with Premium Standards • Enterprise Security • 99.9% Uptime</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}