'use client';

import dynamic from 'next/dynamic';

// Dynamically import the main App component for the web app
// This is the existing mobile app interface that was previously at /
const App = dynamic(() => import('../../App'), { ssr: false });

export default function WebAppPage() {
  return <App />;
}
