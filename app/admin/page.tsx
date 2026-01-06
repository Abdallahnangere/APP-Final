
'use client';

import React, { useState, useEffect } from 'react';
import { cn, formatCurrency } from '../../lib/utils';
import { Loader2, Lock, Trash2, Edit2, Send, Search, Package, Wifi, LayoutDashboard, Users, Activity, Terminal, Megaphone, Server, Save, Plus, Ban, ArrowUpCircle, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { DataPlan, Product, Transaction, Agent } from '../../types';
import { toast } from '../../lib/toast';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'dashboard' | 'products' | 'plans' | 'transactions' | 'agents' | 'console' | 'broadcast' | 'webhooks'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [agents, setAgents] = useState<(Agent & { _count: { transactions: number } })[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);

  // Forms
  const [productForm, setProductForm] = useState<Partial<Product>>({ name: '', description: '', price: 0, image: '', category: 'device' });
  const [planForm, setPlanForm] = useState<Partial<DataPlan>>({ network: 'MTN', data: '', validity: '30 Days', price: 0, planId: 0 });
  const [broadcastForm, setBroadcastForm] = useState({ content: '', type: 'info', isActive: true });
  const [editMode, setEditMode] = useState(false);

  // Console State
  const [consoleType, setConsoleType] = useState<'amigo' | 'flutterwave'>('amigo');
  const [consoleEndpoint, setConsoleEndpoint] = useState('');
  const [consoleMethod, setConsoleMethod] = useState('GET');
  const [consolePayload, setConsolePayload] = useState('{}');
  const [consoleOutput, setConsoleOutput] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
        refreshAll();
    }
  }, [isAuthenticated, view]);

  const refreshAll = async () => {
    setLoading(true);
    try {
        if (view === 'dashboard' || view === 'products') await fetchProducts();
        if (view === 'dashboard' || view === 'plans') await fetchPlans();
        if (view === 'dashboard' || view === 'agents') await fetchAgents();
        if (view === 'dashboard' || view === 'transactions') await fetchTransactions();
        if (view === 'webhooks') await fetchWebhooks();
        if (view === 'broadcast') await fetchBroadcast();
    } catch (e) {} 
    finally { setLoading(false); }
  };

  // --- FETCHERS ---
  const fetchProducts = async () => setProducts(await fetch('/api/products').then(r => r.json()));
  const fetchPlans = async () => setPlans(await fetch('/api/data-plans').then(r => r.json()));
  const fetchTransactions = async () => setTransactions(await fetch('/api/transactions/list').then(r => r.json()));
  
  const fetchAgents = async () => {
      const res = await fetch('/api/admin/agents', { method: 'POST', body: JSON.stringify({ password }) });
      const data = await res.json();
      if(data.agents) setAgents(data.agents);
  };
  
  const fetchWebhooks = async () => {
      const res = await fetch('/api/admin/webhooks', { method: 'POST', body: JSON.stringify({ password }) });
      const data = await res.json();
      if(data.logs) setWebhooks(data.logs);
  };
  
  const fetchBroadcast = async () => {
      const res = await fetch('/api/system/message').then(r => r.json());
      if(res) setBroadcastForm(res);
  };

  const checkAuth = async () => {
      setLoading(true);
      try {
          const res = await fetch('/api/admin/auth', { 
            method: 'POST', 
            body: JSON.stringify({ password }) 
          });
          if (res.ok) setIsAuthenticated(true);
          else toast.error("Incorrect Password");
      } catch (e) { toast.error("Error"); } 
      finally { setLoading(false); }
  };

  // --- ACTIONS: INVENTORY ---
  const saveProduct = async () => {
      try {
          await fetch('/api/products', {
              method: editMode ? 'PUT' : 'POST',
              body: JSON.stringify(productForm)
          });
          setEditMode(false);
          setProductForm({ name: '', description: '', price: 0, image: '', category: 'device' });
          fetchProducts();
          toast.success("Product Saved");
      } catch(e) { toast.error("Failed"); }
  };
  const deleteProduct = async (id: string) => {
      if(!confirm("Delete?")) return;
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      fetchProducts();
  };

  // --- ACTIONS: PLANS ---
  const savePlan = async () => {
      try {
          await fetch('/api/data-plans', {
              method: editMode ? 'PUT' : 'POST',
              body: JSON.stringify(planForm)
          });
          setEditMode(false);
          setPlanForm({ network: 'MTN', data: '', validity: '30 Days', price: 0, planId: 0 });
          fetchPlans();
          toast.success("Plan Saved");
      } catch(e) { toast.error("Failed"); }
  };
  const deletePlan = async (id: string) => {
      if(!confirm("Delete?")) return;
      await fetch(`/api/data-plans?id=${id}`, { method: 'DELETE' });
      fetchPlans();
  };

  // --- ACTIONS: AGENTS ---
  const fundAgent = async (agentId: string) => {
      const amount = prompt("Amount to credit:");
      if(!amount) return;
      await fetch('/api/admin/agent-fund', {
          method: 'POST',
          body: JSON.stringify({ agentId, amount: Number(amount), password, action: 'credit' })
      });
      fetchAgents();
      toast.success("Wallet Funded");
  };
  const toggleAgent = async (agentId: string) => {
      await fetch('/api/admin/agent-fund', {
          method: 'POST',
          body: JSON.stringify({ agentId, password, action: 'toggle_status' })
      });
      fetchAgents();
      toast.success("Status Updated");
  };

  // --- ACTIONS: BROADCAST ---
  const updateBroadcast = async () => {
      await fetch('/api/system/message', {
          method: 'POST',
          body: JSON.stringify({ ...broadcastForm, password })
      });
      toast.success("Broadcast Updated");
  };

  // --- ACTIONS: CONSOLE ---
  const executeConsole = async () => {
      setLoading(true);
      try {
          let payloadParsed = {};
          try { payloadParsed = JSON.parse(consolePayload); } catch(e) {}

          const endpoint = consoleType === 'amigo' ? '/api/admin/console' : '/api/admin/console/flutterwave';
          
          const res = await fetch(endpoint, {
              method: 'POST',
              body: JSON.stringify({
                  endpoint: consoleEndpoint,
                  method: consoleMethod,
                  payload: payloadParsed,
                  password
              })
          });
          const data = await res.json();
          setConsoleOutput(data);
      } catch(e) { setConsoleOutput({ error: 'Execution Failed' }); }
      finally { setLoading(false); }
  };

  // --- Filter Transactions ---
  const filteredTransactions = transactions.filter(t => 
      t.tx_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery)
  );

  if (!isAuthenticated) return (
     <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border border-slate-100">
            <Lock className="w-12 h-12 text-slate-900 mx-auto mb-6" />
            <h1 className="text-2xl font-black mb-6">SAUKI ADMIN</h1>
            <input type="password" className="border-2 border-slate-100 p-5 rounded-2xl w-full mb-6 text-center text-2xl font-black tracking-widest" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={checkAuth} className="bg-slate-900 text-white p-5 rounded-[1.5rem] w-full font-black uppercase tracking-widest">{loading ? <Loader2 className="animate-spin mx-auto" /> : 'Enter'}</button>
        </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white hidden lg:flex flex-col fixed h-full z-10 shadow-2xl">
            <div className="p-8 border-b border-slate-800">
                <h1 className="text-xl font-black tracking-tighter">SAUKI MART</h1>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Admin Control</p>
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto no-scrollbar">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'transactions', label: 'Transactions', icon: FileText },
                    { id: 'products', label: 'Inventory', icon: Package },
                    { id: 'plans', label: 'Data Plans', icon: Wifi },
                    { id: 'agents', label: 'Agents', icon: Users },
                    { id: 'console', label: 'API Console', icon: Terminal },
                    { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
                    { id: 'webhooks', label: 'Webhook Logs', icon: Activity },
                ].map(item => (
                    <button key={item.id} onClick={() => setView(item.id as any)} className={cn("flex items-center gap-4 w-full p-4 rounded-2xl text-xs font-black transition-all", view === item.id ? "bg-white text-slate-900" : "text-slate-500 hover:bg-slate-800")}>
                        <item.icon className="w-5 h-5" /> {item.label}
                    </button>
                ))}
            </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-8 overflow-y-auto h-screen bg-slate-50">
             <header className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{view}</h2>
                <button onClick={refreshAll} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50"><RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} /></button>
            </header>

            {/* DASHBOARD OVERVIEW */}
            {view === 'dashboard' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Registered Agents</p>
                                <h3 className="text-4xl font-black text-slate-900">{agents.length}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Users className="w-6 h-6" /></div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Products in Stock</p>
                                <h3 className="text-4xl font-black text-slate-900">{products.length}</h3>
                            </div>
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600"><Package className="w-6 h-6" /></div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Plans</p>
                                <h3 className="text-4xl font-black text-slate-900">{plans.length}</h3>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><Wifi className="w-6 h-6" /></div>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black uppercase text-slate-400 mb-4">Admin Quick Tips</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                            <div className="bg-slate-50 p-4 rounded-xl">Use the <strong>API Console</strong> to manually trigger data top-ups if automated systems fail.</div>
                            <div className="bg-slate-50 p-4 rounded-xl">Check <strong>Webhook Logs</strong> to debug failed wallet fundings from Flutterwave.</div>
                        </div>
                    </div>
                </div>
            )}

            {/* TRANSACTIONS VIEW */}
            {view === 'transactions' && (
                <div className="space-y-4">
                     <div className="bg-white p-4 rounded-[2rem] shadow-sm flex items-center gap-4 border border-slate-100">
                        <Search className="w-5 h-5 text-slate-400 ml-2" />
                        <input className="flex-1 outline-none font-bold bg-transparent" placeholder="Search TX Ref, Phone..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">Reference</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredTransactions.map(tx => (
                                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 font-mono font-bold text-xs text-slate-500">{tx.tx_ref}</td>
                                            <td className="p-4 font-black uppercase text-xs text-slate-900">{tx.type.replace('_', ' ')}</td>
                                            <td className="p-4 font-bold">{formatCurrency(tx.amount)}</td>
                                            <td className="p-4">
                                                <span className={cn("px-2 py-1 rounded text-[10px] font-black uppercase inline-flex items-center gap-1", 
                                                    tx.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                                    tx.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                                                    tx.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500')}>
                                                    {tx.status === 'delivered' && <CheckCircle2 className="w-3 h-3" />}
                                                    {tx.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-slate-400 font-bold">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* INVENTORY / PRODUCTS */}
            {view === 'products' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-4">{editMode ? 'Edit Product' : 'Add New Product'}</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input className="p-3 border rounded-xl" placeholder="Name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                            <input className="p-3 border rounded-xl" placeholder="Price" type="number" value={productForm.price || ''} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} />
                            <select className="p-3 border rounded-xl" value={productForm.category} onChange={(e:any) => setProductForm({...productForm, category: e.target.value})}>
                                <option value="device">Device</option><option value="sim">SIM</option><option value="package">Package</option>
                            </select>
                            <input className="p-3 border rounded-xl" placeholder="Image URL" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} />
                        </div>
                        <button onClick={saveProduct} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {products.map(p => (
                            <div key={p.id} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 flex items-center gap-4 group hover:shadow-lg transition-all">
                                <img src={p.image} className="w-12 h-12 rounded-lg object-contain bg-slate-50" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">{p.name}</p>
                                    <p className="text-blue-600 font-black text-xs">{formatCurrency(p.price)}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => { setProductForm(p); setEditMode(true); }} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => deleteProduct(p.id)} className="p-2 bg-red-50 rounded-lg text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DATA PLANS */}
            {view === 'plans' && (
                <div className="space-y-6">
                     <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-4">{editMode ? 'Edit Plan' : 'Add New Plan'}</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <select className="p-3 border rounded-xl" value={planForm.network} onChange={(e:any) => setPlanForm({...planForm, network: e.target.value})}>
                                <option>MTN</option><option>AIRTEL</option><option>GLO</option>
                            </select>
                            <input className="p-3 border rounded-xl" placeholder="Data (1GB)" value={planForm.data} onChange={e => setPlanForm({...planForm, data: e.target.value})} />
                            <input className="p-3 border rounded-xl" placeholder="Price" type="number" value={planForm.price || ''} onChange={e => setPlanForm({...planForm, price: Number(e.target.value)})} />
                            <input className="p-3 border rounded-xl" placeholder="Amigo Plan ID" type="number" value={planForm.planId || ''} onChange={e => setPlanForm({...planForm, planId: Number(e.target.value)})} />
                        </div>
                        <button onClick={savePlan} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plans.map(p => (
                            <div key={p.id} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 flex justify-between items-center hover:shadow-md transition-all">
                                <div>
                                    <span className={cn("font-black text-[10px] px-2 py-0.5 rounded mb-1 inline-block", p.network === 'MTN' ? 'bg-yellow-100 text-yellow-700' : p.network === 'AIRTEL' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}>{p.network}</span>
                                    <p className="font-bold text-sm">{p.data} - {p.validity}</p>
                                    <p className="text-blue-600 font-bold text-xs">{formatCurrency(p.price)}</p>
                                    <p className="text-[10px] text-slate-400">ID: {p.planId}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => { setPlanForm(p); setEditMode(true); }} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => deletePlan(p.id)} className="p-2 bg-red-50 rounded-lg text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AGENTS MANAGEMENT */}
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
                                <button onClick={() => fundAgent(agent.id)} className="flex-1 bg-slate-900 text-white p-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-slate-800"><ArrowUpCircle className="w-4 h-4" /> Credit Wallet</button>
                                <button onClick={() => toggleAgent(agent.id)} className={cn("flex-1 p-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2", agent.isActive ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200")}>
                                    <Ban className="w-4 h-4" /> {agent.isActive ? 'Suspend' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* BROADCAST SYSTEM */}
            {view === 'broadcast' && (
                <div className="max-w-xl mx-auto bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600"><Megaphone className="w-8 h-8" /></div>
                    <h3 className="text-xl font-black uppercase mb-6">System Broadcast</h3>
                    <textarea 
                        className="w-full p-4 bg-slate-50 rounded-2xl mb-4 font-medium text-sm border-none focus:ring-2 focus:ring-blue-500" 
                        rows={3}
                        placeholder="Type message here..."
                        value={broadcastForm.content} 
                        onChange={e => setBroadcastForm({...broadcastForm, content: e.target.value})} 
                    />
                    <div className="flex justify-center gap-4 mb-6">
                        {['info', 'warning', 'alert'].map(t => (
                            <button 
                                key={t} 
                                onClick={() => setBroadcastForm({...broadcastForm, type: t})}
                                className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", broadcastForm.type === t ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-200")}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button onClick={updateBroadcast} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200">Update Message</button>
                </div>
            )}

            {/* API CONSOLE */}
            {view === 'console' && (
                <div className="flex flex-col h-[80vh] bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
                    <div className="bg-slate-950 p-4 flex items-center justify-between border-b border-white/5">
                        <div className="flex gap-2">
                            <button onClick={() => setConsoleType('amigo')} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest", consoleType === 'amigo' ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-white/5")}>Amigo API</button>
                            <button onClick={() => setConsoleType('flutterwave')} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest", consoleType === 'flutterwave' ? "bg-orange-500 text-white" : "text-slate-500 hover:bg-white/5")}>Flutterwave</button>
                        </div>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col p-6 overflow-hidden">
                        <div className="flex gap-2 mb-4">
                            <select value={consoleMethod} onChange={e => setConsoleMethod(e.target.value)} className="bg-white/10 text-white p-3 rounded-xl font-bold text-xs outline-none border border-white/10 w-24">
                                <option>GET</option><option>POST</option>
                            </select>
                            <input 
                                className="flex-1 bg-white/5 text-white p-3 rounded-xl font-mono text-xs outline-none border border-white/10 placeholder:text-white/20"
                                placeholder={consoleType === 'amigo' ? "/data/" : "/transactions"}
                                value={consoleEndpoint}
                                onChange={e => setConsoleEndpoint(e.target.value)}
                            />
                            <button onClick={executeConsole} disabled={loading} className="bg-green-600 text-white px-6 rounded-xl font-black uppercase text-xs flex items-center gap-2 hover:bg-green-500"><Terminal className="w-4 h-4" /> Send</button>
                        </div>
                        
                        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
                            <div className="flex flex-col">
                                <label className="text-white/40 text-[9px] font-bold uppercase mb-2 ml-1">Payload (JSON)</label>
                                <textarea 
                                    className="flex-1 bg-black/30 text-green-400 p-4 rounded-xl font-mono text-xs outline-none border border-white/10 resize-none"
                                    value={consolePayload}
                                    onChange={e => setConsolePayload(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-white/40 text-[9px] font-bold uppercase mb-2 ml-1">Response</label>
                                <div className="flex-1 bg-black/50 text-white p-4 rounded-xl font-mono text-xs overflow-auto border border-white/10">
                                    <pre>{consoleOutput ? JSON.stringify(consoleOutput, null, 2) : '// Waiting for response...'}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* WEBHOOKS LOGS */}
            {view === 'webhooks' && (
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 px-2">Recent Webhook Logs</h3>
                    <div className="space-y-2">
                        {webhooks.map((log: any) => (
                            <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm font-mono text-xs text-slate-600">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-50">
                                    <span className="font-bold text-blue-600 uppercase">{log.source}</span>
                                    <span className="text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                                </div>
                                <pre className="overflow-x-auto text-[10px] bg-slate-50 p-2 rounded-lg">{JSON.stringify(log.payload, null, 2)}</pre>
                            </div>
                        ))}
                        {webhooks.length === 0 && <div className="text-center py-20 text-slate-400 italic">No logs found</div>}
                    </div>
                </div>
            )}
        </main>
    </div>
  );
}
