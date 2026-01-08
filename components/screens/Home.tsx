
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, Bell, ArrowRight, Smartphone, Wifi, 
  ShieldCheck, Users, Zap
} from 'lucide-react';
import { toPng } from 'html-to-image';

import { SideMenu } from '../SideMenu';
import { BottomSheet } from '../ui/BottomSheet';
import { Support } from './Support';
import { SharedReceipt } from '../SharedReceipt';
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
    <div className="h-screen bg-[#F2F2F7] flex flex-col overflow-hidden">
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onOpenLegal={() => { setIsMenuOpen(false); setIsSupportOpen(true); }}
        onOpenHistory={() => { setIsMenuOpen(false); onNavigate('history'); }}
        onAgentLogin={() => { setIsMenuOpen(false); onNavigate('agent'); }}
      />
      
      {/* Hidden Receipt Generator */}
      {receiptTx && (
        <SharedReceipt ref={receiptRef} transaction={generateReceiptData(receiptTx)} />
      )}

      {/* PREMIUM HEADER - iOS Large Title Style */}
      <header className="px-6 pt-safe mt-6 flex justify-between items-center z-10 shrink-0 mb-2">
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Welcome to</p>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">SAUKI MART</h1>
        </div>
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="w-12 h-12 bg-white rounded-full shadow-lg shadow-slate-200/50 flex items-center justify-center active:scale-90 transition-transform"
        >
          <Menu className="w-6 h-6 text-slate-900 stroke-[2.5px]" />
        </button>
      </header>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-32">
        
        {/* TICKER (Marquee) */}
        {ticker && (
           <div className={cn(
             "relative overflow-hidden rounded-[1.5rem] p-4 flex items-center shadow-sm border mb-2",
             ticker.type === 'alert' ? "bg-red-50 border-red-100 text-red-700" : "bg-white border-slate-100 text-slate-600"
           )}>
             <div className="p-2 bg-slate-100 rounded-full mr-3 shrink-0">
               <Bell className="w-4 h-4 fill-slate-900 text-slate-900" />
             </div>
             <div className="flex-1 overflow-hidden h-5 relative">
                <MotionDiv 
                  animate={{ x: ["100%", "-100%"] }} 
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  className="absolute whitespace-nowrap text-xs font-bold uppercase tracking-wide pt-0.5"
                >
                  {ticker.content} • {ticker.content} • {ticker.content}
                </MotionDiv>
             </div>
           </div>
        )}

        {/* HERO CARD - AGENT */}
        <MotionDiv 
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('agent')}
            className="w-full aspect-[2/1] bg-slate-900 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-slate-300/50 p-8 flex flex-col justify-between group cursor-pointer"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500 rounded-full blur-[60px] opacity-20"></div>
            
            <div className="relative z-10 flex justify-between items-start">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-3 h-3" /> Partner Access
                    </span>
                </div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-lg">
                    <ArrowRight className="w-5 h-5 -rotate-45" />
                </div>
            </div>

            <div className="relative z-10">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">Agent<br/>Hub</h2>
                <p className="text-white/60 text-xs font-medium max-w-[150px]">Manage resale portfolio and liquid wallet.</p>
            </div>
        </MotionDiv>

        {/* SERVICES GRID */}
        <div className="grid grid-cols-2 gap-4">
            {/* Store */}
            <MotionDiv
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('store')}
                className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col justify-between h-48 relative overflow-hidden group"
            >
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4 relative z-10">
                    <Smartphone className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Premium<br/>Store</h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gadgets</span>
                </div>
            </MotionDiv>

            {/* Data */}
            <MotionDiv
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('data')}
                className="bg-blue-600 p-6 rounded-[2.5rem] shadow-xl shadow-blue-200/50 flex flex-col justify-between h-48 relative overflow-hidden group"
            >
                <div className="absolute -left-6 -top-6 w-24 h-24 bg-blue-500 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white mb-4 relative z-10">
                    <Wifi className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none mb-1">Instant<br/>Data</h3>
                    <span className="text-[9px] font-bold text-blue-100 uppercase tracking-widest">Bundles</span>
                </div>
            </MotionDiv>
        </div>

        {/* SUPPORT BAR */}
        <MotionDiv
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsSupportOpen(true)}
            className="w-full bg-white p-5 rounded-[2rem] shadow-lg shadow-slate-100 flex items-center justify-between cursor-pointer"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase">Support & Legal</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Complaints • Contact</p>
                </div>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
        </MotionDiv>

        <div className="text-center pt-4">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Secured by Sauki Data Links</p>
        </div>
      </div>

      {/* SUPPORT BOTTOM SHEET (Replaces old logic) */}
      <BottomSheet 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
        title="Support Center"
      >
        <Support />
      </BottomSheet>
    </div>
  );
};
