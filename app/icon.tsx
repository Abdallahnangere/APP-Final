import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import path from 'path';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  const logoPath = path.join(process.cwd(), 'public/images/logo-icon.png');
  const logoData = readFileSync(logoPath);
  const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 7,
          overflow: 'hidden',
          background: '#0071E3',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoBase64} alt="" width={32} height={32} style={{ objectFit: 'contain' }} />
      </div>
    ),
    { width: 32, height: 32 },
  );
}
