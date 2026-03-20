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

export default function TwitterImage() {
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
        {/* Header gradient */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            background: 'linear-gradient(140deg,#011A4D 0%,#003EAD 55%,#0071E3 100%)',
            padding: '48px 60px 36px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: -80, top: -90, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,.09)', display: 'flex' }} />

          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" width={50} height={50} style={{ borderRadius: 12, border: '1.5px solid rgba(255,255,255,.3)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>SaukiMart</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>Data &amp; Devices · Nigeria</span>
            </div>
          </div>

          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            <span style={{ fontSize: 62, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1, marginBottom: 18, letterSpacing: '-0.5px' }}>
              Instant Data.{'\n'}Premium Devices.
            </span>
            <span style={{ fontSize: 20, color: 'rgba(255,255,255,.8)', lineHeight: 1.5 }}>
              MTN · Airtel · Glo  ·  Secure wallet  ·  Instant delivery
            </span>
          </div>
        </div>

        {/* White footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FFFFFF',
            padding: '0 60px',
            height: 108,
            borderTop: '1px solid #E0ECFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {[mtn, glo, airtel].map((src, i) => (
              <div key={i} style={{ width: 44, height: 44, borderRadius: 999, background: '#F2F6FF', border: '1px solid #D6E2F9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" width={30} height={30} style={{ objectFit: 'contain' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', background: '#EEF4FF', border: '1px solid #C4D7F7', borderRadius: 12, padding: '8px 20px' }}>
            <span style={{ fontSize: 19, fontWeight: 800, color: '#0052C7' }}>saukimart.online</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
