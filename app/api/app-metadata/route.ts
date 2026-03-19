import { NextRequest, NextResponse } from 'next/server';

const METADATA = {
  latestVersionCode: 14,
  latestVersionName: '4.2',
  minimumVersionCode: 14,
  forceUpdateBelow: 14,
  playStoreUrl: 'https://play.google.com/store/apps/details?id=online.saukimart.twa',
  releaseNotes: 'Important update with new features and security improvements.',
  maintenanceMode: false,
  maintenanceMessage: '',
} as const;

const RESPONSE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Access-Control-Allow-Origin': '*',
};

export function GET(req: NextRequest): NextResponse {
  const userAgent = req.headers.get('user-agent') ?? '(none)';
  const appVersion = req.headers.get('x-app-version') ?? '(none)';
  console.log(`[app-metadata] GET | User-Agent: ${userAgent} | X-App-Version: ${appVersion}`);

  return NextResponse.json(METADATA, { headers: RESPONSE_HEADERS });
}

export function OPTIONS(req: NextRequest): NextResponse {
  const userAgent = req.headers.get('user-agent') ?? '(none)';
  const appVersion = req.headers.get('x-app-version') ?? '(none)';
  console.log(`[app-metadata] OPTIONS | User-Agent: ${userAgent} | X-App-Version: ${appVersion}`);

  return new NextResponse(null, {
    status: 200,
    headers: {
      ...RESPONSE_HEADERS,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-App-Version',
    },
  });
}
