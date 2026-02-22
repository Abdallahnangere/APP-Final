'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const NETWORKS = [
  { value: 'MTN', label: 'MTN', color: '#FFC300' },
  { value: 'GLO', label: 'GLO', color: '#006633' },
  { value: 'AIRTEL', label: 'Airtel', color: '#E40000' },
  { value: '9MOBILE', label: '9mobile', color: '#006E51' },
];

// ── Islamic Geometry SVG Patterns ────────────────────────────────────────────

const IslamicStar = ({ size = 80, opacity = 0.12, className = '' }: { size?: number; opacity?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={{ opacity }}>
    <g fill="#B8860B" stroke="none">
      {/* 8-pointed Islamic star */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <polygon
          key={i}
          points="50,18 54,38 72,38 58,50 64,68 50,58 36,68 42,50 28,38 46,38"
          transform={`rotate(${deg} 50 50)`}
          fillOpacity={0.5}
        />
      ))}
      <polygon points="50,18 54,38 72,38 58,50 64,68 50,58 36,68 42,50 28,38 46,38" />
    </g>
  </svg>
);

const GeometricPattern = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 pointer-events-none">
    <defs>
      <pattern id="islamic-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        {/* Interlocking geometric tile */}
        <g stroke="#C9A84C" strokeWidth="0.6" fill="none" opacity="0.35">
          <polygon points="40,4 76,20 76,60 40,76 4,60 4,20" />
          <polygon points="40,14 66,24 66,56 40,66 14,56 14,24" />
          <line x1="40" y1="4" x2="40" y2="14" />
          <line x1="76" y1="20" x2="66" y2="24" />
          <line x1="76" y1="60" x2="66" y2="56" />
          <line x1="40" y1="76" x2="40" y2="66" />
          <line x1="4" y1="60" x2="14" y2="56" />
          <line x1="4" y1="20" x2="14" y2="24" />
          <circle cx="40" cy="40" r="6" />
          <circle cx="40" cy="40" r="12" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#islamic-grid)" />
  </svg>
);

const MoonCrescent = ({ className = '' }: { className?: string }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" className={className} fill="none">
    <path
      d="M24 6 C16 6 10 12 10 20 C10 32 20 42 32 42 C38 42 43 39 46 34 C40 36 34 34 30 30 C24 24 22 15 24 6Z"
      fill="#C9A84C"
      opacity="0.9"
    />
    <circle cx="36" cy="12" r="3" fill="#C9A84C" opacity="0.7" />
  </svg>
);

// ── Custom Dropdown ───────────────────────────────────────────────────────────

type Network = { value: string; label: string; color: string };

function NetworkDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = NETWORKS.find((n) => n.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all duration-300 text-left bg-white/70 backdrop-blur-sm',
          open
            ? 'border-[#C9A84C] shadow-[0_0_0_4px_rgba(201,168,76,0.15)]'
            : 'border-stone-200 hover:border-[#C9A84C]/50'
        )}
      >
        <span className="flex items-center gap-3">
          {selected ? (
            <>
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: selected.color }}
              />
              <span className="text-stone-800 font-medium text-sm">{selected.label}</span>
            </>
          ) : (
            <span className="text-stone-400 text-sm">Select your network</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-stone-400 transition-transform duration-300',
            open && 'rotate-180 text-[#C9A84C]'
          )}
        />
      </button>

      {/* Dropdown Panel */}
      <div
        className={cn(
          'absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-stone-100 rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-300 origin-top',
          open ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
        )}
      >
        {NETWORKS.map((net, i) => (
          <button
            key={net.value}
            type="button"
            onClick={() => { onChange(net.value); setOpen(false); }}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors duration-150',
              i !== NETWORKS.length - 1 && 'border-b border-stone-50',
              value === net.value ? 'bg-[#fdf8ec]' : 'hover:bg-stone-50'
            )}
          >
            <span className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: net.color }}
              />
              <span className={cn('text-sm font-medium', value === net.value ? 'text-[#B8860B]' : 'text-stone-700')}>
                {net.label}
              </span>
            </span>
            {value === net.value && <Check className="w-4 h-4 text-[#C9A84C]" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function GiveawayPage() {
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');

    if (!/^0[789][01]\d{8}$/.test(phone)) {
      setErrorMsg('Please enter a valid 11-digit Nigerian phone number.');
      return;
    }
    if (!network) {
      setErrorMsg('Please select your network provider.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/giveaway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, network }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #fdfaf4 0%, #fef9ee 40%, #fdf6e3 100%)' }}
    >

      {/* Background geometric pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GeometricPattern />
      </div>

      {/* Decorative corner stars */}
      <IslamicStar size={160} opacity={0.07} className="absolute -top-8 -left-8" />
      <IslamicStar size={120} opacity={0.06} className="absolute -bottom-6 -right-6" />
      <IslamicStar size={80}  opacity={0.05} className="absolute top-1/4 right-4" />
      <IslamicStar size={64}  opacity={0.05} className="absolute bottom-1/3 left-2" />

      {/* Card */}
      <div className="relative w-full max-w-md z-10">

        {/* Thin gold top border line */}
        <div className="h-0.5 w-full rounded-t-3xl" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />

        <div className="bg-white/75 backdrop-blur-xl rounded-b-3xl rounded-tr-3xl border border-stone-100/80 shadow-[0_32px_80px_rgba(0,0,0,0.08)] px-8 py-10 sm:px-10">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
              <MoonCrescent />
              <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
            </div>

            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-2" style={{ color: '#C9A84C' }}>
              Ramadan Kareem
            </p>

            {status !== 'success' ? (
              <>
                <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 leading-tight tracking-tight mb-3">
                  Saukimart<br />
                  <span style={{ background: 'linear-gradient(90deg, #C9A84C, #8B6914)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Giveaway
                  </span>
                </h1>
                <p className="text-stone-500 text-sm leading-relaxed max-w-xs mx-auto">
                  Enter your phone number for a chance to win this blessed season. One winner. Real prize.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-stone-900 mb-2">You're entered!</h1>
                <p className="text-stone-500 text-sm">May this Ramadan bring you blessings — and perhaps a prize too.</p>
              </>
            )}
          </div>

          {/* Decorative divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-stone-100" />
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1L10.5 7H16.5L11.5 10.5L13 16.5L9 13L5 16.5L6.5 10.5L1.5 7H7.5L9 1Z" fill="#C9A84C" opacity="0.5"/>
            </svg>
            <div className="h-px flex-1 bg-stone-100" />
          </div>

          {status === 'success' ? (
            /* ── Success State ── */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #fef8e7, #fdeec4)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-stone-400 text-xs uppercase tracking-widest mt-2">Entry confirmed</p>
              <p className="text-stone-500 text-sm mt-3">
                We'll reach out on <span className="font-semibold text-stone-700">{phone}</span> if you win. Keep your phone nearby.
              </p>
            </div>
          ) : (
            /* ── Form ── */
            <div className="space-y-5">
              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="08012345678"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className={cn(
                    'w-full px-4 py-3.5 rounded-2xl border-2 bg-white/70 backdrop-blur-sm text-stone-800 text-sm font-medium placeholder:text-stone-300 outline-none transition-all duration-300',
                    'focus:border-[#C9A84C] focus:shadow-[0_0_0_4px_rgba(201,168,76,0.15)]',
                    'border-stone-200 hover:border-stone-300'
                  )}
                />
              </div>

              {/* Network */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
                  Network Provider
                </label>
                <NetworkDropdown value={network} onChange={setNetwork} />
              </div>

              {/* Error */}
              {errorMsg && (
                <p className="text-red-500 text-xs text-center bg-red-50 rounded-xl py-2.5 px-4">
                  {errorMsg}
                </p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={status === 'loading'}
                className={cn(
                  'w-full py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2',
                  status === 'loading'
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
                )}
                style={{
                  background: status === 'loading'
                    ? '#d4b06a'
                    : 'linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)',
                  color: '#fff',
                  boxShadow: status === 'loading' ? 'none' : '0 8px 32px rgba(139,105,20,0.35)',
                }}
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  'Enter the Giveaway'
                )}
              </button>

              <p className="text-center text-[11px] text-stone-300 tracking-wide">
                Saukimart · One entry per number · Ramadan 2025
              </p>
            </div>
          )}
        </div>

        {/* Bottom decorative line */}
        <div className="h-0.5 w-3/4 mx-auto rounded-b-full" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C44, transparent)' }} />
      </div>
    </div>
  );
}
