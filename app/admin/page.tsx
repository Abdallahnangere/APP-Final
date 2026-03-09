'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const BLUE = '#007AFF'; const GREEN = '#34C759'; const RED = '#FF3B30'; const GOLD = '#FF9500';

type User = { id: string; first_name: string; last_name: string; phone: string; wallet_balance: number; cashback_balance: number; is_banned: boolean; created_at: string; flw_account_number: string; };
type Plan = { id: string; network: string; network_id: number; plan_id: number; data_size: string; validity: string; selling_price: number; cost_price: number; is_active: boolean; };
type Product = { id: string; name: string; description: string; price: number; cost_price: number; image_url: string; image_base64?: string; in_stock: boolean; shipping_terms: string; pickup_terms: string; category: string; };
type Transaction = { id: string; user_id: string; type: string; description: string; amount: number; status: string; created_at: string; network: string; phone_number: string; product_name: string; receipt_data: Record<string,unknown>; first_name?: string; last_name?: string; phone?: string; };
type Broadcast = { id: string; message: string; is_active: boolean; created_at: string; };
type Webhook = { id: string; event: string; payload: Record<string,unknown>; created_at: string; };
type SimAct = { id: string; user_id: string; serial_number: string; front_image_url: string; back_image_url: string; status: string; created_at: string; first_name?: string; last_name?: string; phone?: string; };
type ChatMsg = { id: string; user_id: string; sender: string; message: string; created_at: string; user_name?: string; delivered_at?: string; read_at?: string; };

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,"SF Pro Display","SF Pro Text",BlinkMacSystemFont,system-ui,sans-serif;background:#F5F5F7;color:#1D1D1F;-webkit-font-smoothing:antialiased}
    ::-webkit-scrollbar{width:8px}::-webkit-scrollbar-thumb{background:#D5D5D7;border-radius:4px}
    input,textarea,select{font-family:inherit;outline:none}
    button{border:none;cursor:pointer;font-family:inherit;background:none}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    .fade-in{animation:fadeIn .2s ease both}
    a{color:inherit;text-decoration:none}
  `}</style>
);

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background:'#FFFFFF',borderRadius:20,padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',border:'1px solid rgba(0,0,0,0.08)', ...style }}>{children}</div>
);

const Btn = ({ children, onClick, variant='primary', size='md', style: s }: { children: React.ReactNode; onClick?: ()=>void; variant?: 'primary'|'danger'|'ghost'|'success'; size?: 'sm'|'md'; style?: React.CSSProperties }) => {
  const bg = variant==='primary'?BLUE:variant==='danger'?RED:variant==='success'?GREEN:'transparent';
  const color = variant==='ghost'?'#3C3C43':'#fff';
  const border = variant==='ghost'?'1px solid rgba(0,0,0,0.15)':'none';
  const pad = size==='sm'?'8px 14px':'12px 20px';
  const font = size==='sm'?13:15;
  return <button onClick={onClick} style={{ background:bg,color,border,borderRadius:12,padding:pad,fontSize:font,fontWeight:600,cursor:'pointer',transition:'all 0.2s cubic-bezier(0.25,0.1,0.25,1)', ...s }} onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1.02)'}} onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1)'}}>{children}</button>;
};

const Input = ({ value, onChange, placeholder, type='text', label, multiline=false }: { value: string; onChange: (v:string)=>void; placeholder?: string; type?: string; label?: string; multiline?: boolean; }) => (
  <div style={{ marginBottom:16 }}>
    {label && <label style={{ display:'block',fontSize:13,fontWeight:600,color:'#6E6E73',marginBottom:8 }}>{label}</label>}
    {multiline ? (
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%',padding:'12px 14px',borderRadius:12,border:'1px solid rgba(0,0,0,0.15)',fontSize:14,color:'#1D1D1F',minHeight:100,resize:'vertical',lineHeight:1.5,fontFamily:'inherit',transition:'border 0.2s' }} 
        onFocus={e=>(e.currentTarget.style.borderColor='rgba(0,113,227,0.3)')}
        onBlur={e=>(e.currentTarget.style.borderColor='rgba(0,0,0,0.15)')} />
    ) : (
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%',padding:'12px 14px',borderRadius:12,border:'1px solid rgba(0,0,0,0.15)',fontSize:14,color:'#1D1D1F',fontFamily:'inherit',transition:'border 0.2s' }}
        onFocus={e=>(e.currentTarget.style.borderColor='rgba(0,113,227,0.3)')}
        onBlur={e=>(e.currentTarget.style.borderColor='rgba(0,0,0,0.15)')} />
    )}
  </div>
);

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [tab, setTab] = useState<'overview'|'users'|'plans'|'products'|'transactions'|'orders'|'broadcasts'|'sim'|'webhooks'|'console'|'analytics'>('overview');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  // Data
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [simActs, setSimActs] = useState<SimAct[]>([]);
  const [analytics, setAnalytics] = useState<Record<string,unknown>>({});
  const [selectedUser, setSelectedUser] = useState<User|null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string|null>(null);

  // Forms
  const [planForm, setPlanForm] = useState({ network:'MTN', network_id:'1', plan_id:'', data_size:'', validity:'30 days', selling_price:'', cost_price:'', editId:'' });
  const [productForm, setProductForm] = useState({ name:'', description:'', price:'', cost_price:'', category:'', shipping_terms:'', pickup_terms:'', in_stock:true, image_url:'', image_base64:'', editId:'' });
  const [broadcastForm, setBroadcastForm] = useState({ message:'', editId:'' });
  const [walletForm, setWalletForm] = useState({ amount:'', note:'', target:'wallet' as 'wallet'|'cashback' });
  const [pinForm, setPinForm] = useState('');
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleEndpoint, setConsoleEndpoint] = useState('amigo');
  const [consoleLogs, setConsoleLogs] = useState<{dir:'sent'|'received';payload:string;ts:string}[]>([]);
  const [chatReply, setChatReply] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [analyticsFilter, setAnalyticsFilter] = useState('all');
  const [receiptModal, setReceiptModal] = useState<Record<string,unknown>|null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(''), 3000); };
  const showError = (msg: string) => { setError(msg); setTimeout(()=>setError(''), 5000); };

  const authH = useCallback(() => ({ Authorization: `Bearer ${adminToken}`, 'Content-Type':'application/json' }), [adminToken]);

  const login = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password: adminPass }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAdminToken(data.token);
      localStorage.setItem('sm_admin_token', data.token);
      setAuthed(true);
    } catch(e:unknown) { showError(e instanceof Error ? e.message : 'Login failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const t = localStorage.getItem('sm_admin_token');
    if (t) { setAdminToken(t); setAuthed(true); }
  }, []);

  const load = useCallback(async (endpoint: string) => {
    try {
      const res = await fetch(`/api/admin/${endpoint}`, { headers: authH() });
      if (!res.ok) return [];
      return res.json();
    } catch { return []; }
  }, [authH]);

  useEffect(() => {
    if (!authed) return;
    if (tab === 'overview') {
      load('analytics').then(d => setAnalytics(d?.overview || d || {}));
      load('transactions').then(d => setTransactions(Array.isArray(d)?d:[]));
    }
    if (tab === 'users') load('users').then(d => setUsers(Array.isArray(d)?d:[]));
    if (tab === 'plans') load('plans').then(d => setPlans(Array.isArray(d)?d:[]));
    if (tab === 'products') load('products').then(d => setProducts(Array.isArray(d)?d:[]));
    if (tab === 'transactions') load('transactions').then(d => setTransactions(Array.isArray(d)?d:[]));
    if (tab === 'broadcasts') load('broadcasts').then(d => setBroadcasts(Array.isArray(d)?d:[]));
    if (tab === 'webhooks') load('webhooks').then(d => setWebhooks(Array.isArray(d)?d:[]));
    if (tab === 'sim') load('sim-activations').then(d => setSimActs(Array.isArray(d)?d:[]));
    if (tab === 'analytics') load('analytics').then(d => setAnalytics(d?.overview || d || {}));
  }, [tab, authed, load]);

  // Real-time wallet updates when needed
  useEffect(() => {
    // Placeholder for future real-time updates
  }, [authed, tab, adminToken]);

  const api = async (path: string, method: string, body?: unknown) => {
    const res = await fetch(`/api/admin/${path}`, { method, headers: authH(), body: body ? JSON.stringify(body) : undefined });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  /* ── RECEIPT DOWNLOAD ── */
  const downloadReceipt = async (data: Record<string,unknown>) => {
    setReceiptModal(data);
  };

  /* ── LOGIN SCREEN ── */
  if (!authed) return (
    <>
      <GlobalStyle />
      <div style={{ height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(160deg,#F0F7FF,#F2F2F7)' }}>
        <Card style={{ width:380,padding:'40px 36px',textAlign:'center' }}>
          <div style={{ width:60,height:60,borderRadius:18,background:'linear-gradient(135deg,#007AFF,#0040FF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 16px' }}>⚡</div>
          <h1 style={{ fontSize:24,fontWeight:900,color:'#1C1C1E',marginBottom:4 }}>SaukiMart Admin</h1>
          <p style={{ color:'#8E8E93',fontSize:14,marginBottom:28 }}>Enter admin password to continue</p>
          {error && <div style={{ padding:'10px 14px',borderRadius:10,background:'rgba(255,59,48,.1)',color:RED,fontSize:14,marginBottom:14 }}>{error}</div>}
          <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()}
            placeholder="Admin password" style={{ width:'100%',padding:'13px 16px',borderRadius:12,border:'1.5px solid #E5E5EA',fontSize:15,marginBottom:14 }} />
          <Btn onClick={login} style={{ width:'100%',justifyContent:'center',padding:'14px' }}>{loading?'Signing in…':'Sign In →'}</Btn>
        </Card>
      </div>
    </>
  );

  /* ── TABS ── */
  const TABS = [
    { id:'overview', label:'Overview', icon:'📊' },
    { id:'users', label:'Users', icon:'👥' },
    { id:'plans', label:'Data Plans', icon:'📶' },
    { id:'products', label:'Products', icon:'📦' },
    { id:'transactions', label:'Transactions', icon:'💳' },
    { id:'orders', label:'Orders', icon:'🛒' },
    { id:'analytics', label:'Analytics', icon:'📈' },
    { id:'broadcasts', label:'Broadcasts', icon:'📢' },
    { id:'sim', label:'SIM Activations', icon:'📡' },
    { id:'webhooks', label:'Webhooks', icon:'🔗' },
    { id:'console', label:'API Console', icon:'⚙️' },
  ];

  /* ── RENDER ── */
  return (
    <>
      <GlobalStyle />
      {toast && <div className="fade-in" style={{ position:'fixed',top:20,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:14,fontWeight:700,zIndex:1000,whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(52,199,89,.3)' }}>{toast}</div>}
      {error && <div className="fade-in" style={{ position:'fixed',top:20,left:'50%',transform:'translateX(-50%)',background:RED,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:14,fontWeight:700,zIndex:1000,maxWidth:'90vw',textAlign:'center',boxShadow:'0 4px 20px rgba(255,59,48,.3)' }}>{error}</div>}

      {/* Receipt Modal */}
      {receiptModal && (
        <div style={{ position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,.6)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
          <div style={{ background:'#fff',borderRadius:20,padding:32,maxWidth:420,width:'100%' }}>
            <h3 style={{ fontWeight:800,fontSize:18,marginBottom:16 }}>Transaction Receipt</h3>
            <pre style={{ fontSize:12,background:'#F2F2F7',borderRadius:12,padding:14,overflowX:'auto',whiteSpace:'pre-wrap',maxHeight:400,overflow:'auto' }}>{JSON.stringify(receiptModal,null,2)}</pre>
            <div style={{ display:'flex',gap:10,marginTop:16 }}>
              <Btn onClick={()=>setReceiptModal(null)} variant="ghost" style={{ flex:1 }}>Close</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'flex',height:'100vh',background:'#F2F2F7' }}>
        {/* Sidebar */}
        <div style={{ width:220,background:'#1C1C1E',display:'flex',flexDirection:'column',flexShrink:0,overflowY:'auto' }}>
          <div style={{ padding:'24px 20px 20px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#007AFF,#0040FF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>⚡</div>
              <div>
                <p style={{ color:'#fff',fontWeight:800,fontSize:15 }}>SaukiMart</p>
                <p style={{ color:'#8E8E93',fontSize:11 }}>Admin Panel</p>
              </div>
            </div>
          </div>
          <nav style={{ flex:1,padding:'0 10px' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={()=>setTab(t.id as typeof tab)}
                style={{ width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,marginBottom:2,background: tab===t.id?'rgba(0,122,255,.15)':'transparent',border:tab===t.id?'1px solid rgba(0,122,255,.2)':'1px solid transparent',transition:'all .15s' }}>
                <span style={{ fontSize:16 }}>{t.icon}</span>
                <span style={{ fontSize:14,fontWeight:tab===t.id?700:500,color:tab===t.id?BLUE:'rgba(255,255,255,.7)' }}>{t.label}</span>
              </button>
            ))}
          </nav>
          <div style={{ padding:'20px' }}>
            <button onClick={()=>{ localStorage.removeItem('sm_admin_token'); setAuthed(false); setAdminToken(''); }}
              style={{ color:'rgba(255,59,48,.8)',fontSize:14,fontWeight:600 }}>Sign Out</button>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex:1,overflowY:'auto',padding:'32px' }}>

          {/* ─── OVERVIEW ─── */}
          {tab === 'overview' && (
            <div className="fade-in">
              <h1 style={{ fontSize:26,fontWeight:900,marginBottom:6 }}>Dashboard Overview</h1>
              <p style={{ color:'#8E8E93',marginBottom:24 }}>Real-time platform analytics</p>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28 }}>
                {[
                  { label:'Total Users', value: (analytics as Record<string,unknown>).totalUsers || 0, icon:'👥', color:BLUE },
                  { label:'Total Revenue', value: `₦${Number((analytics as Record<string,unknown>).totalRevenue||0).toLocaleString()}`, icon:'💰', color:GREEN },
                  { label:'Total Profit', value: `₦${Number((analytics as Record<string,unknown>).totalProfit||0).toLocaleString()}`, icon:'📈', color:GOLD },
                  { label:'Cashback Liability', value: `₦${Number((analytics as Record<string,unknown>).totalCashbackLiability||0).toLocaleString()}`, icon:'🎁', color:GOLD },
                  { label:'Transactions', value: (analytics as Record<string,unknown>).totalTransactions || 0, icon:'💳', color:'#AF52DE' },
                ].map(s => (
                  <Card key={s.label}>
                    <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:12 }}>
                      <div style={{ width:40,height:40,borderRadius:12,background:`${s.color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>{s.icon}</div>
                      <p style={{ fontSize:13,color:'#8E8E93',fontWeight:600 }}>{s.label}</p>
                    </div>
                    <p style={{ fontSize:26,fontWeight:900,color:s.color }}>{s.value as string}</p>
                  </Card>
                ))}
              </div>
              {/* Recent transactions */}
              <Card>
                <h3 style={{ fontWeight:800,fontSize:16,marginBottom:16 }}>Recent Transactions</h3>
                <table style={{ width:'100%',borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#F9F9F9' }}>
                    {['User','Type','Amount','Status','Date'].map(h=><th key={h} style={{ padding:'10px 14px',fontSize:12,fontWeight:700,color:'#8E8E93',textAlign:'left',borderBottom:'1px solid #F2F2F7' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {transactions.slice(0,10).map(tx=>(
                      <tr key={tx.id} style={{ borderBottom:'1px solid #F9F9F9' }}>
                        <td style={{ padding:'12px 14px',fontSize:14 }}>{tx.phone_number||'—'}</td>
                        <td style={{ padding:'12px 14px',fontSize:14 }}>{tx.type}</td>
                        <td style={{ padding:'12px 14px',fontSize:14,fontWeight:700,color:GREEN }}>₦{Number(tx.amount).toLocaleString()}</td>
                        <td style={{ padding:'12px 14px' }}><span style={{ background:tx.status==='success'?'rgba(52,199,89,.1)':'rgba(255,149,0,.1)',color:tx.status==='success'?GREEN:GOLD,padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:700 }}>{tx.status}</span></td>
                        <td style={{ padding:'12px 14px',fontSize:12,color:'#8E8E93' }}>{new Date(tx.created_at).toLocaleString('en-NG',{dateStyle:'short',timeStyle:'short'})}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ─── USERS ─── */}
          {tab === 'users' && (
            <div className="fade-in">
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
                <h1 style={{ fontSize:22,fontWeight:900 }}>Users ({users.length})</h1>
                <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="🔍 Search users…" style={{ padding:'10px 16px',borderRadius:12,border:'1.5px solid #E5E5EA',fontSize:14,width:240 }} />
              </div>
              {selectedUser ? (
                <div className="fade-in">
                  <button onClick={()=>setSelectedUser(null)} style={{ color:BLUE,fontWeight:600,fontSize:15,marginBottom:20 }}>← Back to Users</button>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
                    <Card>
                      <h3 style={{ fontWeight:800,fontSize:16,marginBottom:16 }}>User Details</h3>
                      {[['Name',`${selectedUser.first_name} ${selectedUser.last_name}`],['Phone',selectedUser.phone],['Balance',`₦${Number(selectedUser.wallet_balance).toLocaleString()}`],['Cashback',`₦${Number(selectedUser.cashback_balance).toLocaleString()}`],['Account',selectedUser.flw_account_number||'—'],['Status',selectedUser.is_banned?'🔴 Banned':'🟢 Active'],['Joined',new Date(selectedUser.created_at).toLocaleDateString('en-NG')]].map(([k,v])=>(
                        <div key={k} style={{ display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:'1px solid #F2F2F7' }}>
                          <span style={{ color:'#8E8E93',fontSize:14 }}>{k}</span>
                          <span style={{ fontWeight:600,fontSize:14 }}>{v}</span>
                        </div>
                      ))}
                    </Card>
                    <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
                      <Card>
                        <h3 style={{ fontWeight:800,fontSize:14,marginBottom:12 }}>💰 Wallet Management</h3>
                        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12 }}>
                          <div>
                            <Input label="Amount (₦)" value={walletForm.amount} onChange={v=>setWalletForm(p=>({...p,amount:v.replace(/\D/g,'')}))} placeholder="5000" />
                          </div>
                          <div>
                            <label style={{ display:'block',fontSize:13,fontWeight:600,color:'#6E6E73',marginBottom:8 }}>Target</label>
                            <select value={walletForm.target} onChange={e=>setWalletForm(p=>({...p,target:e.target.value as any}))}
                              style={{ width:'100%',padding:'12px 14px',borderRadius:12,border:'1px solid rgba(0,0,0,0.15)',fontSize:14 }}>
                              <option value="wallet">Main Wallet</option>
                              <option value="cashback">Cashback Balance</option>
                            </select>
                          </div>
                        </div>
                        <Input label="Reason" value={walletForm.note} onChange={v=>setWalletForm(p=>({...p,note:v}))} placeholder="Adjustment note (optional)" />
                        <div style={{ display:'flex',gap:8 }}>
                          <Btn variant="success" size="sm" onClick={async()=>{
                            try {
                              await api('wallet', 'POST', { userId: selectedUser.id, action:'credit', amount: Number(walletForm.amount), target: walletForm.target, note: walletForm.note });
                              showToast(`✅ Credited ₦${walletForm.amount} to ${walletForm.target === 'cashback' ? 'cashback' : 'wallet'}`);
                              setWalletForm({amount:'',note:'',target:'wallet'});
                              load('users').then(d=>setUsers(Array.isArray(d)?d:[]));
                              setSelectedUser(null);
                            } catch(e:unknown){ showError(e instanceof Error?e.message:'Failed'); }
                          }}>Credit</Btn>
                          <Btn variant="danger" size="sm" onClick={async()=>{
                            try {
                              await api('wallet', 'POST', { userId: selectedUser.id, action:'debit', amount: Number(walletForm.amount), target: walletForm.target, note: walletForm.note });
                              showToast(`✅ Debited ₦${walletForm.amount} from ${walletForm.target === 'cashback' ? 'cashback' : 'wallet'}`);
                              setWalletForm({amount:'',note:'',target:'wallet'});
                              load('users').then(d=>setUsers(Array.isArray(d)?d:[]));
                              setSelectedUser(null);
                            } catch(e:unknown){ showError(e instanceof Error?e.message:'Failed'); }
                          }}>Debit</Btn>
                        </div>
                      </Card>
                      <Card>
                        <h3 style={{ fontWeight:800,fontSize:14,marginBottom:12 }}>🔑 Change PIN</h3>
                        <Input label="New 4-digit PIN" value={pinForm} onChange={v=>setPinForm(v.replace(/\D/g,'').slice(0,4))} placeholder="1234" />
                        <Btn size="sm" onClick={async()=>{
                          try { await api('users', 'PATCH', { userId: selectedUser.id, action:'change-pin', newPin: pinForm }); showToast('✅ PIN updated'); setPinForm(''); } catch(e:unknown){ showError(e instanceof Error?e.message:'Failed'); }
                        }}>Update PIN</Btn>
                      </Card>
                      <Card>
                        <h3 style={{ fontWeight:800,fontSize:14,marginBottom:12 }}>Account Actions</h3>
                        <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                          <Btn variant={selectedUser.is_banned?'success':'danger'} size="sm" onClick={async()=>{
                            try { await api('users', 'PATCH', { userId: selectedUser.id, action: selectedUser.is_banned?'unban':'ban' }); showToast(`✅ User ${selectedUser.is_banned?'unbanned':'banned'}`); load('users').then(d=>setUsers(Array.isArray(d)?d:[])); setSelectedUser(null); } catch(e:unknown){ showError(e instanceof Error?e.message:'Failed'); }
                          }}>{selectedUser.is_banned?'Unban User':'Ban User'}</Btn>
                          <Btn variant="ghost" size="sm" onClick={()=>{ setPendingChatUserId(selectedUser.id); setTab('chat'); }}>View Chat</Btn>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : (
                <Card>
                  <table style={{ width:'100%',borderCollapse:'collapse' }}>
                    <thead><tr style={{ background:'#F9F9F9' }}>
                      {['Name','Phone','Balance','Cashback','Status','Actions'].map(h=><th key={h} style={{ padding:'10px 14px',fontSize:12,fontWeight:700,color:'#8E8E93',textAlign:'left',borderBottom:'1px solid #F2F2F7' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {users.filter(u=>!userSearch||u.first_name.toLowerCase().includes(userSearch.toLowerCase())||u.last_name.toLowerCase().includes(userSearch.toLowerCase())||u.phone.includes(userSearch)).map(u=>(
                        <tr key={u.id} style={{ borderBottom:'1px solid #F9F9F9' }}>
                          <td style={{ padding:'12px 14px',fontSize:14,fontWeight:600 }}>{u.first_name} {u.last_name}</td>
                          <td style={{ padding:'12px 14px',fontSize:14,color:'#8E8E93' }}>{u.phone}</td>
                          <td style={{ padding:'12px 14px',fontSize:14,fontWeight:700,color:GREEN }}>₦{Number(u.wallet_balance).toLocaleString()}</td>
                          <td style={{ padding:'12px 14px',fontSize:14,fontWeight:700,color:GOLD }}>₦{Number(u.cashback_balance).toLocaleString()}</td>
                          <td style={{ padding:'12px 14px' }}><span style={{ background:u.is_banned?'rgba(255,59,48,.1)':'rgba(52,199,89,.1)',color:u.is_banned?RED:GREEN,padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:700 }}>{u.is_banned?'Banned':'Active'}</span></td>
                          <td style={{ padding:'12px 14px' }}><Btn size="sm" onClick={()=>setSelectedUser(u)}>View →</Btn></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </div>
          )}

          {/* ─── DATA PLANS ─── */}
          {tab === 'plans' && (
            <div className="fade-in">
              <h1 style={{ fontSize:22,fontWeight:900,marginBottom:20 }}>Data Plans</h1>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
                <Card>
                  <h3 style={{ fontWeight:800,fontSize:16,marginBottom:16 }}>{planForm.editId?'Edit Plan':'Add New Plan'}</h3>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                    <div>
                      <label style={{ fontSize:13,fontWeight:600,color:'#6C6C70',marginBottom:6,display:'block' }}>Network</label>
                      <select value={planForm.network} onChange={e=>{const n=e.target.value;const id=n==='MTN'?'1':n==='GLO'?'2':'4';setPlanForm(p=>({...p,network:n,network_id:id}));}}
                        style={{ width:'100%',padding:'11px 12px',borderRadius:12,border:'1.5px solid #E5E5EA',fontSize:14,marginBottom:14 }}>
                        {['MTN','GLO','AIRTEL'].map(n=><option key={n}>{n}</option>)}
                      </select>
                    </div>
                    <Input label="Plan ID" value={planForm.plan_id} onChange={v=>setPlanForm(p=>({...p,plan_id:v}))} placeholder="1001" />
                  </div>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                    <Input label="Data Size" value={planForm.data_size} onChange={v=>setPlanForm(p=>({...p,data_size:v}))} placeholder="1GB" />
                    <Input label="Validity" value={planForm.validity} onChange={v=>setPlanForm(p=>({...p,validity:v}))} placeholder="30 days" />
                  </div>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                    <Input label="Selling Price (₦)" value={planForm.selling_price} onChange={v=>setPlanForm(p=>({...p,selling_price:v}))} placeholder="429" />
                    <Input label="Cost Price (₦) 🔒" value={planForm.cost_price} onChange={v=>setPlanForm(p=>({...p,cost_price:v}))} placeholder="380" />
                  </div>
                  <div style={{ display:'flex',gap:8 }}>
                    <Btn onClick={async()=>{
                      try {
                        const body = { ...planForm, network_id: parseInt(planForm.network_id), plan_id: parseInt(planForm.plan_id), selling_price: parseFloat(planForm.selling_price), cost_price: parseFloat(planForm.cost_price) };
                        if (planForm.editId) await api(`plans?id=${planForm.editId}`, 'PATCH', body);
                        else await api('plans', 'POST', body);
                        showToast('✅ Plan saved!');
                        setPlanForm({ network:'MTN',network_id:'1',plan_id:'',data_size:'',validity:'30 days',selling_price:'',cost_price:'',editId:'' });
                        load('plans').then(d=>setPlans(Array.isArray(d)?d:[]));
                      } catch(e:unknown){ showError(e instanceof Error?e.message:'Failed'); }
                    }}>{planForm.editId?'Update Plan':'Add Plan'}</Btn>
                    {planForm.editId && <Btn variant="ghost" onClick={()=>setPlanForm({ network:'MTN',network_id:'1',plan_id:'',data_size:'',validity:'30 days',selling_price:'',cost_price:'',editId:'' })}>Cancel</Btn>}
                  </div>
                </Card>
                <Card>
                  <h3 style={{ fontWeight:800,fontSize:16,marginBottom:16 }}>All Plans ({plans.length})</h3>
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%',borderCollapse:'collapse' }}>
                      <thead><tr>{['Network','Size','Price','Cost','Profit','Active','Actions'].map(h=><th key={h} style={{ padding:'8px',fontSize:11,fontWeight:700,color:'#8E8E93',textAlign:'left',borderBottom:'1px solid #F2F2F7',whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
                      <tbody>{plans.map(p=>(
                        <tr key={p.id} style={{ borderBottom:'1px solid #F9F9F9' }}>
                          <td style={{ padding:'10px 8px',fontSize:13,fontWeight:700 }}>{p.network}</td>
                          <td style={{ padding:'10px 8px',fontSize:13 }}>{p.data_size}</td>
                          <td style={{ padding:'10px 8px',fontSize:13,color:GREEN,fontWeight:700 }}>₦{Number(p.selling_price).toLocaleString()}</td>
                          <td style={{ padding:'10px 8px',fontSize:13,color:'#8E8E93' }}>₦{Number(p.cost_price).toLocaleString()}</td>
                          <td style={{ padding:'10px 8px',fontSize:13,color:GOLD,fontWeight:700 }}>₦{(Number(p.selling_price)-Number(p.cost_price)).toLocaleString()}</td>
                          <td style={{ padding:'10px 8px' }}><span style={{ fontSize:12,color:p.is_active?GREEN:RED }}>{p.is_active?'✓':'✗'}</span></td>
                          <td style={{ padding:'10px 8px' }}>
                            <div style={{ display:'flex',gap:4 }}>
                              <Btn size="sm" variant="ghost" onClick={()=>setPlanForm({ network:p.network,network_id:String(p.network_id),plan_id:String(p.plan_id),data_size:p.data_size,validity:p.validity,selling_price:String(p.selling_price),cost_price:String(p.cost_price),editId:p.id })}>Edit</Btn>
                              <Btn size="sm" variant="danger" onClick={async()=>{ try{ await api(`plans?id=${p.id}`,'DELETE'); showToast('Deleted'); load('plans').then(d=>setPlans(Array.isArray(d)?d:[])); }catch(e:unknown){showError(e instanceof Error?e.message:'Failed');} }}>Del</Btn>
                            </div>
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ─── PRODUCTS ─── */}
          {tab === 'products' && (
            <div className="fade-in">
              <h1 style={{ fontSize:22,fontWeight:900,marginBottom:20 }}>Products</h1>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
                <Card>
                  <h3 style={{ fontWeight:800,fontSize:16,marginBottom:16 }}>{productForm.editId?'Edit Product':'Add Product'}</h3>
                  <Input label="Product Name" value={productForm.name} onChange={v=>setProductForm(p=>({...p,name:v}))} placeholder="iPhone 15 Pro" />
                  <Input label="Description" value={productForm.description} onChange={v=>setProductForm(p=>({...p,description:v}))} multiline placeholder="Full product description…" />
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                    <Input label="Selling Price (₦)" value={productForm.price} onChange={v=>setProductForm(p=>({...p,price:v}))} placeholder="250000" />
                    <Input label="Cost Price (₦) 🔒" value={productForm.cost_price} onChange={v=>setProductForm(p=>({...p,cost_price:v}))} placeholder="220000" />
                  </div>
                  <Input label="Category" value={productForm.category} onChange={v=>setProductForm(p=>({...p,category:v}))} placeholder="Phones" />
                  <Input label="Shipping Terms" value={productForm.shipping_terms} onChange={v=>setProductForm(p=>({...p,shipping_terms:v}))} multiline placeholder="Shipping policy…" />
                  <Input label="Pickup Terms" value={productForm.pickup_terms} onChange={v=>setProductForm(p=>({...p,pickup_terms:v}))} placeholder="Pickup location and hours…" />
                  {/* Image upload */}
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:13,fontWeight:600,color:'#6C6C70',marginBottom:6,display:'block' }}>Product Image</label>
                    <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                      {productForm.image_url && <img src={productForm.image_url} alt="preview" style={{ width:60,height:60,objectFit:'cover',borderRadius:10,border:'1px solid #E5E5EA' }} />}
                      <label style={{ padding:'9px 14px',borderRadius:12,border:'1.5px solid #E5E5EA',fontSize:13,fontWeight:600,cursor:'pointer',color:BLUE }}>
                        {uploadingImage?'Uploading…':'📷 Upload Image'}
                        <input type="file" accept="image/*" style={{ display:'none' }} onChange={async e=>{
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingImage(true);
                          try {
                            const fd = new FormData(); fd.append('file', file);
                            const res = await fetch('/api/upload', { method:'POST', headers:{ Authorization:`Bearer ${adminToken}` }, body: fd });
                            const data = await res.json();
                            setProductForm(p=>({...p,image_url:data.url||'',image_base64:data.base64||''}));
                          } finally { setUploadingImage(false); }
                        }} />
                      </label>
                    </div>
                  </div>
                  <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:14 }}>
                    <label style={{ fontSize:14,fontWeight:600,color:'#1C1C1E' }}>In Stock</label>
                    <button onClick={()=>setProductForm(p=>({...p,in_stock:!p.in_stock}))}
                      style={{ width:48,height:28,borderRadius:14,background:productForm.in_stock?GREEN:'#E9E9EA',padding:3,transition:'background .25s',border:'none',cursor:'pointer' }}>
                      <div style={{ width:22,height:22,borderRadius:11,background:'#fff',boxShadow:'0 2px 4px rgba(0,0,0,.15)',transform:`translateX(${productForm.in_stock?20:0}px)`,transition:'transform .25s' }} />
                    </button>
                  </div>
                  <div style={{ display:'flex',gap:8 }}>
                    <Btn onClick={async()=>{
                      try {
                        const body = { ...productForm, price: parseFloat(productForm.price), cost_price: parseFloat(productForm.cost_price) };
                        if (productForm.editId) await api(`products?id=${productForm.editId}`,'PATCH',body);
                        else await api('products','POST',body);
                        showToast('✅ Product saved!');
                        setProductForm({ name:'',description:'',price:'',cost_price:'',category:'',shipping_terms:'',pickup_terms:'',in_stock:true,image_url:'',image_base64:'',editId:'' });
                        load('products').then(d=>setProducts(Array.isArray(d)?d:[]));
                      } catch(e:unknown){ showError(e instanceof Error?e.message:'Failed'); }
                    }}>{productForm.editId?'Update Product':'Add Product'}</Btn>
                    {productForm.editId && <Btn variant="ghost" onClick={()=>setProductForm({ name:'',description:'',price:'',cost_price:'',category:'',shipping_terms:'',pickup_terms:'',in_stock:true,image_url:'',image_base64:'',editId:'' })}>Cancel</Btn>}
                  </div>
                </Card>
                <Card>
                  <h3 style={{ fontWeight:800,fontSize:16,marginBottom:16 }}>Products ({products.length})</h3>
                  <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
                    {products.map(p=>(
                      <div key={p.id} style={{ display:'flex',gap:12,padding:'12px',borderRadius:14,border:'1px solid #F2F2F7',alignItems:'center' }}>
                        <div style={{ width:56,height:56,borderRadius:10,overflow:'hidden',background:'#F2F2F7',flexShrink:0 }}>
                          {p.image_url?<img src={p.image_url} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} />:<div style={{ height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24 }}>📦</div>}
                        </div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <p style={{ fontWeight:700,fontSize:14,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{p.name}</p>
                          <p style={{ color:GREEN,fontWeight:800,fontSize:14 }}>₦{Number(p.price).toLocaleString()}</p>
                          <p style={{ color:'#8E8E93',fontSize:12 }}>Cost: ₦{Number(p.cost_price).toLocaleString()} · Profit: ₦{(Number(p.price)-Number(p.cost_price)).toLocaleString()}</p>
                        </div>
                        <div style={{ display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end' }}>
                          <span style={{ background:p.in_stock?'rgba(52,199,89,.1)':'rgba(255,59,48,.1)',color:p.in_stock?GREEN:RED,padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:700 }}>{p.in_stock?'In Stock':'Out'}</span>
                          <div style={{ display:'flex',gap:4 }}>
                            <Btn size="sm" variant="ghost" onClick={()=>setProductForm({ name:p.name,description:p.description,price:String(p.price),cost_price:String(p.cost_price),category:p.category,shipping_terms:p.shipping_terms,pickup_terms:p.pickup_terms,in_stock:p.in_stock,image_url:p.image_url,image_base64:p.image_base64||'',editId:p.id })}>Edit</Btn>
                            <Btn size="sm" variant="danger" onClick={async()=>{ try{ await api(`products?id=${p.id}`,'DELETE'); showToast('Deleted'); load('products').then(d=>setProducts(Array.isArray(d)?d:[])); }catch(e:unknown){showError(e instanceof Error?e.message:'Failed');} }}>Del</Btn>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ─── TRANSACTIONS ─── */}
          {tab === 'transactions' && (
            <div className="fade-in">
              <h1 style={{ fontSize:22,fontWeight:900,marginBottom:20 }}>All Transactions ({transactions.length})</h1>
              <Card>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%',borderCollapse:'collapse' }}>
                    <thead><tr style={{ background:'#F9F9F9' }}>
                      {['User/Phone','Type','Description','Amount','Status','Date','Receipt'].map(h=><th key={h} style={{ padding:'10px 14px',fontSize:12,fontWeight:700,color:'#8E8E93',textAlign:'left',borderBottom:'1px solid #F2F2F7',whiteSpace:'nowrap' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>{transactions.map(tx=>(
                      <tr key={tx.id} style={{ borderBottom:'1px solid #F9F9F9' }}>
                        <td style={{ padding:'12px 14px',fontSize:13 }}>{tx.first_name && tx.last_name ? `${tx.first_name} ${tx.last_name}` : tx.phone_number||'—'}</td>
                        <td style={{ padding:'12px 14px',fontSize:13 }}><span style={{ background:tx.type==='data'?'rgba(0,122,255,.1)':'rgba(52,199,89,.1)',color:tx.type==='data'?BLUE:GREEN,padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:700 }}>{tx.type}</span></td>
                        <td style={{ padding:'12px 14px',fontSize:13,maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{tx.description}</td>
                        <td style={{ padding:'12px 14px',fontSize:14,fontWeight:800,color:GREEN }}>₦{Number(tx.amount).toLocaleString()}</td>
                        <td style={{ padding:'12px 14px' }}><span style={{ background:tx.status==='success'?'rgba(52,199,89,.1)':'rgba(255,149,0,.1)',color:tx.status==='success'?GREEN:GOLD,padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:700 }}>{tx.status}</span></td>
                        <td style={{ padding:'12px 14px',fontSize:12,color:'#8E8E93',whiteSpace:'nowrap' }}>{new Date(tx.created_at).toLocaleString('en-NG',{dateStyle:'short',timeStyle:'short'})}</td>
                        <td style={{ padding:'12px 14px' }}>
                          {tx.receipt_data && <Btn size="sm" variant="ghost" onClick={()=>downloadReceipt(tx.receipt_data)}>View</Btn>}
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ─── ANALYTICS ─── */}
          {tab === 'analytics' && (
            <div className="fade-in">
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
                <h1 style={{ fontSize:22,fontWeight:900 }}>Sales Analytics & Profit Calculator</h1>
                <select value={analyticsFilter} onChange={e=>setAnalyticsFilter(e.target.value)} style={{ padding:'10px 14px',borderRadius:12,border:'1.5px solid #E5E5EA',fontSize:14 }}>
                  {['all','today','week','month'].map(f=><option key={f} value={f}>{f.charAt(0).toUpperCase()+f.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24 }}>
                {[
                  { label:'Total Revenue', value:`₦${Number((analytics as Record<string,unknown>).totalRevenue||0).toLocaleString()}`, color:BLUE, desc:'Total sales price' },
                  { label:'Total Cost', value:`₦${Number((analytics as Record<string,unknown>).totalCost||0).toLocaleString()}`, color:RED, desc:'Sum of cost prices' },
                  { label:'Net Profit', value:`₦${Number((analytics as Record<string,unknown>).totalProfit||0).toLocaleString()}`, color:GREEN, desc:'Revenue minus cost' },
                ].map(s=>(
                  <Card key={s.label}>
                    <p style={{ fontSize:13,color:'#8E8E93',marginBottom:8 }}>{s.label}</p>
                    <p style={{ fontSize:30,fontWeight:900,color:s.color }}>{s.value}</p>
                    <p style={{ fontSize:12,color:'#C7C7CC',marginTop:4 }}>{s.desc}</p>
                  </Card>
                ))}
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16 }}>
                {[
                  { label:'Total Transactions', value:(analytics as Record<string,unknown>).totalTransactions||0 },
                  { label:'Data Sales', value:(analytics as Record<string,unknown>).dataSales||0 },
                  { label:'Product Sales', value:(analytics as Record<string,unknown>).productSales||0 },
                  { label:'SIM Activations', value:(analytics as Record<string,unknown>).simSales||0 },
                  { label:'Active Users', value:(analytics as Record<string,unknown>).totalUsers||0 },
                  { label:'Total Deposits', value:`₦${Number((analytics as Record<string,unknown>).totalDeposits||0).toLocaleString()}` },
                  { label:'Avg Transaction', value:`₦${Number((analytics as Record<string,unknown>).avgTransaction||0).toLocaleString()}` },
                  { label:'Profit Margin', value:`${((Number((analytics as Record<string,unknown>).totalProfit||0)/Math.max(Number((analytics as Record<string,unknown>).totalRevenue||1),1))*100).toFixed(1)}%` },
                ].map(s=>(
                  <Card key={s.label} style={{ padding:'16px' }}>
                    <p style={{ fontSize:12,color:'#8E8E93',marginBottom:6 }}>{s.label}</p>
                    <p style={{ fontSize:22,fontWeight:900,color:'#1C1C1E' }}>{String(s.value)}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ─── BROADCASTS ─── */}
          {tab === 'broadcasts' && (
            <div className="fade-in">
              <h1 style={{ fontSize:22,fontWeight:900,marginBottom:20 }}>Marquee Broadcasts</h1>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
                <Card>
                  <h3 style={{ fontWeight:800,fontSize:16,marginBottom:16 }}>{broadcastForm.editId?'Edit Message':'New Broadcast'}</h3>
                  <Input label="Broadcast Message" value={broadcastForm.message} onChange={v=>setBroadcastForm(p=>({...p,message:v}))} multiline placeholder="Important announcement…" />
                  <div style={{ display:'flex',gap:8 }}>
                    <Btn onClick={async()=>{
                      try {
                        if (broadcastForm.editId) await api(`broadcasts?id=${broadcastForm.editId}`,'PATCH',{ message:broadcastForm.message });
                        else await api('broadcasts','POST',{ message:broadcastForm.message });
                        showToast('✅ Broadcast saved!');
                        setBroadcastForm({ message:'',editId:'' });
                        load('broadcasts').then(d=>setBroadcasts(Array.isArray(d)?d:[]));
                      } catch(e:unknown){ showError(e instanceof Error?e.message:'Failed'); }
                    }}>{broadcastForm.editId?'Update':'Send Broadcast'}</Btn>
                    {broadcastForm.editId && <Btn variant="ghost" onClick={()=>setBroadcastForm({ message:'',editId:'' })}>Cancel</Btn>}
                  </div>
                </Card>
                <Card>
                  <h3 style={{ fontWeight:800,fontSize:16,marginBottom:16 }}>Active Broadcasts</h3>
                  {broadcasts.map(b=>(
                    <div key={b.id} style={{ padding:'12px 14px',borderRadius:12,background:'rgba(0,122,255,.06)',border:'1px solid rgba(0,122,255,.12)',marginBottom:10,display:'flex',gap:10,alignItems:'flex-start' }}>
                      <p style={{ flex:1,fontSize:14,color:'#1C1C1E',lineHeight:1.5 }}>📢 {b.message}</p>
                      <div style={{ display:'flex',gap:4,flexShrink:0 }}>
                        <Btn size="sm" variant="ghost" onClick={()=>setBroadcastForm({ message:b.message,editId:b.id })}>Edit</Btn>
                        <Btn size="sm" variant="danger" onClick={async()=>{ try{ await api(`broadcasts?id=${b.id}`,'DELETE'); showToast('Deleted'); load('broadcasts').then(d=>setBroadcasts(Array.isArray(d)?d:[])); }catch(e:unknown){showError(e instanceof Error?e.message:'Failed');} }}>Del</Btn>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          )}

          {/* ─── SIM ACTIVATIONS ─── */}
          {tab === 'sim' && (
            <div className="fade-in">
              <h1 style={{ fontSize:22,fontWeight:900,marginBottom:20 }}>SIM Activations ({simActs.length})</h1>
              <div style={{ display:'grid',gap:14 }}>
                {simActs.map(s=>(
                  <Card key={s.id}>
                    <div style={{ display:'grid',gridTemplateColumns:'1fr auto',gap:16 }}>
                      <div>
                        <div style={{ display:'flex',gap:12,marginBottom:12 }}>
                          <span style={{ background:s.status==='activated'?'rgba(52,199,89,.1)':'rgba(255,149,0,.1)',color:s.status==='activated'?GREEN:GOLD,padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:700 }}>{s.status==='activated'?'✅ Activated':'⏳ Under Review'}</span>
                          <span style={{ color:'#8E8E93',fontSize:13 }}>{new Date(s.created_at).toLocaleString('en-NG',{dateStyle:'medium',timeStyle:'short'})}</span>
                        </div>
                        <p style={{ fontSize:14,marginBottom:6 }}><strong>User:</strong> {s.first_name} {s.last_name} · {s.phone}</p>
                        <p style={{ fontSize:14,marginBottom:10 }}><strong>Serial:</strong> {s.serial_number || '(not provided)'}</p>
                        <div style={{ display:'flex',gap:12 }}>
                          {s.front_image_url && <a href={s.front_image_url} target="_blank" rel="noreferrer"><img src={s.front_image_url} alt="Front" style={{ width:80,height:80,objectFit:'cover',borderRadius:10,border:'1px solid #E5E5EA' }} /></a>}
                          {s.back_image_url && <a href={s.back_image_url} target="_blank" rel="noreferrer"><img src={s.back_image_url} alt="Back" style={{ width:80,height:80,objectFit:'cover',borderRadius:10,border:'1px solid #E5E5EA' }} /></a>}
                        </div>
                      </div>
                      <div style={{ display:'flex',flexDirection:'column',gap:8,justifyContent:'flex-start' }}>
                        {s.status !== 'activated' && (
                          <Btn variant="success" size="sm" onClick={async()=>{
                            try { await api(`sim-activations?id=${s.id}`,'PATCH',{ status:'activated' }); showToast('✅ Marked as activated'); load('sim-activations').then(d=>setSimActs(Array.isArray(d)?d:[])); } catch(e:unknown){ showError(e instanceof Error?e.message:'Failed'); }
                          }}>Mark Activated</Btn>
                        )}
                        <Btn variant="danger" size="sm" onClick={async()=>{
                          try { await api(`sim-activations?id=${s.id}`,'PATCH',{ status:'rejected' }); showToast('Marked as rejected'); load('sim-activations').then(d=>setSimActs(Array.isArray(d)?d:[])); } catch(e:unknown){ showError(e instanceof Error?e.message:'Failed'); }
                        }}>Reject</Btn>
                      </div>
                    </div>
                  </Card>
                ))}
                {simActs.length===0 && <div style={{ textAlign:'center',padding:60,color:'#8E8E93' }}><p style={{ fontSize:40,marginBottom:12 }}>📡</p><p>No SIM activation requests yet</p></div>}
              </div>
            </div>
          )}

          {/* ─── CHAT ─── */}
          {tab === 'orders' && (
            <div className="fade-in">
              <h1 style={{ fontSize:22,fontWeight:900,marginBottom:20 }}>Orders Management</h1>
              <Card>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%',borderCollapse:'collapse' }}>
                    <thead><tr style={{ background:'#F9F9F9' }}>
                      {['Order ID','Customer','Product','Amount','Status','Date','Actions'].map(h=><th key={h} style={{ padding:'10px 14px',fontSize:12,fontWeight:700,color:'#8E8E93',textAlign:'left',borderBottom:'1px solid #F2F2F7',whiteSpace:'nowrap' }}>{h}</th>)}
                    </tr></thead>
                    <tbody><tr><td colSpan={7} style={{ padding:'40px',textAlign:'center',color:'#8E8E93' }}>
                      <div style={{ fontSize:36,marginBottom:12 }}>📦</div>
                      <p>Order management system coming soon. Currently tracking orders via transactions table.</p>
                    </td></tr></tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ─── WEBHOOKS ─── */}
          {tab === 'webhooks' && (
            <div className="fade-in">
              <h1 style={{ fontSize:22,fontWeight:900,marginBottom:20 }}>Flutterwave Webhooks ({webhooks.length})</h1>
              <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
                {webhooks.map(wh=>(
                  <Card key={wh.id}>
                    <div style={{ display:'flex',justifyContent:'space-between',marginBottom:10,alignItems:'center' }}>
                      <span style={{ background:'rgba(0,122,255,.1)',color:BLUE,padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:700 }}>{wh.event}</span>
                      <span style={{ color:'#8E8E93',fontSize:13 }}>{new Date(wh.created_at).toLocaleString('en-NG',{dateStyle:'medium',timeStyle:'short'})}</span>
                    </div>
                    <pre style={{ fontSize:12,background:'#F2F2F7',borderRadius:10,padding:12,overflowX:'auto',whiteSpace:'pre-wrap',maxHeight:200,overflow:'auto' }}>{JSON.stringify(wh.payload,null,2)}</pre>
                  </Card>
                ))}
                {webhooks.length===0 && <div style={{ textAlign:'center',padding:60,color:'#8E8E93' }}><p style={{ fontSize:40,marginBottom:12 }}>🔗</p><p>No webhooks received yet</p></div>}
              </div>
            </div>
          )}

          {/* ─── API CONSOLE ─── */}
          {tab === 'console' && (
            <div className="fade-in">
              <h1 style={{ fontSize:22,fontWeight:900,marginBottom:6 }}>API Console</h1>
              <p style={{ color:'#8E8E93',marginBottom:20 }}>Send raw JSON payloads to Amigo and Flutterwave</p>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
                <Card>
                  <h3 style={{ fontWeight:800,fontSize:15,marginBottom:16 }}>Send Request</h3>
                  <div style={{ marginBottom:12 }}>
                    <label style={{ fontSize:13,fontWeight:600,color:'#6C6C70',marginBottom:6,display:'block' }}>Target API</label>
                    <div style={{ display:'flex',gap:8 }}>
                      {['amigo','flutterwave'].map(e=>(
                        <button key={e} onClick={()=>setConsoleEndpoint(e)} style={{ padding:'8px 16px',borderRadius:10,border:`1.5px solid ${consoleEndpoint===e?BLUE:'#E5E5EA'}`,background:consoleEndpoint===e?'rgba(0,122,255,.08)':'transparent',color:consoleEndpoint===e?BLUE:'#6C6C70',fontSize:13,fontWeight:700,cursor:'pointer' }}>{e.toUpperCase()}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <label style={{ fontSize:13,fontWeight:600,color:'#6C6C70',marginBottom:6,display:'block' }}>JSON Payload</label>
                    <textarea value={consoleInput} onChange={e=>setConsoleInput(e.target.value)} placeholder={consoleEndpoint==='amigo'?`{\n  "network": 1,\n  "mobile_number": "09012345678",\n  "plan": 1001,\n  "Ported_number": true\n}`:`{\n  "amount": 1000\n}`}
                      style={{ width:'100%',minHeight:200,padding:'12px',borderRadius:12,border:'1.5px solid #E5E5EA',fontSize:13,fontFamily:'monospace',resize:'vertical' }} />
                  </div>
                  <Btn onClick={async()=>{
                    try {
                      let parsed; try{ parsed = JSON.parse(consoleInput); }catch{ showError('Invalid JSON'); return; }
                      setConsoleLogs(prev=>[{ dir:'sent', payload:JSON.stringify(parsed,null,2), ts:new Date().toLocaleTimeString() }, ...prev]);
                      const res = await fetch('/api/admin/console', { method:'POST', headers: authH(), body: JSON.stringify({ service: consoleEndpoint, endpoint: consoleEndpoint==='amigo'?'/data/':'/', method:'POST', payload: parsed }) });
                      const data = await res.json();
                      setConsoleLogs(prev=>[{ dir:'received', payload:JSON.stringify(data,null,2), ts:new Date().toLocaleTimeString() }, ...prev]);
                    } catch(e:unknown){ showError(e instanceof Error?e.message:'Request failed'); }
                  }}>Send Request →</Btn>
                </Card>
                <Card>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
                    <h3 style={{ fontWeight:800,fontSize:15 }}>Response Log</h3>
                    <Btn size="sm" variant="ghost" onClick={()=>setConsoleLogs([])}>Clear</Btn>
                  </div>
                  <div style={{ maxHeight:480,overflowY:'auto',display:'flex',flexDirection:'column',gap:10 }}>
                    {consoleLogs.map((log,i)=>(
                      <div key={i} style={{ padding:'12px',borderRadius:12,background:log.dir==='sent'?'rgba(0,122,255,.06)':'rgba(52,199,89,.06)',border:`1px solid ${log.dir==='sent'?'rgba(0,122,255,.12)':'rgba(52,199,89,.12)'}` }}>
                        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
                          <span style={{ fontSize:11,fontWeight:700,color:log.dir==='sent'?BLUE:GREEN }}>{log.dir==='sent'?'▶ SENT':'◀ RECEIVED'}</span>
                          <span style={{ fontSize:11,color:'#8E8E93' }}>{log.ts}</span>
                        </div>
                        <pre style={{ fontSize:11,fontFamily:'monospace',whiteSpace:'pre-wrap',color:'#1C1C1E',overflow:'auto' }}>{log.payload}</pre>
                      </div>
                    ))}
                    {consoleLogs.length===0 && <p style={{ color:'#C7C7CC',fontSize:14,textAlign:'center',padding:40 }}>Requests and responses will appear here</p>}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
