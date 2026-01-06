
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Wifi, Phone, FileText, MessageCircle, Bell, Menu, CheckCircle, Users, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { LegalDocs } from './LegalDocs';
import { SideMenu } from '../SideMenu';
import { cn } from '../../lib/utils';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'contact' | 'docs'>('contact');
  const [systemMessage, setSystemMessage] = useState<{ content: string; type: string } | null>(null);

  useEffect(() => {
    fetch('/api/system/message').then(res => res.json()).then(d => d && d.content && setSystemMessage(d)).catch(() => {});
  }, []);

  const MotionDiv = motion.div as any;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f8fafc] text-slate-900 font-sans relative overflow-hidden">
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onOpenLegal={() => { setIsMenuOpen(false); setIsSupportOpen(true); setActiveTab('docs'); }} 
        onAgentLogin={() => { setIsMenuOpen(false); onNavigate('agent'); }}
      />
      
      {/* 1. Ultra-Compact Header */}
      <header className="px-6 pt-safe mt-4 mb-2 flex justify-between items-center shrink-0 z-20">
         <div>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs">SM</div>
                <div>
                    <h1 className="text-lg font-black tracking-tighter leading-none text-slate-900">SAUKI MART</h1>
                    <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Premium Hub</p>
                </div>
            </div>
         </div>
         <button onClick={() => setIsMenuOpen(true)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 active:scale-90 transition-transform">
             <Menu className="w-5 h-5 text-slate-900" />
         </button>
      </header>

      {/* 2. Main Content - Flex-1 to occupy all remaining space */}
      <div className="flex-1 flex flex-col px-5 pb-safe min-h-0">
            
            {/* System Ticker */}
            <div className="shrink-0 mb-3">
                {systemMessage ? (
                    <div className={cn("overflow-hidden rounded-xl py-2 px-3 flex items-center shadow-sm border relative",
                        systemMessage.type === 'alert' ? "bg-red-50 border-red-100 text-red-700" : "bg-blue-50 border-blue-100 text-blue-700"
                    )}>
                        <Bell className="w-3 h-3 mr-2 shrink-0 animate-pulse" />
                        <div className="flex-1 overflow-hidden relative h-4">
                             <MotionDiv 
                                initial={{ x: "100%" }} animate={{ x: "-100%" }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                                className="whitespace-nowrap font-bold text-[10px] uppercase tracking-wide absolute top-0"
                            >
                                {systemMessage.content} • {systemMessage.content}
                            </MotionDiv>
                        </div>
                    </div>
                ) : (
                    <div className="h-8 bg-slate-100/50 rounded-xl animate-pulse"></div>
                )}
            </div>

            {/* Smart Bento Grid - Calculates height to fill available space */}
            <div className="flex-1 grid grid-cols-2 grid-rows-6 gap-3 min-h-0 mb-20">
              
              {/* Agent Hub - Large Card (2 rows) */}
              <MotionDiv whileTap={{ scale: 0.98 }} onClick={() => onNavigate('agent')} className="col-span-2 row-span-2 bg-slate-900 rounded-[1.5rem] p-5 relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-slate-200 group cursor-pointer">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                 <div className="relative z-10 flex justify-between items-start">
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white text-[9px] font-black uppercase tracking-widest">Partner Access</div>
                    <Users className="text-white/50 w-5 h-5" />
                 </div>
                 <div className="relative z-10">
                    <h3 className="text-2xl font-black text-white tracking-tighter mb-1">AGENT TERMINAL</h3>
                    <p className="text-slate-400 text-[10px] font-medium leading-tight max-w-[80%]">Manage liquidity, vending, and earnings via secure gateway.</p>
                 </div>
              </MotionDiv>

              {/* Gadget Store (2 rows) */}
              <MotionDiv whileTap={{ scale: 0.98 }} onClick={() => onNavigate('store')} className="col-span-1 row-span-2 bg-white rounded-[1.5rem] p-4 relative overflow-hidden border border-slate-100 shadow-lg flex flex-col justify-between group">
                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                    <Smartphone className="w-4 h-4 text-slate-900" />
                </div>
                <div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Premium<br/>Store</h3>
                   <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors flex items-center gap-1">Shop <ArrowRight className="w-2 h-2" /></span>
                </div>
                <Smartphone className="absolute -right-4 -bottom-4 w-20 h-20 text-slate-50 rotate-12 group-hover:scale-110 transition-transform duration-500" />
              </MotionDiv>

              {/* Data Bundle (2 rows) */}
              <MotionDiv whileTap={{ scale: 0.98 }} onClick={() => onNavigate('data')} className="col-span-1 row-span-2 bg-blue-600 rounded-[1.5rem] p-4 relative overflow-hidden shadow-lg shadow-blue-200 flex flex-col justify-between group">
                <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-2">
                    <Wifi className="w-4 h-4 text-white" />
                </div>
                <div className="relative z-10">
                   <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1">Instant<br/>Data</h3>
                   <span className="text-[8px] font-bold text-blue-200 uppercase tracking-widest group-hover:text-white transition-colors flex items-center gap-1">Topup <ArrowRight className="w-2 h-2" /></span>
                </div>
                <Wifi className="absolute -right-4 -bottom-4 w-20 h-20 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
              </MotionDiv>

              {/* Support & Legal (1 row) */}
              <MotionDiv whileTap={{ scale: 0.98 }} onClick={() => setIsSupportOpen(true)} className="col-span-2 row-span-1 bg-white rounded-[1.25rem] px-5 flex items-center justify-between border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-green-50 rounded-lg text-green-600"><ShieldCheck className="w-4 h-4" /></div>
                      <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase">Resources & Legal</h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Support • Docs • Compliance</p>
                      </div>
                  </div>
                  <div className="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center"><ArrowRight className="w-3 h-3 text-slate-400" /></div>
              </MotionDiv>

              {/* Trust Badge Footer (1 row) */}
              <div className="col-span-2 row-span-1 flex flex-col items-center justify-end pb-2">
                  <div className="flex items-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                      <img src="/smedan.png" className="h-6 w-auto object-contain" />
                      <div className="h-4 w-[1px] bg-slate-300"></div>
                      <img src="/coat.png" className="h-6 w-auto object-contain" />
                  </div>
              </div>

            </div>
      </div>

      <BottomSheet isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} title="Resources">
          <div className="bg-slate-100 p-1 rounded-2xl flex mb-6">
              <button onClick={() => setActiveTab('contact')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all", activeTab === 'contact' ? "bg-white text-slate-900 shadow-md" : "text-slate-500")}>Contact Hub</button>
              <button onClick={() => setActiveTab('docs')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all", activeTab === 'docs' ? "bg-white text-slate-900 shadow-md" : "text-slate-500")}>Documents</button>
          </div>
          {activeTab === 'contact' ? (
              <div className="space-y-3">
                  <ContactItem icon={Phone} label="Support Line 1" value="08061934056" action={() => window.open('tel:08061934056')} />
                  <ContactItem icon={Phone} label="Support Line 2" value="07044647081" action={() => window.open('tel:07044647081')} />
                  <ContactItem icon={MessageCircle} label="WhatsApp Priority" value="Start Chat" action={() => window.open('https://wa.me/2348061934056')} highlight />
                  <ContactItem icon={FileText} label="Email" value="saukidatalinks@gmail.com" action={() => window.open('mailto:saukidatalinks@gmail.com')} />
              </div>
          ) : ( <LegalDocs /> )}
      </BottomSheet>
    </div>
  );
};

const ContactItem = ({ icon: Icon, label, value, action, highlight }: any) => (
    <button onClick={action} className={cn("w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-95", highlight ? "bg-green-50 border-green-100" : "bg-white border-slate-100")}>
        <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", highlight ? "bg-green-500 text-white shadow-lg shadow-green-200" : "bg-slate-50 text-slate-600")}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="text-left">
                <p className={cn("text-[8px] font-bold uppercase tracking-widest", highlight ? "text-green-600" : "text-slate-400")}>{label}</p>
                <p className={cn("text-sm font-black tracking-tight", highlight ? "text-green-900" : "text-slate-900")}>{value}</p>
            </div>
        </div>
        <div className={cn("p-1.5 rounded-full", highlight ? "bg-white text-green-600" : "bg-slate-50 text-slate-400")}><ArrowRight className="w-3 h-3" /></div>
    </button>
);
