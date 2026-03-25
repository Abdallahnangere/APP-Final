'use client';
/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef, useCallback } from 'react';
import { generateIdempotencyKey } from '@/lib/utils';
import { NIGERIAN_BANKS } from '@/lib/nigerianBanks';
import SupportChat from '@/app/support/page';

/* ─────────────── TYPES ─────────────── */
type User = {
  id: string; firstName: string; lastName: string; phone: string;
  email?: string;
  walletBalance: number; cashbackBalance: number; referralBonus: number;
  referralBalance?: number; referralId?: string; totalGbPurchased?: number;
  accountNumber: string; bankName: string; theme: string;
  notificationsEnabled: boolean; hapticsEnabled: boolean;
  isDeveloper?: boolean; developerDiscountPercent?: number;
  createdAt: string;
};
type Transaction = {
  id: string; type: string; description: string; amount: number;
  status: string; network?: string; phoneNumber?: string;
  productName?: string; createdAt: string; receipt?: Record<string,unknown>; amigoRef?: string;
};
type Deposit = { id: string; amount: number; senderName: string; createdAt: string; narration: string; };
type Plan = { id: string; network: string; networkId: number; planId: number; dataSize: string; validity: string; price: number; };
type DeveloperPlan = {
  id: string;
  code: string;
  network: string;
  networkId: number;
  planId: number;
  dataSize: string;
  validity: string;
  appPrice: number;
  developerPrice: number;
};
type DeveloperApiTx = {
  id: string;
  status: string;
  phoneNumber: string;
  network: string;
  planCode: string;
  planName?: string;
  developerPrice: number;
  appPrice: number;
  message?: string;
  createdAt: string;
};
type Product = { id: string; name: string; description: string; price: number; imageUrl: string; imageBase64?: string; inStock: boolean; shippingTerms: string; pickupTerms: string; category: string; deliveryAddress?: string; };
type SimActivation = { id: string; status: string; createdAt: string; serialNumber?: string; };
type ReferralUser = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  totalGbPurchased: number;
  hasReachedTarget: boolean;
  rewardUnlocked: boolean;
  createdAt: string;
};
type EarnSummary = {
  referralId: string;
  referralBalance: number;
  totalGbPurchased: number;
  totalReferrals: number;
  qualifiedReferrals: number;
  rewardAmount: number;
  targetGb: number;
  inviteMessage: string;
};
type WithdrawalItem = {
  id: string;
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
};
type BankOption = { id: string; code: string; name: string; };
type ElectricityProvider = { itemCode: string; name: string; type: 'prepaid' | 'postpaid' };
type ElectricityStatus = 'idle' | 'verifying' | 'verified' | 'failed' | 'processing' | 'success';

/* ─────────────── CONSTANTS ─────────────── */
const BLUE = '#0071E3';

/* ─────────────── SOUNDS ─────────────── */
const playSound = (type: 'tap' | 'success' | 'error' | 'cash' | 'confirm') => {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const g = ctx.createGain();
    g.connect(ctx.destination);

    if (type === 'tap') {
      const o = ctx.createOscillator();
      o.connect(g);
      o.type = 'sine';
      o.frequency.setValueAtTime(520, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.06);
      g.gain.setValueAtTime(0.07, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.06);
    } else if (type === 'success') {
      [[523, 0], [659, 0.1], [784, 0.2]].forEach(([freq, delay]) => {
        const o = ctx.createOscillator();
        o.connect(g);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        g.gain.setValueAtTime(0.1, ctx.currentTime + delay);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.18);
        o.start(ctx.currentTime + delay);
        o.stop(ctx.currentTime + delay + 0.18);
      });
    } else if (type === 'cash') {
      // Coin/cash register sound
      [[880, 0], [1100, 0.07], [1320, 0.14], [1760, 0.21]].forEach(([freq, delay]) => {
        const o = ctx.createOscillator();
        o.connect(g);
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        g.gain.setValueAtTime(0.12, ctx.currentTime + delay);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.12);
        o.start(ctx.currentTime + delay);
        o.stop(ctx.currentTime + delay + 0.12);
      });
    } else if (type === 'error') {
      const o = ctx.createOscillator();
      o.connect(g);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(200, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.2);
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.2);
    } else if (type === 'confirm') {
      [[440, 0], [554, 0.1]].forEach(([freq, delay]) => {
        const o = ctx.createOscillator();
        o.connect(g);
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        g.gain.setValueAtTime(0.08, ctx.currentTime + delay);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.15);
        o.start(ctx.currentTime + delay);
        o.stop(ctx.currentTime + delay + 0.15);
      });
    }
    setTimeout(() => ctx.close(), 600);
  } catch { /* ignore audio errors */ }
};
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
const BANK_TRANSFER_SERVICE_CHARGE = 200;
const BANK_TRANSFER_MIN_AMOUNT = 100;

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
  messageSquare: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  sendIcon: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  code: (color: string, size = 24) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
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
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes breathe{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.06);opacity:1}}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    @keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    @keyframes floatUp{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-20px);opacity:0}}
    @keyframes typing{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-10px)}}
    @keyframes sheetRise{0%{opacity:0;transform:translateY(24px) scale(.985)}100%{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes softPulse{0%,100%{transform:scale(1);opacity:.08}50%{transform:scale(1.06);opacity:.14}}
    @keyframes listRise{0%{opacity:0;transform:translateY(10px) scale(.992)}100%{opacity:1;transform:translateY(0) scale(1)}}
    .slide-up{animation:slideUp .32s cubic-bezier(.32,.72,0,1) both}
      @keyframes coachPop{0%{opacity:0;transform:translateY(8px) scale(.85)}100%{opacity:1;transform:translateY(0) scale(1)}}
      @keyframes coachRing{0%,100%{box-shadow:0 0 0 0 rgba(0,113,227,.6),0 4px 14px rgba(0,113,227,.22)}65%{box-shadow:0 0 0 9px rgba(0,113,227,.0),0 4px 14px rgba(0,113,227,.22)}}
      @keyframes coachBadgePop{0%{opacity:0;transform:scale(.55) rotate(-10deg)}70%{transform:scale(1.14) rotate(3deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
      .contact-btn-coach{animation:coachRing 1.8s ease-in-out infinite !important;background:linear-gradient(135deg,#0047CC,#0071E3) !important;border-color:transparent !important}
    .fade-in{animation:fadeIn .2s ease both}
    .fade-up-scale{animation:fadeUpScale .4s cubic-bezier(.16,.1,0,1) both}
    .receipt-shell{animation:sheetRise .36s cubic-bezier(.16,.84,.25,1) both}
    .ledger-card{transition:all .22s cubic-bezier(.2,.84,.22,1)}
    .ledger-card:active{transform:scale(.985)}
    .stagger-card{animation:listRise .34s cubic-bezier(.2,.84,.22,1) both;will-change:transform,opacity}
    .haptic-pulse{transition:filter .12s ease,transform .12s ease}
    .haptic-pulse:active{filter:brightness(.97) saturate(1.05);transform:scale(.986)}
    .tactile-btn{transition:all .22s cubic-bezier(.2,.84,.22,1)}
    .tactile-btn:active{transform:scale(.985)}
    .card{border-radius:16px;background:var(--card);border:1px solid var(--border);box-shadow:0 8px 32px rgba(0,0,0,0.24),inset 0 1px 0 rgba(255,255,255,0.07);transition:all .3s cubic-bezier(.16,.1,0,1)}
    .card:hover{box-shadow:0 12px 40px rgba(0,0,0,0.32),inset 0 1px 0 rgba(255,255,255,0.07);transform:translateY(-2px)}
    @media (prefers-reduced-motion: reduce){
      .slide-up,.fade-in,.fade-up-scale,.receipt-shell,.stagger-card{animation:none !important}
      .ledger-card,.tactile-btn,.haptic-pulse{transition:none !important}
    }
  `}</style>
);

/* ─────────────── PIN KEYBOARD ─────────────── */
function PinKeyboard({ onComplete, onClose, title = 'Enter your 4-digit PIN', subtitle = '', pinAction }: {
  onComplete: (pin: string) => void; onClose: () => void; title?: string; subtitle?: string; pinAction?: "buy-data" | "buy-product" | "sim-pay" | "transfer" | "bank-transfer" | "withdraw" | "electricity" | "airtime" | null;
}) {
  const [pin, setPin] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const press = (d: string) => {
    if (pin.length >= 4) return;
    const np = pin + d;
    setPin(np);
    
    // Haptic + sound feedback
    if (navigator.vibrate) navigator.vibrate(10);
    playSound('tap');
    
    if (np.length === 4) {
      // Force keyboard dismissal
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.blur();
          inputRef.current.type = 'text'; // Change type to force keyboard close
        }
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }, 50);
      
      setTimeout(() => onComplete(np), 200);
    }
  };
  
  const del = () => {
    setPin(p => p.slice(0, -1));
    if (navigator.vibrate) navigator.vibrate(5);
  };

  return (
    <div style={{ position:'fixed',top:0,right:0,bottom:0,left:0,zIndex:200,background:'rgba(0,8,20,.54)',display:'flex',alignItems:'flex-end',backdropFilter:'blur(12px)' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="slide-up" style={{ width:'100%',background:'var(--card)',borderRadius:'30px 30px 0 0',padding:'24px 20px 32px',position:'relative',boxShadow:'0 -24px 60px rgba(0,0,0,.28)',overflow:'hidden' }}>
        <div style={{ position:'absolute',right:-40,top:-46,width:150,height:150,borderRadius:'50%',background:'rgba(0,113,227,.07)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',left:-34,top:40,width:110,height:110,borderRadius:'50%',background:'rgba(90,200,250,.06)',pointerEvents:'none' }} />
        {/* Hidden input for keyboard management */}
        <input 
          ref={inputRef}
          type="tel" 
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          style={{ position:'absolute',opacity:0,width:0,height:0 }}
          onKeyDown={e => {
            if (e.key >= '0' && e.key <= '9' && pin.length < 4) press(e.key);
            if (e.key === 'Backspace') del();
            if (e.key === 'Enter' && pin.length === 4) onComplete(pin);
          }}
        />
        
        <div style={{ position:'relative',zIndex:1 }}>
          <div style={{ width:48,height:5,borderRadius:999,background:'var(--border)',margin:'0 auto 18px' }} />
          <p style={{ textAlign:'center',fontWeight:800,fontSize:20,color:'var(--text)',marginBottom:6,letterSpacing:'-0.02em' }}>{title}</p>
          {subtitle && <p style={{ textAlign:'center',fontSize:14,color:'var(--text-secondary)',marginBottom:24,lineHeight:1.6,maxWidth:320,marginLeft:'auto',marginRight:'auto' }}>{subtitle}</p>}
        </div>
        
        {/* PIN dots */}
        <div style={{ display:'flex',gap:14,justifyContent:'center',marginBottom:24,position:'relative',zIndex:1 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width:16,height:16,borderRadius:8,background: i<pin.length ? 'linear-gradient(135deg,#0047CC,#0071E3)' : 'var(--border)',boxShadow:i<pin.length ? '0 0 0 5px rgba(0,113,227,.12)' : 'none',transition:'all .12s cubic-bezier(.34,.1,.68,.55)',transform: i<pin.length ? 'scale(1.08)' : 'scale(1)' }} />
          ))}
        </div>
        
        {/* Keypad */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,maxWidth:300,margin:'0 auto 16px',position:'relative',zIndex:1 }}>
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k,i) => {
            const isEmpty = k === '';
            const isBackspace = k === '⌫';
            return (
              <button 
                key={i}
                onMouseDown={e => {
                  if (isEmpty) return;
                  (e.currentTarget as HTMLElement).style.background = isBackspace ? 'var(--bg-secondary)' : 'var(--border)';
                  (e.currentTarget as HTMLElement).style.transform = 'scale(0.92)';
                }}
                onMouseUp={e => {
                  (e.currentTarget as HTMLElement).style.background = isEmpty ? 'transparent' : 'linear-gradient(180deg,var(--card2),var(--bg-secondary))';
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                }}
                onTouchStart={e => {
                  if (isEmpty) return;
                  (e.currentTarget as HTMLElement).style.background = isBackspace ? 'var(--bg-secondary)' : 'var(--border)';
                  (e.currentTarget as HTMLElement).style.transform = 'scale(0.92)';
                }}
                onTouchEnd={e => {
                  (e.currentTarget as HTMLElement).style.background = isEmpty ? 'transparent' : 'linear-gradient(180deg,var(--card2),var(--bg-secondary))';
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                }}
                onClick={() => {
                  if (isEmpty) return;
                  if (isBackspace) del();
                  else press(k);
                }}
                style={{
                  height: 64,
                  borderRadius: 16,
                  background: isEmpty ? 'transparent' : 'linear-gradient(180deg,var(--card2),var(--bg-secondary))',
                  fontSize: isBackspace ? 22 : 26,
                  fontWeight: 700,
                  color: 'var(--text)',
                  border: `1px solid ${isEmpty ? 'transparent' : 'var(--border-subtle)'}`,
                  boxShadow: isEmpty ? 'none' : '0 8px 18px rgba(0,0,0,.06)',
                  transition: 'all .08s',
                  opacity: isEmpty ? 0 : 1,
                  cursor: isEmpty ? 'default' : 'pointer',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none'
                }}
              >
                {k}
              </button>
            );
          })}
        </div>
        
        <button 
          onClick={onClose}
          style={{ width:'100%',padding:'14px',background:'var(--bg-secondary)',color:'var(--text-secondary)',borderRadius:14,fontWeight:700,fontSize:15,border:'1px solid var(--border)',cursor:'pointer',position:'relative',zIndex:1 }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─────────────── RECEIPT CANVAS ─────────────── */
function Receipt({ data, onDownload, onClose, dark, autoDownload }: { data: Record<string,unknown>; onDownload: ()=>void; onClose: ()=>void; dark: boolean; autoDownload?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  const downloadPng = useCallback(async () => {
    if (typeof window === 'undefined' || !ref.current) return;
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(ref.current, { quality:1, pixelRatio:2 });
      
      // Convert data URL to blob for Android DownloadListener compatibility
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Create blob: URL that Android's DownloadListener can intercept
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `receipt-${(data.ref as string) || Date.now()}.png`;
      a.click();
      
      // Clean up the blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      
      if (onDownload) onDownload();
    } catch (err) {
      console.error('Receipt download error:', err);
    }
  }, [data, onDownload]);

  useEffect(() => {
    if (autoDownload) {
      const timer = setTimeout(() => downloadPng(), 500);
      return () => clearTimeout(timer);
    }
  }, [autoDownload, downloadPng]);

  const date = new Date(data.date as string).toLocaleString('en-NG', { dateStyle:'short', timeStyle:'short' });
  const isDataPurchase = data.type === 'data' || data.network;
  const isBankTransfer = data.type === 'bank_transfer' || data.transactionType === 'Bank Transfer';
  const isTransfer = data.type === 'transfer' || data.type === 'transfer_out' || data.type === 'transfer_in';
  const isElectricity = data.type === 'electricity_purchase' || data.transactionType === 'Electricity Purchase';
  const amount = Number(data.totalAmount || data.price || data.amount || 0);
  const refNum = ((data.ref || data.amigoRef || '—') as string).toUpperCase();
  const isElectricityPrepaid = isElectricity && String(data.meterType || '').toLowerCase() === 'prepaid';
  const electricityToken = isElectricityPrepaid ? String(data.token || '') : '';

  /* compact label/value row */
  const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:20,padding:'11px 0',borderBottom:'1px solid #F0F0F5' }}>
      <span style={{ fontSize:10,color:'#9898A0',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:13,color:'#1A1A2E',fontWeight:700,textAlign:'right',lineHeight:1.4,maxWidth:'62%',
        fontFamily: mono ? "'SF Mono','Menlo','Courier New',monospace" : 'inherit' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ position:'fixed',inset:0,zIndex:300,background:'rgba(0,8,20,.82)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',display:'flex',alignItems:'flex-end',justifyContent:'center',animation:'fadeIn .24s ease both' }}>
      <div className="slide-up receipt-shell" style={{ width:'100%',maxWidth:420,borderRadius:'28px 28px 0 0',overflow:'hidden',boxShadow:'0 -24px 80px rgba(0,0,0,.5)' }}>

        {/* ════ Downloadable receipt paper ════ */}
        <div ref={ref} style={{ background:'#FFFFFF',fontFamily:'-apple-system,"SF Pro Display",BlinkMacSystemFont,sans-serif',overflow:'hidden' }}>

          {/* ── Deep blue header ── */}
          <div style={{ background:'linear-gradient(148deg,#011F5B 0%,#0047CC 55%,#0071E3 100%)',padding:'26px 22px 0',position:'relative',overflow:'hidden' }}>
            {/* Decorative geometry – large circle top-right */}
            <div style={{ position:'absolute',top:-70,right:-70,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,.05)',pointerEvents:'none' }} />
            {/* Medium circle mid-left */}
            <div style={{ position:'absolute',top:10,left:-40,width:120,height:120,borderRadius:'50%',background:'rgba(0,180,255,.06)',pointerEvents:'none',animation:'softPulse 4.8s ease-in-out infinite' }} />
            {/* Small accent dot */}
            <div style={{ position:'absolute',top:22,right:22,width:50,height:50,borderRadius:'50%',background:'rgba(255,255,255,.04)',pointerEvents:'none' }} />

            {/* Brand row */}
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22,position:'relative',zIndex:1 }}>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <div style={{ width:38,height:38,borderRadius:11,overflow:'hidden',background:'rgba(255,255,255,.12)',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(255,255,255,.2)' }}>
                  <img src="/images/logo-icon.png" alt="SaukiMart" style={{ width:27,height:27,borderRadius:7 }} />
                </div>
                <div style={{ lineHeight:1 }}>
                  <div style={{ fontSize:15,fontWeight:800,color:'#FFFFFF',letterSpacing:-0.4,marginBottom:4 }}>SaukiMart</div>
                  <div style={{ fontSize:9,fontWeight:600,color:'rgba(255,255,255,.45)',letterSpacing:'0.12em',textTransform:'uppercase' }}>Transaction Receipt</div>
                </div>
              </div>
              {/* Success badge */}
              <div style={{ display:'flex',alignItems:'center',gap:5,background:'rgba(48,209,88,.14)',border:'1px solid rgba(48,209,88,.35)',borderRadius:20,padding:'5px 10px' }}>
                <div style={{ width:6,height:6,borderRadius:'50%',background:'#30D158',boxShadow:'0 0 6px rgba(48,209,88,.7)' }} />
                <span style={{ fontSize:10,fontWeight:800,color:'#30D158',letterSpacing:'0.06em' }}>SUCCESS</span>
              </div>
            </div>

            {/* Amount hero */}
            <div style={{ textAlign:'center',paddingBottom:26,position:'relative',zIndex:1 }}>
              <div style={{ fontSize:10,fontWeight:600,color:'rgba(255,255,255,.42)',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.16em' }}>Total Amount Paid</div>
              <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'center',gap:4,lineHeight:1 }}>
                <span style={{ fontSize:22,fontWeight:800,color:'rgba(255,255,255,.55)',marginTop:8 }}>₦</span>
                <span style={{ fontSize:56,fontWeight:900,color:'#FFFFFF',letterSpacing:-2.5 }}>
                  {amount.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}
                </span>
              </div>
              {/* Ref pill */}
              <div style={{ marginTop:14,display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,padding:'5px 14px' }}>
                <span style={{ fontSize:10,color:'rgba(255,255,255,.32)',fontFamily:"'SF Mono','Menlo',monospace",letterSpacing:'0.07em' }}>REF: {refNum}</span>
              </div>
            </div>

            {/* Scalloped ticket edge — white semicircles punch into the base of the header */}
            <div style={{
              height:22, marginLeft:-1, marginRight:-1,
              backgroundImage:`radial-gradient(circle at 11px 100%, #FFFFFF 11px, transparent 11px)`,
              backgroundSize:'22px 22px', backgroundRepeat:'repeat-x', backgroundPosition:'0 0',
            }} />
          </div>

          {/* ── White paper body ── */}
          <div style={{ background:'#FFFFFF',padding:'2px 22px 8px' }}>
            {isElectricity ? (
              <>
                {isElectricityPrepaid && electricityToken && (
                  <div style={{ margin:'8px 0 14px',padding:'12px 14px',borderRadius:14,background:'linear-gradient(135deg,#F2F8FF,#EDF6FF)',border:'1px solid #D6E7FF' }}>
                    <p style={{ fontSize:10,color:'#6A7EA5',fontWeight:800,margin:0,letterSpacing:'0.09em',textTransform:'uppercase' }}>Electricity Token</p>
                    <p style={{ fontSize:22,color:'#14396B',fontWeight:900,margin:'6px 0 0',fontFamily:"'SF Mono','Menlo','Courier New',monospace",letterSpacing:'0.04em',lineHeight:1.2 }}>{electricityToken}</p>
                  </div>
                )}
                <Row label="Transaction Type" value="Electricity Purchase" />
                <Row label="DISCO" value={(data.discoName as string) || '—'} />
                <Row label="Meter Number" value={(data.meterNumber as string) || '—'} mono />
                <Row label="Customer Name" value={(data.customerName as string) || '—'} />
                <Row label="Meter Type" value={String(data.meterType || '—').toUpperCase()} />
                <Row label="Amount" value={`₦${Number(data.amount || 0).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}`} />
                <Row label="Service Charge" value={`₦${Number(data.serviceCharge || 0).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}`} />
                {data.units && <Row label="Units Purchased" value={String(data.units)} />}
                {data.flwRef && <Row label="Flutterwave Ref" value={String(data.flwRef)} mono />}
                <Row label="Payment Method" value="Wallet" />
                <Row label="Status" value={String(data.status || 'success')} />
              </>
            ) : isDataPurchase ? (
              <>
                <Row label="Network"   value={(data.network     as string) || '—'} />
                <Row label="Data Plan" value={`${(data.dataSize as string)||'—'} · ${(data.validity as string)||'—'}`} />
                <Row label="Recipient" value={(data.phoneNumber as string) || '—'} mono />
              </>
            ) : isBankTransfer ? (
              <>
                <Row label="Transaction Type" value="Bank Transfer" />
                <Row label="Bank Name" value={(data.bankName as string) || '—'} />
                <Row label="Account Number" value={(data.accountNumber as string) || '—'} mono />
                <Row label="Recipient Name" value={(data.recipientName as string) || '—'} />
                <Row label="Amount Sent" value={`₦${Number(data.amountSent || data.amount || 0).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}`} />
                <Row label="Service Charge" value={`₦${Number(data.serviceCharge || 0).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}`} />
                <Row label="Total Deducted" value={`₦${Number(data.totalDeducted || data.amount || 0).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}`} />
                <Row label="Narration" value={(data.narration as string) || '—'} />
                <Row label="Flutterwave Ref" value={(data.flutterwaveReference as string) || (data.flwReference as string) || '—'} mono />
                <Row label="Status" value={String(data.status || 'pending')} />
              </>
            ) : isTransfer ? (
              <>
                <Row label="Type" value={(data.productName || 'Wallet Transfer') as string} />
                <Row label="Recipient" value={(data.userName || '—') as string} />
                <Row label="Recipient Phone" value={(data.userPhone || '—') as string} mono />
                <Row label="Narration" value={(data.deliveryAddress || 'Instant wallet transfer') as string} />
              </>
            ) : (
              <>
                <Row label="Item"      value={(data.productName || data.itemName || '—') as string} />
                <Row label="Customer"  value={(data.userName  || '—') as string} />
                <Row label="Phone"     value={(data.userPhone || '—') as string} mono />
                {data.deliveryAddress && <Row label="Delivery" value={data.deliveryAddress as string} />}
              </>
            )}
            <Row label="Date & Time" value={date} />
          </div>

          {/* Dashed perforation strip */}
          <div style={{ margin:'4px 22px 0',height:1,backgroundImage:`repeating-linear-gradient(to right,#CFCFD8 0,#CFCFD8 6px,transparent 6px,transparent 14px)` }} />

          {/* ── Footer band ── */}
          <div style={{ background:'#F5F5F7',padding:'14px 22px 20px',textAlign:'center' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:9 }}>
              <div style={{ height:1,flex:1,background:'linear-gradient(to right,transparent,#D0D0D8)' }} />
              <span style={{ fontSize:8,fontWeight:800,color:'#B4B4BC',letterSpacing:'0.14em',textTransform:'uppercase' }}>Secured by SaukiMart</span>
              <div style={{ height:1,flex:1,background:'linear-gradient(to left,transparent,#D0D0D8)' }} />
            </div>
            <div style={{ fontSize:10,color:'#AEAEB2',lineHeight:1.8,marginBottom:4 }}>
              support@saukimart.online
            </div>
            <div style={{ fontSize:9,color:'#C8C8CC',letterSpacing:'0.05em' }}>© SaukiMart 2026 · All rights reserved</div>
          </div>

        </div>{/* end downloadable paper */}

        {/* ════ Action buttons — outside download area ════ */}
        <div style={{ background:dark?'#1C1C1E':'#FFFFFF',padding:'12px 18px 30px',display:'flex',gap:10,borderTop:`1px solid ${dark?'rgba(255,255,255,.06)':'rgba(0,0,0,.07)'}` }}>
          {isElectricityPrepaid && electricityToken && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(electricityToken);
              }}
              style={{ height:52,padding:'0 14px',borderRadius:16,background:dark?'#2C2C2E':'#F2F2F7',color:dark?'#EBEBF5':'#3A3A3C',fontWeight:700,fontSize:13,border:'none',cursor:'pointer',flexShrink:0 }}
            >
              Copy Token
            </button>
          )}
          <button
            onClick={downloadPng}
            style={{ flex:1,height:52,borderRadius:16,background:'linear-gradient(135deg,#0047CC,#0071E3)',color:'#fff',fontWeight:700,fontSize:15,border:'none',cursor:'pointer',transition:'all .25s cubic-bezier(.16,.1,0,1)',boxShadow:'0 8px 24px rgba(0,113,227,0.32)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,letterSpacing:'-0.01em' }}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 14px 36px rgba(0,113,227,0.52)';e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 8px 24px rgba(0,113,227,0.32)';e.currentTarget.style.transform='translateY(0)'}}
            onMouseDown={e=>{e.currentTarget.style.transform='scale(0.97)'}}
            onMouseUp={e=>{e.currentTarget.style.transform='translateY(-2px)'}}
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Receipt
          </button>
          <button
            onClick={onClose}
            style={{ width:52,height:52,borderRadius:16,background:dark?'#2C2C2E':'#F2F2F7',color:dark?'#EBEBF5':'#3A3A3C',fontWeight:700,fontSize:18,border:'none',cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}
            onMouseEnter={e=>{e.currentTarget.style.background=dark?'#3A3A3C':'#E5E5EA'}}
            onMouseLeave={e=>{e.currentTarget.style.background=dark?'#2C2C2E':'#F2F2F7'}}
          >
            ✕
          </button>
        </div>

      </div>
    </div>
  );
}

function ShareSaukiMartModal({
  user,
  dark,
  onClose,
  onShareSuccess,
  onToast,
  onError,
}: {
  user: User;
  dark: boolean;
  onClose: () => void;
  onShareSuccess: () => void;
  onToast: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const shareRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const firstName = (user.firstName || 'Customer').trim();
  const promoText = 'I use SaukiMart for cheap data bundles and device deals. Download SaukiMart on Android at www.saukimart.online';

  const createImageBlob = useCallback(async () => {
    if (!shareRef.current) throw new Error('Share card unavailable');
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(shareRef.current, { pixelRatio: 2, quality: 1, cacheBust: true });
    const response = await fetch(dataUrl);
    return response.blob();
  }, []);

  const downloadImage = useCallback(async () => {
    setBusy(true);
    try {
      const blob = await createImageBlob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `saukimart-share-${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 120);
      onToast('Share image downloaded');
    } catch {
      onError('Could not generate image right now');
    } finally {
      setBusy(false);
    }
  }, [createImageBlob, onError, onToast]);

  const shareViaPhone = useCallback(async () => {
    setBusy(true);
    try {
      const blob = await createImageBlob();

      // 1. Android WebView native bridge (injected by MainActivity via addJavascriptInterface)
      const androidBridge = (typeof window !== 'undefined') && (window as unknown as Record<string, unknown>)['saukiShareFile'];
      if (typeof androidBridge === 'function') {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          (androidBridge as (b: string, m: string, n: string) => void)(base64, 'image/png', 'saukimart-share.png');
        };
        reader.readAsDataURL(blob);
        onToast('Opening share sheet…');
        onShareSuccess();
        onClose();
        return;
      }

      // 2. Standard Web Share API (browser / PWA)
      const file = new File([blob], 'saukimart-share.png', { type: 'image/png' });
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({ title: 'SaukiMart', text: promoText, files: [file] });
          onToast('Shared successfully');
          onShareSuccess();
          onClose();
          return;
        } catch (shareError: unknown) {
          const isAbort = shareError instanceof Error && shareError.name === 'AbortError';
          if (isAbort) return;
          try {
            await navigator.share({ title: 'SaukiMart', text: promoText, url: 'https://www.saukimart.online' });
            onToast('Shared successfully');
            onShareSuccess();
            onClose();
            return;
          } catch {
            // fall through to download
          }
        }
      }

      // 3. Last resort: download
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `saukimart-share-${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 120);
      onToast('Image downloaded. Share it on WhatsApp status!');
    } catch {
      onError('Unable to open phone share right now');
    } finally {
      setBusy(false);
    }
  }, [createImageBlob, onError, onShareSuccess, onToast, promoText]);

  const copyMessage = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promoText);
      onToast('Invite message copied');
    } catch {
      onError('Clipboard not available on this device');
    }
  }, [onError, onToast, promoText]);

  return (
    <div onClick={onClose} style={{ position:'fixed',inset:0,zIndex:320,background:'rgba(0,8,20,.72)',backdropFilter:'blur(16px)',display:'flex',alignItems:'flex-end',justifyContent:'center' }}>
      <div onClick={(e)=>e.stopPropagation()} className="slide-up" style={{ width:'100%',maxWidth:430,background:dark?'#0F1625':'#F8FBFF',borderRadius:'30px 30px 0 0',padding:'18px 16px 28px',border:`1px solid ${dark?'rgba(255,255,255,.08)':'rgba(0,0,0,.08)'}` }}>
        <div style={{ width:54,height:5,borderRadius:999,background:dark?'rgba(255,255,255,.2)':'rgba(0,0,0,.14)',margin:'0 auto 14px' }} />
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
          <div>
            <p style={{ fontSize:20,fontWeight:900,color:dark?'#F4F8FF':'#102246' }}>Share SaukiMart</p>
            <p style={{ fontSize:12,color:dark?'#A7B6CF':'#5E6F90',marginTop:3 }}>Generate a branded image and share instantly</p>
          </div>
          <button onClick={onClose} style={{ width:36,height:36,borderRadius:10,background:dark?'rgba(255,255,255,.08)':'rgba(16,34,70,.08)',color:dark?'#E7EDFB':'#17386A',fontWeight:800 }}>X</button>
        </div>

        <div style={{ background:dark?'rgba(255,255,255,.03)':'rgba(0,71,204,.04)',border:'1px solid rgba(0,113,227,.2)',borderRadius:20,padding:10,marginBottom:14 }}>
          <div ref={shareRef} style={{ borderRadius:18,overflow:'hidden',background:'#FFFFFF',boxShadow:'0 18px 34px rgba(7,18,44,.16)' }}>
            <div style={{ background:'linear-gradient(140deg,#011A4D 0%,#003EAD 58%,#0071E3 100%)',padding:'18px 16px 16px',position:'relative',color:'#fff' }}>
              <div style={{ position:'absolute',right:-36,top:-42,width:140,height:140,borderRadius:'50%',background:'rgba(255,255,255,.09)' }} />
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',position:'relative',zIndex:1 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <img src="/images/logo-icon.png" alt="SaukiMart" style={{ width:34,height:34,borderRadius:9,border:'1px solid rgba(255,255,255,.24)' }} />
                  <div>
                    <p style={{ fontSize:14,fontWeight:800 }}>SaukiMart</p>
                    <p style={{ fontSize:10,opacity:.78,letterSpacing:'0.07em',textTransform:'uppercase' }}>Data and Devices</p>
                  </div>
                </div>
                <span style={{ fontSize:10,fontWeight:800,letterSpacing:'0.07em',background:'rgba(48,209,88,.16)',border:'1px solid rgba(48,209,88,.42)',borderRadius:999,padding:'5px 9px',color:'#A6F6BF' }}>TRUSTED</span>
              </div>
              <p style={{ fontSize:20,fontWeight:900,lineHeight:1.2,margin:'16px 0 6px',position:'relative',zIndex:1 }}>{firstName} recommends SaukiMart</p>
              <p style={{ fontSize:12,opacity:.86,position:'relative',zIndex:1 }}>Fast airtime and data delivery, secure wallet transfers, and responsive support.</p>
            </div>
            <div style={{ padding:'14px 16px 16px' }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                  {[
                    { src:'/images/mtn.png', alt:'MTN' },
                    { src:'/images/glo.png', alt:'GLO' },
                    { src:'/images/airtel.png', alt:'Airtel' },
                  ].map((net) => (
                    <div key={net.alt} style={{ width:26,height:26,borderRadius:999,background:'#F2F6FF',border:'1px solid #D6E2F9',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden' }}>
                      <img src={net.src} alt={net.alt} style={{ width:18,height:18,objectFit:'contain' }} />
                    </div>
                  ))}
                </div>
                <img src="/images/google-play-badge.png" alt="Get it on Google Play" style={{ width:136,height:'auto',display:'block' }} />
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 10px',borderRadius:10,background:'#F7FAFF',border:'1px solid #E1EAFA' }}>
                <p style={{ fontSize:10,color:'#4B628B' }}>Download SaukiMart on Android at www.saukimart.online</p>
                <p style={{ fontSize:11,fontWeight:800,color:'#0052C7' }}>saukimart.online</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10 }}>
          <button onClick={downloadImage} disabled={busy} style={{ padding:'13px 10px',borderRadius:12,background:dark?'rgba(255,255,255,.08)':'#EAF1FF',color:dark?'#EAF1FF':'#18427D',fontSize:13,fontWeight:800,border:'1px solid rgba(0,113,227,.25)',opacity:busy ? .7 : 1 }}>
            {busy ? 'Preparing...' : 'Download Image'}
          </button>
          <button onClick={shareViaPhone} disabled={busy} style={{ padding:'13px 10px',borderRadius:12,background:'linear-gradient(135deg,#0047CC,#0071E3)',color:'#fff',fontSize:13,fontWeight:800,border:'1px solid rgba(255,255,255,.08)',opacity:busy ? .7 : 1 }}>
            {busy ? 'Please wait...' : 'Share via Phone'}
          </button>
        </div>

        <button onClick={copyMessage} style={{ width:'100%',padding:'12px 10px',borderRadius:12,background:dark?'rgba(255,255,255,.06)':'#EFF4FB',color:dark?'#D8E2F5':'#2A3F67',fontSize:13,fontWeight:700,border:`1px solid ${dark?'rgba(255,255,255,.08)':'rgba(20,52,99,.12)'}` }}>
          Copy Invite Message
        </button>
      </div>
    </div>
  );
}

/* ─────────────── MAIN APP ─────────────── */
export default function AppPage() {
  const [screen, setScreen] = useState<'splash'|'login'|'register'|'registered'|'home'|'data-networks'|'data-phone'|'data-plans'|'buy-confirm'|'store'|'product'|'transactions'|'deposits'|'profile'|'change-pin'|'sim-activation'|'notifications'|'about'|'transfer'|'bank-transfer'|'chat'|'earn'|'electricity'|'airtime'|'developer-terms'|'developer-dashboard'>('splash');
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState<User|null>(null);
  const [token, setToken] = useState('');

  // Form states
  const [loginPhone, setLoginPhone] = useState('');
  const [regForm, setRegForm] = useState({ firstName:'',lastName:'',phone:'',pin:'',confirmPin:'',referralId:'' });
  const [agreed, setAgreed] = useState(false);

  // App data
  const [broadcasts, setBroadcasts] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [simActivations, setSimActivations] = useState<SimActivation[]>([]);
  const [developerPlans, setDeveloperPlans] = useState<DeveloperPlan[]>([]);
  const [developerTx, setDeveloperTx] = useState<DeveloperApiTx[]>([]);
  const [developerDocs, setDeveloperDocs] = useState<{ baseUrl: string; plansEndpoint: string; purchaseEndpoint: string; discountPercent: number }>({
    baseUrl: 'https://www.saukimart.online',
    plansEndpoint: '/api/v1/developer/data-plans',
    purchaseEndpoint: '/api/v1/developer/purchase-data',
    discountPercent: 0,
  });
  const [developerApiPreview, setDeveloperApiPreview] = useState('');
  const [freshDeveloperKey, setFreshDeveloperKey] = useState('');
  const [developerBusy, setDeveloperBusy] = useState(false);
  const [devDashTab, setDevDashTab] = useState<'keys'|'plans'|'transactions'|'install'>('keys');

  // Selection
  const [selectedNetwork, setSelectedNetwork] = useState<typeof NETWORKS[0]|null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan|null>(null);
  const [buyPhone, setBuyPhone] = useState('');
    const [contactPickerOpen, setContactPickerOpen] = useState(false);
    const [recentRecipients, setRecentRecipients] = useState<string[]>([]);
    const [showContactCoach, setShowContactCoach] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product|null>(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [showShareModal, setShowShareModal] = useState(false);
  const [showShareCoach, setShowShareCoach] = useState(false);
  const [shareModalGuardUntil, setShareModalGuardUntil] = useState(0);
  const [shareFabAnchor, setShareFabAnchor] = useState<{ x: number; y: number } | null>(null);
  const [cashbackToast, setCashbackToast] = useState('');
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinAction, setPinAction] = useState<'buy-data'|'buy-product'|'sim-pay'|'transfer'|'bank-transfer'|'withdraw'|'electricity'|'airtime'|null>(null);
  const [receipt, setReceipt] = useState<Record<string,unknown>|null>(null);
  const [txFilter, setTxFilter] = useState<'all'|'electricity'|'airtime'|'bank-transfer'>('all');
  const [isBuyingData, setIsBuyingData] = useState(false);
  const [buyDataProgressStage, setBuyDataProgressStage] = useState(0);
  const [earnSummary, setEarnSummary] = useState<EarnSummary|null>(null);
  const [referralUsers, setReferralUsers] = useState<ReferralUser[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [withdrawForm, setWithdrawForm] = useState({ amount:'', bankCode:'', bankName:'', accountNumber:'', accountName:'' });
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawResolving, setWithdrawResolving] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [electricityProviders, setElectricityProviders] = useState<ElectricityProvider[]>([]);
  const [electricityProviderSearch, setElectricityProviderSearch] = useState('');
  const [electricityProviderOpen, setElectricityProviderOpen] = useState(false);
  const [electricityStatus, setElectricityStatus] = useState<ElectricityStatus>('idle');
  const [electricitySummaryOpen, setElectricitySummaryOpen] = useState(false);
  const [electricitySuccess, setElectricitySuccess] = useState<Record<string, unknown> | null>(null);
  const [electricityFailure, setElectricityFailure] = useState('');
  const [electricityIdempotencyKey, setElectricityIdempotencyKey] = useState('');
  const [electricityForm, setElectricityForm] = useState({
    itemCode: '',
    discoName: '',
    meterType: 'prepaid' as 'prepaid' | 'postpaid',
    meterNumber: '',
    amount: '',
    phoneNumber: '',
    email: '',
    customerName: '',
    verified: false,
  });

  // Airtime states
  const [airtimeNetwork, setAirtimeNetwork] = useState<'MTN' | 'Airtel' | 'GLO' | '9mobile' | ''>('');
  const [airtimePhone, setAirtimePhone] = useState('');
  const [airtimeAmount, setAirtimeAmount] = useState('');
  const [airtimeSummaryOpen, setAirtimeSummaryOpen] = useState(false);
  const [airtimeStatus, setAirtimeStatus] = useState<'idle'|'processing'|'success'|'failed'>('idle');
  const [airtimeSuccess, setAirtimeSuccess] = useState<Record<string, unknown> | null>(null);
  const [airtimeFailure, setAirtimeFailure] = useState('');
  const [airtimeIdempotencyKey, setAirtimeIdempotencyKey] = useState('');

  // Transfer states
  const [transferPhone, setTransferPhone] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [transferRecipient, setTransferRecipient] = useState<{name:string; phone:string; email?:string}|null>(null);
  const [transferLoading, setTransferLoading] = useState(false);

  // Bank transfer states
  const [bankTransferBankSearch, setBankTransferBankSearch] = useState('');
  const [bankTransferBankCode, setBankTransferBankCode] = useState('');
  const [bankTransferBankName, setBankTransferBankName] = useState('');
  const [bankTransferAccountNumber, setBankTransferAccountNumber] = useState('');
  const [bankTransferAccountName, setBankTransferAccountName] = useState('');
  const [bankTransferAmount, setBankTransferAmount] = useState('');
  const [bankTransferNarration, setBankTransferNarration] = useState('');
  const [bankTransferVerifyState, setBankTransferVerifyState] = useState<'idle'|'verifying'|'verified'|'failed'>('idle');
  const [bankTransferError, setBankTransferError] = useState('');
  const [bankTransferSummaryOpen, setBankTransferSummaryOpen] = useState(false);
  const [bankTransferProcessing, setBankTransferProcessing] = useState(false);

  // Product delivery states
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryPostalCode, setDeliveryPostalCode] = useState('');
  const [purchaseIdempotencyKey, setPurchaseIdempotencyKey] = useState<string|null>(null);
  const [simSerial, setSimSerial] = useState('');
  const [simFront, setSimFront] = useState<string|null>(null);
  const [simBack, setSimBack] = useState<string|null>(null);
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [storedPhone, setStoredPhone] = useState('');
  const [isReturningUserPIN, setIsReturningUserPIN] = useState(false);

  const prevCashbackRef = useRef<number>(0);
  const hasSeenCashbackRef = useRef(false);
  const screenHistoryRef = useRef<string[]>([]);
  const isBackNavigationRef = useRef(false);
  const shareFabRef = useRef<HTMLDivElement | null>(null);

  const authHeader = useCallback(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token]);
  const referralBalance = user?.referralBalance ?? user?.referralBonus ?? 0;
  const filteredTransactions = txFilter === 'electricity'
    ? transactions.filter((tx) => tx.type === 'electricity_purchase')
    : txFilter === 'airtime'
    ? transactions.filter((tx) => tx.type === 'airtime_purchase')
    : txFilter === 'bank-transfer'
    ? transactions.filter((tx) => tx.type === 'bank_transfer')
    : transactions;

  const showToast = (msg: string) => { playSound('success'); setToast(msg); setTimeout(() => setToast(''), 3000); };
  const showError = (msg: string) => { playSound('error'); setError(msg); setTimeout(() => setError(''), 4000); };

  const openShareModal = useCallback(() => {
    if (Date.now() < shareModalGuardUntil) return;
    setShowShareModal(true);
  }, [shareModalGuardUntil]);

  const closeShareModal = useCallback(() => {
    setShowShareModal(false);
    setShareModalGuardUntil(Date.now() + 280);
  }, []);

  const requestNativeFcmToken = useCallback(() => {
    if (typeof window === 'undefined') return;
    const nativeHost = window as Window & {
      SaukiMartAndroid?: {
        requestFcmToken?: () => void;
        getFcmToken?: () => string | null;
        onLoginSuccess?: () => void;
      };
      Android?: {
        requestFcmToken?: () => void;
        getFcmToken?: () => string | null;
        onLoginSuccess?: () => void;
      };
      webkit?: {
        messageHandlers?: {
          saukiMartRequestFcmToken?: { postMessage?: (message: unknown) => void };
        };
      };
    };

    try { nativeHost.SaukiMartAndroid?.onLoginSuccess?.(); } catch {}
    try { nativeHost.Android?.onLoginSuccess?.(); } catch {}
    try { nativeHost.SaukiMartAndroid?.requestFcmToken?.(); } catch {}
    try { nativeHost.Android?.requestFcmToken?.(); } catch {}
    try { nativeHost.webkit?.messageHandlers?.saukiMartRequestFcmToken?.postMessage?.({ type: 'request-fcm-token' }); } catch {}

    try {
      const token = nativeHost.SaukiMartAndroid?.getFcmToken?.() || nativeHost.Android?.getFcmToken?.();
      if (token && token.length >= 20) {
        localStorage.setItem('sm_fcm_token', token);
      }
    } catch {}
  }, []);

  const syncPushTokenToBackend = useCallback(async (authTokenOverride?: string, tokenOverride?: string) => {
    const authToken = authTokenOverride || localStorage.getItem('sm_token') || token;
    const devicePushToken = tokenOverride
      || localStorage.getItem('sm_fcm_token')
      || localStorage.getItem('sm_push_token')
      || localStorage.getItem('device_push_token');

    if (!authToken || !devicePushToken || devicePushToken.length < 20) return;

    try {
      await fetch('/api/push-token', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: devicePushToken,
          platform: 'android',
          appVersion: 'webview',
        }),
      });
    } catch {
      // Silent: this should not block auth/screen transitions.
    }
  }, [token]);

  const markShareCompleted = useCallback(() => {
    if (typeof window !== 'undefined') localStorage.setItem('sm_share_completed', '1');
    setShowShareCoach(false);
  }, []);

  const updateShareFabAnchor = useCallback(() => {
    const node = shareFabRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setShareFabAnchor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }, []);

  // Back Navigation Handler
  const goBack = useCallback(() => {
    if (screenHistoryRef.current.length > 1) {
      screenHistoryRef.current.pop(); // Remove current
      const previousScreen = screenHistoryRef.current[screenHistoryRef.current.length - 1];
      isBackNavigationRef.current = true;
      setScreen(previousScreen as any);
      setTimeout(() => { isBackNavigationRef.current = false; }, 0);
    }
  }, []);

  // Track screen changes for back navigation
  useEffect(() => {
    // Only track forward navigation, not back navigation
    if (!isBackNavigationRef.current) {
      // Don't track splash and login as "previous" screens
      if (screen !== 'splash' && screen !== 'login' && screen !== 'register' && screen !== 'registered') {
        const lastScreen = screenHistoryRef.current[screenHistoryRef.current.length - 1];
        if (lastScreen !== screen) {
          screenHistoryRef.current.push(screen);
        }
      }
    }
  }, [screen]);

  // Back Button Handler - Navigate within app instead of exiting
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handleBackButton = () => {
      window.history.pushState(null, '', window.location.href);
      goBack();
    };
    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [goBack]);

  useEffect(() => {
    const handlePushToken = (value: unknown) => {
      const raw = typeof value === 'string'
        ? value
        : typeof value === 'object' && value !== null && 'token' in (value as Record<string, unknown>)
        ? String((value as Record<string, unknown>).token || '')
        : '';
      const resolved = raw.trim();
      if (!resolved || resolved.length < 20) return;
      localStorage.setItem('sm_fcm_token', resolved);
      void syncPushTokenToBackend(undefined, resolved);
    };

    const onCustom = (event: Event) => {
      handlePushToken((event as CustomEvent).detail);
    };

    const nativeWindow = window as Window & {
      __setSaukiMartFcmToken?: (value: string) => void;
    };

    nativeWindow.__setSaukiMartFcmToken = (value: string) => {
      handlePushToken(value);
    };

    window.addEventListener('sm-fcm-token-available', onCustom as EventListener);
    window.addEventListener('sm-push-token-available', onCustom as EventListener);

    return () => {
      window.removeEventListener('sm-fcm-token-available', onCustom as EventListener);
      window.removeEventListener('sm-push-token-available', onCustom as EventListener);
      try { delete nativeWindow.__setSaukiMartFcmToken; } catch {}
    };
  }, [syncPushTokenToBackend]);

  useEffect(() => {
    if (!token) return;
    requestNativeFcmToken();
    void syncPushTokenToBackend();
    const t1 = setTimeout(() => { requestNativeFcmToken(); void syncPushTokenToBackend(); }, 500);
    const t2 = setTimeout(() => { void syncPushTokenToBackend(); }, 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [token, requestNativeFcmToken, syncPushTokenToBackend]);

  // Initialize database on app load
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS || 'saukimart2025';
        const loginRes = await fetch('/api/zmytcd/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPass })
        });
        
        if (loginRes.ok) {
          const loginData = await loginRes.json();
          const token = loginData.token;
          
          const initRes = await fetch('/api/zmytcd/init-db', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          });
          
          if (initRes.ok) {
            console.log('Database initialized successfully');
          }
        }
      } catch (err) {
        console.error('Database initialization error (non-critical):', err);
      }
    };
    
    initDatabase();
  }, []);

  // Splash
  useEffect(() => {
    setTimeout(() => {
      const saved = localStorage.getItem('sm_token');
      const savedUser = localStorage.getItem('sm_user');
      const phone = localStorage.getItem('sm_phone');
      
      // Returning user - require PIN verification
      if (saved && savedUser && phone) {
        setToken(saved);
        setUser(JSON.parse(savedUser));
        setStoredPhone(phone);
        setLoginPhone(phone);
        setDark(JSON.parse(savedUser).theme === 'dark');
        setIsReturningUserPIN(true);
        setShowPin(true);
        setScreen('login');
      } else if (phone) {
        setStoredPhone(phone);
        setLoginPhone(phone);
        setIsReturningUserPIN(false);
        setScreen('login');
      } else {
        setIsReturningUserPIN(false);
        setScreen('login');
      }
    }, 1800);
  }, []);

  // Load home data
  const loadHomeData = useCallback(async () => {
    if (!token) return;
    try {
      const [bc, tx, dep] = await Promise.all([
        fetch('/api/broadcasts', { cache: 'no-store' as RequestCache }).then(r=>r.json()),
        fetch('/api/transactions', { headers: authHeader(), cache: 'no-store' as RequestCache }).then(r=>r.json()),
        fetch('/api/deposits', { headers: authHeader(), cache: 'no-store' as RequestCache }).then(r=>r.json()),
      ]);
      setBroadcasts(Array.isArray(bc) ? bc.map((b:Record<string,unknown>)=>b.message as string) : []);
      setTransactions(Array.isArray(tx) ? tx : []);
      setDeposits(Array.isArray(dep) ? dep : []);
    } catch { /* silent */ }
  }, [token, authHeader]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const res = await fetch('/api/user', { headers: authHeader(), cache: 'no-store' as RequestCache });
    if (res.ok) {
      const u = await res.json();
      setUser(u);
      localStorage.setItem('sm_user', JSON.stringify(u));
    }
  }, [token, authHeader]);

  const loadDeveloperDashboard = useCallback(async () => {
    if (!token) return;
    setDeveloperBusy(true);
    try {
      const [credentialsRes, plansRes, txRes] = await Promise.all([
        fetch('/api/developer/credentials', { headers: authHeader(), cache: 'no-store' as RequestCache }),
        fetch('/api/developer/plans', { headers: authHeader(), cache: 'no-store' as RequestCache }),
        fetch('/api/developer/transactions?limit=80', { headers: authHeader(), cache: 'no-store' as RequestCache }),
      ]);

      if (credentialsRes.ok) {
        const c = await credentialsRes.json();
        setDeveloperDocs({
          baseUrl: c.baseUrl || 'https://www.saukimart.online',
          plansEndpoint: c.plansEndpoint || '/api/v1/developer/data-plans',
          purchaseEndpoint: c.purchaseEndpoint || '/api/v1/developer/purchase-data',
          discountPercent: Number(c.discountPercent || 0),
        });
        if (typeof c.activeApiKey === 'string' && c.activeApiKey) {
          setDeveloperApiPreview(c.activeApiKey);
        } else if (Array.isArray(c.keys) && c.keys.length > 0) {
          setDeveloperApiPreview(String(c.keys[0].preview || ''));
        }
        if (c.autoReissued) {
          showToast('Your developer key was securely reissued. Update your integrations now.');
        }
      }

      if (plansRes.ok) {
        const p = await plansRes.json();
        setDeveloperPlans(Array.isArray(p.plans) ? p.plans : []);
      }

      if (txRes.ok) {
        const t = await txRes.json();
        setDeveloperTx(Array.isArray(t.transactions) ? t.transactions : []);
      }
    } catch {
      showError('Unable to load developer dashboard');
    } finally {
      setDeveloperBusy(false);
    }
  }, [token, authHeader]);

  const loadEarnData = useCallback(async () => {
    if (!token) return;
    try {
      const [summaryRes, withdrawalsRes] = await Promise.all([
        fetch('/api/earn', { headers: authHeader(), cache: 'no-store' as RequestCache }),
        fetch('/api/withdrawals', { headers: authHeader(), cache: 'no-store' as RequestCache }),
      ]);

      const summaryData = await summaryRes.json();
      const withdrawalsData = await withdrawalsRes.json();

      if (!summaryRes.ok) throw new Error(summaryData.error || 'Failed to load earn data');
      if (!withdrawalsRes.ok) throw new Error(withdrawalsData.error || 'Failed to load withdrawals');

      setEarnSummary((summaryData.summary || null) as EarnSummary | null);
      setReferralUsers(Array.isArray(summaryData.referredUsers) ? summaryData.referredUsers as ReferralUser[] : []);
      setWithdrawals(Array.isArray(withdrawalsData.withdrawals) ? withdrawalsData.withdrawals as WithdrawalItem[] : []);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Unable to load earn data');
    }
  }, [token, authHeader]);

  const loadBanks = useCallback(async () => {
    if (!token || banks.length > 0) return;
    try {
      const res = await fetch('/api/banks', { headers: authHeader(), cache: 'no-store' as RequestCache });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load banks');
      setBanks(Array.isArray(data.banks) ? data.banks : []);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Unable to load banks');
    }
  }, [token, authHeader, banks.length]);

  const loadElectricityProviders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/electricity/providers', { headers: authHeader(), cache: 'no-store' as RequestCache });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load DISCO providers');
      setElectricityProviders(Array.isArray(data.providers) ? data.providers : []);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Unable to load DISCO providers');
    }
  }, [token, authHeader]);

  const verifyElectricityMeter = useCallback(async () => {
    if (!token) return;
    if (!electricityForm.itemCode) {
      showError('Select a DISCO provider');
      return;
    }
    if (!/^\d{11}$/.test(electricityForm.meterNumber)) {
      showError('Meter number must be 11 digits');
      return;
    }

    setElectricityStatus('verifying');
    setElectricityFailure('');
    try {
      const res = await fetch('/api/electricity/verify', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          itemCode: electricityForm.itemCode,
          meterNumber: electricityForm.meterNumber,
          meterType: electricityForm.meterType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid meter number. Please check and try again.');

      setElectricityForm((prev) => ({ ...prev, customerName: String(data.customerName || ''), verified: true }));
      setElectricityStatus('verified');
      setElectricityFailure('');
      showToast('Meter verified successfully');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Meter verification failed';
      setElectricityStatus('failed');
      setElectricityForm((prev) => ({ ...prev, customerName: '', verified: false }));
      setElectricityFailure(message);
      showError(message);
    }
  }, [token, authHeader, electricityForm.itemCode, electricityForm.meterNumber, electricityForm.meterType]);

  const resolveWithdrawalAccount = useCallback(async () => {
    if (!token) return;
    if (!withdrawForm.bankCode || !/^\d{10}$/.test(withdrawForm.accountNumber)) {
      setWithdrawError('Select a bank and enter a valid 10-digit account number');
      return;
    }

    setWithdrawResolving(true);
    setWithdrawError('');
    try {
      const res = await fetch('/api/banks/resolve', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ bankCode: withdrawForm.bankCode, accountNumber: withdrawForm.accountNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to resolve account');
      setWithdrawForm((prev) => ({ ...prev, accountName: String(data.accountName || '') }));
      showToast('Bank account verified');
    } catch (e: unknown) {
      setWithdrawForm((prev) => ({ ...prev, accountName: '' }));
      setWithdrawError(e instanceof Error ? e.message : 'Unable to resolve account');
    } finally {
      setWithdrawResolving(false);
    }
  }, [token, authHeader, withdrawForm.accountNumber, withdrawForm.bankCode]);

  const upgradeToDeveloper = useCallback(async () => {
    if (!token) return;
    setDeveloperBusy(true);
    try {
      const res = await fetch('/api/developer/upgrade', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ acceptTerms: true, termsVersion: 'v1.0' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upgrade failed');

      if (data.apiKey) {
        setFreshDeveloperKey(String(data.apiKey));
        setDeveloperApiPreview(String(data.apiKey));
      }

      await refreshUser();
      await loadDeveloperDashboard();
      showToast('Developer mode activated successfully');
      setScreen('developer-dashboard');
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Failed to activate developer mode');
    } finally {
      setDeveloperBusy(false);
    }
  }, [token, authHeader, refreshUser, loadDeveloperDashboard]);

  const rotateDeveloperKey = useCallback(async () => {
    if (!token) return;
    setDeveloperBusy(true);
    try {
      const res = await fetch('/api/developer/credentials', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ action: 'rotate' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rotate key');
      setFreshDeveloperKey(String(data.apiKey || ''));
      setDeveloperApiPreview(String(data.apiKey || data?.key?.preview || ''));
      showToast('API key rotated. Update your integrations now.');
      await loadDeveloperDashboard();
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Failed to rotate API key');
    } finally {
      setDeveloperBusy(false);
    }
  }, [token, authHeader, loadDeveloperDashboard]);

  /* ── LOAD PLANS ── */
  const loadPlans = useCallback(async (network: string) => {
    const res = await fetch(`/api/data-plans?network=${network}`, { cache: 'no-store' as RequestCache });
    const data = await res.json();
    setPlans(Array.isArray(data) ? data : []);
  }, []);

  /* ── LOAD PRODUCTS ── */
  const loadProducts = useCallback(async () => {
    const res = await fetch(`/api/products`, { cache: 'no-store' as RequestCache });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  }, []);


  useEffect(() => {
    if (screen === 'home' || screen === 'transactions') {
      loadHomeData();
      refreshUser();
    }
    if (screen === 'electricity') {
      loadElectricityProviders();
      setElectricityProviderOpen(false);
      setElectricityForm((prev) => ({
        ...prev,
        phoneNumber: prev.phoneNumber || user?.phone || '',
        email: prev.email || user?.email || `${user?.phone || ''}@saukimart.app`,
      }));
    }
  }, [screen, loadHomeData, refreshUser, loadElectricityProviders, user?.phone, user?.email]);

  useEffect(() => {
    if (!showShareCoach) return;
    updateShareFabAnchor();
    const onResize = () => updateShareFabAnchor();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    const timer = setTimeout(() => updateShareFabAnchor(), 120);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      clearTimeout(timer);
    };
  }, [showShareCoach, updateShareFabAnchor]);

  // Real-time wallet balance refresh (no caching)
  useEffect(() => {
    if (screen !== 'home' || !token) return;
    
    const refreshInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/user', { 
          headers: authHeader(),
          cache: 'no-store' as RequestCache
        });
        if (res.ok) {
          const u = await res.json();
          setUser(u);
          localStorage.setItem('sm_user', JSON.stringify(u));
        }
      } catch (err) {
        console.error('Balance refresh error:', err);
      }
    }, 2000); // Refresh every 2 seconds for instant updates

    return () => clearInterval(refreshInterval);
  }, [screen, token, authHeader]);

  // Show cashback earned toast when balance increases
  useEffect(() => {
    if (!user) return;
    if (!hasSeenCashbackRef.current) {
      hasSeenCashbackRef.current = true;
      prevCashbackRef.current = user.cashbackBalance;
      return;
    }
    const previous = prevCashbackRef.current;
    const current = user.cashbackBalance;
    if (current > previous) {
      const delta = current - previous;
      setCashbackToast(`+₦${delta.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})} cashback earned!`);
      setTimeout(() => setCashbackToast(''), 3000);
    }
    prevCashbackRef.current = current;
  }, [user]);

  // Auto-load products when store screen opens
  useEffect(() => {
    if (screen === 'store') {
      loadProducts();
    }
  }, [screen, loadProducts]);

  // Auto-load data plans when data-plans screen opens
  useEffect(() => {
    if (screen === 'data-plans' && selectedNetwork?.name) {
      loadPlans(selectedNetwork.name);
    }
  }, [screen, selectedNetwork?.name, loadPlans]);

  useEffect(() => {
    if (screen === 'developer-dashboard') {
      loadDeveloperDashboard();
    }
  }, [screen, loadDeveloperDashboard]);

  useEffect(() => {
    if (screen === 'earn') {
      loadEarnData();
      loadBanks();
      refreshUser();
    }
  }, [screen, loadEarnData, loadBanks, refreshUser]);

  useEffect(() => {
    if (!isBuyingData) {
      setBuyDataProgressStage(0);
      return;
    }
    setBuyDataProgressStage(0);
    const stageInterval = setInterval(() => {
      setBuyDataProgressStage(prev => (prev + 1) % 3);
    }, 1200);
    return () => clearInterval(stageInterval);
  }, [isBuyingData]);

  // Note: Chat system removed. Will be replaced with alternative solution.

  useEffect(() => {
    if (screen === 'data-networks' || screen === 'data-phone') {
      try {
        const seen = localStorage.getItem('dataBuyContactCoachSeen');
        if (!seen) setTimeout(() => setShowContactCoach(true), 700);
        const saved = localStorage.getItem('recentDataRecipients');
        if (saved) setRecentRecipients(JSON.parse(saved));
      } catch {}
    } else {
      setShowContactCoach(false);
    }
  }, [screen]);


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
      localStorage.setItem('sm_phone', regForm.phone);
      setStoredPhone(regForm.phone);
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
      localStorage.setItem('sm_phone', loginPhone);
      setStoredPhone(loginPhone);
      setShowPin(false);
      setScreen('home');
      window.dispatchEvent(new Event('sm-login-success'));
      const shareDone = typeof window !== 'undefined' && localStorage.getItem('sm_share_completed') === '1';
      setShowShareCoach(!shareDone);
    } catch(e:unknown) { showError(e instanceof Error ? e.message : 'Login failed'); }
    finally { setLoading(false); setShowPin(false); }
  };

  /* ── BUY DATA ── */
  /* ── CONTACT PICKER ── */
  const applySelectedContactPhone = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '');
    const local = digits.startsWith('234') && digits.length >= 13
      ? `0${digits.slice(-10)}`
      : digits.slice(-11);
    if (local.length === 11) {
      setBuyPhone(local);
      setContactPickerOpen(false);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    const handleContactEvent = (event: Event) => {
      const detail = (event as CustomEvent)?.detail as unknown;
      const candidate = typeof detail === 'string'
        ? detail
        : typeof detail === 'object' && detail !== null && 'phone' in (detail as Record<string, unknown>)
        ? String((detail as Record<string, unknown>).phone || '')
        : '';
      if (candidate) applySelectedContactPhone(candidate);
    };

    const nativeWindow = window as Window & {
      __setSaukiMartSelectedContact?: (value: string) => void;
    };

    nativeWindow.__setSaukiMartSelectedContact = (value: string) => {
      applySelectedContactPhone(value);
    };

    window.addEventListener('sm-contact-selected', handleContactEvent as EventListener);
    window.addEventListener('sm-phone-contact-selected', handleContactEvent as EventListener);

    return () => {
      window.removeEventListener('sm-contact-selected', handleContactEvent as EventListener);
      window.removeEventListener('sm-phone-contact-selected', handleContactEvent as EventListener);
      try { delete nativeWindow.__setSaukiMartSelectedContact; } catch {}
    };
  }, [applySelectedContactPhone]);

  const openContactPicker = async () => {
    if (showContactCoach) {
      setShowContactCoach(false);
      try { localStorage.setItem('dataBuyContactCoachSeen', '1'); } catch {}
    }

    // First, try Web Contact Picker API (Android Chrome, Edge)
    if (typeof window !== 'undefined' && 'contacts' in navigator) {
      try {
        const selected = await (navigator as any).contacts.select(['name', 'tel'], { multiple: false });
        if (selected?.length > 0) {
          const phoneNumber: string = selected[0].tel?.[0]?.replace(/\D/g, '') ?? '';
          if (phoneNumber && applySelectedContactPhone(phoneNumber)) {
            return;
          }
        }
      } catch (err) {
        console.log('Web Contact API unavailable or denied:', err);
      }
    }

    // Fall back to native bridges for Android
    const nativeHost = window as Window & {
      SaukiMartAndroid?: {
        openContactPicker?: () => void;
        pickPhoneContact?: () => void;
        selectContact?: () => void;
      };
      Android?: {
        openContactPicker?: () => void;
        pickPhoneContact?: () => void;
        selectContact?: () => void;
      };
      webkit?: {
        messageHandlers?: {
          saukiMartPickContact?: { postMessage?: (message: unknown) => void };
        };
      };
    };

    let nativePickerTriggered = false;
    try { nativeHost.SaukiMartAndroid?.openContactPicker?.(); nativePickerTriggered = true; } catch {}
    if (!nativePickerTriggered) {
      try { nativeHost.SaukiMartAndroid?.pickPhoneContact?.(); nativePickerTriggered = true; } catch {}
    }
    if (!nativePickerTriggered) {
      try { nativeHost.SaukiMartAndroid?.selectContact?.(); nativePickerTriggered = true; } catch {}
    }
    if (!nativePickerTriggered) {
      try { nativeHost.Android?.openContactPicker?.(); nativePickerTriggered = true; } catch {}
    }
    if (!nativePickerTriggered) {
      try { nativeHost.Android?.pickPhoneContact?.(); nativePickerTriggered = true; } catch {}
    }
    if (!nativePickerTriggered) {
      try { nativeHost.Android?.selectContact?.(); nativePickerTriggered = true; } catch {}
    }
    if (!nativePickerTriggered) {
      try {
        nativeHost.webkit?.messageHandlers?.saukiMartPickContact?.postMessage?.({ type: 'pick-contact' });
        nativePickerTriggered = true;
      } catch {}
    }

    if (nativePickerTriggered) {
      setTimeout(() => {
        setContactPickerOpen((prev) => prev ? prev : true);
      }, 1200);
      return;
    }

    // Final fallback: show recent recipients
    try {
      const saved = localStorage.getItem('recentDataRecipients');
      if (saved) setRecentRecipients(JSON.parse(saved));
    } catch {}
    setContactPickerOpen(true);
  };

  const renderContactPickerSheet = () => (
    contactPickerOpen && (
      <div onClick={()=>setContactPickerOpen(false)} style={{ position:'fixed',inset:0,zIndex:8000,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(5px)',WebkitBackdropFilter:'blur(5px)',display:'flex',flexDirection:'column',justifyContent:'flex-end' }}>
        <div onClick={e=>e.stopPropagation()} style={{ background:'var(--card)',borderRadius:'24px 24px 0 0',paddingBottom:44,boxShadow:'0 -16px 60px rgba(0,0,0,.28)',animation:'sheetRise .35s cubic-bezier(.32,.72,0,1) both',maxHeight:'72vh',display:'flex',flexDirection:'column' }}>
          <div style={{ padding:'14px 0 0',display:'flex',justifyContent:'center' }}>
            <div style={{ width:40,height:4,borderRadius:4,background:'var(--border)',opacity:.7 }} />
          </div>
          <div style={{ padding:'14px 20px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid var(--border-subtle)' }}>
            <div>
              <h3 style={{ fontSize:18,fontWeight:900,color:'var(--text)',letterSpacing:-0.3 }}>Recent Recipients</h3>
              <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:3 }}>Tap a number to fill it in automatically</p>
            </div>
            <button onClick={()=>setContactPickerOpen(false)} style={{ width:32,height:32,borderRadius:10,background:'var(--bg-secondary)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div style={{ flex:1,overflowY:'auto',padding:'8px 16px 0' }}>
            {recentRecipients.length === 0 ? (
              <div style={{ textAlign:'center',padding:'36px 20px' }}>
                <div style={{ width:64,height:64,borderRadius:20,background:'rgba(0,113,227,.07)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={BLUE} strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="9" cy="7" r="4" stroke={BLUE} strokeWidth="2"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke={BLUE} strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p style={{ fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:6 }}>No recent recipients</p>
                <p style={{ fontSize:13,color:'var(--text-secondary)',lineHeight:1.55 }}>Numbers you buy data for will<br/>appear here for quick access.</p>
              </div>
            ) : (
              <div style={{ display:'flex',flexDirection:'column',gap:2,paddingTop:4 }}>
                {recentRecipients.map((num, idx) => (
                  <button key={num} onClick={()=>{ setBuyPhone(num); setContactPickerOpen(false); }} className="haptic-pulse"
                    style={{ display:'flex',alignItems:'center',gap:14,padding:'12px 8px',borderRadius:14,background:'none',border:'none',cursor:'pointer',width:'100%',textAlign:'left',transition:'background .15s' }}>
                    <div style={{ width:44,height:44,borderRadius:14,background:idx===0?'rgba(0,113,227,.1)':'rgba(0,113,227,.05)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={BLUE} strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="9" cy="7" r="4" stroke={BLUE} strokeWidth="2"/>
                      </svg>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:16,fontWeight:700,color:'var(--text)',letterSpacing:'0.03em' }}>{num}</p>
                      <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:2 }}>{idx===0?'Most recent':'Recent purchase'}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ padding:'14px 16px 0',borderTop:'1px solid var(--border-subtle)',marginTop:6 }}>
            <button onClick={()=>setContactPickerOpen(false)} className="tactile-btn"
              style={{ width:'100%',padding:'14px',borderRadius:14,background:'var(--bg-secondary)',color:'var(--text)',fontWeight:700,fontSize:15,border:'none',cursor:'pointer' }}>
              Enter number manually
            </button>
          </div>
        </div>
      </div>
    )
  );

  /* ── BUY DATA ── */
  const handleBuyData = async (pin: string) => {
    if (!selectedPlan || !buyPhone) return;
    setIsBuyingData(true);
    setLoading(true);
    try {
      // Generate idempotency key on first attempt, reuse on retry
      const idempKey = purchaseIdempotencyKey || generateIdempotencyKey();
      if (!purchaseIdempotencyKey) setPurchaseIdempotencyKey(idempKey);
      
      const res = await fetch('/api/buy-data', {
        method:'POST', headers: authHeader(),
        body: JSON.stringify({ pin, planId: selectedPlan.planId, phoneNumber: buyPhone, network: selectedPlan.network, networkId: selectedPlan.networkId, dataSize: selectedPlan.dataSize, validity: selectedPlan.validity, price: selectedPlan.price, idempotencyKey: idempKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Server error (${res.status})`);
      }
      setReceipt({ ...data.receipt, type:'data' });
      setPurchaseIdempotencyKey(null); // Clear for next purchase
        try {
          const prev: string[] = JSON.parse(localStorage.getItem('recentDataRecipients') || '[]');
          const updated = [buyPhone, ...prev.filter(n => n !== buyPhone)].slice(0, 8);
          localStorage.setItem('recentDataRecipients', JSON.stringify(updated));
          setRecentRecipients(updated);
        } catch {}
      await refreshUser();
      await loadHomeData();
      playSound('cash');
      showToast('✅ Data purchase successful!');
    } catch(e:unknown) { 
      const msg = e instanceof Error ? e.message : 'Purchase failed';
      console.error('Data purchase error:', msg);
      showError(msg); 
    }
    finally { setLoading(false); setIsBuyingData(false); }
  };

  /* ── BUY PRODUCT ── */
  const handleBuyProduct = async (pin: string) => {
    if (!selectedProduct) return;
    if (!deliveryAddress || !deliveryCity || !deliveryPostalCode) {
      showError('Please fill in all delivery address fields');
      return;
    }
    setLoading(true);
    try {
      const idempKey = purchaseIdempotencyKey || generateIdempotencyKey();
      if (!purchaseIdempotencyKey) setPurchaseIdempotencyKey(idempKey);
      
      const fullAddress = `${deliveryAddress}, ${deliveryCity} ${deliveryPostalCode}`;
      const res = await fetch('/api/purchase-product', {
        method:'POST', headers: authHeader(),
        body: JSON.stringify({ 
          pin, 
          productId: selectedProduct.id, 
          deliveryAddress: fullAddress,
          idempotencyKey: idempKey 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReceipt({ ...data.receipt, type:'product', deliveryAddress: fullAddress });
      setPurchaseIdempotencyKey(null);
      setDeliveryAddress('');
      setDeliveryCity('');
      setDeliveryPostalCode('');
      await refreshUser();
      await loadHomeData();
      showToast('🎉 Purchase successful!');
    } catch(e:unknown) { showError(e instanceof Error ? e.message : 'Purchase failed'); }
    finally { setLoading(false); }
  };

  /* ── REDEEM CASHBACK ── */
  const handleRedeemCashback = async () => {
    if (!user) return;
    const amount = parseFloat(redeemAmount);
    if (!amount || amount <= 0) {
      setRedeemError('Enter a valid amount');
      return;
    }
    if (amount > user.cashbackBalance) {
      setRedeemError('Amount exceeds available cashback');
      return;
    }
    setRedeemError('');
    setRedeemLoading(true);
    try {
      const res = await fetch('/api/redeem-cashback', {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Redeem failed');
      await refreshUser();
      await loadHomeData();
      setRedeemOpen(false);
      setRedeemAmount('');
      showToast(`✅ ₦${amount.toLocaleString('en-NG')} has been moved to your main balance! 🎉`);
    } catch (e:unknown) {
      setRedeemError(e instanceof Error ? e.message : 'Redeem failed');
    } finally {
      setRedeemLoading(false);
    }
  };

  const beginElectricityPurchase = () => {
    if (!user) return;
    const amount = Number(electricityForm.amount || 0);
    const total = amount + 100;

    if (!electricityForm.itemCode || !electricityForm.discoName) {
      showError('Select a DISCO provider');
      return;
    }
    if (!/^\d{11}$/.test(electricityForm.meterNumber)) {
      showError('Meter number must be 11 digits');
      return;
    }
    if (!electricityForm.verified || !electricityForm.customerName) {
      showError('Verify the meter before purchase');
      return;
    }
    if (!Number.isFinite(amount) || amount < 1000 || amount > 100000) {
      showError('Amount must be between ₦1,000 and ₦100,000');
      return;
    }
    if (user.walletBalance < total) {
      showError('Insufficient balance. Please fund your wallet.');
      return;
    }

    setElectricitySummaryOpen(true);
  };

  const handleElectricityPurchase = async (pin: string) => {
    const amount = Number(electricityForm.amount || 0);
    setElectricityStatus('processing');
    setLoading(true);
    setElectricityFailure('');

    try {
      const idem = electricityIdempotencyKey || generateIdempotencyKey();
      if (!electricityIdempotencyKey) setElectricityIdempotencyKey(idem);

      const res = await fetch('/api/electricity/purchase', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          pin,
          itemCode: electricityForm.itemCode,
          discoName: electricityForm.discoName,
          meterType: electricityForm.meterType,
          meterNumber: electricityForm.meterNumber,
          amount,
          customerName: electricityForm.customerName,
          phoneNumber: electricityForm.phoneNumber,
          email: electricityForm.email,
          idempotencyKey: idem,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Electricity purchase failed');

      setReceipt(data.receipt);
      setElectricitySuccess(data.receipt || null);
      setElectricityStatus('success');
      setElectricityIdempotencyKey('');
      setElectricitySummaryOpen(false);
      await refreshUser();
      await loadHomeData();
      showToast('Electricity purchase successful');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Electricity purchase failed';
      setElectricityFailure(message);
      setElectricityStatus('failed');
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const beginWithdrawalRequest = () => {
    if (!user) return;
    const amount = Number(withdrawForm.amount || 0);
    if (!amount || amount <= 0) {
      setWithdrawError('Enter a valid withdrawal amount');
      return;
    }
    if (amount > referralBalance) {
      setWithdrawError('Withdrawal amount exceeds your referral balance');
      return;
    }
    if (!withdrawForm.bankCode || !withdrawForm.bankName) {
      setWithdrawError('Select a bank');
      return;
    }
    if (!/^\d{10}$/.test(withdrawForm.accountNumber)) {
      setWithdrawError('Enter a valid 10-digit account number');
      return;
    }
    if (!withdrawForm.accountName) {
      setWithdrawError('Resolve the account before continuing');
      return;
    }

    setWithdrawError('');
    setPinAction('withdraw');
    setShowPin(true);
  };

  const handleWithdrawalRequest = async (pin: string) => {
    setWithdrawLoading(true);
    setWithdrawError('');
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          amount: Number(withdrawForm.amount),
          bankCode: withdrawForm.bankCode,
          bankName: withdrawForm.bankName,
          accountNumber: withdrawForm.accountNumber,
          pin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Withdrawal request failed');

      setWithdrawForm({ amount:'', bankCode:'', bankName:'', accountNumber:'', accountName:'' });
      setBankSearch('');
      await refreshUser();
      await loadEarnData();
      await loadHomeData();
      showToast('Withdrawal request submitted');
    } catch (e: unknown) {
      setWithdrawError(e instanceof Error ? e.message : 'Withdrawal request failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const beginAirtimePurchase = () => {
    if (!user) return;
    const amount = Number(airtimeAmount || 0);

    if (!airtimeNetwork) {
      showError('Select a network');
      return;
    }
    if (!/^\d{11}$/.test(airtimePhone)) {
      showError('Enter an 11-digit phone number');
      return;
    }
    if (!Number.isFinite(amount) || amount < 50 || amount > 50000) {
      showError('Amount must be between ₦50 and ₦50,000');
      return;
    }
    if (user.walletBalance < amount) {
      showError('Insufficient balance. Please fund your wallet.');
      return;
    }

    setAirtimeSummaryOpen(true);
  };

  const handleAirtimePurchase = async (pin: string) => {
    const amount = Number(airtimeAmount || 0);
    setAirtimeStatus('processing');
    setLoading(true);
    setAirtimeFailure('');

    try {
      const idem = airtimeIdempotencyKey || generateIdempotencyKey();
      if (!airtimeIdempotencyKey) setAirtimeIdempotencyKey(idem);

      const res = await fetch('/api/airtime/purchase', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          pin,
          network: airtimeNetwork,
          phoneNumber: airtimePhone,
          amount,
          idempotencyKey: idem,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Airtime purchase failed');

      setReceipt(data.receipt);
      setAirtimeSuccess(data.receipt || null);
      setAirtimeStatus('success');
      setAirtimeIdempotencyKey('');
      setAirtimeSummaryOpen(false);
      await refreshUser();
      await loadHomeData();
      showToast('Airtime purchase successful');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Airtime purchase failed';
      setAirtimeFailure(message);
      setAirtimeStatus('failed');
      showError(message);
    } finally {
      setLoading(false);
    }
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
      await loadHomeData();
    } catch(e:unknown) { showError(e instanceof Error ? e.message : 'Failed to submit'); }
    finally { setLoading(false); }
  };

  const handlePinComplete = (pin: string) => {
    setShowPin(false);
    if (pinAction === 'buy-data') handleBuyData(pin);
    else if (pinAction === 'buy-product') handleBuyProduct(pin);
    else if (pinAction === 'sim-pay') handleSimPay(pin);
    else if (pinAction === 'transfer') handleTransfer(pin);
    else if (pinAction === 'bank-transfer') handleBankTransfer(pin);
    else if (pinAction === 'withdraw') handleWithdrawalRequest(pin);
    else if (pinAction === 'electricity') handleElectricityPurchase(pin);
    else if (pinAction === 'airtime') handleAirtimePurchase(pin);
  };

  const sendChat = useCallback(async () => {
    // Chat system removed - placeholder
  }, []);


  /* ── CHANGE PIN ── */
  const handleChangePin = async (currentPin: string) => {
    if (newPin.length !== 4 || confirmNewPin.length !== 4) { showError('PIN must be 4 digits'); return; }
    if (newPin !== confirmNewPin) { showError('New PINs do not match'); return; }
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

  const signOut = async () => {
    const authToken = localStorage.getItem('sm_token') || token;
    const devicePushToken = localStorage.getItem('sm_fcm_token')
      || localStorage.getItem('sm_push_token')
      || localStorage.getItem('device_push_token');

    if (authToken && devicePushToken) {
      try {
        await fetch('/api/push-token', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: devicePushToken }),
        });
      } catch {
        // Sign-out should continue even if token deactivation fails.
      }
    }

    const nativeHost = window as Window & {
      SaukiMartAndroid?: { onLogout?: () => void };
      Android?: { onLogout?: () => void };
      webkit?: { messageHandlers?: { saukiMartLogout?: { postMessage?: (message: unknown) => void } } };
    };

    try { nativeHost.SaukiMartAndroid?.onLogout?.(); } catch {}
    try { nativeHost.Android?.onLogout?.(); } catch {}
    try { nativeHost.webkit?.messageHandlers?.saukiMartLogout?.postMessage?.({ type: 'logout' }); } catch {}

    localStorage.removeItem('sm_token');
    localStorage.removeItem('sm_user');
    localStorage.removeItem('sm_fcm_token');
    localStorage.removeItem('sm_push_token');
    localStorage.removeItem('device_push_token');
    setToken(''); setUser(null);
    setScreen('login');
  };

  const updatePref = async (key: string, value: unknown) => {
    await fetch('/api/user', { method:'PATCH', headers: authHeader(), body: JSON.stringify({ [key]: value }) });
    setUser(prev => prev ? { ...prev, [key]: value } : prev);
    if (key === 'theme') setDark(value === 'dark');
  };

  /* TRANSFER FUNCTIONS */
  const lookupTransferRecipient = async (phone: string) => {
    if (!phone || phone.length !== 11) { showError('Enter valid 11-digit phone number'); return; }
    try {
      const res = await fetch(`/api/user-transfer?phone=${phone}`, { headers: authHeader() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTransferRecipient(data);
      showToast('✅ Recipient found!');
    } catch(e:unknown) { 
      showError(e instanceof Error ? e.message : 'Recipient not found');
      setTransferRecipient(null);
    }
  };

  const handleTransfer = async (pin: string) => {
    if (!transferRecipient || !transferAmount) { showError('Missing recipient or amount'); return; }
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) { showError('Invalid amount'); return; }
    if (user && amount > user.walletBalance) { showError('Insufficient balance'); return; }

    setTransferLoading(true);
    try {
      const res = await fetch('/api/user-transfer', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ recipientPhone: transferRecipient.phone, amount, pin, note: transferNote.trim() || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      playSound('cash');
      showToast(`✅ Sent ₦${amount.toLocaleString('en-NG',{minimumFractionDigits:2})} to ${transferRecipient.name}`);
      setReceipt({
        type: 'transfer',
        amount,
        productName: 'Wallet Transfer',
        userName: transferRecipient.name,
        userPhone: transferRecipient.phone,
        deliveryAddress: transferNote.trim() || 'Instant wallet transfer',
        ref: `TRF-${Date.now()}`,
        date: new Date().toISOString(),
      });
      setTransferPhone('');
      setTransferAmount('');
      setTransferNote('');
      setTransferRecipient(null);
      setScreen('transfer');
      refreshUser();
      loadHomeData();
      setPinAction(null); setShowPin(false);
    } catch(e:unknown) { 
      showError(e instanceof Error ? e.message : 'Transfer failed');
    } finally { setTransferLoading(false); }
  };

  const verifyBankTransferAccount = async () => {
    if (!bankTransferBankCode) {
      showError('Select a bank');
      return;
    }
    if (!/^\d{10}$/.test(bankTransferAccountNumber)) {
      showError('Account number must be exactly 10 digits');
      return;
    }

    setBankTransferVerifyState('verifying');
    setBankTransferError('');
    setBankTransferAccountName('');

    try {
      const res = await fetch('/api/bank-transfer/verify', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ bankCode: bankTransferBankCode, accountNumber: bankTransferAccountNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setBankTransferBankName(String(data.bankName || bankTransferBankName));
      setBankTransferAccountName(String(data.accountName || ''));
      setBankTransferVerifyState('verified');
      showToast('Account verified successfully');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Verification failed';
      setBankTransferVerifyState('failed');
      setBankTransferError(msg);
      showError(msg);
    }
  };

  const beginBankTransfer = () => {
    if (!user) return;
    const amount = Number(bankTransferAmount || 0);
    const totalDeducted = amount + BANK_TRANSFER_SERVICE_CHARGE;

    if (!bankTransferBankCode || !bankTransferBankName) {
      showError('Select a bank');
      return;
    }
    if (!/^\d{10}$/.test(bankTransferAccountNumber)) {
      showError('Account number must be exactly 10 digits');
      return;
    }
    if (bankTransferVerifyState !== 'verified' || !bankTransferAccountName) {
      showError('Verify account before proceeding');
      return;
    }
    if (!Number.isFinite(amount) || amount < BANK_TRANSFER_MIN_AMOUNT) {
      showError('Amount must be at least ₦100');
      return;
    }
    if (amount > 1000000) {
      showError('Maximum transfer per transaction is ₦1,000,000');
      return;
    }
    if (user.walletBalance < totalDeducted) {
      showError(`Insufficient balance. You need ₦${totalDeducted.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}.`);
      return;
    }

    setBankTransferSummaryOpen(true);
  };

  const handleBankTransfer = async (pin: string) => {
    const amount = Number(bankTransferAmount || 0);
    setBankTransferProcessing(true);
    setLoading(true);

    try {
      const res = await fetch('/api/bank-transfer', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          bankCode: bankTransferBankCode,
          bankName: bankTransferBankName,
          accountNumber: bankTransferAccountNumber,
          accountName: bankTransferAccountName,
          amount,
          narration: bankTransferNarration.trim() || undefined,
          pin,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transfer failed');

      setReceipt(data.receipt || null);
      setBankTransferSummaryOpen(false);
      setBankTransferBankSearch('');
      setBankTransferBankCode('');
      setBankTransferBankName('');
      setBankTransferAccountNumber('');
      setBankTransferAccountName('');
      setBankTransferAmount('');
      setBankTransferNarration('');
      setBankTransferVerifyState('idle');
      setBankTransferError('');
      await refreshUser();
      await loadHomeData();
      showToast(data.message || 'Transfer completed');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Transfer failed';
      setBankTransferError(msg);
      showError(msg);
    } finally {
      setBankTransferProcessing(false);
      setLoading(false);
    }
  };

  /* ═══════════════════ SCREENS ═══════════════════ */

  /* SPLASH */
  if (screen === 'splash') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:`linear-gradient(135deg, ${BLUE} 0%, ${PURPLE} 50%, ${ORANGE} 100%)`,position:'relative',overflow:'hidden' }}>
        {/* Animated background shapes */}
        <div style={{ position:'absolute',top:'-20%',left:'-10%',width:'600px',height:'600px',borderRadius:'50%',background:'rgba(255,255,255,.1)',backdropFilter:'blur(40px)',animation:'float 20s ease-in-out infinite' }} />
        <div style={{ position:'absolute',bottom:'-15%',right:'-5%',width:'500px',height:'500px',borderRadius:'50%',background:'rgba(255,255,255,.08)',backdropFilter:'blur(30px)',animation:'float 25s ease-in-out infinite reverse' }} />
        
        <div style={{ position:'relative',zIndex:10,textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center' }}>
          {/* Animated logo container */}
          <div style={{ width:100,height:100,borderRadius:24,background:'rgba(255,255,255,.95)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 20px 60px rgba(0,0,0,.3)',marginBottom:40,animation:'slideUp .6s cubic-bezier(.34,.1,.68,.55) both' }}>
            <img src="/images/logo.png" alt="SaukiMart" style={{ width:72,height:72,borderRadius:20,objectFit:'cover',filter:'drop-shadow(0 10px 18px rgba(0,113,227,.18))' }} />
          </div>
          
          <h1 style={{ fontSize:44,fontWeight:900,color:'#fff',letterSpacing:-1,marginBottom:16,animation:'slideUp .6s cubic-bezier(.34,.1,.68,.55) .1s both',textShadow:'0 2px 8px rgba(0,0,0,.2)' }}>SaukiMart</h1>
          
          <p style={{ fontSize:18,color:'rgba(255,255,255,.9)',marginBottom:8,animation:'slideUp .6s cubic-bezier(.34,.1,.68,.55) .2s both',fontWeight:600 }}>Data & Devices at Your Fingertips</p>
          <p style={{ fontSize:14,color:'rgba(255,255,255,.7)',marginBottom:60,maxWidth:300,lineHeight:'1.5',animation:'slideUp .6s cubic-bezier(.34,.1,.68,.55) .3s both' }}>Fast, secure, and seamless mobile services</p>
          
          {/* Floating icons */}
          <div style={{ display:'flex',gap:32,marginBottom:60,justifyContent:'center',animation:'slideUp .6s cubic-bezier(.34,.1,.68,.55) .4s both' }}>
            {[
              { icon: '📱', label: 'Data' },
              { icon: '🛒', label: 'Shop' },
              { icon: '💰', label: 'Transfer' }
            ].map((item, i) => (
              <div key={i} style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:8 }}>
                <div style={{ width:56,height:56,borderRadius:14,background:'rgba(255,255,255,.15)',backdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,animation:`float ${3+(i*0.5)}s ease-in-out infinite`,animationDelay:`${i*0.2}s` }}>
                  {item.icon}
                </div>
                <p style={{ fontSize:12,color:'rgba(255,255,255,.7)',fontWeight:500 }}>{item.label}</p>
              </div>
            ))}
          </div>
          
          {/* Loading indicator */}
          <div style={{ display:'flex',gap:6,justifyContent:'center' }}>
            {[0,1,2].map(i=>(
              <div key={i} style={{ width:8,height:8,borderRadius:4,background:'rgba(255,255,255,.6)',animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`,boxShadow:'0 4px 12px rgba(0,0,0,.15)' }} />
            ))}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div style={{ position:'absolute',bottom:40,left:0,right:0,textAlign:'center',color:'rgba(255,255,255,.6)',fontSize:12,fontWeight:500 }}>
          Initializing...</div>
      </div>
    </>
  );

  /* LOGIN */
  if (screen === 'login') return (
    <>
      <GlobalStyle dark={dark} />
      {showPin && <PinKeyboard title="Enter your PIN" onComplete={handleLogin} onClose={()=>setShowPin(false)} />}
      <div style={{ height:'100dvh',display:'flex',flexDirection:'column',background:`linear-gradient(135deg, ${BLUE} 0%, ${PURPLE} 50%, ${dark?'#1a1a2e':'#f5f5f7'} 100%)`,position:'relative',overflow:'hidden' }}>
        {/* Animated background elements */}
        <div style={{ position:'absolute',top:'-20%',right:'-10%',width:'500px',height:'500px',borderRadius:'50%',background:'rgba(255,255,255,.08)',backdropFilter:'blur(40px)',pointerEvents:'none',animation:'float 20s ease-in-out infinite' }} />
        <div style={{ position:'absolute',bottom:'-10%',left:'-15%',width:'400px',height:'400px',borderRadius:'50%',background:'rgba(90,200,250,.08)',backdropFilter:'blur(30px)',pointerEvents:'none',animation:'float 25s ease-in-out infinite reverse' }} />
        
        <div style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 24px',position:'relative',zIndex:1 }}>
          {/* Logo with animation */}
          <div style={{ marginBottom:40,textAlign:'center' }}>
            <div style={{ width:80,height:80,borderRadius:20,background:'rgba(255,255,255,.95)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 20px 60px rgba(0,0,0,.2)',marginBottom:16,animation:'slideUp .6s cubic-bezier(.34,.1,.68,.55) both' }}>
              <img src="/images/logo.png" alt="SaukiMart" style={{ width:58,height:58,borderRadius:16,objectFit:'cover',filter:'drop-shadow(0 10px 18px rgba(0,113,227,.18))' }} />
            </div>
            <h1 style={{ fontSize:36,fontWeight:900,color:'#fff',letterSpacing:-0.8,marginBottom:12,animation:'slideUp .6s cubic-bezier(.34,.1,.68,.55) .1s both',textShadow:'0 2px 8px rgba(0,0,0,.2)' }}>SaukiMart</h1>
            <p style={{ color:'rgba(255,255,255,.85)',fontSize:15,fontWeight:500,animation:'slideUp .6s cubic-bezier(.34,.1,.68,.55) .2s both' }}>Data, Devices, Transfers</p>
          </div>
          
          {isReturningUserPIN ? (
            <div style={{ width:'100%',maxWidth:380,animation:'slideUp .6s cubic-bezier(.34,.1,.68,.55) .2s both' }}>
              <div style={{ marginBottom:36,textAlign:'center' }}>
                <h2 style={{ fontSize:28,fontWeight:800,color:'#fff',marginBottom:12,textShadow:'0 2px 8px rgba(0,0,0,.15)' }}>Welcome Back!</h2>
                <p style={{ color:'rgba(255,255,255,.8)',fontSize:15 }}>Enter your PIN to continue</p>
              </div>
              
              <div style={{ width:'100%',marginBottom:28,background:'rgba(255,255,255,.95)',backdropFilter:'blur(20px)',borderRadius:20,padding:24,border:'1px solid rgba(255,255,255,.2)',boxShadow:'0 8px 32px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize:12,fontWeight:700,color:'#6C6C70',marginBottom:10,textTransform:'uppercase',letterSpacing:.5 }}>📱 Phone Number</p>
                <p style={{ fontSize:18,fontWeight:700,color:'#1D1D1F',padding:'0' }}>{loginPhone}</p>
              </div>

              <button onClick={()=>{ setShowPin(true); }}
                style={{ width:'100%',padding:'18px',borderRadius:16,background:(`linear-gradient(135deg, ${BLUE}, ${TEAL})`),color:'#fff',fontSize:16,fontWeight:700,transition:'all .3s cubic-bezier(.16,.1,0,1)',marginBottom:16,boxShadow:`0 12px 32px ${BLUE}60`,cursor:'pointer',border:'none',textShadow:'0 1px 2px rgba(0,0,0,.1)' }}>
                🔐 Enter PIN
              </button>

              <button onClick={async()=>{ setStoredPhone(''); setLoginPhone(''); setIsReturningUserPIN(false); localStorage.removeItem('sm_phone'); await signOut(); }}
                style={{ fontSize:14,color:'#fff',fontWeight:600,background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.3)',cursor:'pointer',width:'100%',padding:'14px',borderRadius:12,transition:'all .2s' }}>
                Use Different Number
              </button>
            </div>
          ) : (
            <div style={{ width:'100%',maxWidth:380,animation:'slideUp .6s cubic-bezier(.34,.1,.68,.55) .2s both' }}>
              <div style={{ marginBottom:32,textAlign:'center' }}>
                <h2 style={{ fontSize:28,fontWeight:800,color:'#fff',marginBottom:12,textShadow:'0 2px 8px rgba(0,0,0,.15)' }}>Sign In</h2>
                <p style={{ color:'rgba(255,255,255,.8)',fontSize:15 }}>Fast, secure access to your account</p>
              </div>
              
              {error && <div style={{ width:'100%',padding:'14px 18px',borderRadius:14,background:'rgba(255,59,48,.2)',border:`1.5px solid ${RED}50`,color:'#fff',fontSize:14,fontWeight:600,marginBottom:24,animation:'fadeUpScale .3s ease',backdropFilter:'blur(10px)' }}>{error}</div>}
              
              <div style={{ width:'100%',marginBottom:24,background:'rgba(255,255,255,.95)',backdropFilter:'blur(20px)',borderRadius:20,padding:24,border:'1px solid rgba(255,255,255,.2)',boxShadow:'0 8px 32px rgba(0,0,0,.1)' }}>
                <label style={{ fontSize:12,fontWeight:700,color:'#6C6C70',marginBottom:12,display:'block',textTransform:'uppercase',letterSpacing:.5 }}>📱 Phone Number</label>
                <input value={loginPhone} onChange={e=>setLoginPhone(e.target.value.replace(/\D/g,'').slice(0,11))}
                  placeholder="08000000000" inputMode="numeric"
                  style={{ width:'100%',padding:'16px 0',borderRadius:0,background:'transparent',border:'none',color:'#1D1D1F',fontSize:18,fontWeight:700,transition:'all .2s',outline:'none',boxSizing:'border-box',borderBottom:`2px solid ${loginPhone.length > 0 ? BLUE : '#E5E5EA'}` }} 
                  onFocus={e=>{ e.currentTarget.style.borderBottomColor = BLUE; }}
                  onBlur={e=>{ e.currentTarget.style.borderBottomColor = loginPhone.length > 0 ? BLUE : '#E5E5EA'; }}
                />
              </div>
              
              <button onClick={()=>{ if(loginPhone.length===11){ playSound('confirm'); setShowPin(true); } else showError('Enter 11-digit phone number'); }}
                disabled={loginPhone.length !== 11}
                style={{ width:'100%',padding:'16px',borderRadius:14,background: loginPhone.length===11 ? `linear-gradient(135deg, ${BLUE}, ${TEAL})` : 'rgba(255,255,255,.2)',color: loginPhone.length===11 ? '#fff' : 'rgba(255,255,255,.5)',fontSize:16,fontWeight:700,transition:'all .3s',marginBottom:16,boxShadow: loginPhone.length===11 ? `0 12px 32px ${BLUE}60` : 'none',cursor:loginPhone.length===11?'pointer':'not-allowed',border:'none',textShadow:'0 1px 2px rgba(0,0,0,.1)',backdropFilter:'blur(20px)' }}>
                Continue →
              </button>
              
              <button onClick={()=>{ playSound('tap'); setScreen('register'); }}
                style={{ width:'100%',padding:'14px',borderRadius:14,background:'rgba(255,255,255,.15)',color:'#fff',fontSize:15,fontWeight:600,border:'1px solid rgba(255,255,255,.3)',cursor:'pointer',transition:'all .2s',backdropFilter:'blur(20px)' }}>
                Create New Account
              </button>
              
              <div style={{ display:'flex',alignItems:'center',gap:8,marginTop:24,justifyContent:'center',fontSize:12,color:'rgba(255,255,255,.7)' }}>
                <span>🔒 Secure & Encrypted</span>
              </div>
            </div>
          )}
        </div>
        
        <p style={{ textAlign:'center',fontSize:12,color:'rgba(255,255,255,.6)',padding:'0 24px 32px',position:'relative',zIndex:1,fontWeight:500 }}>
          <a href="/privacy" style={{ color:'rgba(255,255,255,.8)',textDecoration:'underline' }}>Privacy</a> · <a href="/privacy" style={{ color:'rgba(255,255,255,.8)',textDecoration:'underline' }}>Terms</a> · <a href="/privacy" style={{ color:'rgba(255,255,255,.8)',textDecoration:'underline' }}>Support</a>
        </p>
      </div>
    </>
  );

  /* REGISTER */
  if (screen === 'register') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',overflowY:'auto',background:`linear-gradient(135deg, ${dark?'#0a0a0a':'#fafafa'} 0%, ${dark?'#1a1a2e':'#f5f5f7'} 100%)` }}>
        {/* Background decorations */}
        <div style={{ position:'fixed',top:'-40%',right:'-15%',width:'350px',height:'350px',borderRadius:'50%',background:`radial-gradient(circle, ${BLUE}08, transparent)`,pointerEvents:'none' }} />
        <div style={{ position:'fixed',bottom:'-20%',left:'-10%',width:'300px',height:'300px',borderRadius:'50%',background:`radial-gradient(circle, ${GREEN}06, transparent)`,pointerEvents:'none' }} />
        
        <div style={{ padding:'60px 24px 40px',maxWidth:420,margin:'0 auto',position:'relative',zIndex:1 }}>
          <button onClick={()=>setScreen('login')} style={{ color:BLUE,fontSize:16,fontWeight:600,marginBottom:28,background:'none',border:'none',cursor:'pointer' }}>← Back</button>
          
          {/* Header */}
          <div style={{ marginBottom:36,textAlign:'center',animation:'fadeUpScale .5s ease' }}>
            <img src="/images/logo.png" alt="SaukiMart" style={{ width:52,height:52,borderRadius:14,objectFit:'cover',margin:'0 auto 16px',boxShadow:`0 8px 24px ${GREEN}40` }} />
            <h1 style={{ fontSize:28,fontWeight:800,color:'var(--text)',letterSpacing:-0.6,marginBottom:8 }}>Create Account</h1>
            <p style={{ color:'var(--text-secondary)',fontSize:16 }}>Begin your journey with SaukiMart</p>
          </div>
          
          {error && <div style={{ width:'100%',padding:'12px 16px',borderRadius:14,background:'rgba(255,59,48,.12)',border:`1px solid ${RED}30`,color:RED,fontSize:15,marginBottom:20,animation:'fadeUpScale .3s ease' }}>{error}</div>}
          
          {/* Form */}
          <div style={{ background:'var(--card)',borderRadius:18,padding:24,border:'1px solid var(--border)',boxShadow:'0 8px 32px rgba(0,0,0,.08)',marginBottom:24 }}>
            {[
            { key:'firstName', label:'First Name', placeholder:'Abubakar', type:'text' },
            { key:'lastName', label:'Last Name', placeholder:'Musa', type:'text' },
            { key:'phone', label:'Phone Number (11 digits)', placeholder:'08012345678', type:'tel' },
            { key:'pin', label:'4-Digit PIN', placeholder:'••••', type:'password' },
            { key:'confirmPin', label:'Confirm PIN', placeholder:'••••', type:'password' },
            { key:'referralId', label:'Referral ID (Optional)', placeholder:'SMAB12CD34', type:'text' },
          ].map((f,i) => (
            <div key={f.key} style={{ marginBottom: i<5 ? 18 : 0 }}>
              <label style={{ fontSize:13,fontWeight:700,color:'var(--text-secondary)',marginBottom:10,display:'block',textTransform:'uppercase',letterSpacing:.5 }}>{f.label}</label>
              <input
                type={f.type} value={regForm[f.key as keyof typeof regForm]} placeholder={f.placeholder}
                inputMode={f.key==='phone'||f.key==='pin'||f.key==='confirmPin'?'numeric':undefined}
                maxLength={f.key==='phone'?11:f.key==='pin'||f.key==='confirmPin'?4:f.key==='referralId'?12:undefined}
                onChange={e => {
                  const v = (f.key==='phone'||f.key==='pin'||f.key==='confirmPin')
                    ? e.target.value.replace(/\D/g,'')
                    : f.key === 'referralId'
                      ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'')
                      : e.target.value;
                  setRegForm(prev => ({ ...prev, [f.key]: v }));
                }}
                style={{ width:'100%',padding:'14px 14px',borderRadius:10,background:'var(--bg-secondary)',border:'1px solid var(--border)',color:'var(--text)',fontSize:16,fontWeight:600,transition:'all .2s',outline:'none',boxSizing:'border-box' }}
                onFocus={e=>{ e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.background = dark?'#2a2a3e':'#fff'; }}
                onBlur={e=>{ e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              />
            </div>
          ))}
          </div>
          
          {/* Terms checkbox */}
          <div style={{ display:'flex',alignItems:'flex-start',gap:12,margin:'24px 0 28px',padding:'16px 14px',background:'var(--bg-secondary)',borderRadius:12,border:'1px solid var(--border)' }}>
            <button onClick={()=>setAgreed(!agreed)} style={{ width:22,height:22,borderRadius:6,border:`2px solid ${agreed?BLUE:'var(--border)'}`,background:agreed?`linear-gradient(135deg, ${BLUE}, ${TEAL})`:' transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1,transition:'all .2s',cursor:'pointer' }}>
              {agreed && <span style={{ color:'#fff',fontSize:12,fontWeight:900 }}>✓</span>}
            </button>
            <p style={{ fontSize:14,color:'var(--text-secondary)',lineHeight:1.6 }}>
              I agree to SaukiMart's{' '}
              <a href="/privacy" style={{ color:BLUE,fontWeight:600 }}>Terms</a> and{' '}
              <a href="/privacy" style={{ color:BLUE,fontWeight:600 }}>Privacy Policy</a>
            </p>
          </div>
          
          {/* Buttons */}
          <button onClick={handleRegister} disabled={!agreed||loading}
            style={{ width:'100%',padding:'16px',borderRadius:12,background:agreed&&!loading?`linear-gradient(135deg, ${GREEN}, ${TEAL})`:'var(--card2)',color:agreed&&!loading?'#fff':'var(--text-secondary)',fontSize:16,fontWeight:700,transition:'all .3s cubic-bezier(.16,.1,0,1)',marginBottom:16,boxShadow:agreed&&!loading?`0 12px 32px ${GREEN}40`:'none',cursor:agreed&&!loading?'pointer':'not-allowed',border:'none' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
          <button onClick={()=>setScreen('login')} style={{ width:'100%',color:BLUE,fontSize:15,fontWeight:600,background:'none',border:'none',cursor:'pointer' }}>Already have an account? Sign In</button>
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
  const displayName = (user.firstName || '').trim() || 'Customer';

  const Header = () => (
    <div style={{ padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,.82)',borderBottom:'1px solid var(--border)',position:'fixed',top:0,left:0,right:0,zIndex:100,backdropFilter:'blur(18px)',backgroundImage: dark ? 'linear-gradient(180deg,rgba(4,8,16,.94),rgba(4,8,16,.82))' : 'linear-gradient(180deg,rgba(255,255,255,.88),rgba(255,255,255,.80))',boxShadow: dark ? '0 4px 20px rgba(0,0,0,.35)' : '0 4px 16px rgba(0,0,0,.08)' }}>
      <div style={{ display:'flex',alignItems:'center',gap:12,minWidth:0,flex:1 }}>
        <div style={{ width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#0047CC,#0071E3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 4px 12px rgba(0,113,227,.28)',border:'1px solid rgba(0,113,227,.4)' }}>
          <img src="/images/logo-sm.png" alt="SaukiMart" style={{ height:24,width:'auto',borderRadius:6 }} />
        </div>
        <div style={{ display:'flex',flexDirection:'column',minWidth:0,justifyContent:'center',gap:4 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,minWidth:0 }}>
            <span style={{ fontSize:16,fontWeight:900,fontFamily:'-apple-system,"SF Pro Display","SF Pro Text",BlinkMacSystemFont,sans-serif',color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:'28vw',letterSpacing:'-0.015em',background:'linear-gradient(135deg,var(--text),var(--text-secondary))',backgroundClip:'text',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
              {displayName}
            </span>
          </div>
          <span style={{ fontSize:11,fontWeight:800,color:user?.isDeveloper ? '#FF8C42' : '#0071E3',background:user?.isDeveloper ? 'rgba(255,140,66,.12)' : 'rgba(0,113,227,.12)',border:user?.isDeveloper ? '0.5px solid rgba(255,140,66,.32)' : '0.5px solid rgba(0,113,227,.32)',borderRadius:6,padding:'3px 9px',whiteSpace:'nowrap',letterSpacing:'0.05em',textTransform:'uppercase',width:'fit-content',boxShadow: user?.isDeveloper ? '0 2px 6px rgba(255,140,66,.10)' : '0 2px 6px rgba(0,113,227,.10)' }}>
            {user?.isDeveloper ? '⚡ Developer' : '👤 User'}
          </span>
        </div>
      </div>
      <div style={{ display:'flex',alignItems:'center',gap:10,flexShrink:0 }}>
        <button onClick={()=>updatePref('theme', dark?'light':'dark')} className="tactile-btn" style={{ width:40,height:40,borderRadius:12,background:'var(--card2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,border:'1px solid var(--border)',boxShadow:'0 3px 12px rgba(0,0,0,.08)',transition:'all .25s cubic-bezier(.34,.1,.64,.88)',cursor:'pointer' }}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,.12)';e.currentTarget.style.transform='scale(1.08)'}}
          onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 3px 12px rgba(0,0,0,.08)';e.currentTarget.style.transform='scale(1)'}}>
          {dark ? Icons.bell(ORANGE, 17) : Icons.sun(ORANGE, 17)}
        </button>
        <button onClick={()=>setScreen('profile')} className="tactile-btn" style={{ display:'flex',alignItems:'center',boxShadow:'0 3px 12px rgba(0,113,227,.18)',borderRadius:12,transition:'all .25s cubic-bezier(.34,.1,.64,.88)',cursor:'pointer',border:'1.5px solid rgba(0,113,227,.22)' }}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 6px 20px rgba(0,113,227,.32)';e.currentTarget.style.transform='scale(1.08)'}}
          onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 3px 12px rgba(0,113,227,.18)';e.currentTarget.style.transform='scale(1)'}}>
          <div style={{ width:40,height:40,borderRadius:10,background:'linear-gradient(135deg,#0047CC,#0071E3)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:13,boxShadow:'inset 0 1px 0 rgba(255,255,255,.2)' }}>
            {getInitials(user)}
          </div>
        </button>
      </div>
    </div>
  );

  const BottomNav = ({ active }: { active: string }) => (
    <>
      {showShareModal && user && (
        <ShareSaukiMartModal
          user={user}
          dark={dark}
          onClose={closeShareModal}
          onShareSuccess={markShareCompleted}
          onToast={showToast}
          onError={showError}
        />
      )}
      <div style={{ position:'fixed',bottom:0,left:0,right:0,background:'var(--card)',borderTop:'1px solid var(--border)',display:'grid',gridTemplateColumns:'repeat(5,1fr)',paddingBottom:'env(safe-area-inset-bottom)',zIndex:50,boxShadow:'0 -8px 24px rgba(0,0,0,.12)',backdropFilter:'blur(10px)' }}>
        {[
          { id:'home', label:'Home', icon: Icons.bolt(BLUE, 24) },
          { id:'earn', label:'Earn', icon: Icons.chartBar(BLUE, 24) },
          { id:'share', label:'Share', icon: Icons.sendIcon('#fff', 20) },
          { id:'profile', label:'Account', icon: Icons.user(BLUE, 24) },
          { id:'chat', label:'Chat', icon: Icons.messageSquare(BLUE, 24) },
        ].map(item => {
          const isShare = item.id === 'share';
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={()=> {
              if (isShare) {
                if (showShareCoach) setShowShareCoach(false);
                openShareModal();
              } else {
                setScreen(item.id as typeof screen);
              }
            }}
              style={{ padding:isShare?'0 0 12px':'12px 0 16px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,background:'none',borderTop: isActive ? `3px solid ${BLUE}` : 'none',paddingTop: isActive ? '9px' : (isShare ? '0' : '12px'),transition:'all .2s',opacity: isActive || isShare ? 1 : 0.65,cursor:'pointer' }}
              onMouseEnter={e=>{e.currentTarget.style.opacity='0.9'}}
              onMouseLeave={e=>{e.currentTarget.style.opacity = isActive || isShare ? '1' : '0.65'}}>
              {isShare ? (
                <div ref={shareFabRef} style={{ width:54,height:54,borderRadius:999,marginTop:-18,background:'linear-gradient(135deg,#0047CC,#0071E3)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 12px 24px rgba(0,113,227,.35)',border:'3px solid var(--card)',animation:showShareCoach?'pulse 1.1s ease-in-out infinite':'none' }}>
                  {item.icon}
                </div>
              ) : (
                <div style={{ color: isActive?BLUE:'var(--text-secondary)',transition:'all .2s' }}>
                  {item.icon}
                </div>
              )}
              <span style={{ fontSize:11,fontWeight: isShare || isActive ? 700 : 500, color: isShare ? BLUE : (isActive?BLUE:'var(--text-secondary)'),transition:'all .2s' }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );

  /* HOME */
  if (screen === 'home') return (
    <>
      <GlobalStyle dark={dark} />
      {showPin && <PinKeyboard onComplete={handlePinComplete} onClose={()=>setShowPin(false)} pinAction={pinAction} />}
      {receipt && <Receipt data={receipt} onDownload={()=>{}} onClose={()=>setReceipt(null)} dark={dark} />}
      {toast && <div className="fade-in" style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:15,fontWeight:600,zIndex:500,whiteSpace:'nowrap' }}>{toast}</div>}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}


      {redeemOpen && (
        <div style={{ position:'fixed',inset:0,zIndex:600,background:'rgba(0,0,0,.65)',display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
          <div style={{ width:'100%',maxWidth:420,background:'var(--card)',borderRadius:24,padding:24,boxShadow:'0 28px 60px rgba(0,0,0,.35)' }}>
            <h3 style={{ fontSize:18,fontWeight:800,color:'var(--text)',marginBottom:12 }}>Redeem Cashback</h3>
            <p style={{ fontSize:13,color:'var(--text-secondary)',marginBottom:16 }}>Move your cashback into your main balance instantly.</p>
            <div style={{ marginBottom:14 }}>
              <p style={{ fontSize:12,color:'var(--text-secondary)',marginBottom:6 }}>Available cashback</p>
              <p style={{ fontSize:16,fontWeight:800,color:ORANGE }}>₦{user?.cashbackBalance.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:8 }}>Amount to redeem</label>
              <input value={redeemAmount} onChange={e=>setRedeemAmount(e.target.value.replace(/[^0-9.]/g,''))}
                placeholder="0.00" inputMode="decimal"
                style={{ width:'100%',padding:'12px 14px',borderRadius:12,border:'1px solid var(--border)',fontSize:16,color:'var(--text)',background:'var(--bg-secondary)' }} />
              {redeemError && <p style={{ margin:8, color:RED, fontSize:13 }}>{redeemError}</p>}
            </div>
            <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
              <button onClick={()=>{ setRedeemOpen(false); setRedeemError(''); setRedeemAmount(''); }}
                style={{ flex:1,padding:'12px 16px',borderRadius:14,background:'var(--bg-secondary)',border:'1px solid var(--border)',color:'var(--text)',fontWeight:700,cursor:'pointer' }}>
                Cancel
              </button>
              <button onClick={handleRedeemCashback} disabled={redeemLoading || !redeemAmount || Number(redeemAmount)<=0 || Number(redeemAmount) > (user?.cashbackBalance||0)}
                style={{ flex:1,padding:'12px 16px',borderRadius:14,border:'none',background:redeemLoading||!redeemAmount||Number(redeemAmount)<=0||Number(redeemAmount)>(user?.cashbackBalance||0)?'rgba(142,142,147,.35)':ORANGE,color:redeemLoading||!redeemAmount||Number(redeemAmount)<=0||Number(redeemAmount)>(user?.cashbackBalance||0)?'rgba(28,28,30,.6)':'#1A1A1A',fontWeight:700,cursor:redeemLoading||!redeemAmount||Number(redeemAmount)<=0||Number(redeemAmount)>(user?.cashbackBalance||0)?'not-allowed':'pointer' }}>
                {redeemLoading ? 'Processing…' : 'Redeem'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ height:'100dvh',overflowY:'auto',background:dark ? 'linear-gradient(180deg,#040810 0%,#0A1221 48%,#08101D 100%)' : 'linear-gradient(180deg,#F3F7FF 0%,#EEF3FB 52%,#F7F9FD 100%)',paddingTop:'80px',paddingBottom:100,backgroundImage: dark ? 'radial-gradient(ellipse at 50% -8%, rgba(0,113,227,0.18) 0%, transparent 56%)' : 'radial-gradient(ellipse at 50% -18%, rgba(0,113,227,0.12) 0%, transparent 58%)',backgroundAttachment: 'fixed' }}>
        <Header />
        
        {/* Wallet Card */}
        <div style={{ margin:'0 16px',background:'linear-gradient(140deg,#011A4D 0%,#003EAD 55%,#0068D8 100%)',borderRadius:20,padding:'12px',border:'1px solid rgba(255,255,255,.14)',boxShadow:'0 12px 32px rgba(0,66,173,.30)',position:'relative',overflow:'hidden' }}>
          <div style={{ position:'absolute',right:-50,top:-50,width:160,height:160,borderRadius:'50%',background:'rgba(255,255,255,.08)',pointerEvents:'none' }} />
          <div style={{ position:'absolute',left:-36,bottom:-42,width:130,height:130,borderRadius:'50%',background:'rgba(0,210,255,.11)',pointerEvents:'none' }} />
          {/* Top row: balance + sync */}
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10,position:'relative',zIndex:1 }}>
            <div>
              <p style={{ color:'rgba(255,255,255,.68)',fontSize:9,fontWeight:800,margin:0,letterSpacing:'.08em',textTransform:'uppercase' }}>Balance</p>
              <p style={{ color:'#FFFFFF',fontWeight:900,fontSize:22,margin:'4px 0 0',lineHeight:1.1 }}>₦{user.walletBalance.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
            </div>
            <button onClick={refreshUser} className="tactile-btn" style={{ background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,255,255,.2)',borderRadius:999,padding:'6px 10px',cursor:'pointer',fontSize:11,fontWeight:800,color:'#FFFFFF',transition:'all .2s',flexShrink:0,marginTop:2 }}>↻ Sync</button>
          </div>
          {/* Cashback + Referral row */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8,position:'relative',zIndex:1 }}>
            <div style={{ background:'rgba(255,255,255,.1)',borderRadius:12,padding:'10px 10px',border:'1px solid rgba(255,255,255,.16)',display:'flex',flexDirection:'column',gap:6 }}>
              <p style={{ color:'rgba(255,255,255,.68)',fontSize:9,fontWeight:800,margin:0,letterSpacing:'.08em',textTransform:'uppercase' }}>Cashback</p>
              <p style={{ color:'#FFD38D',fontWeight:800,fontSize:13,margin:0,lineHeight:1.2 }}>₦{user.cashbackBalance.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
              <button onClick={() => setRedeemOpen(true)} disabled={user.cashbackBalance <= 0} className="tactile-btn" style={{ alignSelf:'flex-start',background:user.cashbackBalance > 0 ? 'rgba(255,159,10,.22)' : 'rgba(255,255,255,.08)',border:user.cashbackBalance > 0 ? '1px solid rgba(255,159,10,.38)' : '1px solid rgba(255,255,255,.14)',borderRadius:999,padding:'4px 8px',cursor:user.cashbackBalance > 0 ? 'pointer' : 'not-allowed',fontSize:9,fontWeight:800,color:user.cashbackBalance > 0 ? '#FFD9A6' : 'rgba(255,255,255,.45)' }}>Redeem</button>
            </div>
            <button onClick={()=>setScreen('earn')} style={{ background:'rgba(255,255,255,.1)',borderRadius:12,padding:'10px 10px',border:'1px solid rgba(255,255,255,.16)',textAlign:'left',cursor:'pointer',display:'flex',flexDirection:'column',gap:6 }}>
              <p style={{ color:'rgba(255,255,255,.68)',fontSize:9,fontWeight:800,margin:0,letterSpacing:'.08em',textTransform:'uppercase' }}>Referral</p>
              <p style={{ color:'#BFE2FF',fontWeight:800,fontSize:13,margin:0,lineHeight:1.2 }}>₦{referralBalance.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
              <p style={{ color:'rgba(255,255,255,.6)',fontSize:9,fontWeight:800,margin:0 }}>Open Earn →</p>
            </button>
          </div>
          {/* Account details: stacked rows */}
          <div style={{ background:'rgba(255,255,255,.1)',borderRadius:12,padding:'10px 10px',border:'1px solid rgba(255,255,255,.18)',position:'relative',zIndex:1,display:'flex',flexDirection:'column',gap:8 }}>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ color:'#FFFFFF',fontWeight:800,fontSize:12,fontFamily:'monospace',letterSpacing:'0.04em',flex:1,wordBreak:'break-word' }}>🔢 {user.accountNumber || 'N/A'}</span>
              <button onClick={() => { navigator.clipboard.writeText(user.accountNumber || ''); showToast('✓ Copied'); }} className="tactile-btn" style={{ background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.22)',borderRadius:999,padding:'5px 10px',cursor:'pointer',fontSize:10,fontWeight:800,color:'#FFFFFF',transition:'all .2s',flexShrink:0 }}>Copy</button>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ color:'rgba(255,255,255,.72)',fontSize:11,fontWeight:700 }}>🏦 {user.bankName || 'No Bank'}</span>
            </div>
          </div>
        </div>

        {/* Broadcast Ticker */}
        {broadcasts.length > 0 && (
          <div style={{ margin:'20px 16px 0',background:'var(--bg-secondary)',borderRadius:14,padding:'12px 16px',overflow:'hidden',border:'1px solid var(--border)' }}>
            <div style={{ display:'flex',gap:40,whiteSpace:'nowrap',animation:'tick 10s linear infinite' }}>
              {[...broadcasts,...broadcasts].map((b,i)=>(
                <span key={i} style={{ fontSize:13,color:'var(--text)',fontWeight:500 }}>{b}</span>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ margin:'24px 16px 0' }}>
          <p style={{ fontSize:11,fontWeight:700,color:'var(--text-secondary)',letterSpacing:.8,marginBottom:10,marginLeft:2,textTransform:'uppercase' }}>Quick Actions</p>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8 }}>

            {/* Electricity */}
            <button onClick={()=>setScreen('electricity')} className="tactile-btn"
              style={{ width:'100%',height:96,borderRadius:16,padding:'12px 8px 10px',background:dark ? 'linear-gradient(160deg,rgba(255,159,10,.22) 0%,rgba(255,159,10,.09) 100%)' : 'linear-gradient(160deg,rgba(255,159,10,.14) 0%,rgba(255,159,10,.05) 100%)',border:'1px solid rgba(255,159,10,.3)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',cursor:'pointer',transition:'transform .18s,box-shadow .18s',boxShadow:'0 2px 8px rgba(255,159,10,.12)' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.03)';e.currentTarget.style.boxShadow='0 8px 22px rgba(255,159,10,.26)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 2px 8px rgba(255,159,10,.12)'}}>
              <div style={{ width:38,height:38,borderRadius:10,background:'rgba(255,159,10,.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:19 }}>⚡</div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:11,fontWeight:800,color:'var(--text)',margin:0,lineHeight:1.2 }}>Electricity</p>
                <p style={{ fontSize:9,fontWeight:600,color:'rgba(255,159,10,.88)',margin:'2px 0 0',lineHeight:1.2,letterSpacing:.1 }}>Pay Bill</p>
              </div>
            </button>

            {/* Airtime */}
            <button onClick={()=>setScreen('airtime')} className="tactile-btn"
              style={{ width:'100%',height:96,borderRadius:16,padding:'12px 8px 10px',background:dark ? 'linear-gradient(160deg,rgba(72,187,120,.22) 0%,rgba(72,187,120,.09) 100%)' : 'linear-gradient(160deg,rgba(72,187,120,.13) 0%,rgba(72,187,120,.05) 100%)',border:'1px solid rgba(72,187,120,.28)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',cursor:'pointer',transition:'transform .18s,box-shadow .18s',boxShadow:'0 2px 8px rgba(72,187,120,.10)' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.03)';e.currentTarget.style.boxShadow='0 8px 22px rgba(72,187,120,.26)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 2px 8px rgba(72,187,120,.10)'}}>
              <div style={{ width:38,height:38,borderRadius:10,background:'rgba(72,187,120,.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:19 }}>📱</div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:11,fontWeight:800,color:'var(--text)',margin:0,lineHeight:1.2 }}>Airtime</p>
                <p style={{ fontSize:9,fontWeight:600,color:'rgba(72,187,120,.88)',margin:'2px 0 0',lineHeight:1.2,letterSpacing:.1 }}>Top Up</p>
              </div>
            </button>

            {/* Data */}
            <button onClick={()=>setScreen('data-networks')} className="tactile-btn"
              style={{ width:'100%',height:96,borderRadius:16,padding:'12px 8px 10px',background:dark ? 'linear-gradient(160deg,rgba(0,113,227,.22) 0%,rgba(0,113,227,.09) 100%)' : 'linear-gradient(160deg,rgba(0,113,227,.13) 0%,rgba(0,113,227,.05) 100%)',border:'1px solid rgba(0,113,227,.28)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',cursor:'pointer',transition:'transform .18s,box-shadow .18s',boxShadow:'0 2px 8px rgba(0,113,227,.10)' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.03)';e.currentTarget.style.boxShadow='0 8px 22px rgba(0,113,227,.26)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,113,227,.10)'}}>
              <div style={{ width:38,height:38,borderRadius:10,background:'rgba(0,113,227,.18)',display:'flex',alignItems:'center',justifyContent:'center' }}>{Icons.bolt(BLUE, 19)}</div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:11,fontWeight:800,color:'var(--text)',margin:0,lineHeight:1.2 }}>Data</p>
                <p style={{ fontSize:9,fontWeight:600,color:'rgba(0,113,227,.85)',margin:'2px 0 0',lineHeight:1.2,letterSpacing:.1 }}>All Networks</p>
              </div>
            </button>

            {/* Store */}
            <button onClick={()=>{ loadProducts(); setScreen('store'); }} className="tactile-btn"
              style={{ width:'100%',height:96,borderRadius:16,padding:'12px 8px 10px',background:dark ? 'linear-gradient(160deg,rgba(48,209,88,.22) 0%,rgba(48,209,88,.09) 100%)' : 'linear-gradient(160deg,rgba(48,209,88,.13) 0%,rgba(48,209,88,.05) 100%)',border:'1px solid rgba(48,209,88,.28)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',cursor:'pointer',transition:'transform .18s,box-shadow .18s',boxShadow:'0 2px 8px rgba(48,209,88,.10)' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.03)';e.currentTarget.style.boxShadow='0 8px 22px rgba(48,209,88,.26)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 2px 8px rgba(48,209,88,.10)'}}>
              <div style={{ width:38,height:38,borderRadius:10,background:'rgba(48,209,88,.18)',display:'flex',alignItems:'center',justifyContent:'center' }}>{Icons.chartBar(GREEN, 19)}</div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:11,fontWeight:800,color:'var(--text)',margin:0,lineHeight:1.2 }}>Store</p>
                <p style={{ fontSize:9,fontWeight:600,color:'rgba(48,209,88,.85)',margin:'2px 0 0',lineHeight:1.2,letterSpacing:.1 }}>Premium Gadgets</p>
              </div>
            </button>

            {/* Send */}
            <button onClick={()=>setScreen('bank-transfer')} className="tactile-btn"
              style={{ width:'100%',height:96,borderRadius:16,padding:'12px 8px 10px',background:dark ? 'linear-gradient(160deg,rgba(255,184,76,.22) 0%,rgba(255,184,76,.09) 100%)' : 'linear-gradient(160deg,rgba(255,184,76,.13) 0%,rgba(255,184,76,.05) 100%)',border:'1px solid rgba(255,184,76,.28)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',cursor:'pointer',transition:'transform .18s,box-shadow .18s',boxShadow:'0 2px 8px rgba(255,184,76,.10)' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.03)';e.currentTarget.style.boxShadow='0 8px 22px rgba(255,184,76,.26)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 2px 8px rgba(255,184,76,.10)'}}>
              <div style={{ width:38,height:38,borderRadius:10,background:'rgba(255,184,76,.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:19 }}>🏦</div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:11,fontWeight:800,color:'var(--text)',margin:0,lineHeight:1.2 }}>Bank Transfer</p>
                <p style={{ fontSize:9,fontWeight:600,color:'rgba(255,184,76,.88)',margin:'2px 0 0',lineHeight:1.2,letterSpacing:.1 }}>Wallet to Bank</p>
              </div>
            </button>

            {/* Send */}
            <button onClick={()=>setScreen('transfer')} className="tactile-btn"
              style={{ width:'100%',height:96,borderRadius:16,padding:'12px 8px 10px',background:dark ? 'linear-gradient(160deg,rgba(90,200,250,.22) 0%,rgba(90,200,250,.09) 100%)' : 'linear-gradient(160deg,rgba(90,200,250,.13) 0%,rgba(90,200,250,.05) 100%)',border:'1px solid rgba(90,200,250,.28)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',cursor:'pointer',transition:'transform .18s,box-shadow .18s',boxShadow:'0 2px 8px rgba(90,200,250,.10)' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.03)';e.currentTarget.style.boxShadow='0 8px 22px rgba(90,200,250,.26)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 2px 8px rgba(90,200,250,.10)'}}>
              <div style={{ width:38,height:38,borderRadius:10,background:'rgba(90,200,250,.18)',display:'flex',alignItems:'center',justifyContent:'center' }}>{Icons.sendIcon(TEAL, 19)}</div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:11,fontWeight:800,color:'var(--text)',margin:0,lineHeight:1.2 }}>Send</p>
                <p style={{ fontSize:9,fontWeight:600,color:'rgba(90,200,250,.85)',margin:'2px 0 0',lineHeight:1.2,letterSpacing:.1 }}>User Transfer</p>
              </div>
            </button>

            {/* Dev API */}
            <button onClick={()=>{ setScreen(user?.isDeveloper ? 'developer-dashboard' : 'developer-terms'); }} className="tactile-btn"
              style={{ width:'100%',height:96,borderRadius:16,padding:'12px 8px 10px',background:dark ? 'linear-gradient(160deg,rgba(191,90,242,.22) 0%,rgba(191,90,242,.09) 100%)' : 'linear-gradient(160deg,rgba(191,90,242,.13) 0%,rgba(191,90,242,.05) 100%)',border:'1px solid rgba(191,90,242,.28)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',cursor:'pointer',transition:'transform .18s,box-shadow .18s',boxShadow:'0 2px 8px rgba(191,90,242,.10)' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.03)';e.currentTarget.style.boxShadow='0 8px 22px rgba(191,90,242,.26)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0) scale(1)';e.currentTarget.style.boxShadow='0 2px 8px rgba(191,90,242,.10)'}}>
              <div style={{ width:38,height:38,borderRadius:10,background:'rgba(191,90,242,.18)',display:'flex',alignItems:'center',justifyContent:'center' }}>{Icons.code(PURPLE, 19)}</div>
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:11,fontWeight:800,color:'var(--text)',margin:0,lineHeight:1.2 }}>{user?.isDeveloper ? 'Dev API' : 'Dev API'}</p>
                <p style={{ fontSize:9,fontWeight:600,color:'rgba(191,90,242,.85)',margin:'2px 0 0',lineHeight:1.2,letterSpacing:.1 }}>API Docs</p>
              </div>
            </button>

          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ margin:'28px 16px 0' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
            <p style={{ fontSize:13,fontWeight:700,color:'var(--text-secondary)',letterSpacing:.5,margin:0,marginLeft:4,textTransform:'uppercase' }}>Recent Activity</p>
            <button onClick={()=>setScreen('transactions')} style={{ display:'inline-flex',alignItems:'center',gap:5,background:'none',border:'none',padding:0,color:'var(--text-secondary)',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.02em' }}>
              <span style={{ fontSize:13 }}>◎</span>
              <span>Transaction History</span>
            </button>
          </div>
          {transactions.length === 0 ? (
            <div style={{ textAlign:'center',padding:'48px 20px',background:'var(--card)',borderRadius:16,border:'1px dashed var(--border)' }}>
              <div style={{ fontSize:40,marginBottom:12 }}>∿</div>
              <p style={{ fontWeight:700,fontSize:15,color:'var(--text)',marginBottom:6 }}>No activity yet</p>
              <p style={{ color:'var(--text-secondary)',fontSize:13,lineHeight:1.5 }}>Buy data or shop to see transactions here</p>
            </div>
          ) : (
            <div style={{ background:'var(--card)',borderRadius:16,overflow:'hidden',border:'1px solid var(--border)',boxShadow:'0 4px 16px rgba(0,0,0,.08)' }}>
              {transactions.slice(0,8).map((tx,i) => {
                // Determine transaction type and formatting
                const isDeposit = tx.type === 'deposit';
                const isData = tx.type === 'data';
                const isProduct = tx.type === 'product';
                const isCashback = tx.type === 'cashback' || tx.type === 'cashback_redemption';
                const isTransferOut = tx.type === 'transfer_out';
                const isTransferIn = tx.type === 'transfer_in';
                const isApiPurchase = tx.type === 'api_purchase';
                
                // Icon and color mapping
                const typeConfig: Record<string, {icon: any; color: string; bg: string; label: string}> = {
                  deposit: { icon: Icons.arrowDown(GREEN, 18), color: GREEN, bg: 'rgba(48,209,88,.08)', label: 'Deposit' },
                  data: { icon: Icons.bolt(BLUE, 18), color: BLUE, bg: 'rgba(0,113,227,.08)', label: 'Data Purchase' },
                  api_data: { icon: Icons.bolt(BLUE, 18), color: BLUE, bg: 'rgba(0,113,227,.08)', label: 'API Data Purchase' },
                  api_purchase: { icon: Icons.code(PURPLE, 18), color: PURPLE, bg: 'rgba(191,90,242,.08)', label: 'API Purchase' },
                  product: { icon: Icons.download(PURPLE, 18), color: PURPLE, bg: 'rgba(191,90,242,.08)', label: 'Product' },
                  cashback: { icon: Icons.arrowUp(ORANGE, 18), color: ORANGE, bg: 'rgba(255,159,10,.08)', label: 'Cashback' },
                  transfer_in: { icon: Icons.arrowDown(TEAL, 18), color: TEAL, bg: 'rgba(90,200,250,.08)', label: 'Money Received' },
                  transfer_out: { icon: Icons.arrowUp(TEAL, 18), color: TEAL, bg: 'rgba(90,200,250,.08)', label: 'Money Sent' },
                };
                
                const config = typeConfig[tx.type] || typeConfig.deposit;
                const amount = Number(tx.amount);
                const isCredit = isDeposit || isCashback || isTransferIn;
                const displayAmount = `${isCredit ? '+' : '−'}₦${amount.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
                const amountColor = isCredit ? GREEN : RED;
                
                return (
                  <button className="haptic-pulse stagger-card" key={tx.id} onClick={()=>{ if(tx.receipt) { setReceipt({ ...(tx.receipt as Record<string,unknown>), type: tx.type }); } }} style={{ width:'100%',display:'flex',alignItems:'center',gap:12,padding:'16px 16px',borderBottom: i<Math.min(transactions.length,8)-1?'1px solid rgba(0,0,0,.06)':undefined,background:'transparent',cursor:'pointer',transition:'all .2s cubic-bezier(.16,.1,0,1)',animationDelay:`${i * 32}ms`,border:'none',fontFamily:'inherit',textAlign:'left' }} onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--bg-secondary)'}} onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent'}} onTouchStart={e=>{(e.currentTarget as HTMLElement).style.transform='scale(.992)';}} onTouchEnd={e=>{(e.currentTarget as HTMLElement).style.transform='scale(1)';}}>
                    {/* Icon */}
                    <div style={{ width:40,height:40,borderRadius:10,background:config.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                      {config.icon}
                    </div>
                    
                    {/* Details */}
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontWeight:700,fontSize:14,color:'var(--text)',margin:0,lineHeight:1.3 }}>{tx.description || config.label}</p>
                      <p style={{ fontSize:12,color:'var(--text-secondary)',margin:'6px 0 0',letterSpacing:'0.02em' }}>{new Date(tx.createdAt).toLocaleString('en-NG',{dateStyle:'short',timeStyle:'short'})}</p>
                    </div>
                    
                    {/* Amount & Status */}
                    <div style={{ textAlign:'right',flexShrink:0,display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6 }}>
                      <p style={{ fontWeight:800,fontSize:15,color:amountColor,margin:0,letterSpacing:'-0.01em' }}>{displayAmount}</p>
                      <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'4px 10px',borderRadius:8,fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.03em',color:tx.status === 'success' ? GREEN : tx.status === 'pending' ? ORANGE : RED,background:tx.status === 'success' ? 'rgba(48,209,88,.13)' : tx.status === 'pending' ? 'rgba(255,159,10,.13)' : 'rgba(255,59,48,.13)' }}><span style={{ width:4,height:4,borderRadius:'50%',background:'currentColor' }} />{tx.status === 'success' ? 'Completed' : tx.status === 'pending' ? 'Pending' : 'Failed'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {BottomNav({ active: 'home' })}
    </>
  );

  /* DATA NETWORKS */
  if (screen === 'data-networks') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',background:dark ? 'linear-gradient(180deg,#050A13 0%,#08101B 100%)' : 'linear-gradient(180deg,#F4F8FF 0%,#EFF4FB 100%)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'52px 20px 10px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border)' }}>
          <button onClick={()=>setScreen('home')} style={{ color:BLUE,fontSize:16,fontWeight:700 }}>← Back</button>
          <div>
            <h2 style={{ fontSize:20,fontWeight:900,color:'var(--text)',letterSpacing:-0.5 }}>Buy Data</h2>
            <p style={{ fontSize:11,color:'var(--text-secondary)',marginTop:2 }}>Select network and enter recipient number</p>
          </div>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'12px 16px 16px' }}>
          <div style={{ width:'100%',background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'12px 14px',boxShadow:dark ? '0 8px 18px rgba(0,0,0,.18)' : '0 8px 18px rgba(12,28,54,.06)',marginBottom:10 }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6 }}>
              <label style={{ fontSize:11,fontWeight:800,color:'var(--text-secondary)',letterSpacing:'0.06em',textTransform:'uppercase' }}>Recipient Number</label>
              {showContactCoach && <div style={{ background:'linear-gradient(135deg,#0047CC,#0071E3)',color:'#fff',fontSize:9,fontWeight:900,padding:'2px 8px',borderRadius:20,letterSpacing:'0.05em',animation:'coachBadgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',whiteSpace:'nowrap' }}>✨ NEW</div>}
            </div>
            <div style={{ position:'relative' }}>
              <input
                value={buyPhone}
                onChange={e=>setBuyPhone(e.target.value.replace(/\D/g,'').slice(0,11))}
                placeholder="Enter 11-digit phone number"
                inputMode="numeric"
                maxLength={11}
                style={{ width:'100%',padding:'13px 52px 13px 12px',borderRadius:12,background:'var(--bg-secondary)',border:'1.5px solid var(--border)',color:'var(--text)',fontSize:16,fontWeight:700,letterSpacing:'0.04em' }}
              />
              <button
                onClick={openContactPicker}
                className={showContactCoach ? 'contact-btn-coach' : ''}
                style={{ position:'absolute',right:7,top:'50%',transform:'translateY(-50%)',width:36,height:36,borderRadius:10,background:showContactCoach ? 'linear-gradient(135deg,#0047CC,#0071E3)' : 'var(--card)',border:showContactCoach ? 'none' : '1.5px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s ease',zIndex:2,flexShrink:0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={showContactCoach ? '#fff' : BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke={showContactCoach ? '#fff' : BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke={showContactCoach ? '#fff' : BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={showContactCoach ? '#fff' : BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {showContactCoach && (
                <div style={{ position:'absolute',top:'calc(100% + 12px)',right:0,background:dark?'#1D1D1F':'#FFFFFF',border:'1.5px solid rgba(0,113,227,.25)',borderRadius:16,padding:'12px 16px',zIndex:400,boxShadow:dark?'0 10px 36px rgba(0,0,0,.55)':'0 10px 36px rgba(0,113,227,.22)',animation:'coachPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both',minWidth:210,maxWidth:270 }}>
                  <div style={{ position:'absolute',top:-7,right:13,width:13,height:13,background:dark?'#1D1D1F':'#FFFFFF',border:'1.5px solid rgba(0,113,227,.25)',transform:'rotate(45deg)',borderBottom:'none',borderRight:'none' }} />
                  <p style={{ fontSize:13,fontWeight:800,color:'var(--text)',marginBottom:4 }}>📒 Pick from Contacts</p>
                  <p style={{ fontSize:12,color:'var(--text-secondary)',lineHeight:1.55 }}>Tap the icon to select a contact or pick from your recent purchases.</p>
                  <button onClick={()=>{ setShowContactCoach(false); try{localStorage.setItem('dataBuyContactCoachSeen','1')}catch{} }} style={{ marginTop:9,fontSize:12,fontWeight:700,color:BLUE,background:'none',border:'none',cursor:'pointer',padding:0 }}>Got it ✓</button>
                </div>
              )}
            </div>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--text-secondary)',marginTop:5 }}>
              <span>Format: 08012345678</span>
              <span>{buyPhone.length}/11</span>
            </div>
          </div>

          <p style={{ fontSize:11,fontWeight:800,color:'var(--text-secondary)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8 }}>Select Network</p>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
            {NETWORKS.map(net => {
              const networkLogos = { 'MTN': '/images/mtn.png', 'GLO': '/images/glo.png', 'AIRTEL': '/images/airtel.png', '9MOBILE': '/images/oip.jpg' };
              const selected = selectedNetwork?.name === net.name;
              return (
                <button key={net.name} onClick={()=>{ setSelectedNetwork(net); playSound('tap'); }}
                  className="ledger-card"
                  style={{ background:'var(--card)',borderRadius:16,padding:'12px',display:'flex',alignItems:'center',gap:10,border:selected ? `1.5px solid ${BLUE}` : '1px solid var(--border)',boxShadow:selected ? (dark ? '0 8px 20px rgba(0,113,227,.3)' : '0 8px 20px rgba(0,113,227,.15)') : (dark ? '0 6px 16px rgba(0,0,0,.18)' : '0 6px 16px rgba(12,28,54,.06)'),transition:'all .25s',cursor:'pointer',textAlign:'left' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';}}>
                  <div style={{ width:42,height:42,borderRadius:12,background:'linear-gradient(145deg,rgba(0,113,227,.1),rgba(90,200,250,.04))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <img src={networkLogos[net.name as keyof typeof networkLogos]} alt={net.name} style={{ width:32,height:32,borderRadius:8,objectFit:'contain' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight:800,fontSize:14,color:'var(--text)' }}>{net.name}</p>
                    {selected && <p style={{ fontSize:10,color:BLUE,fontWeight:700,marginTop:2 }}>✓ Selected</p>}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={()=>{
              if (!selectedNetwork) { showError('Select a network first'); return; }
              if (buyPhone.length !== 11) { showError('Enter 11-digit phone number'); return; }
              playSound('tap');
              loadPlans(selectedNetwork.name);
              setScreen('data-plans');
            }}
            disabled={!selectedNetwork || buyPhone.length !== 11}
            className="tactile-btn"
            style={{ width:'100%',marginTop:12,padding:'15px',background:selectedNetwork && buyPhone.length===11 ? 'linear-gradient(135deg,#0047CC,#0071E3)' : 'rgba(142,142,147,.35)',color:'#fff',borderRadius:14,fontWeight:800,fontSize:16,border:'none',cursor:selectedNetwork && buyPhone.length===11 ? 'pointer' : 'not-allowed',opacity:selectedNetwork && buyPhone.length===11 ? 1 : 0.72,boxShadow:selectedNetwork && buyPhone.length===11 ? '0 10px 22px rgba(0,113,227,.3)' : 'none' }}>
            Continue to Plans →
          </button>
        </div>
      </div>
      {renderContactPickerSheet()}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
    </>
  );

  /* DATA PHONE */
  if (screen === 'data-phone') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',background:dark ? 'linear-gradient(180deg,#050A13 0%,#08101B 100%)' : 'linear-gradient(180deg,#F4F8FF 0%,#EFF4FB 100%)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'58px 20px 18px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border)' }}>
          <button onClick={()=>setScreen('data-networks')} style={{ color:BLUE,fontSize:16,fontWeight:700 }}>← Back</button>
          <div>
            <h2 style={{ fontSize:22,fontWeight:900,color:'var(--text)',letterSpacing:-0.4 }}>Recipient Number</h2>
            <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:4 }}>Step 2 of 3 · Confirm the number for {selectedNetwork?.name}</p>
          </div>
        </div>
        <div style={{ flex:1,display:'flex',flexDirection:'column',padding:'24px 20px 40px',gap:18 }}>
          <div style={{ background:'linear-gradient(145deg,#011A4D 0%,#0047CC 70%,#0071E3 100%)',borderRadius:24,padding:'22px 18px',color:'#fff',position:'relative',overflow:'hidden' }}>
            <div style={{ position:'absolute',right:-38,top:-40,width:132,height:132,borderRadius:'50%',background:'rgba(255,255,255,.08)' }} />
            <div style={{ display:'flex',alignItems:'center',gap:14,position:'relative',zIndex:1 }}>
              <div style={{ width:72,height:72,borderRadius:18,background:'rgba(255,255,255,.12)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <img src={selectedNetwork?.name === 'MTN' ? '/images/mtn.png' : selectedNetwork?.name === 'GLO' ? '/images/glo.png' : selectedNetwork?.name === 'AIRTEL' ? '/images/airtel.png' : '/images/mtn.png'} alt={selectedNetwork?.name} style={{ width:56,height:56,objectFit:'contain' }} />
              </div>
              <div>
                <p style={{ fontSize:11,fontWeight:700,opacity:.74,letterSpacing:'0.08em',textTransform:'uppercase' }}>{selectedNetwork?.name} Checkout</p>
                <p style={{ fontSize:22,fontWeight:900,letterSpacing:'-0.03em',marginTop:4 }}>Enter recipient phone number</p>
                <p style={{ fontSize:12,opacity:.82,lineHeight:1.6,marginTop:6 }}>The next step will show all available bundles for this number.</p>
              </div>
            </div>
          </div>
          <div style={{ width:'100%',background:'var(--card)',border:'1px solid var(--border)',borderRadius:22,padding:'18px',boxShadow:dark ? '0 14px 34px rgba(0,0,0,.22)' : '0 14px 34px rgba(12,28,54,.08)' }}>
            <label style={{ display:'block',fontSize:12,fontWeight:800,color:'var(--text-secondary)',marginBottom:10,letterSpacing:'0.08em',textTransform:'uppercase' }}>Phone number</label>
            <div style={{ position:'relative',marginBottom:14 }}>
              <input value={buyPhone} onChange={e=>setBuyPhone(e.target.value.replace(/\D/g,'').slice(0,11))}
                placeholder="Enter 11-digit phone number" inputMode="numeric" maxLength={11}
                style={{ width:'100%',padding:'16px 56px 16px 16px',borderRadius:14,background:'var(--bg-secondary)',border:'1.5px solid var(--border)',color:'var(--text)',fontSize:18,fontWeight:700,letterSpacing:'0.04em' }} />
              <button
                onClick={openContactPicker}
                style={{ position:'absolute',right:9,top:'50%',transform:'translateY(-50%)',width:40,height:40,borderRadius:12,background:'var(--card)',border:'1.5px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s ease',zIndex:2 }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text-secondary)',marginBottom:16 }}>
              <span>Supported format: 08012345678</span>
              <span>{buyPhone.length}/11</span>
            </div>
            <button onClick={()=>{ if(buyPhone.length!==11){showError('Enter 11-digit phone number');return;} loadPlans(selectedNetwork?.name || ''); setScreen('data-plans'); }}
              disabled={buyPhone.length!==11} 
              className="tactile-btn"
              style={{ width:'100%',padding:'16px',background:buyPhone.length===11?'linear-gradient(135deg,#0047CC,#0071E3)':'rgba(142,142,147,.35)',color:'#fff',borderRadius:14,fontWeight:800,fontSize:16,border:'none',cursor:buyPhone.length===11?'pointer':'not-allowed',opacity:buyPhone.length===11?1:0.72,boxShadow:buyPhone.length===11?'0 12px 26px rgba(0,113,227,.32)':'none' }}>
              Continue to Plans
            </button>
          </div>
        </div>
      </div>
      {renderContactPickerSheet()}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
    </>
  );

  /* DATA PLANS */
  if (screen === 'data-plans') return (
    <>
      <GlobalStyle dark={dark} />
      <div style={{ height:'100dvh',background:dark ? 'linear-gradient(180deg,#050A13 0%,#08101B 100%)' : 'linear-gradient(180deg,#F4F8FF 0%,#EFF4FB 100%)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'58px 20px 18px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border)' }}>
          <button onClick={()=>setScreen('data-networks')} style={{ color:BLUE,fontSize:16,fontWeight:700 }}>← Back</button>
          <div>
            <h2 style={{ fontSize:22,fontWeight:900,color:'var(--text)',letterSpacing:-0.4 }}>{selectedNetwork?.name} Plans</h2>
            <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:4 }}>Step 2 of 2 · Choose the most suitable bundle for {buyPhone}</p>
          </div>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'18px 16px 40px' }}>
          <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,boxShadow:dark ? '0 10px 24px rgba(0,0,0,.2)' : '0 10px 24px rgba(12,28,54,.06)' }}>
            <div>
              <p style={{ fontSize:11,fontWeight:800,color:'var(--text-secondary)',letterSpacing:'0.08em',textTransform:'uppercase' }}>Recipient</p>
              <p style={{ fontSize:16,fontWeight:800,color:'var(--text)',marginTop:4 }}>{buyPhone}</p>
            </div>
            <div style={{ padding:'8px 12px',borderRadius:999,background:'rgba(0,113,227,.1)',color:BLUE,fontSize:12,fontWeight:800 }}>{selectedNetwork?.name}</div>
          </div>
          {plans.length === 0 ? (
            <div style={{ textAlign:'center',color:'var(--text-secondary)',padding:40,background:'var(--card)',border:'1px solid var(--border)',borderRadius:20 }}>No plans available</div>
          ) : (
            <div style={{ display:'grid',gap:12,marginTop:12 }}>
              {plans.map(plan => (
                <button key={plan.id} onClick={()=>{ if(buyPhone.length!==11){showError('Enter 11-digit phone number');return;} setSelectedPlan(plan); setPinAction('buy-data'); setShowPin(true); }}
                  className="ledger-card"
                  style={{ background:'var(--card)',borderRadius:18,padding:'16px',display:'flex',justifyContent:'space-between',alignItems:'center',border:'1px solid var(--border)',width:'100%',boxShadow:dark ? '0 10px 20px rgba(0,0,0,.2)' : '0 10px 20px rgba(12,28,54,.06)' }}>
                  <div style={{ textAlign:'left',display:'flex',alignItems:'center',gap:12 }}>
                    <div style={{ width:46,height:46,borderRadius:14,background:'linear-gradient(145deg,rgba(0,113,227,.12),rgba(90,200,250,.04))',display:'flex',alignItems:'center',justifyContent:'center',color:BLUE,fontWeight:900,fontSize:14 }}>
                      {(plan.dataSize || '').slice(0,2) || 'DT'}
                    </div>
                    <div>
                      <p style={{ fontWeight:800,fontSize:16,color:'var(--text)' }}>{plan.dataSize}</p>
                      <p style={{ color:'var(--text-secondary)',fontSize:13,marginTop:3 }}>{plan.validity}</p>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:18,fontWeight:900,color:BLUE }}>₦{plan.price.toLocaleString()}</p>
                    <p style={{ fontSize:11,fontWeight:700,color:'var(--text-secondary)',marginTop:4 }}>Tap to authorize</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {showPin && selectedPlan && (
        <PinKeyboard
          title={`Confirm ${selectedPlan.dataSize} Purchase`}
          subtitle={`Authorize ₦${selectedPlan.price.toLocaleString('en-NG',{minimumFractionDigits:2})} for ${selectedNetwork?.name} on ${buyPhone}`}
          onComplete={handlePinComplete} onClose={()=>setShowPin(false)} />
      )}
      {isBuyingData && selectedPlan && !receipt && (
        <div style={{ position:'fixed',inset:0,zIndex:320,background:dark?'rgba(2,8,18,.8)':'rgba(7,20,39,.64)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',backdropFilter:'blur(10px)' }}>
          <div className="fade-up-scale" style={{ width:'100%',maxWidth:420,background:dark?'linear-gradient(180deg,rgba(17,22,30,.98),rgba(10,14,20,.98))':'linear-gradient(180deg,rgba(255,255,255,.97),rgba(246,250,255,.96))',border:'1px solid var(--border)',borderRadius:24,padding:'24px 22px',boxShadow:dark?'0 28px 70px rgba(0,0,0,.48)':'0 28px 70px rgba(12,28,54,.24)',textAlign:'center',position:'relative',overflow:'hidden' }}>
            <div style={{ position:'absolute',top:-80,right:-70,width:220,height:220,borderRadius:'50%',background:'rgba(0,113,227,.14)',filter:'blur(24px)',animation:'breathe 2.2s ease-in-out infinite' }} />
            <div style={{ position:'absolute',bottom:-90,left:-80,width:200,height:200,borderRadius:'50%',background:'rgba(90,200,250,.14)',filter:'blur(24px)',animation:'breathe 2.4s ease-in-out .2s infinite' }} />
            <div style={{ position:'relative',zIndex:1 }}>
              <div style={{ width:82,height:82,borderRadius:'50%',margin:'0 auto 16px',display:'grid',placeItems:'center',background:'linear-gradient(145deg,rgba(0,113,227,.22),rgba(90,200,250,.12))',boxShadow:'inset 0 1px 0 rgba(255,255,255,.35), 0 14px 34px rgba(0,113,227,.25)' }}>
                <div style={{ width:42,height:42,borderRadius:'50%',border:'4px solid rgba(255,255,255,.34)',borderTopColor:'#fff',animation:'spin .9s linear infinite' }} />
              </div>
              <h3 style={{ fontSize:22,fontWeight:900,color:'var(--text)',letterSpacing:-0.3,marginBottom:8 }}>Processing your purchase</h3>
              <p style={{ fontSize:14,color:'var(--text-secondary)',lineHeight:1.55,marginBottom:14 }}>
                Buying {selectedPlan.dataSize} on {selectedNetwork?.name} for {buyPhone}. Please keep this screen open.
              </p>
              <div style={{ height:8,borderRadius:999,background:dark?'rgba(255,255,255,.08)':'rgba(0,113,227,.12)',margin:'0 8px 14px',overflow:'hidden' }}>
                <div style={{ width:'100%',height:'100%',background:'linear-gradient(90deg,rgba(0,113,227,.25),rgba(0,113,227,.95),rgba(90,200,250,.35),rgba(0,113,227,.25))',backgroundSize:'200% 100%',animation:'shimmer 1.3s linear infinite' }} />
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8,marginBottom:14 }}>
                {['Validating PIN','Contacting Network','Finalizing Receipt'].map((stage, idx)=>(
                  <div key={stage} style={{ borderRadius:10,padding:'8px 6px',fontSize:10,fontWeight:800,letterSpacing:'0.05em',textTransform:'uppercase',border:'1px solid var(--border)',background:idx<=buyDataProgressStage?'rgba(0,113,227,.14)':'transparent',color:idx<=buyDataProgressStage?BLUE:'var(--text-secondary)',transition:'all .25s ease' }}>
                    {stage}
                  </div>
                ))}
              </div>
              <div style={{ margin:'0 auto',display:'inline-flex',alignItems:'center',gap:7,padding:'8px 12px',borderRadius:999,background:'rgba(0,113,227,.12)',color:BLUE,fontSize:12,fontWeight:800,letterSpacing:'0.06em',textTransform:'uppercase' }}>
                <span style={{ width:7,height:7,borderRadius:'50%',background:BLUE,animation:'pulse 1.1s ease-in-out infinite' }} />
                <span>{buyDataProgressStage === 0 ? 'Validating pin' : buyDataProgressStage === 1 ? 'Contacting network' : 'Finalizing receipt'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
      {receipt && <Receipt data={receipt} onDownload={()=>{}} onClose={()=>{ setReceipt(null); setScreen('home'); }} dark={dark} />}
    </>
  );

  /* STORE */
  if (screen === 'store') return (
    <>
      <GlobalStyle dark={dark} />
      {receipt && <Receipt data={receipt} onDownload={()=>{}} onClose={()=>{ setReceipt(null); setScreen('home'); }} dark={dark} />}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
      {toast && <div className="fade-in" style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:15,fontWeight:600,zIndex:500 }}>{toast}</div>}
      <div style={{ height:'100dvh',background:dark ? 'linear-gradient(180deg,#050A13 0%,#08101B 100%)' : 'linear-gradient(180deg,#F5F8FF 0%,#EEF3FB 100%)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'58px 20px 18px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border)' }}>
          <button onClick={()=>setScreen('home')} style={{ color:BLUE,fontSize:16,fontWeight:700 }}>← Back</button>
          <div>
            <h2 style={{ fontSize:24,fontWeight:900,color:'var(--text)',letterSpacing:-0.4 }}>Store</h2>
            <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:4 }}>Executive storefront for devices, MiFi, routers, and accessories</p>
          </div>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'18px 16px 40px' }}>
          <div style={{ background:'linear-gradient(145deg,#011A4D 0%,#0047CC 70%,#0071E3 100%)',borderRadius:22,padding:'20px 18px',color:'#fff',marginBottom:16,position:'relative',overflow:'hidden' }}>
            <div style={{ position:'absolute',right:-40,top:-50,width:150,height:150,borderRadius:'50%',background:'rgba(255,255,255,.08)' }} />
            <p style={{ fontSize:11,fontWeight:700,opacity:.72,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8 }}>Curated Hardware</p>
            <p style={{ fontSize:24,fontWeight:900,letterSpacing:'-0.03em' }}>Shop premium connectivity devices</p>
            <p style={{ fontSize:13,opacity:.82,lineHeight:1.7,marginTop:8,maxWidth:480 }}>Browse routers, MiFi units, accessories, and other products with a cleaner retail experience and better purchase confidence.</p>
          </div>
          {products.length === 0 ? (
            <div style={{ textAlign:'center',padding:'56px 20px',background:'var(--card)',borderRadius:20,border:'1px solid var(--border)' }}>
              <div style={{ width:72,height:72,borderRadius:20,margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(145deg,rgba(0,113,227,.16),rgba(90,200,250,.08))' }}>{Icons.download(BLUE, 34)}</div>
              <p style={{ fontSize:17,fontWeight:800,color:'var(--text)' }}>Store inventory coming online</p>
              <p style={{ fontSize:13,color:'var(--text-secondary)',marginTop:8,lineHeight:1.6 }}>Products will appear here as soon as they are published.</p>
            </div>
          ) : (
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
              {products.map(p => (
                <button key={p.id} onClick={()=>{ setSelectedProduct(p); setScreen('product'); }}
                  className="ledger-card"
                  style={{ background:'var(--card)',borderRadius:20,overflow:'hidden',textAlign:'left',border:'1px solid var(--border)',boxShadow:dark ? '0 10px 28px rgba(0,0,0,.22)' : '0 12px 28px rgba(12,28,54,.08)',cursor:'pointer' }}>
                  <div style={{ height:170,background:'var(--bg-secondary)',position:'relative',overflow:'hidden' }}>
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : p.imageBase64 ? <img src={`data:image/jpeg;base64,${p.imageBase64}`} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : <div style={{ height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(145deg,rgba(0,113,227,.12),rgba(90,200,250,.04))' }}>{Icons.download(BLUE, 32)}</div>}
                    <div style={{ position:'absolute',top:12,left:12,padding:'6px 10px',borderRadius:999,background:p.inStock?'rgba(48,209,88,.88)':'rgba(255,59,48,.88)',color:'#fff',fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.05em' }}>{p.inStock ? 'In Stock' : 'Unavailable'}</div>
                  </div>
                  <div style={{ padding:'14px' }}>
                    <p style={{ fontWeight:800,fontSize:14,color:'var(--text)',lineHeight:1.45,marginBottom:8,minHeight:'2.8em' }}>{p.name}</p>
                    <div style={{ display:'flex',alignItems:'baseline',gap:2 }}>
                      <span style={{ fontSize:24,fontWeight:900,color:BLUE,lineHeight:1 }}>₦</span>
                      <span style={{ fontWeight:800,fontSize:18,color:'var(--text)' }}>{Number(p.price).toLocaleString('en-NG',{maximumFractionDigits:0})}</span>
                    </div>
                    <p style={{ marginTop:8,fontSize:12,color:'var(--text-secondary)' }}>{p.category || 'Devices'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  /* PRODUCT DETAIL */
  if (screen === 'product' && selectedProduct) return (
    <>
      <GlobalStyle dark={dark} />
      {showPin && <PinKeyboard title={`Pay ₦${Number(selectedProduct.price).toLocaleString()}`} subtitle={selectedProduct.name} onComplete={handlePinComplete} onClose={()=>setShowPin(false)} />}
      {receipt && <Receipt data={receipt} onDownload={()=>{}} onClose={()=>{ setReceipt(null); setScreen('home'); }} dark={dark} />}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
      <div style={{ height:'100dvh',background:dark ? 'linear-gradient(180deg,#050A13 0%,#08101B 100%)' : 'linear-gradient(180deg,#F5F8FF 0%,#EEF3FB 100%)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'58px 20px 18px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border)' }}>
          <button onClick={()=>setScreen('store')} style={{ color:BLUE,fontSize:16,fontWeight:700 }}>← Back</button>
          <div>
            <h2 style={{ fontSize:22,fontWeight:900,color:'var(--text)',letterSpacing:-0.4 }}>Product Details</h2>
            <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:4 }}>Premium product presentation and address confirmation</p>
          </div>
        </div>
        <div style={{ flex:1,overflowY:'auto',paddingBottom:110 }}>
          <div style={{ height:320,background:'var(--bg-secondary)',overflow:'hidden',borderBottom:'1px solid var(--border)' }}>
            {selectedProduct.imageUrl ? <img src={selectedProduct.imageUrl} alt={selectedProduct.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : selectedProduct.imageBase64 ? <img src={`data:image/jpeg;base64,${selectedProduct.imageBase64}`} alt={selectedProduct.name} style={{ width:'100%',height:'100%',objectFit:'cover' }} /> : <div style={{ height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(145deg,rgba(0,113,227,.12),rgba(90,200,250,.04))' }}>{Icons.download(BLUE, 42)}</div>}
          </div>
          <div style={{ padding:'18px 16px 0' }}>
            <div style={{ background:'var(--card)',borderRadius:22,padding:'18px',border:'1px solid var(--border)',boxShadow:dark ? '0 14px 34px rgba(0,0,0,.2)' : '0 14px 34px rgba(12,28,54,.08)',marginBottom:14 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:14,marginBottom:10 }}>
                <h1 style={{ fontSize:24,fontWeight:900,color:'var(--text)',flex:1,letterSpacing:'-0.03em' }}>{selectedProduct.name}</h1>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontSize:26,fontWeight:900,color:BLUE,whiteSpace:'nowrap' }}>₦{Number(selectedProduct.price).toLocaleString()}</p>
                  <div style={{ marginTop:6,display:'inline-flex',padding:'5px 10px',borderRadius:999,background:selectedProduct.inStock?'rgba(48,209,88,.12)':'rgba(255,59,48,.12)',color:selectedProduct.inStock?GREEN:RED,fontSize:11,fontWeight:800,textTransform:'uppercase' }}>{selectedProduct.inStock ? 'Available' : 'Out of Stock'}</div>
                </div>
              </div>
              {selectedProduct.description && <p style={{ fontSize:14,color:'var(--text-secondary)',lineHeight:1.8 }}>{selectedProduct.description}</p>}
            </div>

            <div style={{ display:'grid',gap:12 }}>
              {selectedProduct.shippingTerms && (
                <div style={{ background:'var(--card)',borderRadius:18,padding:'16px',border:'1px solid var(--border)' }}>
                  <p style={{ fontWeight:800,fontSize:14,color:'var(--text)',marginBottom:8 }}>Shipping Terms</p>
                  <p style={{ fontSize:14,color:'var(--text-secondary)',lineHeight:1.7 }}>{selectedProduct.shippingTerms}</p>
                </div>
              )}
              {selectedProduct.pickupTerms && (
                <div style={{ background:'var(--card)',borderRadius:18,padding:'16px',border:'1px solid var(--border)' }}>
                  <p style={{ fontWeight:800,fontSize:14,color:'var(--text)',marginBottom:8 }}>Pickup Terms</p>
                  <p style={{ fontSize:14,color:'var(--text-secondary)',lineHeight:1.7 }}>{selectedProduct.pickupTerms}</p>
                </div>
              )}
              <div style={{ background:'var(--card)',borderRadius:18,padding:'16px',border:'1px solid var(--border)' }}>
                <p style={{ fontWeight:800,fontSize:14,color:'var(--text)',marginBottom:12 }}>Delivery Address</p>
                <label style={{ display:'block',fontSize:12,fontWeight:800,color:'var(--text-secondary)',marginBottom:6,letterSpacing:'0.05em',textTransform:'uppercase' }}>Street Address</label>
                <input value={deliveryAddress} onChange={e=>setDeliveryAddress(e.target.value)} placeholder="123 Main Street" maxLength={100} style={{ width:'100%',padding:'13px 14px',borderRadius:12,background:'var(--bg-secondary)',border:'1px solid var(--border)',color:'var(--text)',fontSize:14,marginBottom:12,boxSizing:'border-box' }} />
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  <div>
                    <label style={{ display:'block',fontSize:12,fontWeight:800,color:'var(--text-secondary)',marginBottom:6,letterSpacing:'0.05em',textTransform:'uppercase' }}>City</label>
                    <input value={deliveryCity} onChange={e=>setDeliveryCity(e.target.value)} placeholder="Lagos" style={{ width:'100%',padding:'13px 14px',borderRadius:12,background:'var(--bg-secondary)',border:'1px solid var(--border)',color:'var(--text)',fontSize:14,boxSizing:'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display:'block',fontSize:12,fontWeight:800,color:'var(--text-secondary)',marginBottom:6,letterSpacing:'0.05em',textTransform:'uppercase' }}>Postal Code</label>
                    <input value={deliveryPostalCode} onChange={e=>setDeliveryPostalCode(e.target.value)} placeholder="100001" style={{ width:'100%',padding:'13px 14px',borderRadius:12,background:'var(--bg-secondary)',border:'1px solid var(--border)',color:'var(--text)',fontSize:14,boxSizing:'border-box' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {selectedProduct.inStock && (
          <div style={{ position:'fixed',bottom:0,left:0,right:0,padding:'16px 20px',background:'var(--card)',borderTop:'1px solid var(--border)',boxShadow:'0 -10px 28px rgba(0,0,0,.12)' }}>
            <button onClick={()=>{ playSound('confirm'); setPinAction('buy-product'); setShowPin(true); }} className="tactile-btn" style={{ width:'100%',padding:'16px',borderRadius:14,background:'linear-gradient(135deg,#0047CC,#0071E3)',color:'#fff',fontSize:16,fontWeight:800,boxShadow:'0 12px 26px rgba(0,113,227,.32)' }}>
              Buy for ₦{Number(selectedProduct.price).toLocaleString()}
            </button>
          </div>
        )}
      </div>
    </>
  );

  /* ELECTRICITY */
  if (screen === 'electricity') {
    const amount = Number(electricityForm.amount || 0);
    const serviceCharge = 100;
    const total = amount + serviceCharge;
    const providerOptions = electricityProviders.filter((p) => {
      const q = electricityProviderSearch.trim().toLowerCase();
      if (!q) return p.type === electricityForm.meterType;
      return p.type === electricityForm.meterType && (`${p.name} ${p.itemCode}`.toLowerCase().includes(q));
    });

    return (
      <>
        <GlobalStyle dark={dark} />
        {showPin && <PinKeyboard title="Confirm electricity PIN" subtitle="Authorize electricity purchase with your PIN" onComplete={handlePinComplete} onClose={()=>setShowPin(false)} pinAction={pinAction} />}

        {electricitySummaryOpen && (
          <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:420,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
            <div style={{ width:'100%',maxWidth:420,background:'var(--card)',border:'1px solid var(--border)',borderRadius:18,padding:16 }}>
              <h3 style={{ fontSize:18,fontWeight:900,color:'var(--text)',marginBottom:10 }}>Confirm Electricity Purchase</h3>
              <div style={{ display:'grid',gap:8 }}>
                <p style={{ fontSize:13,color:'var(--text-secondary)',margin:0 }}><b>DISCO:</b> {electricityForm.discoName}</p>
                <p style={{ fontSize:13,color:'var(--text-secondary)',margin:0 }}><b>Meter:</b> {electricityForm.meterNumber}</p>
                <p style={{ fontSize:13,color:'var(--text-secondary)',margin:0 }}><b>Customer:</b> {electricityForm.customerName}</p>
                <p style={{ fontSize:13,color:'var(--text-secondary)',margin:0 }}><b>Meter Type:</b> {electricityForm.meterType}</p>
                <p style={{ fontSize:13,color:'var(--text-secondary)',margin:0 }}><b>Amount:</b> ₦{amount.toLocaleString('en-NG')}</p>
                <p style={{ fontSize:13,color:'var(--text-secondary)',margin:0 }}><b>Service Charge:</b> ₦{serviceCharge.toLocaleString('en-NG')}</p>
                <p style={{ fontSize:14,fontWeight:900,color:'var(--text)',margin:'4px 0 0' }}><b>Total:</b> ₦{total.toLocaleString('en-NG')}</p>
              </div>
              <div style={{ display:'flex',gap:8,marginTop:16 }}>
                <button onClick={()=>setElectricitySummaryOpen(false)} style={{ flex:1,padding:'12px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontWeight:700,color:'var(--text)' }}>Cancel</button>
                <button onClick={()=>{ setElectricitySummaryOpen(false); setPinAction('electricity'); setShowPin(true); }} style={{ flex:1,padding:'12px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#0047CC,#0071E3)',fontWeight:800,color:'#fff' }}>Confirm Purchase</button>
              </div>
            </div>
          </div>
        )}

        {electricitySuccess && (
          <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:420,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
            <div style={{ width:'100%',maxWidth:420,background:'var(--card)',border:'1px solid var(--border)',borderRadius:18,padding:16 }}>
              <p style={{ fontSize:18,fontWeight:900,color:'#30D158',marginBottom:8 }}>Purchase Successful</p>
              {String(electricitySuccess.meterType || '') === 'prepaid' && Boolean(electricitySuccess.token) && (
                <>
                  <p style={{ fontSize:11,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4 }}>Token</p>
                  <p style={{ fontSize:21,fontWeight:900,color:'var(--text)',fontFamily:'monospace',margin:'0 0 10px' }}>{String(electricitySuccess.token)}</p>
                  <button onClick={()=>{ navigator.clipboard.writeText(String(electricitySuccess.token)); showToast('Token copied!'); }} style={{ padding:'9px 12px',borderRadius:10,border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text)',fontWeight:700,marginBottom:10 }}>Copy Token</button>
                </>
              )}
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={()=>setElectricitySuccess(null)} style={{ flex:1,padding:'12px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontWeight:700,color:'var(--text)' }}>Close</button>
                <button onClick={()=>{ setElectricitySuccess(null); setScreen('transactions'); }} style={{ flex:1,padding:'12px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#0047CC,#0071E3)',fontWeight:800,color:'#fff' }}>View Receipt</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ height:'100dvh',overflowY:'auto',WebkitOverflowScrolling:'touch',background:dark ? 'linear-gradient(180deg,#040810 0%,#0A1221 48%,#08101D 100%)' : 'linear-gradient(180deg,#F3F7FF 0%,#EEF3FB 52%,#F7F9FD 100%)',paddingBottom:116 }}>
          <div style={{ padding:'52px 16px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12 }}>
            <button onClick={()=>setScreen('home')} style={{ color:BLUE,fontSize:16,fontWeight:700 }}>← Back</button>
            <button onClick={loadElectricityProviders} style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'10px 14px',color:'var(--text)',fontSize:13,fontWeight:700 }}>Refresh</button>
          </div>

          <div style={{ margin:'0 16px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:16 }}>
            <h2 style={{ fontSize:20,fontWeight:900,color:'var(--text)',marginBottom:6 }}>Electricity Bill Payment</h2>
            <p style={{ fontSize:12,color:'var(--text-secondary)',marginBottom:14 }}>Verify meter first, then complete payment with your PIN.</p>

            <label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:6 }}>Meter Type</label>
            <div style={{ display:'flex',gap:10,marginBottom:12 }}>
              {(['prepaid','postpaid'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setElectricityForm((prev) => ({ ...prev, meterType: t, itemCode:'', discoName:'', verified:false, customerName:'' }));
                    setElectricityProviderSearch('');
                    setElectricityProviderOpen(false);
                  }}
                  style={{ padding:'8px 12px',borderRadius:999,border:`1px solid ${electricityForm.meterType === t ? BLUE : 'var(--border)'}`,background:electricityForm.meterType === t ? 'rgba(0,113,227,.12)' : 'transparent',fontSize:12,fontWeight:700,color:electricityForm.meterType === t ? BLUE : 'var(--text-secondary)' }}
                >
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            <label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:6 }}>DISCO Provider</label>
            <div style={{ position:'relative',marginBottom:12 }}>
              <input
                value={electricityProviderSearch}
                onFocus={()=>setElectricityProviderOpen(true)}
                onChange={(e)=>{ setElectricityProviderSearch(e.target.value); setElectricityProviderOpen(true); }}
                onBlur={()=>setTimeout(()=>setElectricityProviderOpen(false), 120)}
                placeholder="Search DISCO provider"
                style={{ width:'100%',padding:'12px 40px 12px 13px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:14,color:'var(--text)' }}
              />
              <button
                onClick={()=>setElectricityProviderOpen((prev)=>!prev)}
                style={{ position:'absolute',right:10,top:10,width:24,height:24,borderRadius:8,border:'none',background:'transparent',color:'var(--text-secondary)',fontSize:14,fontWeight:900,lineHeight:1 }}
              >
                {electricityProviderOpen ? '▴' : '▾'}
              </button>
              {electricityProviderOpen && (
                <div style={{ position:'absolute',left:0,right:0,top:'calc(100% + 6px)',maxHeight:180,overflowY:'auto',border:'1px solid var(--border)',borderRadius:12,background:'var(--card)',zIndex:25,boxShadow:dark ? '0 10px 24px rgba(0,0,0,.32)' : '0 10px 24px rgba(0,0,0,.08)' }}>
                  {providerOptions.length === 0 ? (
                    <p style={{ fontSize:12,color:'var(--text-secondary)',padding:10,margin:0 }}>No provider found</p>
                  ) : providerOptions.map((p) => (
                    <button
                      key={`${p.itemCode}-${p.type}`}
                      onMouseDown={(e)=>e.preventDefault()}
                      onClick={() => {
                        setElectricityForm((prev) => ({ ...prev, itemCode: p.itemCode, discoName: p.name, meterType: p.type, verified:false, customerName:'' }));
                        setElectricityProviderSearch(`${p.name} (${p.type})`);
                        setElectricityProviderOpen(false);
                      }}
                      style={{ width:'100%',textAlign:'left',padding:'10px 12px',background:electricityForm.itemCode === p.itemCode ? 'rgba(0,113,227,.12)' : 'transparent',border:'none',borderBottom:'1px solid var(--border)',fontSize:13,color:'var(--text)' }}
                    >
                      {p.name} ({p.type})
                    </button>
                  ))}
                </div>
              )}
            </div>

            <label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:6 }}>Meter Number</label>
            <div style={{ display:'flex',gap:8,marginBottom:8 }}>
              <input
                value={electricityForm.meterNumber}
                onChange={(e)=>{
                  const meter = e.target.value.replace(/\D/g,'').slice(0,11);
                  setElectricityForm((prev)=>({ ...prev, meterNumber: meter, verified:false, customerName:'' }));
                  if (electricityStatus !== 'idle') setElectricityStatus('idle');
                }}
                placeholder="11-digit meter number"
                style={{ flex:1,padding:'12px 13px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:14,color:'var(--text)' }}
              />
              <button onClick={verifyElectricityMeter} disabled={electricityStatus === 'verifying'} style={{ padding:'0 12px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#0047CC,#0071E3)',fontSize:12,fontWeight:800,color:'#fff' }}>{electricityStatus === 'verifying' ? 'Verifying…' : 'Verify Meter'}</button>
            </div>
            {electricityForm.verified && electricityForm.customerName && <p style={{ fontSize:12,color:'#30D158',margin:'2px 0 10px' }}>✓ {electricityForm.customerName}</p>}
            {!electricityForm.verified && electricityStatus === 'failed' && <p style={{ fontSize:12,color:RED,margin:'2px 0 10px' }}>✗ {electricityFailure || 'Meter verification failed'}</p>}

            <label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:6 }}>Amount</label>
            <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:8 }}>
              {[2000,5000,10000,20000].map((v) => (
                <button key={v} onClick={()=>setElectricityForm((prev)=>({ ...prev, amount:String(v) }))} style={{ padding:'7px 10px',borderRadius:999,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:12,fontWeight:700,color:'var(--text)' }}>₦{(v/1000)}K</button>
              ))}
            </div>
            <input value={electricityForm.amount} onChange={(e)=>setElectricityForm((prev)=>({ ...prev, amount:e.target.value.replace(/\D/g,'') }))} placeholder="Enter amount (₦1,000 - ₦100,000)" style={{ width:'100%',padding:'12px 13px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:14,color:'var(--text)',marginBottom:8 }} />
            <p style={{ fontSize:12,color:'var(--text-secondary)',margin:'0 0 10px' }}>Service charge: ₦100 · Total: <b style={{ color:'var(--text)' }}>₦{(Number(electricityForm.amount || 0) + 100).toLocaleString('en-NG')}</b></p>

            <label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:6 }}>Phone Number</label>
            <input value={electricityForm.phoneNumber} onChange={(e)=>setElectricityForm((prev)=>({ ...prev, phoneNumber:e.target.value.replace(/\D/g,'').slice(0,11) }))} placeholder="Phone number" style={{ width:'100%',padding:'12px 13px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:14,color:'var(--text)',marginBottom:10 }} />

            <label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:6 }}>Email</label>
            <input value={electricityForm.email} onChange={(e)=>setElectricityForm((prev)=>({ ...prev, email:e.target.value }))} placeholder="Email address" style={{ width:'100%',padding:'12px 13px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:14,color:'var(--text)',marginBottom:14 }} />

            {electricityFailure && <p style={{ fontSize:12,color:RED,margin:'0 0 10px' }}>{electricityFailure}</p>}
            <button onClick={beginElectricityPurchase} disabled={!electricityForm.verified || electricityStatus === 'processing'} style={{ width:'100%',padding:'14px',borderRadius:14,border:'none',background:(!electricityForm.verified || electricityStatus === 'processing') ? 'rgba(0,0,0,.25)' : 'linear-gradient(135deg,#0047CC,#0071E3)',fontSize:15,fontWeight:900,color:'#fff',opacity:(!electricityForm.verified || electricityStatus === 'processing') ? .6 : 1 }}>
              {electricityStatus === 'processing' ? 'Processing your electricity purchase...' : 'Purchase Electricity'}
            </button>
          </div>
        </div>

        {BottomNav({ active: 'home' })}
      </>
    );
  }

  /* AIRTIME */
  if (screen === 'airtime') {
    const amount = Number(airtimeAmount || 0);
    const total = amount;

    return (
      <>
        <GlobalStyle dark={dark} />
        {showPin && <PinKeyboard title="Confirm airtime PIN" subtitle="Authorize airtime purchase with your PIN" onComplete={handlePinComplete} onClose={()=>setShowPin(false)} pinAction={pinAction} />}

        {airtimeSummaryOpen && (
          <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:420,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
            <div style={{ width:'100%',maxWidth:420,background:'var(--card)',border:'1px solid var(--border)',borderRadius:18,padding:16 }}>
              <h3 style={{ fontSize:18,fontWeight:900,color:'var(--text)',marginBottom:10 }}>Confirm Airtime Purchase</h3>
              <div style={{ display:'grid',gap:8 }}>
                <p style={{ fontSize:13,color:'var(--text-secondary)',margin:0 }}><b>Network:</b> {airtimeNetwork}</p>
                <p style={{ fontSize:13,color:'var(--text-secondary)',margin:0 }}><b>Phone:</b> {airtimePhone}</p>
                <p style={{ fontSize:13,color:'var(--text-secondary)',margin:0 }}><b>Amount:</b> ₦{amount.toLocaleString('en-NG')}</p>
                <p style={{ fontSize:14,fontWeight:900,color:'var(--text)',margin:'4px 0 0' }}><b>Total:</b> ₦{total.toLocaleString('en-NG')}</p>
              </div>
              <div style={{ display:'flex',gap:8,marginTop:16 }}>
                <button onClick={()=>setAirtimeSummaryOpen(false)} style={{ flex:1,padding:'12px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontWeight:700,color:'var(--text)' }}>Cancel</button>
                <button onClick={()=>{ setAirtimeSummaryOpen(false); setPinAction('airtime'); setShowPin(true); }} style={{ flex:1,padding:'12px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#0047CC,#0071E3)',fontWeight:800,color:'#fff' }}>Confirm Purchase</button>
              </div>
            </div>
          </div>
        )}

        {airtimeSuccess && (
          <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:420,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
            <div style={{ width:'100%',maxWidth:420,background:'var(--card)',border:'1px solid var(--border)',borderRadius:18,padding:16 }}>
              <p style={{ fontSize:18,fontWeight:900,color:'#30D158',marginBottom:8 }}>Purchase Successful</p>
              <p style={{ fontSize:13,color:'var(--text-secondary)',marginBottom:14 }}>Your airtime has been delivered. Check your balance.</p>
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={()=>setAirtimeSuccess(null)} style={{ flex:1,padding:'12px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontWeight:700,color:'var(--text)' }}>Close</button>
                <button onClick={()=>{ setAirtimeSuccess(null); setScreen('transactions'); }} style={{ flex:1,padding:'12px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#0047CC,#0071E3)',fontWeight:800,color:'#fff' }}>View Receipt</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ height:'100dvh',overflowY:'auto',WebkitOverflowScrolling:'touch',background:dark ? 'linear-gradient(180deg,#040810 0%,#0A1221 48%,#08101D 100%)' : 'linear-gradient(180deg,#F3F7FF 0%,#EEF3FB 52%,#F7F9FD 100%)',paddingBottom:116 }}>
          <div style={{ padding:'52px 16px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12 }}>
            <button onClick={()=>setScreen('home')} style={{ color:BLUE,fontSize:16,fontWeight:700 }}>← Back</button>
          </div>

          <div style={{ margin:'0 16px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:16 }}>
            <h2 style={{ fontSize:20,fontWeight:900,color:'var(--text)',marginBottom:6 }}>Airtime Top Up</h2>
            <p style={{ fontSize:12,color:'var(--text-secondary)',marginBottom:14 }}>Send airtime instantly to any network.</p>

            <label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:6 }}>Network</label>
            <select value={airtimeNetwork} onChange={(e)=>setAirtimeNetwork(e.target.value as 'MTN' | 'Airtel' | 'GLO' | '9mobile' | '')} style={{ width:'100%',padding:'12px 13px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:14,color:'var(--text)',marginBottom:14 }}>
              <option value="">Select network</option>
              <option value="MTN">MTN</option>
              <option value="Airtel">Airtel</option>
              <option value="GLO">GLO</option>
              <option value="9mobile">9mobile</option>
            </select>

            <label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:6 }}>Phone Number</label>
            <input value={airtimePhone} onChange={(e)=>setAirtimePhone(e.target.value.replace(/\D/g,'').slice(0,11))} placeholder="081234567890" style={{ width:'100%',padding:'12px 13px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:14,color:'var(--text)',marginBottom:14 }} />

            <label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:6 }}>Amount</label>
            <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:8 }}>
              {[50,100,500,1000].map((v) => (
                <button key={v} onClick={()=>setAirtimeAmount(String(v))} style={{ padding:'7px 10px',borderRadius:999,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:12,fontWeight:700,color:'var(--text)' }}>₦{v}</button>
              ))}
            </div>
            <input value={airtimeAmount} onChange={(e)=>setAirtimeAmount(e.target.value.replace(/\D/g,''))} placeholder="Enter amount (₦50 - ₦50,000)" style={{ width:'100%',padding:'12px 13px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:14,color:'var(--text)',marginBottom:8 }} />
            <p style={{ fontSize:12,color:'var(--text-secondary)',margin:'0 0 14px' }}>Total: <b style={{ color:'var(--text)' }}>₦{(Number(airtimeAmount || 0)).toLocaleString('en-NG')}</b></p>

            {airtimeFailure && <p style={{ fontSize:12,color:RED,margin:'0 0 10px' }}>{airtimeFailure}</p>}
            <button onClick={beginAirtimePurchase} disabled={airtimeStatus === 'processing'} style={{ width:'100%',padding:'14px',borderRadius:14,border:'none',background:airtimeStatus === 'processing' ? 'rgba(0,0,0,.25)' : 'linear-gradient(135deg,#0047CC,#0071E3)',fontSize:15,fontWeight:900,color:'#fff',opacity:airtimeStatus === 'processing' ? .6 : 1 }}>
              {airtimeStatus === 'processing' ? 'Processing your airtime purchase...' : 'Buy Airtime'}
            </button>
          </div>
        </div>

        {BottomNav({ active: 'home' })}
      </>
    );
  }

  /* TRANSACTIONS */
  if (screen === 'transactions') return (
    <>
      <GlobalStyle dark={dark} />
      {receipt && <Receipt data={receipt} onDownload={()=>{}} onClose={()=>setReceipt(null)} dark={dark} />}
      <div style={{ height:'100dvh',background:dark ? 'linear-gradient(180deg,#05070D 0%,#090E1A 42%,#0A101B 100%)' : 'linear-gradient(180deg,#F6F8FC 0%,#EDF2FB 38%,#F4F6FA 100%)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'60px 20px 20px',borderBottom:`1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'}`,background:dark ? 'linear-gradient(180deg,rgba(0,113,227,.18),transparent)' : 'linear-gradient(180deg,rgba(0,113,227,.1),transparent)' }}>
          <h2 style={{ fontSize:28,fontWeight:900,color:'var(--text)',letterSpacing:-0.7 }}>Activity</h2>
          <p style={{ color:'var(--text-secondary)',fontSize:13,marginTop:6,letterSpacing:'0.02em' }}>Fintech timeline of your credits and debits</p>
          <div style={{ display:'flex',gap:8,marginTop:12 }}>
            <button onClick={()=>setTxFilter('all')} style={{ padding:'7px 12px',borderRadius:999,border:`1px solid ${txFilter==='all' ? BLUE : 'var(--border)'}`,background:txFilter==='all' ? 'rgba(0,113,227,.12)' : 'transparent',fontSize:12,fontWeight:700,color:txFilter==='all' ? BLUE : 'var(--text-secondary)' }}>All</button>
            <button onClick={()=>setTxFilter('electricity')} style={{ padding:'7px 12px',borderRadius:999,border:`1px solid ${txFilter==='electricity' ? BLUE : 'var(--border)'}`,background:txFilter==='electricity' ? 'rgba(0,113,227,.12)' : 'transparent',fontSize:12,fontWeight:700,color:txFilter==='electricity' ? BLUE : 'var(--text-secondary)' }}>Electricity</button>
            <button onClick={()=>setTxFilter('airtime')} style={{ padding:'7px 12px',borderRadius:999,border:`1px solid ${txFilter==='airtime' ? BLUE : 'var(--border)'}`,background:txFilter==='airtime' ? 'rgba(0,113,227,.12)' : 'transparent',fontSize:12,fontWeight:700,color:txFilter==='airtime' ? BLUE : 'var(--text-secondary)' }}>Airtime</button>
            <button onClick={()=>setTxFilter('bank-transfer')} style={{ padding:'7px 12px',borderRadius:999,border:`1px solid ${txFilter==='bank-transfer' ? BLUE : 'var(--border)'}`,background:txFilter==='bank-transfer' ? 'rgba(0,113,227,.12)' : 'transparent',fontSize:12,fontWeight:700,color:txFilter==='bank-transfer' ? BLUE : 'var(--text-secondary)' }}>Bank Transfer</button>
          </div>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'16px 16px 24px' }}>
          {filteredTransactions.length === 0 ? (
            <div style={{ textAlign:'center',padding:'64px 24px',background:'var(--card)',borderRadius:20,border:'1px solid var(--border)' }}>
              <div style={{ width:76,height:76,borderRadius:22,margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(140deg,rgba(0,113,227,.16),rgba(90,200,250,.12))',fontSize:34,color:BLUE }}>◎</div>
              <p style={{ fontSize:17,fontWeight:800,color:'var(--text)' }}>No activity yet</p>
              <p style={{ fontSize:13,color:'var(--text-secondary)',marginTop:8,lineHeight:1.6 }}>Your completed transactions will show here in a clean ledger format.</p>
            </div>
          ) : txFilter === 'electricity' ? (
            <div style={{ background:'var(--card)',borderRadius:16,overflow:'hidden',border:'1px solid var(--border)' }}>
              <div style={{ display:'grid',gridTemplateColumns:'1.2fr 1fr 1fr 0.9fr 0.7fr 0.8fr',gap:8,padding:'10px 12px',borderBottom:'1px solid var(--border)',fontSize:11,fontWeight:800,color:'var(--text-secondary)',textTransform:'uppercase' }}>
                <span>Date & Time</span>
                <span>DISCO</span>
                <span>Meter Number</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {filteredTransactions.map((tx) => {
                const r = (tx.receipt || {}) as Record<string, unknown>;
                const status = String(tx.status || 'pending');
                return (
                  <div key={tx.id} style={{ display:'grid',gridTemplateColumns:'1.2fr 1fr 1fr 0.9fr 0.7fr 0.8fr',gap:8,padding:'11px 12px',borderBottom:'1px solid var(--border)',alignItems:'center' }}>
                    <span style={{ fontSize:12,color:'var(--text-secondary)' }}>{new Date(tx.createdAt).toLocaleString('en-NG',{dateStyle:'short',timeStyle:'short'})}</span>
                    <span style={{ fontSize:12,fontWeight:700,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{String(r.discoName || tx.description || 'Electricity')}</span>
                    <span style={{ fontSize:12,color:'var(--text-secondary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{String(r.meterNumber || '—')}</span>
                    <span style={{ fontSize:12,fontWeight:800,color:'var(--text)' }}>₦{Number((r.totalAmount as number) || tx.amount || 0).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                    <span style={{ fontSize:11,fontWeight:800,color:status === 'success' ? GREEN : status === 'failed' ? RED : '#FF9F0A' }}>{status}</span>
                    <button onClick={()=>{ if (tx.receipt) setReceipt({ ...(tx.receipt as Record<string, unknown>), type: tx.type }); }} style={{ padding:'6px 8px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:11,fontWeight:700,color:'var(--text)' }}>View Receipt</button>
                  </div>
                );
              })}
            </div>
          ) : txFilter === 'airtime' ? (
            <div style={{ background:'var(--card)',borderRadius:16,overflow:'hidden',border:'1px solid var(--border)' }}>
              <div style={{ display:'grid',gridTemplateColumns:'1.2fr 1fr 1fr 0.9fr 0.7fr 0.8fr',gap:8,padding:'10px 12px',borderBottom:'1px solid var(--border)',fontSize:11,fontWeight:800,color:'var(--text-secondary)',textTransform:'uppercase' }}>
                <span>Date & Time</span>
                <span>Network</span>
                <span>Phone Number</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {filteredTransactions.map((tx) => {
                const r = (tx.receipt || {}) as Record<string, unknown>;
                const status = String(tx.status || 'pending');
                return (
                  <div key={tx.id} style={{ display:'grid',gridTemplateColumns:'1.2fr 1fr 1fr 0.9fr 0.7fr 0.8fr',gap:8,padding:'11px 12px',borderBottom:'1px solid var(--border)',alignItems:'center' }}>
                    <span style={{ fontSize:12,color:'var(--text-secondary)' }}>{new Date(tx.createdAt).toLocaleString('en-NG',{dateStyle:'short',timeStyle:'short'})}</span>
                    <span style={{ fontSize:12,fontWeight:700,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{String(r.networkName || 'Airtime')}</span>
                    <span style={{ fontSize:12,color:'var(--text-secondary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{String(r.phoneNumber || '—')}</span>
                    <span style={{ fontSize:12,fontWeight:800,color:'var(--text)' }}>₦{Number((r.totalAmount as number) || (r.amount as number) || tx.amount || 0).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                    <span style={{ fontSize:11,fontWeight:800,color:status === 'success' ? GREEN : status === 'failed' ? RED : '#FF9F0A' }}>{status}</span>
                    <button onClick={()=>{ if (tx.receipt) setReceipt({ ...(tx.receipt as Record<string, unknown>), type: tx.type }); }} style={{ padding:'6px 8px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:11,fontWeight:700,color:'var(--text)' }}>View Receipt</button>
                  </div>
                );
              })}
            </div>
          ) : txFilter === 'bank-transfer' ? (
            <div style={{ background:'var(--card)',borderRadius:16,overflow:'hidden',border:'1px solid var(--border)' }}>
              <div style={{ display:'grid',gridTemplateColumns:'1.1fr 1fr 1fr 1fr 0.9fr 0.7fr 0.8fr',gap:8,padding:'10px 12px',borderBottom:'1px solid var(--border)',fontSize:11,fontWeight:800,color:'var(--text-secondary)',textTransform:'uppercase' }}>
                <span>Date & Time</span>
                <span>Bank</span>
                <span>Account Number</span>
                <span>Recipient</span>
                <span>Total</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {filteredTransactions.map((tx) => {
                const r = (tx.receipt || {}) as Record<string, unknown>;
                const status = String(tx.status || 'pending');
                return (
                  <div key={tx.id} style={{ display:'grid',gridTemplateColumns:'1.1fr 1fr 1fr 1fr 0.9fr 0.7fr 0.8fr',gap:8,padding:'11px 12px',borderBottom:'1px solid var(--border)',alignItems:'center' }}>
                    <span style={{ fontSize:12,color:'var(--text-secondary)' }}>{new Date(tx.createdAt).toLocaleString('en-NG',{dateStyle:'short',timeStyle:'short'})}</span>
                    <span style={{ fontSize:12,fontWeight:700,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{String(r.bankName || 'Bank Transfer')}</span>
                    <span style={{ fontSize:12,color:'var(--text-secondary)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{String(r.accountNumber || '—')}</span>
                    <span style={{ fontSize:12,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{String(r.recipientName || '—')}</span>
                    <span style={{ fontSize:12,fontWeight:800,color:'var(--text)' }}>₦{Number((r.totalDeducted as number) || tx.amount || 0).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                    <span style={{ fontSize:11,fontWeight:800,color:status === 'success' ? GREEN : status === 'failed' ? RED : '#FF9F0A' }}>{status}</span>
                    <button onClick={()=>{ if (tx.receipt) setReceipt({ ...(tx.receipt as Record<string, unknown>), type: tx.type }); }} style={{ padding:'6px 8px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:11,fontWeight:700,color:'var(--text)' }}>View Receipt</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display:'grid',gap:12 }}>
              {filteredTransactions.map((tx, idx) => {
                const isDeposit = tx.type === 'deposit';
                const isCashbackTx = tx.type === 'cashback' || tx.type === 'cashback_redemption';
                const isTransferIn = tx.type === 'transfer_in';
                const isTransferOut = tx.type === 'transfer_out';
                const isReferralCredit = tx.type === 'referral_reward' || tx.type === 'admin_referral_credit';
                const isFailed = tx.status === 'failed';
                const isCredit = isDeposit || isCashbackTx || isTransferIn || isReferralCredit;
                const signedColor = isFailed ? RED : isCredit ? GREEN : '#D9263A';
                const amountSign = isCredit ? '+' : '−';
                const amountValue = Number(tx.amount).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2});
                const txLabel = isTransferIn
                  ? 'Transfer In'
                  : isTransferOut
                    ? 'Transfer Out'
                    : isReferralCredit
                      ? 'Referral Reward'
                      : tx.type === 'withdrawal_request'
                        ? 'Withdrawal Request'
                        : isCashbackTx
                          ? 'Cashback'
                          : isDeposit
                            ? 'Deposit'
                            : 'Purchase';

                return (
                  <button className="ledger-card stagger-card haptic-pulse" key={tx.id} onClick={()=>{ if(tx.receipt) { setReceipt({ ...(tx.receipt as Record<string,unknown>), type: tx.type }); } }}
                    style={{ width:'100%',background:'var(--card)',borderRadius:18,padding:'14px 14px',display:'flex',alignItems:'center',gap:12,border:'1px solid var(--border)',boxShadow:dark ? '0 10px 22px rgba(0,0,0,.26)' : '0 10px 22px rgba(12,28,54,.08)',cursor:'pointer',animationDelay:`${Math.min(idx, 9) * 34}ms` }}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=dark ? '0 14px 28px rgba(0,0,0,.32)' : '0 16px 28px rgba(12,28,54,.14)';}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=dark ? '0 10px 22px rgba(0,0,0,.26)' : '0 10px 22px rgba(12,28,54,.08)';}}
                    onMouseDown={e=>{e.currentTarget.style.transform='scale(.985)'}}
                    onMouseUp={e=>{e.currentTarget.style.transform='translateY(-2px)'}}
                    onTouchStart={e=>{e.currentTarget.style.transform='scale(.985)';}}
                    onTouchEnd={e=>{e.currentTarget.style.transform='translateY(0)';}}>

                    <div style={{ width:42,height:42,borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',background:isCredit ? 'linear-gradient(145deg,rgba(48,209,88,.22),rgba(48,209,88,.1))' : 'linear-gradient(145deg,rgba(255,59,48,.2),rgba(255,59,48,.09))',border:`1px solid ${isCredit ? 'rgba(48,209,88,.4)' : 'rgba(255,59,48,.35)'}`,fontWeight:900,fontSize:20,color:isCredit ? GREEN : RED,flexShrink:0 }}>
                      {isCredit ? '+' : '−'}
                    </div>

                    <div style={{ flex:1,minWidth:0,textAlign:'left' }}>
                      <p style={{ fontWeight:700,fontSize:14,color:'var(--text)',margin:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{tx.description || txLabel}</p>
                      <p style={{ fontSize:12,color:'var(--text-secondary)',margin:'4px 0 0' }}>{new Date(tx.createdAt).toLocaleString('en-NG',{dateStyle:'medium',timeStyle:'short'})}</p>
                    </div>

                    <div style={{ textAlign:'right',flexShrink:0 }}>
                      <p style={{ fontWeight:900,fontSize:15,color:signedColor,margin:0,letterSpacing:'-0.01em' }}>{amountSign}₦{amountValue}</p>
                      <span style={{ display:'inline-flex',alignItems:'center',gap:5,marginTop:4,padding:'3px 8px',borderRadius:999,fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.04em',color:isFailed ? RED : GREEN,background:isFailed ? 'rgba(255,59,48,.13)' : 'rgba(48,209,88,.12)' }}>
                        <span style={{ width:5,height:5,borderRadius:'50%',background:isFailed ? RED : GREEN }} />
                        {isFailed ? 'Failed' : 'Completed'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {BottomNav({ active: 'transactions' })}
    </>
  );

  /* EARN */
  if (screen === 'earn') return (
    <>
      <GlobalStyle dark={dark} />
      {showPin && <PinKeyboard title="Confirm withdrawal PIN" subtitle="We use your PIN to authorize this referral withdrawal" onComplete={handlePinComplete} onClose={()=>setShowPin(false)} pinAction={pinAction} />}
      {toast && <div className="fade-in" style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:15,fontWeight:600,zIndex:500,whiteSpace:'nowrap' }}>{toast}</div>}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
      <div style={{ height:'100dvh',background:dark ? 'linear-gradient(180deg,#040810 0%,#0A1221 48%,#08101D 100%)' : 'linear-gradient(180deg,#F3F7FF 0%,#EEF3FB 52%,#F7F9FD 100%)',overflowY:'auto',paddingBottom:100 }}>
        <div style={{ padding:'52px 16px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12 }}>
          <button onClick={()=>setScreen('home')} style={{ color:BLUE,fontSize:16,fontWeight:700 }}>← Back</button>
          <button onClick={()=>{ loadEarnData(); refreshUser(); }} style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'10px 14px',color:'var(--text)',fontSize:13,fontWeight:700 }}>Refresh</button>
        </div>

        <div style={{ margin:'0 16px',background:'linear-gradient(140deg,#051A46 0%,#0D3E8A 55%,#0F6FEA 100%)',borderRadius:24,padding:'22px 20px',border:'1px solid rgba(255,255,255,.12)',boxShadow:'0 18px 46px rgba(4,60,170,.28)',color:'#fff' }}>
          <p style={{ fontSize:11,fontWeight:800,letterSpacing:'0.08em',opacity:.74,textTransform:'uppercase' }}>Earn Center</p>
          <h2 style={{ fontSize:28,fontWeight:900,marginTop:10,letterSpacing:'-0.04em' }}>₦{(earnSummary?.referralBalance ?? referralBalance).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</h2>
          <p style={{ fontSize:13,opacity:.8,marginTop:6 }}>Available referral balance</p>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:18 }}>
            <div style={{ background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.16)',borderRadius:16,padding:'12px 14px' }}>
              <p style={{ fontSize:11,fontWeight:700,opacity:.7,letterSpacing:'0.06em',textTransform:'uppercase' }}>Referral ID</p>
              <p style={{ fontSize:18,fontWeight:800,marginTop:8,letterSpacing:'0.04em' }}>{earnSummary?.referralId || user?.referralId || 'Loading...'}</p>
              <button onClick={()=>{ navigator.clipboard.writeText(earnSummary?.referralId || user?.referralId || ''); showToast('Referral ID copied'); }} style={{ marginTop:10,background:'rgba(255,255,255,.14)',border:'1px solid rgba(255,255,255,.2)',borderRadius:10,padding:'8px 12px',color:'#fff',fontSize:12,fontWeight:700 }}>Copy ID</button>
            </div>
            <div style={{ background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.16)',borderRadius:16,padding:'12px 14px' }}>
              <p style={{ fontSize:11,fontWeight:700,opacity:.7,letterSpacing:'0.06em',textTransform:'uppercase' }}>Reward Rule</p>
              <p style={{ fontSize:17,fontWeight:800,marginTop:8 }}>₦{Number(earnSummary?.rewardAmount || 0).toLocaleString('en-NG')}</p>
              <p style={{ fontSize:12,opacity:.78,marginTop:6 }}>When any referred user reaches {Number(earnSummary?.targetGb || 50).toLocaleString('en-NG')}GB total purchases.</p>
            </div>
          </div>
        </div>

        <div style={{ margin:'18px 16px 0',display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:10 }}>
          {[
            { label:'Referrals', value: earnSummary?.totalReferrals || 0 },
            { label:'Qualified', value: earnSummary?.qualifiedReferrals || 0 },
            { label:'Your GB', value: `${Number(earnSummary?.totalGbPurchased || user?.totalGbPurchased || 0).toLocaleString('en-NG',{maximumFractionDigits:2})}GB` },
          ].map((item) => (
            <div key={item.label} style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:'14px 12px',boxShadow:dark ? '0 10px 24px rgba(0,0,0,.2)' : '0 10px 24px rgba(12,28,54,.06)' }}>
              <p style={{ fontSize:11,fontWeight:800,color:'var(--text-secondary)',letterSpacing:'0.08em',textTransform:'uppercase' }}>{item.label}</p>
              <p style={{ fontSize:22,fontWeight:900,color:'var(--text)',marginTop:8 }}>{item.value}</p>
            </div>
          ))}
        </div>

        <div style={{ margin:'18px 16px 0',display:'grid',gap:16 }}>
          <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:'18px 16px',boxShadow:dark ? '0 12px 28px rgba(0,0,0,.2)' : '0 12px 28px rgba(12,28,54,.06)' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:14 }}>
              <div>
                <h3 style={{ fontSize:18,fontWeight:800,color:'var(--text)' }}>Invite People</h3>
                <p style={{ color:'var(--text-secondary)',fontSize:13,marginTop:4 }}>Share your referral ID and track who has crossed the reward milestone.</p>
              </div>
              <button onClick={async()=>{
                const message = earnSummary?.inviteMessage || `Join SaukiMart with my referral ID ${earnSummary?.referralId || user?.referralId || ''}`;
                if (navigator.share) {
                  try {
                    await navigator.share({ title:'SaukiMart Referral', text: message });
                    return;
                  } catch {
                    // fall through to clipboard
                  }
                }
                await navigator.clipboard.writeText(message);
                showToast('Invite message copied');
              }} style={{ background:'rgba(0,113,227,.1)',border:'1px solid rgba(0,113,227,.2)',borderRadius:12,padding:'10px 14px',color:BLUE,fontSize:13,fontWeight:700 }}>Share Invite</button>
            </div>
            <div style={{ display:'grid',gap:10 }}>
              {referralUsers.length === 0 ? (
                <div style={{ border:'1px dashed var(--border)',borderRadius:16,padding:'18px 16px',textAlign:'center' }}>
                  <p style={{ color:'var(--text)',fontWeight:700,fontSize:14 }}>No referred users yet</p>
                  <p style={{ color:'var(--text-secondary)',fontSize:13,marginTop:6,lineHeight:1.55 }}>Once someone signs up with your referral ID and buys data, their progress to {Number(earnSummary?.targetGb || 50)}GB will appear here.</p>
                </div>
              ) : referralUsers.map((item) => {
                const progressPercent = Math.min((item.totalGbPurchased / Number(earnSummary?.targetGb || 50)) * 100, 100);
                return (
                  <div key={item.id} style={{ border:'1px solid var(--border)',borderRadius:16,padding:'14px 14px',background:'var(--bg-secondary)' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',gap:10,alignItems:'flex-start' }}>
                      <div>
                        <p style={{ fontSize:15,fontWeight:800,color:'var(--text)' }}>{item.firstName} {item.lastName}</p>
                        <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:4 }}>{item.phone}</p>
                      </div>
                      <span style={{ background:item.rewardUnlocked ? 'rgba(48,209,88,.12)' : 'rgba(255,159,10,.12)',color:item.rewardUnlocked ? GREEN : ORANGE,padding:'6px 10px',borderRadius:999,fontSize:11,fontWeight:800 }}>{item.rewardUnlocked ? 'Reward unlocked' : 'In progress'}</span>
                    </div>
                    <div style={{ marginTop:12 }}>
                      <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text-secondary)',marginBottom:6 }}>
                        <span>{item.totalGbPurchased.toLocaleString('en-NG',{maximumFractionDigits:2})}GB purchased</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div style={{ height:10,borderRadius:999,background:dark?'rgba(255,255,255,.08)':'rgba(12,28,54,.08)',overflow:'hidden' }}>
                        <div style={{ width:`${progressPercent}%`,height:'100%',background:item.rewardUnlocked ? 'linear-gradient(135deg,#30D158,#5AC8FA)' : 'linear-gradient(135deg,#FF9F0A,#FFD38D)' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:'18px 16px',boxShadow:dark ? '0 12px 28px rgba(0,0,0,.2)' : '0 12px 28px rgba(12,28,54,.06)' }}>
            <h3 style={{ fontSize:18,fontWeight:800,color:'var(--text)' }}>Withdraw Referral Balance</h3>
            <p style={{ color:'var(--text-secondary)',fontSize:13,marginTop:4,marginBottom:14 }}>Withdrawals are verified instantly and paid after admin approval.</p>
            <div style={{ display:'grid',gap:12 }}>
              <div>
                <label style={{ display:'block',fontSize:12,fontWeight:800,color:'var(--text-secondary)',marginBottom:8,letterSpacing:'0.06em',textTransform:'uppercase' }}>Amount</label>
                <input value={withdrawForm.amount} onChange={e=>setWithdrawForm(prev=>({ ...prev, amount:e.target.value.replace(/[^0-9.]/g,'') }))} placeholder="1000" inputMode="decimal" style={{ width:'100%',padding:'13px 14px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text)',fontSize:16,fontWeight:700 }} />
              </div>
              <div>
                <label style={{ display:'block',fontSize:12,fontWeight:800,color:'var(--text-secondary)',marginBottom:8,letterSpacing:'0.06em',textTransform:'uppercase' }}>Bank</label>
                <div style={{ position:'relative' }}>
                  <input
                    value={bankSearch}
                    onChange={e => setBankSearch(e.target.value)}
                    placeholder={withdrawForm.bankName || '🔍 Search bank...'}
                    style={{ width:'100%',padding:'13px 14px',borderRadius:withdrawForm.bankCode && !bankSearch ? 12 : '12px 12px 0 0',border:'1px solid var(--border)',borderBottom: bankSearch ? '1px solid rgba(0,113,227,.25)' : '1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text)',fontSize:15,fontWeight:700,boxSizing:'border-box' }}
                  />
                  {bankSearch && (
                    <div style={{ position:'absolute',top:'100%',left:0,right:0,background:'var(--card)',border:'1px solid var(--border)',borderTop:'none',borderRadius:'0 0 12px 12px',maxHeight:220,overflowY:'auto',zIndex:50,boxShadow:'0 8px 24px rgba(0,0,0,.12)' }}>
                      {banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase())).slice(0,20).map(b => (
                        <div key={b.code} onClick={() => {
                          setWithdrawForm(prev => ({ ...prev, bankCode: b.code, bankName: b.name, accountName: '' }));
                          setBankSearch('');
                        }} style={{ padding:'11px 14px',fontSize:14,fontWeight:600,color:'var(--text)',cursor:'pointer',borderBottom:'1px solid var(--border)' }}
                          onMouseEnter={e => (e.currentTarget.style.background='rgba(0,113,227,.08)')}
                          onMouseLeave={e => (e.currentTarget.style.background='')}
                        >{b.name}</div>
                      ))}
                      {banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase())).length === 0 && (
                        <div style={{ padding:'14px',fontSize:13,color:'var(--text-secondary)',textAlign:'center' }}>No bank found</div>
                      )}
                    </div>
                  )}
                </div>
                {withdrawForm.bankName && !bankSearch && (
                  <p style={{ fontSize:12,color:'#30D158',fontWeight:700,marginTop:5 }}>✓ {withdrawForm.bankName}</p>
                )}
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr auto',gap:10,alignItems:'end' }}>
                <div>
                  <label style={{ display:'block',fontSize:12,fontWeight:800,color:'var(--text-secondary)',marginBottom:8,letterSpacing:'0.06em',textTransform:'uppercase' }}>Account Number</label>
                  <input value={withdrawForm.accountNumber} onChange={e=>{
                    const v = e.target.value.replace(/\D/g,'').slice(0,10);
                    setWithdrawForm(prev=>({ ...prev, accountNumber:v, accountName:'' }));
                    if (v.length === 10 && withdrawForm.bankCode) {
                      setTimeout(() => {
                        const btn = document.getElementById('resolve-btn') as HTMLButtonElement | null;
                        btn?.click();
                      }, 80);
                    }
                  }} placeholder="0123456789" inputMode="numeric" style={{ width:'100%',padding:'13px 14px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',color:'var(--text)',fontSize:16,fontWeight:700,letterSpacing:'0.08em' }} />
                </div>
                <button id="resolve-btn" onClick={resolveWithdrawalAccount} disabled={withdrawResolving || !withdrawForm.bankCode || withdrawForm.accountNumber.length !== 10} style={{ height:48,padding:'0 16px',borderRadius:12,border:'1px solid rgba(0,113,227,.18)',background:withdrawResolving ? 'rgba(0,113,227,.08)' : 'rgba(0,113,227,.12)',color:BLUE,fontSize:13,fontWeight:800,cursor:withdrawResolving ? 'wait' : 'pointer' }}>{withdrawResolving ? 'Checking...' : 'Resolve'}</button>
              </div>
              <div>
                <label style={{ display:'block',fontSize:12,fontWeight:800,color:'var(--text-secondary)',marginBottom:8,letterSpacing:'0.06em',textTransform:'uppercase' }}>Account Name</label>
                <div style={{ width:'100%',padding:'13px 14px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',color:withdrawForm.accountName ? 'var(--text)' : 'var(--text-secondary)',fontSize:15,fontWeight:700 }}>{withdrawForm.accountName || 'Resolve account to continue'}</div>
              </div>
              {withdrawError && <p style={{ color:RED,fontSize:13,fontWeight:600 }}>{withdrawError}</p>}
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',gap:12 }}>
                <p style={{ color:'var(--text-secondary)',fontSize:12,lineHeight:1.55 }}>Available: ₦{referralBalance.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
                <button onClick={beginWithdrawalRequest} disabled={withdrawLoading} style={{ background:'linear-gradient(135deg,#0047CC,#0071E3)',border:'none',borderRadius:12,padding:'12px 16px',color:'#fff',fontSize:14,fontWeight:800,cursor:withdrawLoading ? 'wait' : 'pointer',opacity:withdrawLoading ? .7 : 1 }}>{withdrawLoading ? 'Working...' : 'Withdraw Now'}</button>
              </div>
            </div>
          </div>

          <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:'18px 16px',boxShadow:dark ? '0 12px 28px rgba(0,0,0,.2)' : '0 12px 28px rgba(12,28,54,.06)' }}>
            <h3 style={{ fontSize:18,fontWeight:800,color:'var(--text)',marginBottom:12 }}>Withdrawal History</h3>
            {withdrawals.length === 0 ? (
              <div style={{ border:'1px dashed var(--border)',borderRadius:16,padding:'18px 16px',textAlign:'center' }}>
                <p style={{ color:'var(--text)',fontWeight:700,fontSize:14 }}>No withdrawals yet</p>
                <p style={{ color:'var(--text-secondary)',fontSize:13,marginTop:6 }}>Your submitted referral withdrawals will appear here.</p>
              </div>
            ) : (
              <div style={{ display:'grid',gap:10 }}>
                {withdrawals.map((item) => (
                  <div key={item.id} style={{ border:'1px solid var(--border)',borderRadius:16,padding:'14px',background:'var(--bg-secondary)' }}>
                    <div style={{ display:'flex',justifyContent:'space-between',gap:10,alignItems:'flex-start' }}>
                      <div>
                        <p style={{ fontSize:15,fontWeight:800,color:'var(--text)' }}>₦{item.amount.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
                        <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:4 }}>{item.bankName} • {item.accountNumber}</p>
                        <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:4 }}>{item.accountName}</p>
                      </div>
                      <span style={{ background:item.status === 'paid' ? 'rgba(48,209,88,.12)' : item.status === 'rejected' ? 'rgba(255,59,48,.12)' : 'rgba(255,159,10,.12)',color:item.status === 'paid' ? GREEN : item.status === 'rejected' ? RED : ORANGE,padding:'6px 10px',borderRadius:999,fontSize:11,fontWeight:800,textTransform:'uppercase' }}>{item.status}</span>
                    </div>
                    <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:10 }}>Requested {new Date(item.createdAt).toLocaleString('en-NG',{dateStyle:'medium',timeStyle:'short'})}</p>
                    {item.adminNote && <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:6 }}>Admin note: {item.adminNote}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {BottomNav({ active: 'earn' })}
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
      {BottomNav({ active: 'deposits' })}
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
      <div style={{ height:'100dvh',background:dark ? 'linear-gradient(180deg,#040810 0%,#0A1221 48%,#08101D 100%)' : 'linear-gradient(180deg,#F3F7FF 0%,#EEF3FB 52%,#F7F9FD 100%)',overflowY:'auto',paddingBottom:100 }}>
        <div style={{ padding:'58px 16px 24px' }}>
          <div style={{ background:'linear-gradient(140deg,#011A4D 0%,#003EAD 55%,#0068D8 100%)',borderRadius:24,padding:'22px 18px',border:'1px solid rgba(255,255,255,.14)',boxShadow:'0 16px 42px rgba(0,66,173,.35)',position:'relative',overflow:'hidden',color:'#fff',marginBottom:18 }}>
            <div style={{ position:'absolute',right:-65,top:-68,width:210,height:210,borderRadius:'50%',background:'rgba(255,255,255,.08)',pointerEvents:'none' }} />
            <div style={{ display:'flex',alignItems:'center',gap:16,position:'relative',zIndex:1 }}>
              <div style={{ width:74,height:74,borderRadius:20,background:'rgba(255,255,255,.14)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900,fontSize:22,border:'1px solid rgba(255,255,255,.18)' }}>{getInitials(user)}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <p style={{ fontSize:11,fontWeight:700,opacity:.76,letterSpacing:'0.08em',textTransform:'uppercase' }}>Executive Profile</p>
                <p style={{ fontSize:24,fontWeight:900,letterSpacing:'-0.03em',marginTop:6,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{user.firstName} {user.lastName}</p>
                <p style={{ fontSize:13,opacity:.84,marginTop:6 }}>{user.phone}</p>
                <p style={{ fontSize:12,opacity:.74,marginTop:4 }}>Joined {new Date(user.createdAt).toLocaleDateString('en-NG',{month:'short',year:'numeric'})}</p>
              </div>
            </div>
          </div>

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:18 }}>
            <div style={{ background:'var(--card)',borderRadius:18,padding:'14px 16px',border:'1px solid var(--border)',boxShadow:dark ? '0 10px 24px rgba(0,0,0,.2)' : '0 10px 24px rgba(12,28,54,.06)' }}>
              <p style={{ fontSize:11,fontWeight:800,color:'var(--text-secondary)',letterSpacing:'0.08em',textTransform:'uppercase' }}>Theme</p>
              <p style={{ fontSize:16,fontWeight:800,color:'var(--text)',marginTop:8 }}>{dark ? 'Dark Appearance' : 'Light Appearance'}</p>
            </div>
            <div style={{ background:'var(--card)',borderRadius:18,padding:'14px 16px',border:'1px solid var(--border)',boxShadow:dark ? '0 10px 24px rgba(0,0,0,.2)' : '0 10px 24px rgba(12,28,54,.06)' }}>
              <p style={{ fontSize:11,fontWeight:800,color:'var(--text-secondary)',letterSpacing:'0.08em',textTransform:'uppercase' }}>Security</p>
              <p style={{ fontSize:16,fontWeight:800,color:'var(--text)',marginTop:8 }}>PIN Protected</p>
            </div>
          </div>

          <div style={{ padding:'0 0' }}>
          <SettingsGroup title="Display">
            <SettingsRow icon={Icons.bell(BLUE, 20)} label="Theme" right={
              <button onClick={()=>updatePref('theme', dark?'light':'dark')}
                style={{ background:dark?BLUE:'var(--bg-secondary)',borderRadius:16,padding:'7px 14px',color:dark?'#fff':'var(--text)',fontSize:13,fontWeight:700,border:'1px solid var(--border)' }}>
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

          <SettingsGroup title="Developer">
            <SettingsRow
              icon={Icons.chartBar(BLUE, 20)}
              label={user.isDeveloper ? 'Developer Dashboard' : 'Upgrade to Developer'}
              right={
                <span style={{ background:'rgba(0,113,227,.1)',borderRadius:999,padding:'4px 10px',color:BLUE,fontSize:11,fontWeight:700 }}>
                  {user.isDeveloper ? 'Active' : `${Number(user.developerDiscountPercent || 8)}% off API`}
                </span>
              }
              onPress={()=>{
                if (user.isDeveloper) {
                  setScreen('developer-dashboard');
                } else {
                  setScreen('developer-terms');
                }
              }}
            />
          </SettingsGroup>

          <SettingsGroup title="Rewards">
            <SettingsRow
              icon={Icons.arrowDown(TEAL, 20)}
              label="Earn & Withdraw"
              right={<span style={{ background:'rgba(90,200,250,.12)',borderRadius:999,padding:'4px 10px',color:TEAL,fontSize:11,fontWeight:700 }}>₦{referralBalance.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>}
              onPress={()=>setScreen('earn')}
            />
          </SettingsGroup>

          <SettingsGroup title="Support">
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
      </div>
      {BottomNav({ active: 'profile' })}
    </>
  );

  /* CHANGE PIN */
  if (screen === 'change-pin') return (
    <>
      <GlobalStyle dark={dark} />
      {showPin && <PinKeyboard title="Enter current PIN" onComplete={(pin)=>{ setShowPin(false); handleChangePin(pin); }} onClose={()=>setShowPin(false)} />}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
      <div style={{ height:'100dvh',background:dark ? 'linear-gradient(180deg,#040810 0%,#0A1221 48%,#08101D 100%)' : 'linear-gradient(180deg,#F3F7FF 0%,#EEF3FB 52%,#F7F9FD 100%)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'58px 20px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid var(--border)' }}>
          <button onClick={()=>setScreen('profile')} style={{ color:BLUE,fontSize:16,fontWeight:700 }}>← Back</button>
          <div>
            <h2 style={{ fontSize:22,fontWeight:900,color:'var(--text)',letterSpacing:-0.4 }}>Change PIN</h2>
            <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:4 }}>Strengthen access to your wallet and transactions</p>
          </div>
        </div>
        <div style={{ padding:'24px 20px',flex:1,display:'flex',flexDirection:'column',justifyContent:'center' }}>
          <div style={{ background:'var(--card)',borderRadius:22,padding:'20px',border:'1px solid var(--border)',boxShadow:dark ? '0 14px 34px rgba(0,0,0,.2)' : '0 14px 34px rgba(12,28,54,.08)' }}>
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:12,fontWeight:800,color:'var(--text-secondary)',marginBottom:8,display:'block',letterSpacing:'0.08em',textTransform:'uppercase' }}>New PIN</label>
            <input type="password" inputMode="numeric" maxLength={4} value={newPin} onChange={e=>setNewPin(e.target.value.replace(/\D/g,'').slice(0,4))}
              placeholder="••••" style={{ width:'100%',padding:'15px 16px',borderRadius:14,background:'var(--bg-secondary)',border:'1px solid var(--border)',color:'var(--text)',fontSize:20,letterSpacing:6,textAlign:'center' }} />
          </div>
          <div style={{ marginBottom:32 }}>
            <label style={{ fontSize:12,fontWeight:800,color:'var(--text-secondary)',marginBottom:8,display:'block',letterSpacing:'0.08em',textTransform:'uppercase' }}>Confirm PIN</label>
            <input type="password" inputMode="numeric" maxLength={4} value={confirmNewPin} onChange={e=>setConfirmNewPin(e.target.value.replace(/\D/g,'').slice(0,4))}
              placeholder="••••" style={{ width:'100%',padding:'15px 16px',borderRadius:14,background:'var(--bg-secondary)',border:'1px solid var(--border)',color:'var(--text)',fontSize:20,letterSpacing:6,textAlign:'center' }} />
          </div>
          <button onClick={()=>{ if(newPin.length===4&&newPin===confirmNewPin){ setShowPin(true); } else showError('PINs must match'); }}
            disabled={newPin.length!==4||newPin!==confirmNewPin}
            className="tactile-btn"
            style={{ width:'100%',padding:'16px',borderRadius:14,background:newPin.length===4&&newPin===confirmNewPin?'linear-gradient(135deg,#0047CC,#0071E3)':'var(--bg-secondary)',color:newPin.length===4&&newPin===confirmNewPin?'#fff':'var(--text-secondary)',fontSize:16,fontWeight:800,boxShadow:newPin.length===4&&newPin===confirmNewPin?'0 12px 26px rgba(0,113,227,.28)':'none' }}>
            Update PIN
          </button>
          </div>
        </div>
      </div>
    </>
  );


  /* BANK TRANSFER */
  if (screen === 'bank-transfer') {
    const bankTransferAmountNum = Number(bankTransferAmount || 0);
    const bankTransferTotal = bankTransferAmountNum + BANK_TRANSFER_SERVICE_CHARGE;
    const bankTransferFilteredBanks = NIGERIAN_BANKS.filter((b) => b.name.toLowerCase().includes(bankTransferBankSearch.toLowerCase().trim()));

    return (
      <>
        <GlobalStyle dark={dark} />
        {showPin && <PinKeyboard title="Confirm transfer PIN" subtitle="Authorize bank transfer with your 4-digit PIN" onComplete={handlePinComplete} onClose={()=>setShowPin(false)} pinAction={pinAction} />}
        {receipt && <Receipt data={receipt} onDownload={()=>{}} onClose={()=>setReceipt(null)} dark={dark} />}

        {bankTransferSummaryOpen && (
          <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.52)',zIndex:420,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
            <div style={{ width:'100%',maxWidth:430,background:'var(--card)',border:'1px solid var(--border)',borderRadius:18,padding:16 }}>
              <h3 style={{ fontSize:18,fontWeight:900,color:'var(--text)',marginBottom:10 }}>Confirm Bank Transfer</h3>
              <p style={{ fontSize:12,color:'var(--text-secondary)',margin:'0 0 12px' }}>Double-check details before confirming.</p>
              <div style={{ display:'grid',gap:8 }}>
                <p style={{ fontSize:13,color:'var(--text-secondary)',margin:0 }}><b>Bank:</b> {bankTransferBankName}</p>
                <p style={{ fontSize:13,color:'var(--text-secondary)',margin:0 }}><b>Account Number:</b> {bankTransferAccountNumber}</p>
                <p style={{ fontSize:13,color:'#30D158',margin:0,fontWeight:900 }}><b>Recipient:</b> {bankTransferAccountName}</p>
                <p style={{ fontSize:13,color:'var(--text-secondary)',margin:0 }}><b>Amount:</b> ₦{bankTransferAmountNum.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
                <p style={{ fontSize:13,color:'#FF9F0A',margin:0 }}><b>Service Charge:</b> ₦{BANK_TRANSFER_SERVICE_CHARGE.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
                <p style={{ fontSize:14,fontWeight:900,color:'var(--text)',margin:'4px 0 0' }}><b>Total Deduction:</b> ₦{bankTransferTotal.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
                <p style={{ fontSize:12,color:'var(--text-secondary)',margin:'4px 0 0' }}><b>Narration:</b> {bankTransferNarration.trim() || '—'}</p>
              </div>
              <div style={{ display:'flex',gap:8,marginTop:16 }}>
                <button onClick={()=>setBankTransferSummaryOpen(false)} style={{ flex:1,padding:'12px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontWeight:700,color:'var(--text)' }}>Cancel</button>
                <button onClick={()=>{ setBankTransferSummaryOpen(false); setPinAction('bank-transfer'); setShowPin(true); }} style={{ flex:1,padding:'12px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#C89B3C,#F3D27A)',fontWeight:900,color:'#1C1C1E' }}>Confirm Transfer</button>
              </div>
            </div>
          </div>
        )}

        {bankTransferProcessing && (
          <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:410,display:'grid',placeItems:'center' }}>
            <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:'14px 16px',fontSize:14,fontWeight:700,color:'var(--text)' }}>Processing your transfer...</div>
          </div>
        )}

        <div style={{ height:'100dvh',overflowY:'auto',WebkitOverflowScrolling:'touch',background:dark ? 'linear-gradient(180deg,#040810 0%,#0A1221 48%,#08101D 100%)' : 'linear-gradient(180deg,#F3F7FF 0%,#EEF3FB 52%,#F7F9FD 100%)',paddingBottom:116 }}>
          <div style={{ padding:'52px 16px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12 }}>
            <button onClick={()=>setScreen('home')} style={{ color:BLUE,fontSize:16,fontWeight:700 }}>← Back</button>
          </div>

          <div style={{ margin:'0 16px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:16 }}>
            <h2 style={{ fontSize:20,fontWeight:900,color:'var(--text)',marginBottom:6 }}>Bank Transfer</h2>
            <p style={{ fontSize:12,color:'var(--text-secondary)',marginBottom:14 }}>Send from wallet to any Nigerian bank account.</p>

            <label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:6 }}>Search Bank</label>
            <input value={bankTransferBankSearch} onChange={(e)=>setBankTransferBankSearch(e.target.value)} placeholder="Search bank name" style={{ width:'100%',padding:'12px 13px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:14,color:'var(--text)',marginBottom:10 }} />

            <label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:6 }}>Bank</label>
            <select
              value={bankTransferBankCode}
              onChange={(e)=>{
                const nextCode = e.target.value;
                const found = NIGERIAN_BANKS.find((b)=>b.code === nextCode);
                setBankTransferBankCode(nextCode);
                setBankTransferBankName(found?.name || '');
                setBankTransferVerifyState('idle');
                setBankTransferError('');
                setBankTransferAccountName('');
              }}
              style={{ width:'100%',padding:'12px 13px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:14,color:'var(--text)',marginBottom:14 }}
            >
              <option value="">Select bank</option>
              {bankTransferFilteredBanks.map((b)=>(
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>

            <label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:6 }}>Account Number</label>
            <div style={{ display:'flex',gap:8,marginBottom:10 }}>
              <input value={bankTransferAccountNumber} onChange={(e)=>{ setBankTransferAccountNumber(e.target.value.replace(/\D/g,'').slice(0,10)); setBankTransferVerifyState('idle'); setBankTransferError(''); setBankTransferAccountName(''); }} placeholder="10-digit account number" style={{ flex:1,padding:'12px 13px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:14,color:'var(--text)' }} />
              {bankTransferAccountNumber.length === 10 && (
                <button onClick={verifyBankTransferAccount} disabled={bankTransferVerifyState === 'verifying'} style={{ padding:'0 12px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#0047CC,#0071E3)',fontSize:12,fontWeight:800,color:'#fff' }}>{bankTransferVerifyState === 'verifying' ? 'Verifying…' : 'Verify Account'}</button>
              )}
            </div>

            {bankTransferVerifyState === 'verified' && bankTransferAccountName && (
              <p style={{ fontSize:13,color:'#30D158',margin:'0 0 10px',padding:'8px 10px',borderRadius:10,background:'rgba(48,209,88,.12)',border:'1px solid rgba(48,209,88,.25)' }}>✓ {bankTransferAccountName}</p>
            )}
            {bankTransferVerifyState === 'failed' && (
              <p style={{ fontSize:12,color:RED,margin:'0 0 10px',padding:'8px 10px',borderRadius:10,background:'rgba(255,59,48,.12)',border:'1px solid rgba(255,59,48,.2)' }}>✗ {bankTransferError || 'Invalid account number'}</p>
            )}

            <label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:6 }}>Amount</label>
            <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:8 }}>
              {[1000,2000,5000,10000,20000].map((v) => (
                <button key={v} onClick={()=>setBankTransferAmount(String(v))} disabled={bankTransferVerifyState !== 'verified'} style={{ padding:'7px 10px',borderRadius:999,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:12,fontWeight:700,color:'var(--text)',opacity:bankTransferVerifyState === 'verified' ? 1 : .45 }}>₦{v.toLocaleString('en-NG')}</button>
              ))}
            </div>
            <input value={Number(bankTransferAmount || 0) ? Number(bankTransferAmount || 0).toLocaleString('en-NG') : ''} onChange={(e)=>setBankTransferAmount(e.target.value.replace(/\D/g,''))} disabled={bankTransferVerifyState !== 'verified'} placeholder="Enter amount" style={{ width:'100%',padding:'12px 13px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:14,color:'var(--text)',marginBottom:8,opacity:bankTransferVerifyState === 'verified' ? 1 : .55 }} />

            <p style={{ fontSize:12,color:'var(--text-secondary)',margin:'0 0 8px' }}>Available balance: <b style={{ color:'var(--text)' }}>₦{(user?.walletBalance || 0).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</b></p>
            <div style={{ border:'1px solid var(--border)',borderRadius:12,padding:'10px 12px',marginBottom:10,background:'var(--bg-secondary)' }}>
              <p style={{ margin:0,fontSize:12,color:'var(--text-secondary)' }}>Amount: <b style={{ color:'var(--text)' }}>₦{bankTransferAmountNum.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</b></p>
              <p style={{ margin:'5px 0 0',fontSize:12,color:'#FF9F0A' }}>Service Charge: <b>₦{BANK_TRANSFER_SERVICE_CHARGE.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</b></p>
              <p style={{ margin:'5px 0 0',fontSize:13,color:'var(--text)',fontWeight:900 }}>Total Deduction: ₦{bankTransferTotal.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}</p>
            </div>

            <label style={{ display:'block',fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:6 }}>Narration (Optional)</label>
            <input value={bankTransferNarration} onChange={(e)=>setBankTransferNarration(e.target.value.slice(0,100))} placeholder="Payment for goods, services, gift, etc." style={{ width:'100%',padding:'12px 13px',borderRadius:12,border:'1px solid var(--border)',background:'var(--bg-secondary)',fontSize:14,color:'var(--text)',marginBottom:14 }} />

            {bankTransferError && <p style={{ fontSize:12,color:RED,margin:'0 0 10px' }}>{bankTransferError}</p>}
            <button onClick={beginBankTransfer} disabled={bankTransferProcessing || bankTransferVerifyState !== 'verified'} style={{ width:'100%',padding:'14px',borderRadius:14,border:'none',background:(bankTransferProcessing || bankTransferVerifyState !== 'verified') ? 'rgba(0,0,0,.25)' : 'linear-gradient(135deg,#C89B3C,#F3D27A)',fontSize:15,fontWeight:900,color:(bankTransferProcessing || bankTransferVerifyState !== 'verified') ? '#E5E5EA' : '#1C1C1E',opacity:(bankTransferProcessing || bankTransferVerifyState !== 'verified') ? .6 : 1 }}>
              {bankTransferProcessing ? 'Processing your transfer...' : 'Proceed'}
            </button>
          </div>
        </div>

        {BottomNav({ active: 'home' })}
      </>
    );
  }

  /* TRANSFER */
  if (screen === 'transfer') return (
    <>
      <GlobalStyle dark={dark} />
      {receipt && <Receipt data={receipt} onDownload={()=>{}} onClose={()=>setReceipt(null)} dark={dark} />}
      {showPin && <PinKeyboard title="Confirm with PIN" onComplete={handleTransfer} onClose={()=>setShowPin(false)} />}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
      {toast && <div className="fade-in" style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:15,fontWeight:600,zIndex:500 }}>{toast}</div>}
      <div style={{ height:'100dvh',background:dark ? 'linear-gradient(180deg,#040810 0%,#071322 100%)' : 'linear-gradient(180deg,#F3F8FF 0%,#EFF4FB 100%)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'60px 20px 18px',display:'flex',alignItems:'center',gap:12,borderBottom:`1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'}` }}>
          <button onClick={()=>setScreen('profile')} style={{ color:BLUE,fontSize:16,fontWeight:700 }}>← Back</button>
          <h2 style={{ fontSize:21,fontWeight:900,color:'var(--text)',letterSpacing:-0.4 }}>Send Money</h2>
        </div>

        <div style={{ padding:'20px 16px 30px',flex:1,overflowY:'auto' }}>
          <div style={{ background:'linear-gradient(145deg,#011F5B 0%, #0047CC 65%, #0071E3 100%)',borderRadius:22,padding:'18px 18px 20px',marginBottom:16,color:'#fff',boxShadow:'0 20px 42px rgba(0,71,204,.32)',position:'relative',overflow:'hidden' }}>
            <div style={{ position:'absolute',right:-40,top:-50,width:160,height:160,borderRadius:'50%',background:'rgba(255,255,255,.08)',animation:'softPulse 5.2s ease-in-out infinite' }} />
            <p style={{ fontSize:11,fontWeight:700,opacity:.72,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8 }}>Available Balance</p>
            <p style={{ fontSize:30,fontWeight:900,letterSpacing:-1 }}>₦{(user?.walletBalance || 0).toLocaleString('en-NG', {minimumFractionDigits:2})}</p>
          </div>

          <div className="fade-up-scale" style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:16,boxShadow:dark ? '0 12px 24px rgba(0,0,0,.24)' : '0 12px 24px rgba(10,35,85,.08)',marginBottom:14 }}>
            <p style={{ fontSize:12,fontWeight:800,color:'var(--text-secondary)',marginBottom:10,letterSpacing:'0.06em',textTransform:'uppercase' }}>Step 1 · Find Recipient</p>
            <div style={{ display:'flex',gap:10 }}>
              <input
                value={transferPhone}
                onChange={e=>{ setTransferPhone(e.target.value.replace(/\D/g,'').slice(0,11)); setTransferRecipient(null); }}
                placeholder="08012345678"
                inputMode="numeric"
                style={{ flex:1,padding:'14px 14px',borderRadius:12,background:'var(--bg-secondary)',border:'1px solid var(--border)',color:'var(--text)',fontSize:15,fontWeight:600,transition:'all .2s' }}
                onFocus={e=>{e.currentTarget.style.borderColor=BLUE;e.currentTarget.style.boxShadow='0 0 0 3px rgba(0,113,227,.14)';}}
                onBlur={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none';}}
              />
              <button
                className="tactile-btn"
                onClick={()=>lookupTransferRecipient(transferPhone)}
                disabled={transferPhone.length !== 11 || transferLoading}
                style={{ padding:'0 16px',borderRadius:12,background:transferPhone.length===11&&!transferLoading ? 'linear-gradient(135deg,#0047CC,#0071E3)' : 'var(--bg-secondary)',color:transferPhone.length===11&&!transferLoading ? '#fff' : 'var(--text-secondary)',fontSize:14,fontWeight:800,border:'1px solid var(--border)',cursor:transferPhone.length===11&&!transferLoading?'pointer':'not-allowed',minWidth:92 }}>
                {transferLoading ? 'Finding...' : 'Find'}
              </button>
            </div>
          </div>

          {transferRecipient && (
            <div style={{ background:'linear-gradient(145deg,rgba(48,209,88,.15),rgba(48,209,88,.06))',border:'1.5px solid rgba(48,209,88,.35)',borderRadius:18,padding:16,marginBottom:14,backdropFilter:'blur(10px)',animation:'slideUp .3s cubic-bezier(.34,.1,.68,.55)' }}>
              <p style={{ fontSize:11,fontWeight:800,color:GREEN,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8 }}>✓ Verified Recipient</p>
              <p style={{ fontSize:19,fontWeight:900,color:'var(--text)',marginBottom:4 }}>{transferRecipient.name}</p>
              <p style={{ fontSize:13,color:'var(--text-secondary)',fontWeight:500,letterSpacing:'0.02em' }}>{transferRecipient.phone}</p>
            </div>
          )}

          {transferRecipient && (
            <div className="fade-up-scale" style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:20,padding:16,boxShadow:dark ? '0 12px 24px rgba(0,0,0,.24)' : '0 12px 24px rgba(10,35,85,.08)',marginBottom:14 }}>
              <p style={{ fontSize:12,fontWeight:800,color:'var(--text-secondary)',marginBottom:10,letterSpacing:'0.06em',textTransform:'uppercase' }}>Step 2 · Amount & Narration</p>
              <input
                value={transferAmount}
                onChange={e=>setTransferAmount(e.target.value.replace(/\D/g,''))}
                placeholder="Amount in naira"
                inputMode="numeric"
                style={{ width:'100%',padding:'14px 14px',borderRadius:12,background:'var(--bg-secondary)',border:'1px solid var(--border)',color:'var(--text)',fontSize:15,fontWeight:700,marginBottom:10,transition:'all .2s' }}
                onFocus={e=>{e.currentTarget.style.borderColor=BLUE;e.currentTarget.style.boxShadow='0 0 0 3px rgba(0,113,227,.14)';}}
                onBlur={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none';}}
              />
              <input
                value={transferNote}
                onChange={e=>setTransferNote(e.target.value.slice(0,50))}
                placeholder="Narration (optional)"
                style={{ width:'100%',padding:'13px 14px',borderRadius:12,background:'var(--bg-secondary)',border:'1px solid var(--border)',color:'var(--text)',fontSize:14,transition:'all .2s' }}
                onFocus={e=>{e.currentTarget.style.borderColor=BLUE;e.currentTarget.style.boxShadow='0 0 0 3px rgba(0,113,227,.14)';}}
                onBlur={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.boxShadow='none';}}
              />
              <p style={{ fontSize:12,color:'var(--text-secondary)',marginTop:8 }}>Balance: ₦{(user?.walletBalance || 0).toLocaleString('en-NG',{minimumFractionDigits:2})}</p>
            </div>
          )}

          {transferRecipient && transferAmount && (
            <div style={{ background:'linear-gradient(145deg,rgba(0,113,227,.08),rgba(0,113,227,.02))',border:'1px solid rgba(0,113,227,.2)',borderRadius:20,padding:16,marginBottom:16,backdropFilter:'blur(10px)',animation:'slideUp .3s cubic-bezier(.34,.1,.68,.55)' }}>
              <p style={{ fontSize:12,fontWeight:800,color:'var(--text-secondary)',marginBottom:14,letterSpacing:'0.06em',textTransform:'uppercase' }}>Step 3 · Confirm Transfer</p>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,paddingBottom:12,borderBottom:'1px solid rgba(0,113,227,.2)' }}>
                <span style={{ color:'var(--text-secondary)',fontSize:13,fontWeight:600,letterSpacing:'0.02em' }}>Recipient</span>
                <span style={{ color:'var(--text)',fontWeight:800,fontSize:14 }}>{transferRecipient.name}</span>
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,paddingBottom:12,borderBottom:'1px solid rgba(0,113,227,.2)' }}>
                <span style={{ color:'var(--text-secondary)',fontSize:13,fontWeight:600,letterSpacing:'0.02em' }}>Amount</span>
                <span style={{ color:BLUE,fontWeight:900,fontSize:15 }}>₦{parseFloat(transferAmount || '0').toLocaleString('en-NG',{minimumFractionDigits:2})}</span>
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,paddingBottom:12,borderBottom:'1px solid rgba(0,113,227,.2)' }}>
                <span style={{ color:'var(--text-secondary)',fontSize:13,fontWeight:600,letterSpacing:'0.02em' }}>Fee</span>
                <span style={{ color:GREEN,fontWeight:800,fontSize:13 }}>₦0.00</span>
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:4 }}>
                <span style={{ color:'var(--text-secondary)',fontSize:13,fontWeight:600,letterSpacing:'0.02em' }}>Total Debit</span>
                <span style={{ color:BLUE,fontWeight:900,fontSize:16,letterSpacing:'-0.01em' }}>₦{parseFloat(transferAmount || '0').toLocaleString('en-NG',{minimumFractionDigits:2})}</span>
              </div>
            </div>
          )}

          {transferRecipient && transferAmount ? (
            <button className="tactile-btn"
              onClick={()=>{ playSound('confirm'); setPinAction('transfer'); setShowPin(true); }}
              style={{ width:'100%',padding:'16px',borderRadius:14,background:'linear-gradient(135deg,#0047CC,#0071E3)',color:'#fff',fontSize:16,fontWeight:800,border:'none',cursor:'pointer',boxShadow:'0 12px 26px rgba(0,113,227,.36)' }}>
              Continue to PIN Confirmation
            </button>
          ) : (
            <div style={{ textAlign:'center',padding:'36px 18px',color:'var(--text-secondary)' }}>
              <div style={{ width:70,height:70,borderRadius:18,margin:'0 auto 12px',background:'linear-gradient(145deg,rgba(0,113,227,.2),rgba(90,200,250,.08))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,color:BLUE }}>⇄</div>
              <p style={{ fontSize:15,fontWeight:700,color:'var(--text)' }}>Transfer in 3 secure steps</p>
              <p style={{ fontSize:12,marginTop:8,lineHeight:1.6 }}>Find recipient, enter amount, then authorize with your PIN.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  /* DEVELOPER TERMS */
  if (screen === 'developer-terms') return (
    <>
      <GlobalStyle dark={dark} />
      {toast && <div className="fade-in" style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:15,fontWeight:600,zIndex:500 }}>{toast}</div>}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
      <div style={{ height:'100dvh',background:dark ? 'linear-gradient(180deg,#040810 0%,#071322 100%)' : 'linear-gradient(180deg,#F3F8FF 0%,#EFF4FB 100%)',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'58px 20px 18px',display:'flex',alignItems:'center',gap:12,borderBottom:`1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'}` }}>
          <button onClick={()=>setScreen('profile')} style={{ color:BLUE,fontSize:16,fontWeight:700 }}>← Back</button>
          <h2 style={{ fontSize:21,fontWeight:900,color:'var(--text)',letterSpacing:-0.4 }}>Developer Upgrade</h2>
        </div>

        <div style={{ padding:'18px 16px 28px',overflowY:'auto',flex:1 }}>
          <div style={{ background:'linear-gradient(145deg,#011F5B 0%, #0047CC 65%, #0071E3 100%)',borderRadius:20,padding:'18px 18px 20px',marginBottom:16,color:'#fff',boxShadow:'0 20px 42px rgba(0,71,204,.32)' }}>
            <p style={{ fontSize:11,fontWeight:800,opacity:.76,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8 }}>Sauki Developers</p>
            <p style={{ fontSize:23,fontWeight:900,letterSpacing:-.6,marginBottom:8 }}>Integrate Data API in your app</p>
            <p style={{ fontSize:13,opacity:.9,lineHeight:1.55 }}>Get discounted developer pricing and automate data purchases via secure API calls.</p>
          </div>

          <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:16,marginBottom:14 }}>
            <p style={{ fontSize:12,fontWeight:800,color:BLUE,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10 }}>Short Terms</p>
            <ul style={{ paddingLeft:18,color:'var(--text)',fontSize:13,lineHeight:1.7 }}>
              <li>Developer prices apply only to API-triggered data purchases.</li>
              <li>You must protect your API key and rotate immediately if leaked.</li>
              <li>Abuse, fraud, or prohibited traffic can lead to instant key revocation.</li>
              <li>All successful API transactions are final and fully logged.</li>
              <li>You are responsible for compliance in your integrated app/system.</li>
            </ul>
          </div>

          <button
            onClick={upgradeToDeveloper}
            disabled={developerBusy}
            className="tactile-btn"
            style={{ width:'100%',padding:'16px',borderRadius:14,background:developerBusy?'rgba(142,142,147,.35)':'linear-gradient(135deg,#0047CC,#0071E3)',color:'#fff',fontSize:16,fontWeight:800,border:'none',cursor:developerBusy?'not-allowed':'pointer',boxShadow:developerBusy?'none':'0 12px 26px rgba(0,113,227,.36)' }}
          >
            {developerBusy ? 'Activating Developer Mode...' : 'Accept Terms and Activate'}
          </button>
        </div>
      </div>
    </>
  );

  /* DEVELOPER DASHBOARD — TABBED INTERFACE */
  if (screen === 'developer-dashboard') return (
    <>
      <GlobalStyle dark={dark} />
      {toast && <div className="fade-in" style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:15,fontWeight:600,zIndex:500 }}>{toast}</div>}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
      
      <div style={{ height:'100dvh',background:dark ? 'linear-gradient(180deg,#040810 0%,#0A1424 100%)' : 'linear-gradient(180deg,#F3F8FF 0%,#EEF4FB 100%)',display:'flex',flexDirection:'column',animation:'fadeIn .3s ease-in' }}>
        
        {/* Header with Return Button */}
        <div style={{ padding:'16px 16px 12px',background:dark ? 'rgba(10,20,36,.95)' : 'rgba(255,255,255,.96)',borderBottom:`1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'}`,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <button onClick={()=>setScreen('home')} style={{ width:40,height:40,borderRadius:12,border:`1px solid ${dark?'rgba(255,255,255,.1)':'rgba(0,0,0,.08)'}`,background:dark?'rgba(255,255,255,.05)':'rgba(0,0,0,.03)',color:BLUE,fontSize:20,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .2s' }}
              onMouseEnter={e=>{e.currentTarget.style.background=dark?'rgba(255,255,255,.1)':'rgba(0,0,0,.08)';e.currentTarget.style.transform='scale(1.1)'}}
              onMouseLeave={e=>{e.currentTarget.style.background=dark?'rgba(255,255,255,.05)':'rgba(0,0,0,.03)';e.currentTarget.style.transform='scale(1)'}}>
              ← 
            </button>
            <div>
              <h2 style={{ fontSize:18,fontWeight:900,color:'var(--text)',margin:0,letterSpacing:-0.3 }}>Dev Console</h2>
              <p style={{ fontSize:11,color:'var(--text-secondary)',margin:'2px 0 0',fontWeight:600 }}>{developerDocs.discountPercent}% discount · {user?.isDeveloper?'Active':'Inactive'}</p>
            </div>
          </div>
          <div style={{ fontSize:32,fontWeight:900,color:PURPLE }}>⚙️</div>
        </div>

        {/* Tab Navigation */}
        <div style={{ padding:'8px 12px',background:dark?'rgba(10,20,36,.6)':'rgba(248,251,255,.8)',borderBottom:`1px solid ${dark?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)'}`,display:'flex',gap:4,overflowX:'auto',scrollBehavior:'smooth' }}>
          {[
            { id:'keys', label:'🔑 Keys', icon:'keys' },
            { id:'plans', label:'📋 Plans', icon:'plans' },
            { id:'install', label:'⚡ Setup', icon:'install' },
            { id:'transactions', label:'📊 Activity', icon:'tx' },
          ].map(tab=>(
            <button key={tab.id} onClick={()=>setDevDashTab(tab.id as any)} style={{ padding:'10px 16px',borderRadius:10,background:devDashTab===tab.id?`linear-gradient(135deg,${PURPLE},#7C3AED)`:dark?'rgba(255,255,255,.08)':'rgba(0,0,0,.04)',color:devDashTab===tab.id?'#fff':'var(--text-secondary)',fontSize:13,fontWeight:devDashTab===tab.id?800:700,border:`1px solid ${devDashTab===tab.id?`${PURPLE}40`:dark?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)'}`,cursor:'pointer',transition:'all .2s',whiteSpace:'nowrap',flexShrink:0 }}
              onMouseEnter={e=>{if(devDashTab!==tab.id){e.currentTarget.style.background=dark?'rgba(255,255,255,.12)':'rgba(0,0,0,.08)'}}}
              onMouseLeave={e=>{if(devDashTab!==tab.id){e.currentTarget.style.background=dark?'rgba(255,255,255,.08)':'rgba(0,0,0,.04)'}}}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Balance Card — Always visible */}
        <div style={{ margin:'12px 16px 0',padding:'12px 16px',background:dark?'rgba(0,113,227,.15)':'rgba(0,113,227,.1)',border:`1px solid ${BLUE}40`,borderRadius:14 }}>
          <p style={{ fontSize:11,fontWeight:800,color:BLUE,textTransform:'uppercase',letterSpacing:'0.05em',margin:0 }}>Wallet Balance</p>
          <div style={{ display:'flex',alignItems:'baseline',gap:6,marginTop:6 }}>
            <span style={{ fontSize:24,fontWeight:900,color:BLUE }}>₦{(user?.walletBalance||0).toLocaleString('en-NG',{minimumFractionDigits:2})}</span>
            <span style={{ fontSize:11,fontWeight:700,color:BLUE,opacity:0.8 }}>API discount: {developerDocs.discountPercent||0}% off</span>
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ flex:1,overflowY:'auto',padding:'16px',paddingBottom:20 }}>
          
          {/* KEYS TAB */}
          {devDashTab==='keys' && (
            <div style={{ display:'grid',gap:12,animation:'fadeIn .2s ease' }}>
              <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:16 }}>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12 }}>
                  <h3 style={{ fontSize:14,fontWeight:900,color:'var(--text)',margin:0 }}>🔑 Active API Key</h3>
                  <button onClick={rotateDeveloperKey} disabled={developerBusy} style={{ fontSize:12,fontWeight:800,background:PURPLE,color:'#fff',padding:'6px 12px',borderRadius:8,border:'none',cursor:'pointer' }}>{developerBusy?'Rotating...':'Rotate'}</button>
                </div>
                <p style={{ fontSize:12,color:'var(--text-secondary)',marginBottom:10 }}>Keep this safe. Never paste it in public code or websites.</p>
                <div style={{ background:dark?'rgba(0,113,227,.08)':'rgba(0,113,227,.12)',border:`1px solid ${BLUE}30`,borderRadius:12,padding:12,marginBottom:12,fontFamily:'monospace',fontSize:11,color:BLUE,fontWeight:700,wordBreak:'break-all' }}>
                  {developerApiPreview || 'Loading...'}
                </div>
                {freshDeveloperKey && (
                  <div style={{ background:'rgba(76,175,80,.12)',border:'1px solid rgba(76,175,80,.3)',borderRadius:12,padding:12,marginBottom:12 }}>
                    <p style={{ fontSize:11,fontWeight:700,color:GREEN,margin:'0 0 6px',textTransform:'uppercase',letterSpacing:'0.05em' }}>⬆️ NEW KEY (COPY NOW)</p>
                    <p style={{ fontSize:11,color:GREEN,fontWeight:900,margin:0,wordBreak:'break-all',fontFamily:'monospace' }}>{freshDeveloperKey}</p>
                  </div>
                )}
                <button onClick={()=>{ if (freshDeveloperKey) navigator.clipboard.writeText(freshDeveloperKey); else if (developerApiPreview) navigator.clipboard.writeText(developerApiPreview); showToast('Key copied'); }} style={{ width:'100%',padding:'10px',borderRadius:10,background:'var(--bg-secondary)',border:'1px solid var(--border)',color:'var(--text)',fontSize:12,fontWeight:700,cursor:'pointer',transition:'all .2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background=dark?'rgba(255,255,255,.08)':'rgba(0,0,0,.06)'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='var(--bg-secondary)'}}>
                  📋 Copy to Clipboard
                </button>
              </div>
            </div>
          )}

          {/* PLANS TAB */}
          {devDashTab==='plans' && (
            <div style={{ display:'grid',gap:8,animation:'fadeIn .2s ease' }}>
              <p style={{ fontSize:12,color:'var(--text-secondary)',fontWeight:600,margin:0 }}>Available data plans for API. Prices include {developerDocs.discountPercent}% developer discount.</p>
              {developerPlans.slice(0, 150).map((p) => (
                <div key={p.id} style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:12,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,alignItems:'center' }}>
                  <div>
                    <p style={{ fontSize:10,fontWeight:800,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'0.04em',margin:0 }}>Code</p>
                    <p style={{ fontSize:13,fontWeight:900,color:BLUE,margin:'4px 0 0' }}>{p.code}</p>
                  </div>
                  <div>
                    <p style={{ fontSize:10,fontWeight:800,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'0.04em',margin:0 }}>Plan</p>
                    <p style={{ fontSize:13,fontWeight:700,color:'var(--text)',margin:'4px 0 0' }}>{p.network} {p.dataSize}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:10,fontWeight:800,color:'var(--text-secondary)',textTransform:'uppercase',letterSpacing:'0.04em',margin:0 }}>Price</p>
                    <p style={{ fontSize:14,fontWeight:900,color:GREEN,margin:'4px 0 0' }}>₦{Number(p.developerPrice).toLocaleString('en-NG',{minimumFractionDigits:1})}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* INSTALL TAB */}
          {devDashTab==='install' && (
            <div style={{ display:'grid',gap:14,animation:'fadeIn .2s ease' }}>
              <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:16 }}>
                <h3 style={{ fontSize:14,fontWeight:900,color:'var(--text)',margin:'0 0 12px' }}>📱 Installation Guide</h3>
                <p style={{ fontSize:12,color:'var(--text-secondary)',lineHeight:1.6,margin:0 }}>Add SaukiMart API to your Next.js app. Use our SDK to make API calls with just a few lines.</p>
              </div>

              <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:16 }}>
                <h4 style={{ fontSize:13,fontWeight:900,color:'var(--text)',margin:'0 0 10px' }}>Step 1: Install SDK</h4>
                <pre style={{ background:dark?'rgba(0,0,0,.3)':'rgba(0,0,0,.05)',border:`1px solid ${dark?'rgba(255,255,255,.1)':'rgba(0,0,0,.08)'}`,borderRadius:10,padding:12,fontSize:11,color:dark?'#A0F469':'#17C950',fontFamily:'monospace',margin:0,overflow:'auto',lineHeight:1.6 }}>npm install saukimart-sdk</pre>
              </div>

              <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:16 }}>
                <h4 style={{ fontSize:13,fontWeight:900,color:'var(--text)',margin:'0 0 10px' }}>Step 2: Initialize in your code</h4>
                <pre style={{ background:dark?'rgba(0,0,0,.3)':'rgba(0,0,0,.05)',border:`1px solid ${dark?'rgba(255,255,255,.1)':'rgba(0,0,0,.08)'}`,borderRadius:10,padding:12,fontSize:10,color:dark?'#A0F469':'#17C950',fontFamily:'monospace',margin:0,overflow:'auto',lineHeight:1.6 }}>
{`import { SaukiMart } from 'saukimart-sdk';

const sauki = new SaukiMart({
  apiKey: '${developerApiPreview || 'sm_live_xxxxx'}',
  environment: 'production'
});`}
                </pre>
              </div>

              <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:16 }}>
                <h4 style={{ fontSize:13,fontWeight:900,color:'var(--text)',margin:'0 0 10px' }}>Step 3: Make a purchase</h4>
                <pre style={{ background:dark?'rgba(0,0,0,.3)':'rgba(0,0,0,.05)',border:`1px solid ${dark?'rgba(255,255,255,.1)':'rgba(0,0,0,.08)'}`,borderRadius:10,padding:12,fontSize:10,color:dark?'#A0F469':'#17C950',fontFamily:'monospace',margin:0,overflow:'auto',lineHeight:1.6 }}>
{`// Buy 1.5GB MTN data for ₦1,200
const response = await sauki.buyData({
  phoneNumber: '08012345678',
  planCode: '1-123',  // networkId-planId
  idempotencyKey: 'order-123'
});

// Response
console.log(response);
// {
//   success: true,
//   data: {
//     network: 'MTN',
//     dataSize: '1.5GB',
//     phoneNumber: '08012345678',
//     amount: 1200,
//     discountApplied: 150
//   }
// }`}
                </pre>
              </div>

              <div style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:16 }}>
                <h4 style={{ fontSize:13,fontWeight:900,color:'var(--text)',margin:'0 0 10px' }}>⚠️ Production Note</h4>
                <p style={{ fontSize:12,color:'var(--text-secondary)',margin:'0 0 10px',lineHeight:1.6 }}>All phone numbers are processed as real purchase requests. Ensure your app validates user intent before sending requests.</p>
                <pre style={{ background:dark?'rgba(0,0,0,.3)':'rgba(0,0,0,.05)',border:`1px solid ${dark?'rgba(255,255,255,.1)':'rgba(0,0,0,.08)'}`,borderRadius:10,padding:12,fontSize:10,color:dark?'#FFB84D':'#FF9800',fontFamily:'monospace',margin:0,overflow:'auto',lineHeight:1.6 }}>
{`// Production request
const purchase = await sauki.buyData({
  phoneNumber: '08012345678',
  planCode: '1-123',
  idempotencyKey: 'order-001'
});`}
                </pre>
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {devDashTab==='transactions' && (
            <div style={{ display:'grid',gap:12,animation:'fadeIn .2s ease' }}>
              {developerTx.length === 0 ? (
                <div style={{ background:'var(--card)',border:'1px dashed var(--border)',borderRadius:16,padding:40,textAlign:'center' }}>
                  <p style={{ fontSize:40,margin:'0 0 10px' }}>📊</p>
                  <p style={{ fontSize:14,fontWeight:700,color:'var(--text)',margin:0 }}>No transactions yet</p>
                  <p style={{ fontSize:12,color:'var(--text-secondary)',margin:'6px 0 0' }}>API purchases will appear here</p>
                </div>
              ) : (
                developerTx.map((t) => (
                  <div key={t.id} style={{ background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:14 }}>
                    <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
                      <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                        <div style={{ width:36,height:36,borderRadius:10,background:t.status==='success'?'rgba(76,175,80,.15)':'rgba(244,67,54,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>
                          {t.status==='success'?'✓':'✕'}
                        </div>
                        <div>
                          <p style={{ fontSize:13,fontWeight:800,color:'var(--text)',margin:0 }}>{t.planName || `${t.network} ${t.planCode}`}</p>
                          <p style={{ fontSize:11,color:'var(--text-secondary)',margin:'2px 0 0',fontWeight:600 }}>{t.phoneNumber}</p>
                        </div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontSize:13,fontWeight:900,color:t.status==='success'?GREEN:RED,margin:0 }}>₦{Number(t.developerPrice).toLocaleString('en-NG',{minimumFractionDigits:2})}</p>
                        <p style={{ fontSize:10,color:'var(--text-secondary)',margin:'2px 0 0',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.02em' }}>{t.status}</p>
                      </div>
                    </div>
                    <p style={{ fontSize:10,color:'var(--text-secondary)',margin:0 }}>{new Date(t.createdAt).toLocaleString('en-NG',{dateStyle:'short',timeStyle:'short'})}</p>
                  </div>
                ))
              )}
            </div>
          )}
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

  /* CHAT */
  if (screen === 'chat') return (
    <>
      <GlobalStyle dark={dark} />
      {toast && <div className="fade-in" style={{ position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',background:GREEN,color:'#fff',padding:'12px 24px',borderRadius:24,fontSize:15,fontWeight:600,zIndex:500,whiteSpace:'nowrap' }}>{toast}</div>}
      {error && <div className="fade-in" style={{ position:'fixed',top:60,left:16,right:16,background:RED,color:'#fff',padding:'12px 16px',borderRadius:14,fontSize:15,fontWeight:600,zIndex:500 }}>{error}</div>}
      <div style={{ height:'100dvh',background:dark ? 'linear-gradient(180deg,#05070D 0%,#090E1A 42%,#0A101B 100%)' : 'linear-gradient(180deg,#F6F8FC 0%,#EDF2FB 38%,#F4F6FA 100%)',display:'flex',flexDirection:'column',paddingBottom:100 }}>
        <div style={{ padding:'60px 20px 16px',borderBottom:`1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'}` }}>
          <h2 style={{ fontSize:28,fontWeight:900,color:'var(--text)',letterSpacing:-0.7 }}>Support Chat</h2>
          <p style={{ color:'var(--text-secondary)',fontSize:13,marginTop:6,letterSpacing:'0.02em' }}>Talk with SaukiMart support in real-time</p>
        </div>
        <div style={{ flex:1,minHeight:0,overflow:'hidden' }}>
          <SupportChat />
        </div>
      </div>
      {BottomNav({ active: 'chat' })}
    </>
  );

  return null;
}

/* ── HELPERS ── */
function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:16 }}>
      <p style={{ fontSize:12,fontWeight:800,color:'var(--text-secondary)',letterSpacing:'0.08em',marginBottom:10,marginLeft:4,textTransform:'uppercase' }}>{title}</p>
      <div style={{ background:'var(--card)',borderRadius:18,overflow:'hidden',border:'1px solid var(--border)',boxShadow:'0 10px 24px rgba(12,28,54,.05)' }}>
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ icon, label, onPress, right }: { icon: string | React.ReactNode; label: string; onPress?: ()=>void; right?: React.ReactNode; }) {
  return (
    <button onClick={onPress} style={{ width:'100%',display:'flex',alignItems:'center',gap:12,padding:'16px 16px',borderBottom:'1px solid var(--border)',background:'none',textAlign:'left',cursor:onPress?'pointer':'default' }}>
      <div style={{ width:34,height:34,borderRadius:10,background:'var(--bg-secondary)',fontSize:18,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>{icon}</div>
      <span style={{ flex:1,fontSize:15,fontWeight:700,color:'var(--text)' }}>{label}</span>
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
