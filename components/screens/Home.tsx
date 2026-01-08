
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, Bell, ArrowRight, Smartphone, Wifi, 
  ShieldCheck, Users, Mail, Phone, MessageCircle, 
  Download, History, Trash2
} from 'lucide-react';
import { toPng } from 'html-to-image';

import { SideMenu } from '../SideMenu';
import { BottomSheet } from '../ui/BottomSheet';
import { LegalDocs } from './LegalDocs';
import { SharedReceipt } from '../SharedReceipt';
import { cn, formatCurrency, generateReceiptData } from '../../lib/utils';
import { toast } from '../../lib/toast';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeSupportTab, setActiveSupportTab] = useState<'contact' | 'docs'>('contact');
  const [ticker, setTicker] = useState<{ content: string; type: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  
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
      
    // Load local history
    loadHistory();
  }, []);

  const loadHistory = () => {
      try {
          const raw = localStorage.getItem('sauki_user_history');
          if (raw) setHistory(JSON.parse(raw));
      } catch(e) {}
  };

  const clearHistory = () => {
      if(confirm("Clear all transaction history from this device?")) {
          localStorage.removeItem('sauki_user_history');
          setHistory([]);
          toast.success("History Cleared");
      }
  };
  
  const generateReceipt = (tx: any) => {
      setReceiptTx(tx);
      setTimeout(async () => {
          if (receiptRef.current) {
              const dataUrl = await toPng(receiptRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: '#ffffff' });
              const link = document.createElement('a');
              link.download = `RECEIPT-${tx.tx_ref}.png`;
              link.href = dataUrl;
              link.click();
              toast.success("Receipt Saved");
              setReceiptTx(null);
          }
      }, 500);
  };

  const MotionDiv = motion.div as any;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onOpenLegal={() => { setIsMenuOpen(false); setIsSupportOpen(true); setActiveSupportTab('docs'); }}
        onOpenHistory={() => { setIsMenuOpen(false); loadHistory(); setIsHistoryOpen(true); }}
        onAgentLogin={() => { setIsMenuOpen(false); onNavigate('agent'); }}
      />
      
      {/* Hidden Receipt Generator */}
      {receiptTx && (
        <SharedReceipt ref={receiptRef} transaction={generateReceiptData(receiptTx)} />
      )}

      {/* HEADER */}
      <header className="px-6 pt-safe mt-4 flex justify-between items-start z-10 sticky top-0 bg-[#f8fafc]/90 backdrop-blur-md pb-4 border-b border-slate-100/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-1">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">SAUKI MART</h1>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wide mt-1 leading-tight max-w-[200px]">
                Subsidiary of Sauki Data Links<br/>
                Government Certified SME by SMEDAN
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="w-10 h-10 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
      </header>

      <div className="p-6 space-y-6">
        
        {/* TICKER (Marquee Only) */}
        {ticker && (
           <div className={cn(
             "relative overflow-hidden rounded-2xl p-4 flex items-center shadow-sm border",
             ticker.type === 'alert' ? "bg-red-50 border-red-100 text-red-700" : "bg-blue-50 border-blue-100 text-blue-700"
           )}>
             <div className="p-2 bg-white rounded-full mr-3 shrink-0 shadow-sm">
               <Bell className="w-4 h-4 fill-current" />
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

        {/* MAIN BENTO GRID */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* 1. AGENT HUB (Large) */}
          <MotionDiv 
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('agent')}
            className="col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-6 relative overflow-hidden shadow-xl shadow-slate-200 min-h-[160px] flex flex-col justify-between group cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <span className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/5">
                Partner Access
              </span>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-white -rotate-45" />
              </div>
            </div>

            <div className="relative z-10">
              <Users className="w-8 h-8 text-white mb-3" />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Agent Hub</h3>
              <p className="text-[11px] text-slate-400 font-medium">Manage portfolio & liquidity</p>
            </div>
          </MotionDiv>

          {/* 2. STORE (Tall) */}
          <MotionDiv
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('store')}
            className="col-span-1 bg-white rounded-[2rem] p-5 shadow-lg border border-slate-100 flex flex-col justify-between min-h-[200px] group cursor-pointer relative overflow-hidden"
          >
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
             
             <div className="relative z-10">
               <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center mb-3 text-purple-600">
                 <Smartphone className="w-5 h-5" />
               </div>
               <h3 className="text-lg font-black text-slate-900 uppercase leading-none mb-1">Device<br/>Store</h3>
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Buy Gadgets</span>
             </div>

             <div className="relative z-10 mt-auto">
               <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center ml-auto">
                 <ArrowRight className="w-4 h-4 text-white" />
               </div>
             </div>
          </MotionDiv>

          {/* 3. DATA (Tall) */}
          <MotionDiv
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('data')}
            className="col-span-1 bg-blue-600 rounded-[2rem] p-5 shadow-xl shadow-blue-200 flex flex-col justify-between min-h-[200px] group cursor-pointer relative overflow-hidden"
          >
             <div className="absolute -left-4 -top-4 w-24 h-24 bg-blue-500 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50"></div>
             
             <div className="relative z-10">
               <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-3 text-white">
                 <Wifi className="w-5 h-5" />
               </div>
               <h3 className="text-lg font-black text-white uppercase leading-none mb-1">Instant<br/>Data</h3>
               <span className="text-[9px] font-bold text-blue-100 uppercase tracking-widest">Buy Bundles</span>
             </div>

             <div className="relative z-10 mt-auto">
               <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center ml-auto">
                 <ArrowRight className="w-4 h-4 text-blue-600" />
               </div>
             </div>
          </MotionDiv>

          {/* 4. SUPPORT (Wide) */}
          <MotionDiv
            whileTap={{ scale: 0.98 }}
            onClick={() => { setIsSupportOpen(true); setActiveSupportTab('contact'); }}
            className="col-span-2 bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase">Support & Legal</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Resolutions • Docs</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300" />
          </MotionDiv>

        </div>

        <div className="text-center pb-8 pt-4">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Secured by Sauki Data Links</p>
        </div>
      </div>

      {/* SUPPORT & LEGAL BOTTOM SHEET */}
      <BottomSheet 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
        title="Resources"
      >
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button 
            onClick={() => setActiveSupportTab('contact')}
            className={cn(
              "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
              activeSupportTab === 'contact' ? "bg-white shadow text-slate-900" : "text-slate-500"
            )}
          >
            Contact
          </button>
          <button 
             onClick={() => setActiveSupportTab('docs')}
             className={cn(
              "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
              activeSupportTab === 'docs' ? "bg-white shadow text-slate-900" : "text-slate-500"
            )}
          >
            Legal
          </button>
        </div>

        {activeSupportTab === 'contact' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-100 p-5 rounded-[1.5rem] shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Priority Lines</h4>
              <div className="space-y-3">
                 <button onClick={() => window.open('tel:08061934056')} className="w-full h-14 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center px-4 gap-3 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm"><Phone className="w-4 h-4 text-slate-900" /></div>
                    <span className="font-bold text-slate-900 text-sm">0806 193 4056</span>
                 </button>
                 <button onClick={() => window.open('https://wa.me/2347044647081')} className="w-full h-14 bg-green-50 hover:bg-green-100 rounded-2xl flex items-center px-4 gap-3 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm"><MessageCircle className="w-4 h-4 text-green-600" /></div>
                    <span className="font-bold text-green-700 text-sm">WhatsApp Support</span>
                 </button>
              </div>
            </div>
            
            <div className="bg-white border border-slate-100 p-5 rounded-[1.5rem] shadow-sm flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center"><Mail className="w-5 h-5 text-slate-400" /></div>
                 <div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email Us</p>
                   <p className="text-xs font-black text-slate-900">saukidatalinks@gmail.com</p>
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeSupportTab === 'docs' && <LegalDocs />}
      </BottomSheet>

      {/* TRANSACTION HISTORY SHEET */}
      <BottomSheet isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="My Activity">
           <div className="flex justify-between items-center mb-4 px-2">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Local Records</p>
               <button onClick={clearHistory} className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded">
                   <Trash2 className="w-3 h-3" /> Clear All
               </button>
           </div>
           
           <div className="space-y-3">
               {history.length === 0 ? (
                   <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase">No local history found.</div>
               ) : (
                   history.map((tx: any, idx: number) => (
                       <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                           <div className="flex items-center gap-3">
                               <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tx.type === 'data' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600")}>
                                   {tx.type === 'data' ? <Wifi className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                               </div>
                               <div>
                                   <p className="text-xs font-black text-slate-900 uppercase">{tx.type}</p>
                                   <p className="text-[10px] text-slate-400 font-bold">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                   <p className="text-[10px] font-mono text-slate-500">{tx.tx_ref}</p>
                               </div>
                           </div>
                           <div className="flex flex-col items-end gap-1">
                               <span className="font-bold text-slate-900">{formatCurrency(tx.amount)}</span>
                               <button onClick={() => generateReceipt(tx)} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                                   <Download className="w-3 h-3" /> Receipt
                               </button>
                           </div>
                       </div>
                   ))
               )}
           </div>
      </BottomSheet>
    </div>
  );
};
