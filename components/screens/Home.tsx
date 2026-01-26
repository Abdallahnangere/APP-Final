
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, Bell, ArrowRight, Smartphone, Wifi, 
  ShieldCheck, Users, Zap, Star, ExternalLink
} from 'lucide-react';
import { toPng } from 'html-to-image';

import { SideMenu } from '../SideMenu';
import { BottomSheet } from '../ui/BottomSheet';
import { Support } from './Support';
import { BrandedReceipt } from '../BrandedReceipt';
import { cn, formatCurrency, generateReceiptData } from '../../lib/utils';
import { toast } from '../../lib/toast';
import { History } from './History';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [ticker, setTicker] = useState<{ content: string; type: string } | null>(null);
  
  // Receipt State
  const receiptRef = useRef<HTMLDivElement>(null);
  const [receiptTx, setReceiptTx] = useState<any>(null);

  useEffect(() => {
    fetch('/api/system/message')
      .then(res => res.json())
      .then(data => {
        if (data && data.content && data.type !== 'PUSH') {
          setTicker(data);
        }
      })
      .catch(() => {});
  }, []);

  const MotionDiv = motion.div as any;

  return (
    <div className="h-screen bg-primary-50 flex flex-col overflow-hidden">
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onOpenLegal={() => { setIsMenuOpen(false); setIsSupportOpen(true); }}
        onOpenHistory={() => { setIsMenuOpen(false); onNavigate('history'); }}
        onAgentLogin={() => { setIsMenuOpen(false); onNavigate('agent'); }}
      />
      
      {/* Hidden Receipt Generator */}
      {receiptTx && (
        <BrandedReceipt ref={receiptRef} transaction={generateReceiptData(receiptTx)} />
      )}

      {/* HEADER - Apple Clean Style with Top Padding */}
      <header className="px-6 pt-6 pb-4 flex justify-between items-center z-10 shrink-0 relative bg-gradient-to-b from-primary-50 via-primary-50 to-transparent">
        {/* Top decorative gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-900 via-accent-blue to-accent-purple/70"></div>
        
        <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-primary-900 tracking-tight">SAUKI MART</h1>
            {/* Google Play Badge */}
            <MotionDiv
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://play.google.com/store/apps/details?id=online.saukimart.twa', '_blank')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg shadow-md border border-primary-200 hover:shadow-lg transition-all cursor-pointer group"
              title="Get on Google Play"
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-[8px] font-black text-primary-900 leading-none">GET IT ON</span>
              </div>
              <div className="h-6 w-0.5 bg-primary-200"></div>
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-black text-primary-900">Google Play</span>
                <ExternalLink className="w-3 h-3 text-primary-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </MotionDiv>
        </div>
        <MotionDiv
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(true)}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
        >
          <Menu className="w-5 h-5 text-primary-900" />
        </MotionDiv>
      </header>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-2 space-y-4 pb-20">
        
        {/* TICKER (Marquee) */}
        {ticker && (
           <MotionDiv 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className={cn(
               "relative overflow-hidden rounded-2xl p-4 flex items-center shadow-elevation-2 border",
               ticker.type === 'alert' ? "bg-accent-red/10 border-accent-red/20 text-accent-red" 
               : ticker.type === 'warning' ? "bg-accent-orange/10 border-accent-orange/20 text-accent-orange"
               : "bg-accent-blue/10 border-accent-blue/20 text-accent-blue"
             )}>
             <div className="p-2 rounded-lg mr-3 shrink-0 font-semibold">
               <Bell className="w-4 h-4" />
             </div>
             <div className="flex-1 overflow-hidden h-5 relative">
                <MotionDiv 
                  animate={{ x: ["100%", "-100%"] }} 
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  className="absolute whitespace-nowrap text-xs font-semibold uppercase tracking-wide pt-0.5"
                >
                  {ticker.content} • {ticker.content} • {ticker.content}
                </MotionDiv>
             </div>
           </MotionDiv>
        )}

        {/* HERO CARD - AGENT (Premium Gradient) */}
        <MotionDiv 
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -4 }}
            onClick={() => onNavigate('agent')}
            className="w-full aspect-[2/1] bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 rounded-3xl relative overflow-hidden shadow-elevation-8 p-6 flex flex-col justify-between group cursor-pointer"
        >
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-purple/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent-blue/15 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex justify-between items-start">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg">
                    <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" /> Partner Access
                    </span>
                </div>
                <div className="w-11 h-11 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center text-white shadow-elevation-4 group-hover:bg-white/20 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                </div>
            </div>

            <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white uppercase tracking-tight leading-tight mb-1.5">Agent<br/>Hub</h2>
                <p className="text-white/70 text-xs font-medium max-w-[160px] leading-relaxed">Manage portfolio & wallet</p>
            </div>
        </MotionDiv>

        {/* SERVICES GRID - Premium Cards */}
        <div className="grid grid-cols-2 gap-3">
            {/* Store Card */}
            <MotionDiv
                whileTap={{ scale: 0.96 }}
                whileHover={{ y: -4 }}
                onClick={() => onNavigate('store')}
                className="bg-white rounded-2xl shadow-elevation-4 flex flex-col justify-between h-40 relative overflow-hidden group border border-primary-100/50 cursor-pointer"
            >
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-accent-purple/10 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
                <div className="p-4 relative z-10">
                    <div className="w-11 h-11 bg-accent-purple/20 rounded-xl flex items-center justify-center text-accent-purple mb-3">
                        <Smartphone className="w-5 h-5 font-bold" />
                    </div>
                    <h3 className="text-sm font-bold text-primary-900 uppercase tracking-tight leading-tight">Premium<br/>Store</h3>
                </div>
                <p className="px-4 pb-4 text-xs font-medium text-primary-500 relative z-10">Tech Gadgets</p>
            </MotionDiv>

            {/* Data Card */}
            <MotionDiv
                whileTap={{ scale: 0.96 }}
                whileHover={{ y: -4 }}
                onClick={() => onNavigate('data')}
                className="bg-gradient-to-br from-accent-blue to-accent-blue/80 rounded-2xl shadow-elevation-4 flex flex-col justify-between h-40 relative overflow-hidden group cursor-pointer"
            >
                <div className="absolute -left-8 -bottom-8 w-28 h-28 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
                <div className="p-4 relative z-10">
                    <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white mb-3">
                        <Wifi className="w-5 h-5 font-bold" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight leading-tight">Instant<br/>Data</h3>
                </div>
                <p className="px-4 pb-4 text-xs font-medium text-white/80 relative z-10">Fast Bundles</p>
            </MotionDiv>
        </div>

        {/* DOWNLOAD APP CARD - Premium CTA */}
        <MotionDiv
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -4 }}
            onClick={() => window.open('https://play.google.com/store/apps/details?id=online.saukimart.twa', '_blank')}
            className="w-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-3xl shadow-elevation-8 overflow-hidden cursor-pointer group relative"
        >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 p-6 flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-xs font-black text-white/80 uppercase tracking-widest mb-1.5">Premium Experience</p>
                    <h3 className="text-2xl font-black text-white mb-1 leading-tight">Get Sauki Mart<br/>App Now</h3>
                    <p className="text-white/90 text-xs font-semibold mb-3">Native app + offline access + push notifications</p>
                    
                    {/* Google Play Badge Style Button */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg font-semibold text-sm text-slate-900 group-hover:shadow-2xl transition-all">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 3h18v18H3z" fill="white"/>
                            <path d="M3 3l18 18M21 3L3 21" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span className="font-bold">Download Now</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
                
                {/* Phone Icon */}
                <div className="text-6xl ml-4 group-hover:scale-110 transition-transform duration-300 opacity-90">
                    📱
                </div>
            </div>
        </MotionDiv>

        {/* SUPPORT CARD */}
        <MotionDiv
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -4 }}
            onClick={() => setIsSupportOpen(true)}
            className="w-full bg-white p-4 rounded-2xl shadow-elevation-4 flex items-center justify-between cursor-pointer border border-primary-100/50 group"
        >
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center text-accent-green">
                    <ShieldCheck className="w-5 h-5 font-bold" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-primary-900 uppercase tracking-tight">Help & Support</h4>
                    <p className="text-xs font-medium text-primary-500 uppercase tracking-wide mt-0.5">Complaints • Contact</p>
                </div>
            </div>
            <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <ArrowRight className="w-4 h-4 text-primary-600" />
            </div>
        </MotionDiv>

        {/* PREMIUM FEATURES SHOWCASE */}
        <MotionDiv 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-gradient-to-br from-primary-900/5 to-accent-blue/5 rounded-3xl p-6 border border-primary-200/50 backdrop-blur-sm"
        >
          <p className="text-xs font-black uppercase text-primary-600 mb-4 tracking-widest">Why Choose Us</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '⚡', label: 'Instant', desc: 'Data in seconds' },
              { icon: '🔐', label: 'Secure', desc: 'Encrypted payments' },
              { icon: '💎', label: 'Best Rate', desc: 'Unbeatable prices' }
            ].map((item, idx) => (
              <MotionDiv 
                key={idx}
                whileTap={{ scale: 0.95 }}
                className="text-center p-3 rounded-xl bg-white/60 backdrop-blur border border-white/80 hover:bg-white hover:shadow-elevation-2 transition-all group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                <p className="text-xs font-black text-primary-900 uppercase tracking-tight leading-tight">{item.label}</p>
                <p className="text-[10px] text-primary-500 font-medium mt-1">{item.desc}</p>
              </MotionDiv>
            ))}
          </div>
        </MotionDiv>

        {/* BOTTOM FOOTER */}
        <div className="text-center pt-2 pb-4">
          <p className="text-xs font-semibold text-primary-400 uppercase tracking-widest">Secured & Trusted</p>
        </div>
      </div>

      {/* SUPPORT BOTTOM SHEET */}
      <BottomSheet 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
        title="Help & Support"
      >
        <Support />
      </BottomSheet>
    </div>
  );
};

