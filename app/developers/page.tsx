'use client';
/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef, useCallback } from 'react';

/* ─── TYPES ─── */
type DevUser = {
  id: string; firstName: string; lastName: string; phone: string;
  walletBalance: number; accountNumber: string; bankName: string;
  isDeveloper: boolean; developerDiscountPercent: number; createdAt: string;
};
type DevKey = { id: string; prefix: string; last4: string; isActive: boolean; createdAt: string; lastUsedAt?: string; preview: string; };
type DevPlan = { id: string; code: string; network: string; networkId: number; planId: number; dataSize: string; validity: string; appPrice: number; developerPrice: number; };
type DevTx = { id: string; status: string; phoneNumber: string; network: string; planCode: string; developerPrice: number; appPrice: number; message: string; createdAt: string; };
type DepositRow = { id: string; amount: number; senderName: string; narration: string; status: string; createdAt: string; };

/* ─── HELPERS ─── */
const fmt = (n: number) => `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
const fmtDate = (d: string) => new Date(d).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' });

/* ─── PALETTE ─── */
const C = {
  bg: '#0A0A0F',
  card: '#12121A',
  card2: '#1A1A25',
  border: 'rgba(139,92,246,.18)',
  text: '#F0F0FF',
  muted: '#7C7C96',
  blue: '#60A5FA',
  green: '#34D399',
  purple: '#A78BFA',
  teal: '#22D3EE',
  orange: '#FB923C',
  red: '#F87171',
  yellow: '#FBBF24',
};

/* ─── NETWORK COLORS ─── */
const NET_COLOR: Record<string, string> = { MTN: '#FBBF24', GLO: '#34D399', AIRTEL: '#F87171', '9MOBILE': '#34D399' };
const NET_BG: Record<string, string> = { MTN: 'rgba(251,191,36,.12)', GLO: 'rgba(52,211,153,.12)', AIRTEL: 'rgba(248,113,113,.12)', '9MOBILE': 'rgba(52,211,153,.12)' };

/* ─── ICONS ─── */
const Ic = {
  code: (c = C.purple, s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  key: (c = C.green, s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3"/></svg>,
  bolt: (c = C.blue, s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  wallet: (c = C.teal, s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/><rect x="17" y="15" width="3" height="3" rx="1"/></svg>,
  chart: (c = C.orange, s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  shield: (c = C.green, s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  globe: (c = C.blue, s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  copy: (c = C.muted, s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  check: (c = C.green, s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  eye: (c = C.muted, s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: (c = C.muted, s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  refresh: (c = C.purple, s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  logout: (c = C.red, s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  book: (c = C.blue, s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  star: (c = C.yellow, s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c} stroke={c} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  arrowRight: (c = C.purple, s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  menu: (c = C.text, s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  x: (c = C.muted, s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  info: (c = C.blue, s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  deposit: (c = C.green, s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>,
};

/* ─── CSS IN JS ─── */
const GS = () => (
  <style>{`
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{color-scheme:dark}
    html{scroll-behavior:smooth}
    body{background:${C.bg};color:${C.text};font-family:-apple-system,'SF Pro Display','SF Pro Text',BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
    ::selection{background:rgba(167,139,250,.3);color:#fff}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(139,92,246,.3);border-radius:4px}
    button,input{font-family:inherit;outline:none}
    input{background:transparent}
    a{color:inherit;text-decoration:none}

    @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(139,92,246,.3)}50%{box-shadow:0 0 40px rgba(139,92,246,.6)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}

    .fu{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) forwards}
    .fi{animation:fadeIn .4s ease forwards}
    .float{animation:float 4s ease-in-out infinite}
    .glow{animation:glow 3s ease-in-out infinite}

    .btn-primary{
      display:inline-flex;align-items:center;justify-content:center;gap:8px;
      padding:14px 28px;border-radius:12px;font-size:15px;font-weight:700;
      background:linear-gradient(135deg,#7C3AED,#4F46E5);
      color:#fff;border:none;cursor:pointer;
      transition:transform .15s,box-shadow .15s,opacity .15s;
      box-shadow:0 4px 20px rgba(124,58,237,.4);
    }
    .btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 30px rgba(124,58,237,.5)}
    .btn-primary:active{transform:translateY(0);box-shadow:0 2px 12px rgba(124,58,237,.3)}
    .btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}

    .btn-ghost{
      display:inline-flex;align-items:center;justify-content:center;gap:8px;
      padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;
      background:rgba(139,92,246,.1);color:${C.purple};
      border:1px solid rgba(139,92,246,.3);cursor:pointer;
      transition:all .15s;
    }
    .btn-ghost:hover{background:rgba(139,92,246,.18);border-color:rgba(139,92,246,.5)}

    .card{
      background:${C.card};border-radius:20px;
      border:1px solid rgba(139,92,246,.12);
      transition:border-color .2s,transform .2s,box-shadow .2s;
    }
    .card:hover{border-color:rgba(139,92,246,.25)}

    .tab{
      padding:8px 16px;border-radius:10px;font-size:13px;font-weight:600;
      color:${C.muted};cursor:pointer;background:transparent;border:none;
      transition:all .15s;white-space:nowrap;
    }
    .tab.active{background:rgba(139,92,246,.15);color:${C.purple}}
    .tab:hover:not(.active){color:${C.text};background:rgba(255,255,255,.04)}

    .pill{
      display:inline-flex;align-items:center;gap:5px;
      padding:4px 10px;border-radius:100px;font-size:11px;font-weight:700;
      letter-spacing:.03em;text-transform:uppercase;
    }
    .pill.success{background:rgba(52,211,153,.12);color:${C.green}}
    .pill.failed{background:rgba(248,113,113,.12);color:${C.red}}
    .pill.pending{background:rgba(251,191,36,.12);color:${C.yellow}}

    .input-field{
      width:100%;padding:14px 16px;border-radius:12px;font-size:15px;
      background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.08);
      color:${C.text};transition:border-color .15s,box-shadow .15s;
    }
    .input-field:focus{border-color:rgba(139,92,246,.6);box-shadow:0 0 0 3px rgba(139,92,246,.12)}
    .input-field::placeholder{color:${C.muted}}

    .code-block{
      background:#0D0D15;border-radius:12px;border:1px solid rgba(139,92,246,.15);
      padding:16px;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;
      font-size:13px;line-height:1.7;overflow-x:auto;position:relative;
    }

    .gradient-border{
      position:relative;border-radius:20px;
      background:linear-gradient(${C.card},${C.card}) padding-box,
        linear-gradient(135deg,rgba(139,92,246,.4),rgba(79,70,229,.4)) border-box;
      border:1px solid transparent;
    }

    .hero-gradient{
      background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(139,92,246,.2) 0%,transparent 70%);
    }

    .shimmer{
      background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%);
      background-size:200% 100%;animation:shimmer 1.5s infinite;
    }

    .nav-blur{
      backdrop-filter:blur(20px) saturate(1.4);
      background:rgba(10,10,15,.8);
      border-bottom:1px solid rgba(139,92,246,.1);
    }

    .modal-backdrop{
      position:fixed;inset:0;background:rgba(0,0,0,.8);
      backdrop-filter:blur(8px);z-index:1000;
      display:flex;align-items:center;justify-content:center;padding:20px;
    }

    .hero-text-gradient{
      background:linear-gradient(135deg,#fff 30%,${C.purple} 70%,${C.blue} 100%);
      -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
      background-size:200% 200%;animation:gradientShift 4s ease infinite;
    }

    .network-badge{
      display:inline-flex;align-items:center;gap:6px;
      padding:5px 10px;border-radius:8px;font-size:12px;font-weight:700;
    }

    @media(max-width:768px){
      .hide-mobile{display:none!important}
      .mobile-full{width:100%!important}
    }
    @media(min-width:769px){
      .hide-desktop{display:none!important}
    }
  `}</style>
);

/* ─── PIN INPUT ─── */
function PinInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const digits = value.split('').slice(0, 4);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const next = [...digits]; next[i] = '';
      onChange(next.join(''));
      if (i > 0) refs[i - 1].current?.focus();
    }
  };
  const handleChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = [...digits]; next[i] = d;
    onChange(next.join(''));
    if (d && i < 3) refs[i + 1].current?.focus();
  };

  return (
    <div>
      {label && <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 10, letterSpacing: '.04em', textTransform: 'uppercase' }}>{label}</p>}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {[0, 1, 2, 3].map(i => (
          <input
            key={i}
            ref={refs[i]}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digits[i] || ''}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            style={{
              width: 56, height: 60, textAlign: 'center', fontSize: 26, fontWeight: 700,
              borderRadius: 14, border: `2px solid ${digits[i] ? 'rgba(139,92,246,.6)' : 'rgba(255,255,255,.1)'}`,
              background: digits[i] ? 'rgba(139,92,246,.1)' : 'rgba(255,255,255,.04)',
              color: C.text, transition: 'all .15s', outline: 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── COPY BUTTON ─── */
function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <button onClick={copy} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, background: copied ? 'rgba(52,211,153,.12)' : 'rgba(255,255,255,.06)', border: `1px solid ${copied ? 'rgba(52,211,153,.3)' : 'rgba(255,255,255,.08)'}`, color: copied ? C.green : C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}>
      {copied ? Ic.check() : Ic.copy()}
      {label ? (copied ? 'Copied!' : label) : (copied ? 'Copied!' : 'Copy')}
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
export default function DevelopersPage() {
  /* ─── STATE ─── */
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DevUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [dashTab, setDashTab] = useState<'overview' | 'keys' | 'plans' | 'docs' | 'wallet' | 'transactions'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  /* credentials */
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [keys, setKeys] = useState<DevKey[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [plans, setPlans] = useState<DevPlan[]>([]);
  const [devTxns, setDevTxns] = useState<DevTx[]>([]);
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [showKey, setShowKey] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [rotatingKey, setRotatingKey] = useState(false);
  const [docLang, setDocLang] = useState<'curl' | 'node' | 'php' | 'python' | 'go' | 'java'>('curl');

  /* register form */
  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', phone: '', pin: '', confirmPin: '' });
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin] = useState('');

  /* ─── INIT: load from localStorage ─── */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = localStorage.getItem('dev_portal_token');
    const u = localStorage.getItem('dev_portal_user');
    if (t && u) {
      try {
        setToken(t);
        setUser(JSON.parse(u));
      } catch { localStorage.removeItem('dev_portal_token'); localStorage.removeItem('dev_portal_user'); }
    }
  }, []);

  /* ─── LOAD DEV DATA ─── */
  const loadDevData = useCallback(async (tok: string) => {
    try {
      const [credRes, planRes, txRes, depRes] = await Promise.all([
        fetch('/api/developer/credentials', { headers: { Authorization: `Bearer ${tok}` } }),
        fetch('/api/developer/plans', { headers: { Authorization: `Bearer ${tok}` } }),
        fetch('/api/developer/transactions?limit=50', { headers: { Authorization: `Bearer ${tok}` } }),
        fetch('/api/deposits', { headers: { Authorization: `Bearer ${tok}` } }),
      ]);
      if (credRes.ok) {
        const d = await credRes.json();
        setActiveKey(d.activeApiKey || null);
        setKeys(d.keys || []);
        setDiscountPercent(d.discountPercent || 0);
      }
      if (planRes.ok) { const d = await planRes.json(); setPlans(d.plans || []); }
      if (txRes.ok) { const d = await txRes.json(); setDevTxns(d.transactions || []); }
      if (depRes.ok) { const d = await depRes.json(); setDeposits(d); }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (token && user?.isDeveloper) loadDevData(token);
  }, [token, user, loadDevData]);

  /* ─── AUTH FUNCTIONS ─── */
  const authHeader = () => ({ Authorization: `Bearer ${token}` });

  const doLogin = async () => {
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: loginPhone, pin: loginPin }) });
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'Login failed'); return; }
      localStorage.setItem('dev_portal_token', d.token);
      localStorage.setItem('dev_portal_user', JSON.stringify(d.user));
      setToken(d.token); setUser(d.user);
      setShowAuthModal(false); setSuccess('Welcome back!');
      if (d.user.isDeveloper) loadDevData(d.token);
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const doRegister = async () => {
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regForm) });
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'Registration failed'); return; }
      localStorage.setItem('dev_portal_token', d.token);
      localStorage.setItem('dev_portal_user', JSON.stringify(d.user));
      setToken(d.token); setUser(d.user);
      setShowAuthModal(false); setSuccess('Account created! Now enable Developer Mode below.');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const doUpgrade = async () => {
    if (!token || upgrading) return;
    setUpgrading(true); setError('');
    try {
      const res = await fetch('/api/developer/upgrade', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify({ acceptTerms: true, termsVersion: 'v1.0' }) });
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'Upgrade failed'); return; }
      const updatedUser = { ...user!, isDeveloper: true };
      setUser(updatedUser);
      localStorage.setItem('dev_portal_user', JSON.stringify(updatedUser));
      setSuccess('Developer mode enabled! Loading your credentials...');
      await loadDevData(token);
      setDashTab('keys');
    } catch { setError('Failed to enable developer mode.'); }
    finally { setUpgrading(false); }
  };

  const doRotateKey = async () => {
    if (!token || rotatingKey) return;
    if (!confirm('Rotate your API key? Your current key will be revoked immediately.')) return;
    setRotatingKey(true);
    try {
      const res = await fetch('/api/developer/credentials', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify({ action: 'rotate' }) });
      const d = await res.json();
      if (res.ok) { setActiveKey(d.activeApiKey); setKeys(d.keys || []); setSuccess('API key rotated successfully.'); }
      else setError(d.error || 'Rotation failed');
    } catch { setError('Failed to rotate key.'); }
    finally { setRotatingKey(false); }
  };

  const doLogout = () => {
    localStorage.removeItem('dev_portal_token');
    localStorage.removeItem('dev_portal_user');
    setToken(null); setUser(null); setActiveKey(null); setKeys([]); setPlans([]); setDevTxns([]);
    setSuccess(''); setError('');
  };

  /* ─── DOC CODE SAMPLES ─── */
  const baseUrl = 'https://www.saukimart.online';
  const demoKey = activeKey || 'sm_live_XXXX_...your_key_here';
  const codeSamples: Record<typeof docLang, string> = {
    curl: `# 1. Fetch available data plans
curl -X GET "${baseUrl}/api/v1/developer/data-plans" \\
  -H "x-api-key: ${demoKey}"

# 2. Purchase data
curl -X POST "${baseUrl}/api/v1/developer/purchase-data" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${demoKey}" \\
  -d '{
    "phoneNumber": "08012345678",
    "planCode": "1-206",
    "idempotencyKey": "your-unique-request-id"
  }'`,
    node: `const API_KEY = '${demoKey}';
const BASE = '${baseUrl}';

// Fetch plans
const plans = await fetch(\`\${BASE}/api/v1/developer/data-plans\`, {
  headers: { 'x-api-key': API_KEY }
}).then(r => r.json());

// Purchase data
const result = await fetch(\`\${BASE}/api/v1/developer/purchase-data\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
  body: JSON.stringify({
    phoneNumber: '08012345678',
    planCode: '1-206',
    idempotencyKey: crypto.randomUUID(),
  })
}).then(r => r.json());

console.log(result);`,
    php: `<?php
$apiKey = '${demoKey}';
$base   = '${baseUrl}';

// Fetch plans
$ch = curl_init("$base/api/v1/developer/data-plans");
curl_setopt($ch, CURLOPT_HTTPHEADER, ["x-api-key: $apiKey"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$plans = json_decode(curl_exec($ch), true);
curl_close($ch);

// Purchase data
$ch = curl_init("$base/api/v1/developer/purchase-data");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  "Content-Type: application/json",
  "x-api-key: $apiKey"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
  'phoneNumber'    => '08012345678',
  'planCode'       => '1-206',
  'idempotencyKey' => uniqid('suki_', true),
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = json_decode(curl_exec($ch), true);
curl_close($ch);
var_dump($result);`,
    python: `import httpx, uuid

API_KEY = "${demoKey}"
BASE    = "${baseUrl}"

# Fetch plans
plans = httpx.get(
    f"{BASE}/api/v1/developer/data-plans",
    headers={"x-api-key": API_KEY}
).json()

# Purchase data
result = httpx.post(
    f"{BASE}/api/v1/developer/purchase-data",
    headers={"Content-Type": "application/json", "x-api-key": API_KEY},
    json={
        "phoneNumber":    "08012345678",
        "planCode":       "1-206",
        "idempotencyKey": str(uuid.uuid4()),
    }
).json()

print(result)`,
    go: `package main

import (
  "bytes"; "encoding/json"; "fmt"; "io"; "net/http"
)

const apiKey = "${demoKey}"
const base   = "${baseUrl}"

func main() {
  // Purchase data
  body, _ := json.Marshal(map[string]string{
    "phoneNumber":    "08012345678",
    "planCode":       "1-206",
    "idempotencyKey": "unique-request-id",
  })
  req, _ := http.NewRequest("POST", base+"/api/v1/developer/purchase-data", bytes.NewBuffer(body))
  req.Header.Set("Content-Type", "application/json")
  req.Header.Set("x-api-key", apiKey)

  res, _ := http.DefaultClient.Do(req)
  defer res.Body.Close()
  data, _ := io.ReadAll(res.Body)
  fmt.Println(string(data))
}`,
    java: `import java.net.http.*;
import java.net.URI;
import org.json.*;

public class SaukiMartAPI {
  static final String API_KEY = "${demoKey}";
  static final String BASE    = "${baseUrl}";

  public static void main(String[] args) throws Exception {
    var client = HttpClient.newHttpClient();

    // Purchase data
    var body = new JSONObject()
      .put("phoneNumber",    "08012345678")
      .put("planCode",       "1-206")
      .put("idempotencyKey", java.util.UUID.randomUUID().toString())
      .toString();

    var request = HttpRequest.newBuilder()
      .uri(URI.create(BASE + "/api/v1/developer/purchase-data"))
      .header("Content-Type", "application/json")
      .header("x-api-key", API_KEY)
      .POST(HttpRequest.BodyPublishers.ofString(body))
      .build();

    var response = client.send(request, HttpResponse.BodyHandlers.ofString());
    System.out.println(response.body());
  }
}`,
  };

  /* ─── NETWORK FILTER STATE ─── */
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const filteredPlans = planFilter === 'ALL' ? plans : plans.filter(p => p.network === planFilter);
  const networks = ['ALL', ...Array.from(new Set(plans.map(p => p.network)))];

  /* ─── STATS ─── */
  const totalSpend = devTxns.filter(t => t.status === 'success').reduce((a, b) => a + b.developerPrice, 0);
  const successCount = devTxns.filter(t => t.status === 'success').length;
  const failCount = devTxns.filter(t => t.status === 'failed').length;

  /* ═══════════ LANDING PAGE (not logged in) ═══════════ */
  if (!token || !user) {
    return (
      <>
        <GS />

        {/* NAV */}
        <nav className="nav-blur" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {Ic.code(C.purple, 22)}
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-.02em' }}>SaukiMart <span style={{ color: C.purple }}>API</span></span>
          </div>
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {['Features', 'Pricing', 'Docs', 'Networks'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{ padding: '8px 14px', fontSize: 14, fontWeight: 500, color: C.muted, borderRadius: 8, transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = C.text)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost hide-mobile" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>Sign In</button>
            <button className="btn-primary" onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}>Get API Key</button>
          </div>
        </nav>

        <div style={{ paddingTop: 64 }}>

          {/* HERO */}
          <section className="hero-gradient" style={{ padding: '80px 24px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* bg orbs */}
            <div style={{ position: 'absolute', top: -100, left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,.15) 0%,transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, right: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,70,229,.12) 0%,transparent 70%)', pointerEvents: 'none' }} />

            <div className="fu" style={{ animationDelay: '0ms' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.3)', fontSize: 13, fontWeight: 600, color: C.purple, marginBottom: 28 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, animation: 'pulse 2s infinite' }} />
                Live API · Production Ready
              </div>
            </div>

            <h1 className="fu" style={{ fontSize: 'clamp(40px,7vw,76px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1.05, marginBottom: 24, animationDelay: '60ms' }}>
              <span className="hero-text-gradient">Build Nigeria's Fastest</span>
              <br />Data Vending Platform
            </h1>

            <p className="fu" style={{ fontSize: 'clamp(16px,2.5vw,20px)', color: C.muted, maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.65, animationDelay: '120ms' }}>
              Access cheap, reliable data plans across MTN, Glo, Airtel & 9Mobile via a single REST API. Up to {discountPercent > 0 ? discountPercent : 8}% discount. Instant activation. Zero setup fee.
            </p>

            <div className="fu" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, animationDelay: '180ms' }}>
              <button className="btn-primary" onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} style={{ fontSize: 16, padding: '16px 36px' }}>
                {Ic.code()} Start Building Free
              </button>
              <a href="#docs" className="btn-ghost" style={{ fontSize: 15, padding: '15px 24px', textDecoration: 'none' }}>
                {Ic.book()} View Docs {Ic.arrowRight()}
              </a>
            </div>

            {/* stats row */}
            <div className="fu" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 40, marginTop: 60, animationDelay: '240ms' }}>
              {[['4', 'Networks'], ['99.9%', 'Uptime SLA'], ['< 3s', 'Avg Delivery'], ['REST', 'API Standard']].map(([v, l]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: '-.03em' }}>{v}</p>
                  <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{l}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FEATURES */}
          <section id="features" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.purple, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>Why Choose Us</p>
              <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: '-.03em' }}>Everything you need to vend data at scale</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
              {[
                { icon: Ic.bolt(C.blue, 22), title: 'Instant Activation', sub: 'Data delivered to recipient within seconds of API call. No manual processing, no delays.' },
                { icon: Ic.shield(C.green, 22), title: 'Secure & Idempotent', sub: 'HTTPS-only, SHA-256 key hashing, idempotency keys prevent duplicate charges on retry.' },
                { icon: Ic.chart(C.orange, 22), title: 'Discounted Pricing', sub: 'Developer accounts get exclusive discounts off retail price — up to 8% off per transaction.' },
                { icon: Ic.wallet(C.teal, 22), title: 'Pre-funded Wallet', sub: 'Deposit once, spend as you go. No invoicing delays, no credit limits, full balance control.' },
                { icon: Ic.globe(C.blue, 22), title: 'Multi-Network', sub: 'MTN, Glo, Airtel, 9Mobile all in one unified API with consistent request/response format.' },
                { icon: Ic.book(C.purple, 22), title: 'SDKs & Docs', sub: 'Quickstart guides for cURL, Node.js, PHP, Python, Go & Java with copy-ready code.' },
              ].map(f => (
                <div key={f.title} className="card" style={{ padding: '28px 24px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(139,92,246,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65 }}>{f.sub}</p>
                </div>
              ))}
            </div>
          </section>

          {/* PRICING */}
          <section id="pricing" style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.purple, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>Transparent Pricing</p>
              <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: '-.03em' }}>No subscription. Pay only what you use.</h2>
              <p style={{ fontSize: 16, color: C.muted, marginTop: 16, lineHeight: 1.6 }}>Fund your wallet and call the API. Discounts applied automatically on every transaction.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
              {[
                { tier: 'Starter', discount: '0%', features: ['API access', 'All networks', 'Basic dashboard', 'Email support'], color: C.teal, note: 'Free to start' },
                { tier: 'Developer', discount: '8%+', features: ['All Starter features', 'Discounted pricing', 'Full API dashboard', 'Transaction history', 'Key rotation', 'Priority support'], color: C.purple, note: 'Most popular', popular: true },
              ].map(t => (
                <div key={t.tier} className={t.popular ? 'gradient-border' : 'card'} style={{ padding: '32px 28px', position: 'relative' }}>
                  {t.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', borderRadius: 100, background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>Most Popular</div>}
                  <p style={{ fontSize: 13, fontWeight: 700, color: t.color, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>{t.tier}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                    <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-.04em' }}>{t.discount}</span>
                    <span style={{ fontSize: 14, color: C.muted }}>off retail</span>
                  </div>
                  <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>{t.note}</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                    {t.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: C.text }}>
                        {Ic.check(C.green, 16)}{f}
                      </li>
                    ))}
                  </ul>
                  <button className={t.popular ? 'btn-primary mobile-full' : 'btn-ghost mobile-full'} style={{ width: '100%' }} onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}>
                    Get Started Free
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* NETWORKS */}
          <section id="networks" style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 900, letterSpacing: '-.03em', marginBottom: 40 }}>All Major Nigerian Networks</h2>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16 }}>
              {[{ name: 'MTN', color: '#FBBF24', emoji: '🟡' }, { name: 'Glo', color: '#34D399', emoji: '🟢' }, { name: 'Airtel', color: '#F87171', emoji: '🔴' }, { name: '9Mobile', color: '#34D399', emoji: '🟩' }].map(n => (
                <div key={n.name} style={{ padding: '20px 36px', borderRadius: 16, background: C.card, border: `1px solid ${n.color}30`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 130 }}>
                  <span style={{ fontSize: 32 }}>{n.emoji}</span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: n.color }}>{n.name}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>Live</span>
                </div>
              ))}
            </div>
          </section>

          {/* QUICK DOC PREVIEW */}
          <section id="docs" style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.purple, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>Integration Guide</p>
              <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: '-.03em' }}>Start in under 5 minutes</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
              {(['curl', 'node', 'php', 'python', 'go', 'java'] as const).map(l => (
                <button key={l} className={`tab${docLang === l ? ' active' : ''}`} onClick={() => setDocLang(l)} style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 700, letterSpacing: '.06em' }}>{l === 'node' ? 'Node.js' : l === 'curl' ? 'cURL' : l.charAt(0).toUpperCase() + l.slice(1)}</button>
              ))}
            </div>
            <div className="code-block" style={{ fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <CopyBtn text={codeSamples[docLang]} label="Copy code" />
              </div>
              <pre style={{ color: '#E2E8F0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {codeSamples[docLang].split('\n').map((line, i) => {
                  const comment = line.trim().startsWith('#') || line.trim().startsWith('//');
                  return <span key={i} style={{ color: comment ? C.muted : line.includes("'") || line.includes('"') ? '#86EFAC' : line.includes('curl') || line.includes('const') || line.includes('import') || line.includes('func') || line.includes('public') ? '#93C5FD' : '#E2E8F0' }}>{line}{'\n'}</span>;
                })}
              </pre>
            </div>
            <div style={{ marginTop: 24, background: C.card2, borderRadius: 14, padding: '18px 20px', border: '1px solid rgba(139,92,246,.15)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                {Ic.info()}
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Authentication</p>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>Pass your API key via the <code style={{ fontFamily: 'monospace', color: C.purple }}>x-api-key</code> header. Keys start with <code style={{ fontFamily: 'monospace', color: C.purple }}>sm_live_</code>. Keep your key secret — treat it like a password.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ENDPOINTS REFERENCE */}
          <section style={{ padding: '0 24px 80px', maxWidth: 900, margin: '0 auto' }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, letterSpacing: '-.02em' }}>API Reference</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { method: 'GET', path: '/api/v1/developer/data-plans', desc: 'List all available data plans with your discounted price.', auth: true },
                { method: 'POST', path: '/api/v1/developer/purchase-data', desc: 'Purchase data for a phone number. Deducts from your wallet.', auth: true },
              ].map(ep => (
                <div key={ep.path} className="card" style={{ padding: '18px 20px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 800, letterSpacing: '.05em', background: ep.method === 'GET' ? 'rgba(52,211,153,.12)' : 'rgba(96,165,250,.12)', color: ep.method === 'GET' ? C.green : C.blue }}>{ep.method}</span>
                  <code style={{ fontFamily: 'monospace', fontSize: 14, color: C.purple, flex: 1, minWidth: 200 }}>{ep.path}</code>
                  <p style={{ fontSize: 13, color: C.muted, flex: 2 }}>{ep.desc}</p>
                  {ep.auth && <span style={{ fontSize: 11, color: C.yellow, background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.2)', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>Auth required</span>}
                </div>
              ))}
            </div>
          </section>

          {/* CTA BANNER */}
          <section style={{ padding: '0 24px 100px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto', background: 'linear-gradient(135deg,rgba(124,58,237,.2),rgba(79,70,229,.15))', borderRadius: 24, border: '1px solid rgba(139,92,246,.25)', padding: '52px 40px', textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, letterSpacing: '-.03em', marginBottom: 16 }}>Ready to start building?</h2>
              <p style={{ fontSize: 16, color: C.muted, marginBottom: 36, lineHeight: 1.6 }}>Create your free developer account in 60 seconds. No subscription, no credit card required.</p>
              <button className="btn-primary" style={{ fontSize: 16, padding: '16px 40px' }} onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}>
                {Ic.code()} Create Free Account
              </button>
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              {Ic.code(C.purple, 18)}
              <span style={{ fontWeight: 700, fontSize: 16 }}>SaukiMart API</span>
            </div>
            <p style={{ fontSize: 13, color: C.muted }}>© 2026 SaukiMart. Powering Nigeria's data ecosystem.</p>
          </footer>
        </div>

        {/* AUTH MODAL */}
        {showAuthModal && (
          <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowAuthModal(false); }}>
            <div className="fi" style={{ background: C.card, borderRadius: 24, border: '1px solid rgba(139,92,246,.2)', padding: '36px 32px', width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}>
              {/* header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-.02em' }}>{authMode === 'login' ? 'Welcome back' : 'Create account'}</h2>
                  <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{authMode === 'login' ? 'Sign in with your phone number & PIN' : 'One account for app and API portal'}</p>
                </div>
                <button onClick={() => setShowAuthModal(false)} style={{ padding: 8, borderRadius: 10, background: 'rgba(255,255,255,.06)', border: 'none', cursor: 'pointer' }}>{Ic.x()}</button>
              </div>

              {/* tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 28, background: 'rgba(255,255,255,.04)', borderRadius: 12, padding: 4 }}>
                {(['login', 'register'] as const).map(m => (
                  <button key={m} onClick={() => { setAuthMode(m); setError(''); }} style={{ flex: 1, padding: '10px', borderRadius: 10, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all .15s', background: authMode === m ? 'rgba(139,92,246,.2)' : 'transparent', color: authMode === m ? C.purple : C.muted }}>
                    {m === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>

              {error && <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.25)', color: C.red, fontSize: 13, marginBottom: 20 }}>{error}</div>}

              {/* LOGIN FORM */}
              {authMode === 'login' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: '.04em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Phone Number</label>
                    <input className="input-field" type="tel" inputMode="numeric" placeholder="08012345678" value={loginPhone} onChange={e => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} />
                  </div>
                  <PinInput label="4-digit PIN" value={loginPin} onChange={setLoginPin} />
                  <button className="btn-primary" style={{ width: '100%', marginTop: 4 }} disabled={loading || loginPhone.length !== 11 || loginPin.length !== 4} onClick={doLogin}>
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 13, color: C.muted }}>
                    Don't have an account?{' '}
                    <button onClick={() => setAuthMode('register')} style={{ color: C.purple, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Register</button>
                  </p>
                </div>
              )}

              {/* REGISTER FORM */}
              {authMode === 'register' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: '.04em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>First Name</label>
                      <input className="input-field" placeholder="John" value={regForm.firstName} onChange={e => setRegForm(f => ({ ...f, firstName: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: '.04em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Last Name</label>
                      <input className="input-field" placeholder="Doe" value={regForm.lastName} onChange={e => setRegForm(f => ({ ...f, lastName: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: '.04em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Phone Number</label>
                    <input className="input-field" type="tel" inputMode="numeric" placeholder="08012345678" value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 11) }))} />
                  </div>
                  <PinInput label="Create PIN (4 digits)" value={regForm.pin} onChange={v => setRegForm(f => ({ ...f, pin: v }))} />
                  <PinInput label="Confirm PIN" value={regForm.confirmPin} onChange={v => setRegForm(f => ({ ...f, confirmPin: v }))} />
                  <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.6, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                    By creating an account, you agree to SaukiMart's Terms of Service. A virtual bank account will be created for wallet deposits.
                  </p>
                  <button className="btn-primary" style={{ width: '100%' }} disabled={loading || !regForm.firstName || !regForm.lastName || regForm.phone.length !== 11 || regForm.pin.length !== 4 || regForm.pin !== regForm.confirmPin} onClick={doRegister}>
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>
                  {regForm.pin.length === 4 && regForm.confirmPin.length === 4 && regForm.pin !== regForm.confirmPin && (
                    <p style={{ color: C.red, fontSize: 12, textAlign: 'center' }}>PINs don't match</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  /* ═══════════ DEVELOPER DASHBOARD ═══════════ */
  return (
    <>
      <GS />
      {success && (
        <div className="fi" style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: 'rgba(52,211,153,.12)', border: '1px solid rgba(52,211,153,.3)', borderRadius: 12, padding: '12px 20px', color: C.green, fontSize: 14, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap' }}>
          {Ic.check(C.green, 16)} {success}
          <button onClick={() => setSuccess('')} style={{ marginLeft: 8, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>{Ic.x(C.muted, 14)}</button>
        </div>
      )}

      {/* DASHBOARD NAV */}
      <nav className="nav-blur" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {Ic.code(C.purple, 20)}
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-.02em' }}>SaukiMart <span style={{ color: C.purple }}>Dev</span></span>
        </div>
        <div className="hide-mobile" style={{ display: 'flex', gap: 4 }}>
          {[['overview', 'Overview'], ['keys', 'API Keys'], ['plans', 'Plans'], ['docs', 'Docs'], ['wallet', 'Wallet'], ['transactions', 'History']] .map(([k, l]) => (
            <button key={k} className={`tab${dashTab === k ? ' active' : ''}`} onClick={() => setDashTab(k as any)}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="hide-mobile" style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{user.firstName} {user.lastName}</p>
            <p style={{ fontSize: 11, color: C.muted }}>{fmt(user.walletBalance)}</p>
          </div>
          <button onClick={doLogout} style={{ padding: '7px 12px', borderRadius: 10, background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.2)', color: C.red, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {Ic.logout()} <span className="hide-mobile">Logout</span>
          </button>
        </div>
      </nav>

      {/* MOBILE NAV TABS */}
      <div className="hide-desktop" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: C.card, borderTop: '1px solid rgba(139,92,246,.12)', display: 'flex', padding: '8px 4px 12px', gap: 4, overflowX: 'auto' }}>
        {[['overview', '⊞', 'Home'], ['keys', '🔑', 'Keys'], ['plans', '📡', 'Plans'], ['docs', '📖', 'Docs'], ['wallet', '💳', 'Wallet'], ['transactions', '📊', 'TXNs']].map(([k, em, l]) => (
          <button key={k} onClick={() => setDashTab(k as any)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 52, padding: '6px 4px', borderRadius: 10, border: 'none', background: dashTab === k ? 'rgba(139,92,246,.15)' : 'transparent', cursor: 'pointer' }}>
            <span style={{ fontSize: 18 }}>{em}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: dashTab === k ? C.purple : C.muted, letterSpacing: '.03em' }}>{l}</span>
          </button>
        ))}
      </div>

      <div style={{ paddingTop: 60, paddingBottom: 80, minHeight: '100vh' }}>

        {/* ─── ACTIVATE DEVELOPER ─── */}
        {!user.isDeveloper && (
          <div style={{ maxWidth: 680, margin: '48px auto', padding: '0 24px' }}>
            <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,.15),rgba(79,70,229,.1))', borderRadius: 24, border: '1px solid rgba(139,92,246,.3)', padding: '40px 36px', textAlign: 'center' }} className="glow">
              <div style={{ fontSize: 52, marginBottom: 20 }}>🚀</div>
              <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>Enable Developer Mode</h2>
              <p style={{ fontSize: 15, color: C.muted, marginBottom: 28, lineHeight: 1.65 }}>
                You're logged in as <strong style={{ color: C.text }}>{user.firstName}</strong>. Enable developer mode to get your API key, discounted pricing, and access to all API endpoints.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28, textAlign: 'left', maxWidth: 380, margin: '0 auto 28px' }}>
                {['API key issued immediately', 'Up to 8% discount on all data plans', 'Full transaction history', 'Pre-funded wallet (deposit once, use anytime)', 'Priority support'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                    {Ic.check(C.green, 15)} {f}
                  </div>
                ))}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 20, cursor: 'pointer', fontSize: 13, color: C.muted }}>
                <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} style={{ width: 16, height: 16, accentColor: C.purple }} />
                I accept the API Terms of Service
              </label>
              <button className="btn-primary" style={{ fontSize: 15, padding: '14px 36px' }} disabled={upgrading || !acceptTerms} onClick={doUpgrade}>
                {upgrading ? 'Activating…' : 'Enable Developer Mode'}
              </button>
              {error && <p style={{ color: C.red, fontSize: 13, marginTop: 16 }}>{error}</p>}
            </div>
          </div>
        )}

        {/* ─── DASHBOARD CONTENT ─── */}
        {user.isDeveloper && (
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

            {/* OVERVIEW TAB */}
            {dashTab === 'overview' && (
              <div className="fu">
                <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-.03em', marginBottom: 6 }}>
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user.firstName} 👋
                </h1>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 32 }}>Here's your API activity at a glance.</p>

                {/* stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
                  {[
                    { label: 'Wallet Balance', value: fmt(user.walletBalance), color: C.teal, icon: Ic.wallet(C.teal, 20) },
                    { label: 'Total API Spend', value: fmt(totalSpend), color: C.purple, icon: Ic.chart(C.purple, 20) },
                    { label: 'Successful Calls', value: successCount.toString(), color: C.green, icon: Ic.check(C.green, 20) },
                    { label: 'Failed Calls', value: failCount.toString(), color: C.red, icon: Ic.bolt(C.red, 20) },
                    { label: 'Discount Rate', value: `${discountPercent}%`, color: C.yellow, icon: Ic.star() },
                  ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '20px 22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: '.04em', textTransform: 'uppercase' }}>{s.label}</p>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                      </div>
                      <p style={{ fontSize: 26, fontWeight: 900, color: s.color, letterSpacing: '-.03em' }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* active key quick view */}
                {activeKey && (
                  <div className="card" style={{ padding: '22px 24px', marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {Ic.key()}
                        <p style={{ fontWeight: 800, fontSize: 15 }}>Active API Key</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowKey(v => !v)} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', color: C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          {showKey ? Ic.eyeOff() : Ic.eye()} {showKey ? 'Hide' : 'Show'}
                        </button>
                        <CopyBtn text={activeKey} label="Copy key" />
                      </div>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 13, background: '#0D0D15', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(139,92,246,.15)', color: showKey ? C.green : C.muted, letterSpacing: '.05em', wordBreak: 'break-all' }}>
                      {showKey ? activeKey : activeKey.substring(0, 12) + '•'.repeat(Math.max(0, activeKey.length - 20)) + activeKey.slice(-4)}
                    </div>
                  </div>
                )}

                {/* recent txns */}
                <div className="card" style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <p style={{ fontWeight: 800, fontSize: 15 }}>Recent Transactions</p>
                    <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => setDashTab('transactions')}>View all</button>
                  </div>
                  {devTxns.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted }}>
                      <p style={{ fontSize: 32, marginBottom: 10 }}>∿</p>
                      <p style={{ fontSize: 14 }}>No API calls yet. Start using your key!</p>
                    </div>
                  ) : devTxns.slice(0, 5).map((tx, i) => (
                    <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < Math.min(devTxns.length, 5) - 1 ? `1px solid rgba(255,255,255,.04)` : undefined }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: tx.status === 'success' ? 'rgba(52,211,153,.1)' : 'rgba(248,113,113,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {tx.status === 'success' ? Ic.check(C.green, 16) : Ic.x(C.red, 15)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{tx.network} · {tx.planCode} → {tx.phoneNumber}</p>
                        <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{fmtDate(tx.createdAt)}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 800, fontSize: 14, color: tx.status === 'success' ? C.red : C.muted }}>−{fmt(tx.developerPrice)}</p>
                        <span className={`pill ${tx.status}`} style={{ marginTop: 4, display: 'inline-flex' }}><span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }} />{tx.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KEYS TAB */}
            {dashTab === 'keys' && (
              <div className="fu">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-.02em' }}>API Keys</h2>
                    <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Manage your API keys. Rotate anytime.</p>
                  </div>
                  <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={doRotateKey} disabled={rotatingKey}>
                    {Ic.refresh()} {rotatingKey ? 'Rotating…' : 'Rotate Key'}
                  </button>
                </div>
                {error && <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.25)', color: C.red, fontSize: 13, marginBottom: 20 }}>{error}</div>}

                {activeKey && (
                  <div className="gradient-border" style={{ padding: '24px', marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {Ic.key()}
                        <div>
                          <p style={{ fontWeight: 800, fontSize: 15 }}>Live API Key</p>
                          <p style={{ fontSize: 12, color: C.green }}>● Active</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setShowKey(v => !v)} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', color: C.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          {showKey ? Ic.eyeOff() : Ic.eye()} {showKey ? 'Hide' : 'Reveal'}
                        </button>
                        <CopyBtn text={activeKey} label="Copy" />
                      </div>
                    </div>
                    <div className="code-block" style={{ fontSize: 14, padding: '14px 18px' }}>
                      <code style={{ color: showKey ? C.green : C.muted, letterSpacing: '.04em', wordBreak: 'break-all' }}>
                        {showKey ? activeKey : activeKey.substring(0, 12) + '•'.repeat(Math.max(0, activeKey.length - 20)) + activeKey.slice(-4)}
                      </code>
                    </div>
                    <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.15)' }}>
                      <p style={{ fontSize: 12, color: C.yellow, lineHeight: 1.6 }}>⚠️ Keep this key secret. Never expose it in client-side code or public repos. Pass it via the <code style={{ fontFamily: 'monospace' }}>x-api-key</code> header from your server.</p>
                    </div>
                  </div>
                )}

                <div className="card" style={{ padding: '20px 22px' }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: C.muted, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 16 }}>Key History</p>
                  {keys.length === 0 ? <p style={{ color: C.muted, fontSize: 14 }}>No keys found.</p> : keys.map((k, i) => (
                    <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < keys.length - 1 ? `1px solid rgba(255,255,255,.04)` : undefined }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'monospace', fontSize: 13, color: k.isActive ? C.green : C.muted }}>{k.preview}</p>
                        <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Created {fmtDate(k.createdAt)} · {k.lastUsedAt ? `Last used ${fmtDate(k.lastUsedAt)}` : 'Never used'}</p>
                      </div>
                      <span className={`pill ${k.isActive ? 'success' : 'failed'}`}>{k.isActive ? 'Active' : 'Revoked'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PLANS TAB */}
            {dashTab === 'plans' && (
              <div className="fu">
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-.02em' }}>Data Plans</h2>
                  <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                    You receive a <span style={{ color: C.green, fontWeight: 700 }}>{discountPercent}% discount</span> on all plans.
                    Use the <code style={{ fontFamily: 'monospace', color: C.purple }}>code</code> field as{' '}
                    <code style={{ fontFamily: 'monospace', color: C.purple }}>planCode</code> in the purchase API.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  {networks.map(n => (
                    <button key={n} className={`tab${planFilter === n ? ' active' : ''}`} onClick={() => setPlanFilter(n)} style={{ fontWeight: 700 }}>{n}</button>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                  {filteredPlans.map(p => (
                    <div key={p.id} className="card" style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <span className="network-badge" style={{ background: NET_BG[p.network] || 'rgba(139,92,246,.12)', color: NET_COLOR[p.network] || C.purple }}>{p.network}</span>
                        <code style={{ fontFamily: 'monospace', fontSize: 12, color: C.purple, background: 'rgba(139,92,246,.1)', padding: '3px 8px', borderRadius: 6 }}>{p.code}</code>
                      </div>
                      <p style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{p.dataSize}</p>
                      <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Valid for {p.validity}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <p style={{ fontSize: 11, color: C.muted, textDecoration: 'line-through' }}>{fmt(p.appPrice)}</p>
                          <p style={{ fontSize: 18, fontWeight: 900, color: C.green }}>{fmt(p.developerPrice)}</p>
                        </div>
                        <CopyBtn text={p.code} label={p.code} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DOCS TAB */}
            {dashTab === 'docs' && (
              <div className="fu">
                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 8 }}>API Documentation</h2>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 32, lineHeight: 1.6 }}>Base URL: <code style={{ fontFamily: 'monospace', color: C.purple }}>https://www.saukimart.online</code></p>

                {/* endpoint cards */}
                {[
                  {
                    method: 'GET', path: '/api/v1/developer/data-plans', auth: true,
                    desc: 'Returns all active data plans with your discounted prices.',
                    response: `{\n  "success": true,\n  "discountPercent": ${discountPercent},\n  "plans": [\n    {\n      "code": "1-206",\n      "network": "MTN",\n      "dataSize": "1GB",\n      "validity": "30 days",\n      "appPrice": 350,\n      "developerPrice": ${Math.round(350 * (1 - discountPercent / 100))}\n    }\n  ]\n}`,
                  },
                  {
                    method: 'POST', path: '/api/v1/developer/purchase-data', auth: true,
                    desc: 'Purchase data for a recipient. Deducts developer price from your wallet.',
                    body: `{\n  "phoneNumber": "08012345678",    // 11-digit recipient\n  "planCode": "1-206",              // from /data-plans\n  "idempotencyKey": "uuid"          // optional, prevents duplicates\n}`,
                    response: `{\n  "success": true,\n  "status": "completed",\n  "transactionId": "uuid",\n  "data": {\n    "planCode": "1-206",\n    "network": "MTN",\n    "dataSize": "1GB",\n    "phoneNumber": "08012345678",\n    "amount": ${Math.round(350 * (1 - discountPercent / 100))},\n    "deliveryReference": "AMG-XXXXX"\n  },\n  "newBalance": 4650\n}`,
                  },
                ].map(ep => (
                  <div key={ep.path} className="card" style={{ marginBottom: 20, padding: '24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800, letterSpacing: '.05em', background: ep.method === 'GET' ? 'rgba(52,211,153,.12)' : 'rgba(96,165,250,.12)', color: ep.method === 'GET' ? C.green : C.blue }}>{ep.method}</span>
                      <code style={{ fontFamily: 'monospace', fontSize: 14, color: C.purple }}>{ep.path}</code>
                      <span style={{ fontSize: 11, color: C.yellow, background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.2)', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>x-api-key required</span>
                    </div>
                    <p style={{ fontSize: 14, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>{ep.desc}</p>
                    {'body' in ep && ep.body && (
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Request Body</p>
                        <div className="code-block">
                          <pre style={{ color: '#86EFAC', whiteSpace: 'pre-wrap' }}>{ep.body}</pre>
                        </div>
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Response</p>
                      <div className="code-block">
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
                          <CopyBtn text={ep.response} />
                        </div>
                        <pre style={{ color: '#E2E8F0', whiteSpace: 'pre-wrap' }}>{ep.response}</pre>
                      </div>
                    </div>
                  </div>
                ))}

                {/* code samples */}
                <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 18 }}>Code Examples</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {(['curl', 'node', 'php', 'python', 'go', 'java'] as const).map(l => (
                      <button key={l} className={`tab${docLang === l ? ' active' : ''}`} onClick={() => setDocLang(l)} style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 700, letterSpacing: '.06em' }}>{l === 'node' ? 'Node.js' : l === 'curl' ? 'cURL' : l.charAt(0).toUpperCase() + l.slice(1)}</button>
                    ))}
                  </div>
                  <div className="code-block">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                      <CopyBtn text={codeSamples[docLang]} label="Copy code" />
                    </div>
                    <pre style={{ color: '#E2E8F0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13 }}>{codeSamples[docLang]}</pre>
                  </div>
                </div>

                {/* error codes */}
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 18 }}>Error Codes</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { code: 401, msg: 'Unauthorized', desc: 'Missing or invalid API key.' },
                      { code: 400, msg: 'insufficient_balance', desc: 'Wallet balance too low. Top up via your bank transfer details.' },
                      { code: 400, msg: 'delivery_failed', desc: 'Amigo delivery service returned failure. No charge applied.' },
                      { code: 400, msg: 'Plan not found', desc: 'The planCode supplied does not exist or is inactive.' },
                      { code: 202, msg: 'processing', desc: 'Identical idempotency key is still processing. Wait and poll.' },
                      { code: 408, msg: 'timeout', desc: 'Delivery service timed out. Check developer activity and retry with new idempotency key.' },
                    ].map(e => (
                      <div key={e.code + e.msg} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)' }}>
                        <span style={{ padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 800, background: e.code === 400 || e.code === 401 ? 'rgba(248,113,113,.12)' : e.code === 202 ? 'rgba(251,191,36,.12)' : 'rgba(96,165,250,.12)', color: e.code === 400 || e.code === 401 ? C.red : e.code === 202 ? C.yellow : C.blue, flexShrink: 0 }}>{e.code}</span>
                        <div>
                          <code style={{ fontFamily: 'monospace', fontSize: 13, color: C.purple }}>{e.msg}</code>
                          <p style={{ fontSize: 12, color: C.muted, marginTop: 3, lineHeight: 1.5 }}>{e.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* WALLET TAB */}
            {dashTab === 'wallet' && (
              <div className="fu">
                <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 8 }}>Wallet</h2>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Fund your wallet via bank transfer. API calls deduct from your balance.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginBottom: 28 }}>
                  <div className="gradient-border" style={{ padding: '28px 24px' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>Available Balance</p>
                    <p style={{ fontSize: 42, fontWeight: 900, color: C.teal, letterSpacing: '-.04em', marginBottom: 4 }}>{fmt(user.walletBalance)}</p>
                    <p style={{ fontSize: 12, color: C.muted }}>Auto-deducted per API call at developer price</p>
                  </div>
                  <div className="card" style={{ padding: '28px 24px' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 16 }}>Bank Transfer Details</p>
                    {user.accountNumber ? (
                      <>
                        {[
                          { label: 'Account Number', value: user.accountNumber },
                          { label: 'Bank', value: user.bankName || 'Wema Bank' },
                          { label: 'Account Name', value: `${user.firstName} ${user.lastName}` },
                        ].map(d => (
                          <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <p style={{ fontSize: 12, color: C.muted }}>{d.label}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <p style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: d.label === 'Account Number' ? 'monospace' : 'inherit' }}>{d.value}</p>
                              {d.label === 'Account Number' && <CopyBtn text={d.value} />}
                            </div>
                          </div>
                        ))}
                        <p style={{ fontSize: 12, color: C.muted, padding: '10px 14px', borderRadius: 8, background: 'rgba(52,211,153,.06)', border: '1px solid rgba(52,211,153,.15)', lineHeight: 1.6 }}>
                          Transfer any amount to fund your wallet. Credit reflects within minutes.
                        </p>
                      </>
                    ) : (
                      <p style={{ fontSize: 14, color: C.muted }}>Bank account pending setup. Contact support if this persists.</p>
                    )}
                  </div>
                </div>

                {/* deposit history */}
                <div className="card" style={{ padding: '20px 22px' }}>
                  <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 18 }}>Deposit History</p>
                  {deposits.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 20px', color: C.muted }}>
                      <p>No deposits yet. Transfer to your account number above.</p>
                    </div>
                  ) : deposits.map((d, i) => (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < deposits.length - 1 ? `1px solid rgba(255,255,255,.04)` : undefined }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52,211,153,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {Ic.deposit()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: 13 }}>{d.senderName || 'Bank Transfer'}</p>
                        <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{d.narration || 'Wallet deposit'} · {fmtDate(d.createdAt)}</p>
                      </div>
                      <p style={{ fontWeight: 800, fontSize: 14, color: C.green }}>+{fmt(d.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TRANSACTIONS TAB */}
            {dashTab === 'transactions' && (
              <div className="fu">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-.02em' }}>API Transaction History</h2>
                    <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{devTxns.length} total calls</p>
                  </div>
                  <div style={{ display: 'flex', gap: 20, textAlign: 'center' }}>
                    <div><p style={{ fontSize: 22, fontWeight: 900, color: C.green }}>{successCount}</p><p style={{ fontSize: 11, color: C.muted }}>Success</p></div>
                    <div><p style={{ fontSize: 22, fontWeight: 900, color: C.red }}>{failCount}</p><p style={{ fontSize: 11, color: C.muted }}>Failed</p></div>
                    <div><p style={{ fontSize: 22, fontWeight: 900, color: C.purple }}>{fmt(totalSpend)}</p><p style={{ fontSize: 11, color: C.muted }}>Total Spend</p></div>
                  </div>
                </div>

                <div className="card" style={{ overflow: 'hidden' }}>
                  {devTxns.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: C.muted }}>
                      <p style={{ fontSize: 32, marginBottom: 12 }}>∿</p>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>No API calls yet</p>
                      <p>Make your first call using the docs above!</p>
                    </div>
                  ) : devTxns.map((tx, i) => (
                    <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: i < devTxns.length - 1 ? `1px solid rgba(255,255,255,.04)` : undefined, transition: 'background .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.02)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: tx.status === 'success' ? 'rgba(52,211,153,.1)' : 'rgba(248,113,113,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {tx.status === 'success' ? Ic.check(C.green, 16) : Ic.x(C.red, 15)}
                      </div>
                      <div style={{ flex: '2', minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{tx.network} · {tx.planCode}</p>
                        <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>→ {tx.phoneNumber}</p>
                      </div>
                      <div style={{ flex: '1', display: 'none' }} className="hide-mobile" />
                      <p style={{ fontSize: 11, color: C.muted, flexShrink: 0 }} >{fmtDate(tx.createdAt)}</p>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontWeight: 800, fontSize: 14, color: tx.status === 'success' ? C.red : C.muted }}>−{fmt(tx.developerPrice)}</p>
                        <span className={`pill ${tx.status}`} style={{ marginTop: 4, display: 'inline-flex' }}><span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }} />{tx.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
}
