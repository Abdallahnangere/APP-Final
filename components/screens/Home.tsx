
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Wifi, Phone, MessageCircle, Bell, Menu, ArrowRight, ShieldCheck, Users, Mail } from 'lucide-react';
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
      
      {/* Header */}
      <header className="px-6 pt-safe mt-6 mb-4 flex justify-between items-start shrink-0 z-20">
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 border border-slate-50 p-1">
                <img src="/logo.png" className="w-full h-full object-contain" alt="Sauki Logo" />
            </div>
            <div>
                <h1 className="text-2xl font-black tracking-tighter leading-none text-slate-900 uppercase">SAUKI MART</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-tight mt-1 max-w-[200px]">
                    Subsidiary of Sauki Data Links<br/>
                    <span className="text-blue-600">Government Certified SME by SMEDAN</span>
                </p>
            </div>
         </div>
         <button onClick={() => setIsMenuOpen(true)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg shadow-slate-100 border border-slate-50 active:scale-90 transition-transform mt-2">
             <Menu className="w-5 h-5 text-slate-900" />
         </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-5 pb-safe min-h-0">
            
            {/* Ticker */}
            <div className="shrink-0 mb-4">
                {systemMessage ? (
                    <div className={cn("overflow-hidden rounded-2xl py-3 px-4 flex items-center shadow-sm border relative backdrop-blur-sm",
                        systemMessage.type === 'alert' ? "bg-red-50/80 border-red-100 text-red-700" : "bg-blue-50/80 border-blue-100 text-blue-700"
                    )}>
                        <div className="p-1.5 bg-white rounded-full mr-3 shadow-sm shrink-0">
                            <Bell className="w-3 h-3 fill-current" />
                        </div>
                        <div className="flex-1 overflow-hidden relative h-4">
                             <MotionDiv 
                                initial={{ x: "100%" }} animate={{ x: "-100%" }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                                className="whitespace-nowrap font-bold text-[10px] uppercase tracking-wide absolute top-0"
                            >
                                {systemMessage.content} • {systemMessage.content} • {systemMessage.content}
                            </MotionDiv>
                        </div>
                    </div>
                ) : (
                    <div className="h-12 bg-slate-100/50 rounded-2xl animate-pulse"></div>
                )}
            </div>

            {/* Bento Grid */}
            <div className="flex-1 grid grid-cols-2 grid-rows-6 gap-4 min-h-0 mb-24">
              
              <MotionDiv whileTap={{ scale: 0.98 }} onClick={() => onNavigate('agent')} className="col-span-2 row-span-2 bg-slate-900 rounded-[2rem] p-6 relative overflow-hidden shadow-2xl shadow-slate-200 group cursor-pointer border border-slate-800 flex flex-col justify-between">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                 
                 <div className="relative z-10 flex justify-between items-start">
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-3 h-3" /> Partner Access
                    </div>
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white -rotate-45" />
                    </div>
                 </div>

                 <div className="relative z-10 mt-auto">
                    <h3 className="text-3xl font-black text-white tracking-tighter mb-1">AGENT HUB</h3>
                    <p className="text-slate-400 text-[11px] font-medium leading-tight max-w-[90%]">
                        Manage liquidity, perform bulk actions, and view analytics securely.
                    </p>
                 </div>
              </MotionDiv>

              <MotionDiv whileTap={{ scale: 0.98 }} onClick={() => onNavigate('store')} className="col-span-1 row-span-3 bg-white rounded-[2rem] p-5 relative overflow-hidden border border-slate-100 shadow-xl shadow-slate-100 flex flex-col justify-between group">
                <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center mb-2">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                </div>
                <div className="relative z-10">
                   <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-2">Premium<br/>Store</h3>
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-purple-600 transition-colors flex items-center gap-1">Shop Now <ArrowRight className="w-2 h-2" /></span>
                </div>
                <Smartphone className="absolute -right-5 -bottom-5 w-24 h-24 text-slate-50 rotate-12 group-hover:scale-110 transition-transform duration-500" />
              </MotionDiv>

              <MotionDiv whileTap={{ scale: 0.98 }} onClick={() => onNavigate('data')} className="col-span-1 row-span-3 bg-blue-600 rounded-[2rem] p-5 relative overflow-hidden shadow-xl shadow-blue-200 flex flex-col justify-between group">
                <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-2">
                    <Wifi className="w-5 h-5 text-white" />
                </div>
                <div className="relative z-10">
                   <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-2">Instant<br/>Data</h3>
                   <span className="text-[9px] font-bold text-blue-200 uppercase tracking-widest group-hover:text-white transition-colors flex items-center gap-1">Topup <ArrowRight className="w-2 h-2" /></span>
                </div>
                <Wifi className="absolute -right-5 -bottom-5 w-24 h-24 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
              </MotionDiv>

              <MotionDiv whileTap={{ scale: 0.98 }} onClick={() => setIsSupportOpen(true)} className="col-span-2 row-span-1 bg-white rounded-[1.5rem] px-5 flex items-center justify-between border border-slate-100 shadow-sm mt-2">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-xl text-green-600"><ShieldCheck className="w-4 h-4" /></div>
                      <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase">Resources & Legal</h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Contact • Support • Docs</p>
                      </div>
                  </div>
                  <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center"><ArrowRight className="w-3 h-3 text-slate-400" /></div>
              </MotionDiv>

            </div>
      </div>

      <BottomSheet isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} title="Resources">
          <div className="bg-slate-100 p-1 rounded-2xl flex mb-6">
              <button onClick={() => setActiveTab('contact')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all", activeTab === 'contact' ? "bg-white text-slate-900 shadow-md" : "text-slate-500")}>Contact Hub</button>
              <button onClick={() => setActiveTab('docs')} className={cn("flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all", activeTab === 'docs' ? "bg-white text-slate-900 shadow-md" : "text-slate-500")}>Documents</button>
          </div>
          {activeTab === 'contact' ? (
              <div className="space-y-4">
                  <SupportLineCard label="Primary Support" number="08061934056" />
                  <SupportLineCard label="Secondary Support" number="07044647081" />
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <Mail className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Official Email</p>
                              <p className="text-sm font-bold text-slate-900 lowercase">saukidatalinks@gmail.com</p>
                          </div>
                      </div>
                      <button onClick={() => window.open('mailto:saukidatalinks@gmail.com')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase">Email Us</button>
                  </div>
              </div>
          ) : ( <LegalDocs /> )}
      </BottomSheet>
    </div>
  );
};

const SupportLineCard = ({ label, number }: { label: string, number: string }) => {
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                <span className="text-sm font-black text-slate-900">{number}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => window.open(`tel:${number}`)} className="h-10 bg-slate-100 rounded-xl flex items-center justify-center gap-2 text-slate-700 font-bold text-xs uppercase hover:bg-slate-200 active:scale-95 transition-all">
                    <Phone className="w-4 h-4" /> Call Now
                </button>
                <button onClick={() => window.open(`https://wa.me/234${number.substring(1)}`)} className="h-10 bg-green-50 rounded-xl flex items-center justify-center gap-2 text-green-700 font-bold text-xs uppercase hover:bg-green-100 active:scale-95 transition-all">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                </button>
            </div>
        </div>
    );
}
