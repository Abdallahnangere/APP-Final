'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAppVersion } from '@/hooks/useAppVersion';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=online.saukimart.twa';

export default function AppUpdateModal() {
  const pathname = usePathname();
  const isAppRoute = pathname?.startsWith('/app') ?? false;
  const { latestVersionName } = useAppVersion();
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const safeVersionName = (latestVersionName || '4.2').trim();
  const versionStorageKey = `sm_update_notice_seen_${safeVersionName.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const checkAndShowNotice = useCallback(() => {
    if (!isAppRoute || typeof window === 'undefined') {
      setVisible(false);
      return;
    }

    const hasSession = Boolean(localStorage.getItem('sm_token'));
    const hasSeen = localStorage.getItem(versionStorageKey) === '1';

    if (hasSession && !hasSeen) {
      localStorage.setItem(versionStorageKey, '1');
      setVisible(true);
      return;
    }

    setVisible(false);
  }, [isAppRoute, versionStorageKey]);

  useEffect(() => {
    checkAndShowNotice();

    const handleLoginSuccess = () => checkAndShowNotice();
    window.addEventListener('sm-login-success', handleLoginSuccess);

    return () => {
      window.removeEventListener('sm-login-success', handleLoginSuccess);
    };
  }, [checkAndShowNotice]);

  useEffect(() => {
    if (!visible) return;

    // Block body scroll
    document.body.style.overflow = 'hidden';

    // Auto-focus the update badge button when notice opens
    buttonRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  if (!isAppRoute || !visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-heading"
      aria-describedby="update-description"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(13,13,26,.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#1A1A2E',
          border: '1px solid #C9A84C',
          borderRadius: '16px',
          padding: '28px',
          maxWidth: '520px',
          width: '94%',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <span
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#C9A84C',
            letterSpacing: '-0.5px',
            textAlign: 'center',
          }}
        >
          SaukiMart
        </span>

        <h1
          id="update-heading"
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#FFFFFF',
            margin: 0,
            textAlign: 'center',
          }}
        >
          New Version Available on Play Store
        </h1>

        <p
          id="update-description"
          style={{
            fontSize: '14px',
            color: '#AAAAAA',
            lineHeight: 1.6,
            textAlign: 'left',
            margin: 0,
            whiteSpace: 'pre-line',
          }}
        >
          {'Sauki Mart just got a major upgrade. Here\'s what\'s new:\n🤖 AI Support — 24/7, Instant\nGet help anytime without waiting. Our new in-app AI assistant handles complaints, answers questions, and resolves issues around the clock — no human queue, no delays.\n📲 User-to-User Transfers\nSend money directly to any Sauki Mart user in seconds. Fast, seamless, and built right into your wallet.\n🔔 Smart Alert System\nStay in the loop with real-time notifications for transactions, transfers, promotions, and account activity — so you never miss a beat.\n✨ Refreshed UI & UX\nA cleaner, faster, and more intuitive experience from top to bottom. Everything feels smoother, looks sharper, and works better.'}
        </p>

        <p style={{ margin: 0, color: '#8A93AA', fontSize: 13, textAlign: 'center' }}>
          Tap the official Play Store badge to update to version {safeVersionName} and continue.
        </p>

        <button
          ref={buttonRef}
          onClick={() => {
            window.open(PLAY_STORE_URL, '_blank');
            setVisible(false);
          }}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
            margin: '0 auto',
            display: 'inline-flex',
            alignSelf: 'center',
          }}
          aria-label="Update from Google Play"
        >
          <img
            src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
            alt="Get it on Google Play"
            style={{ width: 'min(320px, 80vw)', height: 'auto' }}
          />
        </button>
      </div>
    </div>
  );
}
