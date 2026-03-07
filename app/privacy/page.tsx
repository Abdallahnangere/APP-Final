'use client';
import { useState } from 'react';

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    {
      id: '1',
      title: '1. Information We Collect',
      body: 'We collect your full name, phone number, and transaction history solely to provide our services. When you register, we create a virtual bank account on your behalf using Flutterwave\'s infrastructure. We do not sell, rent, or trade your personal information to any third parties. Additional data collected includes device identifiers (for fraud prevention) and usage analytics to improve our platform.',
    },
    {
      id: '2',
      title: '2. How We Use Your Information',
      body: 'Your data is used exclusively to: (a) process data bundle and product purchases; (b) credit and debit your SaukiMart wallet; (c) generate branded transaction receipts; (d) provide customer support; (e) send important service notifications; and (f) comply with Nigerian financial regulations. We will never use your data for advertising or share it with unauthorized parties.',
    },
    {
      id: '3',
      title: '3. Data Security',
      body: 'All 6-digit PINs are encrypted using bcryptjs with a minimum of 10 salt rounds — they are never stored in plain text. Payment processing is handled exclusively by Flutterwave, a PCI-DSS Level 1 certified payment processor. All data in transit is protected by TLS 1.3 encryption. Our Neon PostgreSQL database is hosted with enterprise-grade security on Vercel infrastructure.',
    },
    {
      id: '4',
      title: '4. Third-Party Services',
      body: 'SaukiMart integrates with: (a) Flutterwave — for virtual account creation and payment processing; (b) Amigo — for data bundle delivery to MTN, Glo, and Airtel subscribers; (c) Vercel — for hosting and database services; (d) Vercel Blob — for secure image storage. Each third-party service operates under its own privacy policies and security standards.',
    },
    {
      id: '5',
      title: '5. Data Retention',
      body: 'Transaction records are retained for a minimum of 7 years to comply with Nigerian financial regulations (FIRS, CBN). Support chat messages are automatically deleted after 7 days. Account data is retained for as long as your account is active. Upon account deletion request, personal data is anonymized within 30 days, while financial records are retained for regulatory compliance.',
    },
    {
      id: '6',
      title: '6. Your Rights',
      body: 'You have the right to: (a) access your personal data at any time through the app; (b) correct inaccurate information in your profile; (c) request deletion of your account and personal data; (d) opt out of non-essential communications; (e) lodge a complaint with the Nigeria Data Protection Commission (NDPC). To exercise these rights, contact us at support@saukimart.online.',
    },
    {
      id: '7',
      title: '7. Cookies & Local Storage',
      body: 'SaukiMart uses minimal browser localStorage only to maintain your login session token. We do not use tracking cookies, advertising cookies, or third-party analytics cookies. No persistent tracking occurs. Session data is cleared when you sign out. Our web application does not use cookies in the traditional sense — all state is managed through secure, expiring JWT tokens.',
    },
    {
      id: '8',
      title: '8. Children\'s Privacy',
      body: 'SaukiMart services are intended for users aged 18 and above. We do not knowingly collect personal information from minors. If we become aware that a user under 18 has registered, we will promptly delete their account and associated data. Parents or guardians who believe their child has registered should contact us immediately at support@saukimart.online.',
    },
    {
      id: '9',
      title: '9. Changes to This Policy',
      body: 'We may update this Privacy Policy periodically to reflect changes in our services or applicable laws. When we make significant changes, we will notify you via the app\'s marquee broadcast system and, where possible, via direct notification. Your continued use of SaukiMart after changes are posted constitutes your acceptance of the revised policy.',
    },
    {
      id: '10',
      title: '10. Contact Us',
      body: 'For privacy concerns, data requests, or complaints, contact us at:\n\nEmail: support@saukimart.online\nWhatsApp: +234 704 464 7081\nPhone: +234 806 193 4056\n\nWe commit to responding to all privacy-related inquiries within 72 hours.',
    },
  ];

  return (
    <div style={{ fontFamily: '-apple-system, "SF Pro Display", "SF Pro Text", BlinkMacSystemFont, system-ui, sans-serif', color: '#1D1D1F', background: '#F5F5F7', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        @media(max-width:768px){.layout{grid-template-columns:1fr!important}.sidebar{display:none!important}}
      `}</style>

      {/* Header */}
      <header style={{ background: 'rgba(245,245,247,0.72)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 50, padding: '0 22px', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0071E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>S</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: 16, color: '#1D1D1F' }}>SaukiMart</span>
        </a>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0071E3', fontSize: 14, fontWeight: 500 }}>← Back</a>
      </header>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0071E3 0%,#0053BE 100%)', padding: '80px 22px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 20, letterSpacing: 0.05, display: 'inline-block', marginBottom: 16 }}>LEGAL</span>
          <h1 style={{ fontFamily: '-apple-system, "SF Pro Display", BlinkMacSystemFont, system-ui, sans-serif', fontSize: 56, fontWeight: 700, color: '#fff', letterSpacing: -0.003, marginBottom: 16 }}>Privacy Policy</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 18, lineHeight: 1.6, maxWidth: 560 }}>
            SaukiMart is committed to protecting your privacy. This policy explains exactly how we collect, use, and safeguard your data.
          </p>
          <div style={{ display: 'flex', gap: 20, marginTop: 32, flexWrap: 'wrap' }}>
            {[['Updated', 'March 2026'], ['Standard', 'NDPC Compliant'], ['Version', '2.0']].map(([k, v]) => (
              <div key={k} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 16px' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600 }}>{k}</p>
                <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginTop: 4 }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, alignItems: 'start' }} className="layout">
        {/* Sidebar TOC */}
        <div style={{ position: 'sticky', top: 80 }} className="sidebar">
          <p style={{ fontSize: 12, fontWeight: 700, color: '#8E8E93', letterSpacing: .5, marginBottom: 14 }}>TABLE OF CONTENTS</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sections.map(s => (
              <button key={s.id} onClick={() => { setActiveSection(s.id); document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 10, fontSize: 13, fontWeight: activeSection === s.id ? 700 : 500, color: activeSection === s.id ? '#007AFF' : '#6C6C70', background: activeSection === s.id ? 'rgba(0,122,255,.08)' : 'transparent', border: 'none', cursor: 'pointer', transition: 'all .15s' }}>
                {s.title.split('. ')[0]}. {s.title.split('. ')[1]?.split(' ').slice(0, 3).join(' ')}…
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div>
          {sections.map((s, i) => (
            <div key={s.id} id={`section-${s.id}`} style={{ marginBottom: 40, paddingBottom: 40, borderBottom: i < sections.length - 1 ? '1px solid #E5E5EA' : 'none' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1E', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,122,255,.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#007AFF', flexShrink: 0 }}>{s.id}</span>
                {s.title.replace(`${s.id}. `, '')}
              </h2>
              <p style={{ color: '#3C3C43', fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-line' }}>{s.body}</p>
            </div>
          ))}

          {/* Contact card */}
          <div style={{ background: 'linear-gradient(135deg,#007AFF,#0040FF)', borderRadius: 20, padding: '32px', marginTop: 8 }}>
            <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Questions about your privacy?</h3>
            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>Our team responds to all privacy inquiries within 72 hours.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="mailto:support@saukimart.online" style={{ background: '#fff', color: '#007AFF', borderRadius: 12, padding: '12px 20px', fontWeight: 700, fontSize: 14 }}>📧 Email Us</a>
              <a href="https://wa.me/2347044647081" target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', borderRadius: 12, padding: '12px 20px', fontWeight: 700, fontSize: 14 }}>💬 WhatsApp</a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#1C1C1E', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>© {new Date().getFullYear()} SaukiMart: Data & Devices · <a href="/privacy" style={{ color: '#007AFF' }}>Privacy Policy</a> · <a href="/" style={{ color: 'rgba(255,255,255,.4)' }}>Home</a></p>
      </footer>
    </div>
  );
}
