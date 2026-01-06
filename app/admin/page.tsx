
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn, formatCurrency } from '../../lib/utils';
import { Loader2, Lock, Trash2, Edit2, Send, Search, Package, Wifi, LayoutDashboard, Users, Activity, Terminal, Megaphone, Server, Save, Plus, Ban, ArrowUpCircle, RefreshCw, FileText, CheckCircle2, AlertCircle, ShoppingBag, Truck, MessageSquare, Download, UploadCloud, Bell } from 'lucide-react';
import { DataPlan, Product, Transaction, Agent } from '../../types';
import { toast } from '../../lib/toast';
import { SharedReceipt } from '../../components/SharedReceipt';
import { toPng } from 'html-to-image';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'dashboard' | 'products' | 'plans' | 'transactions' | 'orders' | 'agents' | 'support' | 'console' | 'broadcast' | 'webhooks'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [agents, setAgents] = useState<(Agent & { _count: { transactions: number } })[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  // Forms
  const [productForm, setProductForm] = useState<Partial<Product>>({ name: '', description: '', price: 0, image: '', category: 'device' });
  const [planForm, setPlanForm] = useState<Partial<DataPlan>>({ network: 'MTN', data: '', validity: '30 Days', price: 0, planId: 0 });
  const [broadcastForm, setBroadcastForm] = useState({ content: '', type: 'info', isActive: true });
  const [pushForm, setPushForm] = useState({ title: '', body: '' });
  const [editMode, setEditMode] = useState(false);

  // Console State
  const [consoleType, setConsoleType] = useState<'amigo' | 'flutterwave'>('amigo');
  const [consoleEndpoint, setConsoleEndpoint] = useState('');
  const [consoleMethod, setConsoleMethod] = useState('GET');
  const [consolePayload, setConsolePayload] = useState('{}');
  const [consoleOutput, setConsoleOutput] = useState<any>(null);

  // Receipt
  const receiptRef = useRef<HTMLDivElement>(null);
  const [receiptTx, setReceiptTx] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated) refreshAll();
  }, [isAuthenticated, view]);

  const refreshAll = async () => {
    setLoading(true);
    try {
        if (['dashboard', 'products'].includes(view)) await fetchProducts();
        if (['dashboard', 'plans'].includes(view)) await fetchPlans();
        if (['dashboard', 'agents'].includes(view)) await fetchAgents();
        if (['dashboard', 'transactions', 'orders'].includes(view)) await fetchTransactions();
        if (view === 'webhooks') await fetchWebhooks();
        if (view === 'broadcast') await fetchBroadcast();
        if (view === 'support') await fetchTickets();
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
  const fetchTickets = async () => {
      const res = await fetch('/api/admin/support', { method: 'POST', body: JSON.stringify({ password }) });
      const data = await res.json();
      if(data.tickets) setTickets(data.tickets);
  };

  const checkAuth = async () => {
      setLoading(true);
      try {
          const res = await fetch('/api/admin/auth', { method: 'POST', body: JSON.stringify({ password }) });
          if (res.ok) setIsAuthenticated(true);
          else toast.error("Incorrect Password");
      } catch (e) { toast.error("Error"); } 
      finally { setLoading(false); }
  };

  // --- ACTIONS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setProductForm(prev => ({ ...prev, image: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const saveProduct = async () => {
      await fetch('/api/products', {
          method: editMode ? 'PUT' : 'POST',
          body: JSON.stringify(productForm)
      });
      setEditMode(false);
      setProductForm({ name: '', description: '', price: 0, image: '', category: 'device' });
      fetchProducts();
      toast.success("Product Saved");
  };

  const deleteProduct = async (id: string) => {
      if(!confirm("Delete?")) return;
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      fetchProducts();
  };

  const savePlan = async () => {
      await fetch('/api/data-plans', {
          method: editMode ? 'PUT' : 'POST',
          body: JSON.stringify(planForm)
      });
      setEditMode(false);
      fetchPlans();
      toast.success("Plan Saved");
  };

  const deletePlan = async (id: string) => {
      if(!confirm("Delete?")) return;
      await fetch(`/api/data-plans?id=${id}`, { method: 'DELETE' });
      fetchPlans();
  };

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

  const updateBroadcast = async () => {
      await fetch('/api/system/message', {
          method: 'POST',
          body: JSON.stringify({ ...broadcastForm, password })
      });
      toast.success("Broadcast Updated");
  };

  const sendPushNotification = () => {
      // Simulation for UI completeness as real push needs Service Workers
      toast.success(`Push Sent: ${pushForm.title}`);
      setPushForm({ title: '', body: '' });
  };

  const executeConsole = async () => {
      setLoading(true);
      try {
          const endpoint = consoleType === 'amigo' ? '/api/admin/console' : '/api/admin/console/flutterwave';
          const res = await fetch(endpoint, {
              method: 'POST',
              body: JSON.stringify({
                  endpoint: consoleEndpoint,
                  method: consoleMethod,
                  payload: JSON.parse(consolePayload),
                  password
              })
          });
          setConsoleOutput(await res.json());
      } catch(e) { setConsoleOutput({ error: 'Failed' }); }
      finally { setLoading(false); }
  };

  const applyTemplate = (type: string) => {
      if (type === 'amigo_data') {
          setConsoleEndpoint('/data/');
          setConsolePayload(JSON.stringify({ network: 1, mobile_number: "080...", plan: 1001, Ported_number: true }, null, 2));
      } else if (type === 'flw_verify') {
          setConsoleMethod('GET');
          setConsoleEndpoint('/transactions/verify_by_reference?tx_ref=TX_REF_HERE');
          setConsolePayload('{}');
      }
  };

  const markDelivered = async (tx_ref: string) => {
      await fetch('/api/admin/transactions/update', {
          method: 'POST',
          body: JSON.stringify({ tx_ref, status: 'delivered', password })
      });
      fetchTransactions();
      toast.success("Order marked as Delivered");
  };

  const generateReceipt = (tx: Transaction) => {
      setReceiptTx(tx);
      setTimeout(async () => {
          if (receiptRef.current) {
              const dataUrl = await toPng(receiptRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: '#ffffff' });
              const link = document.createElement('a');
              link.download = `RECEIPT-${tx.tx_ref}.png`;
              link.href = dataUrl;
              link.click();
              toast.success("Downloaded");
              setReceiptTx(null);
          }
      }, 500);
  };

  const filteredTransactions = transactions.filter(t => 
      t.tx_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery)
  );

  const pendingOrders = transactions.filter(t => t.type === 'ecommerce' && t.status === 'paid');

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
        {receiptTx && <SharedReceipt ref={receiptRef} transaction={receiptTx} />}

        <aside className="w-64 bg-slate-900 text-white hidden lg:flex flex-col fixed h-full z-10 shadow-2xl">
            <div className="p-8 border-b border-slate-800">
                <h1 className="text-xl font-black tracking-tighter">SAUKI MART</h1>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Master Control</p>
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto no-scrollbar">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'orders', label: 'Store Orders', icon: ShoppingBag, badge: pendingOrders.length },
                    { id: 'transactions', label: 'Transactions', icon: FileText },
                    { id: 'products', label: 'Inventory', icon: Package },
                    { id: 'plans', label: 'Data Plans', icon: Wifi },
                    { id: 'agents', label: 'Agents', icon: Users },
                    { id: 'support', label: 'Support Tickets', icon: MessageSquare },
                    { id: 'console', label: 'API Console', icon: Terminal },
                    { id: 'broadcast', label: 'Broadcast / Push', icon: Megaphone },
                    { id: 'webhooks', label: 'Webhook Logs', icon: Activity },
                ].map(item => (
                    <button key={item.id} onClick={() => setView(item.id as any)} className={cn("flex items-center justify-between w-full p-4 rounded-2xl text-xs font-black transition-all", view === item.id ? "bg-white text-slate-900" : "text-slate-500 hover:bg-slate-800")}>
                        <div className="flex items-center gap-4"><item.icon className="w-5 h-5" /> {item.label}</div>
                        {item.badge ? <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[9px]">{item.badge}</span> : null}
                    </button>
                ))}
            </nav>
        </aside>

        <main className="flex-1 lg:ml-64 p-8 overflow-y-auto h-screen bg-slate-50">
             <header className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{view.replace('_', ' ')}</h2>
                <button onClick={refreshAll} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50"><RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} /></button>
            </header>

            {/* VIEWS */}
            {view === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pending Orders</p>
                        <h3 className="text-4xl font-black text-slate-900">{pendingOrders.length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Agents</p>
                        <h3 className="text-4xl font-black text-slate-900">{agents.length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Inventory</p>
                        <h3 className="text-4xl font-black text-slate-900">{products.length} Items</h3>
                    </div>
                </div>
            )}

            {view === 'orders' && (
                <div className="space-y-6">
                    {pendingOrders.length === 0 ? <div className="text-center py-20 text-slate-400 font-bold uppercase text-xs">No Pending Orders</div> : 
                    pendingOrders.map(tx => (
                        <div key={tx.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600"><ShoppingBag className="w-6 h-6" /></div>
                                <div>
                                    <h4 className="font-black text-slate-900 uppercase text-sm">{tx.deliveryData?.manifest || 'Order'}</h4>
                                    <p className="text-xs text-slate-500 font-bold">{tx.customerName} • {tx.phone}</p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-1">{tx.deliveryState}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="font-black text-lg">{formatCurrency(tx.amount)}</p>
                                    <p className="text-[9px] bg-blue-100 text-blue-700 px-2 rounded-full inline-block font-bold uppercase">Paid</p>
                                </div>
                                <button onClick={() => markDelivered(tx.tx_ref)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 hover:bg-slate-800">
                                    <Truck className="w-4 h-4" /> Mark Delivered
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {view === 'products' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input className="p-3 border rounded-xl" placeholder="Name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                            <input className="p-3 border rounded-xl" placeholder="Price" type="number" value={productForm.price || ''} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} />
                            <select className="p-3 border rounded-xl" value={productForm.category} onChange={(e:any) => setProductForm({...productForm, category: e.target.value})}>
                                <option value="device">Device</option><option value="sim">SIM</option><option value="package">Package</option>
                            </select>
                            <label className="p-3 border border-dashed border-slate-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50">
                                <UploadCloud className="w-5 h-5 mr-2 text-slate-400" />
                                <span className="text-xs font-bold text-slate-500">{productForm.image ? 'Image Selected' : 'Upload Image'}</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>
                        </div>
                        <button onClick={saveProduct} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-xs">Save Product</button>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        {products.map(p => (
                            <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                                <img src={p.image} className="w-12 h-12 rounded-lg object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">{p.name}</p>
                                    <p className="text-blue-600 font-black text-xs">{formatCurrency(p.price)}</p>
                                </div>
                                <button onClick={() => deleteProduct(p.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'transactions' && (
                <div className="space-y-4">
                     <div className="bg-white p-4 rounded-[2rem] border border-slate-100 flex gap-4">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input className="flex-1 outline-none font-bold" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                <tr><th className="p-4">Ref</th><th className="p-4">Type</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-slate-50/50">
                                        <td className="p-4 font-mono font-bold text-xs">{tx.tx_ref}</td>
                                        <td className="p-4 font-black uppercase text-xs">{tx.type}</td>
                                        <td className="p-4 font-bold">{formatCurrency(tx.amount)}</td>
                                        <td className="p-4"><span className={cn("px-2 py-1 rounded text-[9px] font-black uppercase", tx.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-slate-100')}>{tx.status}</span></td>
                                        <td className="p-4">
                                            <button onClick={() => generateReceipt(tx)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"><Download className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'support' && (
                <div className="space-y-4">
                    {tickets.map(t => (
                        <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-100">
                            <div className="flex justify-between mb-2">
                                <span className="font-black text-slate-900">{t.phone}</span>
                                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded uppercase font-bold">{t.status}</span>
                            </div>
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">{t.message}</p>
                            <p className="text-[10px] text-slate-400 mt-2 text-right">{new Date(t.createdAt).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            )}

            {view === 'broadcast' && (
                <div className="grid grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center">
                        <Megaphone className="w-10 h-10 text-slate-900 mx-auto mb-4" />
                        <h3 className="text-xl font-black uppercase mb-4">App Ticker</h3>
                        <textarea className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-sm" rows={3} value={broadcastForm.content} onChange={e => setBroadcastForm({...broadcastForm, content: e.target.value})} />
                        <div className="flex justify-center gap-2 mb-4">
                            {['info', 'warning', 'alert'].map(t => (
                                <button key={t} onClick={() => setBroadcastForm({...broadcastForm, type: t})} className={cn("px-3 py-1 rounded text-[10px] font-black uppercase border", broadcastForm.type === t ? "bg-slate-900 text-white" : "bg-white")}>{t}</button>
                            ))}
                        </div>
                        <button onClick={updateBroadcast} className="w-full bg-slate-900 text-white p-3 rounded-xl font-black uppercase text-xs">Update Ticker</button>
                    </div>
                    
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center">
                        <Bell className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-xl font-black uppercase mb-4">Push Notification</h3>
                        <input className="w-full p-3 bg-slate-50 rounded-xl mb-3 text-sm font-bold" placeholder="Title" value={pushForm.title} onChange={e => setPushForm({...pushForm, title: e.target.value})} />
                        <textarea className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-sm" rows={2} placeholder="Body" value={pushForm.body} onChange={e => setPushForm({...pushForm, body: e.target.value})} />
                        <button onClick={sendPushNotification} className="w-full bg-blue-600 text-white p-3 rounded-xl font-black uppercase text-xs">Send Push</button>
                    </div>
                </div>
            )}

            {view === 'console' && (
                <div className="bg-slate-900 rounded-[2rem] p-6 text-white min-h-[500px] flex flex-col">
                    <div className="flex gap-4 mb-6">
                        <button onClick={() => setConsoleType('amigo')} className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase", consoleType === 'amigo' ? "bg-blue-600" : "bg-white/10")}>Amigo</button>
                        <button onClick={() => setConsoleType('flutterwave')} className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase", consoleType === 'flutterwave' ? "bg-orange-600" : "bg-white/10")}>Flutterwave</button>
                        <div className="ml-auto flex gap-2">
                            <button onClick={() => applyTemplate('amigo_data')} className="px-3 py-1 bg-white/5 rounded text-[10px] uppercase font-bold hover:bg-white/20">Template: Data</button>
                            <button onClick={() => applyTemplate('flw_verify')} className="px-3 py-1 bg-white/5 rounded text-[10px] uppercase font-bold hover:bg-white/20">Template: Verify</button>
                        </div>
                    </div>
                    <div className="flex gap-2 mb-4">
                        <select value={consoleMethod} onChange={e => setConsoleMethod(e.target.value)} className="bg-black/30 p-3 rounded-xl text-xs font-bold"><option>GET</option><option>POST</option></select>
                        <input className="flex-1 bg-black/30 p-3 rounded-xl text-xs font-mono" value={consoleEndpoint} onChange={e => setConsoleEndpoint(e.target.value)} placeholder="/endpoint" />
                        <button onClick={executeConsole} className="bg-green-600 px-6 rounded-xl font-black uppercase text-xs">Send</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <textarea className="bg-black/30 p-4 rounded-xl font-mono text-xs text-green-400 resize-none" value={consolePayload} onChange={e => setConsolePayload(e.target.value)} />
                        <div className="bg-black/50 p-4 rounded-xl font-mono text-xs overflow-auto"><pre>{consoleOutput ? JSON.stringify(consoleOutput, null, 2) : '// Response...'}</pre></div>
                    </div>
                </div>
            )}
        </main>
    </div>
  );
}
