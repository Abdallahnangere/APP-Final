
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, Phone, Wallet, RefreshCw, CheckCircle, ArrowRight, UserPlus, ShieldCheck, ShoppingBag, Wifi, Loader2, Copy, History, Download, ChevronRight } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';
import { Agent, DataPlan, Product, Transaction } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { toast } from '../../lib/toast';
import { BottomSheet } from '../ui/BottomSheet';
import { Store } from './Store';
import { Data } from './Data';
import { toPng } from 'html-to-image';
import { SharedReceipt } from '../SharedReceipt';

interface AgentHubProps {
    onBack?: () => void;
}

export const AgentHub: React.FC<AgentHubProps> = ({ onBack }) => {
  const [view, setView] = useState<'login' | 'register' | 'reg_terms' | 'success' | 'dashboard'>('login');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // History State
  const [history, setHistory] = useState<Transaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Form states
  const [loginForm, setLoginForm] = useState({ phone: '', pin: '' });
  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', phone: '', pin: '', confirmPin: '' });
  const [showPurchase, setShowPurchase] = useState<'data' | 'store' | null>(null);

  useEffect(() => {
    // Polling set to 15 seconds
    let interval: any;
    if (view === 'dashboard' && agent) {
      fetchHistory();
      interval = setInterval(() => {
        refreshBalance(true);
      }, 15000);
    }
    return () => clearInterval(interval);
  }, [view, agent]);

  const refreshBalance = async (silent = false) => {
    if (!agent) return;
    if (!silent) setIsRefreshing(true);
    try {
      const res = await api.agentGetBalance(agent.id);
      setAgent(prev => prev ? { ...prev, balance: res.balance } : null);
      if (!silent) toast.success("Balance updated");
      // Also background refresh history
      fetchHistory();
    } catch (e) {
      if (!silent) toast.error("Refresh failed");
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  const fetchHistory = async () => {
      if(!agent) return;
      try {
          const res = await fetch(`/api/agent/transactions?agentId=${agent.id}`).then(r => r.json());
          if(res.transactions) setHistory(res.transactions);
      } catch(e) {}
  };

  const handleLogin = async () => {
    if (loginForm.phone.length < 10 || loginForm.pin.length !== 4) {
      return toast.error("Invalid credentials");
    }
    setIsLoading(true);
    try {
      const res = await api.agentLogin(loginForm);
      setAgent(res.agent);
      setView('dashboard');
      toast.success("Welcome back, " + res.agent.firstName);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (regForm.pin !== regForm.confirmPin) return toast.error("PINs do not match");
    if (regForm.pin.length !== 4) return toast.error("PIN must be 4 digits");
    setIsLoading(true);
    try {
      const res = await api.agentRegister(regForm);
      setAgent(res.agent);
      setView('success');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
      setAgent(null);
      setView('login');
  };

  const generateReceipt = async (tx: Transaction) => {
      setReceiptTx(tx);
      setTimeout(async () => {
          if (receiptRef.current) {
              try {
                  const dataUrl = await toPng(receiptRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: '#ffffff' });
                  const link = document.createElement('a');
                  link.download = `SAUKI-RECEIPT-${tx.tx_ref}.png`;
                  link.href = dataUrl;
                  link.click();
                  toast.success("Receipt downloaded");
              } catch (err) {
                  toast.error("Failed to generate receipt");
              }
              setReceiptTx(null);
          }
      }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hidden Receipt Component */}
      {receiptTx && (
        <SharedReceipt 
            ref={receiptRef}
            transaction={{
                tx_ref: receiptTx.tx_ref,
                amount: receiptTx.amount,
                date: new Date(receiptTx.createdAt).toLocaleString(),
                type: receiptTx.type === 'wallet_funding' ? 'Wallet Credit' : receiptTx.type === 'data' ? 'Data Bundle' : 'Purchase',
                description: receiptTx.type === 'wallet_funding' ? 'Wallet Deposit via Bank Transfer' : receiptTx.dataPlan ? `${receiptTx.dataPlan.network} ${receiptTx.dataPlan.data}` : receiptTx.product?.name || 'Item',
                status: receiptTx.status,
                customerPhone: receiptTx.phone,
                customerName: receiptTx.customerName || agent?.firstName,
                deliveryAddress: receiptTx.deliveryState || (receiptTx.deliveryData as any)?.address
            }}
        />
      )}

      <AnimatePresence mode="wait">
        {view === 'login' && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-8 pt-8 max-w-md mx-auto"
          >
            {onBack && (
                <button onClick={onBack} className="mb-6 bg-slate-200 p-2 rounded-xl text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-300 transition-colors">
                    Back Home
                </button>
            )}
            <div className="w-20 h-20 bg-purple-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-purple-100 text-white">
              <Users className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Agent Access</h1>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-10">Wallet management & Reselling Hub</p>
            
            <div className="space-y-4">
              <Input 
                label="Registered Phone" 
                placeholder="080..." 
                type="tel"
                value={loginForm.phone}
                onChange={e => setLoginForm({...loginForm, phone: e.target.value})}
                className="h-14 rounded-2xl font-black tracking-tight"
              />
              <Input 
                label="4-Digit Password" 
                placeholder="****" 
                type="password"
                maxLength={4}
                value={loginForm.pin}
                onChange={e => setLoginForm({...loginForm, pin: e.target.value})}
                className="h-14 rounded-2xl font-black tracking-[0.5em] text-center text-lg"
              />
              <Button onClick={handleLogin} isLoading={isLoading} className="h-16 bg-purple-600 rounded-[1.5rem] shadow-xl shadow-purple-100 uppercase font-black tracking-widest mt-6">
                Enter Dashboard
              </Button>
              
              <div className="pt-8 text-center">
                <p className="text-slate-400 text-xs font-bold mb-4">Not yet an authorized agent?</p>
                <button 
                  onClick={() => setView('reg_terms')}
                  className="text-purple-600 font-black uppercase text-[10px] tracking-[0.2em] border-b-2 border-purple-100 pb-1"
                >
                  Apply for registration
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'reg_terms' && (
          <motion.div 
            key="terms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-8 pt-12 max-w-md mx-auto"
          >
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-8 shadow-xl text-white">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-6">Agent Regulations</h2>
            <div className="space-y-6 mb-10">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 shrink-0 flex items-center justify-center font-black">1</div>
                <p className="text-slate-600 text-sm font-medium leading-relaxed italic">By registering as an agent, you agree to actively resell Sauki Mart products to end users in your vicinity.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 shrink-0 flex items-center justify-center font-black">2</div>
                <p className="text-slate-600 text-sm font-medium leading-relaxed italic">Failure to meet at least <span className="text-slate-900 font-black">30GB</span> sales in your first week will result in revocation of agent benefits.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 shrink-0 flex items-center justify-center font-black">3</div>
                <p className="text-slate-600 text-sm font-medium leading-relaxed italic">Agent operates on a <span className="text-slate-900 font-black">prepaid wallet system</span>. Funding must reflect before orders are processed.</p>
              </div>
            </div>
            <Button onClick={() => setView('register')} className="h-16 bg-slate-900 rounded-[1.5rem] uppercase font-black tracking-widest shadow-2xl">
              Accept & Continue
            </Button>
            <button onClick={() => setView('login')} className="w-full mt-4 text-slate-400 font-black uppercase text-[10px] tracking-widest py-4">Cancel</button>
          </motion.div>
        )}

        {view === 'register' && (
          <motion.div 
            key="register"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 pt-10 max-w-md mx-auto"
          >
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-8">Agent Enrollment</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" placeholder="Abba" value={regForm.firstName} onChange={e => setRegForm({...regForm, firstName: e.target.value})} className="h-14 rounded-2xl" />
                <Input label="Last Name" placeholder="Sani" value={regForm.lastName} onChange={e => setRegForm({...regForm, lastName: e.target.value})} className="h-14 rounded-2xl" />
              </div>
              <Input label="Phone Number" placeholder="080..." type="tel" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} className="h-14 rounded-2xl" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="4-Digit PIN" type="password" maxLength={4} value={regForm.pin} onChange={e => setRegForm({...regForm, pin: e.target.value})} className="h-14 rounded-2xl text-center font-black tracking-widest" />
                <Input label="Confirm PIN" type="password" maxLength={4} value={regForm.confirmPin} onChange={e => setRegForm({...regForm, confirmPin: e.target.value})} className="h-14 rounded-2xl text-center font-black tracking-widest" />
              </div>
              <Button onClick={handleRegister} isLoading={isLoading} className="h-16 bg-purple-600 rounded-[1.5rem] shadow-xl uppercase font-black tracking-widest mt-4">
                Submit Enrollment
              </Button>
              <button onClick={() => setView('login')} className="w-full mt-2 text-slate-400 font-black uppercase text-[10px] tracking-widest py-4">Back to login</button>
            </div>
          </motion.div>
        )}

        {view === 'success' && (
          <motion.div 
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 flex flex-col items-center justify-center min-h-[80vh] text-center"
          >
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-100 animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">Enrollment Success</h2>
            <p className="text-slate-500 text-sm font-medium mb-10 leading-relaxed">
              Your agent account and permanent funding wallet have been successfully provisioned.
            </p>
            <Button onClick={() => setView('login')} className="h-16 bg-slate-900 rounded-[1.5rem] uppercase font-black tracking-widest shadow-2xl">
              Proceed to Login <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}

        {view === 'dashboard' && agent && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-32"
          >
            <div className="p-6 bg-slate-900 text-white rounded-b-[3rem] shadow-2xl shadow-slate-200">
               <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Agent Portfolio</p>
                        <p className="text-sm font-black uppercase tracking-tight">{agent.firstName} {agent.lastName}</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                    {onBack && (
                        <button onClick={onBack} className="p-3 rounded-full bg-white/10 text-white/60 hover:text-white" title="Home">
                            <ArrowRight className="w-4 h-4 rotate-180" />
                        </button>
                    )}
                    <button 
                        onClick={handleLogout}
                        className="p-3 rounded-full bg-white/10 text-red-400 hover:text-red-300 hover:bg-white/20"
                        title="Logout"
                    >
                        <Lock className="w-4 h-4" />
                    </button>
                  </div>
               </div>

               <div className="bg-gradient-to-br from-purple-700 to-purple-600 p-8 rounded-[2.5rem] shadow-2xl shadow-purple-500/20 relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase text-white/50 tracking-[0.2em] mb-2 flex items-center gap-2">
                       <Wallet className="w-3 h-3" /> Available Liquidity
                    </p>
                    <h3 className="text-4xl font-black tracking-tighter mb-8">{formatCurrency(agent.balance)}</h3>
                    
                    <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
                        <div>
                           <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Funding Account</p>
                           <p className="text-base font-black tracking-tighter flex items-center gap-2">
                              {agent.flwAccountNumber}
                              <button onClick={() => { navigator.clipboard.writeText(agent.flwAccountNumber); toast.success("Copied"); }} className="p-1 hover:bg-white/10 rounded"><Copy className="w-3 h-3" /></button>
                           </p>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Provider Bank</p>
                           <p className="text-xs font-black uppercase tracking-tight">{agent.flwBankName}</p>
                        </div>
                    </div>
                  </div>
                  <motion.button 
                    animate={isRefreshing ? { rotate: 360 } : {}}
                    transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
                    onClick={() => refreshBalance()}
                    className="absolute top-6 right-6 p-4 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </motion.button>
               </div>
            </div>

            <div className="p-6 space-y-6 mt-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Agent Reselling Tools</h4>
               <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowPurchase('data')}
                    className="h-32 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center gap-3 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Wifi className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest">Resell Data</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowPurchase('store')}
                    className="h-32 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center gap-3 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                       <ShoppingBag className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest">Resell Gadgets</span>
                  </motion.button>
               </div>
               
               {/* History Section */}
               <div className="bg-slate-100 p-6 rounded-[2rem] border border-slate-200/50">
                   <div className="flex items-center justify-between mb-4">
                       <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recent Activity</h5>
                       <button onClick={() => setShowHistory(true)} className="text-[10px] font-black uppercase text-purple-600 flex items-center gap-1">View All <ChevronRight className="w-3 h-3" /></button>
                   </div>
                   
                   <div className="space-y-3">
                       {history.slice(0, 3).map(tx => (
                           <div key={tx.id} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm">
                               <div className="flex items-center gap-3">
                                   <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", tx.type === 'wallet_funding' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600")}>
                                       {tx.type === 'wallet_funding' ? <Wallet className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                   </div>
                                   <div>
                                       <p className="text-[10px] font-black uppercase text-slate-900">{tx.type === 'wallet_funding' ? 'Wallet Credit' : 'Sales Order'}</p>
                                       <p className="text-[9px] font-bold text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                   </div>
                               </div>
                               <div className="text-right">
                                    <p className={cn("text-xs font-black", tx.type === 'wallet_funding' ? "text-green-600" : "text-slate-900")}>
                                        {tx.type === 'wallet_funding' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </p>
                                    <button onClick={() => generateReceipt(tx)} className="text-[8px] font-bold uppercase text-purple-600 flex items-center justify-end gap-1 mt-1">Receipt <Download className="w-3 h-3" /></button>
                               </div>
                           </div>
                       ))}
                       {history.length === 0 && (
                           <p className="text-center text-[10px] font-bold text-slate-400 py-4">No recent transactions</p>
                       )}
                   </div>
               </div>
            </div>

            {/* History Sheet */}
            <BottomSheet isOpen={showHistory} onClose={() => setShowHistory(false)} title="Transaction Ledger">
                <div className="space-y-4">
                    {history.map(tx => (
                        <div key={tx.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                   <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tx.type === 'wallet_funding' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600")}>
                                       {tx.type === 'wallet_funding' ? <Wallet className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                                   </div>
                                   <div>
                                       <p className="text-xs font-black uppercase text-slate-900">{tx.type === 'wallet_funding' ? 'Wallet Credit' : tx.dataPlan ? `${tx.dataPlan.network} Data` : 'Product Sale'}</p>
                                       <p className="text-[10px] font-bold text-slate-400">{tx.tx_ref}</p>
                                       <p className="text-[9px] font-bold text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>
                                   </div>
                               </div>
                               <div className="flex flex-col items-end gap-2">
                                    <p className={cn("text-sm font-black", tx.type === 'wallet_funding' ? "text-green-600" : "text-slate-900")}>
                                        {tx.type === 'wallet_funding' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </p>
                                    <button onClick={() => generateReceipt(tx)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                                        Receipt <Download className="w-3 h-3" />
                                    </button>
                               </div>
                        </div>
                    ))}
                    {history.length === 0 && <div className="text-center p-10 text-slate-400 text-xs font-bold uppercase">No records found</div>}
                </div>
            </BottomSheet>

            <BottomSheet isOpen={!!showPurchase} onClose={() => setShowPurchase(null)} title={showPurchase === 'data' ? 'Bulk Data Injection' : 'Corporate reselling'}>
               <div className="bg-slate-50 -mx-6 -mt-6 p-4 mb-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-black uppercase tracking-tight">Wallet Pay Active</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{formatCurrency(agent.balance)}</span>
               </div>
               
               {showPurchase === 'store' && (
                   <Store agent={agent} onBack={() => setShowPurchase(null)} />
               )}

               {showPurchase === 'data' && (
                   <Data agent={agent} onBack={() => setShowPurchase(null)} />
               )}
            </BottomSheet>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
