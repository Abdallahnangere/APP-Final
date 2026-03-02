import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SaukiMart App',
  description: 'Your SaukiMart agent app — buy data, manage wallet, earn cashback',
  manifest: '/manifest.json',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#F2F2F7' }}>
      {children}
    </div>
  );
}
