import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import path from 'path';

export const alt = 'Contact SaukiMart';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function toDataUrl(filePath: string) {
  const buf = readFileSync(filePath);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

export default function OGImage() {
  const root = process.cwd();
  const logo = toDataUrl(path.join(root, 'public/images/logo.png'));

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: 'linear-gradient(135deg,#0B72E7,#1E3A8A)', color: '#fff', padding: '56px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" width={56} height={56} style={{ borderRadius: 12 }} />
            <span style={{ fontSize: 30, fontWeight: 800 }}>SaukiMart Support</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 66, fontWeight: 900, lineHeight: 1.05 }}>Contact Us</span>
            <span style={{ marginTop: 18, fontSize: 30, opacity: 0.9 }}>Email, WhatsApp, phone and in-app help.</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
