
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Wifi, Phone, FileText, MessageCircle, Bell, Menu, CheckCircle, Users, ArrowRight } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { LegalDocs } from './LegalDocs';
import { SideMenu } from '../SideMenu';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'contact' | 'docs'>('contact');
  const [systemMessage, setSystemMessage] = useState<{ content: string; type: string } | null>(null);

  useEffect(() => {
    fetch('/api/system/message')
      .then(res => res.json())
      .then(data => {
         if(data && data.content) setSystemMessage(data);
      })
      .catch(() => {});
  }, []);

  const MotionDiv = motion.div as any;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50 relative overflow-hidden font-sans">
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onOpenLegal={() => { setIsMenuOpen(false); setIsSupportOpen(true); setActiveTab('docs'); }} 
        onAgentLogin={() => { setIsMenuOpen(false); onNavigate('agent'); }}
      />
      
      {/* Header - Ultra Compact */}
      <header className="px-5 pt-safe top-0 z-20 flex justify-between items-end bg-transparent mt-2 mb-2 shrink-0">
         <div>
            <h1 className="text-lg font-black tracking-tighter text-slate-900 leading-none">SAUKI MART</h1>
            <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest mt-0.5">Premium Hub</p>
         </div>
         <button onClick={() => setIsMenuOpen(true)} className="p-1.5 bg-white rounded-full shadow-sm active:scale-95 transition-transform border border-slate-100">
             <Menu className="w-4 h-4 text-slate-900" />
         </button>
      </header>

      {/* Main Content - Flex Column to fill space without scroll */}
      <div className="flex-1 flex flex-col px-4 min-h-0">
            
            {/* System Broadcast */}
            {systemMessage && (
                <div className={`mb-2 overflow-hidden rounded-lg p-1.5 flex items-center shadow-sm relative shrink-0 ${
                    systemMessage.type === 'alert' ? 'bg-red-50 text-red-900' :
                    systemMessage.type === 'warning' ? 'bg-amber-50 text-amber-900' :
                    'bg-blue-50 text-blue-900'
                }`}>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-current opacity-20"></div>
                    <Bell className="w-3 h-3 mr-2 opacity-70 shrink-0" />
                    <MotionDiv 
                        initial={{ x: "100%" }}
                        animate={{ x: "-100%" }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                        className="whitespace-nowrap font-bold text-[8px] uppercase tracking-wide"
                    >
                        {systemMessage.content} &nbsp; • &nbsp; {systemMessage.content}
                    </MotionDiv>
                </div>
            )}

            {/* Certification Badge */}
            <div className="flex justify-center shrink-0 mb-2">
                <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-full w-fit shadow-sm border border-slate-100">
                    <CheckCircle className="w-2.5 h-2.5 text-green-500 fill-green-100" />
                    <span className="text-[7px] font-bold uppercase tracking-wider text-slate-500">SMEDAN Certified</span>
                </div>
            </div>

            {/* Action Grid - Flex Grow to fill remaining space */}
            <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-3 min-h-0 pb-2">
              
              {/* Row 1: Store & Data */}
              <MotionDiv
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate('store')}
                className="col-span-1 row-span-1 bg-white rounded-2xl p-3 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between group"
              >
                <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-md">
                    <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div className="relative z-10 mt-1">
                   <h3 className="text-sm font-black leading-none tracking-tighter text-slate-900 mb-0.5">GADGET<br/>STORE</h3>
                   <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">Shop <ArrowRight className="w-2 h-2" /></p>
                </div>
                <Smartphone className="absolute -right-3 -bottom-3 w-16 h-16 text-slate-50 opacity-80 rotate-12 group-hover:scale-110 transition-transform" />
              </MotionDiv>

              <MotionDiv
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate('data')}
                className="col-span-1 row-span-1 bg-slate-900 rounded-2xl p-3 shadow-sm relative overflow-hidden flex flex-col justify-between group"
              >
                <div className="w-7 h-7 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/10">
                    <Wifi className="w-3.5 h-3.5" />
                </div>
                <div className="relative z-10 mt-1">
                   <h3 className="text-sm font-black leading-none tracking-tighter text-white mb-0.5">INSTANT<br/>DATA</h3>
                   <p className="text-[7px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">Topup <ArrowRight className="w-2 h-2" /></p>
                </div>
                <Wifi className="absolute -right-3 -bottom-3 w-16 h-16 text-white opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
              </MotionDiv>

              {/* Row 2: Agent Hub */}
              <MotionDiv
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('agent')}
                className="col-span-2 row-span-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 shadow-md relative overflow-hidden flex items-center justify-between group"
              >
                 <div className="relative z-10 flex flex-col justify-center h-full">
                    <div className="px-1.5 py-0.5 bg-white/20 backdrop-blur rounded text-[7px] font-black uppercase text-white tracking-widest w-fit mb-1">Partner</div>
                    <h3 className="text-lg font-black tracking-tighter text-white">AGENT HUB</h3>
                    <p className="text-indigo-100 text-[8px] font-medium leading-none mt-0.5">Manage wallet & earnings.</p>
                 </div>
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                     <Users className="w-5 h-5 text-purple-600" />
                 </div>
              </MotionDiv>

              {/* Row 3: Contact & Docs */}
              <MotionDiv
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsSupportOpen(true)}
                className="col-span-2 row-span-1 bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex items-center gap-3 relative overflow-hidden"
              >
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <FileText className="w-4 h-4" />
                  </div>
                  <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Contact & Docs</h3>
                      <p className="text-slate-400 text-[7px] font-bold uppercase tracking-widest">Support • Legal • FAQ</p>
                  </div>
                  <ArrowRight className="ml-auto w-4 h-4 text-slate-300" />
              </MotionDiv>
            </div>

            {/* Footer Logos - With space at bottom */}
            <div className="flex justify-center gap-5 opacity-30 grayscale pt-2 shrink-0 mb-[6.5rem]">
                <img src="/smedan.png" className="h-5 w-auto object-contain" />
                <img src="/coat.png" className="h-5 w-auto object-contain" />
            </div>
      </div>

      <BottomSheet isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} title="Resources">
          <div className="bg-slate-100 p-1 rounded-2xl flex mb-6">
              <button 
                onClick={() => setActiveTab('contact')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all ${activeTab === 'contact' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  Contact Hub
              </button>
              <button 
                onClick={() => setActiveTab('docs')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all ${activeTab === 'docs' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  Documents
              </button>
          </div>

          {activeTab === 'contact' ? (
              <div className="space-y-3">
                  <ContactItem 
                    icon={Phone} 
                    label="Customer Line 1" 
                    value="08061934056" 
                    action={() => window.open('tel:08061934056')} 
                  />
                  <ContactItem 
                    icon={Phone} 
                    label="Customer Line 2" 
                    value="07044647081" 
                    action={() => window.open('tel:07044647081')} 
                  />
                  <ContactItem 
                    icon={MessageCircle} 
                    label="WhatsApp Support" 
                    value="Chat Now" 
                    action={() => window.open('https://wa.me/2348061934056')} 
                    highlight
                  />
                  <ContactItem 
                    icon={FileText} 
                    label="Corporate Email" 
                    value="saukidatalinks@gmail.com" 
                    action={() => window.open('mailto:saukidatalinks@gmail.com')} 
                  />
              </div>
          ) : (
              <LegalDocs />
          )}
      </BottomSheet>
    </div>
  );
};

const ContactItem = ({ icon: Icon, label, value, action, highlight }: any) => (
    <button 
        onClick={action}
        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-95 ${highlight ? 'bg-green-50 border-green-100' : 'bg-white border-slate-100'}`}
    >
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${highlight ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-slate-50 text-slate-600'}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="text-left">
                <p className={`text-[8px] font-bold uppercase tracking-widest ${highlight ? 'text-green-600' : 'text-slate-400'}`}>{label}</p>
                <p className={`text-base font-bold ${highlight ? 'text-green-900' : 'text-slate-900'} tracking-tight`}>{value}</p>
            </div>
        </div>
        <div className={`p-1.5 rounded-full ${highlight ? 'bg-white text-green-600' : 'bg-slate-50 text-slate-400'}`}>
            <ArrowRight className="w-3 h-3" />
        </div>
    </button>
);
