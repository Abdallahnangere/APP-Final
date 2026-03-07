import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SaukiMart — Data & Devices',
  description: 'Buy MTN, Airtel & Glo data bundles instantly. Quality devices delivered to your door.',
  metadataBase: new URL('https://www.saukimart.online'),
  openGraph: {
    title: 'SaukiMart — Data & Devices',
    description: 'Nigeria\'s fastest data reseller. Instant delivery, best prices.',
    url: 'https://www.saukimart.online',
    siteName: 'SaukiMart',
    locale: 'en_NG',
    type: 'website',
  },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#007AFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
