'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const BLUE = '#7cc7ff';
const GREEN = '#63d9b0';
const RED = '#ff7f8a';
const GOLD = '#f4c36a';
const BG = '#08111f';
const PANEL = 'rgba(10, 20, 36, 0.86)';
const PANEL_ALT = 'rgba(15, 28, 47, 0.92)';
const BORDER = 'rgba(162, 194, 255, 0.14)';
const MUTED = '#8ea3bf';
const TEXT = '#eef4ff';

type User = { id: string; first_name: string; last_name: string; phone: string; wallet_balance: number; cashback_balance: number; referral_balance?: number; referral_id?: string; total_gb_purchased?: number; is_banned: boolean; created_at: string; flw_account_number: string; };
type Developer = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_developer: boolean;
  developer_discount_percent: number;
  developer_terms_version?: string;
  developer_terms_accepted_at?: string;
  active_keys: number;
  last_used_at?: string;
  created_at: string;
};
type DeveloperKey = {
  id: string;
  key_prefix: string;
  key_last4: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
  revoked_at?: string;
};
type DeveloperActivity = {
  id: string;
  status: string;
  endpoint: string;
  network?: string;
  plan_code?: string;
  phone_number?: string;
  app_price?: number;
  developer_price?: number;
  amigo_reference?: string;
  created_at: string;
};
type Plan = { id: string; network: string; network_id: number; plan_id: number; data_size: string; validity: string; selling_price: number; cost_price: number; is_active: boolean; };
type Product = { id: string; name: string; description: string; price: number; cost_price: number; image_url: string; image_base64?: string; in_stock: boolean; shipping_terms: string; pickup_terms: string; category: string; };
type Transaction = { id: string; user_id: string; type: string; description: string; amount: number; status: string; created_at: string; network: string; phone_number: string; product_name: string; receipt_data: Record<string,unknown>; first_name?: string; last_name?: string; phone?: string; };
type Broadcast = { id: string; message: string; is_active: boolean; created_at: string; };
type Webhook = { id: string; event: string; payload: Record<string,unknown>; created_at: string; };
type SimAct = { id: string; user_id: string; serial_number: string; front_image_url: string; back_image_url: string; status: string; created_at: string; first_name?: string; last_name?: string; phone?: string; };
type Order = {
  id: string;
  user_id: string;
  product_id?: string;
  product_name: string;
  amount: number;
  payment_status: string;
  created_at: string;
  first_name: string;
  last_name: string;
  phone: string;
  receipt_data: Record<string, unknown>;
  delivery_address: string;
  receipt_ref: string;
  fulfillment_status: string;
  tracking_number: string;
  admin_note: string;
  fulfillment_updated_at: string;
};
type AdminChatSession = {
  id: string;
  customer_id: string;
  customer_name: string;
  status: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  message_count?: number;
  internal_notes?: string[];
  agent_mode?: boolean;
};
type AdminChatMessage = {
  id: string;
  session_id: string;
  sender: string;
  content: string;
  message?: string;
  created_at: string;
  read?: boolean;
};
type Withdrawal = {
  id: string;
  userId: string;
  transactionId?: string | null;
  amount: number;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: string;
  payoutReference?: string | null;
  adminNote?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  phone: string;
};

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --admin-bg:${BG};
      --admin-panel:${PANEL};
      --admin-panel-alt:${PANEL_ALT};
      --admin-border:${BORDER};
      --admin-text:${TEXT};
      --admin-muted:${MUTED};
      --admin-blue:${BLUE};
      --admin-green:${GREEN};
      --admin-red:${RED};
      --admin-gold:${GOLD};
    }
    html,body{background:radial-gradient(circle at top left, rgba(57,110,179,0.22), transparent 34%), radial-gradient(circle at top right, rgba(18,79,123,0.24), transparent 28%), linear-gradient(180deg, #08101b 0%, #0a1320 52%, #050b14 100%);color:var(--admin-text)}
    body{font-family:'Manrope',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
    ::-webkit-scrollbar{width:9px;height:9px}::-webkit-scrollbar-thumb{background:rgba(146,171,205,.3);border-radius:999px}
    input,textarea,select{font-family:inherit;outline:none}
    button{border:none;cursor:pointer;font-family:inherit;background:none}
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes drift{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,10px,0)}}
    .fade-in{animation:fadeIn .2s ease both}
    a{color:inherit;text-decoration:none}
    .admin-shell{position:relative;overflow:hidden}
    .admin-shell::before{content:'';position:absolute;inset:-20% auto auto -10%;width:420px;height:420px;border-radius:999px;background:radial-gradient(circle, rgba(94,154,255,0.18), transparent 68%);filter:blur(8px);pointer-events:none;animation:drift 12s ease-in-out infinite}
    .admin-shell::after{content:'';position:absolute;right:-120px;top:140px;width:300px;height:300px;border-radius:999px;background:radial-gradient(circle, rgba(90,226,184,0.12), transparent 70%);pointer-events:none;animation:drift 15s ease-in-out infinite reverse}
    .admin-code{font-family:'IBM Plex Mono',monospace}
  `}</style>
);

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background:'linear-gradient(180deg, rgba(250,252,255,0.96) 0%, rgba(240,246,255,0.94) 100%)',borderRadius:24,padding:'24px',boxShadow:'0 22px 70px rgba(0,0,0,0.18)',border:'1px solid rgba(205,220,244,0.82)', backdropFilter:'blur(18px)', color:'#14233a', ...style }}>{children}</div>
);

const Btn = ({ children, onClick, variant='primary', size='md', style: s }: { children: React.ReactNode; onClick?: ()=>void; variant?: 'primary'|'danger'|'ghost'|'success'; size?: 'sm'|'md'; style?: React.CSSProperties }) => {
  const bg = variant==='primary'?'linear-gradient(135deg, #2359b8 0%, #5bb3ff 100%)':variant==='danger'?'linear-gradient(135deg, #7b2130 0%, #cf5466 100%)':variant==='success'?'linear-gradient(135deg, #0f6655 0%, #2ea486 100%)':'rgba(255,255,255,0.03)';
  const color = variant==='ghost'?TEXT:'#fff';
  const border = variant==='ghost'?`1px solid ${BORDER}`:'none';
  const pad = size==='sm'?'9px 14px':'12px 20px';
  const font = size==='sm'?13:15;
  return <button onClick={onClick} style={{ background:bg,color,border,borderRadius:14,padding:pad,fontSize:font,fontWeight:700,cursor:'pointer',transition:'all 0.2s cubic-bezier(0.25,0.1,0.25,1)', boxShadow:variant==='ghost'?'none':'0 16px 30px rgba(0,0,0,0.18)', letterSpacing:'0.01em', ...s }} onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-1px)'}} onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0)'}}>{children}</button>;
};

const Input = ({ value, onChange, placeholder, type='text', label, multiline=false }: { value: string; onChange: (v:string)=>void; placeholder?: string; type?: string; label?: string; multiline?: boolean; }) => (
  <div style={{ marginBottom:16 }}>
    {label && <label style={{ display:'block',fontSize:12,fontWeight:700,color:'#5f738f',marginBottom:8,letterSpacing:'0.08em',textTransform:'uppercase' }}>{label}</label>}
    {multiline ? (
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%',padding:'13px 14px',borderRadius:14,border:'1px solid rgba(196,208,230,.9)',fontSize:14,color:'#18304d',background:'rgba(248,251,255,.95)',minHeight:100,resize:'vertical',lineHeight:1.5,fontFamily:'inherit',transition:'border 0.2s, box-shadow 0.2s' }} 
        onFocus={e=>{e.currentTarget.style.borderColor='rgba(124,199,255,0.45)';e.currentTarget.style.boxShadow='0 0 0 3px rgba(124,199,255,0.12)';}}
        onBlur={e=>{e.currentTarget.style.borderColor='rgba(196,208,230,.9)';e.currentTarget.style.boxShadow='none';}} />
    ) : (
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%',padding:'13px 14px',borderRadius:14,border:'1px solid rgba(196,208,230,.9)',fontSize:14,color:'#18304d',background:'rgba(248,251,255,.95)',fontFamily:'inherit',transition:'border 0.2s, box-shadow 0.2s' }}
        onFocus={e=>{e.currentTarget.style.borderColor='rgba(124,199,255,0.45)';e.currentTarget.style.boxShadow='0 0 0 3px rgba(124,199,255,0.12)';}}
        onBlur={e=>{e.currentTarget.style.borderColor='rgba(196,208,230,.9)';e.currentTarget.style.boxShadow='none';}} />
    )}
  </div>
);

const formatMoney = (value: unknown) => `₦${Number(value || 0).toLocaleString('en-NG')}`;
const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString('en-NG', { dateStyle:'medium', timeStyle:'short' }) : '—';
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [tab, setTab] = useState<'overview'|'users'|'withdrawals'|'developers'|'plans'|'products'|'transactions'|'orders'|'analytics'|'broadcasts'|'push'|'chat'|'sim'|'webhooks'|'console'>('overview');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  // Data
  const [users, setUsers] = useState<User[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [developerKeys, setDeveloperKeys] = useState<DeveloperKey[]>([]);
  const [developerActivity, setDeveloperActivity] = useState<DeveloperActivity[]>([]);
  const [developerStats, setDeveloperStats] = useState<Record<string, unknown>>({});
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState<Record<string, unknown>>({});
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawalStats, setWithdrawalStats] = useState<Record<string, unknown>>({});
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [simActs, setSimActs] = useState<SimAct[]>([]);
  const [analytics, setAnalytics] = useState<Record<string,unknown>>({});
  const [chatSessions, setChatSessions] = useState<AdminChatSession[]>([]);
  const [chatStats, setChatStats] = useState<Record<string, unknown>>({});
  const [activeChatSession, setActiveChatSession] = useState<AdminChatSession|null>(null);
  const [chatMessages, setChatMessages] = useState<AdminChatMessage[]>([]);
  const [selectedUser, setSelectedUser] = useState<User|null>(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer|null>(null);
  const [developerBusy, setDeveloperBusy] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order|null>(null);

  // Forms
  const [planForm, setPlanForm] = useState({ network:'MTN', network_id:'1', plan_id:'', data_size:'', validity:'30 days', selling_price:'', cost_price:'', editId:'' });
  const [productForm, setProductForm] = useState({ name:'', description:'', price:'', cost_price:'', category:'', shipping_terms:'', pickup_terms:'', in_stock:true, image_url:'', image_base64:'', editId:'' });
  const [broadcastForm, setBroadcastForm] = useState({ message:'', editId:'' });
  const [walletForm, setWalletForm] = useState({ amount:'', note:'', target:'wallet' as 'wallet'|'cashback'|'referral' });
  const [withdrawalFilter, setWithdrawalFilter] = useState('all');
  const [withdrawalActionBusy, setWithdrawalActionBusy] = useState('');
  const [pinForm, setPinForm] = useState('');
  const [developerForm, setDeveloperForm] = useState({ userId:'', discountPercent:'8.00', termsVersion:'v1.0' });
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleEndpoint, setConsoleEndpoint] = useState('amigo');
  const [consoleLogs, setConsoleLogs] = useState<{dir:'sent'|'received';payload:string;ts:string}[]>([]);
  const [pushAudience, setPushAudience] = useState<'all'|'specific'|'selected'>('all');
  const [pushForm, setPushForm] = useState({ title:'', message:'' });
  const [pushSpecificUserId, setPushSpecificUserId] = useState('');
  const [pushSelectedUserIds, setPushSelectedUserIds] = useState<string[]>([]);
  const [pushUserSearch, setPushUserSearch] = useState('');
  const [pushSending, setPushSending] = useState(false);
  const [pushResult, setPushResult] = useState<Record<string, unknown>|null>(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderForm, setOrderForm] = useState({ fulfillmentStatus:'paid', trackingNumber:'', adminNote:'' });
  const [orderSaving, setOrderSaving] = useState(false);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [batchTxStatus, setBatchTxStatus] = useState('success');
  const [batchOrderStatus, setBatchOrderStatus] = useState('processing');
  const [batchBusy, setBatchBusy] = useState(false);
  const [chatFilter, setChatFilter] = useState('all');
  const [chatSearch, setChatSearch] = useState('');
  const [chatReply, setChatReply] = useState('');
  const [chatNote, setChatNote] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [chatStreamConnected, setChatStreamConnected] = useState(false);
  const [customerTypingMap, setCustomerTypingMap] = useState<Record<string, boolean>>({});
  const [userSearch, setUserSearch] = useState('');
  const [analyticsFilter, setAnalyticsFilter] = useState('all');
  const [analyticsDate, setAnalyticsDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [receiptModal, setReceiptModal] = useState<Record<string,unknown>|null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(''), 3000); };
  const showError = (msg: string) => { setError(msg); setTimeout(()=>setError(''), 5000); };

  // Always read straight from localStorage so authH is never stale after login
  const authH = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem('sm_admin_token') || adminToken}`, 'Content-Type':'application/json' }), []); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (t) {
      // Quick client-side expiry check (JWT payload is base64, no secret needed)
      try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          setAdminToken(t);
          setAuthed(true);
        } else {
          localStorage.removeItem('sm_admin_token');
        }
      } catch {
        localStorage.removeItem('sm_admin_token');
      }
    }
  }, []);

  const load = useCallback(async (endpoint: string) => {
    try {
      const res = await fetch(`/api/admin/${endpoint}`, { headers: authH() });
      if (res.status === 401 || res.status === 403) {
        // Token expired or invalid — clear session and show login
        localStorage.removeItem('sm_admin_token');
        setAdminToken('');
        setAuthed(false);
        return [];
      }
      if (!res.ok) {
        setError(`Failed to load ${endpoint} (${res.status})`);
        setTimeout(() => setError(''), 5000);
        return [];
      }
      return res.json();
    } catch {
      setError(`Network error loading ${endpoint}`);
      setTimeout(() => setError(''), 5000);
      return [];
    }
  // authH is stable (reads from localStorage), so load is also stable
  }, [authH]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAnalytics = useCallback(async (filter = analyticsFilter, date = analyticsDate) => {
    const params = new URLSearchParams();
    if (filter && filter !== 'all' && filter !== 'custom') params.set('filter', filter);
    if (filter === 'custom' && date) params.set('date', date);
    const query = params.toString();
    const payload = await load(`analytics${query ? `?${query}` : ''}`);
    setAnalytics((payload?.overview || payload || {}) as Record<string, unknown>);
  }, [analyticsDate, analyticsFilter, load]);

  const loadOrders = useCallback(async (filter = orderFilter, search = orderSearch) => {
    try {
      const params = new URLSearchParams();
      if (filter && filter !== 'all') params.set('filter', filter);
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/admin/orders${params.toString() ? `?${params.toString()}` : ''}`, { headers: authH() });
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      const nextOrders = Array.isArray(data?.orders) ? data.orders : [];
      setOrders(nextOrders);
      setOrderStats((data?.stats || {}) as Record<string, unknown>);
      setSelectedOrder((prev) => prev ? nextOrders.find((order: Order) => order.id === prev.id) || prev : nextOrders[0] || null);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Failed to load orders');
    }
  }, [authH, orderFilter, orderSearch]);

  const loadWithdrawals = useCallback(async (filter = withdrawalFilter) => {
    try {
      const params = new URLSearchParams();
      if (filter && filter !== 'all') params.set('filter', filter);
      const res = await fetch(`/api/admin/withdrawals${params.toString() ? `?${params.toString()}` : ''}`, { headers: authH() });
      if (!res.ok) throw new Error('Failed to load withdrawals');
      const data = await res.json();
      setWithdrawals(Array.isArray(data?.withdrawals) ? data.withdrawals : []);
      setWithdrawalStats((data?.stats || {}) as Record<string, unknown>);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Failed to load withdrawals');
    }
  }, [authH, withdrawalFilter]);

  const loadAdminSessions = useCallback(async (filter = chatFilter, search = chatSearch) => {
    try {
      const params = new URLSearchParams();
      if (filter && filter !== 'all') params.set('filter', filter);
      if (search.trim()) params.set('search', search.trim());
      const res = await fetch(`/api/admin/sessions${params.toString() ? `?${params.toString()}` : ''}`, { headers: authH() });
      if (!res.ok) throw new Error('Failed to load chat sessions');
      const data = await res.json();
      setChatSessions(Array.isArray(data?.sessions) ? data.sessions : []);
      setChatStats((data?.stats || {}) as Record<string, unknown>);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Failed to load chat sessions');
    }
  }, [authH, chatFilter, chatSearch]);

  const openChatSession = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/admin/sessions?sessionId=${encodeURIComponent(sessionId)}`, { headers: authH() });
      if (!res.ok) throw new Error('Failed to load conversation');
      const data = await res.json();
      setActiveChatSession((data?.session || null) as AdminChatSession | null);
      const normalizedMessages: AdminChatMessage[] = (Array.isArray(data?.messages) ? data.messages : []).map((msg: Record<string, unknown>) => ({
        ...(msg as unknown as AdminChatMessage),
        content: String(msg.content || msg.message || ''),
      }));
      setChatMessages(normalizedMessages);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Failed to open conversation');
    }
  }, [authH]);

  const chatAction = useCallback(async (action: 'takeover'|'release'|'resolve'|'flag'|'add_note'|'send_message', payload?: Record<string, unknown>) => {
    if (!activeChatSession?.id) return;
    setChatBusy(true);
    try {
      await api('intervene', 'POST', { sessionId: activeChatSession.id, action, payload, agentId: 'admin-panel' });
      if (action === 'send_message' && typeof payload?.content === 'string') {
        const optimisticMessage: AdminChatMessage = {
          id: `optimistic-${Date.now()}`,
          session_id: activeChatSession.id,
          sender: 'agent',
          content: payload.content,
          created_at: new Date().toISOString(),
          read: true,
        };
        setChatMessages((prev) => [...prev, optimisticMessage]);
        setActiveChatSession((prev) => prev ? { ...prev, last_message: payload.content as string, last_message_at: optimisticMessage.created_at, message_count: (prev.message_count || 0) + 1 } : prev);
        setChatSessions((prev) => prev.map((session) => session.id === activeChatSession.id ? { ...session, last_message: payload.content as string, last_message_at: optimisticMessage.created_at, message_count: (session.message_count || 0) + 1 } : session));
        setChatReply('');
      }
      if (action === 'add_note') setChatNote('');
      if (action !== 'send_message') {
        await openChatSession(activeChatSession.id);
      }
      await loadAdminSessions();
      showToast('Action completed');
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Chat action failed');
    } finally {
      setChatBusy(false);
    }
  }, [activeChatSession?.id, loadAdminSessions, openChatSession]);

  const sendPushCampaign = useCallback(async () => {
    if (!pushForm.title.trim() || !pushForm.message.trim()) {
      showError('Push title and message are required');
      return;
    }
    if (pushAudience === 'specific' && !pushSpecificUserId) {
      showError('Pick a user for specific audience');
      return;
    }
    if (pushAudience === 'selected' && pushSelectedUserIds.length === 0) {
      showError('Select at least one user');
      return;
    }

    setPushSending(true);
    try {
      const payload: Record<string, unknown> = {
        audience: pushAudience,
        title: pushForm.title.trim(),
        message: pushForm.message.trim(),
      };
      if (pushAudience === 'specific') payload.userId = pushSpecificUserId;
      if (pushAudience === 'selected') payload.userIds = pushSelectedUserIds;
      const data = await api('push', 'POST', payload);
      setPushResult(data as Record<string, unknown>);
      showToast('Push campaign sent');
      setPushForm({ title:'', message:'' });
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Push send failed');
    } finally {
      setPushSending(false);
    }
  }, [pushAudience, pushForm.message, pushForm.title, pushSelectedUserIds, pushSpecificUserId]);

  useEffect(() => {
    if (!authed) return;
    if (tab === 'overview') {
      loadAnalytics('all', analyticsDate);
      load('transactions').then(d => setTransactions(Array.isArray(d)?d:[]));
    }
    if (tab === 'users') load('users').then(d => setUsers(Array.isArray(d)?d:[]));
    if (tab === 'withdrawals') loadWithdrawals();
    if (tab === 'developers') {
      load('developers').then(d => setDevelopers(Array.isArray(d)?d:[]));
      load('users').then(d => setUsers(Array.isArray(d)?d:[]));
    }
    if (tab === 'plans') load('plans').then(d => setPlans(Array.isArray(d)?d:[]));
    if (tab === 'products') load('products').then(d => setProducts(Array.isArray(d)?d:[]));
    if (tab === 'transactions') load('transactions').then(d => setTransactions(Array.isArray(d)?d:[]));
    if (tab === 'orders') loadOrders();
    if (tab === 'broadcasts') load('broadcasts').then(d => setBroadcasts(Array.isArray(d)?d:[]));
    if (tab === 'push') load('users').then(d => setUsers(Array.isArray(d)?d:[]));
    if (tab === 'chat') loadAdminSessions();
    if (tab === 'webhooks') load('webhooks').then(d => setWebhooks(Array.isArray(d)?d:[]));
    if (tab === 'sim') load('sim-activations').then(d => setSimActs(Array.isArray(d)?d:[]));
    if (tab === 'analytics') loadAnalytics();
  }, [tab, authed, load, loadAdminSessions, loadAnalytics, analyticsDate, loadOrders, loadWithdrawals]);

  useEffect(() => {
    if (!authed || tab !== 'analytics') return;
    loadAnalytics();
  }, [analyticsFilter, analyticsDate, authed, tab, loadAnalytics]);

  useEffect(() => {
    if (!authed || tab !== 'orders') return;
    loadOrders();
  }, [authed, tab, orderFilter, orderSearch, loadOrders]);

  useEffect(() => {
    if (!authed || tab !== 'withdrawals') return;
    loadWithdrawals();
  }, [authed, tab, withdrawalFilter, loadWithdrawals]);

  useEffect(() => {
    if (!selectedOrder) return;
    setOrderForm({
      fulfillmentStatus: selectedOrder.fulfillment_status || 'paid',
      trackingNumber: selectedOrder.tracking_number || '',
      adminNote: selectedOrder.admin_note || '',
    });
  }, [selectedOrder]);

  // Real-time wallet updates when needed
  useEffect(() => {
    // Placeholder for future real-time updates
  }, [authed, tab, adminToken]);

  useEffect(() => {
    if (!authed || tab !== 'chat') return;
    const token = localStorage.getItem('sm_admin_token') || adminToken;
    if (!token) return;

    const stream = new EventSource(`/api/admin/stream?token=${encodeURIComponent(token)}`);

    stream.addEventListener('ping', () => {
      setChatStreamConnected(true);
    });

    stream.addEventListener('sessions', (event) => {
      try {
        const rows = JSON.parse((event as MessageEvent).data) as AdminChatSession[];
        setChatSessions(Array.isArray(rows) ? rows : []);
        setActiveChatSession((prev) => prev ? rows.find((session) => session.id === prev.id) || prev : prev);
      } catch {
        // no-op
      }
    });

    stream.addEventListener('new_messages', (event) => {
      try {
        const rows = JSON.parse((event as MessageEvent).data) as Array<Record<string, unknown>>;
        if (!Array.isArray(rows) || rows.length === 0) return;
        const normalized: AdminChatMessage[] = rows.map((row) => ({
          ...(row as unknown as AdminChatMessage),
          content: String(row.content || row.message || ''),
        }));
        if (activeChatSession?.id) {
          const relevant = normalized.filter((msg) => msg.session_id === activeChatSession.id);
          if (relevant.length > 0) {
            setChatMessages((prev) => {
              const seen = new Set(prev.map((message) => message.id));
              return [...prev, ...relevant.filter((message) => !seen.has(message.id))];
            });
          }
        }
      } catch {
        // no-op
      }
    });

    stream.addEventListener('typing', (event) => {
      try {
        const rows = JSON.parse((event as MessageEvent).data) as Array<{ session_id: string; sender: string; is_typing: boolean }>;
        if (!Array.isArray(rows)) return;
        const map: Record<string, boolean> = {};
        rows.forEach((row) => {
          if (row.sender === 'customer') {
            map[row.session_id] = row.is_typing;
          }
        });
        setCustomerTypingMap((prev) => ({ ...prev, ...map }));
      } catch {
        // no-op
      }
    });

    stream.onerror = () => {
      setChatStreamConnected(false);
    };

    const fallbackPoll = setInterval(() => {
      loadAdminSessions();
      if (activeChatSession?.id) openChatSession(activeChatSession.id);
    }, 12000);

    return () => {
      setChatStreamConnected(false);
      stream.close();
      clearInterval(fallbackPoll);
      if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    };
  }, [authed, tab, activeChatSession?.id, adminToken, loadAdminSessions, openChatSession]);

  const sendAgentTyping = useCallback(async (isTyping: boolean) => {
    if (!activeChatSession?.id) return;
    try {
      await fetch('/api/chat/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeChatSession.id, sender: 'agent', isTyping }),
      });
    } catch {
      // no-op
    }
  }, [activeChatSession?.id]);

  const api = async (path: string, method: string, body?: unknown) => {
    const res = await fetch(`/api/admin/${path}`, { method, headers: authH(), body: body ? JSON.stringify(body) : undefined });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const loadDeveloperDetail = useCallback(async (userId: string) => {
    try {
      const payload = await load(`developers?userId=${encodeURIComponent(userId)}`) as Record<string, unknown>;
      if (!payload || Array.isArray(payload)) return;
      const dev = (payload.developer || null) as Developer | null;
      if (dev) setSelectedDeveloper(dev);
      setDeveloperKeys(Array.isArray(payload.keys) ? payload.keys as DeveloperKey[] : []);
      setDeveloperActivity(Array.isArray(payload.activity) ? payload.activity as DeveloperActivity[] : []);
      setDeveloperStats((payload.stats || {}) as Record<string, unknown>);
    } catch {
      showError('Failed to load developer details');
    }
  }, [load]);

  /* ── RECEIPT DOWNLOAD ── */
  const downloadReceipt = async (data: Record<string,unknown>) => {
    setReceiptModal(data);
  };

  const saveOrderUpdate = async () => {
    if (!selectedOrder) return;
    setOrderSaving(true);
    try {
      await api('orders', 'PATCH', {
        orderId: selectedOrder.id,
        fulfillmentStatus: orderForm.fulfillmentStatus,
        trackingNumber: orderForm.trackingNumber,
        adminNote: orderForm.adminNote,
      });
      const updatedOrder: Order = {
        ...selectedOrder,
        fulfillment_status: orderForm.fulfillmentStatus,
        tracking_number: orderForm.trackingNumber,
        admin_note: orderForm.adminNote,
        fulfillment_updated_at: new Date().toISOString(),
      };
      setSelectedOrder(updatedOrder);
      setOrders((prev) => prev.map((order) => order.id === updatedOrder.id ? updatedOrder : order));
      await loadOrders();
      showToast('Order workflow updated');
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Failed to update order');
    } finally {
      setOrderSaving(false);
    }
  };

  const runTransactionBatchStatus = async () => {
    if (!selectedTransactionIds.length) return;
    setBatchBusy(true);
    try {
      await api('transactions', 'PATCH', { ids: selectedTransactionIds, status: batchTxStatus });
      showToast(`Updated ${selectedTransactionIds.length} transactions`);
      const refreshed = await load('transactions');
      setTransactions(Array.isArray(refreshed) ? refreshed : []);
      setSelectedTransactionIds([]);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Batch update failed');
    } finally {
      setBatchBusy(false);
    }
  };

  const runTransactionBatchDelete = async () => {
    if (!selectedTransactionIds.length) return;
    const confirmed = window.confirm(`Delete ${selectedTransactionIds.length} selected transactions? This cannot be undone.`);
    if (!confirmed) return;
    setBatchBusy(true);
    try {
      await api('transactions', 'DELETE', { ids: selectedTransactionIds });
      showToast(`Deleted ${selectedTransactionIds.length} transactions`);
      const refreshed = await load('transactions');
      setTransactions(Array.isArray(refreshed) ? refreshed : []);
      setSelectedTransactionIds([]);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Batch delete failed');
    } finally {
      setBatchBusy(false);
    }
  };

  const runOrderBatchStatus = async () => {
    if (!selectedOrderIds.length) return;
    setBatchBusy(true);
    try {
      await api('orders', 'PATCH', { orderIds: selectedOrderIds, fulfillmentStatus: batchOrderStatus });
      showToast(`Updated ${selectedOrderIds.length} orders`);
      await loadOrders();
      setSelectedOrderIds([]);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Order batch update failed');
    } finally {
      setBatchBusy(false);
    }
  };

  const runOrderBatchDelete = async () => {
    if (!selectedOrderIds.length) return;
    const confirmed = window.confirm(`Delete ${selectedOrderIds.length} selected orders? This cannot be undone.`);
    if (!confirmed) return;
    setBatchBusy(true);
    try {
      await api('orders', 'DELETE', { orderIds: selectedOrderIds });
      showToast(`Deleted ${selectedOrderIds.length} orders`);
      await loadOrders();
      setSelectedOrderIds([]);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Order batch delete failed');
    } finally {
      setBatchBusy(false);
    }
  };

  useEffect(() => {
    setSelectedTransactionIds((prev) => prev.filter((id) => transactions.some((tx) => tx.id === id)));
  }, [transactions]);

  useEffect(() => {
    setSelectedOrderIds((prev) => prev.filter((id) => orders.some((order) => order.id === id)));
  }, [orders]);

  /* ── LOGIN SCREEN ── */
  if (!authed) return (
    <>
      <GlobalStyle />
      <div className="admin-shell" style={{ height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(180deg,#F4F7FB 0%,#ECF2FA 100%)',padding:24 }}>
        <div style={{ width:'min(460px, 96vw)',padding:'44px 40px',textAlign:'left',position:'relative',overflow:'hidden',borderRadius:24,background:'#FFFFFF',border:'1px solid rgba(15,23,42,.08)',boxShadow:'0 28px 70px rgba(15,23,42,.14)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:18 }}>
            <img src="/images/logo-sm.png" alt="SaukiMart" style={{ width:42,height:42,borderRadius:12,objectFit:'cover' }} />
            <div>
              <p style={{ fontSize:11,fontWeight:800,color:'#5E6A83',letterSpacing:'0.14em',textTransform:'uppercase' }}>SaukiMart Executive Console</p>
              <h1 style={{ fontSize:28,fontWeight:900,color:'#111827',margin:'4px 0 0',letterSpacing:'-0.03em' }}>Admin Sign In</h1>
            </div>
          </div>
          <p style={{ color:'#667085',fontSize:14,marginBottom:24,lineHeight:1.7 }}>Secure access to operations, transactions, developer activity, support and platform controls.</p>
          {error && <div style={{ padding:'11px 14px',borderRadius:12,background:'rgba(220,38,38,.08)',color:'#B91C1C',fontSize:14,marginBottom:14,border:'1px solid rgba(220,38,38,.2)' }}>{error}</div>}
          <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()}
            placeholder="Admin password" style={{ width:'100%',padding:'15px 16px',borderRadius:14,border:'1px solid rgba(15,23,42,.16)',fontSize:15,marginBottom:14,background:'#FFFFFF',color:'#0F172A' }} />
          <button onClick={login} style={{ width:'100%',justifyContent:'center',padding:'14px',borderRadius:14,background:'linear-gradient(135deg,#0B72E7,#075FBE)',color:'#FFFFFF',fontSize:15,fontWeight:800,border:'none',cursor:'pointer',boxShadow:'0 12px 28px rgba(7,95,190,.28)' }}>{loading?'Signing in...':'Sign In'}</button>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:20 }}>
            {['Finance','Support','Security'].map((item) => (
              <div key={item} style={{ border:'1px solid rgba(15,23,42,.1)',borderRadius:14,padding:'10px 8px',background:'#F8FAFC' }}>
                <p style={{ fontSize:11,color:'#64748B',textTransform:'uppercase',letterSpacing:'0.08em' }}>{item}</p>
                <p className="admin-code" style={{ fontSize:12,color:'#111827',marginTop:4 }}>verified</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  /* ── TABS ── */
  const TABS = [
    { id:'overview', label:'Overview', icon:'📊' },
    { id:'users', label:'Users', icon:'👥' },
    { id:'withdrawals', label:'Withdrawals', icon:'💸' },
    { id:'developers', label:'Developers', icon:'🧩' },
    { id:'plans', label:'Data Plans', icon:'📶' },
    { id:'products', label:'Products', icon:'📦' },
    { id:'transactions', label:'Transactions', icon:'💳' },
    { id:'orders', label:'Orders', icon:'🧾' },
    { id:'analytics', label:'Analytics', icon:'📈' },
    { id:'broadcasts', label:'Broadcasts', icon:'📢' },
    { id:'push', label:'Push Notifications', icon:'🔔' },
    { id:'chat', label:'Support Chat', icon:'💬' },
    { id:'sim', label:'SIM Activations', icon:'📡' },
    { id:'webhooks', label:'Webhooks', icon:'🔗' },
    { id:'console', label:'API Console', icon:'🛠️' },
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
          <div style={{ background:'linear-gradient(180deg, rgba(20,34,56,0.98), rgba(10,18,32,0.98))',borderRadius:24,padding:32,maxWidth:460,width:'100%',border:`1px solid ${BORDER}`,color:TEXT }}>
            <h3 style={{ fontWeight:800,fontSize:18,marginBottom:16 }}>Transaction Receipt</h3>
            <pre style={{ fontSize:12,background:'rgba(255,255,255,.03)',borderRadius:14,padding:14,overflowX:'auto',whiteSpace:'pre-wrap',maxHeight:400,overflow:'auto',border:`1px solid ${BORDER}`,color:'#d7e4f5' }}>{JSON.stringify(receiptModal,null,2)}</pre>
            <div style={{ display:'flex',gap:10,marginTop:16 }}>
              <Btn onClick={()=>setReceiptModal(null)} variant="ghost" style={{ flex:1 }}>Close</Btn>
            </div>
          </div>
        </div>
      )}

      <div className="admin-shell" style={{ display:'flex',height:'100vh',background:'transparent',position:'relative' }}>
        {/* Sidebar */}
        <div style={{ width:280,background:'linear-gradient(180deg, rgba(7,14,25,0.98) 0%, rgba(8,18,31,0.94) 100%)',display:'flex',flexDirection:'column',flexShrink:0,overflowY:'auto',borderRight:`1px solid ${BORDER}`,paddingBottom:22,boxShadow:'inset -1px 0 0 rgba(255,255,255,0.03)' }}>
          <div style={{ padding:'28px 22px 18px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              <img src="/images/logo-sm.png" alt="SaukiMart" style={{ width:42,height:42,borderRadius:12,objectFit:'cover',boxShadow:'0 14px 26px rgba(30,78,145,.35)' }} />
              <div>
                <p style={{ color:TEXT,fontWeight:800,fontSize:16,letterSpacing:'-0.02em' }}>SaukiMart</p>
                <p style={{ color:MUTED,fontSize:11,letterSpacing:'0.12em',textTransform:'uppercase' }}>Executive Admin</p>
              </div>
            </div>
          </div>
          <nav style={{ flex:1,padding:'0 14px' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={()=>setTab(t.id as typeof tab)}
                style={{ width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:14,marginBottom:6,background: tab===t.id?'linear-gradient(135deg, rgba(38,95,180,.26), rgba(47,140,210,.12))':'transparent',border:tab===t.id?`1px solid rgba(124,199,255,.28)`:'1px solid transparent',transition:'all .15s',boxShadow:tab===t.id?'inset 0 1px 0 rgba(255,255,255,.04)':'none' }}>
                <span className="admin-code" style={{ fontSize:11, width:28, textAlign:'center', opacity:tab===t.id?1:.85, background:'rgba(255,255,255,.08)',borderRadius:7,padding:'4px 0' }}>{t.icon}</span>
                <span style={{ fontSize:14,fontWeight:tab===t.id?800:600,color:tab===t.id?TEXT:'rgba(231,241,255,.76)',letterSpacing:'0.01em' }}>{t.label}</span>
              </button>
            ))}
          </nav>
          <div style={{ padding:'0 20px 0' }}>
            <button onClick={()=>{ localStorage.removeItem('sm_admin_token'); setAuthed(false); setAdminToken(''); }}
              style={{ color:'rgba(255,182,191,.9)',fontSize:14,fontWeight:700,background:'rgba(160,58,78,.16)',border:'1px solid rgba(255,127,138,.18)',width:'100%',padding:'12px 14px',borderRadius:14 }}>Sign Out</button>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex:1,overflowY:'auto',padding:'26px 28px 34px',position:'relative',zIndex:1 }}>

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
                      {[['Name',`${selectedUser.first_name} ${selectedUser.last_name}`],['Phone',selectedUser.phone],['Balance',`₦${Number(selectedUser.wallet_balance).toLocaleString()}`],['Cashback',`₦${Number(selectedUser.cashback_balance).toLocaleString()}`],['Referral Bal.',`₦${Number(selectedUser.referral_balance || 0).toLocaleString()}`],['Referral ID',selectedUser.referral_id||'—'],['Total GB',`${Number(selectedUser.total_gb_purchased || 0).toLocaleString('en-NG',{maximumFractionDigits:2})}GB`],['Account',selectedUser.flw_account_number||'—'],['Status',selectedUser.is_banned?'🔴 Banned':'🟢 Active'],['Joined',new Date(selectedUser.created_at).toLocaleDateString('en-NG')]].map(([k,v])=>(
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
                              <option value="referral">Referral Balance</option>
                            </select>
                          </div>
                        </div>
                        <Input label="Reason" value={walletForm.note} onChange={v=>setWalletForm(p=>({...p,note:v}))} placeholder="Adjustment note (optional)" />
                        <div style={{ display:'flex',gap:8 }}>
                          <Btn variant="success" size="sm" onClick={async()=>{
                            try {
                              await api('wallet', 'POST', { userId: selectedUser.id, action:'credit', amount: Number(walletForm.amount), target: walletForm.target, note: walletForm.note });
                              showToast(`✅ Credited ₦${walletForm.amount} to ${walletForm.target === 'cashback' ? 'cashback' : walletForm.target === 'referral' ? 'referral' : 'wallet'}`);
                              setWalletForm({amount:'',note:'',target:'wallet'});
                              load('users').then(d=>setUsers(Array.isArray(d)?d:[]));
                              setSelectedUser(null);
                            } catch(e:unknown){ showError(e instanceof Error?e.message:'Failed'); }
                          }}>Credit</Btn>
                          <Btn variant="danger" size="sm" onClick={async()=>{
                            try {
                              await api('wallet', 'POST', { userId: selectedUser.id, action:'debit', amount: Number(walletForm.amount), target: walletForm.target, note: walletForm.note });
                              showToast(`✅ Debited ₦${walletForm.amount} from ${walletForm.target === 'cashback' ? 'cashback' : walletForm.target === 'referral' ? 'referral' : 'wallet'}`);
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
          {tab === 'developers' && (
            <div className="fade-in">
              <h1 style={{ fontSize:22,fontWeight:900,marginBottom:20 }}>Developer Management</h1>
              {selectedDeveloper && (
                <div style={{ marginBottom:20 }}>
                  <Card>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:14,flexWrap:'wrap' }}>
                      <div>
                        <p style={{ fontSize:18,fontWeight:900,color:'#10253E' }}>{selectedDeveloper.first_name} {selectedDeveloper.last_name}</p>
                        <p style={{ fontSize:13,color:'#5F738F',marginTop:4 }}>{selectedDeveloper.phone} · Discount {Number(selectedDeveloper.developer_discount_percent || 0).toFixed(2)}%</p>
                      </div>
                      <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                        <Btn size="sm" variant="ghost" onClick={async()=>{
                          if (!selectedDeveloper) return;
                          setDeveloperBusy(true);
                          try {
                            await api('developers', 'PATCH', { userId: selectedDeveloper.id, action: 'revoke-keys' });
                            showToast('All API keys revoked');
                            await loadDeveloperDetail(selectedDeveloper.id);
                            load('developers').then(rows => setDevelopers(Array.isArray(rows) ? rows as Developer[] : []));
                          } catch (e: unknown) {
                            showError(e instanceof Error ? e.message : 'Failed to revoke keys');
                          } finally {
                            setDeveloperBusy(false);
                          }
                        }} style={{ opacity: developerBusy ? .6 : 1, pointerEvents: developerBusy ? 'none' : 'auto' }}>Revoke Keys</Btn>
                        <Btn size="sm" variant="danger" onClick={async()=>{
                          if (!selectedDeveloper) return;
                          const confirmed = window.confirm(`Demote ${selectedDeveloper.first_name} ${selectedDeveloper.last_name} to regular user?`);
                          if (!confirmed) return;
                          setDeveloperBusy(true);
                          try {
                            await api('developers', 'PATCH', { userId: selectedDeveloper.id, action: 'demote' });
                            showToast('Developer demoted to user');
                            setSelectedDeveloper(null);
                            setDeveloperKeys([]);
                            setDeveloperActivity([]);
                            setDeveloperStats({});
                            load('developers').then(rows => setDevelopers(Array.isArray(rows) ? rows as Developer[] : []));
                          } catch (e: unknown) {
                            showError(e instanceof Error ? e.message : 'Failed to demote developer');
                          } finally {
                            setDeveloperBusy(false);
                          }
                        }} style={{ opacity: developerBusy ? .6 : 1, pointerEvents: developerBusy ? 'none' : 'auto' }}>Demote to User</Btn>
                        <Btn size="sm" variant="ghost" onClick={()=>{ setSelectedDeveloper(null); setDeveloperKeys([]); setDeveloperActivity([]); setDeveloperStats({}); }}>Close</Btn>
                      </div>
                    </div>

                    <div style={{ display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:10,marginBottom:14 }}>
                      {[
                        { label:'Active Keys', value: Number(selectedDeveloper.active_keys || 0) },
                        { label:'Total Requests', value: Number(developerStats.total_requests || 0) },
                        { label:'Successful', value: Number(developerStats.successful_requests || 0) },
                        { label:'Spend', value: `₦${Number(developerStats.total_developer_spend || 0).toLocaleString('en-NG')}` },
                      ].map((item) => (
                        <div key={item.label} style={{ border:'1px solid #E6ECF6',borderRadius:14,padding:'10px 12px',background:'#F7FAFF' }}>
                          <p style={{ fontSize:11,fontWeight:800,color:'#7B8DA8',textTransform:'uppercase',letterSpacing:'0.06em' }}>{item.label}</p>
                          <p style={{ fontSize:16,fontWeight:900,color:'#17385F',marginTop:4 }}>{item.value as string | number}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
                      <div>
                        <p style={{ fontSize:13,fontWeight:900,color:'#17385F',marginBottom:8 }}>API Keys</p>
                        <div style={{ maxHeight:220,overflowY:'auto',border:'1px solid #E6ECF6',borderRadius:12,padding:8,background:'#FBFDFF' }}>
                          {developerKeys.length === 0 ? (
                            <p style={{ fontSize:12,color:'#7B8DA8',padding:8 }}>No keys found</p>
                          ) : developerKeys.map((k) => (
                            <div key={k.id} style={{ padding:'8px 10px',borderBottom:'1px solid #EDF2FA' }}>
                              <p style={{ fontSize:12,fontWeight:800,color:'#17385F' }}>{k.key_prefix}••••{k.key_last4}</p>
                              <p style={{ fontSize:11,color:'#7B8DA8',marginTop:3 }}>Status: {k.is_active ? 'Active' : 'Revoked'} · Last used: {k.last_used_at ? new Date(k.last_used_at).toLocaleString('en-NG',{dateStyle:'short',timeStyle:'short'}) : 'Never'}</p>
                              {k.is_active && (
                                <div style={{ marginTop:6 }}>
                                  <Btn size="sm" variant="danger" onClick={async()=>{
                                    if (!selectedDeveloper) return;
                                    const ok = window.confirm('Revoke this key?');
                                    if (!ok) return;
                                    try {
                                      await api('developers', 'PATCH', { userId: selectedDeveloper.id, keyId: k.id, action: 'revoke-key' });
                                      showToast('Key revoked');
                                      await loadDeveloperDetail(selectedDeveloper.id);
                                      load('developers').then(rows => setDevelopers(Array.isArray(rows) ? rows as Developer[] : []));
                                    } catch (e: unknown) {
                                      showError(e instanceof Error ? e.message : 'Failed to revoke key');
                                    }
                                  }}>Revoke This Key</Btn>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize:13,fontWeight:900,color:'#17385F',marginBottom:8 }}>Past Activities</p>
                        <div style={{ maxHeight:220,overflowY:'auto',border:'1px solid #E6ECF6',borderRadius:12,padding:8,background:'#FBFDFF' }}>
                          {developerActivity.length === 0 ? (
                            <p style={{ fontSize:12,color:'#7B8DA8',padding:8 }}>No developer activity yet</p>
                          ) : developerActivity.map((a) => (
                            <div key={a.id} style={{ padding:'8px 10px',borderBottom:'1px solid #EDF2FA' }}>
                              <p style={{ fontSize:12,fontWeight:800,color:a.status === 'success' ? '#0E9F6E' : '#C2414F' }}>{a.status.toUpperCase()} · {a.plan_code || 'N/A'}</p>
                              <p style={{ fontSize:11,color:'#455D80',marginTop:3 }}>{a.phone_number || 'N/A'} · ₦{Number(a.developer_price || 0).toLocaleString('en-NG',{minimumFractionDigits:2})}</p>
                              <p style={{ fontSize:10,color:'#7B8DA8',marginTop:3 }}>{new Date(a.created_at).toLocaleString('en-NG',{dateStyle:'short',timeStyle:'short'})}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
                <Card>
                  <h3 style={{ fontWeight:800,fontSize:16,marginBottom:16 }}>{selectedDeveloper ? 'Update Developer' : 'Add Developer'}</h3>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:13,fontWeight:600,color:'#6E6E73',marginBottom:8,display:'block' }}>User</label>
                    <select
                      value={developerForm.userId}
                      onChange={e=>setDeveloperForm(p=>({ ...p, userId:e.target.value }))}
                      style={{ width:'100%',padding:'12px 14px',borderRadius:12,border:'1px solid rgba(0,0,0,0.15)',fontSize:14 }}
                    >
                      <option value="">Select user</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.phone})</option>
                      ))}
                    </select>
                  </div>
                  <Input label="Developer Discount (%)" value={developerForm.discountPercent} onChange={v=>setDeveloperForm(p=>({...p,discountPercent:v.replace(/[^0-9.]/g,'')}))} placeholder="8.00" />
                  <Input label="Terms Version" value={developerForm.termsVersion} onChange={v=>setDeveloperForm(p=>({...p,termsVersion:v}))} placeholder="v1.0" />
                  <div style={{ display:'flex',gap:8 }}>
                    <Btn onClick={async()=>{
                      if (!developerForm.userId) {
                        showError('Select a user first');
                        return;
                      }
                      try {
                        if (selectedDeveloper) {
                          await api('developers', 'PATCH', {
                            userId: developerForm.userId,
                            discountPercent: Number(developerForm.discountPercent || 0),
                            termsVersion: developerForm.termsVersion,
                          });
                          showToast('Developer updated');
                        } else {
                          await api('developers', 'POST', {
                            userId: developerForm.userId,
                            discountPercent: Number(developerForm.discountPercent || 0),
                            termsVersion: developerForm.termsVersion,
                          });
                          showToast('User upgraded to developer');
                        }
                        load('developers').then(d => setDevelopers(Array.isArray(d)?d:[]));
                        setSelectedDeveloper(null);
                        setDeveloperForm({ userId:'', discountPercent:'8.00', termsVersion:'v1.0' });
                      } catch (e: unknown) {
                        showError(e instanceof Error ? e.message : 'Failed to save developer');
                      }
                    }}>{selectedDeveloper ? 'Update Developer' : 'Upgrade to Developer'}</Btn>
                    {selectedDeveloper && (
                      <Btn variant="ghost" onClick={()=>{ setSelectedDeveloper(null); setDeveloperForm({ userId:'', discountPercent:'8.00', termsVersion:'v1.0' }); }}>Cancel</Btn>
                    )}
                  </div>
                </Card>

                <Card>
                  <h3 style={{ fontWeight:800,fontSize:16,marginBottom:16 }}>Developers ({developers.length})</h3>
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%',borderCollapse:'collapse' }}>
                      <thead>
                        <tr style={{ background:'#F9F9F9' }}>
                          {['Name','Phone','Discount','Keys','Last Used','Actions'].map(h=><th key={h} style={{ padding:'10px 12px',fontSize:12,fontWeight:700,color:'#8E8E93',textAlign:'left',borderBottom:'1px solid #F2F2F7' }}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {developers.map((d) => (
                          <tr key={d.id} style={{ borderBottom:'1px solid #F9F9F9' }}>
                            <td style={{ padding:'10px 12px',fontSize:13,fontWeight:700 }}>{d.first_name} {d.last_name}</td>
                            <td style={{ padding:'10px 12px',fontSize:13,color:'#6E6E73' }}>{d.phone}</td>
                            <td style={{ padding:'10px 12px',fontSize:13,fontWeight:800,color:BLUE }}>{Number(d.developer_discount_percent || 0).toFixed(2)}%</td>
                            <td style={{ padding:'10px 12px',fontSize:13,fontWeight:700 }}>{d.active_keys || 0}</td>
                            <td style={{ padding:'10px 12px',fontSize:12,color:'#8E8E93' }}>{d.last_used_at ? new Date(d.last_used_at).toLocaleString('en-NG',{dateStyle:'short',timeStyle:'short'}) : 'Never'}</td>
                            <td style={{ padding:'10px 12px' }}>
                              <div style={{ display:'flex',gap:6 }}>
                                <Btn size="sm" variant="ghost" onClick={async()=>{
                                  await loadDeveloperDetail(d.id);
                                  setDeveloperForm({
                                    userId: d.id,
                                    discountPercent: String(Number(d.developer_discount_percent || 0).toFixed(2)),
                                    termsVersion: d.developer_terms_version || 'v1.0',
                                  });
                                }}>View</Btn>
                                <Btn size="sm" variant="ghost" onClick={()=>{
                                  setSelectedDeveloper(d);
                                  setDeveloperForm({
                                    userId: d.id,
                                    discountPercent: String(Number(d.developer_discount_percent || 0).toFixed(2)),
                                    termsVersion: d.developer_terms_version || 'v1.0',
                                  });
                                }}>Edit</Btn>
                                <Btn size="sm" variant="danger" onClick={async()=>{
                                  const confirmed = window.confirm(`Demote ${d.first_name} ${d.last_name} to regular user?`);
                                  if (!confirmed) return;
                                  try {
                                    await api('developers', 'PATCH', { userId: d.id, action: 'demote' });
                                    showToast('Developer demoted to user');
                                    if (selectedDeveloper?.id === d.id) {
                                      setSelectedDeveloper(null);
                                      setDeveloperKeys([]);
                                      setDeveloperActivity([]);
                                      setDeveloperStats({});
                                    }
                                    load('developers').then(rows => setDevelopers(Array.isArray(rows) ? rows : []));
                                  } catch (e: unknown) {
                                    showError(e instanceof Error ? e.message : 'Failed to demote developer');
                                  }
                                }}>Demote</Btn>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ─── WITHDRAWALS ─── */}
          {tab === 'withdrawals' && (
            <div className="fade-in">
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
                <h1 style={{ fontSize:22,fontWeight:900 }}>Referral Withdrawals</h1>
                <select value={withdrawalFilter} onChange={e=>setWithdrawalFilter(e.target.value)}
                  style={{ padding:'10px 14px',borderRadius:12,border:'1.5px solid #E5E5EA',fontSize:14 }}>
                  {['all','pending','paid','rejected'].map(f=><option key={f} value={f}>{f.charAt(0).toUpperCase()+f.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24 }}>
                {[
                  { label:'Pending', value: Number(withdrawalStats.pendingCount||0), color:'#FF9F0A' },
                  { label:'Paid', value: Number(withdrawalStats.paidCount||0), color:GREEN },
                  { label:'Rejected', value: Number(withdrawalStats.rejectedCount||0), color:RED },
                  { label:'Pending Amount', value:`₦${Number(withdrawalStats.pendingAmount||0).toLocaleString('en-NG')}`, color:BLUE },
                ].map(s=>(
                  <Card key={s.label}>
                    <p style={{ fontSize:13,color:'#8E8E93',marginBottom:8 }}>{s.label}</p>
                    <p style={{ fontSize:24,fontWeight:900,color:s.color }}>{s.value as string}</p>
                  </Card>
                ))}
              </div>
              <Card>
                <table style={{ width:'100%',borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#F9F9F9' }}>
                    {['User','Bank','Account','Amount','Status','Requested','Actions'].map(h=>(
                      <th key={h} style={{ padding:'10px 14px',fontSize:12,fontWeight:700,color:'#8E8E93',textAlign:'left',borderBottom:'1px solid #F2F2F7' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {withdrawals.length === 0 && (
                      <tr><td colSpan={7} style={{ padding:32,textAlign:'center',color:'#8E8E93',fontSize:14 }}>No withdrawals found</td></tr>
                    )}
                    {withdrawals.map(w=>(
                      <tr key={w.id} style={{ borderBottom:'1px solid #F9F9F9' }}>
                        <td style={{ padding:'12px 14px',fontSize:13 }}>{w.firstName} {w.lastName}<br/><span style={{ color:'#8E8E93',fontSize:11 }}>{w.phone}</span></td>
                        <td style={{ padding:'12px 14px',fontSize:13 }}>{w.bankName}</td>
                        <td style={{ padding:'12px 14px',fontSize:13 }}>{w.accountNumber}<br/><span style={{ color:'#8E8E93',fontSize:11 }}>{w.accountName}</span></td>
                        <td style={{ padding:'12px 14px',fontSize:14,fontWeight:700,color:GREEN }}>₦{Number(w.amount).toLocaleString()}</td>
                        <td style={{ padding:'12px 14px' }}>
                          <span style={{ background:w.status==='paid'?'rgba(52,199,89,.1)':w.status==='rejected'?'rgba(255,59,48,.1)':'rgba(255,149,0,.1)',color:w.status==='paid'?GREEN:w.status==='rejected'?RED:'#FF9F0A',padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:700,textTransform:'uppercase' }}>{w.status}</span>
                        </td>
                        <td style={{ padding:'12px 14px',fontSize:12,color:'#8E8E93' }}>{new Date(w.createdAt).toLocaleString('en-NG',{dateStyle:'short',timeStyle:'short'})}</td>
                        <td style={{ padding:'12px 14px' }}>
                          {w.status === 'pending' && (
                            <div style={{ display:'flex',gap:6 }}>
                              <button onClick={async()=>{
                                if (withdrawalActionBusy) return;
                                setWithdrawalActionBusy(w.id);
                                try { await api('withdrawals','PATCH',{withdrawalId:w.id,action:'mark-paid'}); showToast('✅ Marked as paid'); loadWithdrawals(); } catch(e:unknown){ showError(e instanceof Error?e.message:'Failed'); } finally{ setWithdrawalActionBusy(''); }
                              }} disabled={withdrawalActionBusy === w.id}
                                style={{ padding:'6px 14px',borderRadius:8,background:'rgba(52,199,89,.15)',color:GREEN,border:'none',fontWeight:700,fontSize:12,cursor:'pointer' }}>Pay</button>
                              <button onClick={async()=>{
                                if (withdrawalActionBusy) return;
                                setWithdrawalActionBusy(w.id);
                                try { await api('withdrawals','PATCH',{withdrawalId:w.id,action:'reject'}); showToast('Rejected & refunded'); loadWithdrawals(); } catch(e:unknown){ showError(e instanceof Error?e.message:'Failed'); } finally{ setWithdrawalActionBusy(''); }
                              }} disabled={withdrawalActionBusy === w.id}
                                style={{ padding:'6px 14px',borderRadius:8,background:'rgba(255,59,48,.12)',color:RED,border:'none',fontWeight:700,fontSize:12,cursor:'pointer' }}>Reject</button>
                            </div>
                          )}
                          {w.status !== 'pending' && <span style={{ color:'#C7C7CC',fontSize:12 }}>{w.status === 'paid' ? (w.payoutReference || '—') : w.adminNote || '—'}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
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
              <h1 style={{ fontSize:22,fontWeight:900,marginBottom:12 }}>All Transactions ({transactions.length})</h1>
              <Card style={{ marginBottom:14,padding:'14px 16px' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <button onClick={()=>setSelectedTransactionIds(transactions.map((tx)=>tx.id))} style={{ padding:'8px 11px',borderRadius:10,border:'1px solid rgba(196,208,230,.9)',background:'#fff',fontSize:12,fontWeight:700,color:'#38587f' }}>Select all</button>
                    <button onClick={()=>setSelectedTransactionIds([])} style={{ padding:'8px 11px',borderRadius:10,border:'1px solid rgba(196,208,230,.9)',background:'#fff',fontSize:12,fontWeight:700,color:'#38587f' }}>Clear</button>
                    <span style={{ fontSize:12,fontWeight:800,color:'#5f738f' }}>{selectedTransactionIds.length} selected</span>
                  </div>
                  <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
                    <select value={batchTxStatus} onChange={(e)=>setBatchTxStatus(e.target.value)} style={{ padding:'8px 10px',borderRadius:10,border:'1px solid rgba(196,208,230,.9)',fontSize:12,color:'#204066' }}>
                      {['pending','success','failed'].map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <Btn size="sm" variant="ghost" onClick={runTransactionBatchStatus} style={{ opacity: selectedTransactionIds.length === 0 || batchBusy ? .6 : 1, pointerEvents: selectedTransactionIds.length === 0 || batchBusy ? 'none' : 'auto' }}>{batchBusy ? 'Working…' : 'Batch Update'}</Btn>
                    <Btn size="sm" variant="danger" onClick={runTransactionBatchDelete} style={{ opacity: selectedTransactionIds.length === 0 || batchBusy ? .6 : 1, pointerEvents: selectedTransactionIds.length === 0 || batchBusy ? 'none' : 'auto' }}>Batch Delete</Btn>
                  </div>
                </div>
              </Card>
              <Card>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%',borderCollapse:'collapse' }}>
                    <thead><tr style={{ background:'#F9F9F9' }}>
                      {['','User/Phone','Type','Description','Amount','Status','Date','Receipt'].map(h=><th key={h} style={{ padding:'10px 14px',fontSize:12,fontWeight:700,color:'#8E8E93',textAlign:'left',borderBottom:'1px solid #F2F2F7',whiteSpace:'nowrap' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>{transactions.map(tx=>(
                      <tr key={tx.id} style={{ borderBottom:'1px solid #F9F9F9' }}>
                        <td style={{ padding:'12px 10px' }}>
                          <input type="checkbox" checked={selectedTransactionIds.includes(tx.id)} onChange={(e)=>setSelectedTransactionIds((prev)=>e.target.checked ? [...prev, tx.id] : prev.filter((id)=>id!==tx.id))} />
                        </td>
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
                <div style={{ display:'flex',gap:10,alignItems:'center' }}>
                  <select value={analyticsFilter} onChange={e=>setAnalyticsFilter(e.target.value)} style={{ padding:'10px 14px',borderRadius:12,border:'1.5px solid #E5E5EA',fontSize:14 }}>
                    {['all','today','week','month','custom'].map(f=><option key={f} value={f}>{f === 'custom' ? 'Select Date' : f.charAt(0).toUpperCase()+f.slice(1)}</option>)}
                  </select>
                  <input
                    type="date"
                    value={analyticsDate}
                    onChange={e=>{ setAnalyticsDate(e.target.value); setAnalyticsFilter('custom'); }}
                    style={{ padding:'10px 14px',borderRadius:12,border:'1.5px solid #E5E5EA',fontSize:14 }}
                  />
                </div>
              </div>
              <p style={{ color:'#8E8E93',marginBottom:16,fontSize:13 }}>
                Viewing: {String((analytics as Record<string,unknown>).rangeLabel || 'last 30 days')}
              </p>
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
                  { label:'Active Users Today', value:(analytics as Record<string,unknown>).activeToday||0 },
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

          {/* ─── PUSH NOTIFICATIONS ─── */}
          {tab === 'push' && (
            <div className="fade-in">
              <h1 style={{ fontSize:22,fontWeight:900,marginBottom:6 }}>Push Notifications</h1>
              <p style={{ color:'#8E8E93',marginBottom:20 }}>Send FCM notifications to all users, a single user, or a selected list.</p>
              <div style={{ display:'grid',gridTemplateColumns:'1.1fr .9fr',gap:20 }}>
                <Card>
                  <h3 style={{ fontWeight:800,fontSize:16,marginBottom:12 }}>Compose Campaign</h3>
                  <div style={{ display:'flex',gap:8,marginBottom:14,flexWrap:'wrap' }}>
                    {[
                      { id: 'all', label: 'All Users' },
                      { id: 'specific', label: 'Specific User' },
                      { id: 'selected', label: 'Selected Users' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setPushAudience(opt.id as 'all'|'specific'|'selected');
                          if (opt.id !== 'selected') setPushSelectedUserIds([]);
                        }}
                        style={{
                          padding:'8px 14px',
                          borderRadius:10,
                          border:`1.5px solid ${pushAudience===opt.id?BLUE:'#E5E5EA'}`,
                          background:pushAudience===opt.id?'rgba(0,122,255,.08)':'transparent',
                          color:pushAudience===opt.id?BLUE:'#6C6C70',
                          fontSize:13,
                          fontWeight:700,
                          cursor:'pointer',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <Input label="Title" value={pushForm.title} onChange={v=>setPushForm(p=>({...p,title:v}))} placeholder="Service update" />
                  <Input label="Message" value={pushForm.message} onChange={v=>setPushForm(p=>({...p,message:v}))} multiline placeholder="Write the notification body users will see..." />

                  {pushAudience === 'specific' && (
                    <div style={{ marginBottom:14 }}>
                      <label style={{ display:'block',fontSize:13,fontWeight:600,color:'#6E6E73',marginBottom:8 }}>Choose user</label>
                      <select
                        value={pushSpecificUserId}
                        onChange={e=>setPushSpecificUserId(e.target.value)}
                        style={{ width:'100%',padding:'12px 14px',borderRadius:12,border:'1px solid rgba(0,0,0,0.15)',fontSize:14 }}
                      >
                        <option value="">Select a user</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.phone})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {pushAudience === 'selected' && (
                    <div style={{ marginBottom:14 }}>
                      <Input label="Filter users" value={pushUserSearch} onChange={setPushUserSearch} placeholder="Search by name or phone" />
                      <div style={{ maxHeight:220,overflowY:'auto',border:'1px solid #E5E5EA',borderRadius:12,padding:10 }}>
                        {users
                          .filter(u => {
                            const q = pushUserSearch.toLowerCase();
                            if (!q) return true;
                            return u.first_name.toLowerCase().includes(q) || u.last_name.toLowerCase().includes(q) || u.phone.includes(q);
                          })
                          .slice(0, 80)
                          .map(u => {
                            const checked = pushSelectedUserIds.includes(u.id);
                            return (
                              <label key={u.id} style={{ display:'flex',alignItems:'center',gap:8,padding:'6px 4px',fontSize:13,cursor:'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => setPushSelectedUserIds(prev => checked ? prev.filter(id => id !== u.id) : [...prev, u.id])}
                                />
                                <span>{u.first_name} {u.last_name} ({u.phone})</span>
                              </label>
                            );
                          })}
                      </div>
                      <p style={{ marginTop:8,fontSize:12,color:'#8E8E93' }}>{pushSelectedUserIds.length} users selected</p>
                    </div>
                  )}

                  <Btn onClick={sendPushCampaign} style={{ width:'100%' }}>
                    {pushSending ? 'Sending...' : 'Send Push Notification'}
                  </Btn>
                </Card>

                <Card>
                  <h3 style={{ fontWeight:800,fontSize:16,marginBottom:12 }}>Campaign Result</h3>
                  {pushResult ? (
                    <div>
                      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14 }}>
                        <div style={{ background:'rgba(0,122,255,.08)',borderRadius:12,padding:12 }}>
                          <p style={{ fontSize:12,color:'#8E8E93' }}>Targeted</p>
                          <p style={{ fontSize:24,fontWeight:900,color:BLUE }}>{String(pushResult.targetedTokens ?? 0)}</p>
                        </div>
                        <div style={{ background:'rgba(52,199,89,.08)',borderRadius:12,padding:12 }}>
                          <p style={{ fontSize:12,color:'#8E8E93' }}>Sent</p>
                          <p style={{ fontSize:24,fontWeight:900,color:GREEN }}>{String(pushResult.sentCount ?? 0)}</p>
                        </div>
                        <div style={{ background:'rgba(255,59,48,.08)',borderRadius:12,padding:12 }}>
                          <p style={{ fontSize:12,color:'#8E8E93' }}>Failed</p>
                          <p style={{ fontSize:24,fontWeight:900,color:RED }}>{String(pushResult.failedCount ?? 0)}</p>
                        </div>
                        <div style={{ background:'rgba(255,149,0,.08)',borderRadius:12,padding:12 }}>
                          <p style={{ fontSize:12,color:'#8E8E93' }}>Deactivated Tokens</p>
                          <p style={{ fontSize:24,fontWeight:900,color:GOLD }}>{String(pushResult.deactivatedCount ?? 0)}</p>
                        </div>
                      </div>
                      <pre style={{ fontSize:12,background:'#F2F2F7',borderRadius:10,padding:12,whiteSpace:'pre-wrap' }}>{JSON.stringify(pushResult, null, 2)}</pre>
                    </div>
                  ) : (
                    <p style={{ fontSize:14,color:'#8E8E93' }}>Send a campaign to see delivery stats here.</p>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* ─── SUPPORT CHAT ─── */}
          {tab === 'chat' && (
            <div className="fade-in">
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
                <div>
                  <h1 style={{ fontSize:22,fontWeight:900,marginBottom:4 }}>Support Chat</h1>
                  <p style={{ color:'#8E8E93',fontSize:13 }}>Monitor conversations, take over instantly, and respond with real-time synchronization.</p>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <span className="admin-code" style={{ fontSize:11,padding:'5px 8px',borderRadius:999,border:'1px solid rgba(196,208,230,.9)',background:chatStreamConnected?'rgba(34,132,96,.12)':'rgba(191,120,42,.12)',color:chatStreamConnected?'#1f6d5c':'#a17018' }}>
                    {chatStreamConnected ? 'LIVE' : 'POLL'}
                  </span>
                  <Btn variant="ghost" onClick={()=>loadAdminSessions()}>Refresh</Btn>
                </div>
              </div>

              <div style={{ display:'grid',gridTemplateColumns:'340px 1fr',gap:16 }}>
                <Card style={{ padding:16 }}>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10 }}>
                    <div style={{ background:'rgba(0,122,255,.08)',borderRadius:10,padding:10 }}>
                      <p style={{ fontSize:11,color:'#8E8E93' }}>Active</p>
                      <p style={{ fontWeight:900,fontSize:20,color:BLUE }}>{String(chatStats.active_count || 0)}</p>
                    </div>
                    <div style={{ background:'rgba(255,149,0,.08)',borderRadius:10,padding:10 }}>
                      <p style={{ fontSize:11,color:'#8E8E93' }}>Need Agent</p>
                      <p style={{ fontWeight:900,fontSize:20,color:GOLD }}>{String(chatStats.needs_agent_count || 0)}</p>
                    </div>
                  </div>
                  <div style={{ display:'flex',gap:8,marginBottom:10,flexWrap:'wrap' }}>
                    {['all','needs_agent','active','resolved','flagged'].map(f => (
                      <button
                        key={f}
                        onClick={() => { setChatFilter(f); loadAdminSessions(f, chatSearch); }}
                        style={{
                          padding:'6px 10px',
                          borderRadius:9,
                          border:`1px solid ${chatFilter===f?BLUE:'#E5E5EA'}`,
                          background:chatFilter===f?'rgba(0,122,255,.08)':'#fff',
                          color:chatFilter===f?BLUE:'#6C6C70',
                          fontSize:12,
                          fontWeight:700,
                        }}
                      >
                        {f.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  <Input label="Search" value={chatSearch} onChange={setChatSearch} placeholder="Customer id, name, or message" />
                  <Btn variant="ghost" size="sm" onClick={()=>loadAdminSessions(chatFilter, chatSearch)} style={{ marginBottom:10 }}>Apply Search</Btn>
                  <div style={{ maxHeight:520,overflowY:'auto',display:'flex',flexDirection:'column',gap:8 }}>
                    {chatSessions.map(s => (
                      <button
                        key={s.id}
                        onClick={()=>openChatSession(s.id)}
                        style={{
                          textAlign:'left',
                          padding:10,
                          borderRadius:10,
                          border:`1px solid ${activeChatSession?.id===s.id?BLUE:'#EDEDED'}`,
                          background:activeChatSession?.id===s.id?'rgba(0,122,255,.06)':'#fff',
                        }}
                      >
                        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4,gap:8 }}>
                          <p style={{ fontSize:13,fontWeight:700,color:'#1C1C1E',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{s.customer_name || s.customer_id}</p>
                          <span style={{ fontSize:11,fontWeight:700,color:'#8E8E93' }}>{s.unread_count || 0}</span>
                        </div>
                        <p style={{ fontSize:11,color:'#8E8E93',marginBottom:4 }}>{s.customer_id}</p>
                        <p style={{ fontSize:12,color:'#3C3C43',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{s.last_message || 'No message yet'}</p>
                        {customerTypingMap[s.id] && <p style={{ fontSize:11,color:'#2a6dad',marginTop:4,fontWeight:700 }}>Customer is typing…</p>}
                        <div style={{ display:'flex',justifyContent:'space-between',marginTop:6 }}>
                          <span style={{ fontSize:10,color:'#8E8E93' }}>{s.last_message_at ? new Date(s.last_message_at).toLocaleString('en-NG',{ dateStyle:'short', timeStyle:'short' }) : '-'}</span>
                          <span style={{ fontSize:10,fontWeight:700,color:s.status==='agent_required'?GOLD:s.status==='resolved'?GREEN:'#8E8E93' }}>{s.status}</span>
                        </div>
                      </button>
                    ))}
                    {chatSessions.length === 0 && <p style={{ fontSize:13,color:'#8E8E93',textAlign:'center',padding:20 }}>No sessions found.</p>}
                  </div>
                </Card>

                <Card style={{ padding:16 }}>
                  {!activeChatSession ? (
                    <div style={{ height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#8E8E93' }}>
                      Select a conversation to start managing support.
                    </div>
                  ) : (
                    <div>
                      <div style={{ display:'flex',justifyContent:'space-between',gap:10,alignItems:'flex-start',marginBottom:12 }}>
                        <div>
                          <h3 style={{ fontSize:16,fontWeight:900 }}>{activeChatSession.customer_name || activeChatSession.customer_id}</h3>
                          <p style={{ color:'#8E8E93',fontSize:12 }}>{activeChatSession.customer_id} · {activeChatSession.status}</p>
                        </div>
                        <div style={{ display:'flex',gap:6,flexWrap:'wrap',justifyContent:'flex-end' }}>
                          <Btn size="sm" variant="primary" onClick={()=>chatAction('takeover')} style={{ opacity: chatBusy ? .6 : 1 }}>Takeover</Btn>
                          <Btn size="sm" variant="ghost" onClick={()=>chatAction('release')} style={{ opacity: chatBusy ? .6 : 1 }}>Release</Btn>
                          <Btn size="sm" variant="success" onClick={()=>chatAction('resolve')} style={{ opacity: chatBusy ? .6 : 1 }}>Resolve</Btn>
                          <Btn size="sm" variant="danger" onClick={()=>chatAction('flag')} style={{ opacity: chatBusy ? .6 : 1 }}>Flag</Btn>
                        </div>
                      </div>

                      <div style={{ border:'1px solid #ECECEC',borderRadius:12,padding:12,height:360,overflowY:'auto',marginBottom:12,background:'#FBFBFD' }}>
                        {chatMessages.map(m => {
                          const mine = m.sender === 'agent';
                          const ai = m.sender === 'ai';
                          return (
                            <div key={m.id} style={{ display:'flex',justifyContent: mine || ai ? 'flex-end' : 'flex-start',marginBottom:8 }}>
                              <div
                                style={{
                                  maxWidth:'80%',
                                  background: mine ? 'rgba(0,122,255,.12)' : ai ? 'rgba(52,199,89,.12)' : '#fff',
                                  border:'1px solid #E5E5EA',
                                  borderRadius:10,
                                  padding:'8px 10px',
                                }}
                              >
                                <p style={{ fontSize:11,color:'#8E8E93',marginBottom:3,textTransform:'capitalize' }}>{m.sender}</p>
                                <p style={{ fontSize:13,lineHeight:1.4,whiteSpace:'pre-wrap' }}>{m.content || m.message || ''}</p>
                                <p style={{ fontSize:10,color:'#8E8E93',marginTop:4,textAlign:'right' }}>{new Date(m.created_at).toLocaleString('en-NG',{ dateStyle:'short', timeStyle:'short' })}</p>
                              </div>
                            </div>
                          );
                        })}
                        {chatMessages.length === 0 && <p style={{ textAlign:'center',fontSize:13,color:'#8E8E93',paddingTop:20 }}>No messages yet.</p>}
                      </div>

                      <Input label="Reply as Agent" value={chatReply} onChange={(value)=>{
                        setChatReply(value);
                        sendAgentTyping(true);
                        if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
                        typingStopTimer.current = setTimeout(() => {
                          sendAgentTyping(false);
                        }, 1800);
                      }} multiline placeholder="Type your response to the customer" />
                      <div style={{ display:'flex',justifyContent:'flex-end',marginBottom:12 }}>
                        <Btn
                          onClick={()=>{
                            if (!chatReply.trim()) return;
                            sendAgentTyping(false);
                            if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
                            chatAction('send_message', { content: chatReply.trim() });
                          }}
                          style={{ opacity: !chatReply.trim() || chatBusy ? .6 : 1, pointerEvents: !chatReply.trim() || chatBusy ? 'none' : 'auto' }}
                        >
                          {chatBusy ? 'Sending...' : 'Send Reply'}
                        </Btn>
                      </div>

                      <Input label="Internal Note" value={chatNote} onChange={setChatNote} multiline placeholder="Add private note for support team" />
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                        <Btn variant="ghost" onClick={()=>chatNote.trim() && chatAction('add_note', { note: chatNote.trim() })} style={{ opacity: !chatNote.trim() || chatBusy ? .6 : 1, pointerEvents: !chatNote.trim() || chatBusy ? 'none' : 'auto' }}>Add Note</Btn>
                        <Btn variant="ghost" onClick={()=>openChatSession(activeChatSession.id)}>Reload Conversation</Btn>
                      </div>

                      {Array.isArray(activeChatSession.internal_notes) && activeChatSession.internal_notes.length > 0 && (
                        <div style={{ marginTop:12,borderTop:'1px solid #F0F0F0',paddingTop:12 }}>
                          <p style={{ fontSize:12,fontWeight:800,color:'#6E6E73',marginBottom:8 }}>Internal Notes</p>
                          <div style={{ display:'flex',flexDirection:'column',gap:6,maxHeight:120,overflowY:'auto' }}>
                            {activeChatSession.internal_notes.map((n, i) => (
                              <div key={`${i}-${n.slice(0,8)}`} style={{ background:'#F7F7FA',border:'1px solid #ECECF1',borderRadius:8,padding:'6px 8px',fontSize:12 }}>{n}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
              <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14,marginBottom:18 }}>
                {[
                  { label:'Total Orders', value: String(orderStats.total || 0), color:'#2359b8' },
                  { label:'Paid', value: String(orderStats.paid_count || 0), color:'#4a80dd' },
                  { label:'Processing', value: String(orderStats.processing_count || 0), color:'#cb9d41' },
                  { label:'Shipped', value: String(orderStats.shipped_count || 0), color:'#248b78' },
                  { label:'Delivered', value: String(orderStats.delivered_count || 0), color:'#1f6d5c' },
                ].map((stat) => (
                  <Card key={stat.label} style={{ padding:'16px 18px' }}>
                    <p style={{ fontSize:12,color:'#667891',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8 }}>{stat.label}</p>
                    <p className="admin-code" style={{ fontSize:28,fontWeight:700,color:stat.color }}>{stat.value}</p>
                  </Card>
                ))}
              </div>

              <div style={{ display:'grid',gridTemplateColumns:'1.15fr .85fr',gap:18 }}>
                <Card>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:16,flexWrap:'wrap' }}>
                    <div>
                      <h2 style={{ fontSize:20,fontWeight:900,color:'#10243f',letterSpacing:'-0.03em' }}>Order Queue</h2>
                      <p style={{ color:'#667891',fontSize:13,marginTop:4 }}>Product purchases with delivery details and fulfilment workflow.</p>
                    </div>
                    <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                      {['all','paid','processing','shipped','delivered','cancelled'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setOrderFilter(filter)}
                          style={{ padding:'8px 12px',borderRadius:12,border:`1px solid ${orderFilter===filter ? 'rgba(35,89,184,.26)' : 'rgba(196,208,230,.9)'}`,background:orderFilter===filter?'rgba(58,108,197,.08)':'rgba(255,255,255,.7)',color:orderFilter===filter?'#204e9d':'#5f7189',fontSize:12,fontWeight:800,textTransform:'capitalize' }}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display:'grid',gridTemplateColumns:'1fr auto',gap:10,marginBottom:16 }}>
                    <input
                      value={orderSearch}
                      onChange={(e)=>setOrderSearch(e.target.value)}
                      placeholder="Search customer, phone, product, reference or address"
                      style={{ padding:'13px 14px',borderRadius:14,border:'1px solid rgba(196,208,230,.9)',fontSize:14,background:'rgba(248,251,255,.9)',color:'#18304d' }}
                    />
                    <Btn variant="ghost" onClick={()=>loadOrders(orderFilter, orderSearch)}>Refresh</Btn>
                  </div>

                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginBottom:14,flexWrap:'wrap' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                      <button onClick={()=>setSelectedOrderIds(orders.map((order)=>order.id))} style={{ padding:'8px 11px',borderRadius:10,border:'1px solid rgba(196,208,230,.9)',background:'#fff',fontSize:12,fontWeight:700,color:'#38587f' }}>Select all</button>
                      <button onClick={()=>setSelectedOrderIds([])} style={{ padding:'8px 11px',borderRadius:10,border:'1px solid rgba(196,208,230,.9)',background:'#fff',fontSize:12,fontWeight:700,color:'#38587f' }}>Clear</button>
                      <span style={{ fontSize:12,fontWeight:800,color:'#5f738f' }}>{selectedOrderIds.length} selected</span>
                    </div>
                    <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
                      <select value={batchOrderStatus} onChange={(e)=>setBatchOrderStatus(e.target.value)} style={{ padding:'8px 10px',borderRadius:10,border:'1px solid rgba(196,208,230,.9)',fontSize:12,color:'#204066' }}>
                        {['paid','processing','packed','shipped','delivered','cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <Btn size="sm" variant="ghost" onClick={runOrderBatchStatus} style={{ opacity: selectedOrderIds.length === 0 || batchBusy ? .6 : 1, pointerEvents: selectedOrderIds.length === 0 || batchBusy ? 'none' : 'auto' }}>{batchBusy ? 'Working…' : 'Batch Update'}</Btn>
                      <Btn size="sm" variant="danger" onClick={runOrderBatchDelete} style={{ opacity: selectedOrderIds.length === 0 || batchBusy ? .6 : 1, pointerEvents: selectedOrderIds.length === 0 || batchBusy ? 'none' : 'auto' }}>Batch Delete</Btn>
                    </div>
                  </div>

                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%',borderCollapse:'collapse' }}>
                      <thead><tr style={{ background:'rgba(239,244,252,.9)' }}>
                        {['','Customer','Product','Amount','Fulfilment','Payment','Ordered'].map(h=><th key={h} style={{ padding:'11px 12px',fontSize:11,fontWeight:800,color:'#647793',textAlign:'left',borderBottom:'1px solid rgba(210,221,240,.9)',textTransform:'uppercase',letterSpacing:'0.07em' }}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} onClick={()=>setSelectedOrder(order)} style={{ borderBottom:'1px solid rgba(224,231,244,.8)',cursor:'pointer',background:selectedOrder?.id===order.id?'rgba(53,105,194,.08)':'transparent' }}>
                            <td style={{ padding:'13px 8px' }} onClick={(e)=>e.stopPropagation()}>
                              <input type="checkbox" checked={selectedOrderIds.includes(order.id)} onChange={(e)=>setSelectedOrderIds((prev)=>e.target.checked ? [...prev, order.id] : prev.filter((id)=>id!==order.id))} />
                            </td>
                            <td style={{ padding:'13px 12px' }}>
                              <p style={{ fontSize:13,fontWeight:800,color:'#132843' }}>{order.first_name} {order.last_name}</p>
                              <p style={{ fontSize:12,color:'#6d809a',marginTop:3 }}>{order.phone}</p>
                            </td>
                            <td style={{ padding:'13px 12px' }}>
                              <p style={{ fontSize:13,fontWeight:700,color:'#193352' }}>{order.product_name}</p>
                              <p className="admin-code" style={{ fontSize:11,color:'#7990ac',marginTop:3 }}>{order.receipt_ref}</p>
                            </td>
                            <td style={{ padding:'13px 12px',fontSize:13,fontWeight:900,color:'#1f6d5c' }}>{formatMoney(order.amount)}</td>
                            <td style={{ padding:'13px 12px' }}>
                              <span style={{ display:'inline-block',padding:'5px 10px',borderRadius:999,border:'1px solid rgba(53,105,194,.16)',background:'rgba(58,108,197,.08)',fontSize:11,fontWeight:800,color:'#295fb3',textTransform:'capitalize' }}>{order.fulfillment_status.replace(/_/g, ' ')}</span>
                            </td>
                            <td style={{ padding:'13px 12px' }}>
                              <span style={{ display:'inline-block',padding:'5px 10px',borderRadius:999,border:'1px solid rgba(34,121,89,.16)',background:order.payment_status==='success'?'rgba(41,132,96,.1)':'rgba(204,146,52,.12)',fontSize:11,fontWeight:800,color:order.payment_status==='success'?'#1f6d5c':'#a17018',textTransform:'capitalize' }}>{order.payment_status}</span>
                            </td>
                            <td style={{ padding:'13px 12px',fontSize:12,color:'#6d809a' }}>{formatDateTime(order.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {orders.length === 0 && <div style={{ padding:'40px 20px',textAlign:'center',color:'#6d809a' }}>No orders match the current filter.</div>}
                  </div>
                </Card>

                <Card>
                  {!selectedOrder ? (
                    <div style={{ minHeight:420,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',color:'#6d809a' }}>
                      Select an order to review delivery details, tracking, and fulfilment status.
                    </div>
                  ) : (
                    <div>
                      <div style={{ display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',marginBottom:18 }}>
                        <div>
                          <p style={{ fontSize:11,fontWeight:800,color:'#7086a0',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:6 }}>Selected order</p>
                          <h2 style={{ fontSize:22,fontWeight:900,color:'#10243f',letterSpacing:'-0.04em' }}>{selectedOrder.product_name}</h2>
                          <p style={{ color:'#647793',fontSize:13,marginTop:6 }}>{selectedOrder.first_name} {selectedOrder.last_name} · {selectedOrder.phone}</p>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <p style={{ color:'#6d809a',fontSize:11,textTransform:'uppercase',letterSpacing:'0.08em' }}>Order Value</p>
                          <p style={{ color:'#1f6d5c',fontSize:22,fontWeight:900,marginTop:6 }}>{formatMoney(selectedOrder.amount)}</p>
                        </div>
                      </div>

                      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:18 }}>
                        {[
                          ['Reference', selectedOrder.receipt_ref],
                          ['Ordered', formatDateTime(selectedOrder.created_at)],
                          ['Payment', selectedOrder.payment_status],
                          ['Last Workflow Update', formatDateTime(selectedOrder.fulfillment_updated_at)],
                        ].map(([label, value]) => (
                          <div key={label} style={{ padding:'12px 14px',borderRadius:16,background:'rgba(244,248,254,.9)',border:'1px solid rgba(215,226,243,.9)' }}>
                            <p style={{ fontSize:11,color:'#7086a0',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:6 }}>{label}</p>
                            <p className={label==='Reference' ? 'admin-code' : undefined} style={{ fontSize:13,fontWeight:800,color:'#163150' }}>{value}</p>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginBottom:18,padding:'14px 16px',borderRadius:18,background:'rgba(244,248,254,.9)',border:'1px solid rgba(215,226,243,.9)' }}>
                        <p style={{ fontSize:11,color:'#7086a0',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8 }}>Delivery address</p>
                        <p style={{ fontSize:14,lineHeight:1.7,color:'#163150' }}>{selectedOrder.delivery_address || 'Not provided'}</p>
                      </div>

                      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                        <div>
                          <label style={{ display:'block',fontSize:12,fontWeight:800,color:'#7086a0',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8 }}>Fulfilment status</label>
                          <select value={orderForm.fulfillmentStatus} onChange={(e)=>setOrderForm((prev)=>({ ...prev, fulfillmentStatus: e.target.value }))} style={{ width:'100%',padding:'13px 14px',borderRadius:14,border:'1px solid rgba(196,208,230,.9)',fontSize:14,background:'rgba(248,251,255,.9)',color:'#18304d' }}>
                            {['paid','processing','packed','shipped','delivered','cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ display:'block',fontSize:12,fontWeight:800,color:'#7086a0',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8 }}>Tracking number</label>
                          <input value={orderForm.trackingNumber} onChange={(e)=>setOrderForm((prev)=>({ ...prev, trackingNumber: e.target.value }))} placeholder="Courier / tracking reference" style={{ width:'100%',padding:'13px 14px',borderRadius:14,border:'1px solid rgba(196,208,230,.9)',fontSize:14,background:'rgba(248,251,255,.9)',color:'#18304d' }} />
                        </div>
                      </div>

                      <div style={{ marginTop:14,marginBottom:18 }}>
                        <label style={{ display:'block',fontSize:12,fontWeight:800,color:'#7086a0',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8 }}>Admin note</label>
                        <textarea value={orderForm.adminNote} onChange={(e)=>setOrderForm((prev)=>({ ...prev, adminNote: e.target.value }))} placeholder="Internal fulfilment note, courier context, call outcome, delivery instruction..." style={{ width:'100%',minHeight:130,padding:'13px 14px',borderRadius:14,border:'1px solid rgba(196,208,230,.9)',fontSize:14,background:'rgba(248,251,255,.9)',color:'#18304d',resize:'vertical',fontFamily:'inherit',lineHeight:1.6 }} />
                      </div>

                      <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
                        <Btn onClick={saveOrderUpdate} style={{ minWidth:180 }}>{orderSaving ? 'Saving...' : 'Save Workflow Update'}</Btn>
                        <Btn variant="ghost" onClick={()=>setOrderForm({ fulfillmentStatus:'processing', trackingNumber:selectedOrder.tracking_number || '', adminNote:selectedOrder.admin_note || '' })}>Set Processing</Btn>
                        <Btn variant="ghost" onClick={()=>setOrderForm({ fulfillmentStatus:'shipped', trackingNumber:selectedOrder.tracking_number || '', adminNote:selectedOrder.admin_note || '' })}>Prepare Shipment</Btn>
                        <Btn variant="ghost" onClick={()=>downloadReceipt(selectedOrder.receipt_data)}>View Receipt Payload</Btn>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
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
