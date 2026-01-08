
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, Wallet, RefreshCw, ArrowRight, ShieldCheck, ShoppingBag, Wifi, Copy, History, Download, ChevronRight, Settings, BarChart2, ArrowUpRight, LogOut, LayoutDashboard, TrendingDown, Phone, MessageCircle, CheckCircle2, ArrowLeft, Plus } from 'lucide-react';
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

const ControlBtn = ({ icon: Icon, label, onClick, color = "bg-slate-900" }: any) => (
    <button onClick={onClick} className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 h-28 active:scale-95 transition-all group hover:shadow-lg">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", color)}>
            <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-black uppercase text-slate-900 tracking-tight">{label}</span>
    </button>
);

export const AgentHub: React.FC<AgentHubProps> = ({ onBack }) => {
  const [view, setView] = useState<'login' | 'register' | 'reg_terms' | 'dashboard'>('login');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [showPurchase, setShowPurchase] = useState<'data' | 'store' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
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
           toast.success("Sync Complete");
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
    if (!regForm.firstName || !regForm.lastName || regForm.phone.length < 10) return toast.error("Complete all fields");
    if (regForm.pin !== regForm.confirmPin) return toast.error("PINs do not match");
    if (regForm.pin.length !== 4) return toast.error("PIN must be 4 digits");
    
    setIsLoading(true);
    try {
      const res = await api.agentRegister(regForm);
      setAgent(res.agent);
      setView('dashboard');
      playSound('success');
      toast.success("Account Created!");
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
          setShowSettings(false);
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

  const MotionDiv = motion.div as any;
  const MotionButton = motion.button as any;

  return (
    <div className="h-screen bg-[#F2F2F7] font-sans text-slate-900 overflow-hidden flex flex-col">
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
             <div className="px-6 pt-safe flex justify-between items-center shrink-0">
                 <button onClick={onBack} className="p-3 bg-white rounded-full text-slate-600 shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
                     <ArrowLeft className="w-5 h-5" />
                 </button>
                 <button onClick={() => setView('reg_terms')} className="px-5 py-3 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wide shadow-lg shadow-slate-300">
                     Register
                 </button>
             </div>

             <div className="flex-1 flex flex-col justify-center px-8 pb-20">
                 <div className="mb-8">
                     <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-slate-200">
                         <Users className="w-8 h-8 text-white" />
                     </div>
                     <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Agent<br/>Console</h1>
                     <p className="text-slate-500 font-medium text-sm">Secure Terminal Login</p>
                 </div>
                 
                 <div className="space-y-5">
                     <Input 
                        label="Registered Phone" 
                        value={loginForm.phone} 
                        onChange={e => setLoginForm({...loginForm, phone: e.target.value})} 
                        className="h-16 text-xl tracking-wide font-semibold bg-white border border-slate-100" 
                        placeholder="080..." 
                    />
                     <Input 
                        label="Access PIN" 
                        type="password" 
                        maxLength={4} 
                        value={loginForm.pin} 
                        onChange={e => setLoginForm({...loginForm, pin: e.target.value})} 
                        className="h-16 text-center text-4xl font-black tracking-[0.5em] bg-white border border-slate-100" 
                        placeholder="••••" 
                    />
                     <Button onClick={handleLogin} isLoading={isLoading} className="h-16 bg-blue-600 rounded-[2rem] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-200 mt-4">
                        Secure Login <Lock className="w-5 h-5 ml-2" />
                     </Button>
                 </div>
             </div>
          </MotionDiv>
        )}

        {/* REGISTRATION: TERMS & VERIFICATION WARNING */}
        {view === 'reg_terms' && (
            <MotionDiv key="terms" initial={{opacity:0}} animate={{opacity:1}} className="p-8 pt-safe max-w-md mx-auto h-full flex flex-col bg-white">
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <ShieldCheck className="w-16 h-16 text-red-600 mb-6" />
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-slate-900">Mandatory Verification</h2>
                    
                    <div className="space-y-6 mb-8 mt-6">
                            <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-full blur-xl -mr-10 -mt-10"></div>
                                <h4 className="font-black text-xs uppercase mb-2 text-red-700 tracking-widest">Crucial Step</h4>
                                <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                    After registration, <span className="text-red-600 underline decoration-2">an agent will call you</span> to verify your identity.
                                </p>
                                <p className="text-xs text-slate-500 mt-3 font-medium">
                                    Failure to answer this call or provide proof of identity will result in immediate <strong className="text-red-600">account revocation</strong>.
                                </p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                <h4 className="font-black text-xs uppercase mb-2 text-slate-400 tracking-widest">Policy Agreement</h4>
                                <ul className="text-xs font-medium text-slate-600 space-y-2 list-disc pl-4">
                                    <li>Inactive accounts (30 days) are suspended.</li>
                                    <li>Wallets are prepaid and non-refundable.</li>
                                    <li>Fraudulent activity leads to blacklisting.</li>
                                </ul>
                            </div>
                    </div>
                </div>
                <div className="pt-4 space-y-3">
                    <Button onClick={() => setView('register')} className="h-16 bg-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-white">I Understand & Accept</Button>
                    <button onClick={() => setView('login')} className="w-full py-4 text-center text-slate-400 font-bold text-xs uppercase">Cancel</button>
                </div>
            </MotionDiv>
        )}

        {/* REGISTRATION: FORM */}
        {view === 'register' && (
            <MotionDiv key="reg_form" initial={{opacity:0}} animate={{opacity:1}} className="p-8 pt-safe max-w-md mx-auto h-full overflow-y-auto">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">Agent Profile</h2>
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" value={regForm.firstName} onChange={e => setRegForm({...regForm, firstName: e.target.value})} className="h-14 bg-white" placeholder="John" />
                        <Input label="Last Name" value={regForm.lastName} onChange={e => setRegForm({...regForm, lastName: e.target.value})} className="h-14 bg-white" placeholder="Doe" />
                    </div>
                    
                    <Input label="Phone Number" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} className="h-14 bg-white font-bold" placeholder="080..." />

                    <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                        <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-4 text-center">Set Transaction PIN</p>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Create PIN" type="password" maxLength={4} value={regForm.pin} onChange={e => setRegForm({...regForm, pin: e.target.value})} className="h-14 text-center font-black bg-white" placeholder="****" />
                            <Input label="Confirm PIN" type="password" maxLength={4} value={regForm.confirmPin} onChange={e => setRegForm({...regForm, confirmPin: e.target.value})} className="h-14 text-center font-black bg-white" placeholder="****" />
                        </div>
                    </div>

                    <Button onClick={handleRegister} isLoading={isLoading} className="h-16 bg-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-white shadow-xl mt-4">
                        Create Account
                    </Button>
                    <button onClick={() => setView('login')} className="w-full text-center text-slate-400 font-bold text-xs uppercase mt-4">Back to Login</button>
                </div>
            </MotionDiv>
        )}

        {/* DASHBOARD */}
        {view === 'dashboard' && agent && (
            <MotionDiv key="dash" initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col h-screen overflow-hidden bg-[#F2F2F7]">
                
                {/* Header (Sticky) */}
                <div className="px-6 pt-safe pb-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex justify-between items-center sticky top-0 z-20">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Terminal</p>
                        <h1 className="text-lg font-black text-slate-900 leading-none">{agent.firstName} {agent.lastName}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowSettings(true)} className="p-2.5 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200"><Settings className="w-5 h-5" /></button>
                        <button onClick={() => { setAgent(null); setView('login'); }} className="p-2.5 bg-slate-100 text-red-500 rounded-full hover:bg-red-50"><LogOut className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                    
                    {/* Wallet Card - Premium Glass */}
                    <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-300">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20 translate-x-20 -translate-y-20"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600 rounded-full blur-[60px] opacity-20 -translate-x-10 translate-y-10"></div>
                        
                        <div className="relative z-10 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-2">Total Liquidity</p>
                            <h2 className="text-5xl font-black text-white tracking-tighter mb-6">{formatCurrency(agent.balance)}</h2>
                            
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 mx-auto max-w-xs">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Virtual Account</span>
                                    <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded uppercase">{agent.flwBankName || 'WEMA'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-xl font-bold text-white tracking-widest">{agent.flwAccountNumber || 'Unavailable'}</span>
                                    <button onClick={() => { navigator.clipboard.writeText(agent.flwAccountNumber!); toast.success("Copied"); }} className="text-white/60 hover:text-white"><Copy className="w-4 h-4" /></button>
                                </div>
                            </div>
                            
                            <button onClick={() => refreshBalance()} className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-white/50 uppercase tracking-widest hover:text-white transition-colors mx-auto">
                                <RefreshCw className={cn("w-3 h-3", isRefreshing && "animate-spin")} /> Sync Balance
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-2">Control Center</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <ControlBtn icon={Wifi} label="Data Bundle" color="bg-blue-600" onClick={() => setShowPurchase('data')} />
                            <ControlBtn icon={ShoppingBag} label="Device Store" color="bg-purple-600" onClick={() => setShowPurchase('store')} />
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div>
                        <div className="flex justify-between items-center mb-3 px-2">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Recent Activity</h3>
                        </div>
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden min-h-[200px]">
                            {history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 opacity-40">
                                    <History className="w-10 h-10 mb-2 text-slate-300" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No Records</span>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {history.map(tx => (
                                        <div key={tx.id} onClick={() => generateReceipt(tx)} className="p-5 flex justify-between items-center hover:bg-slate-50 cursor-pointer active:scale-[0.99] transition-transform">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", 
                                                    tx.type === 'wallet_funding' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600"
                                                )}>
                                                    {tx.type === 'wallet_funding' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 uppercase">{tx.type === 'wallet_funding' ? 'Deposit' : (tx.dataPlan ? 'Data Sale' : 'Store Sale')}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={cn("text-sm font-black", tx.type === 'wallet_funding' ? "text-green-600" : "text-slate-900")}>
                                                {tx.type === 'wallet_funding' ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Settings Bottom Sheet */}
                <BottomSheet isOpen={showSettings} onClose={() => setShowSettings(false)} title="Agent Settings">
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                                <Users className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 uppercase">{agent.firstName} {agent.lastName}</h3>
                            <p className="text-xs font-bold text-slate-400">{agent.phone}</p>
                            <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                <CheckCircle2 className="w-3 h-3" /> Active Partner
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 pl-2">Security</h4>
                            <Input 
                                type="password" 
                                maxLength={4} 
                                placeholder="New 4-Digit PIN" 
                                className="mb-4 h-14 rounded-2xl text-center font-black tracking-[0.5em] bg-white border border-slate-200"
                                value={newPin}
                                onChange={e => setNewPin(e.target.value)}
                            />
                            <Button onClick={updatePin} isLoading={isLoading} className="h-14 bg-slate-900 text-white rounded-2xl uppercase font-black tracking-widest shadow-xl">Update PIN</Button>
                        </div>
                    </div>
                </BottomSheet>

                {/* Purchase Modals */}
                <BottomSheet isOpen={!!showPurchase} onClose={() => setShowPurchase(null)} title={showPurchase === 'data' ? 'Data Reseller' : 'Device Order'}>
                    <div className="bg-slate-50 -mx-6 -mt-6 p-6 mb-6 border-b border-slate-100 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                                <Wallet className="w-5 h-5 text-slate-900" />
                             </div>
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Available Balance</p>
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
