'use client';

/**
 * SaukiMart Premium App — /app/page.tsx
 * Apple-grade UI/UX | Full agent flow | Dark/Light mode
 * Maintains all existing API endpoints & database schema
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

// ─── TYPES ─────────────────────────────────────────────────────────────────
interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  balance: number;
  cashbackBalance: number;
  totalCashbackEarned: number;
  flwAccountNumber?: string;
  flwAccountName?: string;
  flwBankName?: string;
  createdAt: string;
}

interface DataPlan {
  id: string;
  network: string;
  data: string;
  validity: string;
  price: number;
  planId: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  inStock: boolean;
  category: string;
}

interface Transaction {
  id: string;
  tx_ref: string;
  type: string;
  status: string;
  phone: string;
  amount: number;
  createdAt: string;
  dataPlan?: { network: string; data: string; validity: string };
  product?: { name: string };
}

type Screen =
  | 'splash' | 'entry' | 'register' | 'login' | 'payg_select'
  | 'payg_phone' | 'payg_payment' | 'home' | 'buy_data'
  | 'data_phone' | 'data_pin' | 'data_processing' | 'data_receipt'
  | 'store' | 'store_product' | 'store_pin' | 'store_processing' | 'store_receipt'
  | 'earnings' | 'profile' | 'profile_account' | 'profile_security'
  | 'transactions' | 'support' | 'notifications';

// ─── THEME TOKENS ──────────────────────────────────────────────────────────
const light = {
  bg: '#F2F2F7',
  surface: '#FFFFFF',
  surface2: '#F2F2F7',
  border: 'rgba(60,60,67,0.12)',
  label: '#000000',
  label2: '#3C3C43',
  label3: 'rgba(60,60,67,0.6)',
  label4: 'rgba(60,60,67,0.3)',
  accent: '#007AFF',
  accentBg: 'rgba(0,122,255,0.1)',
  green: '#34C759',
  red: '#FF3B30',
  orange: '#FF9500',
  separator: 'rgba(60,60,67,0.12)',
  card: '#FFFFFF',
  navBar: 'rgba(242,242,247,0.85)',
};

const dark = {
  bg: '#000000',
  surface: '#1C1C1E',
  surface2: '#2C2C2E',
  border: 'rgba(255,255,255,0.1)',
  label: '#FFFFFF',
  label2: '#EBEBF5',
  label3: 'rgba(235,235,245,0.6)',
  label4: 'rgba(235,235,245,0.3)',
  accent: '#0A84FF',
  accentBg: 'rgba(10,132,255,0.15)',
  green: '#30D158',
  red: '#FF453A',
  orange: '#FF9F0A',
  separator: 'rgba(255,255,255,0.1)',
  card: '#1C1C1E',
  navBar: 'rgba(0,0,0,0.85)',
};

// ─── UTILITY HOOKS ──────────────────────────────────────────────────────────
function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const toggle = () => setIsDark((d) => !d);
  const t = isDark ? dark : light;
  return { isDark, toggle, t };
}

// ─── GLOBAL STYLES ──────────────────────────────────────────────────────────
const GlobalStyle = ({ t }: { t: typeof light }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    html, body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif; overscroll-behavior: none; }
    
    .app-root {
      max-width: 430px; margin: 0 auto; min-height: 100dvh;
      background: ${t.bg}; color: ${t.label};
      overflow-x: hidden; position: relative;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Transitions */
    .screen { animation: slideUp 0.32s cubic-bezier(0.32,0.72,0,1) both; }
    @keyframes slideUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
    .fade-in { animation: fadeIn 0.24s ease both; }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .slide-left { animation: slideLeft 0.3s cubic-bezier(0.32,0.72,0,1) both; }
    @keyframes slideLeft { from { opacity:0; transform: translateX(32px); } to { opacity:1; transform: translateX(0); } }
    
    /* Spinner */
    .spinner { width:24px; height:24px; border:2.5px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner-blue { border-color: ${t.accentBg}; border-top-color: ${t.accent}; }
    
    /* Scrollbar */
    ::-webkit-scrollbar { width: 0; height: 0; }
    
    /* Input reset */
    input { outline: none; border: none; background: transparent; font-family: inherit; }
    button { outline: none; border: none; cursor: pointer; font-family: inherit; }
    
    /* Tap states */
    .tappable { transition: opacity 0.12s, transform 0.12s; }
    .tappable:active { opacity: 0.7; transform: scale(0.97); }
    
    /* Haptic pulse */
    @keyframes hap { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} }
    .haptic { animation: hap 0.2s ease; }
    
    /* Network badge colors */
    .net-mtn { background: #FFCC00; color: #000; }
    .net-airtel { background: #E40000; color: #fff; }
    .net-glo { background: #00892C; color: #fff; }
    
    /* Bottom safe area */
    .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 16px); }
  `}</style>
);

// ─── ICONS (Inline SVGs) ───────────────────────────────────────────────────
const Icon = {
  Home: () => <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Grid: () => <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/></svg>,
  Wallet: () => <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M16 12a1 1 0 100 2 1 1 0 000-2z" fill="currentColor"/><path d="M2 9h20" stroke="currentColor" strokeWidth="1.8"/></svg>,
  User: () => <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  ChevronRight: () => <svg width="17" height="17" fill="none" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ChevronLeft: () => <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Eye: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>,
  EyeOff: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Sun: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Moon: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Bell: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Copy: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Check: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  X: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Wifi: () => <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path d="M1.42 9A16 16 0 0122.58 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M5 12.55a11 11 0 0114.08 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M10.71 17.29a3 3 0 012.58 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="20" x2="12.01" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>,
  Zap: () => <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Tv: () => <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/><polyline points="17 2 12 7 7 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Phone2: () => <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>,
  ArrowDown: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ArrowUp: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Gift: () => <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><polyline points="20 12 20 22 4 22 4 12" stroke="currentColor" strokeWidth="1.8"/><rect x="2" y="7" width="20" height="5" stroke="currentColor" strokeWidth="1.8"/><line x1="12" y1="22" x2="12" y2="7" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" stroke="currentColor" strokeWidth="1.8"/></svg>,
  Settings: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.8"/></svg>,
  Lock: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  HelpCircle: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  LogOut: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Star: () => <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  TrendingUp: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 6 23 6 23 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ShoppingBag: () => <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.8"/><path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Delete: () => <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="18" y1="9" x2="12" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="9" x2="18" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
};

// ─── AVATAR COMPONENT ─────────────────────────────────────────────────────
function Avatar({ name, size = 40, t }: { name: string; size?: number; t: typeof light }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF2D55', '#5AC8FA'];
  const color = colors[(name.charCodeAt(0) || 0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
      letterSpacing: -0.5,
    }}>
      {initials}
    </div>
  );
}

// ─── STATUS BAR ───────────────────────────────────────────────────────────
function StatusBar({ t, isDark }: { t: typeof light; isDark: boolean }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', background: t.bg, flexShrink: 0,
    }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: t.label, letterSpacing: -0.3 }}>{time}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill={t.label}><rect x="0" y="6" width="3" height="6" rx="0.5"/><rect x="4.5" y="4" width="3" height="8" rx="0.5"/><rect x="9" y="2" width="3" height="10" rx="0.5"/><rect x="13.5" y="0" width="2.5" height="12" rx="0.5"/></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 2.5C5.2 2.5 2.7 3.7 1 5.8" stroke={t.label} strokeWidth="1.5" strokeLinecap="round"/><path d="M8 5.5C6.3 5.5 4.8 6.2 3.7 7.4" stroke={t.label} strokeWidth="1.5" strokeLinecap="round"/><path d="M8 8.5C7.2 8.5 6.6 8.8 6.2 9.4" stroke={t.label} strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="11" r="0.8" fill={t.label}/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke={t.label} strokeOpacity="0.35"/><rect x="2" y="2" width="17" height="8" rx="2" fill={t.label}/><path d="M23 4.5V7.5C23.83 7.2 24.5 6.7 24.5 6C24.5 5.3 23.83 4.8 23 4.5Z" fill={t.label} fillOpacity="0.4"/></svg>
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────
function BottomNav({
  active, onNavigate, t,
}: {
  active: 'home' | 'store' | 'earnings' | 'profile';
  onNavigate: (s: Screen) => void;
  t: typeof light;
}) {
  const tabs = [
    { key: 'home', label: 'Home', icon: Icon.Home },
    { key: 'store', label: 'Store', icon: Icon.ShoppingBag },
    { key: 'earnings', label: 'Earnings', icon: Icon.TrendingUp },
    { key: 'profile', label: 'Profile', icon: Icon.User },
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: t.navBar,
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: `1px solid ${t.separator}`,
      display: 'flex', paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      zIndex: 100,
    }}>
      {tabs.map(({ key, label, icon: Ic }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onNavigate(key as Screen)}
            className="tappable"
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '10px 0', gap: 3,
              background: 'none',
              color: isActive ? t.accent : t.label3,
            }}
          >
            <div style={{ position: 'relative' }}>
              <Ic />
              {isActive && (
                <div style={{
                  position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: 2, background: t.accent,
                }} />
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, letterSpacing: 0.1 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── NAV HEADER ───────────────────────────────────────────────────────────
function NavHeader({
  title, onBack, rightAction, t,
}: {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  t: typeof light;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 20px', minHeight: 52, flexShrink: 0,
    }}>
      {onBack ? (
        <button onClick={onBack} className="tappable" style={{ background: 'none', color: t.accent, display: 'flex', alignItems: 'center', gap: 2, fontSize: 16, fontWeight: 500 }}>
          <Icon.ChevronLeft /> Back
        </button>
      ) : <div style={{ width: 80 }} />}
      <span style={{ fontSize: 17, fontWeight: 700, color: t.label, letterSpacing: -0.4 }}>{title}</span>
      <div style={{ width: 80, display: 'flex', justifyContent: 'flex-end' }}>{rightAction}</div>
    </div>
  );
}

// ─── CARD COMPONENT ───────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── LIST ITEM ────────────────────────────────────────────────────────────
function ListItem({
  icon, label, value, accent, onPress, t, showSeparator = true,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  accent?: boolean;
  onPress?: () => void;
  t: typeof light;
  showSeparator?: boolean;
}) {
  return (
    <button
      onClick={onPress}
      className="tappable"
      style={{
        width: '100%', display: 'flex', alignItems: 'center',
        padding: '13px 16px', background: t.surface, gap: 14,
        borderBottom: showSeparator ? `1px solid ${t.separator}` : 'none',
        textAlign: 'left',
      }}
    >
      {icon && (
        <div style={{ color: accent ? t.accent : t.label3, flexShrink: 0 }}>{icon}</div>
      )}
      <span style={{ flex: 1, fontSize: 16, color: accent ? t.accent : t.label, fontWeight: 400 }}>{label}</span>
      {value && <span style={{ fontSize: 15, color: t.label3 }}>{value}</span>}
      {onPress && <div style={{ color: t.label4 }}><Icon.ChevronRight /></div>}
    </button>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────
function Toast({ msg, type, t }: { msg: string; type: 'success' | 'error' | 'info'; t: typeof light }) {
  const colors = { success: t.green, error: t.red, info: t.accent };
  return (
    <div style={{
      position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
      background: t.surface, borderRadius: 14, padding: '12px 20px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.2)', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10, maxWidth: 320,
      border: `1px solid ${t.separator}`,
      animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
    }}>
      <div style={{ width: 8, height: 8, borderRadius: 4, background: colors[type], flexShrink: 0 }} />
      <span style={{ fontSize: 14, color: t.label, fontWeight: 500 }}>{msg}</span>
    </div>
  );
}

// ─── TOAST HOOK ───────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const show = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);
  return { toast, show };
}

// ─── PIN PAD ──────────────────────────────────────────────────────────────
function PinPad({
  value, onChange, onDone, t, label = 'Enter your 4-digit PIN',
  loading = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onDone: () => void;
  t: typeof light;
  label?: string;
  loading?: boolean;
}) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  const handleDigit = (d: string) => {
    if (value.length < 4) {
      const next = value + d;
      onChange(next);
      if (next.length === 4) setTimeout(onDone, 180);
    }
  };
  const handleDel = () => onChange(value.slice(0, -1));

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 40px' }}>
      <p style={{ color: t.label2, fontSize: 17, fontWeight: 500, marginBottom: 32 }}>{label}</p>
      
      {/* PIN Dots */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 48 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            width: 18, height: 18, borderRadius: 9,
            background: i < value.length ? t.accent : t.border,
            border: `2px solid ${i < value.length ? t.accent : t.label4}`,
            transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
            transform: i < value.length ? 'scale(1.15)' : 'scale(1)',
          }} />
        ))}
      </div>

      {/* Number Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: 280 }}>
        {digits.slice(0, 9).map((d) => (
          <button key={d} onClick={() => handleDigit(d)} className="tappable" style={{
            height: 72, borderRadius: 16, background: t.surface,
            fontSize: 26, fontWeight: 500, color: t.label,
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          }}>{d}</button>
        ))}
        <button style={{ height: 72, borderRadius: 16, background: 'transparent', visibility: 'hidden' }} />
        <button onClick={() => handleDigit('0')} className="tappable" style={{
          height: 72, borderRadius: 16, background: t.surface,
          fontSize: 26, fontWeight: 500, color: t.label,
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        }}>0</button>
        <button onClick={handleDel} className="tappable" style={{
          height: 72, borderRadius: 16, background: t.surface,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        }}>
          {loading ? <div className="spinner spinner-blue" /> : <Icon.Delete />}
        </button>
      </div>
    </div>
  );
}

// ─── INPUT FIELD ──────────────────────────────────────────────────────────
function Input({
  value, onChange, placeholder, type = 'text', icon, t, autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  icon?: React.ReactNode;
  t: typeof light;
  autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: t.surface, borderRadius: 12,
      padding: '14px 16px', border: `1px solid ${t.border}`,
    }}>
      {icon && <div style={{ color: t.label3, flexShrink: 0 }}>{icon}</div>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={isPass && !show ? 'password' : isPass ? 'text' : type}
        autoFocus={autoFocus}
        style={{
          flex: 1, fontSize: 16, color: t.label, background: 'transparent',
          caretColor: t.accent,
        }}
      />
      {isPass && (
        <button onClick={() => setShow((s) => !s)} style={{ background: 'none', color: t.label3 }}>
          {show ? <Icon.EyeOff /> : <Icon.Eye />}
        </button>
      )}
    </div>
  );
}

// ─── BUTTON PRIMARY ────────────────────────────────────────────────────────
function PrimaryBtn({
  label, onClick, loading, disabled, t, color,
}: {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  t: typeof light;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="tappable"
      style={{
        width: '100%', height: 54, borderRadius: 14,
        background: disabled ? t.label4 : (color || t.accent),
        color: '#fff', fontSize: 17, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        letterSpacing: -0.3,
      }}
    >
      {loading ? <div className="spinner" /> : label}
    </button>
  );
}

// ─── NETWORK BADGE ────────────────────────────────────────────────────────
function NetworkBadge({ network }: { network: string }) {
  const cls = { MTN: 'net-mtn', AIRTEL: 'net-airtel', GLO: 'net-glo' }[network] || '';
  return (
    <span className={cls} style={{ padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
      {network}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SCREENS
// ─────────────────────────────────────────────────────────────────────────

// ─── SPLASH SCREEN ────────────────────────────────────────────────────────
function SplashScreen({ onDone, t }: { onDone: () => void; t: typeof light }) {
  useEffect(() => {
    const id = setTimeout(onDone, 2200);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(160deg, ${t.accent} 0%, #0055CC 100%)`,
    }}>
      <style>{`
        @keyframes logoIn { 0%{opacity:0;transform:scale(0.6)} 60%{opacity:1;transform:scale(1.05)} 100%{transform:scale(1)} }
        @keyframes tagIn { 0%{opacity:0;transform:translateY(12px)} 100%{opacity:0.8;transform:translateY(0)} }
        .logo-anim { animation: logoIn 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }
        .tag-anim { animation: tagIn 0.6s ease 0.9s both; }
        @keyframes ring { 0%{transform:scale(0.85);opacity:0.6} 100%{transform:scale(1.4);opacity:0} }
        .ring-anim { animation: ring 1.5s ease-out 0.4s infinite; }
      `}</style>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="ring-anim" style={{
          position: 'absolute', width: 120, height: 120, borderRadius: 60,
          border: '2px solid rgba(255,255,255,0.4)',
        }} />
        <div className="logo-anim" style={{
          width: 90, height: 90, borderRadius: 22,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
        }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <text x="8" y="40" fontSize="38" fill="white" fontWeight="800" fontFamily="DM Sans">S</text>
          </svg>
        </div>
      </div>
      <div className="tag-anim" style={{ marginTop: 32, textAlign: 'center' }}>
        <p style={{ color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>SaukiMart</p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginTop: 6 }}>Nigeria's Digital Marketplace</p>
      </div>
    </div>
  );
}

// ─── ENTRY SCREEN ─────────────────────────────────────────────────────────
function EntryScreen({
  onRegister, onLogin, onPayg, t,
}: {
  onRegister: () => void;
  onLogin: () => void;
  onPayg: () => void;
  t: typeof light;
}) {
  return (
    <div className="screen" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '60px 28px 40px',
        background: `linear-gradient(170deg, ${t.surface} 0%, ${t.bg} 100%)`,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18, marginBottom: 24,
          background: `linear-gradient(135deg, ${t.accent}, #0055CC)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 30px ${t.accentBg}`,
        }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <text x="6" y="34" fontSize="32" fill="white" fontWeight="800" fontFamily="DM Sans">S</text>
          </svg>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: t.label, letterSpacing: -1.5, marginBottom: 10, textAlign: 'center' }}>
          Welcome to SaukiMart
        </h1>
        <p style={{ fontSize: 16, color: t.label3, textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>
          Buy data, top up airtime, shop devices — all in one premium place.
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['⚡ Instant Data', '🔒 Secure Wallet', '💰 2% Cashback', '📦 Premium Store'].map((f) => (
            <span key={f} style={{
              padding: '6px 14px', borderRadius: 20,
              background: t.accentBg, color: t.accent,
              fontSize: 13, fontWeight: 500,
            }}>{f}</span>
          ))}
        </div>
      </div>

      {/* CTA Cards */}
      <div style={{ padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Pay-as-you-go */}
        <button onClick={onPayg} className="tappable" style={{
          borderRadius: 16, padding: '18px 20px', textAlign: 'left',
          background: `linear-gradient(135deg, #FF9500, #FF6B00)`,
          boxShadow: '0 6px 24px rgba(255,149,0,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#fff', fontSize: 17, fontWeight: 700, letterSpacing: -0.5 }}>Buy Data Instantly</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 3 }}>No account needed • Pay as you go</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 10 }}>
              <Icon.Wifi />
            </div>
          </div>
        </button>

        {/* Register */}
        <button onClick={onRegister} className="tappable" style={{
          borderRadius: 16, padding: '18px 20px',
          background: t.accent, boxShadow: `0 6px 24px ${t.accentBg}`,
          textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ color: '#fff', fontSize: 17, fontWeight: 700, letterSpacing: -0.5 }}>Create Account</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 3 }}>Wallet • Cashback • Full access</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 10 }}>
            <Icon.User />
          </div>
        </button>

        {/* Login */}
        <button onClick={onLogin} className="tappable" style={{
          borderRadius: 16, padding: '16px 20px',
          background: t.surface, border: `1.5px solid ${t.border}`,
          textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ color: t.label, fontSize: 17, fontWeight: 600, letterSpacing: -0.4 }}>Sign In</p>
          <div style={{ color: t.label3, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 14, color: t.label3 }}>Already a user</span>
            <Icon.ChevronRight />
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── REGISTER SCREEN ──────────────────────────────────────────────────────
function RegisterScreen({ onBack, onSuccess, t }: { onBack: () => void; onSuccess: (agent: Agent) => void; t: typeof light }) {
  const [step, setStep] = useState<'info' | 'pin' | 'confirm'>('info');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast, show } = useToast();

  const handleInfo = () => {
    if (!firstName.trim() || !lastName.trim()) return show('Enter your full name', 'error');
    if (!/^0[789][01]\d{8}$/.test(phone)) return show('Enter a valid Nigerian phone number', 'error');
    setStep('pin');
  };

  const handlePin = useCallback(() => {
    if (pin.length === 4) setStep('confirm');
  }, [pin]);

  useEffect(() => { if (pin.length === 4 && step === 'pin') setTimeout(() => setStep('confirm'), 200); }, [pin, step]);
  useEffect(() => {
    if (confirmPin.length === 4 && step === 'confirm') {
      if (confirmPin !== pin) { show('PINs do not match', 'error'); setConfirmPin(''); return; }
      handleRegister();
    }
  }, [confirmPin, step]);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      show('Account created successfully!', 'success');
      setTimeout(() => onSuccess(data.agent), 800);
    } catch (e: any) {
      show(e.message, 'error');
      setConfirmPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: t.bg }}>
      {toast && <Toast {...toast} t={t} />}
      <NavHeader title="Create Account" onBack={onBack} t={t} />

      {step === 'info' && (
        <div className="slide-left" style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: t.label, letterSpacing: -1 }}>Let's get you set up</h2>
            <p style={{ color: t.label3, fontSize: 15, marginTop: 6 }}>Create your SaukiMart account in seconds</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input value={firstName} onChange={setFirstName} placeholder="First Name" t={t} autoFocus icon={<Icon.User />} />
            <Input value={lastName} onChange={setLastName} placeholder="Last Name" t={t} icon={<Icon.User />} />
            <Input value={phone} onChange={setPhone} placeholder="Phone Number (08012345678)" type="tel" t={t} icon={
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7A2 2 0 012 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91A16 16 0 0015.09 17.9l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            } />
          </div>

          <div style={{ padding: '16px', borderRadius: 12, background: t.accentBg, marginTop: 4 }}>
            <p style={{ fontSize: 13, color: t.accent, fontWeight: 500, lineHeight: 1.5 }}>
              ✨ Your account comes with a free virtual bank account for easy wallet funding, and 2% cashback on every purchase.
            </p>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 24 }}>
            <PrimaryBtn label="Continue" onClick={handleInfo} t={t} />
          </div>
        </div>
      )}

      {step === 'pin' && (
        <div className="slide-left" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: t.label, letterSpacing: -0.8 }}>Set Your PIN</h2>
            <p style={{ color: t.label3, fontSize: 15, marginTop: 6 }}>Create a 4-digit PIN to secure your account</p>
          </div>
          <PinPad value={pin} onChange={setPin} onDone={() => {}} t={t} label="Choose a 4-digit PIN" />
        </div>
      )}

      {step === 'confirm' && (
        <div className="slide-left" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: t.label, letterSpacing: -0.8 }}>Confirm PIN</h2>
            <p style={{ color: t.label3, fontSize: 15, marginTop: 6 }}>Re-enter your PIN to confirm</p>
          </div>
          <PinPad value={confirmPin} onChange={setConfirmPin} onDone={() => {}} t={t} label="Confirm your PIN" loading={loading} />
        </div>
      )}
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────
function LoginScreen({ onBack, onSuccess, t }: { onBack: () => void; onSuccess: (agent: Agent) => void; t: typeof light }) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'phone' | 'pin'>('phone');
  const [loading, setLoading] = useState(false);
  const { toast, show } = useToast();

  const handlePhoneNext = () => {
    if (!/^0[789][01]\d{8}$/.test(phone)) return show('Enter a valid Nigerian phone number', 'error');
    setStep('pin');
  };

  useEffect(() => {
    if (pin.length === 4 && step === 'pin') handleLogin();
  }, [pin, step]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      onSuccess(data.agent);
    } catch (e: any) {
      show(e.message, 'error');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen" style={{ minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      {toast && <Toast {...toast} t={t} />}
      <NavHeader title="Sign In" onBack={onBack} t={t} />

      {step === 'phone' && (
        <div className="slide-left" style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: t.label, letterSpacing: -1 }}>Welcome back 👋</h2>
            <p style={{ color: t.label3, fontSize: 15, marginTop: 6 }}>Enter your phone to continue</p>
          </div>
          <Input value={phone} onChange={setPhone} placeholder="Phone Number (08012345678)" type="tel" t={t} autoFocus />
          <div style={{ marginTop: 'auto', paddingTop: 24 }}>
            <PrimaryBtn label="Continue" onClick={handlePhoneNext} t={t} />
          </div>
        </div>
      )}

      {step === 'pin' && (
        <div className="slide-left" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: t.label, letterSpacing: -0.8, marginBottom: 8 }}>Enter PIN</h2>
          <p style={{ color: t.label3, fontSize: 15 }}>Enter your 4-digit security PIN</p>
          <PinPad value={pin} onChange={setPin} onDone={() => {}} t={t} label="Your PIN" loading={loading} />
        </div>
      )}
    </div>
  );
}

// ─── PAY-AS-YOU-GO ────────────────────────────────────────────────────────
function PaygFlow({
  onBack, onDone, t,
}: {
  onBack: () => void;
  onDone: () => void;
  t: typeof light;
}) {
  const [step, setStep] = useState<'network' | 'plan' | 'phone' | 'payment'>('network');
  const [network, setNetwork] = useState('');
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [phone, setPhone] = useState('');
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast, show } = useToast();

  const loadPlans = async (net: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/data-plans?network=${net}`);
      const data = await res.json();
      setPlans(data);
    } catch { show('Failed to load plans', 'error'); }
    finally { setLoading(false); }
  };

  const handleNetwork = (net: string) => { setNetwork(net); loadPlans(net); setStep('plan'); };
  const handlePlan = (plan: DataPlan) => { setSelectedPlan(plan); setStep('phone'); };

  const handleInitiate = async () => {
    if (!/^0[789][01]\d{8}$/.test(phone)) return show('Enter a valid phone number', 'error');
    setLoading(true);
    try {
      const res = await fetch('/api/data/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, planId: selectedPlan!.id, network }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setPaymentInfo(data);
      setStep('payment');
    } catch (e: any) { show(e.message, 'error'); }
    finally { setLoading(false); }
  };

  const networks = ['MTN', 'AIRTEL', 'GLO'];
  const networkColors: Record<string, string> = { MTN: '#FFCC00', AIRTEL: '#E40000', GLO: '#00892C' };

  return (
    <div className="screen" style={{ minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      {toast && <Toast {...toast} t={t} />}
      <NavHeader
        title={step === 'network' ? 'Buy Data' : step === 'plan' ? `${network} Plans` : step === 'phone' ? 'Phone Number' : 'Make Payment'}
        onBack={step === 'network' ? onBack : () => { if (step === 'plan') setStep('network'); else if (step === 'phone') setStep('plan'); else setStep('phone'); }}
        t={t}
      />

      {step === 'network' && (
        <div className="slide-left" style={{ padding: '12px 20px' }}>
          <p style={{ color: t.label3, fontSize: 15, marginBottom: 20 }}>Select your mobile network</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {networks.map((net) => (
              <button key={net} onClick={() => handleNetwork(net)} className="tappable" style={{
                borderRadius: 16, padding: '20px', background: t.surface,
                border: `1px solid ${t.border}`,
                display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: networkColors[net], display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: net === 'MTN' ? '#000' : '#fff' }}>{net}</span>
                </div>
                <div>
                  <p style={{ fontSize: 17, fontWeight: 600, color: t.label }}>{net} Data</p>
                  <p style={{ fontSize: 13, color: t.label3, marginTop: 2 }}>Instant delivery • Best rates</p>
                </div>
                <div style={{ marginLeft: 'auto', color: t.label4 }}><Icon.ChevronRight /></div>
              </button>
            ))}
          </div>
          <p style={{ marginTop: 24, textAlign: 'center', color: t.label3, fontSize: 14 }}>
            Already have an account?{' '}
            <button onClick={onBack} style={{ background: 'none', color: t.accent, fontWeight: 600 }}>Sign in for cashback</button>
          </p>
        </div>
      )}

      {step === 'plan' && (
        <div className="slide-left" style={{ padding: '12px 20px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner spinner-blue" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {plans.map((plan) => (
                <button key={plan.id} onClick={() => handlePlan(plan)} className="tappable" style={{
                  borderRadius: 14, padding: '16px', background: t.surface,
                  border: `1px solid ${t.border}`, textAlign: 'left',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: t.label, letterSpacing: -0.8 }}>{plan.data}</span>
                      <NetworkBadge network={plan.network} />
                    </div>
                    <span style={{ fontSize: 13, color: t.label3 }}>Valid {plan.validity}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: t.accent }}>₦{plan.price.toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 'phone' && (
        <div className="slide-left" style={{ flex: 1, padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {selectedPlan && (
            <div style={{ padding: 16, borderRadius: 14, background: t.accentBg, marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: t.accent }}>{selectedPlan.data} Data</p>
                  <p style={{ fontSize: 13, color: t.label3, marginTop: 2 }}>Valid {selectedPlan.validity}</p>
                </div>
                <p style={{ fontSize: 22, fontWeight: 800, color: t.label }}>₦{selectedPlan.price.toLocaleString()}</p>
              </div>
            </div>
          )}
          <div>
            <p style={{ fontSize: 15, color: t.label2, marginBottom: 10, fontWeight: 500 }}>Phone to receive data:</p>
            <Input value={phone} onChange={setPhone} placeholder="08012345678" type="tel" t={t} autoFocus />
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 24 }}>
            <PrimaryBtn label={`Pay ₦${selectedPlan?.price.toLocaleString()}`} onClick={handleInitiate} loading={loading} t={t} />
          </div>
        </div>
      )}

      {step === 'payment' && paymentInfo && (
        <div className="slide-left" style={{ flex: 1, padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: t.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon.Wallet />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: t.label }}>Make Bank Transfer</h2>
            <p style={{ color: t.label3, fontSize: 14, marginTop: 6 }}>Transfer exactly the amount below to complete your order</p>
          </div>

          {/* Payment details */}
          <div style={{ background: t.surface, borderRadius: 16, overflow: 'hidden', border: `1px solid ${t.border}` }}>
            {[
              { label: 'Amount', value: `₦${selectedPlan?.price.toLocaleString()}`, highlight: true },
              { label: 'Bank', value: paymentInfo.bankName || 'Flutterwave Titan' },
              { label: 'Account Number', value: paymentInfo.accountNumber || '—', copy: true },
              { label: 'Account Name', value: paymentInfo.accountName || 'SaukiMart' },
            ].map((row, i, arr) => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px',
                borderBottom: i < arr.length - 1 ? `1px solid ${t.separator}` : 'none',
              }}>
                <span style={{ fontSize: 14, color: t.label3 }}>{row.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: row.highlight ? 700 : 500, color: row.highlight ? t.accent : t.label }}>
                    {row.value}
                  </span>
                  {row.copy && (
                    <button onClick={() => { navigator.clipboard?.writeText(row.value); }}
                      style={{ background: 'none', color: t.accent }}>
                      <Icon.Copy />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: 14, borderRadius: 12, background: `${t.green}18` }}>
            <p style={{ fontSize: 13, color: t.green, fontWeight: 500, lineHeight: 1.5 }}>
              ✅ Data will be delivered automatically after payment is confirmed. This usually takes 1–3 minutes.
            </p>
          </div>

          <PrimaryBtn label="I've Made the Transfer" onClick={onDone} t={t} color={t.green} />
        </div>
      )}
    </div>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────
function HomeScreen({
  agent, onNavigate, isDark, toggleTheme, t,
}: {
  agent: Agent;
  onNavigate: (s: Screen) => void;
  isDark: boolean;
  toggleTheme: () => void;
  t: typeof light;
}) {
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [localAgent, setLocalAgent] = useState(agent);

  useEffect(() => {
    const loadData = async () => {
      setLoadingTx(true);
      try {
        const [txRes, balRes] = await Promise.all([
          fetch(`/api/transactions/list?agentPhone=${agent.phone}&limit=10`),
          fetch(`/api/agent/balance?phone=${agent.phone}`),
        ]);
        if (txRes.ok) { const d = await txRes.json(); setTransactions(d.transactions || d); }
        if (balRes.ok) { const d = await balRes.json(); setLocalAgent((a) => ({ ...a, balance: d.balance, cashbackBalance: d.cashbackBalance })); }
      } catch {}
      finally { setLoadingTx(false); }
    };
    loadData();
  }, [agent.phone, refreshKey]);

  const services = [
    { icon: Icon.Wifi, label: 'Data', color: '#007AFF', bg: '#E5F1FF', action: 'buy_data' as Screen },
    { icon: Icon.Phone2, label: 'Airtime', color: '#34C759', bg: '#E5F9EC', action: 'buy_data' as Screen },
    { icon: Icon.Zap, label: 'Electricity', color: '#FF9500', bg: '#FFF3E5', action: 'store' as Screen },
    { icon: Icon.Tv, label: 'Cable TV', color: '#AF52DE', bg: '#F5EBFF', action: 'store' as Screen },
    { icon: Icon.ShoppingBag, label: 'Store', color: '#FF2D55', bg: '#FFE5EA', action: 'store' as Screen },
    { icon: Icon.Gift, label: 'Rewards', color: '#5AC8FA', bg: '#E5F7FF', action: 'earnings' as Screen },
  ];

  const getStatusColor = (status: string) =>
    ({ delivered: t.green, paid: t.orange, pending: t.orange, failed: t.red }[status] || t.label3);

  return (
    <div style={{ paddingBottom: 90, background: t.bg }}>
      {/* Top gradient header */}
      <div style={{
        background: `linear-gradient(160deg, ${t.accent} 0%, #0055CC 100%)`,
        padding: '12px 20px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90, background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -30, width: 160, height: 160, borderRadius: 80, background: 'rgba(255,255,255,0.04)' }} />

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={`${localAgent.firstName} ${localAgent.lastName}`} size={44} t={t} />
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}</p>
              <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: -0.4 }}>
                {localAgent.firstName} {localAgent.lastName}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={toggleTheme} className="tappable" style={{
              width: 40, height: 40, borderRadius: 20,
              background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
            }}>
              {isDark ? <Icon.Sun /> : <Icon.Moon />}
            </button>
            <button onClick={() => onNavigate('notifications')} className="tappable" style={{
              width: 40, height: 40, borderRadius: 20,
              background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
            }}>
              <Icon.Bell />
            </button>
          </div>
        </div>

        {/* Wallet card */}
        <div style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20, padding: '20px',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 6 }}>Available Balance</p>
              <p style={{ color: '#fff', fontSize: 36, fontWeight: 800, letterSpacing: -1.5 }}>
                {balanceHidden ? '₦ •••••' : `₦${localAgent.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
              </p>
            </div>
            <button onClick={() => setBalanceHidden((h) => !h)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, padding: 8, color: '#fff' }}>
              {balanceHidden ? <Icon.Eye /> : <Icon.EyeOff />}
            </button>
          </div>

          {/* Account number */}
          {localAgent.flwAccountNumber && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.1)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 2 }}>{localAgent.flwBankName || 'PalmPay'}</p>
                <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}>{localAgent.flwAccountNumber}</p>
              </div>
              <button onClick={() => navigator.clipboard?.writeText(localAgent.flwAccountNumber!)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '6px 8px', color: '#fff' }}>
                <Icon.Copy />
              </button>
            </div>
          )}

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {[
              { icon: Icon.ArrowDown, label: 'Fund' },
              { icon: Icon.ArrowUp, label: 'Transfer' },
              { icon: Icon.Gift, label: 'Cashback' },
            ].map(({ icon: Ic, label }) => (
              <button key={label} onClick={() => label === 'Cashback' ? onNavigate('earnings') : {}} className="tappable" style={{
                flex: 1, padding: '10px 0', borderRadius: 12,
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              }}>
                <Ic />
                <span style={{ fontSize: 12, fontWeight: 500 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <div style={{ padding: '24px 20px 0' }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: t.label, marginBottom: 16, letterSpacing: -0.5 }}>Services</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {services.map(({ icon: Ic, label, color, bg, action }) => (
            <button key={label} onClick={() => onNavigate(action)} className="tappable" style={{
              borderRadius: 16, padding: '18px 0', background: t.surface,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              border: `1px solid ${t.border}`,
            }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                <Ic />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: t.label2 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ padding: '28px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: t.label, letterSpacing: -0.5 }}>Recent Activity</p>
          <button onClick={() => onNavigate('transactions')} style={{ background: 'none', color: t.accent, fontSize: 14, fontWeight: 600 }}>See All</button>
        </div>

        {loadingTx ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner spinner-blue" /></div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', background: t.surface, borderRadius: 16 }}>
            <p style={{ color: t.label3, fontSize: 15 }}>No transactions yet</p>
            <p style={{ color: t.label4, fontSize: 13, marginTop: 4 }}>Your activity will appear here</p>
          </div>
        ) : (
          <div style={{ background: t.surface, borderRadius: 16, overflow: 'hidden', border: `1px solid ${t.border}` }}>
            {transactions.slice(0, 5).map((tx, i) => (
              <div key={tx.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                borderBottom: i < transactions.slice(0, 5).length - 1 ? `1px solid ${t.separator}` : 'none',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: tx.type === 'data' ? '#E5F1FF' : '#FFE5F1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: tx.type === 'data' ? '#007AFF' : '#FF2D55',
                }}>
                  {tx.type === 'data' ? <Icon.Wifi /> : <Icon.ShoppingBag />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: t.label }}>
                    {tx.dataPlan ? `${tx.dataPlan.data} Data` : tx.product?.name || tx.type}
                  </p>
                  <p style={{ fontSize: 12, color: t.label3, marginTop: 2 }}>
                    {new Date(tx.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: t.red }}>-₦{tx.amount.toLocaleString()}</p>
                  <p style={{ fontSize: 11, color: getStatusColor(tx.status), marginTop: 2, fontWeight: 600, textTransform: 'capitalize' }}>{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referral card */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{
          borderRadius: 20, padding: 20,
          background: `linear-gradient(135deg, #5AC8FA, #007AFF)`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <p style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>Cashback Balance</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>2% on every purchase</p>
            <p style={{ color: '#fff', fontSize: 28, fontWeight: 800, marginTop: 8 }}>
              ₦{localAgent.cashbackBalance.toFixed(2)}
            </p>
          </div>
          <button onClick={() => onNavigate('earnings')} className="tappable" style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 12,
            padding: '10px 16px', color: '#fff', fontSize: 14, fontWeight: 600,
          }}>View</button>
        </div>
      </div>
    </div>
  );
}

// ─── BUY DATA SCREEN ─────────────────────────────────────────────────────
function BuyDataScreen({
  agent, onBack, onDone, t,
}: {
  agent: Agent;
  onBack: () => void;
  onDone: () => void;
  t: typeof light;
}) {
  const [step, setStep] = useState<'network' | 'plan' | 'phone' | 'pin' | 'processing' | 'receipt'>('network');
  const [network, setNetwork] = useState('');
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [phone, setPhone] = useState(agent.phone);
  const [pin, setPin] = useState('');
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast, show } = useToast();

  const loadPlans = async (net: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/data-plans?network=${net}`);
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch { show('Failed to load plans', 'error'); }
    finally { setLoading(false); }
  };

  const handleNetwork = (net: string) => { setNetwork(net); loadPlans(net); setStep('plan'); };
  const handlePlan = (plan: DataPlan) => { setSelectedPlan(plan); setStep('phone'); };
  const handlePhone = () => {
    if (!/^0[789][01]\d{8}$/.test(phone)) return show('Enter a valid phone number', 'error');
    if (agent.balance < (selectedPlan?.price || 0)) return show('Insufficient balance', 'error');
    setPin(''); setStep('pin');
  };

  useEffect(() => {
    if (pin.length === 4 && step === 'pin') handlePurchase();
  }, [pin, step]);

  const handlePurchase = async () => {
    setStep('processing');
    try {
      const res = await fetch('/api/agent/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentPhone: agent.phone,
          pin,
          type: 'data',
          planId: selectedPlan!.id,
          phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Purchase failed');
      setReceipt(data);
      setStep('receipt');
    } catch (e: any) {
      show(e.message, 'error');
      setPin('');
      setStep('pin');
    }
  };

  const networks = ['MTN', 'AIRTEL', 'GLO'];
  const networkBgs: Record<string, string> = { MTN: '#FFCC00', AIRTEL: '#E40000', GLO: '#00892C' };

  return (
    <div className="screen" style={{ minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      {toast && <Toast {...toast} t={t} />}
      {!['processing', 'receipt'].includes(step) && (
        <NavHeader
          title={step === 'network' ? 'Buy Data' : step === 'plan' ? `${network} Plans` : step === 'phone' ? 'Send To' : 'Confirm with PIN'}
          onBack={step === 'network' ? onBack : () => {
            if (step === 'plan') { setStep('network'); setPlans([]); }
            else if (step === 'phone') setStep('plan');
            else if (step === 'pin') setStep('phone');
          }}
          t={t}
        />
      )}

      {/* Balance bar */}
      {!['processing', 'receipt'].includes(step) && (
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ padding: '10px 14px', borderRadius: 12, background: t.accentBg, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: t.label3 }}>Wallet Balance</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: t.accent }}>₦{agent.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      {step === 'network' && (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {networks.map((net) => (
            <button key={net} onClick={() => handleNetwork(net)} className="tappable" style={{
              borderRadius: 16, padding: '20px', background: t.surface,
              border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: networkBgs[net], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: net === 'MTN' ? '#000' : '#fff' }}>{net}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 17, fontWeight: 600, color: t.label }}>{net} Data Bundles</p>
                <p style={{ fontSize: 13, color: t.label3 }}>Instant delivery</p>
              </div>
              <div style={{ color: t.label4 }}><Icon.ChevronRight /></div>
            </button>
          ))}
        </div>
      )}

      {step === 'plan' && (
        <div style={{ padding: '0 20px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner spinner-blue" /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {plans.map((plan) => {
                const canAfford = agent.balance >= plan.price;
                return (
                  <button key={plan.id} onClick={() => canAfford && handlePlan(plan)} className={canAfford ? 'tappable' : ''} style={{
                    borderRadius: 14, padding: '16px', background: t.surface,
                    border: `1.5px solid ${t.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    opacity: canAfford ? 1 : 0.5, textAlign: 'left',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: t.label }}>{plan.data}</span>
                        <NetworkBadge network={plan.network} />
                      </div>
                      <span style={{ fontSize: 13, color: t.label3 }}>Valid {plan.validity}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 20, fontWeight: 700, color: canAfford ? t.accent : t.red }}>
                        ₦{plan.price.toLocaleString()}
                      </p>
                      {!canAfford && <p style={{ fontSize: 11, color: t.red, marginTop: 2 }}>Insufficient balance</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {step === 'phone' && (
        <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedPlan && (
            <div style={{ padding: '14px 16px', borderRadius: 14, background: t.accentBg, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 17, fontWeight: 700, color: t.accent }}>{selectedPlan.data}</p>
                <p style={{ fontSize: 13, color: t.label3 }}>{selectedPlan.validity}</p>
              </div>
              <p style={{ fontSize: 20, fontWeight: 800, color: t.label }}>₦{selectedPlan.price.toLocaleString()}</p>
            </div>
          )}
          <p style={{ fontSize: 15, color: t.label2, fontWeight: 500 }}>Phone number to receive data:</p>
          <Input value={phone} onChange={setPhone} placeholder="08012345678" type="tel" t={t} />
          <p style={{ fontSize: 13, color: t.label3 }}>Leave as your number or enter a different recipient</p>
          <div style={{ marginTop: 'auto', paddingTop: 24 }}>
            <PrimaryBtn label="Continue to PIN" onClick={handlePhone} t={t} />
          </div>
        </div>
      )}

      {step === 'pin' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 4 }}>
            <p style={{ fontSize: 15, color: t.label3 }}>Sending to <strong style={{ color: t.label }}>{phone}</strong></p>
          </div>
          <PinPad value={pin} onChange={setPin} onDone={() => {}} t={t} label={`Confirm ₦${selectedPlan?.price.toLocaleString()} with PIN`} />
        </div>
      )}

      {step === 'processing' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 40 }}>
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 40, background: t.accentBg, animation: 'ring 1.2s ease-out infinite' }} />
            <div style={{ width: 80, height: 80, borderRadius: 40, background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.Wifi />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: t.label }}>Processing Purchase</p>
            <p style={{ fontSize: 15, color: t.label3, marginTop: 8 }}>Delivering {selectedPlan?.data} data to {phone}...</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: t.accent, animation: `fadeIn 0.6s ${i * 0.2}s ease infinite alternate` }} />
            ))}
          </div>
        </div>
      )}

      {step === 'receipt' && receipt && (
        <div className="slide-left" style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Success badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingBottom: 8 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 36,
              background: `${t.green}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'hap 0.3s ease',
            }}>
              <div style={{ width: 56, height: 56, borderRadius: 28, background: t.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon.Check />
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: t.label }}>Data Sent!</p>
              <p style={{ fontSize: 15, color: t.label3, marginTop: 4 }}>Your purchase was successful</p>
            </div>
          </div>

          {/* Receipt card */}
          <div style={{ background: t.surface, borderRadius: 20, overflow: 'hidden', border: `1px solid ${t.border}` }}>
            <div style={{ padding: '14px 16px', background: t.surface2, borderBottom: `1px solid ${t.separator}` }}>
              <p style={{ fontSize: 13, color: t.label3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Transaction Receipt</p>
            </div>
            {[
              { label: 'Data Bundle', value: `${selectedPlan?.data} (${selectedPlan?.validity})` },
              { label: 'Network', value: network },
              { label: 'Delivered To', value: phone },
              { label: 'Amount Paid', value: `₦${selectedPlan?.price.toLocaleString()}`, highlight: true },
              { label: 'Cashback Earned', value: `₦${(selectedPlan!.price * 0.02).toFixed(2)}`, green: true },
              { label: 'Status', value: 'Delivered ✅', green: true },
              { label: 'Reference', value: receipt.transaction?.tx_ref || '—' },
            ].map((row, i, arr) => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', padding: '12px 16px',
                borderBottom: i < arr.length - 1 ? `1px solid ${t.separator}` : 'none',
              }}>
                <span style={{ fontSize: 14, color: t.label3 }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: row.highlight || row.green ? 700 : 500, color: row.green ? t.green : row.highlight ? t.label : t.label2 }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <PrimaryBtn label="Done" onClick={onDone} t={t} />
        </div>
      )}
    </div>
  );
}

// ─── STORE SCREEN ─────────────────────────────────────────────────────────
function StoreScreen({
  agent, onBack, t,
}: {
  agent: Agent;
  onBack: () => void;
  t: typeof light;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);
  const [step, setStep] = useState<'list' | 'detail' | 'pin' | 'processing' | 'receipt'>('list');
  const [pin, setPin] = useState('');
  const [receipt, setReceipt] = useState<any>(null);
  const [deliveryState, setDeliveryState] = useState('');
  const { toast, show } = useToast();

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(() => show('Failed to load products', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (pin.length === 4 && step === 'pin') handlePurchase();
  }, [pin, step]);

  const handlePurchase = async () => {
    setStep('processing');
    try {
      const res = await fetch('/api/agent/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentPhone: agent.phone,
          pin,
          type: 'ecommerce',
          productId: selected!.id,
          deliveryState,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Purchase failed');
      setReceipt(data);
      setStep('receipt');
    } catch (e: any) {
      show(e.message, 'error');
      setPin('');
      setStep('detail');
    }
  };

  if (step === 'processing') return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 40, minHeight: '100dvh', background: t.bg }}>
      <div className="spinner spinner-blue" style={{ width: 44, height: 44, borderWidth: 4 }} />
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 20, fontWeight: 700, color: t.label }}>Processing Order</p>
        <p style={{ fontSize: 15, color: t.label3, marginTop: 6 }}>Please wait...</p>
      </div>
    </div>
  );

  if (step === 'receipt' && receipt) return (
    <div className="screen" style={{ minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column' }}>
      <NavHeader title="Order Confirmed" t={t} />
      <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: 36, background: `${t.green}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: t.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Icon.Check />
            </div>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: t.label }}>Order Placed!</p>
        </div>
        <div style={{ background: t.surface, borderRadius: 16, overflow: 'hidden' }}>
          {[
            { label: 'Product', value: selected?.name || '' },
            { label: 'Amount', value: `₦${selected?.price.toLocaleString()}`, highlight: true },
            { label: 'Delivery State', value: deliveryState },
            { label: 'Status', value: 'Order Received', green: true },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${t.separator}` : 'none' }}>
              <span style={{ fontSize: 14, color: t.label3 }}>{row.label}</span>
              <span style={{ fontSize: 14, fontWeight: row.highlight || row.green ? 700 : 500, color: row.green ? t.green : row.highlight ? t.label : t.label2 }}>{row.value}</span>
            </div>
          ))}
        </div>
        <PrimaryBtn label="Done" onClick={onBack} t={t} />
      </div>
    </div>
  );

  return (
    <div className="screen" style={{ minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column', paddingBottom: 90 }}>
      {toast && <Toast {...toast} t={t} />}
      <NavHeader title="Store" onBack={step !== 'list' ? () => { setStep('list'); setSelected(null); } : onBack} t={t} />

      {step === 'list' && (
        <div style={{ padding: '0 20px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner spinner-blue" /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {products.map((p) => (
                <button key={p.id} onClick={() => { setSelected(p); setStep('detail'); }} className="tappable" style={{
                  borderRadius: 16, overflow: 'hidden', background: t.surface,
                  border: `1px solid ${t.border}`, textAlign: 'left',
                }}>
                  <div style={{ aspectRatio: '1', background: t.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.image ? (
                      <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Icon.ShoppingBag />
                    )}
                  </div>
                  <div style={{ padding: '12px 12px 14px' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: t.label, lineHeight: 1.3 }}>{p.name}</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: t.accent, marginTop: 4 }}>₦{p.price.toLocaleString()}</p>
                    {!p.inStock && <p style={{ fontSize: 11, color: t.red, marginTop: 2 }}>Out of stock</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 'detail' && selected && (
        <div className="slide-left" style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ borderRadius: 16, overflow: 'hidden', background: t.surface, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {selected.image ? (
              <img src={selected.image} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ color: t.label3 }}><Icon.ShoppingBag /></div>
            )}
          </div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: t.label }}>{selected.name}</h2>
            {selected.description && <p style={{ color: t.label3, fontSize: 15, marginTop: 8, lineHeight: 1.5 }}>{selected.description}</p>}
            <p style={{ fontSize: 32, fontWeight: 800, color: t.accent, marginTop: 12 }}>₦{selected.price.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ fontSize: 15, color: t.label2, marginBottom: 8, fontWeight: 500 }}>Delivery State:</p>
            <Input value={deliveryState} onChange={setDeliveryState} placeholder="e.g. Lagos, Kano, Abuja" t={t} />
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 12 }}>
            <PrimaryBtn label={`Buy for ₦${selected.price.toLocaleString()}`} onClick={() => { if (!deliveryState.trim()) return show('Enter delivery state', 'error'); setPin(''); setStep('pin'); }} t={t} disabled={!selected.inStock} />
          </div>
        </div>
      )}

      {step === 'pin' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 20px' }}>
          <PinPad value={pin} onChange={setPin} onDone={() => {}} t={t} label={`Confirm ₦${selected?.price.toLocaleString()} with PIN`} />
        </div>
      )}
    </div>
  );
}

// ─── EARNINGS SCREEN ─────────────────────────────────────────────────────
function EarningsScreen({ agent, onBack, t }: { agent: Agent; onBack: () => void; t: typeof light }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/agent/cashback?phone=${agent.phone}`)
      .then((r) => r.json())
      .then((d) => setHistory(d.entries || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [agent.phone]);

  return (
    <div className="screen" style={{ minHeight: '100dvh', background: t.bg, paddingBottom: 90 }}>
      <NavHeader title="Earnings" onBack={onBack} t={t} />

      {/* Summary cards */}
      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Available', value: `₦${agent.cashbackBalance.toFixed(2)}`, color: t.green, icon: '💰' },
          { label: 'Lifetime Earned', value: `₦${agent.totalCashbackEarned?.toFixed(2) || '0.00'}`, color: t.accent, icon: '📈' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: t.surface, borderRadius: 16, padding: '18px 16px', border: `1px solid ${t.border}` }}>
            <p style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</p>
            <p style={{ fontSize: 13, color: t.label3, marginTop: 4 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Info card */}
      <div style={{ padding: '0 20px', marginBottom: 24 }}>
        <div style={{ padding: '16px', borderRadius: 16, background: t.accentBg }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: t.accent, marginBottom: 4 }}>How Cashback Works</p>
          <p style={{ fontSize: 13, color: t.label3, lineHeight: 1.6 }}>
            You earn 2% cashback on every data and store purchase. Your cashback accumulates automatically and can be redeemed to your wallet balance.
          </p>
        </div>
      </div>

      {/* History */}
      <div style={{ padding: '0 20px' }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: t.label, marginBottom: 14 }}>Cashback History</p>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner spinner-blue" /></div>
        ) : history.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', background: t.surface, borderRadius: 16 }}>
            <p style={{ color: t.label3 }}>No cashback yet. Make a purchase to start earning!</p>
          </div>
        ) : (
          <div style={{ background: t.surface, borderRadius: 16, overflow: 'hidden' }}>
            {history.map((entry, i) => (
              <div key={entry.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', borderBottom: i < history.length - 1 ? `1px solid ${t.separator}` : 'none',
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: t.label, textTransform: 'capitalize' }}>{entry.type}</p>
                  <p style={{ fontSize: 12, color: t.label3, marginTop: 2 }}>{entry.description || '—'}</p>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: entry.type === 'earned' ? t.green : t.red }}>
                  {entry.type === 'earned' ? '+' : '-'}₦{entry.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────
function ProfileScreen({
  agent, onBack, onLogout, onNavigate, isDark, toggleTheme, t,
}: {
  agent: Agent;
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (s: Screen) => void;
  isDark: boolean;
  toggleTheme: () => void;
  t: typeof light;
}) {
  return (
    <div className="screen" style={{ background: t.bg, minHeight: '100dvh', paddingBottom: 90 }}>
      <NavHeader title="Profile" t={t} rightAction={
        <button onClick={toggleTheme} className="tappable" style={{ background: 'none', color: t.accent }}>
          {isDark ? <Icon.Sun /> : <Icon.Moon />}
        </button>
      } />

      {/* Profile header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 28px', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Avatar name={`${agent.firstName} ${agent.lastName}`} size={84} t={t} />
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 26, height: 26, borderRadius: 13,
            background: t.green, border: `2px solid ${t.bg}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: t.label, letterSpacing: -0.8 }}>{agent.firstName} {agent.lastName}</p>
          <p style={{ fontSize: 15, color: t.label3, marginTop: 4 }}>{agent.phone}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '5px 12px', borderRadius: 20, background: t.accentBg }}>
            <div style={{ width: 7, height: 7, borderRadius: 4, background: t.green }} />
            <span style={{ fontSize: 13, color: t.accent, fontWeight: 600 }}>Active Member</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
          {[
            { label: 'Balance', value: `₦${agent.balance.toLocaleString()}` },
            { label: 'Cashback', value: `₦${agent.cashbackBalance.toFixed(0)}` },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 17, fontWeight: 800, color: t.label }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: t.label3, marginTop: 2 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Account section */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: t.label3, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4 }}>Account</p>
        <div style={{ background: t.surface, borderRadius: 16, overflow: 'hidden', border: `1px solid ${t.border}` }}>
          <ListItem icon={<Icon.User />} label="Account Details" onPress={() => onNavigate('profile_account')} t={t} />
          <ListItem icon={<Icon.Wallet />} label="Wallet & Payments" value={`₦${agent.balance.toLocaleString()}`} onPress={() => onNavigate('earnings')} t={t} />
          <ListItem icon={<Icon.TrendingUp />} label="Earnings & Cashback" onPress={() => onNavigate('earnings')} t={t} showSeparator={false} />
        </div>
      </div>

      {/* App section */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: t.label3, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4 }}>App</p>
        <div style={{ background: t.surface, borderRadius: 16, overflow: 'hidden', border: `1px solid ${t.border}` }}>
          <ListItem icon={<Icon.Bell />} label="Notifications" onPress={() => onNavigate('notifications')} t={t} />
          <ListItem icon={isDark ? <Icon.Sun /> : <Icon.Moon />} label={isDark ? 'Light Mode' : 'Dark Mode'} onPress={toggleTheme} t={t} />
          <ListItem icon={<Icon.ShoppingBag />} label="Transaction History" onPress={() => onNavigate('transactions')} t={t} showSeparator={false} />
        </div>
      </div>

      {/* Security section */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: t.label3, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4 }}>Security</p>
        <div style={{ background: t.surface, borderRadius: 16, overflow: 'hidden', border: `1px solid ${t.border}` }}>
          <ListItem icon={<Icon.Lock />} label="Change PIN" onPress={() => onNavigate('profile_security')} t={t} />
          <ListItem icon={<Icon.Settings />} label="Privacy Settings" t={t} showSeparator={false} />
        </div>
      </div>

      {/* Support section */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: t.label3, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4 }}>Support</p>
        <div style={{ background: t.surface, borderRadius: 16, overflow: 'hidden', border: `1px solid ${t.border}` }}>
          <ListItem icon={<Icon.HelpCircle />} label="Help & Support" onPress={() => onNavigate('support')} t={t} />
          <ListItem icon={<Icon.Bell />} label="About SaukiMart" t={t} value="v1.0.0" showSeparator={false} />
        </div>
      </div>

      {/* Logout */}
      <div style={{ padding: '0 20px', marginBottom: 8 }}>
        <button onClick={onLogout} className="tappable" style={{
          width: '100%', padding: '16px', borderRadius: 16,
          background: `${t.red}12`, border: `1px solid ${t.red}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          color: t.red, fontSize: 16, fontWeight: 600,
        }}>
          <Icon.LogOut /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── TRANSACTIONS SCREEN ─────────────────────────────────────────────────
function TransactionsScreen({ agent, onBack, t }: { agent: Agent; onBack: () => void; t: typeof light }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const q = filter !== 'all' ? `&status=${filter}` : '';
    fetch(`/api/transactions/list?agentPhone=${agent.phone}${q}`)
      .then((r) => r.json())
      .then((d) => setTransactions(d.transactions || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [agent.phone, filter]);

  const filters = ['all', 'delivered', 'pending', 'failed'];
  const getIcon = (type: string) => type === 'data' ? <Icon.Wifi /> : <Icon.ShoppingBag />;
  const getIconBg = (type: string) => type === 'data' ? { bg: '#E5F1FF', color: '#007AFF' } : { bg: '#FFE5F1', color: '#FF2D55' };

  return (
    <div className="screen" style={{ background: t.bg, minHeight: '100dvh', paddingBottom: 90 }}>
      <NavHeader title="Transactions" onBack={onBack} t={t} />

      {/* Filter chips */}
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="tappable" style={{
            padding: '7px 14px', borderRadius: 20, flexShrink: 0,
            background: filter === f ? t.accent : t.surface,
            color: filter === f ? '#fff' : t.label2,
            fontSize: 13, fontWeight: 600,
            border: `1px solid ${filter === f ? t.accent : t.border}`,
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner spinner-blue" /></div>
      ) : transactions.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: t.label3 }}>No transactions found</p>
        </div>
      ) : (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {transactions.map((tx) => {
            const { bg, color } = getIconBg(tx.type);
            return (
              <div key={tx.id} style={{
                background: t.surface, borderRadius: 14, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14,
                border: `1px solid ${t.border}`,
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getIcon(tx.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: t.label }}>
                    {tx.dataPlan ? `${tx.dataPlan.data} Data` : tx.product?.name || tx.type}
                  </p>
                  <p style={{ fontSize: 12, color: t.label3, marginTop: 2 }}>
                    {new Date(tx.createdAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: t.red }}>-₦{tx.amount.toLocaleString()}</p>
                  <p style={{ fontSize: 11, marginTop: 2, fontWeight: 600, textTransform: 'capitalize', color: { delivered: t.green, paid: t.orange, pending: t.orange, failed: t.red }[tx.status] || t.label3 }}>
                    {tx.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SUPPORT SCREEN ───────────────────────────────────────────────────────
function SupportScreen({ agent, onBack, t }: { agent: Agent; onBack: () => void; t: typeof light }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast, show } = useToast();

  const handleSubmit = async () => {
    if (!message.trim()) return show('Please describe your issue', 'error');
    setLoading(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: agent.phone, message }),
      });
      if (!res.ok) throw new Error('Failed to submit ticket');
      setSent(true);
    } catch (e: any) { show(e.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="screen" style={{ background: t.bg, minHeight: '100dvh' }}>
      {toast && <Toast {...toast} t={t} />}
      <NavHeader title="Help & Support" onBack={onBack} t={t} />

      {sent ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: 36, background: `${t.green}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: t.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon.Check /></div>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: t.label, textAlign: 'center' }}>Ticket Submitted!</p>
          <p style={{ fontSize: 15, color: t.label3, textAlign: 'center' }}>Our team will respond within 24 hours.</p>
          <PrimaryBtn label="Back to Profile" onClick={onBack} t={t} />
        </div>
      ) : (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: t.label3, fontSize: 15 }}>Describe your issue and we'll get back to you within 24 hours.</p>
          <div style={{ background: t.surface, borderRadius: 16, border: `1px solid ${t.border}` }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue..."
              rows={6}
              style={{
                width: '100%', padding: '16px', fontSize: 16, color: t.label,
                background: 'transparent', fontFamily: 'inherit', resize: 'none',
                caretColor: t.accent,
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '💬 WhatsApp', href: 'https://wa.me/2348061934056', color: '#25D366' },
              { label: '📧 Email', href: 'mailto:saukidatalinks@gmail.com', color: t.accent },
            ].map((c) => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" style={{
                padding: '14px 20px', borderRadius: 14, background: t.surface,
                border: `1px solid ${t.border}`, color: c.color, fontSize: 16, fontWeight: 600, textDecoration: 'none',
                display: 'flex', justifyContent: 'center',
              }}>{c.label}</a>
            ))}
          </div>

          <PrimaryBtn label="Submit Ticket" onClick={handleSubmit} loading={loading} t={t} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN APP COMPONENT
// ─────────────────────────────────────────────────────────────────────────
export default function AppPage() {
  const { isDark, toggle, t } = useTheme();
  const [screen, setScreen] = useState<Screen>('splash');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'store' | 'earnings' | 'profile'>('home');

  // Persist agent session
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('sm_agent') : null;
    if (saved) {
      try { setAgent(JSON.parse(saved)); setScreen('home'); } catch {}
    }
  }, []);

  const handleLogin = (a: Agent) => {
    setAgent(a);
    localStorage.setItem('sm_agent', JSON.stringify(a));
    setScreen('home');
    setActiveTab('home');
  };

  const handleLogout = () => {
    setAgent(null);
    localStorage.removeItem('sm_agent');
    setScreen('entry');
  };

  const navigate = (s: Screen) => {
    setScreen(s);
    if (['home', 'store', 'earnings', 'profile'].includes(s)) {
      setActiveTab(s as typeof activeTab);
    }
  };

  const showBottomNav = agent && ['home', 'store', 'earnings', 'profile', 'transactions', 'notifications'].includes(screen);

  return (
    <div className="app-root">
      <GlobalStyle t={t} />
      <StatusBar t={t} isDark={isDark} />

      {screen === 'splash' && <SplashScreen onDone={() => setScreen(agent ? 'home' : 'entry')} t={t} />}
      {screen === 'entry' && <EntryScreen onRegister={() => setScreen('register')} onLogin={() => setScreen('login')} onPayg={() => setScreen('payg_select')} t={t} />}
      {screen === 'register' && <RegisterScreen onBack={() => setScreen('entry')} onSuccess={handleLogin} t={t} />}
      {screen === 'login' && <LoginScreen onBack={() => setScreen('entry')} onSuccess={handleLogin} t={t} />}
      {(screen === 'payg_select' || screen === 'payg_phone' || screen === 'payg_payment') && (
        <PaygFlow onBack={() => setScreen('entry')} onDone={() => setScreen('entry')} t={t} />
      )}

      {agent && (
        <>
          {screen === 'home' && <HomeScreen agent={agent} onNavigate={navigate} isDark={isDark} toggleTheme={toggle} t={t} />}
          {screen === 'buy_data' && <BuyDataScreen agent={agent} onBack={() => setScreen('home')} onDone={() => { setScreen('home'); setActiveTab('home'); }} t={t} />}
          {screen === 'store' && <StoreScreen agent={agent} onBack={() => setScreen('home')} t={t} />}
          {screen === 'earnings' && <EarningsScreen agent={agent} onBack={() => setScreen('home')} t={t} />}
          {screen === 'profile' && <ProfileScreen agent={agent} onBack={() => setScreen('home')} onLogout={handleLogout} onNavigate={navigate} isDark={isDark} toggleTheme={toggle} t={t} />}
          {screen === 'transactions' && <TransactionsScreen agent={agent} onBack={() => setScreen('profile')} t={t} />}
          {screen === 'support' && <SupportScreen agent={agent} onBack={() => setScreen('profile')} t={t} />}
          {screen === 'profile_security' && (
            <div className="screen" style={{ background: t.bg, minHeight: '100dvh' }}>
              <NavHeader title="Change PIN" onBack={() => setScreen('profile')} t={t} />
              <div style={{ padding: '20px', textAlign: 'center', color: t.label3 }}>
                <p style={{ fontSize: 15 }}>PIN change feature — contact support to reset your PIN for security.</p>
                <div style={{ marginTop: 24 }}>
                  <a href="https://wa.me/2348061934056" target="_blank" rel="noopener noreferrer" style={{ color: t.accent, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>Contact Support →</a>
                </div>
              </div>
            </div>
          )}
          {screen === 'profile_account' && (
            <div className="screen" style={{ background: t.bg, minHeight: '100dvh', paddingBottom: 90 }}>
              <NavHeader title="Account Details" onBack={() => setScreen('profile')} t={t} />
              <div style={{ padding: '0 20px' }}>
                <div style={{ background: t.surface, borderRadius: 16, overflow: 'hidden', border: `1px solid ${t.border}` }}>
                  {[
                    { label: 'First Name', value: agent.firstName },
                    { label: 'Last Name', value: agent.lastName },
                    { label: 'Phone', value: agent.phone },
                    { label: 'Account Number', value: agent.flwAccountNumber || '—' },
                    { label: 'Bank', value: agent.flwBankName || '—' },
                    { label: 'Account Name', value: agent.flwAccountName || '—' },
                    { label: 'Member Since', value: new Date(agent.createdAt).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' }) },
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${t.separator}` : 'none' }}>
                      <span style={{ fontSize: 14, color: t.label3 }}>{row.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: t.label }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {screen === 'notifications' && (
            <div className="screen" style={{ background: t.bg, minHeight: '100dvh' }}>
              <NavHeader title="Notifications" onBack={() => setScreen('home')} t={t} />
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 40, marginBottom: 16 }}>🔔</p>
                <p style={{ color: t.label, fontSize: 18, fontWeight: 700 }}>You're all caught up!</p>
                <p style={{ color: t.label3, fontSize: 15, marginTop: 8 }}>No new notifications</p>
              </div>
            </div>
          )}
        </>
      )}

      {showBottomNav && agent && (
        <BottomNav
          active={activeTab}
          onNavigate={(s) => { setScreen(s); setActiveTab(s as typeof activeTab); }}
          t={t}
        />
      )}
    </div>
  );
}
