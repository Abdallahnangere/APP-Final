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
type Product = { id: string; name: string; description: string; price: number; imageUrl: string; imageBase64?: string; inStock: boolean; shippingTerms: string; pickupTerms: string; category: string; };
type ChatMsg = { id: string; sender: string; message: string; createdAt: string; };
type SimActivation = { id: string; status: string; createdAt: string; serialNumber?: string; };

/* ─────────────── CONSTANTS ─────────────── */
const BLUE = '#0071E3';
const GREEN = '#30D158';
const ORANGE = '#FF9F0A';
const RED = '#FF3B30';
const PURPLE = '#BF5AF2';
const TEAL = '#5AC8FA';

const NETWORKS = [
  { name: 'MTN', id: 1 },
  { name: 'GLO', id: 2 },
  { name: 'AIRTEL', id: 4 },
  { name: '9MOBILE', id: 9 },
];

/* ─────────────── SVG ICONS ─────────────── */
const Icons = {
  wallet: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><path d="M1 10h22"/><rect x="17" y="15" width="3" height="3" rx="1" ry="1"/></svg>,
  bolt: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  arrowDown: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>,
  arrowUp: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
  creditCard: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><path d="M1 10h22"/></svg>,
  banknotes: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="1"/><path d="M17 11h.01M7 11h.01"/></svg>,
  chartBar: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  bell: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  sun: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  shieldCheck: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="16 12 12 16 8 12"/></svg>,
  lock: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  user: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>,
  phone: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  checkCircle: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  alertCircle: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  info: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  mapPin: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  globe: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  download: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
};

/* ─────────────── HELPER FUNCTIONS ─────────────── */
const formatAmount = (amount: number) => `₦${amount.toLocaleString('en-NG', {minimumFractionDigits: 2})}`;

const IconBox = ({ icon, color, bg }: { icon: React.ReactNode; color?: string; bg?: string }) => (
  <div style={{ width: 48, height: 48, borderRadius: 12, background: bg || 'rgba(0,113,227,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    {icon}
  </div>
);

const StatusPill = ({ label, type }: { label: string; type: 'success' | 'pending' | 'failed' | 'verified' }) => {
  const colors: Record<string, { bg: string; color: string }> = {
    success: { bg: 'rgba(48,209,88,.12)', color: GREEN },
    pending: { bg: 'rgba(255,159,10,.12)', color: ORANGE },
    failed: { bg: 'rgba(255,59,48,.12)', color: RED },
    verified: { bg: 'rgba(191,90,242,.12)', color: PURPLE },
  };
  const c = colors[type] || colors.pending;
  return (
    <div style={{ display: 'inline-block', borderRadius: 980, padding: '4px 10px', background: c.bg, fontSize: 12, fontWeight: 500, color: c.color }}>
      {label}
    </div>
  );
};

/* ─────────────── GLOBAL STYLES ─────────────── */
const GlobalStyle = ({ dark }: { dark: boolean }) => (
  <style>{`
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    :root{
      --bg:${dark?'#000000':'#FFFFFF'};
      --bg-secondary:${dark?'#1C1C1E':'#F5F5F7'};
      --card:${dark?'#1D1D1F':'#FFFFFF'};
      --card2:${dark?'#424245':'#F2F2F7'};
      --text:${dark?'#F5F5F7':'#1D1D1F'};
      --text-secondary:${dark?'#A1A1A6':'#6E6E73'};
      --border:${dark?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)'};
      --border-subtle:${dark?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)'};
      --blue:#0071E3;--green:#30D158;--orange:#FF9F0A;--red:#FF3B30;--purple:#BF5AF2;--teal:#5AC8FA;
    }
    html,body{height:100%;overflow:hidden;touch-action:pan-y;font-family:-apple-system,"SF Pro Display","SF Pro Text",BlinkMacSystemFont,sans-serif}
    body{background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%}
    input,button{font-family:inherit;outline:none}
    button{border:none;cursor:pointer;background:none;-webkit-user-select:none;user-select:none}
    a{color:inherit;text-decoration:none}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(0,0,0,.2);border-radius:2px}
    @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes fadeUpScale{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}
    @keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    @keyframes floatUp{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-20px);opacity:0}}
    .slide-up{animation:slideUp .32s cubic-bezier(.32,.72,0,1) both}
    .fade-in{animation:fadeIn .2s ease both}
    .fade-up-scale{animation:fadeUpScale .4s cubic-bezier(.16,.1,0,1) both}
    .card{border-radius:16px;background:var(--card);border:1px solid var(--border);box-shadow:0 8px 32px rgba(0,0,0,0.24),inset 0 1px 0 rgba(255,255,255,0.07);transition:all .3s cubic-bezier(.16,.1,0,1)}
    .card:hover{box-shadow:0 12px 40px rgba(0,0,0,0.32),inset 0 1px 0 rgba(255,255,255,0.07);transform:translateY(-2px)}
  `}</style>
);

/* ─────────────── PIN KEYBOARD ─────────────── */
function PinKeyboard({ onComplete, onClose, title = 'Enter your 6-digit PIN', subtitle = '', pinAction }: {
  onComplete: (pin: string) => void; onClose: () => void; title?: string; subtitle?: string; pinAction?: "buy-data" | "buy-product" | "sim-pay" | null;
}) {
  const [pin, setPin] = useState('');

  const press = (d: string) => {
    if (pin.length >= 6) return;
    const np = pin + d;
    setPin(np);
    if (np.length === 6) setTimeout(() => onComplete(np), 120);
  };
  const del = () => setPin(p => p.slice(0, -1));

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 200,
    background: 'rgba(0,0,0,.4)',
    display: 'flex',
    alignItems: 'flex-end',
    backdropFilter: 'blur(8px)'
  };

  const modalStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--card)',
    borderRadius: '28px 28px 0 0',
    padding: '32px 24px 40px'
  };

  const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    fontWeight: 700,
    fontSize: 20,
    color: 'var(--text)',
    marginBottom: 8
  };

  const subtitleStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: 15,
    color: 'var(--text-secondary)',
    marginBottom: 32
  };

  const dotsContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    margin: '32px 0'
  };

  const keysGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: 14,
    maxWidth: 320,
    margin: '0 auto'
  };

  const cancelStyle: React.CSSProperties = {
    width: '100%',
    marginTop: 20,
    padding: '16px',
    borderRadius: 16,
    background: 'var(--bg-secondary)',
    color: 'var(--text)',
    fontSize: 16,
    fontWeight: 600
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="slide-up" style={modalStyle}>
        <p style={titleStyle}>{title}</p>
        {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
        
        <div style={dotsContainerStyle}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{ width:16,height:16,borderRadius:8,background: i<pin.length ? BLUE : 'var(--border)',transition:'all .15s',transform: i<pin.length ? 'scale(1.2)' : 'scale(1)' }} />
          ))}
        </div>
        
        <div style={keysGridStyle}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k,i) => (
            <button key={i} onClick={()=>k==='⌫'?del():k?press(k):null}
              style={{ height:68,borderRadius:18,background: k===''?'transparent':'var(--card2)',fontSize: k==='⌫'?24:28,fontWeight:600,color:'var(--text)',border:'1px solid var(--border-subtle)',transition:'all .08s',opacity:k===''?0:1 }}
              onTouchStart={e=>{if(k){e.currentTarget.style.background='var(--bg-secondary)';e.currentTarget.style.transform='scale(.95)'}}}
              onTouchEnd={e=>{e.currentTarget.style.background=k===''?'transparent':'var(--card2)';e.currentTarget.style.transform='scale(1)'}}>
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
function Receipt({ data, onDownload, onClose, dark, autoDownload }: { data: Record<string,unknown>; onDownload: ()=>void; onClose: ()=>void; dark: boolean; autoDownload?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  const downloadPng = async () => {
    if (typeof window === 'undefined' || !ref.current) return;
    try {
      const { toPng } = await import('html-to-image');
      const url = await toPng(ref.current, { quality:1, pixelRatio:2 });
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${(data.ref as string) || Date.now()}.png`;
      a.click();
      if (onDownload) onDownload();
    } catch (err) {
      console.error('Receipt download error:', err);
    }
  };

  useEffect(() => {
    if (autoDownload) {
      const timer = setTimeout(downloadPng, 500);
      return () => clearTimeout(timer);
    }
  }, [autoDownload]);

  const date = new Date(data.date as string).toLocaleString('en-NG', { dateStyle:'long', timeStyle:'short' });

  return (
    <div style={{ position:'fixed',top:0,right:0,bottom:0,left:0,zIndex:300,background:'rgba(0,0,0,.5)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div className="slide-up" style={{ width:'100%',maxWidth:420,background:'var(--card)',borderRadius:28,overflow:'hidden' }}>
        {/* Downloadable receipt */}
        <div ref={ref} style={{ background:'#fff',width:'100%' }}>
          {/* Header */}
          <div style={{ background:'var(--bg)',padding:'48px 32px 40px',textAlign:'center' }}>
            <p style={{ color:'var(--text)',fontWeight:700,fontSize:24,letterSpacing:-0.5,marginBottom:4 }}>SaukiMart</p>
            <p style={{ color:'var(--text-secondary)',fontSize:13,marginBottom:20 }}>Your Receipt</p>
            <div style={{ background:GREEN+'15',borderRadius:12,padding:'12px 20px',display:'inline-block' }}>
              <p style={{ color:GREEN,fontWeight:700,fontSize:14 }}>✓ Transaction Successful</p>
            </div>
          </div>
          {/* Body */}
          <div style={{ padding:'32px' }}>
            <p style={{ fontSize:14,color:'var(--text-secondary)',textAlign:'center',marginBottom:24 }}>{date}</p>
            <div style={{ textAlign:'center',marginBottom:32 }}>
              <p style={{ fontSize:40,fontWeight:800,color:'var(--text)',letterSpacing:-1 }}>₦{Number(data.price||data.amount||0).toLocaleString()}</p>
            </div>
            {/* Fields */}
            {data.type === 'data' || data.network ? [
              ['Network', data.network],
              ['Data', data.dataSize],
              ['Validity', data.validity],
              ['Phone', data.phoneNumber],
              ['Reference', data.ref || data.amigoRef],
            ].filter(([,v])=>v).map(([k,v])=>(
              <div key={k as string} style={{ display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #F2F2F7' }}>
                <span style={{ color:'var(--text-secondary)',fontSize:14 }}>{k as string}</span>
                <span style={{ fontWeight:600,fontSize:14,color:'var(--text)',textAlign:'right' }}>{v as string}</span>
              </div>
            )) : [
              ['Customer', `${data.userName}`],
              ['Phone', data.userPhone],
              ['Item', data.productName || data.itemName],
              ['Reference', data.ref],
            ].filter(([,v])=>v).map(([k,v])=>(
              <div key={k as string} style={{ display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #F2F2F7' }}>
                <span style={{ color:'var(--text-secondary)',fontSize:14 }}>{k as string}</span>
                <span style={{ fontWeight:600,fontSize:14,color:'var(--text)',textAlign:'right' }}>{v as string}</span>
              </div>
            ))}
          </div>
          {/* Footer */}
          <div style={{ background:'var(--bg-secondary)',padding:'24px 32px',textAlign:'center' }}>
            <p style={{ fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4 }}>SaukiMart · Data & Devices</p>
            <p style={{ fontSize:12,color:'var(--text-secondary)' }}>support@saukimart.online</p>
            <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:4 }}>+234 704 464 7081 · +234 806 193 4056</p>
          </div>
        </div>
        {/* Actions */}
        <div style={{ padding:'16px 20px 28px',display:'flex',gap:10 }}>
          <button onClick={downloadPng} style={{ flex:1,padding:'16px',borderRadius:16,background:BLUE,color:'#fff',fontWeight:700,fontSize:16 }}>Download</button>
          <button onClick={onClose} style={{ padding:'16px 20px',borderRadius:16,background:'var(--bg-secondary)',color:'var(--text)',fontWeight:600,fontSize:16,border:'1px solid var(--border)' }}>Close</button>
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
      if (!res.ok) {
        throw new Error(data.error || `Server error (${res.status})`);
      }
      setReceipt({ ...data.receipt, type:'data' });
      await refreshUser();
      await loadHomeData();
      showToast('✅ Data purchase successful!');
    } catch(e:unknown) { 
      const msg = e instanceof Error ? e.message : 'Purchase failed';
      console.error('Data purchase error:', msg);
      showError(msg); 
    }
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
    const res = await fetch(`/api/products?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } });
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
      <div style={{ height:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--bg)' }}>
        <p style={{ color:'var(--text)',fontWeight:800,fontSize:32,letterSpacing:-0.8,marginBottom:8 }}>SaukiMart</p>
        <p style={{ color:'var(--text-secondary)',fontSize:15,marginBottom:40 }}>Data & Devices</p>
        <div style={{ position:'absolute',bottom:60,display:'flex',gap:6 }}>
          {[0,1,2].map(i=><div key={i} style={{ width:6,height:6,borderRadius:3,background:'var(--text-secondary)',opacity:.3,animation:`pulse 1.2s ${i*0.2}s infinite` }} />)}
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
        <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 24px' }}>
          <h1 style={{ fontSize:32,fontWeight:800,color:'var(--text)',letterSpacing:-0.6,marginBottom:12 }}>Sign In</h1>
          <p style={{ color:'var(--text-secondary)',fontSize:16,marginBottom:40,textAlign:'center' }}>Access your SaukiMart account</p>
          {error && <div style={{ width:'100%',padding:'14px 16px',borderRadius:14,background:'rgba(255,59,48,.1)',border:'1px solid rgba(255,59,48,.2)',color:RED,fontSize:15,marginBottom:24 }}>{error}</div>}
          <div style={{ width:'100%',marginBottom:20 }}>
            <label style={{ fontSize:14,fontWeight:600,color:'var(--text-secondary)',marginBottom:8,display:'block' }}>Phone Number</label>
            <input value={loginPhone} onChange={e=>setLoginPhone(e.target.value.replace(/\D/g,'').slice(0,11))}
              placeholder="08012345678" inputMode="numeric"
              style={{ width:'100%',padding:'14px 16px',borderRadius:12,background:'var(--card2)',border:'1px solid var(--border)',color:'var(--text)',fontSize:16,fontWeight:600 }} />
          </div>
          <button onClick={()=>{ if(loginPhone.length===11){ setShowPin(true); } else showError('Enter 11-digit phone number'); }}
            disabled={loginPhone.length !== 11}
            style={{ width:'100%',padding:'16px',borderRadius:12,background: loginPhone.length===11 ? BLUE : 'var(--card2)',color: loginPhone.length===11 ? '#fff' : 'var(--text-secondary)',fontSize:16,fontWeight:700,transition:'all .2s',marginBottom:20 }}>
            Continue
          </button>
          <button onClick={()=>setScreen('register')} style={{ color:BLUE,fontSize:15,fontWeight:600 }}>Create Account</button>
        </div>
        <p style={{ textAlign:'center',fontSize:13,color:'var(--text-secondary)',padding:'0 24px 32px' }}>
          <a href="/privacy" style={{ color:BLUE }}>Privacy</a> · <a href="/privacy" style={{ color:BLUE }}>Terms</a>
        </p>
      </div>
    </>
  );

  /* REGISTER */
  if (screen === 'register') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',overflowY:'auto',background:'var(--bg)' }}>
        <div style={{ padding:'60px 24px 40px' }}>
          <button onClick={()=>setScreen('login')} style={{ color:BLUE,fontSize:16,fontWeight:600,marginBottom:28 }}>← Back</button>
          <h1 style={{ fontSize:28,fontWeight:800,color:'var(--text)',letterSpacing:-0.6,marginBottom:8 }}>Create Account</h1>
          <p style={{ color:'var(--text-secondary)',fontSize:16,marginBottom:32 }}>Join SaukiMart today</p>
          {error && <div style={{ padding:'12px 16px',borderRadius:12,background:'rgba(255,59,48,.1)',border:'1px solid rgba(255,59,48,.2)',color:RED,fontSize:15,marginBottom:20 }}>{error}</div>}
          {[
            { key:'firstName', label:'First Name', placeholder:'Abubakar', type:'text' },
            { key:'lastName', label:'Last Name', placeholder:'Musa', type:'text' },
            { key:'phone', label:'Phone Number (11 digits)', placeholder:'08012345678', type:'tel' },
            { key:'pin', label:'6-Digit PIN', placeholder:'••••••', type:'password' },
            { key:'confirmPin', label:'Confirm PIN', placeholder:'••••••', type:'password' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom:16 }}>
              <label style={{ fontSize:14,fontWeight:600,color:'var(--text-secondary)',marginBottom:8,display:'block' }}>{f.label}</label>
              <input
                type={f.type} value={regForm[f.key as keyof typeof regForm]} placeholder={f.placeholder}
                inputMode={f.key==='phone'||f.key==='pin'||f.key==='confirmPin'?'numeric':undefined}
                maxLength={f.key==='phone'?11:f.key==='pin'||f.key==='confirmPin'?6:undefined}
                onChange={e => {
                  const v = (f.key==='phone'||f.key==='pin'||f.key==='confirmPin') ? e.target.value.replace(/\D/g,'') : e.target.value;
                  setRegForm(prev => ({ ...prev, [f.key]: v }));
                }}
                style={{ width:'100%',padding:'14px 16px',borderRadius:12,background:'var(--card2)',border:'1px solid var(--border)',color:'var(--text)',fontSize:16,fontWeight:600 }} />
            </div>
          ))}
          {/* Terms */}
          <div style={{ display:'flex',alignItems:'flex-start',gap:12,margin:'24px 0 28px' }}>
            <button onClick={()=>setAgreed(!agreed)} style={{ width:24,height:24,borderRadius:6,border:`2px solid ${agreed?BLUE:'var(--border)'}`,background:agreed?BLUE:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1 }}>
              {agreed && <span style={{ color:'#fff',fontSize:14 }}>✓</span>}
            </button>
            <p style={{ fontSize:15,color:'var(--text-secondary)',lineHeight:1.6 }}>
              I agree to SaukiMart's{' '}
              <a href="/privacy" style={{ color:BLUE,fontWeight:600 }}>Terms</a> and{' '}
              <a href="/privacy" style={{ color:BLUE,fontWeight:600 }}>Privacy Policy</a>
            </p>
          </div>
          <button onClick={handleRegister} disabled={!agreed||loading}
            style={{ width:'100%',padding:'16px',borderRadius:12,background:agreed&&!loading?BLUE:'var(--card2)',color:agreed&&!loading?'#fff':'var(--text-secondary)',fontSize:16,fontWeight:700,transition:'all .2s',marginBottom:16 }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
          <button onClick={()=>setScreen('login')} style={{ width:'100%',color:BLUE,fontSize:15,fontWeight:600 }}>Have an account? Sign In</button>
        </div>
      </div>
    </>
  );

  /* REGISTERED SUCCESS */
  if (screen === 'registered') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:28 }}>
        <div style={{ width:80,height:80,borderRadius:40,background:'rgba(52,199,89,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48,marginBottom:28 }}>✓</div>
        <h1 style={{ fontSize:28,fontWeight:800,color:'var(--text)',textAlign:'center',marginBottom:12 }}>Welcome!</h1>
        <p style={{ color:'var(--text-secondary)',fontSize:16,textAlign:'center',marginBottom:12 }}>Your account is ready</p>
        {user?.accountNumber && (
          <div style={{ width:'100%',background:'var(--card)',borderRadius:16,padding:'20px',marginBottom:32,border:'1px solid var(--border)' }}>
            <p style={{ color:'var(--text-secondary)',fontSize:13,marginBottom:6 }}>Virtual Account</p>
            <p style={{ fontSize:20,fontWeight:700,color:'var(--text)',letterSpacing:.5,marginBottom:4 }}>{user.accountNumber}</p>
            <p style={{ color:'var(--text-secondary)',fontSize:13 }}>{user.bankName}</p>
            <p style={{ color:'var(--text-secondary)',fontSize:13,marginTop:8 }}>Transfer here to fund your wallet</p>
          </div>
        )}
        <button onClick={()=>setScreen('home')} style={{ width:'100%',padding:'16px',borderRadius:12,background:BLUE,color:'#fff',fontSize:16,fontWeight:700 }}>
          Continue
        </button>
      </div>
    </>
  );

  /* ─── MAIN HOME ─── */
  if (!user) return null;
  const getInitials = (u: User) => `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();

  const Header = () => (
    <div style={{ padding:'20px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'var(--bg)',borderBottom:'1px solid var(--border)',position:'fixed',top:0,left:0,right:0,zIndex:100,backdropFilter:'blur(10px)',backgroundImage: dark ? 'radial-gradient(ellipse at 50% 100%, rgba(0,113,227,0.05) 0%, transparent 80%)' : 'none' }}>
      <p style={{ fontSize:18,fontWeight:800,color:'var(--text)',letterSpacing:-0.3 }}>SaukiMart</p>
      <div style={{ display:'flex',alignItems:'center',gap:10 }}>
        <button onClick={()=>updatePref('theme', dark?'light':'dark')} style={{ width:40,height:40,borderRadius:12,background:'var(--card2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,border:'1px solid var(--border)',boxShadow:'0 2px 8px rgba(0,0,0,.04)',transition:'all .2s',cursor:'pointer' }}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.08)'}}
          onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,.04)'}}>
          {dark ? Icons.bell(ORANGE, 18) : Icons.sun(ORANGE, 18)}
        </button>
        <button onClick={()=>setScreen('profile')} style={{ display:'flex',alignItems:'center',boxShadow:'0 2px 8px rgba(0,0,0,.08)',borderRadius:12,transition:'all .2s',cursor:'pointer' }}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.12)';e.currentTarget.style.transform='scale(1.05)'}}
          onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,.08)';e.currentTarget.style.transform='scale(1)'}}>
          <div style={{ width:40,height:40,borderRadius:12,background:BLUE,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:13 }}>
            {getInitials(user)}
          </div>
        </button>
      </div>
    </div>
  );

  const BottomNav = ({ active }: { active: string }) => (
    <div style={{ position:'fixed',bottom:0,left:0,right:0,background:'var(--card)',borderTop:'1px solid var(--border)',display:'grid',gridTemplateColumns:'repeat(4,1fr)',paddingBottom:'env(safe-area-inset-bottom)',zIndex:50,boxShadow:'0 -8px 24px rgba(0,0,0,.12)',backdropFilter:'blur(10px)' }}>
      {[
        { id:'home', label:'Home', icon: Icons.bolt(BLUE, 24) },
        { id:'transactions', label:'Activity', icon: Icons.arrowDown(BLUE, 24) },
        { id:'deposits', label:'Wallet', icon: Icons.wallet(BLUE, 24) },
        { id:'profile', label:'Account', icon: Icons.user(BLUE, 24) },
      ].map(item => (
        <button key={item.id} onClick={()=>setScreen(item.id as typeof screen)}
          style={{ padding:'12px 0 16px',display:'flex',flexDirection:'column',alignItems:'center',gap:6,background:'none',borderTop: active===item.id ? `3px solid ${BLUE}` : 'none',paddingTop: active===item.id ? '9px' : '12px',transition:'all .2s',opacity: active===item.id ? 1 : 0.65,cursor:'pointer' }}
          onMouseEnter={e=>{e.currentTarget.style.opacity='0.9'}}
          onMouseLeave={e=>{e.currentTarget.style.opacity = active===item.id ? '1' : '0.65'}}>
          <div style={{ color: active===item.id?BLUE:'var(--text-secondary)',transition:'all .2s' }}>
            {item.icon}
          </div>
          <span style={{ fontSize:11,fontWeight: active===item.id?700:500, color: active===item.id?BLUE:'var(--text-secondary)',transition:'all .2s' }}>{item.label}</span>
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
      {toast && <div className="fade-in" style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:15,fontWeight:600,zIndex:500,whiteSpace:'nowrap' }}>{toast}</div>}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
      <div style={{ height:'100dvh',overflowY:'auto',background:'var(--bg)',paddingTop:'80px',paddingBottom:100,backgroundImage: dark ? 'radial-gradient(ellipse at 50% 0%, rgba(0,113,227,0.08) 0%, transparent 50%)' : 'none',backgroundAttachment: 'fixed' }}>
        <Header />
        
        {/* Wallet Card with Enhanced Styling */}
        <div style={{ margin:'0 auto',maxWidth:980 }}>
          <div style={{ margin:'0 16px',background:'var(--card)',borderRadius:20,padding:'28px 24px',border:'1px solid var(--border)',boxShadow:'0 8px 32px rgba(0,0,0,0.24),inset 0 1px 0 rgba(255,255,255,0.07)',backdropFilter:'blur(20px)' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20 }}>
              <div>
                <p style={{ color:'var(--text-secondary)',fontSize:13,fontWeight:600,letterSpacing:.5,marginBottom:8 }}>AVAILABLE BALANCE</p>
                <div style={{ display:'flex',alignItems:'flex-start',gap:'4px' }}>
                  <span style={{ fontSize:'28px',opacity:.7,marginTop:'4px' }}>₦</span>
                  <span style={{ fontSize:'52px',fontWeight:900,letterSpacing:-1.5,color:'var(--text)' }}>{(user.walletBalance/1).toLocaleString('en-NG',{maximumFractionDigits:0})}</span>
                </div>
              </div>
              <IconBox icon={Icons.wallet(BLUE, 28)} bg={'rgba(0,113,227,.10)'} />
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16 }}>
              <div style={{ background:'var(--bg-secondary)',borderRadius:12,padding:'14px 16px',border:'1px solid var(--border)' }}>
                <p style={{ color:'var(--text-secondary)',fontSize:12,fontWeight:600 }}>CASHBACK</p>
                <p style={{ color:GREEN,fontWeight:700,fontSize:18,marginTop:4 }}>₦{user.cashbackBalance.toLocaleString()}</p>
              </div>
              <div style={{ background:'var(--bg-secondary)',borderRadius:12,padding:'14px 16px',border:'1px solid var(--border)' }}>
                <p style={{ color:'var(--text-secondary)',fontSize:12,fontWeight:600 }}>REFERRAL BONUS</p>
                <p style={{ color:PURPLE,fontWeight:700,fontSize:18,marginTop:4 }}>₦{user.referralBonus.toLocaleString()}</p>
              </div>
            </div>
            {user.accountNumber && (
              <div style={{ background:'var(--bg-secondary)',borderRadius:14,padding:'12px 16px',border:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                <div>
                  <p style={{ color:'var(--text-secondary)',fontSize:12 }}>{user.bankName}</p>
                  <p style={{ color:'var(--text)',fontWeight:700,fontSize:15,letterSpacing:.3,marginTop:2 }}>{user.accountNumber}</p>
                </div>
                <button onClick={()=>{ navigator.clipboard.writeText(user.accountNumber); showToast('Copied'); }}
                  style={{ background:BLUE,color:'#fff',fontSize:12,fontWeight:600,padding:'6px 14px',borderRadius:8 }}>Copy</button>
              </div>
            )}
          </div>
        </div>

        {/* Broadcast Ticker */}
        {broadcasts.length > 0 && (
          <div style={{ margin:'20px 16px 0',background:'var(--bg-secondary)',borderRadius:14,padding:'12px 16px',overflow:'hidden',border:'1px solid var(--border)' }}>
            <div style={{ display:'flex',gap:40,whiteSpace:'nowrap',animation:'tick 30s linear infinite' }}>
              {[...broadcasts,...broadcasts].map((b,i)=>(
                <span key={i} style={{ fontSize:13,color:'var(--text)',fontWeight:500 }}>{b}</span>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ margin:'24px 16px 0' }}>
          <p style={{ fontSize:13,fontWeight:700,color:'var(--text-secondary)',letterSpacing:.5,marginBottom:14,marginLeft:4,textTransform:'uppercase' }}>Quick Actions</p>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <button onClick={()=>setScreen('data-networks')}
              style={{ background:'var(--card)',borderRadius:16,padding:'20px 16px',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:12,border:'1px solid var(--border)',boxShadow:'0 4px 16px rgba(0,0,0,.08)',transition:'all .3s',cursor:'pointer' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.12)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'}}>
              <IconBox icon={Icons.bolt(BLUE, 24)} bg={'rgba(0,113,227,.10)'} />
              <div style={{ textAlign:'left' }}>
                <p style={{ fontWeight:700,fontSize:15,color:'var(--text)' }}>Buy Data</p>
                <p style={{ fontSize:13,color:'var(--text-secondary)',marginTop:2 }}>MTN, Airtel, Glo</p>
              </div>
            </button>
            <button onClick={()=>{ loadProducts(); setScreen('store'); }}
              style={{ background:'var(--card)',borderRadius:16,padding:'20px 16px',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:12,border:'1px solid var(--border)',boxShadow:'0 4px 16px rgba(0,0,0,.08)',transition:'all .3s',cursor:'pointer' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.12)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'}}>
              <IconBox icon={Icons.chartBar(GREEN, 24)} bg={'rgba(48,209,88,.10)'} />
              <div style={{ textAlign:'left' }}>
                <p style={{ fontWeight:700,fontSize:15,color:'var(--text)' }}>Store</p>
                <p style={{ fontSize:13,color:'var(--text-secondary)',marginTop:2 }}>Devices & Accessories</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ margin:'28px 16px 0' }}>
          <p style={{ fontSize:13,fontWeight:700,color:'var(--text-secondary)',letterSpacing:.5,marginBottom:14,marginLeft:4,textTransform:'uppercase' }}>Recent Activity</p>
          {transactions.length === 0 ? (
            <div style={{ textAlign:'center',padding:'48px 20px',background:'var(--card)',borderRadius:16,border:'1px dashed var(--border)' }}>
              <div style={{ fontSize:40,marginBottom:12 }}>∿</div>
              <p style={{ fontWeight:700,fontSize:15,color:'var(--text)',marginBottom:6 }}>No activity yet</p>
              <p style={{ color:'var(--text-secondary)',fontSize:13,lineHeight:1.5 }}>Buy data or shop to see transactions here</p>
            </div>
          ) : (
            <div style={{ background:'var(--card)',borderRadius:16,overflow:'hidden',border:'1px solid var(--border)',boxShadow:'0 4px 16px rgba(0,0,0,.08)' }}>
              {transactions.slice(0,10).map((tx,i) => {
                const isDeposit = tx.type === 'deposit';
                const color = isDeposit ? GREEN : RED;
                const icon = tx.type === 'data' ? Icons.arrowDown(color, 18) : tx.type === 'product' ? Icons.download(color, 18) : Icons.arrowUp(color, 18);
                const bgColor = tx.type === 'data' ? 'rgba(0,113,227,.08)' : isDeposit ? 'rgba(48,209,88,.08)' : 'rgba(255,59,48,.08)';
                return (
                  <div key={tx.id} style={{ display:'flex',alignItems:'center',gap:14,padding:'16px 16px',borderBottom: i<Math.min(transactions.length,10)-1?'1px solid var(--border)':undefined }}>
                    <IconBox icon={icon} bg={bgColor} />
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontWeight:600,fontSize:14,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{tx.description}</p>
                      <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:3 }}>{new Date(tx.createdAt).toLocaleString('en-NG',{dateStyle:'short',timeStyle:'short'})}</p>
                    </div>
                    <div style={{ textAlign:'right',flexShrink:0 }}>
                      <p style={{ fontWeight:700,fontSize:15,color: tx.type==='deposit'||tx.type==='cashback'?GREEN:RED }}>{tx.type==='deposit'||tx.type==='cashback'?'+':'-'}₦{Number(tx.amount).toLocaleString()}</p>
                      <StatusPill label={tx.status} type={tx.status === 'success' ? 'success' : tx.status === 'pending' ? 'pending' : 'failed'} />
                    </div>
                  </div>
                );
              })}
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
        <div style={{ padding:'60px 20px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border)' }}>
          <button onClick={()=>setScreen('home')} style={{ color:BLUE,fontSize:16,fontWeight:600 }}>← Back</button>
          <h2 style={{ fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5 }}>Select Network</h2>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'16px 16px 40px' }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:12 }}>
            {NETWORKS.map(net => {
              const colors = { MTN: { bg: 'rgba(255,159,10,.10)', color: ORANGE }, GLO: { bg: 'rgba(191,90,242,.10)', color: PURPLE }, AIRTEL: { bg: 'rgba(0,113,227,.10)', color: BLUE }, '9MOBILE': { bg: 'rgba(92,200,250,.10)', color: TEAL } };
              const c = colors[net.name as keyof typeof colors] || { bg: 'rgba(0,113,227,.10)', color: BLUE };
              return (
                <button key={net.name} onClick={()=>{ setSelectedNetwork(net); loadPlans(net.name); setScreen('data-plans'); }}
                  style={{ background:'var(--card)',borderRadius:16,padding:'28px 16px',display:'flex',flexDirection:'column',alignItems:'center',gap:14,border:'1px solid var(--border)',boxShadow:'0 4px 16px rgba(0,0,0,.08)',transition:'all .3s',cursor:'pointer' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.12)'}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'}}>
                  <div style={{ width:64,height:64,borderRadius:14,background:c.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:700,color:c.color }}>
                    {net.name.substring(0,2)}
                  </div>
                  <p style={{ fontWeight:700,fontSize:16,color:'var(--text)',marginTop:4 }}>{net.name}</p>
                </button>
              );
            })}
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
        <div style={{ padding:'60px 20px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border)' }}>
          <button onClick={()=>setScreen('data-networks')} style={{ color:BLUE,fontSize:16,fontWeight:600 }}>← Back</button>
          <h2 style={{ fontSize:18,fontWeight:800,color:'var(--text)' }}>{selectedNetwork?.name} Data</h2>
        </div>
        {/* Phone input */}
        <div style={{ padding:'16px 16px 12px' }}>
          <input value={buyPhone} onChange={e=>setBuyPhone(e.target.value.replace(/\D/g,'').slice(0,11))}
            placeholder="Enter phone number" inputMode="numeric"
            style={{ width:'100%',padding:'12px 16px',borderRadius:12,background:'var(--card)',border:'1px solid var(--border)',color:'var(--text)',fontSize:16,fontWeight:600 }} />
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'0 16px 40px' }}>
          {plans.length === 0 ? (
            <p style={{ textAlign:'center',color:'var(--text-secondary)',padding:40 }}>No plans available</p>
          ) : (
            <div style={{ display:'grid',gap:10,marginTop:12 }}>
              {plans.map(plan => (
                <button key={plan.id} onClick={()=>{ if(buyPhone.length!==11){showError('Enter 11-digit phone number');return;} setSelectedPlan(plan); setPinAction('buy-data'); setShowPin(true); }}
                  style={{ background:'var(--card)',borderRadius:14,padding:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',border:'1px solid var(--border)',width:'100%' }}>
                  <div style={{ textAlign:'left' }}>
                    <p style={{ fontWeight:700,fontSize:16,color:'var(--text)' }}>{plan.dataSize}</p>
                    <p style={{ color:'var(--text-secondary)',fontSize:13,marginTop:2 }}>{plan.validity}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:18,fontWeight:800,color:BLUE }}>₦{plan.price.toLocaleString()}</p>
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
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
      {receipt && <Receipt data={receipt} onDownload={()=>{}} onClose={()=>{ setReceipt(null); setScreen('home'); }} dark={dark} />}
    </>
  );

  /* STORE */
  if (screen === 'store') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',background:'var(--bg)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'60px 20px 16px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border)' }}>
          <button onClick={()=>setScreen('home')} style={{ color:BLUE,fontSize:16,fontWeight:600 }}>← Back</button>
          <h2 style={{ fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5 }}>Store</h2>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'16px 16px 40px' }}>
          {products.length === 0 ? (
            <div style={{ textAlign:'center',padding:'60px 20px' }}>
              <IconBox icon={Icons.download(BLUE, 44)} bg={'rgba(0,113,227,.10)'} />
              <p style={{ fontSize:16,fontWeight:700,color:'var(--text)',marginTop:16,marginBottom:8 }}>Coming Soon</p>
              <p style={{ color:'var(--text-secondary)',marginTop:8 }}>Amazing products are being added</p>
            </div>
          ) : (
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginTop:12 }}>
              {products.map(p => (
                <button key={p.id} onClick={()=>{ setSelectedProduct(p); setScreen('product'); }}
                  style={{ background:'var(--card)',borderRadius:16,overflow:'hidden',textAlign:'left',border:'1px solid var(--border)',boxShadow:'0 4px 16px rgba(0,0,0,.08)',transition:'all .3s',cursor:'pointer' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.12)'}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'}}>
                  <div style={{ height:160,background:'var(--bg-secondary)',position:'relative',overflow:'hidden' }}>
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : p.imageBase64 ? <img src={`data:image/jpeg;base64,${p.imageBase64}`} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : <div style={{ height:'100%',background:'var(--border)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                      {Icons.download(BLUE, 32)}
                    </div>}
                    {!p.inStock && <div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(2px)' }}>
                      <div style={{ background:'rgba(255,59,48,.95)',borderRadius:8,padding:'6px 12px' }}>
                        <p style={{ color:'#fff',fontWeight:700,fontSize:12 }}>Out of Stock</p>
                      </div>
                    </div>}
                  </div>
                  <div style={{ padding:'14px' }}>
                    <p style={{ fontWeight:700,fontSize:14,color:'var(--text)',lineHeight:1.4,marginBottom:8,minHeight:'2.8em' }}>{p.name}</p>
                    <div style={{ display:'flex',alignItems:'baseline',gap:2 }}>
                      <span style={{ fontSize:'24px',fontWeight:900,color:BLUE,lineHeight:1 }}>₦</span>
                      <span style={{ fontWeight:800,fontSize:18,color:'var(--text)' }}>{(Number(p.price)/1).toLocaleString('en-NG',{maximumFractionDigits:0})}</span>
                    </div>
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
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
      {toast && <div className="fade-in" style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:15,fontWeight:600,zIndex:500 }}>{toast}</div>}
    </>
  );

  /* PRODUCT DETAIL */
  if (screen === 'product' && selectedProduct) return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',background:'var(--bg)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'60px 20px 16px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border)' }}>
          <button onClick={()=>setScreen('store')} style={{ color:BLUE,fontSize:16,fontWeight:600 }}>← Back</button>
        </div>
        <div style={{ flex:1,overflowY:'auto',paddingBottom:100 }}>
          <div style={{ height:280,background:'var(--bg-secondary)',overflow:'hidden' }}>
            {selectedProduct.imageUrl ? <img src={selectedProduct.imageUrl} alt={selectedProduct.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : selectedProduct.imageBase64 ? <img src={`data:image/jpeg;base64,${selectedProduct.imageBase64}`} alt={selectedProduct.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : <div style={{ height:'100%',background:'var(--border)' }} />}
          </div>
          <div style={{ padding:'20px 20px 0' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
              <h1 style={{ fontSize:22,fontWeight:800,color:'var(--text)',flex:1,paddingRight:12 }}>{selectedProduct.name}</h1>
              <p style={{ fontSize:24,fontWeight:800,color:BLUE,whiteSpace:'nowrap' }}>₦{Number(selectedProduct.price).toLocaleString()}</p>
            </div>
            <div style={{ background:selectedProduct.inStock?'rgba(52,199,89,.1)':'rgba(255,59,48,.1)',borderRadius:12,padding:'6px 12px',marginBottom:20,display:'inline-block' }}>
              <p style={{ color:selectedProduct.inStock?GREEN:RED,fontSize:13,fontWeight:600 }}>{selectedProduct.inStock?'Available':'Out of Stock'}</p>
            </div>
            {selectedProduct.description && <p style={{ fontSize:15,color:'var(--text-secondary)',lineHeight:1.7,marginBottom:20 }}>{selectedProduct.description}</p>}
            {selectedProduct.shippingTerms && (
              <div style={{ background:'var(--card)',borderRadius:12,padding:'14px 16px',marginBottom:12,border:'1px solid var(--border)' }}>
                <p style={{ fontWeight:700,fontSize:14,color:'var(--text)',marginBottom:6 }}>Shipping</p>
                <p style={{ fontSize:14,color:'var(--text-secondary)',lineHeight:1.6 }}>{selectedProduct.shippingTerms}</p>
              </div>
            )}
            {selectedProduct.pickupTerms && (
              <div style={{ background:'var(--card)',borderRadius:12,padding:'14px 16px',border:'1px solid var(--border)' }}>
                <p style={{ fontWeight:700,fontSize:14,color:'var(--text)',marginBottom:6 }}>Pickup</p>
                <p style={{ fontSize:14,color:'var(--text-secondary)',lineHeight:1.6 }}>{selectedProduct.pickupTerms}</p>
              </div>
            )}
          </div>
        </div>
        {selectedProduct.inStock && (
          <div style={{ position:'fixed',bottom:0,left:0,right:0,padding:'16px 20px',background:'var(--card)',borderTop:'1px solid var(--border)' }}>
            <button onClick={()=>{ setPinAction('buy-product'); setShowPin(true); }}
              style={{ width:'100%',padding:'16px',borderRadius:12,background:BLUE,color:'#fff',fontSize:16,fontWeight:700 }}>
              Buy for ₦{Number(selectedProduct.price).toLocaleString()}
            </button>
          </div>
        )}
      </div>
      {showPin && <PinKeyboard title={`Pay ₦${Number(selectedProduct.price).toLocaleString()}`} subtitle={selectedProduct.name} onComplete={handlePinComplete} onClose={()=>setShowPin(false)} />}
      {receipt && <Receipt data={receipt} onDownload={()=>{}} onClose={()=>{ setReceipt(null); setScreen('home'); }} dark={dark} />}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
    </>
  );

  /* TRANSACTIONS */
  if (screen === 'transactions') return (
    <>
      <GlobalStyle dark={dark} />
      {receipt && <Receipt data={receipt} onDownload={()=>{}} onClose={()=>setReceipt(null)} autoDownload={true} dark={dark} />}
      <div style={{ height:'100dvh',background:'var(--bg)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'60px 20px 16px',borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5 }}>Activity</h2>
          <p style={{ color:'var(--text-secondary)',fontSize:14,marginTop:6 }}>Your transaction history</p>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'16px 16px 20px' }}>
          {transactions.length === 0 ? (
            <div style={{ textAlign:'center',padding:60 }}>
              <div style={{ fontSize:48,marginBottom:16 }}>∿</div>
              <p style={{ fontSize:16,fontWeight:700,color:'var(--text)' }}>No activity</p>
              <p style={{ fontSize:13,color:'var(--text-secondary)',marginTop:8 }}>Your transactions will appear here</p>
            </div>
          ) : (
            <div style={{ display:'grid',gap:10 }}>
              {transactions.map(tx => {
                const isDeposit = tx.type === 'deposit';
                const isData = tx.type === 'data';
                const color = isDeposit ? GREEN : tx.type === 'cashback' ? PURPLE : RED;
                const icon = isData ? Icons.arrowDown(color, 20) : tx.type === 'product' ? Icons.download(color, 20) : Icons.arrowUp(color, 20);
                const bgColor = isData ? 'rgba(0,113,227,.08)' : isDeposit ? 'rgba(48,209,88,.08)' : 'rgba(255,59,48,.08)';
                return (
                  <button key={tx.id} onClick={()=>{ if(tx.receiptData) { setReceipt(tx.receiptData as Record<string,unknown>); } }}
                    style={{ background:'var(--card)',borderRadius:14,padding:'16px 16px',display:'flex',alignItems:'center',gap:14,border:'1px solid var(--border)',width:'100%',boxShadow:'0 2px 8px rgba(0,0,0,.04)',transition:'all .2s',cursor:'pointer' }}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.08)';e.currentTarget.style.transform='translateY(-1px)'}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,.04)';e.currentTarget.style.transform='translateY(0)'}}>
                    <IconBox icon={icon} bg={bgColor} />
                    <div style={{ flex:1,textAlign:'left' }}>
                      <p style={{ fontWeight:600,fontSize:15,color:'var(--text)' }}>{tx.description}</p>
                      <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:4 }}>{new Date(tx.createdAt).toLocaleString('en-NG',{dateStyle:'medium',timeStyle:'short'})}</p>
                    </div>
                    <div style={{ textAlign:'right',flexShrink:0 }}>
                      <p style={{ fontWeight:700,fontSize:15,color: isDeposit?GREEN:RED }}>{isDeposit?'+':'-'}₦{Number(tx.amount).toLocaleString()}</p>
                      <StatusPill label={tx.status} type={tx.status === 'success' ? 'success' : tx.status === 'pending' ? 'pending' : 'failed'} />
                    </div>
                  </button>
                );
              })}
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
        <div style={{ padding:'60px 20px 16px',borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5 }}>Wallet</h2>
          <p style={{ color:'var(--text-secondary)',fontSize:14,marginTop:6 }}>Your deposits and credits</p>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'16px 16px 20px' }}>
          {deposits.length === 0 ? (
            <div style={{ textAlign:'center',padding:60 }}>
              <IconBox icon={Icons.arrowDown(GREEN, 44)} bg={'rgba(48,209,88,.10)'} />
              <p style={{ fontSize:16,fontWeight:700,color:'var(--text)',marginTop:16,marginBottom:8 }}>No deposits yet</p>
              <p style={{ color:'var(--text-secondary)',fontSize:13,lineHeight:1.6 }}>Transfer to your virtual account {user.accountNumber && `(${user.accountNumber})`} to fund your wallet</p>
            </div>
          ) : (
            <div style={{ display:'grid',gap:10 }}>
              {deposits.map(dep => (
                <div key={dep.id} style={{ background:'var(--card)',borderRadius:14,padding:'16px 16px',display:'flex',alignItems:'center',gap:14,border:'1px solid var(--border)',boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
                  <IconBox icon={Icons.banknotes(GREEN, 20)} bg={'rgba(48,209,88,.10)'} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:600,fontSize:15,color:'var(--text)' }}>{dep.senderName || 'Bank Transfer'}</p>
                    <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:2 }}>{dep.narration || 'Wallet funding'}</p>
                    <p style={{ fontSize:11,color:'var(--text-secondary)',marginTop:3 }}>{new Date(dep.createdAt).toLocaleString('en-NG',{dateStyle:'medium',timeStyle:'short'})}</p>
                  </div>
                  <div style={{ textAlign:'right',flexShrink:0 }}>
                    <p style={{ fontWeight:700,fontSize:15,color:GREEN }}>+₦{Number(dep.amount).toLocaleString()}</p>
                    <StatusPill label="Completed" type="success" />
                  </div>
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
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
      {toast && <div className="fade-in" style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:15,fontWeight:600,zIndex:500 }}>{toast}</div>}
      <div style={{ height:'100dvh',background:'var(--bg)',overflowY:'auto',paddingBottom:40 }}>
        <div style={{ padding:'60px 20px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border)' }}>
          <button onClick={()=>setScreen('home')} style={{ color:BLUE,fontSize:16,fontWeight:600 }}>← Back</button>
          <h2 style={{ fontSize:26,fontWeight:800,color:'var(--text)',letterSpacing:-0.5 }}>SIM Activation</h2>
        </div>
        {/* Info Banner */}
        <div style={{ margin:'16px',background:'var(--card)',borderRadius:16,padding:'24px',border:'1px solid var(--border)',boxShadow:'0 4px 16px rgba(0,0,0,.08)' }}>
          <div style={{ display:'flex',gap:12,alignItems:'flex-start' }}>
            <IconBox icon={Icons.creditCard(TEAL, 24)} bg={'rgba(92,200,250,.10)'} />
            <div>
              <p style={{ color:'var(--text)',fontSize:15,fontWeight:700,marginBottom:8 }}>Airtel Data SIM</p>
              <p style={{ color:'var(--text-secondary)',fontSize:14,lineHeight:1.7 }}>Buy an Airtel data SIM and send us the serial number. We'll activate 30GB monthly data plan for ₦5,000 in under 1 hour.</p>
            </div>
          </div>
        </div>
        
        {/* Status */}
        {simActivations.length > 0 && (
          <div style={{ margin:'16px 16px 16px' }}>
            <p style={{ fontSize:13,fontWeight:700,color:'var(--text-secondary)',marginBottom:12,marginLeft:4,textTransform:'uppercase' }}>Your Requests</p>
            {simActivations.map(act => (
              <div key={act.id} style={{ background:'var(--card)',borderRadius:14,padding:'16px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,border:'1px solid var(--border)',boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14,fontWeight:600,color:'var(--text)' }}>{act.serialNumber || 'SIM Activation'}</p>
                  <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:3 }}>{new Date(act.createdAt).toLocaleDateString('en-NG',{dateStyle:'medium'})}</p>
                </div>
                <StatusPill label={act.status==='activated'?'Activated':'Pending'} type={act.status==='activated'?'success':'pending'} />
              </div>
            ))}
          </div>
        )}
        
        {/* Form */}
        <div style={{ padding:'0 16px 20px' }}>
          <p style={{ fontSize:13,fontWeight:700,color:'var(--text-secondary)',marginBottom:12,marginLeft:4,textTransform:'uppercase' }}>New Request</p>
          <input value={simSerial} onChange={e=>setSimSerial(e.target.value)}
            placeholder="Enter SIM serial number"
            style={{ width:'100%',padding:'14px 16px',borderRadius:12,background:'var(--card)',border:'1px solid var(--border)',color:'var(--text)',fontSize:15,marginBottom:14,fontWeight:600 }} />
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14 }}>
            {[
              { label:'SIM Front', value:simFront, setter:setSimFront },
              { label:'SIM Back', value:simBack, setter:setSimBack },
            ].map(({ label, value, setter }) => (
              <label key={label} style={{ background:'var(--card)',borderRadius:12,border:`2px dashed ${value?BLUE:'var(--border)'}`,overflow:'hidden',cursor:'pointer',display:'block' }}>
                <input type="file" accept="image/*" style={{ display:'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) { const r = new FileReader(); r.onload=ev=>setter(ev.target?.result as string); r.readAsDataURL(file); }
                  }} />
                {value ? <img src={value} alt={label} style={{ width:'100%',height:100,objectFit:'cover' }} /> : (
                  <div style={{ height:100,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4 }}>
                    <span style={{ fontSize:24 }}>∿</span>
                    <p style={{ fontSize:12,color:'var(--text-secondary)',fontWeight:600,textAlign:'center',padding:'0 8px' }}>{label}</p>
                  </div>
                )}
              </label>
            ))}
          </div>
          <div style={{ background:'var(--card)',borderRadius:12,padding:'14px 16px',marginBottom:16,border:'1px solid var(--border)' }}>
            <p style={{ fontWeight:700,fontSize:15,color:'var(--text)' }}>₦5,000</p>
            <p style={{ fontSize:13,color:'var(--text-secondary)',marginTop:4 }}>30GB monthly data · Activated in under 1 hour</p>
          </div>
          <button onClick={()=>{ if(!simSerial && !simFront){ showError('Enter serial number or upload SIM photo'); return; } setPinAction('sim-pay'); setShowPin(true); }}
            style={{ width:'100%',padding:'16px',borderRadius:12,background:BLUE,color:'#fff',fontSize:16,fontWeight:700 }}>
            Pay ₦5,000
          </button>
        </div>
      </div>
    </>
  );

  /* PROFILE */
  if (screen === 'profile') return (
    <>
      <GlobalStyle dark={dark} />
      {showPin && <PinKeyboard title="Confirm with PIN" onComplete={(pin)=>{ setShowPin(false); handleChangePin(pin); }} onClose={()=>setShowPin(false)} />}
      {toast && <div className="fade-in" style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:15,fontWeight:600,zIndex:500 }}>{toast}</div>}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
      <div style={{ height:'100dvh',background:'var(--bg)',overflowY:'auto',paddingBottom:100 }}>
        <div style={{ padding:'60px 20px 24px' }}>
          {/* Avatar Section */}
          <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:32,paddingBottom:20,borderBottom:'1px solid var(--border)' }}>
            <div style={{ width:68,height:68,borderRadius:16,background:BLUE,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:20 }}>{getInitials(user)}</div>
            <div>
              <p style={{ fontSize:18,fontWeight:700,color:'var(--text)' }}>{user.firstName} {user.lastName}</p>
              <p style={{ color:'var(--text-secondary)',fontSize:14,marginTop:2 }}>{user.phone}</p>
              <p style={{ color:'var(--text-secondary)',fontSize:13,marginTop:2 }}>Joined {new Date(user.createdAt).toLocaleDateString('en-NG',{month:'short',year:'numeric'})}</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div style={{ padding:'0 16px' }}>
          <SettingsGroup title="Display">
            <SettingsRow icon={Icons.bell(BLUE, 20)} label="Theme" right={
              <button onClick={()=>updatePref('theme', dark?'light':'dark')}
                style={{ background:dark?BLUE:'var(--bg-secondary)',borderRadius:16,padding:'6px 14px',color:dark?'#fff':'var(--text)',fontSize:13,fontWeight:600,border:'1px solid var(--border)' }}>
                {dark?'Dark':'Light'}
              </button>
            } />
          </SettingsGroup>

          <SettingsGroup title="Preferences">
            <SettingsRow icon={Icons.bell(ORANGE, 20)} label="Notifications" right={
              <Toggle value={user.notificationsEnabled} onChange={v=>updatePref('notificationsEnabled', v)} />
            } />
            <SettingsRow icon={Icons.bolt(BLUE, 20)} label="Haptics" right={
              <Toggle value={user.hapticsEnabled} onChange={v=>updatePref('hapticsEnabled', v)} />
            } />
          </SettingsGroup>

          <SettingsGroup title="Security">
            <SettingsRow icon={Icons.lock(RED, 20)} label="Change PIN" onPress={()=>setScreen('change-pin')} />
          </SettingsGroup>

          <SettingsGroup title="Support">
            <SettingsRow icon={Icons.info(BLUE, 20)} label="Help & Support" onPress={()=>{ loadChats(); setScreen('chat'); }} />
            <SettingsRow icon={Icons.globe(PURPLE, 20)} label="About" onPress={()=>setScreen('about')} />
            <SettingsRow icon={Icons.phone(TEAL, 20)} label="Call: +234 704 464 7081" right={
              <div style={{ display:'flex',gap:8 }}>
                <a href="tel:+2347044647081" style={{ background:'rgba(0,113,227,.1)',borderRadius:8,padding:'4px 10px',color:BLUE,fontSize:12,fontWeight:600 }}>Call</a>
              </div>
            } />
            <SettingsRow icon={Icons.phone(TEAL, 20)} label="Call: +234 806 193 4056" right={
              <div style={{ display:'flex',gap:8 }}>
                <a href="tel:+2348061934056" style={{ background:'rgba(0,113,227,.1)',borderRadius:8,padding:'4px 10px',color:BLUE,fontSize:12,fontWeight:600 }}>Call</a>
              </div>
            } />
            <SettingsRow icon={Icons.mail(BLUE, 20)} label="Email: support@saukimart.online" right={
              <a href="mailto:support@saukimart.online" style={{ background:'rgba(0,113,227,.1)',borderRadius:8,padding:'4px 10px',color:BLUE,fontSize:12,fontWeight:600 }}>Email</a>
            } />
          </SettingsGroup>

          <button onClick={signOut} style={{ width:'100%',padding:'16px',borderRadius:12,background:'rgba(255,59,48,.08)',border:'1px solid rgba(255,59,48,.15)',color:RED,fontSize:16,fontWeight:700,marginTop:8,marginBottom:24 }}>
            Sign Out
          </button>

          <p style={{ textAlign:'center',fontSize:18,fontWeight:700,color:'var(--text)',letterSpacing:-0.4,marginBottom:4 }}>SaukiMart</p>
          <p style={{ textAlign:'center',fontSize:13,color:'var(--text-secondary)',marginBottom:32 }}>v1.0.0 · Data & Devices</p>
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
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
      <div style={{ height:'100dvh',background:'var(--bg)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'60px 20px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border)' }}>
          <button onClick={()=>setScreen('profile')} style={{ color:BLUE,fontSize:16,fontWeight:600 }}>← Back</button>
          <h2 style={{ fontSize:18,fontWeight:800,color:'var(--text)' }}>Change PIN</h2>
        </div>
        <div style={{ padding:'0 24px',flex:1,display:'flex',flexDirection:'column',justifyContent:'center' }}>
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:14,fontWeight:600,color:'var(--text-secondary)',marginBottom:8,display:'block' }}>New PIN (6 digits)</label>
            <input type="password" inputMode="numeric" maxLength={6} value={newPin} onChange={e=>setNewPin(e.target.value.replace(/\D/g,'').slice(0,6))}
              placeholder="••••••" style={{ width:'100%',padding:'14px 16px',borderRadius:12,background:'var(--card)',border:'1px solid var(--border)',color:'var(--text)',fontSize:20,letterSpacing:6,textAlign:'center' }} />
          </div>
          <div style={{ marginBottom:32 }}>
            <label style={{ fontSize:14,fontWeight:600,color:'var(--text-secondary)',marginBottom:8,display:'block' }}>Confirm PIN</label>
            <input type="password" inputMode="numeric" maxLength={6} value={confirmNewPin} onChange={e=>setConfirmNewPin(e.target.value.replace(/\D/g,'').slice(0,6))}
              placeholder="••••••" style={{ width:'100%',padding:'14px 16px',borderRadius:12,background:'var(--card)',border:'1px solid var(--border)',color:'var(--text)',fontSize:20,letterSpacing:6,textAlign:'center' }} />
          </div>
          <button onClick={()=>{ if(newPin.length===6&&newPin===confirmNewPin){ setShowPin(true); } else showError('PINs must match'); }}
            disabled={newPin.length!==6||newPin!==confirmNewPin}
            style={{ width:'100%',padding:'16px',borderRadius:12,background:newPin.length===6&&newPin===confirmNewPin?BLUE:'var(--bg-secondary)',color:newPin.length===6&&newPin===confirmNewPin?'#fff':'var(--text-secondary)',fontSize:16,fontWeight:700 }}>
            Update PIN
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
            <p style={{ fontSize:16,fontWeight:700,color:'var(--text)' }}>Support</p>
            <p style={{ fontSize:12,color:GREEN,marginTop:3,fontWeight:600 }}>● Online now</p>
          </div>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:12 }}>
          {chats.length === 0 && (
            <div style={{ textAlign:'center',padding:'40px 20px',color:'var(--text-secondary)' }}>
              <IconBox icon={Icons.mail(BLUE, 40)} bg={'rgba(0,113,227,.10)'} />
              <p style={{ fontSize:15,fontWeight:700,color:'var(--text)',marginTop:12 }}>No messages yet</p>
              <p style={{ fontSize:13,marginTop:4 }}>Send a message and we'll help you right away</p>
            </div>
          )}
          {chats.map(msg => (
            <div key={msg.id} style={{ display:'flex',justifyContent: msg.sender==='user'?'flex-end':'flex-start' }}>
              <div style={{ maxWidth:'80%',padding:'14px 16px',borderRadius: msg.sender==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px', background: msg.sender==='user'?BLUE:'var(--card)',color: msg.sender==='user'?'#fff':'var(--text)',fontSize:15,lineHeight:1.5,border: msg.sender!=='user'?'1px solid var(--border)':undefined,boxShadow: msg.sender!=='user'?'0 2px 8px rgba(0,0,0,.04)':undefined }}>
                {msg.message}
                <p style={{ fontSize:12,opacity:.65,marginTop:6,textAlign:'right',fontWeight:500 }}>{new Date(msg.createdAt).toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'})}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:'12px 16px',borderTop:'1px solid var(--border)',display:'flex',gap:10,background:'var(--card)' }}>
          <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter') sendChat(); }}
            placeholder="Type message…"
            style={{ flex:1,padding:'12px 16px',borderRadius:20,background:'var(--bg-secondary)',border:'1px solid var(--border)',color:'var(--text)',fontSize:15 }} />
          <button onClick={sendChat} style={{ width:44,height:44,borderRadius:22,background:BLUE,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#fff',fontSize:18,fontWeight:600,boxShadow:'0 4px 12px rgba(0,113,227,.3)',transition:'all .2s' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.05)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)'}}>→</button>
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
          <button onClick={()=>setScreen('profile')} style={{ color:BLUE,fontSize:16,fontWeight:600,marginBottom:32 }}>← Back</button>
          <div style={{ textAlign:'center',marginBottom:40 }}>
            <p style={{ fontSize:32,fontWeight:800,color:'var(--text)',letterSpacing:-0.8 }}>SaukiMart</p>
            <p style={{ color:'var(--text-secondary)',fontSize:15,marginTop:8 }}>Data & Devices · v1.0.0</p>
          </div>
          {[
            { icon: Icons.mapPin(BLUE, 24), title: 'Our Mission', body: 'Making data affordable for every Nigerian — instantly, reliably, at the best prices.' },
            { icon: Icons.shieldCheck(GREEN, 24), title: 'Security', body: 'All transactions encrypted. Payments processed securely through Flutterwave PCI-DSS compliance.' },
            { icon: Icons.phone(TEAL, 24), title: 'Contact', body: 'support@saukimart.online\n+234 704 464 7081\n+234 806 193 4056' },
            { icon: Icons.info(PURPLE, 24), title: 'Legal', body: 'SMEDAN Certified · By using this app you agree to our Terms of Service and Privacy Policy.' },
          ].map(({ icon, title, body }) => (
            <div key={title as string} style={{ background:'var(--card)',borderRadius:16,padding:'20px',marginBottom:14,border:'1px solid var(--border)',boxShadow:'0 4px 16px rgba(0,0,0,.08)' }}>
              <div style={{ display:'flex',gap:12,alignItems:'flex-start' }}>
                <IconBox icon={icon} bg={undefined} />
                <div style={{ textAlign:'left',flex:1 }}>
                  <p style={{ fontWeight:700,fontSize:15,color:'var(--text)',marginBottom:8 }}>{title as string}</p>
                  <p style={{ color:'var(--text-secondary)',fontSize:14,lineHeight:1.7,whiteSpace:'pre-line' }}>{body as string}</p>
                </div>
              </div>
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
      <p style={{ fontSize:12,fontWeight:700,color:'var(--text-secondary)',letterSpacing:.4,marginBottom:10,marginLeft:4,textTransform:'uppercase' }}>{title}</p>
      <div style={{ background:'var(--card)',borderRadius:12,overflow:'hidden',border:'1px solid var(--border)' }}>
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ icon, label, onPress, right }: { icon: string | React.ReactNode; label: string; onPress?: ()=>void; right?: React.ReactNode; }) {
  return (
    <button onClick={onPress} style={{ width:'100%',display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderBottom:'1px solid var(--border)',background:'none',textAlign:'left',cursor:onPress?'pointer':'default' }}>
      <div style={{ fontSize:18,width:24,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center' }}>{icon}</div>
      <span style={{ flex:1,fontSize:15,fontWeight:500,color:'var(--text)' }}>{label}</span>
      {right || (onPress && <span style={{ color:'var(--text-secondary)',fontSize:18 }}>›</span>)}
    </button>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={()=>onChange(!value)} style={{ width:50,height:30,borderRadius:15,background:value?GREEN:'#E9E9EA',padding:'3px',display:'flex',alignItems:'center',transition:'background .25s',border:'none',cursor:'pointer' }}>
      <div style={{ width:24,height:24,borderRadius:12,background:'#fff',boxShadow:'0 2px 4px rgba(0,0,0,.15)',transform:`translateX(${value?20:0}px)`,transition:'transform .25s' }} />
    </button>
  );
}
