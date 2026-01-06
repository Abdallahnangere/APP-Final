
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn, formatCurrency } from '../../lib/utils';
import { Loader2, Upload, Lock, Trash2, Edit2, Send, Download, Search, Package, Wifi, LayoutDashboard, LogOut, Terminal, Play, RotateCcw, Megaphone, CreditCard, Activity, TrendingUp, CheckCircle, Smartphone, MapPin, List, Calculator, Users, Wallet, FileJson, Ban, ArrowUpCircle } from 'lucide-react';
import { DataPlan, Product, Transaction, Agent } from '../../types';
import { SharedReceipt } from '../../components/SharedReceipt';
import { toPng } from 'html-to-image';
import { toast } from '../../lib/toast';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'dashboard' | 'products' | 'plans' | 'orders' | 'transactions' | 'calculator' | 'agents' | 'manual' | 'console' | 'broadcast' | 'flw_console' | 'webhooks'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [agents, setAgents] = useState<(Agent & { _count: { transactions: number } })[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);

  const [productForm, setProductForm] = useState<Partial<Product>>({ name: '', description: '', price: 0, image: '', category: 'device' });
  const [planForm, setPlanForm] = useState<Partial<DataPlan>>({ network: 'MTN', data: '', validity: '30 Days', price: 0, planId: 0 });
  const [manualForm, setManualForm] = useState({ phone: '', planId: '' });
  const [broadcastForm, setBroadcastForm] = useState({ content: '', type: 'info', isActive: true });
  const [fundForm, setFundForm] = useState({ agentId: '', amount: '' });
  const [editMode, setEditMode] = useState(false);
  
  const [consoleEndpoint, setConsoleEndpoint] = useState('/data/');
  const [consolePayload, setConsolePayload] = useState('{\n  "network": 1,\n  "mobile_number": "09000000000",\n  "plan": 1001,\n  "Ported_number": true\n}');
  const [consoleHistory, setConsoleHistory] = useState<Array<{ type: 'req' | 'res', data: any, time: string }>>([]);

  const receiptRef = useRef<HTMLDivElement>(null);
  const [receiptTx, setReceiptTx] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const [pRes, plRes, txRes] = await Promise.all([
            fetch('/api/products').then(r => r.json()).catch(() => []),
            fetch('/api/data-plans').then(r => r.json()).catch(() => []),
            fetch('/api/transactions/list').then(r => r.json()).catch(() => [])
        ]);
        
        if (Array.isArray(pRes)) setProducts(pRes);
        if (Array.isArray(plRes)) setPlans(plRes);
        if (Array.isArray(txRes)) setTransactions(txRes);
    } catch (e) {
        console.error("Failed to load data", e);
    } finally {
        setLoading(false);
    }
  };

  const fetchAgents = async () => {
      setLoading(true);
      try {
          const res = await fetch('/api/admin/agents', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password })
          });
          const data = await res.json();
          if (data.agents) setAgents(data.agents);
      } catch (e) { alert("Agent Fetch Error"); }
      finally { setLoading(false); }
  };

  useEffect(() => {
      if (view === 'agents') fetchAgents();
  }, [view]);

  const checkAuth = async () => {
      setLoading(true);
      try {
          const res = await fetch('/api/admin/auth', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }) 
          });
          if (res.ok) setIsAuthenticated(true);
          else alert("Incorrect Password");
      } catch (e) { alert("Error"); } 
      finally { setLoading(false); }
  };

  const handleDownloadReceipt = async (tx: Transaction) => {
      const getDesc = (tx: Transaction) => {
        const manifest = (tx.deliveryData as any)?.manifest;
        if (manifest) return manifest;

        if (tx.type === 'data') return `${tx.dataPlan?.network} ${tx.dataPlan?.data}`;
        return tx.product?.name || 'Item';
      };
      
      setReceiptTx({
          tx_ref: tx.tx_ref,
          amount: tx.amount,
          date: new Date(tx.createdAt).toLocaleDateString() + ' ' + new Date(tx.createdAt).toLocaleTimeString(),
          type: tx.type === 'ecommerce' ? 'Corporate Order' : 'Data Bundle',
          description: getDesc(tx),
          status: tx.status,
          customerPhone: tx.phone,
          customerName: tx.customerName,
          deliveryAddress: tx.deliveryState || (tx.deliveryData as any)?.address
      });
      
      setTimeout(async () => {
          if (receiptRef.current) {
              try {
                  const dataUrl = await toPng(receiptRef.current, { 
                      cacheBust: true, 
                      pixelRatio: 4, 
                      backgroundColor: '#ffffff'
                  });
                  const link = document.createElement('a');
                  link.download = `SAUKI-ADMIN-RECEIPT-${tx.tx_ref}.png`;
                  link.href = dataUrl;
                  link.click();
                  setReceiptTx(null);
              } catch (err) {
                  alert("Receipt capture failed.");
              }
          }
      }, 800);
  };

  const handleFundAgent = async (agentId: string) => {
      const amount = prompt("Enter Amount to Credit (NGN):");
      if (!amount) return;
      setLoading(true);
      try {
          const res = await fetch('/api/admin/agent-fund', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ agentId, amount: Number(amount), password, action: 'credit' })
          });
          if(res.ok) { alert("Agent Funded"); fetchAgents(); }
          else alert("Failed");
      } catch(e) { alert("Error"); }
      finally { setLoading(false); }
  };

  const handleToggleAgent = async (agentId: string, currentStatus: boolean) => {
      if(!confirm(`Are you sure you want to ${currentStatus ? 'SUSPEND' : 'ACTIVATE'} this agent?`)) return;
      setLoading(true);
      try {
          const res = await fetch('/api/admin/agent-fund', { // Reusing endpoint for simplicity or create new
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ agentId, password, action: 'toggle_status' })
          });
          if(res.ok) { fetchAgents(); }
      } finally { setLoading(false); }
  };

  // ... (Keep existing product/plan functions from previous admin file) ...
  const saveProduct = async () => { /* ... existing logic ... */ };
  const deleteProduct = async (id: string) => { /* ... existing logic ... */ };
  const savePlan = async () => { /* ... existing logic ... */ };
  const deletePlan = async (id: string) => { /* ... existing logic ... */ };
  const handleBroadcast = async () => { /* ... existing logic ... */ };
  const handleManualTopup = async () => { /* ... existing logic ... */ };
  const sendConsoleRequest = async () => { /* ... existing logic ... */ };

  // ... (Filtering Logic) ...
  const filteredTransactions = transactions.filter(t => t.tx_ref.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!isAuthenticated) return (
     <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border border-slate-100">
            <Lock className="w-12 h-12 text-slate-900 mx-auto mb-6" />
            <h1 className="text-2xl font-black mb-6">ADMIN ACCESS</h1>
            <input type="password" className="border-2 border-slate-100 p-5 rounded-2xl w-full mb-6 text-center text-2xl font-black tracking-widest" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={checkAuth} className="bg-slate-900 text-white p-5 rounded-[1.5rem] w-full font-black uppercase tracking-widest">{loading ? <Loader2 className="animate-spin mx-auto" /> : 'Enter'}</button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
        {receiptTx && <SharedReceipt ref={receiptRef} transaction={receiptTx} />}

        <aside className="w-72 bg-slate-900 text-white hidden lg:flex flex-col fixed h-full z-10 shadow-2xl">
            <div className="p-10 border-b border-slate-800">
                <h1 className="text-xl font-black tracking-tighter">SAUKI MART</h1>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Administrator</p>
            </div>
            <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto no-scrollbar">
                {[{ id: 'dashboard', label: 'Overview', icon: LayoutDashboard }, { id: 'agents', label: 'Agent Manager', icon: Users }, { id: 'transactions', label: 'Transactions', icon: Activity }, { id: 'broadcast', label: 'Push Notify', icon: Megaphone }].map(item => (
                    <button key={item.id} onClick={() => setView(item.id as any)} className={cn("flex items-center gap-4 w-full p-4 rounded-2xl text-sm font-black transition-all", view === item.id ? "bg-white text-slate-900" : "text-slate-500 hover:bg-slate-800")}>
                        <item.icon className="w-5 h-5" /> {item.label}
                    </button>
                ))}
            </nav>
        </aside>

        <main className="flex-1 lg:ml-72 p-10 overflow-y-auto h-screen">
             <header className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{view}</h2>
            </header>

            {view === 'agents' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {agents.map(agent => (
                        <div key={agent.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                            {!agent.isActive && <div className="absolute inset-0 bg-red-50/50 backdrop-blur-[1px] flex items-center justify-center z-10"><span className="bg-red-600 text-white px-4 py-2 rounded-xl font-black uppercase">Suspended</span></div>}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="font-black text-slate-900 uppercase text-lg">{agent.firstName} {agent.lastName}</h4>
                                    <p className="text-xs text-slate-500 font-bold">{agent.phone}</p>
                                </div>
                                <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase">{agent._count.transactions} Txns</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Main Wallet</p>
                                    <p className="text-xl font-black text-slate-900">{formatCurrency(agent.balance)}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-xl">
                                    <p className="text-[9px] text-green-600 font-black uppercase tracking-widest mb-1">Cashback</p>
                                    <p className="text-xl font-black text-green-700">{formatCurrency(agent.cashbackBalance)}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 relative z-20">
                                <button onClick={() => handleFundAgent(agent.id)} className="flex-1 bg-slate-900 text-white p-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-slate-800"><ArrowUpCircle className="w-4 h-4" /> Credit Wallet</button>
                                <button onClick={() => handleToggleAgent(agent.id, agent.isActive)} className={cn("flex-1 p-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2", agent.isActive ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200")}>
                                    <Ban className="w-4 h-4" /> {agent.isActive ? 'Revoke' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reuse existing views for Transactions, Broadcast, etc. */}
        </main>
    </div>
  );
}
