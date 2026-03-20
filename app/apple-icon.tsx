import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import path from 'path';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          background: 'linear-gradient(140deg,#011A4D 0%,#003EAD 55%,#0071E3 100%)',
          borderRadius: 40,
          overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoBase64} alt="" width={130} height={130} style={{ objectFit: 'contain' }} />
      </div>
    ),
    { width: 180, height: 180 },
  );
}
