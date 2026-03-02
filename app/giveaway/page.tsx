'use client';
import { useState } from 'react';

export default function GiveawayPage() {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!/^[0-9]{10,11}$/.test(phone)) return setError('Enter a valid Nigerian phone number');
    setLoading(true);
    try {
      // Giveaway entry via support ticket
      await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message: 'Giveaway entry request' }),
      });
      setSubmitted(true);
    } catch { setError('Submission failed. Try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#1C1C1E,#000)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;800;900&display=swap');*{box-sizing:border-box}`}</style>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎁</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,204,0,.12)', border: '1px solid rgba(255,204,0,.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 20 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#FFCC00' }}>Limited Time Giveaway</span>
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: -1.2, lineHeight: 1.1, marginBottom: 16 }}>Win Free<br />Data Bundles!</h1>
        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
          Enter your phone number to participate in our monthly giveaway. Winners receive free data worth ₦5,000!
        </p>
        {submitted ? (
          <div style={{ background: 'rgba(52,199,89,.1)', border: '1px solid rgba(52,199,89,.3)', borderRadius: 16, padding: '28px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3 style={{ color: '#34C759', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>You're In!</h3>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14 }}>
              You've been entered into the giveaway. We'll contact you at {phone} if you win. Good luck! 🍀
            </p>
            <a href="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#007AFF', color: '#fff', borderRadius: 12, padding: '12px 22px', fontSize: 14, fontWeight: 700, textDecoration: 'none', marginTop: 20 }}>
              Go to App →
            </a>
          </div>
        ) : (
          <div>
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setError(''); }}
              placeholder="08012345678"
              style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '1.5px solid rgba(255,255,255,.1)', borderRadius: 14, padding: '16px 20px', color: '#fff', fontSize: 18, fontFamily: 'DM Sans,monospace', letterSpacing: 2, textAlign: 'center', marginBottom: 12 }}
            />
            {error && <p style={{ color: '#FF3B30', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button
              onClick={submit}
              disabled={loading || !phone}
              style={{ width: '100%', background: loading ? 'rgba(255,204,0,.5)' : '#FFCC00', color: '#000', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 900, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .2s' }}
            >
              {loading ? 'Entering...' : 'Enter Giveaway 🎉'}
            </button>
            <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 12, marginTop: 16 }}>
              No spam. We only contact winners. T&Cs apply.
            </p>
          </div>
        )}
        <a href="/" style={{ display: 'block', color: 'rgba(255,255,255,.3)', fontSize: 13, marginTop: 32, textDecoration: 'none' }}>← Back to SaukiMart</a>
      </div>
    </div>
  );
}
