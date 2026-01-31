'use client';

import dynamic from 'next/dynamic';

// Dynamically import the AgentHub (client-only)
const AgentHub = dynamic(() => import('../../components/screens/Agent').then(mod => mod.AgentHub), { ssr: false });

export default function Page() {
  return <AgentHub />;
}
