import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const AppUpdateModal = dynamic(() => import('@/components/AppUpdateModal'), { ssr: false });

export const metadata: Metadata = {
  title: 'SaukiMart — Instant Data, Airtime & Devices',
  description: 'Buy MTN, Airtel & Glo data bundles instantly. Quality devices, competitive prices, trusted service.',
  keywords: 'data bundle, MTN data, Airtel data, Glo data, Nigeria, instant delivery, mobile data',
  metadataBase: new URL('https://www.saukimart.online'),
  authors: [{ name: 'SaukiMart', url: 'https://www.saukimart.online' }],
  creator: 'SaukiMart',
  publisher: 'SaukiMart',
  robots: 'index, follow',
  openGraph: {
    title: 'SaukiMart — Instant Data, Airtime & Devices',
    description: 'Nigeria\'s fastest digital commerce platform. Instant data delivery, best prices, secure payments.',
    url: 'https://www.saukimart.online',
    siteName: 'SaukiMart',
    locale: 'en_NG',
    images: [{ url: '/images/logo.png', width: 256, height: 256, alt: 'SaukiMart Logo' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaukiMart — Instant Data & Devices',
    description: 'Buy data bundles instantly. Trusted by thousands.',
    creator: '@SaukiMart',
    images: ['/images/logo.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SaukiMart',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Playfair+Display:wght@700;900&display=swap');
          
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
          
          :root{
            --bg-light:#F5F5F7;
            --bg-dark:#000000;
            --card-light:#FFFFFF;
            --card-dark:#1D1D1F;
            --text-light:#1D1D1F;
            --text-dark:#F5F5F7;
            --text-secondary:#6E6E73;
            --accent:#007AFF;
            --accent-hover:#0056D6;
            --border-light:rgba(0,0,0,0.08);
            --border-dark:rgba(255,255,255,0.08);
            --color-green:#34C759;
            --color-red:#FF3B30;
          }
          
          html{scroll-behavior:smooth}
          
          body{
            font-family:'DM Sans',system-ui,sans-serif;
            background:var(--bg-light);
            color:var(--text-light);
            -webkit-font-smoothing:antialiased;
            -moz-osx-font-smoothing:grayscale;
            text-rendering:optimizeLegibility;
          }
          
          input,button,textarea,select{font-family:inherit;outline:none}
          button{border:none;cursor:pointer;background:none}
          a{color:inherit;text-decoration:none}
          
          ::-webkit-scrollbar{width:8px;height:8px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:#D5D5D7;border-radius:4px}
          ::-webkit-scrollbar-thumb:hover{background:#A1A1A6}
          
          @keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
          @keyframes slideInDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
          
          .fade-in-up{animation:fadeInUp 0.7s cubic-bezier(0.25,0.1,0.25,1) forwards}
          .fade-in{animation:fadeIn 0.6s cubic-bezier(0.25,0.1,0.25,1) forwards}
          .slide-in-down{animation:slideInDown 0.4s cubic-bezier(0.25,0.1,0.25,1) forwards}
          
          @supports (backdrop-filter: blur(20px)){
            .glass{backdrop-filter:blur(20px) saturate(180%)}
          }
        `}</style>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0071E3" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="description" content="Nigeria's premium data reseller platform. Instant delivery, best prices, trusted by thousands." />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <AppUpdateModal />
        {children}
      </body>
    </html>
  );
}
