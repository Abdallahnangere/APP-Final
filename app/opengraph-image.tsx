import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import path from 'path';

export const alt = 'SaukiMart — Instant Data, Airtime & Devices in Nigeria';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function toDataUrl(filePath: string) {
  const buf = readFileSync(filePath);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

export default function OGImage() {
  const root = process.cwd();
  const logo   = toDataUrl(path.join(root, 'public/images/logo-icon.png'));
  const mtn    = toDataUrl(path.join(root, 'public/images/mtn.png'));
  const glo    = toDataUrl(path.join(root, 'public/images/glo.png'));
  const airtel = toDataUrl(path.join(root, 'public/images/airtel.png'));

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* ── Header gradient ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            background: 'linear-gradient(140deg,#011A4D 0%,#003EAD 55%,#0071E3 100%)',
            padding: '52px 64px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: 'absolute', right: -80, top: -90, width: 340, height: 340, borderRadius: '50%', background: 'rgba(255,255,255,.09)', display: 'flex' }} />
          <div style={{ position: 'absolute', left: -60, bottom: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(0,210,255,.12)', display: 'flex' }} />

          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 44, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt="" width={54} height={54} style={{ borderRadius: 13, border: '1.5px solid rgba(255,255,255,.3)' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>SaukiMart</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.72)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>Data &amp; Devices</span>
              </div>
            </div>
            {/* TRUSTED badge */}
            <div style={{ display: 'flex', background: 'rgba(48,209,88,.18)', border: '1px solid rgba(48,209,88,.45)', borderRadius: 999, padding: '9px 20px' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#A6F6BF', letterSpacing: '0.12em' }}>TRUSTED</span>
            </div>
          </div>

          {/* Main headline */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', position: 'relative' }}>
            <span style={{ fontSize: 68, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.08, marginBottom: 22, letterSpacing: '-1px' }}>
              Instant Data.{'\n'}Premium Devices.
            </span>
            <span style={{ fontSize: 22, color: 'rgba(255,255,255,.82)', lineHeight: 1.55 }}>
              Buy MTN, Airtel &amp; Glo bundles · Secure mobile wallet · Fast delivery
            </span>
          </div>
        </div>

        {/* ── White footer ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FFFFFF',
            padding: '0 64px',
            height: 112,
            borderTop: '1px solid #E0ECFF',
          }}
        >
          {/* Network logos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {[
              { src: mtn,    alt: 'MTN' },
              { src: glo,    alt: 'GLO' },
              { src: airtel, alt: 'Airtel' },
            ].map((net) => (
              <div
                key={net.alt}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 999,
                  background: '#F2F6FF',
                  border: '1px solid #D6E2F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={net.src} alt={net.alt} width={32} height={32} style={{ objectFit: 'contain' }} />
              </div>
            ))}
            <span style={{ fontSize: 15, color: '#4B628B', marginLeft: 8 }}>MTN · Glo · Airtel</span>
          </div>

          {/* Right: tagline + URL pill */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <span style={{ fontSize: 14, color: '#6A7FA8' }}>Download on Android at</span>
            <div style={{ display: 'flex', background: '#EEF4FF', border: '1px solid #C4D7F7', borderRadius: 12, padding: '8px 20px' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#0052C7' }}>saukimart.online</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
