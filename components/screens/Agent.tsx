
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, Wallet, RefreshCw, ArrowRight, ShieldCheck, ShoppingBag, Wifi, Copy, History, Download, ChevronRight, Settings, BarChart2, ArrowUpRight, LogOut, LayoutDashboard, TrendingDown, CreditCard } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';
import { Agent, Transaction } from '../../types';
import { formatCurrency, cn, generateReceiptData } from '../../lib/utils';
import { toast } from '../../lib/toast';
import { BottomSheet } from '../ui/BottomSheet';
import { Store } from './Store';
import { Data } from './Data';
import { toPng } from 'html-to-image';
import { SharedReceipt } from '../SharedReceipt';
import { playSound } from '../../lib/sounds';

interface AgentHubProps {
    onBack?: () => void;
}

// MOVED UP: Defined before usage to prevent ReferenceErrors
const NavBtn = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className="group flex flex-col items-center justify-center w-16">
        <div className={cn(
            "p-2.5 rounded-2xl mb-1 transition-all duration-300",
            active ? "bg-slate-900 text-white shadow-lg shadow-slate-300 scale-110" : "text-slate-400 group-hover:bg-slate-50"
        )}>
            <Icon className="w-5 h-5" />
        </div>
        <span className={cn(
            "text-[9px] font-black uppercase tracking-widest transition-all duration-300",
            active ? "text-slate-900" : "text-slate-400"
        )}>{label}</span>
    </button>
);

export const AgentHub: React.FC<AgentHubProps> = ({ onBack }) => {
  const [view, setView] = useState<'login' | 'register' | 'reg_terms' | 'success' | 'dashboard'>('login');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'analytics' | 'settings'>('home');
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
      interval = setInterval(() => { refreshBalance(true); }, 30000);
    }
    return () => clearInterval(interval);
  }, [view, agent]);

  const refreshBalance = async (silent = false) => {
    if (!agent) return;
    if (!silent) setIsRefreshing(true);
    try {
      const res = await api.agentGetBalance(agent.id);
      setAgent(prev => prev ? { ...prev, balance: res.balance } : null);
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
      toast.success("Welcome, " + res.agent.firstName);
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

  const getAnalytics = () => {
      const today = new Date().toDateString();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailySales = history.filter(t => t.type === 'data' && new Date(t.createdAt).toDateString() === today && t.status === 'delivered');
      const monthlySales = history.filter(t => t.type === 'data' && new Date(t.createdAt) > thirtyDaysAgo && t.status === 'delivered');
      
      const totalGBToday = dailySales.reduce((acc, t) => acc + (parseInt(t.dataPlan?.data || '0') || 1), 0);
      const totalGBMonth = monthlySales.reduce((acc, t) => acc + (parseInt(t.dataPlan?.data || '0') || 1), 0);
      
      const totalSpent = history
        .filter(t => (t.type === 'data' || t.type === 'ecommerce') && (t.status === 'delivered' || t.status === 'paid'))
        .reduce((acc, t) => acc + t.amount, 0);

      return { totalGBToday, totalGBMonth, totalSpent };
  };

  const MotionDiv = motion.div as any;
  const MotionButton = motion.button as any;

  return (
    <div className="h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden flex flex-col">
      {receiptTx && (
        <SharedReceipt 
            ref={receiptRef}
            transaction={generateReceiptData(receiptTx, agent)}
        />
      )}

      <AnimatePresence mode="wait">
        {/* LOGIN VIEW */}
        {view === 'login' && (
          <MotionDiv key="login" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col h-full overflow-y-auto">
             <div className="px-6 pt-12 flex justify-between items-center shrink-0">
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
                     <p className="text-slate-500 font-medium text-sm">Identify yourself to access the secure terminal.</p>
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
                     <Button onClick={handleLogin} isLoading={isLoading} className="h-16 bg-purple-600 rounded-[2rem] font-black uppercase tracking-widest text-white shadow-xl shadow-purple-200 mt-4">
                        Secure Login <Lock className="w-5 h-5 ml-2" />
                     </Button>
                 </div>
             </div>
          </MotionDiv>
        )}

        {/* REGISTRATION & TERMS */}
        {(view === 'reg_terms' || view === 'register') && (
            <MotionDiv key="reg" initial={{opacity:0}} animate={{opacity:1}} className="p-8 pt-12 max-w-md mx-auto h-full overflow-y-auto">
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
            </MotionDiv>
        )}

        {/* DASHBOARD */}
        {view === 'dashboard' && agent && (
            <MotionDiv key="dash" initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col h-screen overflow-hidden bg-slate-100">
                
                {/* Header & Wallet Section (Fixed) */}
                <div className="px-5 pt-10 pb-6 bg-slate-100 shrink-0">
                    <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <span className="font-black text-slate-900">{agent.firstName[0]}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Agent ID: {agent.phone.slice(-4)}</p>
                                    <p className="font-bold text-sm text-slate-900">{agent.firstName} {agent.lastName}</p>
                                </div>
                            </div>
                            <button onClick={() => { setAgent(null); setView('login'); }} className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-sm"><LogOut className="w-5 h-5" /></button>
                    </div>

                    {/* Premium Glassmorphism Wallet Card */}
                    <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl shadow-slate-300">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500 rounded-full -translate-y-1/2 translate-x-1/2 blur-[60px] opacity-40"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full translate-y-1/2 -translate-x-1/2 blur-[40px] opacity-30"></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Total Balance</p>
                                        <h2 className="text-4xl font-black tracking-tighter text-white">{formatCurrency(agent.balance)}</h2>
                                    </div>
                                    <MotionButton 
                                    animate={isRefreshing ? { rotate: 360 } : {}}
                                    transition={{ duration: 1, ease: 'easeInOut' }}
                                    onClick={() => refreshBalance()}
                                    className="p-2.5 bg-white/10 rounded-2xl hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                    </MotionButton>
                                </div>

                                {/* Bank Account Display */}
                                <div className="space-y-3">
                                    <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Funding Account</p>
                                            <span className="text-[9px] font-black text-white bg-blue-600 px-2 py-0.5 rounded-lg">{agent.flwBankName || 'STERLING BANK'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                 <p className="text-xl font-mono font-bold text-white tracking-widest">{agent.flwAccountNumber || 'Unavailable'}</p>
                                                 <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">{agent.flwAccountName || agent.firstName + ' ' + agent.lastName}</p>
                                            </div>
                                            <button onClick={() => { navigator.clipboard.writeText(agent.flwAccountNumber!); toast.success("Copied"); }} className="p-2 bg-white/10 rounded-xl text-white hover:bg-white/20">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-hidden px-5 pb-24 flex flex-col min-h-0">
                    {activeTab === 'home' && (
                        <div className="flex flex-col h-full space-y-4">
                            {/* Quick Actions - Fixed Height */}
                            <div className="shrink-0">
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] pl-2 mb-2">Terminal Actions</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setShowPurchase('data')} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200/50 flex flex-col justify-between h-36 active:scale-95 transition-all hover:border-blue-200">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Wifi className="w-6 h-6" /></div>
                                        <div>
                                            <span className="text-lg font-black text-slate-900 block leading-none mb-1">Data</span>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Resell Bundle</span>
                                        </div>
                                    </button>
                                    <button onClick={() => setShowPurchase('store')} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200/50 flex flex-col justify-between h-36 active:scale-95 transition-all hover:border-purple-200">
                                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><ShoppingBag className="w-6 h-6" /></div>
                                        <div>
                                            <span className="text-lg font-black text-slate-900 block leading-none mb-1">Store</span>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Device Order</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Recent Transactions - Scrollable */}
                            <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
                                    <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                                        <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Recent Transactions</h5>
                                        <span className="text-blue-600 text-[9px] font-black uppercase flex items-center gap-1">View All <ChevronRight className="w-3 h-3" /></span>
                                    </div>
                                    <div className="overflow-y-auto flex-1 divide-y divide-slate-50 no-scrollbar">
                                        {history.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase">No records found</div>
                                        ) : (
                                            history.map(tx => {
                                                const recData = generateReceiptData(tx, agent);
                                                return (
                                                <div key={tx.id} onClick={() => generateReceipt(tx)} className="p-5 flex justify-between items-center active:bg-slate-50 transition-colors cursor-pointer group">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors", tx.type === 'wallet_funding' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200")}>
                                                            {tx.type === 'wallet_funding' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[11px] font-black uppercase text-slate-900 truncate w-32">{tx.type === 'wallet_funding' ? 'Deposit' : recData.description}</p>
                                                            <p className="text-[9px] text-slate-400 font-bold">{tx.status}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={cn("text-sm font-black", tx.type === 'wallet_funding' ? "text-green-600" : "text-slate-900")}>
                                                            {tx.type === 'wallet_funding' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );})
                                        )}
                                    </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                            <div className="space-y-4 h-full overflow-y-auto no-scrollbar">
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Performance Metrics</h4>
                                {(() => {
                                    const stats = getAnalytics();
                                    return (
                                        <div className="space-y-3">
                                            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                                                <div>
                                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Today's Volume</p>
                                                    <h3 className="text-2xl font-black text-slate-900">{stats.totalGBToday} GB</h3>
                                                </div>
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><BarChart2 className="w-5 h-5" /></div>
                                            </div>
                                            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                                                <div>
                                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">30-Day Volume</p>
                                                    <h3 className="text-2xl font-black text-slate-900">{stats.totalGBMonth} GB</h3>
                                                </div>
                                                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><History className="w-5 h-5" /></div>
                                            </div>
                                            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                                                <div>
                                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Net Spend (Sales)</p>
                                                    <h3 className="text-2xl font-black text-slate-900">{formatCurrency(stats.totalSpent)}</h3>
                                                </div>
                                                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><TrendingDown className="w-5 h-5" /></div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-4 h-full overflow-y-auto no-scrollbar">
                                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                    <div className="text-center mb-6">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                            <Users className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase">{agent.firstName} {agent.lastName}</h3>
                                        <p className="text-xs font-bold text-slate-400">{agent.phone}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between border-b border-slate-50 pb-3">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Member Since</span>
                                            <span className="text-[10px] font-black text-slate-900">{new Date(agent.joinedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-slate-50 pb-3">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Account Status</span>
                                            <span className="text-[9px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full">ACTIVE</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Security Settings</h4>
                                    <Input 
                                    type="password" 
                                    maxLength={4} 
                                    placeholder="New 4-Digit PIN" 
                                    className="mb-3 h-14 rounded-2xl text-center font-black tracking-[0.5em] bg-slate-50 text-lg"
                                    value={newPin}
                                    onChange={e => setNewPin(e.target.value)}
                                    />
                                    <Button onClick={updatePin} isLoading={isLoading} className="h-14 bg-slate-900 text-white rounded-2xl uppercase font-black tracking-wide text-xs shadow-lg shadow-slate-300">Update Security PIN</Button>
                                </div>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation */}
                <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200/50 px-8 py-4 flex justify-between items-center shadow-2xl relative z-20 pb-safe h-[5.5rem] shrink-0">
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
                                <p className="text-lg font-black text-slate-900 leading-none">{formatCurrency(agent.balance)}</p>
                             </div>
                         </div>
                    </div>
                    {showPurchase === 'data' && <Data agent={agent} onBack={() => setShowPurchase(null)} />}
                    {showPurchase === 'store' && <Store agent={agent} onBack={() => setShowPurchase(null)} />}
                </BottomSheet>
            </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};
