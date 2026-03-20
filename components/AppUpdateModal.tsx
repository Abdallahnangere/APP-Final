'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAppVersion } from '@/hooks/useAppVersion';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=online.saukimart.twa';
const DISMISSED_KEY = 'sm_update_dismissed';

export default function AppUpdateModal() {
  const pathname = usePathname();
  const isAppRoute = pathname?.startsWith('/app') ?? false;
  const { latestVersionName } = useAppVersion();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const safeVersionName = (latestVersionName || '4.2').trim();

  const checkAndShow = useCallback(() => {
    if (!isAppRoute || typeof window === 'undefined') return;
    const hasSession = Boolean(localStorage.getItem('sm_token'));
    const dismissed = localStorage.getItem(DISMISSED_KEY) === '1';
    if (hasSession && !dismissed) setVisible(true);
  }, [isAppRoute]);

  useEffect(() => {
    setMounted(true);
    checkAndShow();
    window.addEventListener('sm-login-success', checkAndShow);
    return () => window.removeEventListener('sm-login-success', checkAndShow);
  }, [checkAndShow]);

  const dismiss = useCallback((andUpdate?: boolean) => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
    if (andUpdate) window.open(PLAY_STORE_URL, '_blank');
  }, []);

  if (!mounted || !isAppRoute || !visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upd-heading"
      onClick={() => dismiss()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,.55)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 0 env(safe-area-inset-bottom)',
        animation: 'fadeIn .22s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'linear-gradient(160deg,#0E1B33 0%,#0A1221 100%)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: '24px 24px 0 0',
          padding: '10px 20px 28px',
          animation: 'slideUp .28s cubic-bezier(.32,1,.38,1)',
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.18)', margin: '0 auto 20px' }} />

        {/* Icon + title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <img src="/images/logo-icon.png" alt="SaukiMart" width={42} height={42} style={{ borderRadius: 12, flexShrink: 0 }} />
          <div>
            <p id="upd-heading" style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-.2px' }}>
              Update Available
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', margin: 0 }}>Version {safeVersionName} is ready</p>
          </div>
          <button
            onClick={() => dismiss()}
            aria-label="Dismiss"
            style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            ×
          </button>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {['🤖 AI Support', '📲 Transfers', '🔔 Smart Alerts', '✨ New UI'].map(f => (
            <span key={f} style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.75)', background: 'rgba(255,255,255,.08)', borderRadius: 999, padding: '5px 11px', border: '1px solid rgba(255,255,255,.1)' }}>{f}</span>
          ))}
        </div>

        {/* Update button */}
        <button
          onClick={() => dismiss(true)}
          style={{ width: '100%', height: 50, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#0047CC,#0071E3)', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', letterSpacing: '-.1px', boxShadow: '0 8px 24px rgba(0,71,204,.4)' }}
        >
          Update Now
        </button>
        <button
          onClick={() => dismiss()}
          style={{ width: '100%', height: 40, borderRadius: 12, border: 'none', background: 'none', color: 'rgba(255,255,255,.4)', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
