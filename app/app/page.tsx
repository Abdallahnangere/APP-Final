'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

/* ─────────────── TYPES ─────────────── */
type User = {
  id: string; firstName: string; lastName: string; phone: string;
  walletBalance: number; cashbackBalance: number; referralBonus: number;
  accountNumber: string; bankName: string; theme: string;
  notificationsEnabled: boolean; hapticsEnabled: boolean; createdAt: string;
};
type Transaction = {
  id: string; type: string; description: string; amount: number;
  status: string; network?: string; phoneNumber?: string;
  productName?: string; createdAt: string; receiptData?: Record<string,unknown>;
};
type Deposit = { id: string; amount: number; senderName: string; createdAt: string; narration: string; };
type Plan = { id: string; network: string; networkId: number; planId: number; dataSize: string; validity: string; price: number; };
type Product = { id: string; name: string; description: string; price: number; imageUrl: string; inStock: boolean; shippingTerms: string; pickupTerms: string; category: string; };
type ChatMsg = { id: string; sender: string; message: string; createdAt: string; };
type SimActivation = { id: string; status: string; createdAt: string; serialNumber?: string; };

/* ─────────────── CONSTANTS ─────────────── */
const BLUE = '#007AFF';
const GREEN = '#34C759';
const RED = '#FF3B30';
const GOLD = '#FF9500';

const NETWORKS = [
  { name: 'MTN', id: 1, color: '#FFCC00', bg: '#FFF8DC', emoji: '🟡' },
  { name: 'GLO', id: 2, color: '#00892C', bg: '#E8FAE8', emoji: '🟢' },
  { name: 'AIRTEL', id: 4, color: '#E40000', bg: '#FFEBEB', emoji: '🔴' },
  { name: '9MOBILE', id: 9, color: '#006E52', bg: '#E0F5EE', emoji: '🟤' },
];

/* ─────────────── GLOBAL STYLES ─────────────── */
const GlobalStyle = ({ dark }: { dark: boolean }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    :root{
      --bg:${dark?'#000000':'#F2F2F7'};
      --card:${dark?'#1C1C1E':'#FFFFFF'};
      --card2:${dark?'#2C2C2E':'#F9F9F9'};
      --text:${dark?'#FFFFFF':'#1C1C1E'};
      --sub:${dark?'#8E8E93':'#6C6C70'};
      --border:${dark?'rgba(255,255,255,.08)':'rgba(0,0,0,.07)'};
      --blue:${BLUE};--green:${GREEN};--red:${RED};
    }
    html,body{height:100%;overflow:hidden;touch-action:pan-y}
    body{font-family:'DM Sans',system-ui,sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
    input,button{font-family:inherit;outline:none}
    button{border:none;cursor:pointer;background:none}
    ::-webkit-scrollbar{display:none}
    @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    .slide-up{animation:slideUp .32s cubic-bezier(.32,.72,0,1) both}
    .fade-in{animation:fadeIn .2s ease both}
    .shimmer{background:linear-gradient(90deg,rgba(0,0,0,.04) 25%,rgba(0,0,0,.08) 50%,rgba(0,0,0,.04) 75%);background-size:200% 100%;animation:shimmer 1.2s infinite}
  `}</style>
);

/* ─────────────── PIN KEYBOARD ─────────────── */
function PinKeyboard({ onComplete, onClose, title = 'Enter your 6-digit PIN', subtitle = '' }: {
  onComplete: (pin: string) => void; onClose: () => void; title?: string; subtitle?: string;
}) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  const press = (d: string) => {
    if (pin.length >= 6) return;
    const np = pin + d;
    setPin(np);
    if (np.length === 6) setTimeout(() => onComplete(np), 120);
  };
  const del = () => setPin(p => p.slice(0, -1));

  // Style constants
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 200,
    background: 'rgba(0,0,0,.5)',
    display: 'flex',
    alignItems: 'flex-end'
  };

  const modalStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--card)',
    borderRadius: '24px 24px 0 0',
    padding: '28px 24px 40px'
  };

  const barStyle: React.CSSProperties = {
    width: 40,
    height: 4,
    background: 'var(--border)',
    borderRadius: 2,
    margin: '0 auto 24px'
  };

  const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    fontWeight: 700,
    fontSize: 17,
    color: 'var(--text)',
    marginBottom: 6
  };

  const subtitleStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: 14,
    color: 'var(--sub)',
    marginBottom: 20
  };

  const dotsContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    margin: '24px 0'
  };

  const keysGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: 12,
    maxWidth: 300,
    margin: '0 auto'
  };

  const cancelStyle: React.CSSProperties = {
    width: '100%',
    marginTop: 16,
    padding: '16px',
    borderRadius: 16,
    background: 'transparent',
    color: 'var(--sub)',
    fontSize: 15,
    fontWeight: 600
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="slide-up" style={modalStyle}>
        <div style={barStyle} />
        <p style={titleStyle}>{title}</p>
        {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        {/* Dots */}
        <div style={dotsContainerStyle}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{ width:14,height:14,borderRadius:7,background: i<pin.length ? BLUE : 'var(--border)',transition:'all .15s',transform: i<pin.length ? 'scale(1.15)' : 'scale(1)' }} />
          ))}
        </div>
        {/* Keys */}
        <div style={keysGridStyle}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k,i) => (
            <button key={i} onClick={()=>k==='⌫'?del():k?press(k):null}
              style={{ height:64,borderRadius:16,background: k===''?'transparent':'var(--card2)',fontSize: k==='⌫'?22:24,fontWeight:600,color:'var(--text)',border:'1.5px solid var(--border)',transition:'all .1s',opacity:k===''?0:1,WebkitTapHighlightColor:'rgba(0,122,255,.1)' }}
              onTouchStart={e=>{if(k){e.currentTarget.style.background='rgba(0,122,255,.12)';e.currentTarget.style.transform='scale(.95)'}}}
              onTouchEnd={e=>{e.currentTarget.style.background='var(--card2)';e.currentTarget.style.transform='scale(1)'}}>
              {k}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={cancelStyle}>Cancel</button>
      </div>
    </div>
  );
}

/* ─────────────── RECEIPT CANVAS ─────────────── */
function Receipt({ data, onDownload, onClose, dark }: { data: Record<string,unknown>; onDownload: ()=>void; onClose: ()=>void; dark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  const downloadPng = async () => {
    if (typeof window === 'undefined') return;
    const { toPng } = await import('html-to-image');
    if (!ref.current) return;
    const url = await toPng(ref.current, { quality:1, pixelRatio:2 });
    const a = document.createElement('a');
    a.href = url; a.download = `receipt-${data.ref || Date.now()}.png`; a.click();
    if (onDownload) onDownload();
  };

  const date = new Date(data.date as string).toLocaleString('en-NG', { dateStyle:'long', timeStyle:'short' });

  return (
    <div style={{ position:'fixed',top:0,right:0,bottom:0,left:0,zIndex:300,background:'rgba(0,0,0,.6)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div className="slide-up" style={{ width:'100%',maxWidth:400,background:'var(--card)',borderRadius:24,overflow:'hidden' }}>
        {/* Downloadable receipt */}
        <div ref={ref} style={{ background:'#fff',width:'100%' }}>
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,#007AFF,#0040FF)',padding:'32px 28px 28px',textAlign:'center' }}>
            <div style={{ width:52,height:52,borderRadius:14,background:'rgba(255,255,255,.2)',margin:'0 auto 12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26 }}>⚡</div>
            <p style={{ color:'#fff',fontWeight:900,fontSize:22,letterSpacing:-0.5 }}>SaukiMart</p>
            <p style={{ color:'rgba(255,255,255,.7)',fontSize:12,marginTop:2 }}>Data & Devices</p>
            <div style={{ marginTop:16,background:'rgba(255,255,255,.15)',borderRadius:10,padding:'8px 16px',display:'inline-block' }}>
              <p style={{ color:'#fff',fontWeight:700,fontSize:13 }}>✓ Transaction Successful</p>
            </div>
          </div>
          {/* Body */}
          <div style={{ padding:'24px 28px' }}>
            <div style={{ textAlign:'center',marginBottom:24 }}>
              <p style={{ fontSize:34,fontWeight:900,color:'#1C1C1E',letterSpacing:-1 }}>₦{Number(data.price||data.amount||0).toLocaleString()}</p>
              <p style={{ color:'#8E8E93',fontSize:13,marginTop:4 }}>{date}</p>
            </div>
            {/* Fields */}
            {data.type === 'data' || data.network ? [
              ['Network', data.network],
              ['Data', data.dataSize],
              ['Validity', data.validity],
              ['Phone', data.phoneNumber],
              ['Reference', data.ref || data.amigoRef],
              ['Status', '✓ Delivered'],
            ].filter(([,v])=>v).map(([k,v])=>(
              <div key={k as string} style={{ display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #F2F2F7' }}>
                <span style={{ color:'#8E8E93',fontSize:14 }}>{k as string}</span>
                <span style={{ fontWeight:600,fontSize:14,color:'#1C1C1E',textAlign:'right',maxWidth:'60%' }}>{v as string}</span>
              </div>
            )) : [
              ['Customer', `${data.userName}`],
              ['Phone', data.userPhone],
              ['Item', data.productName || data.itemName],
              ['Reference', data.ref],
              ['Description', data.description ? String(data.description).slice(0,60) : '-'],
              ['Status', '✓ Purchased'],
            ].filter(([,v])=>v).map(([k,v])=>(
              <div key={k as string} style={{ display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #F2F2F7' }}>
                <span style={{ color:'#8E8E93',fontSize:14 }}>{k as string}</span>
                <span style={{ fontWeight:600,fontSize:14,color:'#1C1C1E',textAlign:'right',maxWidth:'60%' }}>{v as string}</span>
              </div>
            ))}
          </div>
          {/* Footer */}
          <div style={{ background:'#F2F2F7',padding:'20px 28px',textAlign:'center' }}>
            <p style={{ fontSize:13,fontWeight:700,color:'#1C1C1E',marginBottom:6 }}>SaukiMart: Data & Devices</p>
            <p style={{ fontSize:12,color:'#8E8E93' }}>support@saukimart.online</p>
            <p style={{ fontSize:12,color:'#8E8E93',marginTop:2 }}>+234 704 464 7081 · +234 806 193 4056</p>
          </div>
        </div>
        {/* Actions */}
        <div style={{ padding:'16px 20px 28px',display:'flex',gap:10 }}>
          <button onClick={downloadPng} style={{ flex:1,padding:'14px',borderRadius:14,background:BLUE,color:'#fff',fontWeight:700,fontSize:15 }}>⬇ Download Receipt</button>
          <button onClick={onClose} style={{ padding:'14px 20px',borderRadius:14,background:'var(--card2)',color:'var(--text)',fontWeight:600,fontSize:15,border:'1.5px solid var(--border)' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── MAIN APP ─────────────── */
export default function AppPage() {
  const [screen, setScreen] = useState<'splash'|'login'|'register'|'registered'|'home'|'data-networks'|'data-plans'|'buy-confirm'|'store'|'product'|'transactions'|'deposits'|'profile'|'change-pin'|'chat'|'sim-activation'|'notifications'|'about'>('splash');
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState<User|null>(null);
  const [token, setToken] = useState('');

  // Form states
  const [loginPhone, setLoginPhone] = useState('');
  const [regForm, setRegForm] = useState({ firstName:'',lastName:'',phone:'',pin:'',confirmPin:'' });
  const [agreed, setAgreed] = useState(false);

  // App data
  const [broadcasts, setBroadcasts] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [chats, setChats] = useState<ChatMsg[]>([]);
  const [simActivations, setSimActivations] = useState<SimActivation[]>([]);

  // Selection
  const [selectedNetwork, setSelectedNetwork] = useState<typeof NETWORKS[0]|null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan|null>(null);
  const [buyPhone, setBuyPhone] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product|null>(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinAction, setPinAction] = useState<'buy-data'|'buy-product'|'sim-pay'|null>(null);
  const [receipt, setReceipt] = useState<Record<string,unknown>|null>(null);
  const [chatInput, setChatInput] = useState('');
  const [simSerial, setSimSerial] = useState('');
  const [simFront, setSimFront] = useState<string|null>(null);
  const [simBack, setSimBack] = useState<string|null>(null);
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  const authHeader = useCallback(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const showError = (msg: string) => { setError(msg); setTimeout(() => setError(''), 4000); };

  // Splash
  useEffect(() => {
    setTimeout(() => {
      const saved = localStorage.getItem('sm_token');
      const savedUser = localStorage.getItem('sm_user');
      if (saved && savedUser) {
        setToken(saved);
        setUser(JSON.parse(savedUser));
        setDark(JSON.parse(savedUser).theme === 'dark');
        setScreen('home');
      } else {
        setScreen('login');
      }
    }, 1800);
  }, []);

  // Load home data
  const loadHomeData = useCallback(async () => {
    if (!token) return;
    try {
      const [bc, tx, dep] = await Promise.all([
        fetch('/api/broadcasts').then(r=>r.json()),
        fetch('/api/transactions', { headers: authHeader() }).then(r=>r.json()),
        fetch('/api/deposits', { headers: authHeader() }).then(r=>r.json()),
      ]);
      setBroadcasts(Array.isArray(bc) ? bc.map((b:Record<string,unknown>)=>b.message as string) : []);
      setTransactions(Array.isArray(tx) ? tx : []);
      setDeposits(Array.isArray(dep) ? dep : []);
    } catch { /* silent */ }
  }, [token, authHeader]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const res = await fetch('/api/user', { headers: authHeader() });
    if (res.ok) {
      const u = await res.json();
      setUser(u);
      localStorage.setItem('sm_user', JSON.stringify(u));
    }
  }, [token, authHeader]);

  useEffect(() => {
    if (screen === 'home') { loadHomeData(); refreshUser(); }
  }, [screen, loadHomeData, refreshUser]);

  /* ── REGISTER ── */
  const handleRegister = async () => {
    if (!agreed) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(regForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('sm_token', data.token);
      localStorage.setItem('sm_user', JSON.stringify(data.user));
      setScreen('registered');
    } catch(e:unknown) { showError(e instanceof Error ? e.message : 'Registration failed'); }
    finally { setLoading(false); }
  };

  /* ── LOGIN ── */
  const handleLogin = async (pin: string) => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ phone: loginPhone, pin }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setToken(data.token);
      setUser(data.user);
      setDark(data.user.theme === 'dark');
      localStorage.setItem('sm_token', data.token);
      localStorage.setItem('sm_user', JSON.stringify(data.user));
      setScreen('home');
    } catch(e:unknown) { showError(e instanceof Error ? e.message : 'Login failed'); }
    finally { setLoading(false); }
  };

  /* ── BUY DATA ── */
  const handleBuyData = async (pin: string) => {
    if (!selectedPlan || !buyPhone) return;
    setLoading(true);
    try {
      const res = await fetch('/api/buy-data', {
        method:'POST', headers: authHeader(),
        body: JSON.stringify({ pin, planId: selectedPlan.planId, phoneNumber: buyPhone, network: selectedPlan.network, networkId: selectedPlan.networkId, dataSize: selectedPlan.dataSize, validity: selectedPlan.validity, price: selectedPlan.price }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReceipt({ ...data.receipt, type:'data' });
      await refreshUser();
      await loadHomeData();
    } catch(e:unknown) { showError(e instanceof Error ? e.message : 'Purchase failed'); }
    finally { setLoading(false); }
  };

  /* ── BUY PRODUCT ── */
  const handleBuyProduct = async (pin: string) => {
    if (!selectedProduct) return;
    setLoading(true);
    try {
      const res = await fetch('/api/purchase-product', {
        method:'POST', headers: authHeader(),
        body: JSON.stringify({ pin, productId: selectedProduct.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReceipt({ ...data.receipt, type:'product' });
      await refreshUser();
      showToast('🎉 Purchase successful!');
    } catch(e:unknown) { showError(e instanceof Error ? e.message : 'Purchase failed'); }
    finally { setLoading(false); }
  };

  /* ── SIM ACTIVATION ── */
  const handleSimPay = async (pin: string) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('pin', pin);
      fd.append('serialNumber', simSerial);
      if (simFront) fd.append('frontImage', simFront);
      if (simBack) fd.append('backImage', simBack);
      const res = await fetch('/api/sim-activation', { method:'POST', headers:{ Authorization:`Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('✅ SIM activation request submitted!');
      setSimActivations(prev => [data.activation, ...prev]);
      setSimSerial(''); setSimFront(null); setSimBack(null);
      await refreshUser();
    } catch(e:unknown) { showError(e instanceof Error ? e.message : 'Failed to submit'); }
    finally { setLoading(false); }
  };

  const handlePinComplete = (pin: string) => {
    setShowPin(false);
    if (pinAction === 'buy-data') handleBuyData(pin);
    else if (pinAction === 'buy-product') handleBuyProduct(pin);
    else if (pinAction === 'sim-pay') handleSimPay(pin);
  };

  /* ── LOAD PLANS ── */
  const loadPlans = async (network: string) => {
    const res = await fetch(`/api/data-plans?network=${network}`);
    const data = await res.json();
    setPlans(Array.isArray(data) ? data : []);
  };

  /* ── LOAD PRODUCTS ── */
  const loadProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  };

  /* ── LOAD CHATS ── */
  const loadChats = async () => {
    if (!token) return;
    const res = await fetch('/api/chat', { headers: authHeader() });
    const data = await res.json();
    setChats(Array.isArray(data) ? data : []);
  };

  /* ── SEND CHAT ── */
  const sendChat = async () => {
    if (!chatInput.trim()) return;
    try {
      await fetch('/api/chat', { method:'POST', headers: authHeader(), body: JSON.stringify({ message: chatInput.trim() }) });
      setChatInput('');
      loadChats();
    } catch { /* silent */ }
  };

  /* ── CHANGE PIN ── */
  const handleChangePin = async (currentPin: string) => {
    if (!newPin || newPin !== confirmNewPin) { showError('New PINs do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/user', { method:'PATCH', headers: authHeader(), body: JSON.stringify({ action:'change-pin', currentPin, newPin }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast('✅ PIN updated successfully!');
      setNewPin(''); setConfirmNewPin(''); setScreen('profile');
    } catch(e:unknown) { showError(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  };

  const signOut = () => {
    localStorage.removeItem('sm_token');
    localStorage.removeItem('sm_user');
    setToken(''); setUser(null);
    setScreen('login');
  };

  const updatePref = async (key: string, value: unknown) => {
    await fetch('/api/user', { method:'PATCH', headers: authHeader(), body: JSON.stringify({ [key]: value }) });
    setUser(prev => prev ? { ...prev, [key]: value } : prev);
    if (key === 'theme') setDark(value === 'dark');
  };

  /* ═══════════════════ SCREENS ═══════════════════ */

  /* SPLASH */
  if (screen === 'splash') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'linear-gradient(160deg,#007AFF,#0040FF)' }}>
        <div style={{ width:80,height:80,borderRadius:22,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,marginBottom:20,animation:'pulse 1.5s infinite' }}>⚡</div>
        <p style={{ color:'#fff',fontWeight:900,fontSize:28,letterSpacing:-0.8 }}>SaukiMart</p>
        <p style={{ color:'rgba(255,255,255,.7)',fontSize:14,marginTop:6 }}>Data & Devices</p>
        <div style={{ position:'absolute',bottom:60,display:'flex',gap:6 }}>
          {[0,1,2].map(i=><div key={i} style={{ width:6,height:6,borderRadius:3,background:'rgba(255,255,255,.4)',animation:`pulse 1.2s ${i*0.2}s infinite` }} />)}
        </div>
      </div>
    </>
  );

  /* LOGIN */
  if (screen === 'login') return (
    <>
      <GlobalStyle dark={dark} />
      {showPin && <PinKeyboard title="Enter your PIN" onComplete={handleLogin} onClose={()=>setShowPin(false)} />}
      <div style={{ height:'100dvh',display:'flex',flexDirection:'column',background:'var(--bg)' }}>
        <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 28px' }}>
          <div style={{ width:72,height:72,borderRadius:20,background:'linear-gradient(135deg,#007AFF,#0040FF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:34,marginBottom:20,boxShadow:'0 8px 32px rgba(0,122,255,.4)' }}>⚡</div>
          <h1 style={{ fontSize:28,fontWeight:900,color:'var(--text)',letterSpacing:-0.8,marginBottom:6 }}>Welcome back</h1>
          <p style={{ color:'var(--sub)',fontSize:15,marginBottom:36,textAlign:'center' }}>Sign in to your SaukiMart account</p>
          {error && <div style={{ width:'100%',padding:'12px 16px',borderRadius:12,background:'rgba(255,59,48,.1)',border:'1px solid rgba(255,59,48,.2)',color:RED,fontSize:14,marginBottom:16 }}>{error}</div>}
          <div style={{ width:'100%',marginBottom:16 }}>
            <label style={{ fontSize:13,fontWeight:600,color:'var(--sub)',marginBottom:6,display:'block' }}>Phone Number</label>
            <input value={loginPhone} onChange={e=>setLoginPhone(e.target.value.replace(/\D/g,'').slice(0,11))}
              placeholder="08012345678" inputMode="numeric"
              style={{ width:'100%',padding:'16px',borderRadius:14,background:'var(--card)',border:'1.5px solid var(--border)',color:'var(--text)',fontSize:17,fontWeight:600,letterSpacing:1 }} />
          </div>
          <button onClick={()=>{ if(loginPhone.length===11){ setShowPin(true); } else showError('Enter 11-digit phone number'); }}
            disabled={loginPhone.length !== 11}
            style={{ width:'100%',padding:'17px',borderRadius:16,background: loginPhone.length===11 ? BLUE : 'var(--card2)',color: loginPhone.length===11 ? '#fff' : 'var(--sub)',fontSize:17,fontWeight:700,transition:'all .2s' }}>
            Continue with PIN →
          </button>
          <button onClick={()=>setScreen('register')} style={{ marginTop:20,color:BLUE,fontSize:15,fontWeight:600 }}>Don't have an account? Register</button>
        </div>
        <p style={{ textAlign:'center',fontSize:12,color:'var(--sub)',padding:'0 0 32px' }}>
          <a href="/privacy" style={{ color:BLUE }}>Privacy Policy</a> · <a href="/privacy" style={{ color:BLUE }}>Terms of Service</a>
        </p>
      </div>
    </>
  );

  /* REGISTER */
  if (screen === 'register') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',overflowY:'auto',background:'var(--bg)' }}>
        <div style={{ padding:'60px 28px 40px' }}>
          <button onClick={()=>setScreen('login')} style={{ color:BLUE,fontSize:16,fontWeight:600,marginBottom:28,display:'flex',alignItems:'center',gap:6 }}>← Back</button>
          <div style={{ width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#007AFF,#0040FF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,marginBottom:16 }}>⚡</div>
          <h1 style={{ fontSize:26,fontWeight:900,color:'var(--text)',letterSpacing:-0.6,marginBottom:6 }}>Create Account</h1>
          <p style={{ color:'var(--sub)',fontSize:15,marginBottom:28 }}>Join SaukiMart — Fast Data, Better Prices</p>
          {error && <div style={{ padding:'12px 16px',borderRadius:12,background:'rgba(255,59,48,.1)',border:'1px solid rgba(255,59,48,.2)',color:RED,fontSize:14,marginBottom:16 }}>{error}</div>}
          {[
            { key:'firstName', label:'First Name', placeholder:'Abubakar', type:'text' },
            { key:'lastName', label:'Last Name', placeholder:'Musa', type:'text' },
            { key:'phone', label:'Phone Number (11 digits)', placeholder:'08012345678', type:'tel' },
            { key:'pin', label:'6-Digit PIN', placeholder:'••••••', type:'password' },
            { key:'confirmPin', label:'Confirm PIN', placeholder:'••••••', type:'password' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom:14 }}>
              <label style={{ fontSize:13,fontWeight:600,color:'var(--sub)',marginBottom:6,display:'block' }}>{f.label}</label>
              <input
                type={f.type} value={regForm[f.key as keyof typeof regForm]} placeholder={f.placeholder}
                inputMode={f.key==='phone'||f.key==='pin'||f.key==='confirmPin'?'numeric':undefined}
                maxLength={f.key==='phone'?11:f.key==='pin'||f.key==='confirmPin'?6:undefined}
                onChange={e => {
                  const v = (f.key==='phone'||f.key==='pin'||f.key==='confirmPin') ? e.target.value.replace(/\D/g,'') : e.target.value;
                  setRegForm(prev => ({ ...prev, [f.key]: v }));
                }}
                style={{ width:'100%',padding:'15px',borderRadius:14,background:'var(--card)',border:'1.5px solid var(--border)',color:'var(--text)',fontSize:16,fontWeight:600 }} />
            </div>
          ))}
          {/* Terms */}
          <div style={{ display:'flex',alignItems:'flex-start',gap:12,margin:'20px 0' }}>
            <button onClick={()=>setAgreed(!agreed)} style={{ width:24,height:24,borderRadius:6,border:`2px solid ${agreed?BLUE:'var(--sub)'}`,background:agreed?BLUE:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2 }}>
              {agreed && <span style={{ color:'#fff',fontSize:14 }}>✓</span>}
            </button>
            <p style={{ fontSize:14,color:'var(--sub)',lineHeight:1.6 }}>
              By registering with SaukiMart, I have read and accepted the{' '}
              <a href="/privacy" style={{ color:BLUE }}>Privacy Policy</a> and{' '}
              <a href="/privacy" style={{ color:BLUE }}>Terms of Service</a>.
            </p>
          </div>
          <button onClick={handleRegister} disabled={!agreed||loading}
            style={{ width:'100%',padding:'17px',borderRadius:16,background:agreed&&!loading?BLUE:'var(--card2)',color:agreed&&!loading?'#fff':'var(--sub)',fontSize:17,fontWeight:700,transition:'all .2s',marginBottom:20 }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
          <button onClick={()=>setScreen('login')} style={{ width:'100%',color:BLUE,fontSize:15,fontWeight:600 }}>Already have an account? Login</button>
        </div>
      </div>
    </>
  );

  /* REGISTERED SUCCESS */
  if (screen === 'registered') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:28 }}>
        <div style={{ width:80,height:80,borderRadius:40,background:'rgba(52,199,89,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,marginBottom:24 }}>✅</div>
        <h1 style={{ fontSize:26,fontWeight:900,color:'var(--text)',textAlign:'center',marginBottom:10 }}>Account Created!</h1>
        <p style={{ color:'var(--sub)',fontSize:15,textAlign:'center',marginBottom:8 }}>Welcome to SaukiMart, {user?.firstName}!</p>
        {user?.accountNumber && (
          <div style={{ width:'100%',background:'var(--card)',borderRadius:16,padding:'16px 20px',marginBottom:24,border:'1.5px solid var(--border)' }}>
            <p style={{ color:'var(--sub)',fontSize:13,marginBottom:4 }}>Your Virtual Account</p>
            <p style={{ fontSize:20,fontWeight:800,color:BLUE,letterSpacing:1 }}>{user.accountNumber}</p>
            <p style={{ color:'var(--sub)',fontSize:13,marginTop:2 }}>{user.bankName}</p>
            <p style={{ color:'var(--sub)',fontSize:12,marginTop:8 }}>Fund your wallet by transferring to this account</p>
          </div>
        )}
        <button onClick={()=>setScreen('home')} style={{ width:'100%',padding:'17px',borderRadius:16,background:BLUE,color:'#fff',fontSize:17,fontWeight:700 }}>
          Proceed to App →
        </button>
      </div>
    </>
  );

  /* ─── MAIN HOME ─── */
  if (!user) return null;
  const getInitials = (u: User) => `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();

  const Header = () => (
    <div style={{ padding:'16px 20px 0',display:'flex',alignItems:'center',justifyContent:'space-between',background:'var(--bg)' }}>
      <button onClick={()=>updatePref('theme', dark?'light':'dark')} style={{ width:38,height:38,borderRadius:12,background:'var(--card)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,border:'1.5px solid var(--border)' }}>
        {dark ? '☀️' : '🌙'}
      </button>
      <p style={{ fontSize:15,fontWeight:700,color:'var(--text)',letterSpacing:-0.2 }}>SaukiMart</p>
      <button onClick={()=>setScreen('profile')} style={{ display:'flex',alignItems:'center',gap:8 }}>
        <div style={{ width:38,height:38,borderRadius:12,background:'linear-gradient(135deg,#007AFF,#0040FF)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:14 }}>
          {getInitials(user)}
        </div>
      </button>
    </div>
  );

  const BottomNav = ({ active }: { active: string }) => (
    <div style={{ position:'fixed',bottom:0,left:0,right:0,background:'var(--card)',borderTop:'1px solid var(--border)',display:'grid',gridTemplateColumns:'repeat(4,1fr)',paddingBottom:'env(safe-area-inset-bottom)',zIndex:50 }}>
      {[
        { id:'home', icon:'🏠', label:'Home' },
        { id:'transactions', icon:'📋', label:'Transactions' },
        { id:'deposits', icon:'💰', label:'Deposits' },
        { id:'profile', icon:'👤', label:'Profile' },
      ].map(item => (
        <button key={item.id} onClick={()=>setScreen(item.id as typeof screen)}
          style={{ padding:'10px 0 8px',display:'flex',flexDirection:'column',alignItems:'center',gap:3 }}>
          <span style={{ fontSize:20 }}>{item.icon}</span>
          <span style={{ fontSize:11,fontWeight: active===item.id?700:500, color: active===item.id?BLUE:'var(--sub)' }}>{item.label}</span>
          {active===item.id && <div style={{ width:4,height:4,borderRadius:2,background:BLUE }} />}
        </button>
      ))}
    </div>
  );

  /* HOME */
  if (screen === 'home') return (
    <>
      <GlobalStyle dark={dark} />
      {showPin && <PinKeyboard onComplete={handlePinComplete} onClose={()=>setShowPin(false)} pinAction={pinAction} />}
      {receipt && <Receipt data={receipt} onDownload={()=>{}} onClose={()=>setReceipt(null)} dark={dark} />}
      {toast && <div className="fade-in" style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:14,fontWeight:700,zIndex:500,whiteSpace:'nowrap' }}>{toast}</div>}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:14,fontWeight:600,zIndex:500 }}>{error}</div>}
      <div style={{ height:'100dvh',overflowY:'auto',background:'var(--bg)',paddingBottom:80 }}>
        <Header />
        {/* Marquee */}
        {broadcasts.length > 0 && (
          <div style={{ margin:'12px 16px 0',background:'rgba(0,122,255,.08)',borderRadius:12,padding:'9px 14px',overflow:'hidden',border:'1px solid rgba(0,122,255,.12)' }}>
            <div style={{ display:'flex',gap:60,whiteSpace:'nowrap',animation:'tick 30s linear infinite' }}>
              {[...broadcasts,...broadcasts].map((b,i)=>(
                <span key={i} style={{ fontSize:13,color:BLUE,fontWeight:500 }}>📢 {b}</span>
              ))}
            </div>
          </div>
        )}
        {/* Wallet Card */}
        <div style={{ margin:'14px 16px 0' }}>
          <div style={{ background:'linear-gradient(135deg,#0040FF,#007AFF)',borderRadius:20,padding:'22px 20px 20px',boxShadow:'0 8px 32px rgba(0,122,255,.3)' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4 }}>
              <p style={{ color:'rgba(255,255,255,.7)',fontSize:12,fontWeight:600,letterSpacing:.5 }}>WALLET BALANCE</p>
              <div style={{ width:8,height:8,borderRadius:4,background:GREEN,animation:'pulse 2s infinite' }} />
            </div>
            <p style={{ color:'#fff',fontSize:34,fontWeight:900,letterSpacing:-1,marginBottom:4 }}>
              ₦{user.walletBalance.toLocaleString('en-NG',{minimumFractionDigits:2})}
            </p>
            {user.accountNumber && (
              <div style={{ background:'rgba(255,255,255,.12)',borderRadius:12,padding:'10px 14px',marginBottom:14,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <div>
                  <p style={{ color:'rgba(255,255,255,.6)',fontSize:11 }}>{user.bankName}</p>
                  <p style={{ color:'#fff',fontWeight:700,fontSize:15,letterSpacing:.5 }}>{user.accountNumber}</p>
                </div>
                <button onClick={()=>{ navigator.clipboard.writeText(user.accountNumber); showToast('Account number copied!'); }}
                  style={{ background:'rgba(255,255,255,.2)',borderRadius:8,padding:'6px 10px',color:'#fff',fontSize:12,fontWeight:600 }}>Copy</button>
              </div>
            )}
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
              <div style={{ background:'rgba(255,255,255,.1)',borderRadius:12,padding:'10px 12px' }}>
                <p style={{ color:'rgba(255,255,255,.6)',fontSize:11 }}>Cashback</p>
                <p style={{ color:'#fff',fontWeight:800,fontSize:16 }}>₦{user.cashbackBalance.toLocaleString()}</p>
              </div>
              <div style={{ background:'rgba(255,255,255,.1)',borderRadius:12,padding:'10px 12px' }}>
                <p style={{ color:'rgba(255,255,255,.6)',fontSize:11 }}>Referral Bonus</p>
                <p style={{ color:'#fff',fontWeight:800,fontSize:16 }}>₦{user.referralBonus.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SIM Activation Card */}
        <div style={{ margin:'12px 16px 0' }}>
          <button onClick={()=>{ fetch('/api/sim-activation',{headers:authHeader()}).then(r=>r.json()).then(d=>setSimActivations(Array.isArray(d)?d:[])); setScreen('sim-activation'); }}
            style={{ width:'100%',background:'linear-gradient(135deg,#E40000,#FF6B6B)',borderRadius:16,padding:'16px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 4px 16px rgba(228,0,0,.2)' }}>
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <div style={{ width:40,height:40,borderRadius:12,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>📡</div>
              <div style={{ textAlign:'left' }}>
                <p style={{ color:'#fff',fontWeight:800,fontSize:15 }}>Airtel SIM Remote Activation</p>
                <p style={{ color:'rgba(255,255,255,.7)',fontSize:12 }}>30GB/month · ₦5,000 · &lt;1 hour</p>
              </div>
            </div>
            <span style={{ color:'rgba(255,255,255,.8)',fontSize:18 }}>›</span>
          </button>
        </div>

        {/* Quick Cards */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,margin:'12px 16px 0' }}>
          <button onClick={()=>setScreen('data-networks')}
            style={{ background:'var(--card)',borderRadius:18,padding:'18px 16px',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:10,border:'1.5px solid var(--border)',boxShadow:'0 2px 12px rgba(0,0,0,.04)' }}>
            <div style={{ width:44,height:44,borderRadius:14,background:'rgba(0,122,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>📶</div>
            <div style={{ textAlign:'left' }}>
              <p style={{ fontWeight:800,fontSize:16,color:'var(--text)' }}>Buy Data</p>
              <p style={{ fontSize:12,color:'var(--sub)',marginTop:2 }}>MTN · Airtel · Glo</p>
            </div>
          </button>
          <button onClick={()=>{ loadProducts(); setScreen('store'); }}
            style={{ background:'var(--card)',borderRadius:18,padding:'18px 16px',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:10,border:'1.5px solid var(--border)',boxShadow:'0 2px 12px rgba(0,0,0,.04)' }}>
            <div style={{ width:44,height:44,borderRadius:14,background:'rgba(52,199,89,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>🏪</div>
            <div style={{ textAlign:'left' }}>
              <p style={{ fontWeight:800,fontSize:16,color:'var(--text)' }}>Store</p>
              <p style={{ fontSize:12,color:'var(--sub)',marginTop:2 }}>Devices & Accessories</p>
            </div>
          </button>
        </div>

        {/* Recent Transactions */}
        <div style={{ margin:'20px 16px 0' }}>
          <p style={{ fontSize:13,fontWeight:700,color:'var(--sub)',letterSpacing:.5,marginBottom:12 }}>RECENT TRANSACTIONS</p>
          {transactions.length === 0 ? (
            <div style={{ textAlign:'center',padding:'32px 20px',background:'var(--card)',borderRadius:18,border:'1.5px dashed var(--border)' }}>
              <div style={{ fontSize:40,marginBottom:12,animation:'bounce 2s infinite' }}>📊</div>
              <p style={{ fontWeight:700,fontSize:16,color:'var(--text)',marginBottom:6 }}>No transactions yet</p>
              <p style={{ color:'var(--sub)',fontSize:14,lineHeight:1.6 }}>Buy data or shop from the store — your transactions will appear here.</p>
            </div>
          ) : (
            <div style={{ background:'var(--card)',borderRadius:18,overflow:'hidden' }}>
              {transactions.slice(0,20).map((tx,i) => (
                <div key={tx.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderBottom: i<transactions.length-1?'1px solid var(--border)':undefined }}>
                  <div style={{ width:40,height:40,borderRadius:12,background:'rgba(0,122,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>
                    {tx.type==='data'?'📶':tx.type==='product'?'📦':'💸'}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontWeight:600,fontSize:14,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{tx.description}</p>
                    <p style={{ fontSize:12,color:'var(--sub)',marginTop:2 }}>{new Date(tx.createdAt).toLocaleString('en-NG',{dateStyle:'short',timeStyle:'short'})}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontWeight:800,fontSize:15,color: tx.status==='success'?RED:GOLD }}>-₦{Number(tx.amount).toLocaleString()}</p>
                    <p style={{ fontSize:11,color: tx.status==='success'?GREEN:tx.status==='pending'?GOLD:RED,fontWeight:600 }}>{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav active="home" />
    </>
  );

  /* DATA NETWORKS */
  if (screen === 'data-networks') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',background:'var(--bg)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'60px 20px 20px',display:'flex',alignItems:'center',gap:12 }}>
          <button onClick={()=>setScreen('home')} style={{ color:BLUE,fontSize:16,fontWeight:600 }}>← Back</button>
          <h2 style={{ fontSize:20,fontWeight:800,color:'var(--text)' }}>Select Network</h2>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'0 16px 40px' }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
            {NETWORKS.map(net => (
              <button key={net.name} onClick={()=>{ setSelectedNetwork(net); loadPlans(net.name); setScreen('data-plans'); }}
                style={{ background:'var(--card)',borderRadius:20,padding:'24px 16px',display:'flex',flexDirection:'column',alignItems:'center',gap:12,border:`2px solid ${net.color}22`,boxShadow:'0 2px 12px rgba(0,0,0,.06)' }}>
                <div style={{ width:60,height:60,borderRadius:18,background:net.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30 }}>{net.emoji}</div>
                <p style={{ fontWeight:800,fontSize:17,color:'var(--text)' }}>{net.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  /* DATA PLANS */
  if (screen === 'data-plans') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',background:'var(--bg)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'60px 20px 20px',display:'flex',alignItems:'center',gap:12 }}>
          <button onClick={()=>setScreen('data-networks')} style={{ color:BLUE,fontSize:16,fontWeight:600 }}>← Back</button>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <span style={{ fontSize:20 }}>{selectedNetwork?.emoji}</span>
            <h2 style={{ fontSize:20,fontWeight:800,color:'var(--text)' }}>{selectedNetwork?.name} Data Plans</h2>
          </div>
        </div>
        {/* Phone input */}
        <div style={{ padding:'0 16px 12px' }}>
          <input value={buyPhone} onChange={e=>setBuyPhone(e.target.value.replace(/\D/g,'').slice(0,11))}
            placeholder="Enter phone number (11 digits)" inputMode="numeric"
            style={{ width:'100%',padding:'14px 16px',borderRadius:14,background:'var(--card)',border:'1.5px solid var(--border)',color:'var(--text)',fontSize:16,fontWeight:600 }} />
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'0 16px 40px' }}>
          {plans.length === 0 ? (
            <p style={{ textAlign:'center',color:'var(--sub)',padding:40 }}>No plans available</p>
          ) : (
            <div style={{ display:'grid',gap:10 }}>
              {plans.map(plan => (
                <button key={plan.id} onClick={()=>{ if(buyPhone.length!==11){showError('Enter 11-digit phone number');return;} setSelectedPlan(plan); setPinAction('buy-data'); setShowPin(true); }}
                  style={{ background:'var(--card)',borderRadius:16,padding:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',border:'1.5px solid var(--border)',width:'100%' }}>
                  <div style={{ textAlign:'left' }}>
                    <p style={{ fontWeight:800,fontSize:17,color:'var(--text)' }}>{plan.dataSize}</p>
                    <p style={{ color:'var(--sub)',fontSize:13,marginTop:2 }}>Valid {plan.validity}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:20,fontWeight:900,color:BLUE }}>₦{plan.price.toLocaleString()}</p>
                    <div style={{ background:BLUE,borderRadius:20,padding:'4px 12px',marginTop:6 }}>
                      <p style={{ color:'#fff',fontSize:12,fontWeight:700 }}>Buy →</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {showPin && selectedPlan && (
        <PinKeyboard
          title={`Authorize ₦${selectedPlan.price.toLocaleString()}`}
          subtitle={`${selectedPlan.dataSize} ${selectedNetwork?.name} to ${buyPhone}`}
          onComplete={handlePinComplete} onClose={()=>setShowPin(false)} />
      )}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:14,fontWeight:600,zIndex:500 }}>{error}</div>}
      {receipt && <Receipt data={receipt} onDownload={()=>{}} onClose={()=>{ setReceipt(null); setScreen('home'); }} dark={dark} />}
    </>
  );

  /* STORE */
  if (screen === 'store') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',background:'var(--bg)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'60px 20px 16px',display:'flex',alignItems:'center',gap:12 }}>
          <button onClick={()=>setScreen('home')} style={{ color:BLUE,fontSize:16,fontWeight:600 }}>← Back</button>
          <h2 style={{ fontSize:20,fontWeight:800,color:'var(--text)' }}>Store</h2>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'0 16px 40px' }}>
          {products.length === 0 ? (
            <div style={{ textAlign:'center',padding:'60px 20px' }}>
              <div style={{ fontSize:50,marginBottom:16 }}>🏪</div>
              <p style={{ fontSize:18,fontWeight:700,color:'var(--text)' }}>Coming Soon</p>
              <p style={{ color:'var(--sub)',marginTop:8 }}>New products are being added</p>
            </div>
          ) : (
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
              {products.map(p => (
                <button key={p.id} onClick={()=>{ setSelectedProduct(p); setScreen('product'); }}
                  style={{ background:'var(--card)',borderRadius:18,overflow:'hidden',textAlign:'left',border:'1.5px solid var(--border)',boxShadow:'0 2px 8px rgba(0,0,0,.05)' }}>
                  <div style={{ height:140,background:'var(--card2)',position:'relative',overflow:'hidden' }}>
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : <div style={{ height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40 }}>📦</div>}
                    <div style={{ position:'absolute',top:8,right:8,background:p.inStock?GREEN:RED,borderRadius:20,padding:'3px 8px' }}>
                      <p style={{ color:'#fff',fontSize:10,fontWeight:700 }}>{p.inStock?'In Stock':'Out'}</p>
                    </div>
                  </div>
                  <div style={{ padding:'12px' }}>
                    <p style={{ fontWeight:700,fontSize:14,color:'var(--text)',lineHeight:1.3,marginBottom:6 }}>{p.name}</p>
                    <p style={{ fontWeight:900,fontSize:16,color:BLUE }}>₦{Number(p.price).toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {showPin && selectedProduct && (
        <PinKeyboard
          title={`Pay ₦${Number(selectedProduct.price).toLocaleString()}`}
          subtitle={selectedProduct.name}
          onComplete={handlePinComplete} onClose={()=>setShowPin(false)} />
      )}
      {receipt && <Receipt data={receipt} onDownload={()=>{}} onClose={()=>{ setReceipt(null); setScreen('home'); }} dark={dark} />}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:14,fontWeight:600,zIndex:500 }}>{error}</div>}
      {toast && <div className="fade-in" style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:14,fontWeight:700,zIndex:500 }}>{toast}</div>}
    </>
  );

  /* PRODUCT DETAIL */
  if (screen === 'product' && selectedProduct) return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',background:'var(--bg)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'60px 20px 16px',display:'flex',alignItems:'center',gap:12 }}>
          <button onClick={()=>setScreen('store')} style={{ color:BLUE,fontSize:16,fontWeight:600 }}>← Back</button>
          <h2 style={{ fontSize:18,fontWeight:800,color:'var(--text)',flex:1 }} />
        </div>
        <div style={{ flex:1,overflowY:'auto',paddingBottom:100 }}>
          <div style={{ height:260,background:'var(--card2)',overflow:'hidden' }}>
            {selectedProduct.imageUrl ? <img src={selectedProduct.imageUrl} alt={selectedProduct.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : <div style={{ height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:60 }}>📦</div>}
          </div>
          <div style={{ padding:'20px 20px 0' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
              <h1 style={{ fontSize:22,fontWeight:900,color:'var(--text)',flex:1,paddingRight:12 }}>{selectedProduct.name}</h1>
              <p style={{ fontSize:24,fontWeight:900,color:BLUE,whiteSpace:'nowrap' }}>₦{Number(selectedProduct.price).toLocaleString()}</p>
            </div>
            <div style={{ display:'inline-block',background:selectedProduct.inStock?'rgba(52,199,89,.12)':'rgba(255,59,48,.12)',borderRadius:20,padding:'5px 12px',marginBottom:20 }}>
              <p style={{ color:selectedProduct.inStock?GREEN:RED,fontSize:13,fontWeight:700 }}>{selectedProduct.inStock?'✓ In Stock':'Out of Stock'}</p>
            </div>
            <p style={{ fontSize:15,color:'var(--sub)',lineHeight:1.7,marginBottom:20 }}>{selectedProduct.description}</p>
            {selectedProduct.shippingTerms && (
              <div style={{ background:'var(--card)',borderRadius:14,padding:'14px 16px',marginBottom:12 }}>
                <p style={{ fontWeight:700,fontSize:14,color:'var(--text)',marginBottom:6 }}>🚚 Shipping Terms</p>
                <p style={{ fontSize:14,color:'var(--sub)',lineHeight:1.6 }}>{selectedProduct.shippingTerms}</p>
              </div>
            )}
            {selectedProduct.pickupTerms && (
              <div style={{ background:'var(--card)',borderRadius:14,padding:'14px 16px' }}>
                <p style={{ fontWeight:700,fontSize:14,color:'var(--text)',marginBottom:6 }}>📍 Pickup Terms</p>
                <p style={{ fontSize:14,color:'var(--sub)',lineHeight:1.6 }}>{selectedProduct.pickupTerms}</p>
              </div>
            )}
          </div>
        </div>
        {selectedProduct.inStock && (
          <div style={{ position:'fixed',bottom:0,left:0,right:0,padding:'16px 20px',background:'var(--card)',borderTop:'1px solid var(--border)' }}>
            <button onClick={()=>{ setPinAction('buy-product'); setShowPin(true); }}
              style={{ width:'100%',padding:'17px',borderRadius:16,background:BLUE,color:'#fff',fontSize:17,fontWeight:700 }}>
              Buy for ₦{Number(selectedProduct.price).toLocaleString()} →
            </button>
          </div>
        )}
      </div>
      {showPin && <PinKeyboard title={`Pay ₦${Number(selectedProduct.price).toLocaleString()}`} subtitle={selectedProduct.name} onComplete={handlePinComplete} onClose={()=>setShowPin(false)} />}
      {receipt && <Receipt data={receipt} onDownload={()=>{}} onClose={()=>{ setReceipt(null); setScreen('home'); }} dark={dark} />}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:14,fontWeight:600,zIndex:500 }}>{error}</div>}
    </>
  );

  /* TRANSACTIONS */
  if (screen === 'transactions') return (
    <>
      <GlobalStyle dark={dark} />
      {receipt && <Receipt data={receipt} onDownload={()=>{}} onClose={()=>setReceipt(null)} dark={dark} />}
      <div style={{ height:'100dvh',background:'var(--bg)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'60px 20px 16px' }}>
          <h2 style={{ fontSize:22,fontWeight:900,color:'var(--text)' }}>Transactions</h2>
          <p style={{ color:'var(--sub)',fontSize:14,marginTop:2 }}>Your purchase history</p>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'0 16px 20px' }}>
          {transactions.length === 0 ? (
            <div style={{ textAlign:'center',padding:60 }}>
              <div style={{ fontSize:48,marginBottom:16 }}>📋</div>
              <p style={{ fontSize:17,fontWeight:700,color:'var(--text)' }}>No transactions yet</p>
            </div>
          ) : (
            <div style={{ display:'grid',gap:8 }}>
              {transactions.map(tx => (
                <button key={tx.id} onClick={()=>{ if(tx.receiptData) setReceipt(tx.receiptData as Record<string,unknown>); }}
                  style={{ background:'var(--card)',borderRadius:16,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,border:'1.5px solid var(--border)',width:'100%' }}>
                  <div style={{ width:44,height:44,borderRadius:14,background:'rgba(0,122,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>
                    {tx.type==='data'?'📶':tx.type==='product'?'📦':'💸'}
                  </div>
                  <div style={{ flex:1,textAlign:'left' }}>
                    <p style={{ fontWeight:600,fontSize:14,color:'var(--text)' }}>{tx.description}</p>
                    <p style={{ fontSize:12,color:'var(--sub)',marginTop:2 }}>{new Date(tx.createdAt).toLocaleString('en-NG',{dateStyle:'medium',timeStyle:'short'})}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontWeight:800,fontSize:16,color:RED }}>-₦{Number(tx.amount).toLocaleString()}</p>
                    <p style={{ fontSize:11,fontWeight:700,color:tx.status==='success'?GREEN:tx.status==='pending'?GOLD:RED }}>{tx.status}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav active="transactions" />
    </>
  );

  /* DEPOSITS */
  if (screen === 'deposits') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',background:'var(--bg)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'60px 20px 16px' }}>
          <h2 style={{ fontSize:22,fontWeight:900,color:'var(--text)' }}>Deposits</h2>
          <p style={{ color:'var(--sub)',fontSize:14,marginTop:2 }}>Money added to your wallet</p>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'0 16px 20px' }}>
          {deposits.length === 0 ? (
            <div style={{ textAlign:'center',padding:60 }}>
              <div style={{ fontSize:48,marginBottom:16 }}>💰</div>
              <p style={{ fontSize:17,fontWeight:700,color:'var(--text)' }}>No deposits yet</p>
              <p style={{ color:'var(--sub)',fontSize:14,marginTop:8,lineHeight:1.6 }}>Transfer money to your virtual account ({user.accountNumber}) to fund your wallet</p>
            </div>
          ) : (
            <div style={{ display:'grid',gap:8 }}>
              {deposits.map(dep => (
                <div key={dep.id} style={{ background:'var(--card)',borderRadius:16,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,border:'1.5px solid var(--border)' }}>
                  <div style={{ width:44,height:44,borderRadius:14,background:'rgba(52,199,89,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0 }}>💳</div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:600,fontSize:14,color:'var(--text)' }}>{dep.senderName || 'Bank Transfer'}</p>
                    <p style={{ fontSize:12,color:'var(--sub)',marginTop:2 }}>{dep.narration || 'Wallet funding'}</p>
                    <p style={{ fontSize:11,color:'var(--sub)',marginTop:2 }}>{new Date(dep.createdAt).toLocaleString('en-NG',{dateStyle:'medium',timeStyle:'short'})}</p>
                  </div>
                  <p style={{ fontWeight:800,fontSize:16,color:GREEN }}>+₦{Number(dep.amount).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav active="deposits" />
    </>
  );

  /* SIM ACTIVATION */
  if (screen === 'sim-activation') return (
    <>
      <GlobalStyle dark={dark} />
      {showPin && <PinKeyboard title="Pay ₦5,000" subtitle="Airtel SIM Remote Activation" onComplete={handlePinComplete} onClose={()=>setShowPin(false)} />}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:14,fontWeight:600,zIndex:500 }}>{error}</div>}
      {toast && <div className="fade-in" style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:14,fontWeight:700,zIndex:500 }}>{toast}</div>}
      <div style={{ height:'100dvh',background:'var(--bg)',overflowY:'auto',paddingBottom:40 }}>
        <div style={{ padding:'60px 20px 20px',display:'flex',alignItems:'center',gap:12 }}>
          <button onClick={()=>setScreen('home')} style={{ color:BLUE,fontSize:16,fontWeight:600 }}>← Back</button>
          <h2 style={{ fontSize:18,fontWeight:800,color:'var(--text)' }}>SIM Remote Activation</h2>
        </div>
        {/* Hero */}
        <div style={{ margin:'0 16px',background:'linear-gradient(135deg,#E40000,#FF6B6B)',borderRadius:20,padding:'24px',marginBottom:20 }}>
          <p style={{ color:'rgba(255,255,255,.8)',fontSize:12,fontWeight:600,letterSpacing:.5,marginBottom:4 }}>NOW AVAILABLE GLOBALLY</p>
          <h2 style={{ color:'#fff',fontSize:22,fontWeight:900,marginBottom:8 }}>Airtel Data SIM Activation</h2>
          <p style={{ color:'rgba(255,255,255,.8)',fontSize:14,lineHeight:1.7 }}>Buy an Airtel data SIM anywhere in the world. Send us the serial number or a photo — we'll activate a <strong>30GB monthly data plan</strong> for ₦5,000 in under 1 hour.</p>
        </div>
        {/* Status */}
        {simActivations.length > 0 && (
          <div style={{ margin:'0 16px 16px' }}>
            <p style={{ fontSize:13,fontWeight:700,color:'var(--sub)',marginBottom:10 }}>YOUR REQUESTS</p>
            {simActivations.map(act => (
              <div key={act.id} style={{ background:'var(--card)',borderRadius:14,padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8,border:'1.5px solid var(--border)' }}>
                <div>
                  <p style={{ fontSize:13,fontWeight:600,color:'var(--text)' }}>{act.serialNumber || 'SIM Activation'}</p>
                  <p style={{ fontSize:11,color:'var(--sub)',marginTop:2 }}>{new Date(act.createdAt).toLocaleDateString('en-NG')}</p>
                </div>
                <div style={{ background:act.status==='activated'?'rgba(52,199,89,.1)':'rgba(255,149,0,.1)',borderRadius:20,padding:'6px 14px' }}>
                  <p style={{ color:act.status==='activated'?GREEN:GOLD,fontSize:12,fontWeight:700 }}>
                    {act.status==='activated'?'✅ Activated':'⏳ Under Review'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Form */}
        <div style={{ padding:'0 16px' }}>
          <p style={{ fontSize:13,fontWeight:700,color:'var(--sub)',marginBottom:10 }}>SUBMIT NEW REQUEST</p>
          <input value={simSerial} onChange={e=>setSimSerial(e.target.value)}
            placeholder="Enter SIM serial number (ICCID)"
            style={{ width:'100%',padding:'14px 16px',borderRadius:14,background:'var(--card)',border:'1.5px solid var(--border)',color:'var(--text)',fontSize:15,marginBottom:12 }} />
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12 }}>
            {[
              { label:'Front of SIM Pack', value:simFront, setter:setSimFront, capture:'environment' as const },
              { label:'Back of SIM Pack', value:simBack, setter:setSimBack, capture:'environment' as const },
            ].map(({ label, value, setter, capture }) => (
              <label key={label} style={{ background:'var(--card)',borderRadius:14,border:`2px dashed ${value?GREEN:'var(--border)'}`,overflow:'hidden',cursor:'pointer',display:'block' }}>
                <input type="file" accept="image/*" capture={capture} style={{ display:'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) { const r = new FileReader(); r.onload=ev=>setter(ev.target?.result as string); r.readAsDataURL(file); }
                  }} />
                {value ? <img src={value} alt={label} style={{ width:'100%',height:120,objectFit:'cover' }} /> : (
                  <div style={{ height:120,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6 }}>
                    <span style={{ fontSize:28 }}>📷</span>
                    <p style={{ fontSize:12,color:'var(--sub)',fontWeight:600,textAlign:'center',padding:'0 8px' }}>{label}</p>
                  </div>
                )}
              </label>
            ))}
          </div>
          <div style={{ background:'var(--card)',borderRadius:14,padding:'14px 16px',marginBottom:16,border:'1.5px solid var(--border)' }}>
            <p style={{ fontWeight:700,fontSize:15,color:'var(--text)' }}>Total: ₦5,000</p>
            <p style={{ fontSize:13,color:'var(--sub)',marginTop:4 }}>30GB monthly plan · Activated in &lt;1 hour</p>
          </div>
          <button onClick={()=>{ if(!simSerial && !simFront){ showError('Enter serial number or upload SIM pack photo'); return; } setPinAction('sim-pay'); setShowPin(true); }}
            style={{ width:'100%',padding:'17px',borderRadius:16,background:BLUE,color:'#fff',fontSize:17,fontWeight:700 }}>
            Pay ₦5,000 →
          </button>
        </div>
      </div>
    </>
  );

  /* PROFILE */
  if (screen === 'profile') return (
    <>
      <GlobalStyle dark={dark} />
      {showPin && <PinKeyboard title="Enter current PIN to confirm" onComplete={(pin)=>{ setShowPin(false); handleChangePin(pin); }} onClose={()=>setShowPin(false)} />}
      {toast && <div className="fade-in" style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:14,fontWeight:700,zIndex:500 }}>{toast}</div>}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:14,fontWeight:600,zIndex:500 }}>{error}</div>}
      <div style={{ height:'100dvh',background:'var(--bg)',overflowY:'auto',paddingBottom:80 }}>
        <div style={{ padding:'60px 20px 0' }}>
          {/* Avatar */}
          <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:28 }}>
            <div style={{ width:68,height:68,borderRadius:22,background:'linear-gradient(135deg,#007AFF,#0040FF)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900,fontSize:24 }}>{getInitials(user)}</div>
            <div>
              <p style={{ fontSize:20,fontWeight:900,color:'var(--text)' }}>{user.firstName} {user.lastName}</p>
              <p style={{ color:'var(--sub)',fontSize:14 }}>Joined {new Date(user.createdAt).toLocaleDateString('en-NG',{month:'short',year:'numeric'})}</p>
              <p style={{ color:'var(--sub)',fontSize:13 }}>{user.phone}</p>
            </div>
          </div>
        </div>

        {/* Settings rows */}
        <div style={{ padding:'0 16px' }}>
          <SettingsGroup title="Account">
            <SettingsRow icon="🎨" label="Theme" right={
              <button onClick={()=>updatePref('theme', dark?'light':'dark')}
                style={{ background:dark?BLUE:'var(--card2)',borderRadius:20,padding:'6px 14px',color:dark?'#fff':'var(--sub)',fontSize:13,fontWeight:700,border:'1.5px solid var(--border)' }}>
                {dark?'Dark':'Light'}
              </button>
            } />
            <SettingsRow icon="🔔" label="Notifications" right={
              <Toggle value={user.notificationsEnabled} onChange={v=>updatePref('notificationsEnabled', v)} />
            } />
            <SettingsRow icon="📳" label="Haptics" right={
              <Toggle value={user.hapticsEnabled} onChange={v=>updatePref('hapticsEnabled', v)} />
            } />
          </SettingsGroup>

          <SettingsGroup title="Security">
            <SettingsRow icon="🔑" label="Change PIN" onPress={()=>setScreen('change-pin')} />
          </SettingsGroup>

          <SettingsGroup title="Support">
            <SettingsRow icon="💬" label="Help & Chat" onPress={()=>{ loadChats(); setScreen('chat'); }} />
            <SettingsRow icon="ℹ️" label="About SaukiMart" onPress={()=>setScreen('about')} />
            <SettingsRow icon="📞" label="+234 704 464 7081" right={
              <div style={{ display:'flex',gap:8 }}>
                <a href="tel:+2347044647081" style={{ background:'rgba(0,122,255,.1)',borderRadius:10,padding:'6px 10px',color:BLUE,fontSize:12,fontWeight:700 }}>Call</a>
                <a href="https://wa.me/2347044647081" target="_blank" rel="noreferrer" style={{ background:'rgba(37,211,102,.1)',borderRadius:10,padding:'6px 10px',color:'#25D366',fontSize:12,fontWeight:700 }}>WhatsApp</a>
              </div>
            } />
            <SettingsRow icon="📞" label="+234 806 193 4056" right={
              <div style={{ display:'flex',gap:8 }}>
                <a href="tel:+2348061934056" style={{ background:'rgba(0,122,255,.1)',borderRadius:10,padding:'6px 10px',color:BLUE,fontSize:12,fontWeight:700 }}>Call</a>
                <a href="https://wa.me/2348061934056" target="_blank" rel="noreferrer" style={{ background:'rgba(37,211,102,.1)',borderRadius:10,padding:'6px 10px',color:'#25D366',fontSize:12,fontWeight:700 }}>WhatsApp</a>
              </div>
            } />
            <SettingsRow icon="📧" label="support@saukimart.online" right={
              <a href="mailto:support@saukimart.online" style={{ background:'rgba(0,122,255,.1)',borderRadius:10,padding:'6px 10px',color:BLUE,fontSize:12,fontWeight:700 }}>Email</a>
            } />
          </SettingsGroup>

          <button onClick={signOut} style={{ width:'100%',padding:'16px',borderRadius:16,background:'rgba(255,59,48,.08)',border:'1.5px solid rgba(255,59,48,.15)',color:RED,fontSize:16,fontWeight:700,marginTop:8,marginBottom:24 }}>
            Sign Out
          </button>

          <p style={{ textAlign:'center',fontSize:22,fontWeight:900,color:'var(--text)',letterSpacing:-0.8,marginBottom:4 }}>SaukiMart</p>
          <p style={{ textAlign:'center',fontSize:13,color:'var(--sub)',marginBottom:32 }}>Data & Devices · v1.0.0</p>
        </div>
      </div>
      <BottomNav active="profile" />
    </>
  );

  /* CHANGE PIN */
  if (screen === 'change-pin') return (
    <>
      <GlobalStyle dark={dark} />
      {showPin && <PinKeyboard title="Enter current PIN" onComplete={(pin)=>{ setShowPin(false); handleChangePin(pin); }} onClose={()=>setShowPin(false)} />}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:14,fontWeight:600,zIndex:500 }}>{error}</div>}
      <div style={{ height:'100dvh',background:'var(--bg)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'60px 20px 20px',display:'flex',alignItems:'center',gap:12 }}>
          <button onClick={()=>setScreen('profile')} style={{ color:BLUE,fontSize:16,fontWeight:600 }}>← Back</button>
          <h2 style={{ fontSize:18,fontWeight:800,color:'var(--text)' }}>Change PIN</h2>
        </div>
        <div style={{ padding:'0 24px',flex:1 }}>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:13,fontWeight:600,color:'var(--sub)',marginBottom:6,display:'block' }}>New PIN (6 digits)</label>
            <input type="password" inputMode="numeric" maxLength={6} value={newPin} onChange={e=>setNewPin(e.target.value.replace(/\D/g,'').slice(0,6))}
              placeholder="••••••" style={{ width:'100%',padding:'15px',borderRadius:14,background:'var(--card)',border:'1.5px solid var(--border)',color:'var(--text)',fontSize:22,letterSpacing:8,textAlign:'center' }} />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:13,fontWeight:600,color:'var(--sub)',marginBottom:6,display:'block' }}>Confirm New PIN</label>
            <input type="password" inputMode="numeric" maxLength={6} value={confirmNewPin} onChange={e=>setConfirmNewPin(e.target.value.replace(/\D/g,'').slice(0,6))}
              placeholder="••••••" style={{ width:'100%',padding:'15px',borderRadius:14,background:'var(--card)',border:'1.5px solid var(--border)',color:'var(--text)',fontSize:22,letterSpacing:8,textAlign:'center' }} />
          </div>
          <button onClick={()=>{ if(newPin.length===6&&newPin===confirmNewPin){ setShowPin(true); } else showError('PINs must be 6 digits and match'); }}
            disabled={newPin.length!==6||newPin!==confirmNewPin}
            style={{ width:'100%',padding:'17px',borderRadius:16,background:newPin.length===6&&newPin===confirmNewPin?BLUE:'var(--card2)',color:newPin.length===6&&newPin===confirmNewPin?'#fff':'var(--sub)',fontSize:17,fontWeight:700 }}>
            Update PIN →
          </button>
        </div>
      </div>
    </>
  );

  /* CHAT */
  if (screen === 'chat') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',background:'var(--bg)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'60px 20px 14px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12 }}>
          <button onClick={()=>setScreen('profile')} style={{ color:BLUE,fontSize:16,fontWeight:600 }}>← Back</button>
          <div>
            <p style={{ fontSize:16,fontWeight:700,color:'var(--text)' }}>Support Chat</p>
            <p style={{ fontSize:12,color:GREEN }}>● Online</p>
          </div>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:10 }}>
          {chats.length === 0 && (
            <div style={{ textAlign:'center',padding:'40px 20px' }}>
              <div style={{ fontSize:40,marginBottom:12 }}>💬</div>
              <p style={{ color:'var(--sub)',fontSize:15 }}>Send us a message — we reply fast!</p>
            </div>
          )}
          {chats.map(msg => (
            <div key={msg.id} style={{ display:'flex',justifyContent: msg.sender==='user'?'flex-end':'flex-start' }}>
              <div style={{ maxWidth:'80%',padding:'10px 14px',borderRadius: msg.sender==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px', background: msg.sender==='user'?BLUE:'var(--card)',color: msg.sender==='user'?'#fff':'var(--text)',fontSize:15,lineHeight:1.5,border: msg.sender!=='user'?'1.5px solid var(--border)':undefined }}>
                {msg.message}
                <p style={{ fontSize:10,opacity:.6,marginTop:4,textAlign:'right' }}>{new Date(msg.createdAt).toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'})}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:'12px 16px',borderTop:'1px solid var(--border)',display:'flex',gap:10,background:'var(--card)' }}>
          <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter') sendChat(); }}
            placeholder="Type your message…"
            style={{ flex:1,padding:'12px 16px',borderRadius:24,background:'var(--card2)',border:'1.5px solid var(--border)',color:'var(--text)',fontSize:15 }} />
          <button onClick={sendChat} style={{ width:44,height:44,borderRadius:22,background:BLUE,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
            <span style={{ color:'#fff',fontSize:18 }}>➤</span>
          </button>
        </div>
      </div>
    </>
  );

  /* ABOUT */
  if (screen === 'about') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',background:'var(--bg)',overflowY:'auto' }}>
        <div style={{ padding:'60px 20px 40px' }}>
          <button onClick={()=>setScreen('profile')} style={{ color:BLUE,fontSize:16,fontWeight:600,marginBottom:28 }}>← Back</button>
          <div style={{ textAlign:'center',marginBottom:32 }}>
            <div style={{ width:80,height:80,borderRadius:24,background:'linear-gradient(135deg,#007AFF,#0040FF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:38,margin:'0 auto 16px',boxShadow:'0 8px 32px rgba(0,122,255,.3)' }}>⚡</div>
            <h1 style={{ fontSize:26,fontWeight:900,color:'var(--text)',letterSpacing:-0.6 }}>SaukiMart</h1>
            <p style={{ color:'var(--sub)',fontSize:15,marginTop:4 }}>Data & Devices</p>
            <p style={{ color:'var(--sub)',fontSize:13,marginTop:4 }}>Version 1.0.0</p>
          </div>
          {[
            ['📍 Mission', 'Making data affordable for every Nigerian — instantly, reliably, at the best prices.'],
            ['🔒 Security', 'All PINs encrypted with bcryptjs. Payments secured via Flutterwave PCI-DSS compliance.'],
            ['📞 Contact', 'support@saukimart.online\n+234 704 464 7081\n+234 806 193 4056'],
            ['⚖️ Legal', 'SMEDAN Certified Business. By using this app, you agree to our Terms of Service and Privacy Policy.'],
          ].map(([title, body]) => (
            <div key={title as string} style={{ background:'var(--card)',borderRadius:16,padding:'16px',marginBottom:12,border:'1.5px solid var(--border)' }}>
              <p style={{ fontWeight:700,fontSize:15,color:'var(--text)',marginBottom:6 }}>{title as string}</p>
              <p style={{ color:'var(--sub)',fontSize:14,lineHeight:1.7,whiteSpace:'pre-line' }}>{body as string}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return null;
}

/* ── HELPERS ── */
function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:16 }}>
      <p style={{ fontSize:12,fontWeight:700,color:'var(--sub)',letterSpacing:.5,marginBottom:8,marginLeft:4 }}>{title.toUpperCase()}</p>
      <div style={{ background:'var(--card)',borderRadius:16,overflow:'hidden',border:'1.5px solid var(--border)' }}>
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ icon, label, onPress, right }: { icon: string; label: string; onPress?: ()=>void; right?: React.ReactNode; }) {
  return (
    <button onClick={onPress} style={{ width:'100%',display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderBottom:'1px solid var(--border)',background:'none' }}>
      <span style={{ fontSize:19,width:24,textAlign:'center' }}>{icon}</span>
      <span style={{ flex:1,textAlign:'left',fontSize:15,fontWeight:500,color:'var(--text)' }}>{label}</span>
      {right || (onPress && <span style={{ color:'var(--sub)',fontSize:18 }}>›</span>)}
    </button>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={()=>onChange(!value)} style={{ width:52,height:30,borderRadius:15,background:value?'#34C759':'#E9E9EA',padding:'3px',display:'flex',alignItems:'center',transition:'background .25s',border:'none',cursor:'pointer' }}>
      <div style={{ width:24,height:24,borderRadius:12,background:'#fff',boxShadow:'0 2px 4px rgba(0,0,0,.15)',transform:`translateX(${value?22:0}px)`,transition:'transform .25s' }} />
    </button>
  );
}
