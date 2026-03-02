'use client';

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px', fontFamily: 'DM Sans, system-ui, sans-serif', color: '#1C1C1E', lineHeight: 1.8 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');*{box-sizing:border-box}`}</style>
      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#007AFF', fontSize: 14, fontWeight: 600, marginBottom: 32, textDecoration: 'none' }}>← Back to Home</a>
      <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: -1, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: '#8E8E93', fontSize: 14, marginBottom: 40 }}>Last updated: January 2025</p>

      {[
        ['1. Information We Collect', 'We collect your phone number, name, and transaction history to provide our services. We do not sell your personal information to third parties.'],
        ['2. How We Use Your Information', 'Your information is used to process transactions, provide customer support, send transaction notifications, and improve our services.'],
        ['3. Data Security', 'All PINs are encrypted using bcryptjs with 10 salt rounds. Payment data is processed securely through Flutterwave, a PCI-DSS compliant payment processor.'],
        ['4. Third-Party Services', 'We use Flutterwave for payment processing, Amigo for data delivery, and Firebase for push notifications. Each operates under their own privacy policies.'],
        ['5. Data Retention', 'Transaction records are retained for regulatory compliance. You may request deletion of your account data by contacting support.'],
        ['6. Your Rights', 'You have the right to access, correct, or delete your personal data. Contact us at support@saukimart.online to exercise these rights.'],
        ['7. Cookies', 'We use minimal browser storage (localStorage) only to maintain your login session. We do not use tracking cookies.'],
        ['8. Contact', 'For privacy concerns, contact us at support@saukimart.online or via WhatsApp.'],
      ].map(([title, body]) => (
        <div key={title as string} style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #E5E5EA' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{title}</h2>
          <p style={{ color: '#3C3C43', fontSize: 15 }}>{body}</p>
        </div>
      ))}
    </div>
  );
}
