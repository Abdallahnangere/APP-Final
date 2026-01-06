
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, Phone, Wallet, RefreshCw, CheckCircle, ArrowRight, ShieldCheck, ShoppingBag, Wifi, Copy, History, Download, ChevronRight, Settings, BarChart2, Coins, ArrowUpRight, LogOut, LayoutDashboard, Key, LogIn, Plus } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';
import { Agent, Transaction } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { toast } from '../../lib/toast';
import { BottomSheet } from '../ui/BottomSheet';
import { Store } from './Store';
import { Data } from './Data';
import { toPng } from 'html-to-image';
import { SharedReceipt } from '../SharedReceipt';
import { playSound, triggerHaptic } from '../../lib/sounds';
import { useRouter } from 'next/navigation';

interface AgentHubProps {
    onBack?: () => void;
}

export const AgentHub: React.FC<AgentHubProps> = ({ onBack }) => {
  const [view, setView] = useState<'login' | 'register' | 'reg_terms' | 'success' | 'dashboard'>('login');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'analytics' | 'settings'>('home');
  const [showHistory, setShowHistory] = useState(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [showPurchase, setShowPurchase] = useState<'data' | 'store' | null>(null);
  
  const [loginForm, setLoginForm] = useState({ phone: '', pin: '' });
  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', phone: '', pin: '', confirmPin: '' });
  const [newPin, setNewPin] = useState('');
  
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (view === 'dashboard' && agent) {
      fetchHistory();
      interval = setInterval(() => { refreshBalance(true); }, 15000);
    }
    return () => clearInterval(interval);
  }, [view, agent]);

  const refreshBalance = async (silent = false) => {
    if (!agent) return;
    if (!silent) setIsRefreshing(true);
    try {
      const res = await api.agentGetBalance(agent.id);
      setAgent(prev => prev ? { ...prev, balance: res.balance, cashbackBalance: res.cashbackBalance } : null);
      if (!silent) {
           toast.success("Balances synced");
           playSound('success');
      }
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
    if (loginForm.phone.length < 10 || loginForm.pin.length !== 4) return toast.error("Invalid credentials");
    setIsLoading(true);
    try {
      const res = await api.agentLogin(loginForm);
      if (!res.agent.isActive) throw new Error("Account Suspended");
      setAgent(res.agent);
      setView('dashboard');
      playSound('success');
      toast.success("Welcome, Agent " + res.agent.firstName);
    } catch (e: any) {
      playSound('error');
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
      playSound('success');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePin = async () => {
      if (newPin.length !== 4 || !agent) return toast.error("Invalid PIN");
      setIsLoading(true);
      try {
          await fetch('/api/agent/update-pin', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ agentId: agent.id, oldPin: loginForm.pin, newPin })
          });
          toast.success("PIN Updated");
          setNewPin('');
      } catch(e) { toast.error("Update failed"); }
      finally { setIsLoading(false); }
  };

  const generateReceipt = (tx: Transaction) => {
      setReceiptTx(tx);
      setTimeout(async () => {
          if (receiptRef.current) {
              const dataUrl = await toPng(receiptRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: '#ffffff' });
              const link = document.createElement('a');
              link.download = `SAUKI-RECEIPT-${tx.tx_ref}.png`;
              link.href = dataUrl;
              link.click();
              toast.success("Receipt Saved");
              setReceiptTx(null);
          }
      }, 500);
  };

  // Analytics Calculation
  const getAnalytics = () => {
      const today = new Date().toDateString();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailySales = history.filter(t => t.type === 'data' && new Date(t.createdAt).toDateString() === today && t.status === 'delivered');
      const monthlySales = history.filter(t => t.type === 'data' && new Date(t.createdAt) > thirtyDaysAgo && t.status === 'delivered');
      
      const totalGBToday = dailySales.reduce((acc, t) => acc + (parseInt(t.dataPlan?.data || '0') || 1), 0); // Approx parsing
      const totalGBMonth = monthlySales.reduce((acc, t) => acc + (parseInt(t.dataPlan?.data || '0') || 1), 0);
      const totalSpent = history.filter(t => t.status === 'delivered' || t.status === 'paid').reduce((acc, t) => acc + t.amount, 0);

      return { totalGBToday, totalGBMonth, totalSpent };
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {receiptTx && (
        <SharedReceipt 
            ref={receiptRef}
            transaction={{
                tx_ref: receiptTx.tx_ref,
                amount: receiptTx.amount,
                date: new Date(receiptTx.createdAt).toLocaleString(),
                type: receiptTx.type === 'wallet_funding' ? 'Wallet Credit' : receiptTx.type === 'data' ? 'Data Bundle' : 'Purchase',
                description: receiptTx.type === 'wallet_funding' ? 'Wallet Deposit' : receiptTx.dataPlan ? `${receiptTx.dataPlan.network} ${receiptTx.dataPlan.data}` : receiptTx.product?.name || 'Item',
                status: receiptTx.status,
                customerPhone: receiptTx.phone,
                customerName: receiptTx.customerName || agent?.firstName
            }}
        />
      )}

      <AnimatePresence mode="wait">
        {/* LOGIN VIEW */}
        {view === 'login' && (
          <motion.div key="login" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col min-h-screen">
             <div className="px-6 pt-12 flex justify-between items-center">
                 <button onClick={onBack} className="p-2 bg-slate-200 rounded-full text-slate-600 hover:bg-slate-300 transition-colors">
                     <ArrowRight className="w-5 h-5 rotate-180" />
                 </button>
                 <button onClick={() => setView('reg_terms')} className="px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wide shadow-lg shadow-slate-300">
                     Register as an Agent
                 </button>
             </div>

             <div className="flex-1 flex flex-col justify-center px-8 pb-20">
                 <div className="mb-10">
                     <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Agent<br/>Portal</h1>
                     <p className="text-slate-500 font-medium text-sm">Please identify yourself to access the terminal.</p>
                 </div>
                 
                 <div className="space-y-6">
                     <Input 
                        label="Phone Number" 
                        value={loginForm.phone} 
                        onChange={e => setLoginForm({...loginForm, phone: e.target.value})} 
                        className="h-16 text-xl tracking-wide font-semibold bg-white" 
                        placeholder="080..." 
                    />
                     <Input 
                        label="Access PIN" 
                        type="password" 
                        maxLength={4} 
                        value={loginForm.pin} 
                        onChange={e => setLoginForm({...loginForm, pin: e.target.value})} 
                        className="h-16 text-center text-4xl font-black tracking-[0.5em] bg-white" 
                        placeholder="••••" 
                    />
                     <Button onClick={handleLogin} isLoading={isLoading} className="h-16 bg-blue-600 rounded-[2rem] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-200 mt-4">
                        Secure Login <Lock className="w-5 h-5 ml-2" />
                     </Button>
                 </div>
             </div>
          </motion.div>
        )}

        {/* REGISTRATION & TERMS */}
        {(view === 'reg_terms' || view === 'register') && (
            <motion.div key="reg" initial={{opacity:0}} animate={{opacity:1}} className="p-8 pt-12 max-w-md mx-auto">
                {view === 'reg_terms' ? (
                    <>
                        <ShieldCheck className="w-16 h-16 text-slate-900 mb-6" />
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-6">Partner Rules</h2>
                        <div className="space-y-4 mb-8">
                             <p className="bg-white p-6 rounded-[2rem] text-sm font-medium text-slate-600 leading-relaxed shadow-sm border border-slate-100">By registering, you agree to actively resell products. Inactive accounts (0 sales in 30 days) may be revoked.</p>
                             <p className="bg-white p-6 rounded-[2rem] text-sm font-medium text-slate-600 leading-relaxed shadow-sm border border-slate-100">Agent wallets are prepaid. You must fund your wallet before making sales.</p>
                        </div>
                        <Button onClick={() => setView('register')} className="h-16 bg-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-white">I Agree</Button>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">Enrollment</h2>
                        <div className="space-y-4">
                            <Input label="First Name" value={regForm.firstName} onChange={e => setRegForm({...regForm, firstName: e.target.value})} className="h-14 bg-white" />
                            <Input label="Last Name" value={regForm.lastName} onChange={e => setRegForm({...regForm, lastName: e.target.value})} className="h-14 bg-white" />
                            <Input label="Phone" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} className="h-14 bg-white" />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="PIN" type="password" maxLength={4} value={regForm.pin} onChange={e => setRegForm({...regForm, pin: e.target.value})} className="h-14 text-center font-black bg-white" />
                                <Input label="Confirm" type="password" maxLength={4} value={regForm.confirmPin} onChange={e => setRegForm({...regForm, confirmPin: e.target.value})} className="h-14 text-center font-black bg-white" />
                            </div>
                            <Button onClick={handleRegister} isLoading={isLoading} className="h-16 bg-blue-600 rounded-[2rem] font-black uppercase tracking-widest text-white shadow-xl">Complete Registration</Button>
                        </div>
                    </>
                )}
                <button onClick={() => setView('login')} className="w-full py-6 text-center text-slate-400 font-bold text-xs uppercase">Cancel</button>
            </motion.div>
        )}

        {/* DASHBOARD */}
        {view === 'dashboard' && agent && (
            <motion.div key="dash" initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col h-screen">
                <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
                    
                    {/* Header */}
                    <div className="px-6 pt-12 pb-6 bg-slate-50 relative z-10">
                        <div className="flex justify-between items-center mb-6">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                                     <span className="font-black text-slate-600">{agent.firstName[0]}</span>
                                 </div>
                                 <div>
                                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Agent ID: {agent.phone.slice(-4)}</p>
                                     <p className="font-bold text-sm text-slate-900">{agent.firstName} {agent.lastName}</p>
                                 </div>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => window.location.href = '/admin'} className="p-2 bg-white rounded-full text-slate-900 border border-slate-100 shadow-sm" title="Admin Panel"><LayoutDashboard className="w-5 h-5" /></button>
                                <button onClick={() => { setAgent(null); setView('login'); }} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"><LogOut className="w-5 h-5" /></button>
                             </div>
                        </div>

                        {/* Glassmorphism Wallet Card */}
                        <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-300">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-30"></div>
                             <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-30"></div>
                             
                             <div className="relative z-10">
                                 <div className="flex justify-between items-start mb-8">
                                     <div>
                                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Total Balance</p>
                                         <h2 className="text-4xl font-black tracking-tighter text-white">{formatCurrency(agent.balance)}</h2>
                                     </div>
                                     <motion.button 
                                        animate={isRefreshing ? { rotate: 360 } : {}}
                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                        onClick={() => refreshBalance()}
                                        className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 text-white backdrop-blur-md border border-white/5"
                                     >
                                         <RefreshCw className="w-5 h-5" />
                                     </motion.button>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                                         <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Funding Acct</p>
                                         <div className="flex items-center gap-2">
                                             <span className="text-sm font-mono font-bold text-white">{agent.flwAccountNumber}</span>
                                             <button onClick={() => { navigator.clipboard.writeText(agent.flwAccountNumber!); toast.success("Copied"); }} className="text-slate-400 hover:text-white"><Copy className="w-3 h-3" /></button>
                                         </div>
                                         <p className="text-[9px] text-slate-500 mt-1">Wema Bank</p>
                                     </div>
                                     <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                                         <p className="text-[9px] font-black uppercase text-green-400 tracking-widest mb-1">Cashback</p>
                                         <span className="text-xl font-black text-white">{formatCurrency(agent.cashbackBalance)}</span>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Content Based on Tab */}
                    <div className="px-6 pb-6">
                        {activeTab === 'home' && (
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2">Quick Actions</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setShowPurchase('data')} className="bg-white p-6 rounded-[2.5rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between h-40 group active:scale-95 transition-all">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Wifi className="w-6 h-6" /></div>
                                        <div>
                                            <span className="text-lg font-black text-slate-900 block mb-1">Data</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Resell Bundle</span>
                                        </div>
                                    </button>
                                    <button onClick={() => setShowPurchase('store')} className="bg-white p-6 rounded-[2.5rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between h-40 group active:scale-95 transition-all">
                                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><ShoppingBag className="w-6 h-6" /></div>
                                        <div>
                                            <span className="text-lg font-black text-slate-900 block mb-1">Store</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Corporate Order</span>
                                        </div>
                                    </button>
                                </div>

                                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                     <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                                         <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Transactions</h5>
                                         <button onClick={() => setShowHistory(true)} className="text-blue-600 text-[10px] font-black uppercase flex items-center gap-1">View All <ChevronRight className="w-3 h-3" /></button>
                                     </div>
                                     <div className="divide-y divide-slate-50">
                                         {history.slice(0, 3).map(tx => (
                                             <div key={tx.id} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                                 <div className="flex items-center gap-4">
                                                     <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", tx.type === 'wallet_funding' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600")}>
                                                         {tx.type === 'wallet_funding' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                                     </div>
                                                     <div>
                                                         <p className="text-xs font-black uppercase text-slate-900">{tx.type === 'wallet_funding' ? 'Wallet Fund' : tx.type === 'data' ? 'Data Sale' : 'Store Sale'}</p>
                                                         <p className="text-[10px] text-slate-400 font-bold">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                     </div>
                                                 </div>
                                                 <div className="text-right">
                                                     <p className={cn("text-sm font-black", tx.type === 'wallet_funding' ? "text-green-600" : "text-slate-900")}>
                                                         {tx.type === 'wallet_funding' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                     </p>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                             <div className="space-y-6">
                                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Performance Metrics</h4>
                                 {(() => {
                                     const stats = getAnalytics();
                                     return (
                                         <div className="space-y-4">
                                             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                                                 <div>
                                                     <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Today's Volume</p>
                                                     <h3 className="text-3xl font-black text-slate-900">{stats.totalGBToday} GB</h3>
                                                 </div>
                                                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><BarChart2 className="w-6 h-6" /></div>
                                             </div>
                                              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                                                 <div>
                                                     <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">30-Day Volume</p>
                                                     <h3 className="text-3xl font-black text-slate-900">{stats.totalGBMonth} GB</h3>
                                                 </div>
                                                 <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><History className="w-6 h-6" /></div>
                                             </div>
                                             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                                                 <div>
                                                     <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Total Spend</p>
                                                     <h3 className="text-3xl font-black text-slate-900">{formatCurrency(stats.totalSpent)}</h3>
                                                 </div>
                                                 <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><Wallet className="w-6 h-6" /></div>
                                             </div>
                                         </div>
                                     );
                                 })()}
                             </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                     <div className="text-center mb-8">
                                         <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                             <Users className="w-10 h-10" />
                                         </div>
                                         <h3 className="text-xl font-black text-slate-900">{agent.firstName} {agent.lastName}</h3>
                                         <p className="text-xs font-bold text-slate-400">{agent.phone}</p>
                                     </div>

                                     <div className="space-y-4">
                                         <div className="flex justify-between border-b border-slate-50 pb-4">
                                             <span className="text-xs font-bold text-slate-500 uppercase">Member Since</span>
                                             <span className="text-xs font-black text-slate-900">{new Date(agent.joinedAt).toLocaleDateString()}</span>
                                         </div>
                                         <div className="flex justify-between border-b border-slate-50 pb-4">
                                             <span className="text-xs font-bold text-slate-500 uppercase">Account Status</span>
                                             <span className="text-[10px] font-black bg-green-100 text-green-700 px-3 py-1 rounded-full">ACTIVE</span>
                                         </div>
                                     </div>
                                 </div>

                                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Security Settings</h4>
                                      <Input 
                                        type="password" 
                                        maxLength={4} 
                                        placeholder="New 4-Digit PIN" 
                                        className="mb-4 h-16 rounded-2xl text-center font-black tracking-[0.5em] bg-slate-50"
                                        value={newPin}
                                        onChange={e => setNewPin(e.target.value)}
                                      />
                                      <Button onClick={updatePin} isLoading={isLoading} className="h-16 bg-slate-900 text-white rounded-2xl uppercase font-black tracking-wide">Update Security PIN</Button>
                                 </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200/50 px-8 py-4 flex justify-between items-center shadow-2xl relative z-20 pb-safe h-[5.5rem]">
                    <NavBtn icon={LayoutDashboard} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                    <NavBtn icon={BarChart2} label="Stats" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                    <NavBtn icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </div>

                {/* Modals */}
                <BottomSheet isOpen={!!showPurchase} onClose={() => setShowPurchase(null)} title={showPurchase === 'data' ? 'Data Reseller' : 'Device Order'}>
                    <div className="bg-slate-50 -mx-6 -mt-6 p-6 mb-6 border-b border-slate-100 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                                <Wallet className="w-5 h-5 text-slate-900" />
                             </div>
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Liquidity</p>
                                <p className="text-lg font-black text-slate-900 leading-none">{formatCurrency(agent.balance + agent.cashbackBalance)}</p>
                             </div>
                         </div>
                    </div>
                    {showPurchase === 'data' && <Data agent={agent} onBack={() => setShowPurchase(null)} />}
                    {showPurchase === 'store' && <Store agent={agent} onBack={() => setShowPurchase(null)} />}
                </BottomSheet>

                <BottomSheet isOpen={showHistory} onClose={() => setShowHistory(false)} title="Ledger History">
                    <div className="space-y-3">
                        {history.map(tx => (
                            <div key={tx.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
                                <div className="flex items-center gap-3">
                                     <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tx.type === 'wallet_funding' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600")}>
                                         {tx.type === 'wallet_funding' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                     </div>
                                     <div>
                                         <p className="text-xs font-black uppercase text-slate-900">{tx.type.replace('_', ' ')}</p>
                                         <p className="text-[10px] text-slate-400 font-bold">{tx.tx_ref}</p>
                                     </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className="font-black text-sm">{formatCurrency(tx.amount)}</span>
                                    <button onClick={() => generateReceipt(tx)} className="text-[9px] font-bold text-blue-600 uppercase flex items-center gap-1 mt-1 bg-blue-50 px-2 py-1 rounded-md">Receipt <Download className="w-3 h-3" /></button>
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && <p className="text-center text-slate-400 py-10 font-bold text-xs uppercase">No records found</p>}
                    </div>
                </BottomSheet>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavBtn = ({ icon: Icon, label, active, onClick }: any) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group w-16">
        <div className={cn("w-12 h-8 rounded-full flex items-center justify-center transition-all duration-300", active ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-400 group-hover:bg-slate-50")}>
            <Icon className="w-5 h-5" />
        </div>
        <span className={cn("text-[10px] font-bold uppercase tracking-tight transition-colors", active ? "text-slate-900" : "text-slate-400")}>{label}</span>
    </button>
);
