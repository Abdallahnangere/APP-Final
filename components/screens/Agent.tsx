import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, Phone, Wallet, RefreshCw, CheckCircle, ArrowRight, UserPlus, ShieldCheck, ShoppingBag, Wifi, Loader2, Copy } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';
import { Agent, DataPlan, Product, Transaction } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { toast } from '../../lib/toast';
import { BottomSheet } from '../ui/BottomSheet';
import { Store } from './Store';
import { Data } from './Data';

interface AgentHubProps {
    onBack?: () => void;
}

export const AgentHub: React.FC<AgentHubProps> = ({ onBack }) => {
  const [view, setView] = useState<'login' | 'register' | 'reg_terms' | 'success' | 'dashboard'>('login');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showPurchase, setShowPurchase] = useState<'data' | 'store' | null>(null);

  // Form states
  const [loginForm, setLoginForm] = useState({ phone: '', pin: '' });
  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', phone: '', pin: '', confirmPin: '' });

  // Ref to track last transaction timestamp for conditional polling
  const lastTxTimestampRef = useRef<number | null>(null);

  // ===========================
  // Polling & Refresh
  // ===========================
  useEffect(() => {
    let interval: any;

    const pollAgentData = async () => {
      if (!agent) return;

      // Refresh balance silently
      try {
        const balanceRes = await api.agentGetBalance(agent.id);
        if (balanceRes.balance !== agent.balance) {
          setAgent(prev => prev ? { ...prev, balance: balanceRes.balance } : null);
        }
      } catch (e) {
        console.error('Balance poll failed', e);
      }

      // Fetch new transactions since last timestamp
      try {
        const txRes = await api.trackTransactions(agent.phone, lastTxTimestampRef.current || undefined);
        if (txRes.transactions && txRes.transactions.length > 0) {
          setTransactions(prev => [...txRes.transactions, ...prev]);
          lastTxTimestampRef.current = txRes.transactions[0].createdAt;
        }
      } catch (e) {
        console.error('Transaction poll failed', e);
      }
    };

    if (view === 'dashboard' && agent) {
      pollAgentData(); // initial poll
      interval = setInterval(pollAgentData, 10000); // every 10 seconds
    }

    return () => clearInterval(interval);
  }, [view, agent]);

  // ===========================
  // Actions
  // ===========================
  const refreshBalance = async (silent = false) => {
    if (!agent) return;
    if (!silent) setIsRefreshing(true);
    try {
      const res = await api.agentGetBalance(agent.id);
      setAgent(prev => prev ? { ...prev, balance: res.balance } : null);
      if (!silent) toast.success("Balance updated");
    } catch (e) {
      if (!silent) toast.error("Refresh failed");
    } finally {
      if (!silent) setIsRefreshing(false);
    }
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
      setTransactions([]);
      lastTxTimestampRef.current = null;
      setView('login');
  };

  // ===========================
  // Render
  // ===========================
  return (
    <div className="min-h-screen bg-slate-50">
      <AnimatePresence mode="wait">
        {view === 'login' && (
          <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 pt-8 max-w-md mx-auto">
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
              <Input label="Registered Phone" placeholder="080..." type="tel" value={loginForm.phone} onChange={e => setLoginForm({...loginForm, phone: e.target.value})} className="h-14 rounded-2xl font-black tracking-tight" />
              <Input label="4-Digit Password" placeholder="****" type="password" maxLength={4} value={loginForm.pin} onChange={e => setLoginForm({...loginForm, pin: e.target.value})} className="h-14 rounded-2xl font-black tracking-[0.5em] text-center text-lg" />
              <Button onClick={handleLogin} isLoading={isLoading} className="h-16 bg-purple-600 rounded-[1.5rem] shadow-xl shadow-purple-100 uppercase font-black tracking-widest mt-6">
                Enter Dashboard
              </Button>
              
              <div className="pt-8 text-center">
                <p className="text-slate-400 text-xs font-bold mb-4">Not yet an authorized agent?</p>
                <button onClick={() => setView('reg_terms')} className="text-purple-600 font-black uppercase text-[10px] tracking-[0.2em] border-b-2 border-purple-100 pb-1">Apply for registration</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Registration, Terms, Success Screens are unchanged, keep your current implementation */}

        {view === 'dashboard' && agent && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-32">
            {/* Dashboard Header & Wallet Card */}
            <div className="p-6 bg-slate-900 text-white rounded-b-[3rem] shadow-2xl shadow-slate-200">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Users className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Agent Portfolio</p>
                    <p className="text-sm font-black uppercase tracking-tight">{agent.firstName} {agent.lastName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {onBack && (<button onClick={onBack} className="p-3 rounded-full bg-white/10 text-white/60 hover:text-white" title="Home"><ArrowRight className="w-4 h-4 rotate-180" /></button>)}
                  <button onClick={handleLogout} className="p-3 rounded-full bg-white/10 text-red-400 hover:text-red-300 hover:bg-white/20" title="Logout"><Lock className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-700 to-purple-600 p-8 rounded-[2.5rem] shadow-2xl shadow-purple-500/20 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase text-white/50 tracking-[0.2em] mb-2 flex items-center gap-2"><Wallet className="w-3 h-3" /> Available Liquidity</p>
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
                <motion.button animate={isRefreshing ? { rotate: 360 } : {}} transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}} onClick={() => refreshBalance()} className="absolute top-6 right-6 p-4 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all">
                  <RefreshCw className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Reselling Tools & Notices */}
            <div className="p-6 space-y-6 mt-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Agent Reselling Tools</h4>
              <div className="grid grid-cols-2 gap-4">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowPurchase('data')} className="h-32 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center gap-3 group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Wifi className="w-6 h-6" /></div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Resell Data</span>
                </motion.button>

                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowPurchase('store')} className="h-32 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center gap-3 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform"><ShoppingBag className="w-6 h-6" /></div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Resell Gadgets</span>
                </motion.button>
              </div>

              <div className="bg-slate-100 p-6 rounded-[2rem] border border-slate-200/50">
                <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Notice</h5>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">
                  Agent transactions are instantaneous. Ensure you collect end-user payment before clicking purchase. Sauki Mart is not liable for wrong phone number entries.
                </p>
              </div>
            </div>

            {/* Bottom Sheet */}
            <BottomSheet isOpen={!!showPurchase} onClose={() => setShowPurchase(null)} title={showPurchase === 'data' ? 'Bulk Data Injection' : 'Corporate reselling'}>
              <div className="bg-slate-50 -mx-6 -mt-6 p-4 mb-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-black uppercase tracking-tight">Wallet Pay Active</span>
                </div>
                <span className="text-xs font-black text-slate-900">{formatCurrency(agent.balance)}</span>
              </div>
              
              {showPurchase === 'store' && <Store agent={agent} onBack={() => setShowPurchase(null)} />}
              {showPurchase === 'data' && <Data agent={agent} onBack={() => setShowPurchase(null)} />}
            </BottomSheet>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
