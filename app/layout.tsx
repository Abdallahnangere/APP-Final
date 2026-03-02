import type { Metadata, Viewport } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'SaukiMart — Fast Data & Mobile Services', template: '%s | SaukiMart' },
  description: 'Buy MTN, Airtel & Glo data bundles instantly. SMEDAN-certified. Over 10,000 happy customers. Best prices guaranteed.',
  keywords: ['buy data nigeria', 'mtn data', 'airtel data', 'glo data', 'cheapest data plans', 'saukimart'],
  authors: [{ name: 'SaukiMart' }],
  metadataBase: new URL(`https://${process.env.NEXT_PUBLIC_DOMAIN || 'www.saukimart.online'}`),
  openGraph: {
    title: 'SaukiMart — Fast Data & Mobile Services',
    description: 'Instant data delivery for MTN, Airtel & Glo. Register as an agent and earn 2% cashback.',
    url: `https://${process.env.NEXT_PUBLIC_DOMAIN || 'www.saukimart.online'}`,
    siteName: 'SaukiMart',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'SaukiMart', description: 'Instant Nigerian data bundles' },
  manifest: '/manifest.json',
  icons: { icon: '/icon.png', apple: '/apple-touch-icon.png' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#007AFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SaukiMart" />
      </head>
      <body className={`${dmSans.className} antialiased`}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/firebase-messaging-sw.js')
                    .then(reg => console.log('[SW] Registered'))
                    .catch(err => console.log('[SW] Error:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
