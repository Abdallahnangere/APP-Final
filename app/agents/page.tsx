'use client';
import { useEffect, useState } from 'react';

export default function AgentsLandingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  useEffect(() => { fetch('/api/data-plans').then(r => r.json()).then(d => setPlans(Array.isArray(d) ? d.slice(0,6) : [])).catch(() => {}); }, []);

  return (
    <div style={{ fontFamily: 'DM Sans, system-ui, sans-serif', color: '#1C1C1E', background: '#fff' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Playfair+Display:wght@900&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Nav */}
      <nav style={{ padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5E5EA' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#007AFF,#0040FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#1C1C1E' }}>SaukiMart</span>
        </a>
        <a href="/app" style={{ background: '#007AFF', color: '#fff', borderRadius: 22, padding: '9px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Register as Agent →</a>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(160deg,#F0F7FF,#fff)', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,204,0,.12)', border: '1px solid rgba(255,204,0,.25)', borderRadius: 20, padding: '5px 14px', marginBottom: 20 }}>
          <span>⭐</span><span style={{ fontSize: 12.5, fontWeight: 700, color: '#B8860B' }}>Earn While You Sleep</span>
        </div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 52, fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 20 }}>
          Become a SaukiMart<br /><span style={{ color: '#007AFF' }}>Agent Today</span>
        </h1>
        <p style={{ fontSize: 18, color: '#6C6C70', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Start your own data reselling business. Register for free, fund your wallet, and earn 2% cashback on every single sale.
        </p>
        <a href="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#007AFF', color: '#fff', borderRadius: 14, padding: '16px 32px', fontSize: 16, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,122,255,.35)' }}>
          Register Free — Takes 2 Minutes →
        </a>
      </section>

      {/* Steps */}
      <section style={{ padding: '60px 24px', background: '#F2F2F7' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 900, marginBottom: 48, letterSpacing: -0.8 }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { n: '1', title: 'Register', desc: 'Create account with your name, phone & 4-digit PIN', icon: '👤' },
              { n: '2', title: 'Get Account', desc: 'Receive your personal virtual bank account instantly', icon: '🏦' },
              { n: '3', title: 'Fund Wallet', desc: 'Transfer money to your virtual account to load wallet', icon: '💰' },
              { n: '4', title: 'Earn Cashback', desc: 'Buy data and earn 2% cashback on every transaction', icon: '🎁' },
            ].map(s => (
              <div key={s.n} style={{ background: '#fff', borderRadius: 20, padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 26, background: '#007AFF', color: '#fff', fontWeight: 900, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>{s.n}</div>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#6C6C70', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available plans */}
      {plans.length > 0 && (
        <section style={{ padding: '60px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 900, marginBottom: 12, letterSpacing: -0.8 }}>Sample Agent Prices</h2>
            <p style={{ textAlign: 'center', color: '#6C6C70', marginBottom: 36 }}>Best rates for MTN, Airtel & Glo data bundles</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {plans.map(p => (
                <div key={p.id} style={{ background: '#F2F2F7', borderRadius: 16, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: p.network === 'MTN' ? '#B8860B' : p.network === 'AIRTEL' ? '#C00' : '#006010', background: p.network === 'MTN' ? '#FFF3CD' : p.network === 'AIRTEL' ? '#FFE0E0' : '#DCFFE4', padding: '2px 8px', borderRadius: 10 }}>{p.network}</span>
                    <p style={{ fontSize: 18, fontWeight: 900, marginTop: 8, letterSpacing: -0.3 }}>{p.data}</p>
                    <p style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>{p.validity}</p>
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 900, color: '#007AFF' }}>₦{p.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <a href="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#007AFF', color: '#fff', borderRadius: 14, padding: '14px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
                Start Selling These Plans →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ background: '#F2F2F7', borderTop: '1px solid #E5E5EA', padding: '24px', textAlign: 'center', color: '#8E8E93', fontSize: 13 }}>
        <p>© {new Date().getFullYear()} SaukiMart · <a href="/privacy" style={{ color: '#007AFF' }}>Privacy Policy</a> · <a href="mailto:support@saukimart.online" style={{ color: '#007AFF' }}>Support</a></p>
      </footer>
    </div>
  );
}
