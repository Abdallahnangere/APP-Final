
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn, formatCurrency, generateReceiptData } from '../../lib/utils';
import { Loader2, Lock, Trash2, Edit2, Send, Search, Package, Wifi, LayoutDashboard, Users, Activity, Terminal, Megaphone, Server, Save, Plus, Ban, ArrowUpCircle, RefreshCw, FileText, CheckCircle2, AlertCircle, ShoppingBag, Truck, MessageSquare, Download, UploadCloud, Bell, X, ChevronRight, Smartphone, ArrowDownCircle, Banknote, Landmark } from 'lucide-react';
import { DataPlan, Product, Transaction, Agent } from '../../types';
import { toast } from '../../lib/toast';
import { SharedReceipt } from '../../components/SharedReceipt';
import { toPng } from 'html-to-image';

// Force Desktop View Wrapper - Premium Styling
const DesktopWrapper = ({ children }: { children?: React.ReactNode }) => (
    <div className="min-h-screen w-screen flex flex-row overflow-hidden fixed inset-0 z-50 bg-gradient-to-br from-primary-50 via-white to-primary-50">
        {children}
    </div>
);

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'dashboard' | 'products' | 'plans' | 'transactions' | 'orders' | 'agents' | 'support' | 'console' | 'communication' | 'webhooks'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingTx, setUpdatingTx] = useState<string | null>(null);
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [agents, setAgents] = useState<(Agent & { _count: { transactions: number } })[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  // Agent Drilldown State
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentHistory, setAgentHistory] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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
        if (view === 'dashboard') {
            await Promise.all([fetchProducts(), fetchPlans(), fetchAgents(), fetchTransactions()]);
        }
        else if (view === 'products') await fetchProducts();
        else if (view === 'plans') await fetchPlans();
        else if (view === 'agents') await fetchAgents();
        else if (view === 'transactions' || view === 'orders') await fetchTransactions();
        else if (view === 'webhooks') await fetchWebhooks();
        else if (view === 'communication') await fetchBroadcast();
        else if (view === 'support') await fetchTickets();
    } catch (e) {
        console.error("Data fetch error", e);
    } 
    finally { setLoading(false); }
  };

  // --- FETCHERS ---
  const fetchProducts = async () => setProducts(await fetch('/api/products').then(r => r.json()).catch(() => []));
  const fetchPlans = async () => setPlans(await fetch('/api/data-plans').then(r => r.json()).catch(() => []));
  const fetchTransactions = async () => setTransactions(await fetch('/api/transactions/list').then(r => r.json()).catch(() => []));
  
  const fetchAgents = async () => {
      try {
        const res = await fetch('/api/admin/agents', { method: 'POST', body: JSON.stringify({ password }) });
        const data = await res.json();
        setAgents(data.agents || []);
      } catch (e) { setAgents([]); }
  };
  
  const fetchWebhooks = async () => {
      try {
        const res = await fetch('/api/admin/webhooks', { method: 'POST', body: JSON.stringify({ password }) });
        const data = await res.json();
        setWebhooks(data.logs || []);
      } catch (e) { setWebhooks([]); }
  };
  
  const fetchBroadcast = async () => {
      try {
        const res = await fetch('/api/system/message').then(r => r.json());
        if(res && res.type !== 'PUSH') setBroadcastForm(res); // Only load if not push
      } catch(e) {}
  };
  
  const fetchTickets = async () => {
      try {
        const res = await fetch('/api/admin/support', { method: 'POST', body: JSON.stringify({ password }) });
        const data = await res.json();
        setTickets(data.tickets || []);
      } catch (e) { setTickets([]); }
  };

  const openAgentDetails = async (agent: Agent) => {
      setSelectedAgent(agent);
      setLoadingHistory(true);
      try {
          const res = await fetch(`/api/agent/transactions?agentId=${agent.id}`);
          const data = await res.json();
          setAgentHistory(data.transactions || []);
      } catch (e) {
          toast.error("Could not load history");
      } finally {
          setLoadingHistory(false);
      }
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
      setPlanForm({ network: 'MTN', data: '', validity: '30 Days', price: 0, planId: 0 });
      fetchPlans();
      toast.success("Plan Saved");
  };

  const deletePlan = async (id: string) => {
      if(!confirm("Delete?")) return;
      await fetch(`/api/data-plans?id=${id}`, { method: 'DELETE' });
      fetchPlans();
  };

  // UPDATED: Fund Agent now handles credit AND debit
  const fundAgent = async (agentId: string, type: 'credit' | 'debit') => {
      const amount = prompt(`Amount to ${type.toUpperCase()}:`);
      if(!amount) return;
      await fetch('/api/admin/agent-fund', {
          method: 'POST',
          body: JSON.stringify({ agentId, amount: Number(amount), password, action: type })
      });
      fetchAgents();
      toast.success(`Wallet ${type === 'credit' ? 'Funded' : 'Debited'}`);
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
      toast.success("Ticker Updated");
  };

  const sendPushNotification = async () => {
      if(!pushForm.title || !pushForm.body) return toast.error("Enter Title & Body");
      try {
          await fetch('/api/admin/push', {
              method: 'POST',
              body: JSON.stringify({ ...pushForm, password })
          });
          toast.success(`Push Sent`);
          setPushForm({ title: '', body: '' });
      } catch(e) {
          toast.error("Push failed");
      }
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
      toast.success("Marked Delivered");
  };

  const toggleToPaid = async (tx_ref: string) => {
      setUpdatingTx(tx_ref);
      try {
          await fetch('/api/admin/transactions/update', {
              method: 'POST',
              body: JSON.stringify({ tx_ref, status: 'paid', password })
          });
          await fetchTransactions();
          toast.success("Transaction marked as paid. User can now proceed.");
      } catch (e) {
          toast.error("Failed to update transaction");
      } finally {
          setUpdatingTx(null);
      }
  };

  // UPDATED: Uses centralized helper for consistent receipts
  const generateReceipt = (tx: Transaction) => {
      // Find agent if agentId exists
      let agent = undefined;
      if (tx.agentId) {
          agent = agents.find(a => a.id === tx.agentId);
      }
      const enrichedTx = generateReceiptData(tx, agent);
      setReceiptTx(enrichedTx);
      
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

  const filteredTransactions = transactions?.filter(t => 
      t.tx_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery)
  ) || [];

  const pendingOrders = transactions?.filter(t => t.type === 'ecommerce' && t.status === 'paid') || [];

  if (!isAuthenticated) return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-6 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl"></div>
        
        <div className="bg-white/95 backdrop-blur-xl p-12 rounded-3xl shadow-elevation-8 w-full max-w-md text-center border border-white/20 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-elevation-4">
                <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">SAUKI Admin</h1>
            <p className="text-primary-500 text-sm font-medium mb-8">Master Control Panel</p>
            <input 
              type="password" 
              className="border border-primary-200 p-4 rounded-2xl w-full mb-6 text-center text-2xl font-bold tracking-widest focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            <button 
              onClick={checkAuth} 
              className="bg-accent-blue text-white p-4 rounded-xl w-full font-bold uppercase tracking-wide shadow-elevation-4 hover:bg-blue-600 active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Enter Dashboard'}
            </button>
            <p className="text-xs text-primary-400 mt-6">Secured access • Encrypted connection</p>
        </div>
    </div>
  );

  return (
    <DesktopWrapper>
        {receiptTx && (
            <SharedReceipt 
                ref={receiptRef} 
                transaction={receiptTx}
            />
        )}

        <aside className="w-72 bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 text-white flex flex-col h-full z-10 shadow-2xl shrink-0 border-r border-primary-700 overflow-hidden">
            <div className="p-6 border-b border-primary-700/50 shrink-0">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center font-bold">S</div>
                    <h1 className="text-2xl font-bold tracking-tight">SAUKI</h1>
                </div>
                <p className="text-accent-blue text-xs font-semibold uppercase tracking-widest">Master Control</p>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'orders', label: 'Store Orders', icon: ShoppingBag, badge: pendingOrders.length },
                    { id: 'transactions', label: 'All Transactions', icon: FileText },
                    { id: 'products', label: 'Inventory', icon: Package },
                    { id: 'plans', label: 'Data Plans', icon: Wifi },
                    { id: 'agents', label: 'Agents', icon: Users },
                    { id: 'support', label: 'Support Tickets', icon: MessageSquare },
                    { id: 'communication', label: 'Notifications', icon: Megaphone },
                    { id: 'console', label: 'API Console', icon: Terminal },
                    { id: 'webhooks', label: 'Webhooks Log', icon: Activity },
                ].map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => setView(item.id as any)} 
                      className={cn(
                        "flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-semibold transition-all group",
                        view === item.id 
                          ? "bg-white text-primary-900 shadow-elevation-4" 
                          : "text-primary-300 hover:bg-white/10"
                      )}
                    >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4" /> 
                          <span>{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span className="bg-accent-red text-white px-2 py-0.5 rounded-full text-[9px] font-bold animate-pulse">
                            {item.badge}
                          </span>
                        ) : null}
                    </button>
                ))}
            </nav>
            
            {/* Admin Footer Info */}
            <div className="p-4 border-t border-primary-700/50 space-y-3 shrink-0">
                <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-[10px] space-y-1">
                    <p className="text-primary-400 font-semibold uppercase tracking-wide">Admin Wallet</p>
                    <p className="text-white font-bold flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5" />
                        Zenith: 1210631613
                    </p>
                </div>
            </div>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto h-screen bg-primary-50 relative flex flex-col">
             {/* Header */}
             <header className="flex justify-between items-center mb-8 shrink-0">
                <div>
                    <p className="text-primary-600 text-sm font-semibold uppercase tracking-wide mb-1">Control Panel</p>
                    <h2 className="text-4xl font-bold text-primary-900 uppercase tracking-tight">{view.replace('_', ' ')}</h2>
                </div>
                <div className="flex gap-4 items-center">
                    <button 
                      onClick={refreshAll} 
                      className="p-3 bg-white rounded-xl shadow-elevation-2 border border-primary-100 hover:bg-primary-50 transition-all"
                      title="Refresh data"
                    >
                        <RefreshCw className={cn("w-5 h-5 text-primary-600", loading && "animate-spin")} />
                    </button>
                </div>
            </header>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                {view === 'dashboard' && (
                <div className="space-y-8">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Pending Orders Card */}
                        <div className="bg-gradient-to-br from-white to-primary-50/50 p-8 rounded-2xl border border-primary-100/50 shadow-elevation-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-red/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative z-10">
                                <p className="text-primary-600 text-xs font-semibold uppercase tracking-widest mb-2">Pending Orders</p>
                                <h3 className="text-5xl font-bold text-primary-900 mb-4">{pendingOrders.length}</h3>
                                <div className="flex items-center gap-2 text-accent-red text-sm font-semibold">
                                    <ShoppingBag className="w-5 h-5" /> Action Required
                                </div>
                            </div>
                        </div>

                        {/* Total Agents Card */}
                        <div className="bg-gradient-to-br from-white to-primary-50/50 p-8 rounded-2xl border border-primary-100/50 shadow-elevation-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative z-10">
                                <p className="text-primary-600 text-xs font-semibold uppercase tracking-widest mb-2">Partner Network</p>
                                <h3 className="text-5xl font-bold text-primary-900 mb-4">{agents?.length || 0}</h3>
                                <div className="flex items-center gap-2 text-accent-blue text-sm font-semibold">
                                    <Users className="w-5 h-5" /> Active Agents
                                </div>
                            </div>
                        </div>

                        {/* Inventory Card */}
                        <div className="bg-gradient-to-br from-white to-primary-50/50 p-8 rounded-2xl border border-primary-100/50 shadow-elevation-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="relative z-10">
                                <p className="text-primary-600 text-xs font-semibold uppercase tracking-widest mb-2">Inventory</p>
                                <h3 className="text-5xl font-bold text-primary-900 mb-4">{products?.length || 0}</h3>
                                <div className="flex items-center gap-2 text-accent-green text-sm font-semibold">
                                    <Package className="w-5 h-5" /> Items
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl border border-primary-100/50 shadow-elevation-2 p-8">
                        <h3 className="text-lg font-bold text-primary-900 mb-6 uppercase tracking-tight">Quick Actions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button onClick={() => setView('orders')} className="p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors border border-primary-100 font-semibold text-primary-900 text-sm">
                                <ShoppingBag className="w-5 h-5 mx-auto mb-2" />
                                View Orders
                            </button>
                            <button onClick={() => setView('agents')} className="p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors border border-primary-100 font-semibold text-primary-900 text-sm">
                                <Users className="w-5 h-5 mx-auto mb-2" />
                                Manage Agents
                            </button>
                            <button onClick={() => setView('products')} className="p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors border border-primary-100 font-semibold text-primary-900 text-sm">
                                <Package className="w-5 h-5 mx-auto mb-2" />
                                Inventory
                            </button>
                            <button onClick={() => setView('communication')} className="p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors border border-primary-100 font-semibold text-primary-900 text-sm">
                                <Megaphone className="w-5 h-5 mx-auto mb-2" />
                                Send Message
                            </button>
                        </div>
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
                                <button onClick={() => generateReceipt(tx)} className="text-blue-600 p-2"><Download className="w-5 h-5" /></button>
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
                        <h4 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-4">{editMode ? 'Edit Product' : 'Add New Product'}</h4>
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
                        <div className="flex gap-2">
                             <button onClick={saveProduct} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-xs">Save</button>
                             {editMode && <button onClick={() => { setEditMode(false); setProductForm({ name: '', description: '', price: 0, image: '', category: 'device' }); }} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-black uppercase text-xs">Cancel</button>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {products?.map(p => (
                            <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 group hover:shadow-md transition-all">
                                <img src={p.image} className="w-12 h-12 rounded-lg object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">{p.name}</p>
                                    <p className="text-blue-600 font-black text-xs">{formatCurrency(p.price)}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => { setProductForm(p); setEditMode(true); }} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                        <div className="flex gap-2">
                            <button onClick={savePlan} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
                            {editMode && <button onClick={() => { setEditMode(false); setPlanForm({ network: 'MTN', data: '', validity: '30 Days', price: 0, planId: 0 }); }} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-black uppercase text-xs">Cancel</button>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plans?.length > 0 ? plans.map(p => (
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
                        )) : <div className="col-span-2 text-center text-slate-400 py-10">No Plans Configured</div>}
                    </div>
                </div>
            )}

            {view === 'transactions' && (
                <div className="space-y-4">
                     <div className="bg-white p-4 rounded-[2rem] border border-slate-100 flex gap-4 shrink-0">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input className="flex-1 outline-none font-bold" placeholder="Search by reference or phone..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest sticky top-0">
                                <tr><th className="p-4">Date & Time</th><th className="p-4">Ref</th><th className="p-4">Phone</th><th className="p-4">Type</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Action</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-slate-50/50">
                                        <td className="p-4 font-mono text-xs text-slate-600 whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
                                        <td className="p-4 font-mono font-bold text-xs">{tx.tx_ref.slice(0, 12)}</td>
                                        <td className="p-4 font-bold text-xs">{tx.phone}</td>
                                        <td className="p-4 font-black uppercase text-xs">{tx.type}</td>
                                        <td className="p-4 font-bold">{formatCurrency(tx.amount)}</td>
                                        <td className="p-4"><span className={cn("px-2 py-1 rounded text-[9px] font-black uppercase", 
                                            tx.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                            tx.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                                            tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-slate-100'
                                        )}>{tx.status}</span></td>
                                        <td className="p-4 flex gap-2">
                                            {tx.status === 'pending' && (
                                                <button 
                                                    onClick={() => toggleToPaid(tx.tx_ref)}
                                                    disabled={updatingTx === tx.tx_ref}
                                                    className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded text-[9px] font-black uppercase flex items-center gap-1 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {updatingTx === tx.tx_ref ? <Loader2 className="w-3 h-3 animate-spin" /> : <Banknote className="w-3 h-3" />}
                                                    Paid
                                                </button>
                                            )}
                                            <button onClick={() => generateReceipt(tx)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg flex items-center gap-1 text-[10px] font-black uppercase"><Download className="w-4 h-4" /> Receipt</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'communication' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* BROADCAST SECTION */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center">
                        <Megaphone className="w-10 h-10 text-slate-900 mx-auto mb-4" />
                        <h3 className="text-xl font-black uppercase mb-2">App Ticker</h3>
                        <p className="text-xs text-slate-400 mb-4">Scrolling message on Home Screen</p>
                        
                        <textarea className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-sm" rows={3} value={broadcastForm.content} onChange={e => setBroadcastForm({...broadcastForm, content: e.target.value})} />
                        <div className="flex justify-center gap-2 mb-4">
                            {['info', 'warning', 'alert'].map(t => (
                                <button key={t} onClick={() => setBroadcastForm({...broadcastForm, type: t})} className={cn("px-3 py-1 rounded text-[10px] font-black uppercase border", broadcastForm.type === t ? "bg-slate-900 text-white" : "bg-white")}>{t}</button>
                            ))}
                        </div>
                        <button onClick={updateBroadcast} className="w-full bg-slate-900 text-white p-3 rounded-xl font-black uppercase text-xs">Update Ticker</button>
                    </div>
                    
                    {/* PUSH NOTIFICATION SECTION */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-bl-xl">Urgent Alerts</div>
                        <Bell className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-xl font-black uppercase mb-2">Mobile Push</h3>
                        <p className="text-xs text-slate-400 mb-4">Pop-up alert on user devices</p>

                        <input className="w-full p-3 bg-slate-50 rounded-xl mb-3 text-sm font-bold" placeholder="Notification Title" value={pushForm.title} onChange={e => setPushForm({...pushForm, title: e.target.value})} />
                        <textarea className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-sm" rows={2} placeholder="Message Body" value={pushForm.body} onChange={e => setPushForm({...pushForm, body: e.target.value})} />
                        <button onClick={sendPushNotification} className="w-full bg-blue-600 text-white p-3 rounded-xl font-black uppercase text-xs">Send Blast</button>
                    </div>
                </div>
            )}
            
            {/* AGENTS WITH DRILLDOWN SIDE PANEL */}
            {view === 'agents' && (
                <div className="flex h-full gap-4">
                    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto content-start flex-1 transition-all duration-300", selectedAgent ? "md:w-1/2 hidden md:grid" : "w-full")}>
                        {agents?.map(agent => (
                            <div key={agent.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                {!agent.isActive && <div className="absolute inset-0 bg-red-50/50 backdrop-blur-[1px] flex items-center justify-center z-10"><span className="bg-red-600 text-white px-4 py-2 rounded-xl font-black uppercase">Suspended</span></div>}
                                
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="font-black text-slate-900 uppercase text-lg">{agent.firstName} {agent.lastName}</h4>
                                        <p className="text-xs text-slate-500 font-bold">{agent.phone}</p>
                                    </div>
                                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase">{agent._count?.transactions || 0} Txns</span>
                                </div>

                                <div className="grid grid-cols-1 gap-4 mb-6">
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Main Wallet</p>
                                        <p className="text-xl font-black text-slate-900">{formatCurrency(agent.balance)}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 relative z-20">
                                    <button onClick={() => fundAgent(agent.id, 'credit')} className="flex-1 bg-green-600 text-white p-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-green-700"><ArrowUpCircle className="w-4 h-4" /> Credit</button>
                                    <button onClick={() => fundAgent(agent.id, 'debit')} className="flex-1 bg-slate-900 text-white p-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-slate-800"><ArrowDownCircle className="w-4 h-4" /> Debit</button>
                                    <button onClick={() => toggleAgent(agent.id)} className={cn("p-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2", agent.isActive ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200")}>
                                        <Ban className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => openAgentDetails(agent)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"><ChevronRight className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* SLIDE-OVER DETAIL PANEL */}
                    {selectedAgent && (
                        <div className="w-full md:w-1/2 bg-white rounded-[2rem] border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="font-black text-lg uppercase">{selectedAgent.firstName}'s History</h3>
                                    <p className="text-xs text-slate-500 font-mono">ID: {selectedAgent.id.slice(0,8)}</p>
                                </div>
                                <button onClick={() => setSelectedAgent(null)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {loadingHistory ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-slate-300" /></div> : (
                                    <table className="w-full text-left text-xs">
                                        <thead className="text-slate-400 uppercase font-black border-b border-slate-100">
                                            <tr><th className="py-2">Type</th><th>Amount</th><th>Status</th><th>Receipt</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {agentHistory.map(tx => (
                                                <tr key={tx.id} className="hover:bg-slate-50">
                                                    <td className="py-3 font-bold uppercase">{tx.type}</td>
                                                    <td className="py-3">{formatCurrency(tx.amount)}</td>
                                                    <td className="py-3"><span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase", tx.status === 'delivered' ? "bg-green-100 text-green-700" : "bg-slate-100")}>{tx.status}</span></td>
                                                    <td className="py-3"><button onClick={() => generateReceipt(tx)} className="text-blue-500"><Download className="w-4 h-4"/></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {view === 'webhooks' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                        {webhooks.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 font-bold uppercase">No Webhook Logs Yet</div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    <tr><th className="p-4">Timestamp</th><th className="p-4">Source</th><th className="p-4">Status</th><th className="p-4">Payload</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                                    {webhooks.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50/50">
                                            <td className="p-4 text-xs text-slate-500 font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                                            <td className="p-4 font-bold uppercase text-xs"><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">{log.source}</span></td>
                                            <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[9px] font-black uppercase">Received</span></td>
                                            <td className="p-4"><button onClick={() => alert(JSON.stringify(log.payload, null, 2))} className="text-blue-600 hover:underline text-xs font-bold">View</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div className="text-xs text-slate-500 text-center font-mono">Total: {webhooks.length} logs</div>
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
             {view === 'support' && (
                <div className="space-y-4">
                    {tickets?.map(t => (
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

            </div>
        </main>
    </DesktopWrapper>
  );
}
