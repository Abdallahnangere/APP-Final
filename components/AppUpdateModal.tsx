'use client';

import { useEffect, useRef } from 'react';
import { useAppVersion } from '@/hooks/useAppVersion';

export default function AppUpdateModal() {
  const { isLoading, needsForceUpdate, playStoreUrl } = useAppVersion();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!needsForceUpdate) return;

    // Block body scroll
    document.body.style.overflow = 'hidden';

    // Prevent ESC from dismissing
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault();
    };
    window.addEventListener('keydown', handleKeyDown, true);

    // Auto-focus the update button
    buttonRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [needsForceUpdate]);

  if (isLoading || !needsForceUpdate) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="update-heading"
      aria-describedby="update-description"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0D0D1A',
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
          padding: '40px',
          maxWidth: '360px',
          width: '90%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Logo */}
        <span
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#C9A84C',
            letterSpacing: '-0.5px',
          }}
        >
          SaukiMart
        </span>

        {/* Heading */}
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
          Update Required
        </h1>

        {/* Subtext */}
        <p
          id="update-description"
          style={{
            fontSize: '15px',
            color: '#AAAAAA',
            lineHeight: 1.6,
            textAlign: 'center',
            margin: 0,
          }}
        >
          You are using an outdated version of SaukiMart. Please download the latest version (4.2) to continue.
        </p>

        {/* Update button */}
        <button
          ref={buttonRef}
          onClick={() => window.open(playStoreUrl, '_blank')}
          style={{
            width: '100%',
            background: '#C9A84C',
            color: '#0D0D1A',
            fontWeight: 700,
            fontSize: '16px',
            borderRadius: '10px',
            padding: '14px 32px',
            border: 'none',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          Update to Version 4.2
        </button>

        {/* Fine print */}
        <p
          style={{
            fontSize: '12px',
            color: '#666666',
            textAlign: 'center',
            margin: 0,
          }}
        >
          This update is required to continue using SaukiMart.
        </p>
      </div>
    </div>
  );
}
