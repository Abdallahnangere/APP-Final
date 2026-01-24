
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, Wallet, RefreshCw, ArrowRight, ShieldCheck, ShoppingBag, Wifi, Copy, History, Download, ChevronRight, Settings, BarChart2, ArrowUpRight, LogOut, LayoutDashboard, TrendingDown, Phone, MessageCircle, CheckCircle2, ArrowLeft, Plus, Target, Calendar, Award } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';
import { Agent, Transaction } from '../../types';
import { formatCurrency, cn, generateReceiptData } from '../../lib/utils';
import { toast } from '../../lib/toast';
import { BottomSheet } from '../ui/BottomSheet';
import { Store } from './Store';
import { Data } from './Data';
import { AgentAnalytics } from '../AgentAnalytics';
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
             <div className="px-6 pt-16 pb-4 flex justify-between items-center shrink-0">
                 <button onClick={onBack} className="p-2 bg-white rounded-full text-slate-600 shadow-sm border border-slate-100">
                     <ArrowLeft className="w-5 h-5" />
                 </button>
                 <button onClick={() => setView('reg_terms')} className="px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                     Register
                 </button>
             </div>

             <div className="flex-1 flex flex-col justify-center px-6 pb-20">
                 <div className="mb-6">
                     <h1 className="text-3xl font-black text-slate-900 uppercase mb-1">Agent<br/>Login</h1>
                     <p className="text-sm text-slate-600 font-semibold">Partner secure access</p>
                 </div>
                 
                 <div className="space-y-4">
                     <Input 
                        label="Phone Number" 
                        value={loginForm.phone} 
                        onChange={e => setLoginForm({...loginForm, phone: e.target.value})} 
                        className="h-13 text-base font-semibold bg-white border border-slate-200 rounded-lg" 
                        placeholder="08012345678" 
                    />
                     <Input 
                        label="4-Digit PIN" 
                        type="password" 
                        maxLength={4} 
                        value={loginForm.pin} 
                        onChange={e => setLoginForm({...loginForm, pin: e.target.value})} 
                        className="h-13 text-center text-2xl font-black tracking-[0.5em] bg-white border border-slate-200 rounded-lg" 
                        placeholder="••••" 
                    />
                     <Button onClick={handleLogin} isLoading={isLoading} className="h-12 bg-slate-900 rounded-lg font-bold uppercase tracking-wide text-white shadow-lg mt-2 w-full">
                        Sign In
                     </Button>
                 </div>
             </div>
          </MotionDiv>
        )}

        {/* REGISTRATION: TERMS & VERIFICATION WARNING */}
        {view === 'reg_terms' && (
            <MotionDiv key="terms" initial={{opacity:0}} animate={{opacity:1}} className="p-6 pt-16 max-w-md mx-auto h-full flex flex-col">
                <button onClick={() => setView('login')} className="mb-4 p-2 bg-white rounded-full text-slate-600 w-fit shadow-sm border border-slate-100">
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <h2 className="text-2xl font-black uppercase text-slate-900 mb-4">Identity Verification</h2>
                    
                    <div className="space-y-4">
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <h4 className="font-bold text-xs uppercase mb-2 text-orange-900">Important</h4>
                            <p className="text-sm text-orange-900 leading-relaxed mb-2">
                                After registration, we'll call you to verify your identity.
                            </p>
                            <p className="text-xs text-orange-700 font-semibold">
                                Answer the call or your account will be suspended.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <h4 className="font-bold text-xs uppercase mb-2 text-slate-600">Policy</h4>
                            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                                <li>Inactive for 30 days = suspended</li>
                                <li>Wallets non-refundable</li>
                                <li>Fraud = blacklisted</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="pt-4 space-y-2">
                    <Button onClick={() => setView('register')} className="h-12 bg-slate-900 rounded-lg font-bold uppercase tracking-wide text-white w-full">
                        I Agree & Continue
                    </Button>
                    <button onClick={() => setView('login')} className="w-full py-3 text-center text-slate-500 font-semibold text-xs uppercase">Cancel</button>
                </div>
            </MotionDiv>
        )}

        {/* REGISTRATION: FORM */}
        {view === 'register' && (
            <MotionDiv key="reg_form" initial={{opacity:0}} animate={{opacity:1}} className="p-6 pt-16 max-w-md mx-auto h-full overflow-y-auto">
                <button onClick={() => setView('reg_terms')} className="mb-4 p-2 bg-white rounded-full text-slate-600 w-fit shadow-sm border border-slate-100">
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-black uppercase text-slate-900 mb-4">Create Account</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="First Name" value={regForm.firstName} onChange={e => setRegForm({...regForm, firstName: e.target.value})} className="h-12 bg-white rounded-lg text-sm" placeholder="John" />
                        <Input label="Last Name" value={regForm.lastName} onChange={e => setRegForm({...regForm, lastName: e.target.value})} className="h-12 bg-white rounded-lg text-sm" placeholder="Doe" />
                    </div>
                    
                    <Input label="Phone Number" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} className="h-12 bg-white rounded-lg text-sm font-bold" placeholder="08012345678" />

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-xs font-bold text-blue-900 uppercase mb-3 text-center">Set Your 4-Digit PIN</p>
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="PIN" type="password" maxLength={4} value={regForm.pin} onChange={e => setRegForm({...regForm, pin: e.target.value})} className="h-12 text-center font-black bg-white rounded-lg text-lg" placeholder="••••" />
                            <Input label="Confirm" type="password" maxLength={4} value={regForm.confirmPin} onChange={e => setRegForm({...regForm, confirmPin: e.target.value})} className="h-12 text-center font-black bg-white rounded-lg text-lg" placeholder="••••" />
                        </div>
                    </div>

                    <Button onClick={handleRegister} isLoading={isLoading} className="h-12 bg-slate-900 rounded-lg font-bold uppercase tracking-wide text-white w-full shadow-lg mt-2">
                        Create Account
                    </Button>
                    <button onClick={() => setView('login')} className="w-full py-3 text-center text-slate-500 font-semibold text-xs uppercase">Back to Login</button>
                </div>
            </MotionDiv>
        )}

        {/* DASHBOARD */}
        {view === 'dashboard' && agent && (
            <MotionDiv key="dash" initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col h-screen overflow-hidden bg-white">
                
                {/* Header */}
                <div className="px-6 pt-6 pb-4 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 leading-none">{agent.firstName}</h1>
                        <p className="text-xs text-slate-500 font-bold mt-1">Partner Dashboard</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowSettings(true)} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200"><Settings className="w-4 h-4" /></button>
                        <button onClick={() => { setAgent(null); setView('login'); }} className="p-2 bg-slate-100 text-red-500 rounded-lg hover:bg-red-100"><LogOut className="w-4 h-4" /></button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-6">
                    
                    {/* Premium Wallet Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 shadow-lg border border-slate-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600 rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-1">Available Balance</p>
                            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{formatCurrency(agent.balance)}</h2>
                            
                            {agent.flwAccountNumber && (
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wide mb-2">Virtual Account</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-mono text-base font-bold text-white mb-1">{agent.flwAccountNumber}</p>
                                            <p className="text-xs text-slate-300">{agent.flwBankName || 'WEMA Bank'}</p>
                                        </div>
                                        <button onClick={() => { navigator.clipboard.writeText(agent.flwAccountNumber!); toast.success("Copied"); }} className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <button onClick={() => refreshBalance()} className="mt-3 text-xs font-bold text-white/60 hover:text-white flex items-center gap-1 uppercase tracking-wide">
                                <RefreshCw className={cn("w-3 h-3", isRefreshing && "animate-spin")} /> Sync Balance
                            </button>
                        </div>
                    </div>

                    {/* Buy Data & Products Section */}
                    <div>
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-wide mb-3">Top Sales</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowPurchase('data')} className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow active:scale-95">
                                <div className="text-2xl mb-2">📱</div>
                                <p className="text-xs font-bold text-slate-900 uppercase">Sell Data</p>
                                <p className="text-[10px] text-slate-500 mt-1">Bundles</p>
                            </button>
                            <button onClick={() => setShowPurchase('store')} className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:shadow-md transition-shadow active:scale-95">
                                <div className="text-2xl mb-2">🛍️</div>
                                <p className="text-xs font-bold text-slate-900 uppercase">Sell Devices</p>
                                <p className="text-[10px] text-slate-500 mt-1">Store Items</p>
                            </button>
                        </div>
                    </div>

                    {/* Analytics Section */}
                    <AgentAnalytics agent={agent} transactions={history} />

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-xs font-black text-slate-600 uppercase tracking-wide mb-3">Quick Access</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <ControlBtn icon={Target} label="Goals" color="bg-amber-600" onClick={() => toast.info("Daily targets")} />
                            <ControlBtn icon={Award} label="Rewards" color="bg-green-600" onClick={() => toast.info("Badges & rewards")} />
                            <ControlBtn icon={Calendar} label="Calendar" color="bg-blue-600" onClick={() => toast.info("Schedule view")} />
                            <ControlBtn icon={MessageCircle} label="Support" color="bg-purple-600" onClick={() => toast.info("Contact support")} />
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-black text-slate-600 uppercase tracking-wide">Transactions</h3>
                            <button className="text-[10px] font-bold text-blue-600 hover:text-blue-700">View All →</button>
                        </div>
                        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                            {history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 opacity-50">
                                    <History className="w-8 h-8 mb-2 text-slate-400" />
                                    <span className="text-[10px] font-bold uppercase text-slate-400">No Activity</span>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-200">
                                    {history.slice(0, 5).map((tx) => (
                                        <div 
                                          key={tx.id}
                                          onClick={() => generateReceipt(tx)}
                                          className="p-4 flex justify-between items-center hover:bg-slate-100 cursor-pointer active:bg-slate-200 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold", 
                                                    tx.type === 'wallet_funding' ? "bg-green-600" : 
                                                    tx.type === 'data' ? "bg-blue-600" :
                                                    "bg-purple-600"
                                                )}>
                                                    {tx.type === 'wallet_funding' ? '↓' : tx.type === 'data' ? '📱' : '🛍️'}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 uppercase">
                                                      {tx.type === 'wallet_funding' ? 'Deposit' : tx.type === 'data' ? 'Data Sale' : 'Store Sale'}
                                                    </p>
                                                    <p className="text-[8px] text-slate-500 uppercase">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                              <span className={cn("text-sm font-black", tx.type === 'wallet_funding' ? "text-green-600" : "text-slate-900")}>
                                                  {tx.type === 'wallet_funding' ? '+' : '-'}{formatCurrency(tx.amount)}
                                              </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Settings Bottom Sheet */}
                <BottomSheet isOpen={showSettings} onClose={() => setShowSettings(false)} title="Settings">
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-400">
                                <Users className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 uppercase">{agent.firstName} {agent.lastName}</h3>
                            <p className="text-xs text-slate-500">{agent.phone}</p>
                            <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-[9px] font-bold uppercase">
                                <CheckCircle2 className="w-3 h-3" /> Active
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 block">New PIN (4 digits)</label>
                            <Input 
                                type="password" 
                                maxLength={4} 
                                placeholder="••••" 
                                className="h-11 rounded-lg text-center font-black text-lg bg-white border border-slate-200 mb-3"
                                value={newPin}
                                onChange={e => setNewPin(e.target.value)}
                            />
                            <Button onClick={updatePin} isLoading={isLoading} className="h-11 bg-slate-900 text-white rounded-lg font-bold uppercase tracking-wide w-full">Change PIN</Button>
                        </div>
                    </div>
                </BottomSheet>

                {/* Purchase Modals */}
                <BottomSheet isOpen={!!showPurchase} onClose={() => setShowPurchase(null)} title="">
                    <div className="bg-slate-100 -mx-4 -mt-4 p-4 mb-4 rounded-t-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 text-lg">
                            {showPurchase === 'data' ? '📱' : '🛍️'}
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Available</p>
                            <p className="text-lg font-black text-slate-900">{formatCurrency(agent.balance)}</p>
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
