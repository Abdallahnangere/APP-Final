
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
    <div className="h-screen bg-gradient-to-br from-[#FDFAF4] via-white to-[#FFF8F0] flex flex-col overflow-hidden">
      {/* Subtle Islamic pattern overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l7.5 7.5L30 15l-7.5-7.5L30 0zm0 30l7.5 7.5L30 45l-7.5-7.5L30 30zM0 30l7.5 7.5L0 45l-7.5-7.5L0 30zm30 0l7.5 7.5L30 45l-7.5-7.5L30 30zm30 0l7.5 7.5L60 45l-7.5-7.5L60 30zM30 30l7.5-7.5L45 30l-7.5 7.5L30 30z' fill='%23D4AF37' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }}></div>

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

      {/* HEADER - Apple Clean Style */}
      <header className="px-6 pt-8 pb-6 flex justify-between items-center z-10 shrink-0 relative">
        {/* Decorative crescent */}
        <MotionDiv
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 left-4 opacity-20"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C12 2 7 4 7 10C7 16 12 18 12 18C12 18 9 16 9 10C9 4 12 2 12 2Z" fill="#D4AF37"/>
            <circle cx="16" cy="6" r="1.5" fill="#D4AF37"/>
          </svg>
        </MotionDiv>

        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-[-0.02em]">Sauki Mart</h1>
            <p className="text-[10px] font-medium text-[#8B7355] tracking-[0.15em] uppercase mt-0.5">Ramadan Kareem</p>
          </div>
        </div>

        <MotionDiv
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(true)}
          className="w-11 h-11 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-[#E5E7EB] flex items-center justify-center active:scale-90 transition-all cursor-pointer hover:bg-white hover:shadow-md"
        >
          <Menu className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1.5} />
        </MotionDiv>
      </header>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-2 space-y-6 pb-24">
        
        {/* TICKER (Marquee) - Refined */}
        {ticker && (
           <MotionDiv 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className={cn(
               "relative overflow-hidden rounded-2xl p-4 flex items-center backdrop-blur-md border",
               ticker.type === 'alert' ? "bg-red-50/80 border-red-200/40 text-red-800" 
               : ticker.type === 'warning' ? "bg-amber-50/80 border-amber-200/40 text-amber-800"
               : "bg-blue-50/80 border-blue-200/40 text-blue-800"
             )}>
             <div className="p-2 rounded-lg mr-3 shrink-0">
               <Bell className="w-4 h-4" strokeWidth={1.5} />
             </div>
             <div className="flex-1 overflow-hidden h-5 relative">
                <MotionDiv 
                  animate={{ x: ["100%", "-100%"] }} 
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  className="absolute whitespace-nowrap text-xs font-medium tracking-wide pt-0.5"
                >
                  {ticker.content} • {ticker.content} • {ticker.content}
                </MotionDiv>
             </div>
           </MotionDiv>
        )}

        {/* HERO CARD - AGENT (Elegant Gradient) */}
        <MotionDiv 
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            onClick={() => onNavigate('agent')}
            className="w-full aspect-[2/1] bg-gradient-to-br from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] rounded-[28px] relative overflow-hidden shadow-xl p-8 flex flex-col justify-between group cursor-pointer border border-white/5"
        >
            {/* Subtle gold accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex justify-between items-start">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                    <span className="text-[10px] font-medium text-white/90 uppercase tracking-[0.15em] flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" strokeWidth={1.5} /> Partner Access
                    </span>
                </div>
                <div className="w-11 h-11 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:bg-white/15 transition-colors border border-white/10">
                    <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                </div>
            </div>

            <div className="relative z-10">
                <h2 className="text-3xl font-semibold text-white tracking-[-0.02em] leading-tight mb-2">Agent Hub</h2>
                <p className="text-white/60 text-sm font-normal max-w-[180px] leading-relaxed">Manage your portfolio and wallet</p>
            </div>
        </MotionDiv>

        {/* SERVICES GRID - Minimal Cards */}
        <div className="grid grid-cols-2 gap-4">
            {/* Store Card */}
            <MotionDiv
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -2 }}
                onClick={() => onNavigate('store')}
                className="bg-white/80 backdrop-blur-md rounded-[24px] shadow-sm flex flex-col justify-between h-44 relative overflow-hidden group border border-[#E5E7EB]/50 cursor-pointer"
            >
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-purple-100/40 rounded-full group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>
                <div className="p-6 relative z-10">
                    <div className="w-12 h-12 bg-purple-100/60 rounded-2xl flex items-center justify-center text-purple-600 mb-4 border border-purple-200/30">
                        <Smartphone className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base font-semibold text-[#1A1A1A] tracking-[-0.01em] leading-tight mb-1">Premium Store</h3>
                    <p className="text-xs font-normal text-[#6B6B6B]">Tech Gadgets</p>
                </div>
            </MotionDiv>

            {/* Data Card */}
            <MotionDiv
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -2 }}
                onClick={() => onNavigate('data')}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[24px] shadow-sm flex flex-col justify-between h-44 relative overflow-hidden group cursor-pointer"
            >
                <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>
                <div className="p-6 relative z-10">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white mb-4 border border-white/20">
                        <Wifi className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base font-semibold text-white tracking-[-0.01em] leading-tight mb-1">Instant Data</h3>
                    <p className="text-xs font-normal text-white/70">Fast Bundles</p>
                </div>
            </MotionDiv>
        </div>

        {/* SUPPORT CARD - Refined */}
        <MotionDiv
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -2 }}
            onClick={() => setIsSupportOpen(true)}
            className="w-full bg-white/80 backdrop-blur-md p-5 rounded-[24px] shadow-sm flex items-center justify-between cursor-pointer border border-[#E5E7EB]/50 group"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100/60 rounded-2xl flex items-center justify-center text-green-600 border border-green-200/30">
                    <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                    <h4 className="text-base font-semibold text-[#1A1A1A] tracking-[-0.01em] mb-0.5">Help & Support</h4>
                    <p className="text-xs font-normal text-[#6B6B6B]">Contact • Complaints</p>
                </div>
            </div>
            <div className="w-10 h-10 bg-[#F9FAFB] rounded-xl flex items-center justify-center group-hover:bg-[#F3F4F6] transition-colors">
                <ArrowRight className="w-4 h-4 text-[#6B6B6B]" strokeWidth={1.5} />
            </div>
        </MotionDiv>

        {/* FEATURES SHOWCASE - Apple Style */}
        <MotionDiv 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-gradient-to-br from-[#FDFAF4] to-[#FFF8F0] rounded-[28px] p-8 border border-[#D4AF37]/10 backdrop-blur-sm"
        >
          <h3 className="text-sm font-semibold text-[#8B7355] mb-6 tracking-[-0.01em]">Why Choose Us</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '⚡', label: 'Instant', desc: 'Fast delivery' },
              { icon: '🔐', label: 'Secure', desc: 'Protected' },
              { icon: '💎', label: 'Premium', desc: 'Best quality' }
            ].map((item, idx) => (
              <MotionDiv 
                key={idx}
                whileTap={{ scale: 0.95 }}
                className="text-center p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 hover:bg-white hover:shadow-sm transition-all group"
              >
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                <p className="text-xs font-semibold text-[#1A1A1A] tracking-[-0.01em] mb-1">{item.label}</p>
                <p className="text-[10px] text-[#6B6B6B] font-normal">{item.desc}</p>
              </MotionDiv>
            ))}
          </div>
        </MotionDiv>

        {/* Ramadan blessing footer */}
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/30"></div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1C8 1 5 2 5 6C5 10 8 11 8 11C8 11 6.5 10 6.5 6C6.5 2 8 1 8 1Z" fill="#D4AF37" opacity="0.4"/>
              <circle cx="10.5" cy="3.5" r="1" fill="#D4AF37" opacity="0.6"/>
            </svg>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/30"></div>
          </div>
          <p className="text-xs font-medium text-[#8B7355] tracking-wide">Ramadan Mubarak</p>
          <p className="text-[10px] font-normal text-[#6B6B6B] mt-1">Secured & Trusted</p>
        </MotionDiv>
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
