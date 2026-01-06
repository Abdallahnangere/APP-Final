
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

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50 relative overflow-hidden font-sans">
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onOpenLegal={() => { setIsMenuOpen(false); setIsSupportOpen(true); setActiveTab('docs'); }} 
        onAgentLogin={() => { setIsMenuOpen(false); onNavigate('agent'); }}
      />
      
      {/* Header - Compact */}
      <header className="px-6 pt-safe top-0 z-20 flex justify-between items-end bg-transparent mt-6 mb-2 shrink-0">
         <div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">SAUKI MART</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Premium Hub</p>
         </div>
         <button onClick={() => setIsMenuOpen(true)} className="p-2 bg-white rounded-full shadow-sm active:scale-95 transition-transform border border-slate-100">
             <Menu className="w-5 h-5 text-slate-900" />
         </button>
      </header>

      {/* Main Content - Flex Column to fill space without scroll */}
      <div className="flex-1 flex flex-col px-5 pb-28 space-y-3 min-h-0">
            
            {/* System Broadcast */}
            {systemMessage && (
                <div className={`overflow-hidden rounded-xl p-2.5 flex items-center shadow-sm relative shrink-0 ${
                    systemMessage.type === 'alert' ? 'bg-red-50 text-red-900' :
                    systemMessage.type === 'warning' ? 'bg-amber-50 text-amber-900' :
                    'bg-blue-50 text-blue-900'
                }`}>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-current opacity-20"></div>
                    <Bell className="w-4 h-4 mr-3 opacity-70 shrink-0" />
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: "-100%" }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                        className="whitespace-nowrap font-bold text-[10px] uppercase tracking-wide"
                    >
                        {systemMessage.content} &nbsp; • &nbsp; {systemMessage.content}
                    </motion.div>
                </div>
            )}

            {/* Certification Badge */}
            <div className="flex justify-center shrink-0">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full w-fit shadow-sm border border-slate-100">
                    <CheckCircle className="w-3 h-3 text-green-500 fill-green-100" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">SMEDAN Certified</span>
                </div>
            </div>

            {/* Action Grid - Flex Grow to fill remaining space */}
            <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-3 min-h-0">
              
              {/* Row 1: Store & Data */}
              <motion.div
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate('store')}
                className="col-span-1 row-span-1 bg-white rounded-[1.5rem] p-4 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between group"
              >
                <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md">
                    <Smartphone className="w-4 h-4" />
                </div>
                <div className="relative z-10">
                   <h3 className="text-lg font-black leading-none tracking-tighter text-slate-900 mb-1">GADGET<br/>STORE</h3>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">Shop <ArrowRight className="w-2 h-2" /></p>
                </div>
                <Smartphone className="absolute -right-3 -bottom-3 w-20 h-20 text-slate-50 opacity-80 rotate-12 group-hover:scale-110 transition-transform" />
              </motion.div>

              <motion.div
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate('data')}
                className="col-span-1 row-span-1 bg-slate-900 rounded-[1.5rem] p-4 shadow-sm relative overflow-hidden flex flex-col justify-between group"
              >
                <div className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/10">
                    <Wifi className="w-4 h-4" />
                </div>
                <div className="relative z-10">
                   <h3 className="text-lg font-black leading-none tracking-tighter text-white mb-1">INSTANT<br/>DATA</h3>
                   <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">Topup <ArrowRight className="w-2 h-2" /></p>
                </div>
                <Wifi className="absolute -right-3 -bottom-3 w-20 h-20 text-white opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
              </motion.div>

              {/* Row 2: Agent Hub */}
              <motion.div
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('agent')}
                className="col-span-2 row-span-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[1.5rem] p-5 shadow-md relative overflow-hidden flex items-center justify-between group"
              >
                 <div className="relative z-10 flex flex-col justify-center h-full">
                    <div className="px-2 py-0.5 bg-white/20 backdrop-blur rounded text-[8px] font-black uppercase text-white tracking-widest w-fit mb-1">Partner</div>
                    <h3 className="text-2xl font-black tracking-tighter text-white">AGENT HUB</h3>
                    <p className="text-indigo-100 text-[10px] font-medium leading-none mt-1">Manage wallet & earnings.</p>
                 </div>
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                     <Users className="w-6 h-6 text-purple-600" />
                 </div>
              </motion.div>

              {/* Row 3: Contact & Docs */}
              <motion.div
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsSupportOpen(true)}
                className="col-span-2 row-span-1 bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden"
              >
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <FileText className="w-6 h-6" />
                  </div>
                  <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Contact & Docs</h3>
                      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Support • Legal • FAQ</p>
                  </div>
                  <ArrowRight className="ml-auto w-5 h-5 text-slate-300" />
              </motion.div>
            </div>

            {/* Footer Logos - Compact */}
            <div className="flex justify-center gap-6 opacity-30 grayscale pt-2 shrink-0">
                <img src="/smedan.png" className="h-6 w-auto object-contain" />
                <img src="/coat.png" className="h-6 w-auto object-contain" />
            </div>
      </div>

      <BottomSheet isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} title="Resources">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex mb-8">
              <button 
                onClick={() => setActiveTab('contact')}
                className={`flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'contact' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  Contact Hub
              </button>
              <button 
                onClick={() => setActiveTab('docs')}
                className={`flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'docs' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  Documents
              </button>
          </div>

          {activeTab === 'contact' ? (
              <div className="space-y-4">
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
        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-95 ${highlight ? 'bg-green-50 border-green-100' : 'bg-white border-slate-100'}`}
    >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${highlight ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-slate-50 text-slate-600'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="text-left">
                <p className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-green-600' : 'text-slate-400'}`}>{label}</p>
                <p className={`text-lg font-bold ${highlight ? 'text-green-900' : 'text-slate-900'} tracking-tight`}>{value}</p>
            </div>
        </div>
        <div className={`p-2 rounded-full ${highlight ? 'bg-white text-green-600' : 'bg-slate-50 text-slate-400'}`}>
            <ArrowRight className="w-4 h-4" />
        </div>
    </button>
);
