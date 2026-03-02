'use client';
import { useState, useEffect, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
type Plan = { id: string; network: string; data: string; validity: string; price: number };

// ── Inline styles + font import ────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Playfair+Display:wght@700;900&display=swap');

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --blue:#007AFF;--green:#34C759;--red:#FF3B30;--orange:#FF9500;
      --gold:#D4AF37;--bg:#F2F2F7;--card:#fff;--text:#1C1C1E;
      --sub:#6C6C70;--border:#E5E5EA;
    }
    html{scroll-behavior:smooth}
    body{font-family:'DM Sans',system-ui,sans-serif;background:#fff;color:var(--text);-webkit-font-smoothing:antialiased}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:2px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    .fade-up{opacity:0;animation:fadeUp .6s cubic-bezier(.32,.72,0,1) both}
    .float{animation:float 4s ease-in-out infinite}
    a{text-decoration:none;color:inherit}
    button{border:none;cursor:pointer;font-family:inherit}
    img{max-width:100%;display:block}
  `}</style>
);

// ── Components ─────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, transition: 'all .3s', background: scrolled ? 'rgba(255,255,255,.88)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(0,0,0,.06)' : 'none' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#007AFF,#0040FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#1C1C1E', letterSpacing: -0.4 }}>SaukiMart</span>
        </a>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {['Data Plans','Store','Agents','Support'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(' ','-')}`} style={{ fontSize: 14, fontWeight: 500, color: '#3C3C43', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#007AFF')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3C3C43')}
            >{l}</a>
          ))}
          <a href="/app" style={{ background: '#007AFF', color: '#fff', borderRadius: 22, padding: '9px 20px', fontSize: 14, fontWeight: 600, transition: 'all .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0056D6'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#007AFF'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
          >Open App →</a>
        </div>
      </div>
    </nav>
  );
}

function Ticker() {
  const items = ['⚡ Instant Data Delivery', '✅ MTN · Airtel · Glo', '🎁 2% Cashback for Agents', '🔒 SMEDAN Certified', '💳 Bank Transfer Payments', '⚡ 10,000+ Happy Customers', '📦 Quality Devices & SIMs'];
  const doubled = [...items, ...items];
  return (
    <div style={{ background: '#007AFF', overflow: 'hidden', height: 36, display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 60, whiteSpace: 'nowrap', animation: 'ticker 28s linear infinite' }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: 0.3 }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function Hero({ plans }: { plans: Plan[] }) {
  return (
    <section style={{ paddingTop: 120, paddingBottom: 80, background: 'linear-gradient(160deg,#F0F7FF 0%,#fff 60%)', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
        {/* Left */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(0,122,255,.08)', border: '1px solid rgba(0,122,255,.15)', borderRadius: 20, padding: '5px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 12 }}>✅</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#007AFF' }}>SMEDAN Certified Business</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 54, fontWeight: 900, lineHeight: 1.1, color: '#1C1C1E', letterSpacing: -1.5, marginBottom: 20 }}>
            Fast Data,<br /><span style={{ color: '#007AFF' }}>Better Prices</span>
          </h1>
          <p style={{ fontSize: 17, color: '#6C6C70', lineHeight: 1.7, maxWidth: 420, marginBottom: 32 }}>
            Buy MTN, Airtel & Glo data bundles instantly. No delays, no hassle. Register as an agent and earn 2% cashback on every purchase.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
            <a href="/app" style={{ background: '#007AFF', color: '#fff', borderRadius: 14, padding: '14px 28px', fontSize: 16, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all .2s', boxShadow: '0 4px 20px rgba(0,122,255,.35)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,122,255,.45)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,122,255,.35)'; }}
            >Buy Data Now <span style={{ fontSize: 20 }}>→</span></a>
            <a href="#agents" style={{ background: '#fff', color: '#1C1C1E', borderRadius: 14, padding: '14px 28px', fontSize: 16, fontWeight: 600, border: '1.5px solid #E5E5EA', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all .2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#007AFF'; (e.currentTarget as HTMLElement).style.color = '#007AFF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E5EA'; (e.currentTarget as HTMLElement).style.color = '#1C1C1E'; }}
            >Become an Agent</a>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {[['10K+','Happy Users'],['₦50M+','Processed'],['< 3s','Avg Delivery']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1C1C1E', letterSpacing: -0.5 }}>{v}</div>
                <div style={{ fontSize: 12.5, color: '#8E8E93', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Phone mockup */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div className="float" style={{ width: 280, background: '#1C1C1E', borderRadius: 44, padding: '12px', boxShadow: '0 40px 80px rgba(0,0,0,.25)', position: 'relative' }}>
            {/* Screen */}
            <div style={{ background: '#000', borderRadius: 34, overflow: 'hidden', height: 560 }}>
              {/* Status bar */}
              <div style={{ background: '#000', padding: '14px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>9:41</span>
                <div style={{ width: 80, height: 22, background: '#1C1C1E', borderRadius: 12 }} />
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontSize: 10 }}>████</span>
                  <span style={{ color: '#fff', fontSize: 10 }}>📶</span>
                </div>
              </div>
              {/* App content */}
              <div style={{ background: 'linear-gradient(160deg,#0040FF,#007AFF)', padding: '20px 18px 24px' }}>
                <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 11, fontWeight: 500, marginBottom: 4 }}>Welcome back, Abubakar!</p>
                <p style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>₦ 24,500.00</p>
                <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, marginTop: 4 }}>Wallet Balance</p>
                <div style={{ background: 'rgba(255,255,255,.12)', borderRadius: 10, padding: '10px 12px', marginTop: 14 }}>
                  <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 10 }}>Account Number</p>
                  <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: 1 }}>3080 2098 92</p>
                  <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 10, marginTop: 2 }}>Access Bank</p>
                </div>
              </div>
              <div style={{ background: '#F2F2F7', padding: '16px', flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#8E8E93', marginBottom: 12 }}>QUICK SERVICES</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[{icon:'📱',label:'Buy Data',color:'#E8F0FE'},{icon:'📦',label:'Store',color:'#E8FAE8'},{icon:'💰',label:'Earnings',color:'#FFF3E0'},{icon:'👤',label:'Profile',color:'#FBE9E7'}].map(s => (
                    <div key={s.label} style={{ background: s.color, borderRadius: 14, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 20 }}>{s.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1C1C1E' }}>{s.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14 }}>
                  {[{n:'MTN 2GB',p:'₦500',s:'delivered'},{n:'Airtel 5GB',p:'₦1,000',s:'delivered'}].map((tx,i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 1 ? '1px solid rgba(0,0,0,.06)' : 'none' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📱</div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#1C1C1E' }}>{tx.n}</p>
                          <p style={{ fontSize: 10, color: '#8E8E93' }}>✓ {tx.s}</p>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#34C759' }}>{tx.p}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Floating badges */}
          {[
            { top: '10%', right: '-24%', bg: '#E8FAE8', icon: '✅', label: 'Instant Delivery' },
            { top: '55%', right: '-20%', bg: '#FFF3E0', icon: '🎁', label: '2% Cashback' },
            { top: '80%', left: '-22%', bg: '#E8F0FE', icon: '🔒', label: '100% Secure' },
          ].map((b,i) => (
            <div key={i} style={{ position: 'absolute', ...b, display: 'flex', alignItems: 'center', gap: 8, background: b.bg, borderRadius: 50, padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,.1)', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 16 }}>{b.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1C1C1E' }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Plans({ plans }: { plans: Plan[] }) {
  const [net, setNet] = useState('MTN');
  const filtered = plans.filter(p => p.network === net);
  const nets = [{ id: 'MTN', color: '#FFCC00', emoji: '🟡' }, { id: 'AIRTEL', color: '#E40000', emoji: '🔴' }, { id: 'GLO', color: '#00892C', emoji: '🟢' }];

  return (
    <section id="data-plans" style={{ padding: '80px 24px', background: '#F2F2F7' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 900, color: '#1C1C1E', letterSpacing: -1 }}>Data Plans</h2>
          <p style={{ color: '#6C6C70', fontSize: 17, marginTop: 10 }}>Cheapest data bundles — delivered instantly</p>
          {/* Network tabs */}
          <div style={{ display: 'inline-flex', gap: 8, marginTop: 28, background: '#fff', borderRadius: 16, padding: 6, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
            {nets.map(n => (
              <button key={n.id} onClick={() => setNet(n.id)} style={{ padding: '10px 24px', borderRadius: 11, border: 'none', fontWeight: 700, fontSize: 14, transition: 'all .2s', background: net === n.id ? '#007AFF' : 'transparent', color: net === n.id ? '#fff' : '#6C6C70' }}>
                {n.emoji} {n.id}
              </button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8E8E93', padding: '40px 0' }}>No plans available — check back soon.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filtered.map(p => (
              <a href="/app" key={p.id} style={{ background: '#fff', borderRadius: 20, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,.06)', border: '1.5px solid transparent', transition: 'all .2s', display: 'block' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#007AFF'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,122,255,.15)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,.06)'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F0F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: 22 }}>📱</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#1C1C1E', letterSpacing: -0.8 }}>{p.data}</div>
                <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>Valid {p.validity}</div>
                <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#007AFF' }}>₦{p.price.toLocaleString()}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#34C759', background: '#E8FAE8', padding: '3px 9px', borderRadius: 20 }}>Buy →</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: '⚡', title: 'Instant Delivery', desc: 'Data delivered in under 3 seconds on average. No waiting, no delays.', color: '#FFF3E0' },
    { icon: '🔒', title: 'Bank-Grade Security', desc: 'All transactions secured with SHA-256 encryption and Flutterwave.', color: '#E8F0FE' },
    { icon: '🎁', title: '2% Cashback', desc: 'Agents earn 2% cashback on every purchase redeemable to wallet.', color: '#E8FAE8' },
    { icon: '🏦', title: 'Virtual Account', desc: 'Get a personal virtual account for easy wallet funding at registration.', color: '#FBE9E7' },
    { icon: '📦', title: 'Device Store', desc: 'Buy quality devices, SIM cards, and data bundles in one place.', color: '#F3E8FF' },
    { icon: '💬', title: '24/7 Support', desc: 'WhatsApp and email support available around the clock.', color: '#E8FAE8' },
  ];
  return (
    <section style={{ padding: '80px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 900, color: '#1C1C1E', letterSpacing: -1 }}>Why SaukiMart?</h2>
          <p style={{ color: '#6C6C70', fontSize: 17, marginTop: 10 }}>Everything you need in one platform</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {features.map(f => (
            <div key={f.title} style={{ background: f.color, borderRadius: 24, padding: 28, transition: 'transform .2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1C1C1E', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#3C3C43', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentsSection() {
  return (
    <section id="agents" style={{ padding: '80px 24px', background: 'linear-gradient(135deg,#1C1C1E 0%,#000 100%)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,204,0,.1)', border: '1px solid rgba(255,204,0,.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 12 }}>⭐</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#FFCC00' }}>Agent Program</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 44, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: -1, marginBottom: 20 }}>Earn Money<br />Reselling Data</h2>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
            Register as a SaukiMart agent, fund your wallet, and start reselling data bundles to customers. Earn 2% cashback on every purchase.
          </p>
          {['Free registration — no startup cost', '2% cashback on every transaction', 'Personal virtual bank account for funding', 'Real-time balance and transaction tracking', 'Priority customer support 24/7'].map(b => (
            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, color: '#fff' }}>✓</div>
              <span style={{ color: 'rgba(255,255,255,.8)', fontSize: 15 }}>{b}</span>
            </div>
          ))}
          <a href="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#FFCC00', color: '#000', borderRadius: 14, padding: '14px 28px', fontSize: 15, fontWeight: 800, marginTop: 28, transition: 'all .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(255,204,0,.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          >Register as Agent →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Active Agents', value: '1,200+', icon: '👥', bg: 'rgba(255,255,255,.05)' },
            { label: 'Avg Monthly Earnings', value: '₦12K+', icon: '💰', bg: 'rgba(52,199,89,.08)' },
            { label: 'Data Plans', value: '50+', icon: '📱', bg: 'rgba(0,122,255,.08)' },
            { label: 'Cashback Paid', value: '₦2M+', icon: '🎁', bg: 'rgba(255,204,0,.08)' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: '24px 20px' }}>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <p style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginTop: 12, letterSpacing: -0.8 }}>{s.value}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { name: 'Abubakar M.', loc: 'Kano', rating: 5, text: "SaukiMart has changed my hustle completely. I make over ₦15k monthly just reselling data bundles. The cashback is real!" },
    { name: 'Fatima A.', loc: 'Lagos', rating: 5, text: "Fastest data delivery I've ever experienced. Bought 2GB for my friend and it arrived in seconds. Highly recommend." },
    { name: 'Ibrahim K.', loc: 'Abuja', rating: 5, text: "The virtual account feature is genius. I just tell customers to send money there and I purchase instantly. Super convenient." },
    { name: 'Halima B.', loc: 'Kaduna', rating: 5, text: "Best prices for Glo data in Nigeria. I've compared many platforms and SaukiMart consistently beats them all." },
  ];
  return (
    <section style={{ padding: '80px 24px', background: '#F2F2F7' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 900, color: '#1C1C1E', letterSpacing: -1 }}>Loved by Nigerians</h2>
          <p style={{ color: '#6C6C70', fontSize: 17, marginTop: 10 }}>10,000+ customers trust SaukiMart every day</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {reviews.map(r => (
            <div key={r.name} style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.05)', transition: 'transform .2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
            >
              <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#FFCC00', fontSize: 16 }}>{s}</span>)}
              </div>
              <p style={{ fontSize: 14, color: '#3C3C43', lineHeight: 1.7, marginBottom: 16 }}>"{r.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg,#007AFF,#0040FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#1C1C1E' }}>{r.name}</p>
                  <p style={{ fontSize: 12, color: '#8E8E93' }}>{r.loc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SupportSection() {
  return (
    <section id="support" style={{ padding: '80px 24px', background: '#fff' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 42, fontWeight: 900, color: '#1C1C1E', letterSpacing: -1, marginBottom: 14 }}>Need Help?</h2>
        <p style={{ color: '#6C6C70', fontSize: 17, lineHeight: 1.7, marginBottom: 40 }}>
          Our team is available 24/7 to help you with any issues. Reach us via WhatsApp or email.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://wa.me/234XXXXXXXXXX" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#25D366', color: '#fff', borderRadius: 14, padding: '16px 28px', fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'all .2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}
          ><span style={{ fontSize: 24 }}>💬</span> WhatsApp Us</a>
          <a href="mailto:support@saukimart.online" style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F2F2F7', color: '#1C1C1E', borderRadius: 14, padding: '16px 28px', fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'all .2s', border: '1.5px solid #E5E5EA' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}
          ><span style={{ fontSize: 24 }}>📧</span> Email Support</a>
        </div>
        <p style={{ color: '#8E8E93', fontSize: 13, marginTop: 24 }}>Average response time under 30 minutes</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: '#1C1C1E', color: 'rgba(255,255,255,.6)', padding: '60px 24px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#007AFF,#0040FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>SaukiMart</span>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.8, maxWidth: 260 }}>
              Nigeria's fastest data reseller platform. Instant delivery, best prices, and 2% cashback for agents.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              {['SMEDAN Certified','Flutterwave Partner','PCI-DSS Compliant'].map(b => (
                <span key={b} style={{ fontSize: 10.5, fontWeight: 600, color: '#8E8E93', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: '4px 10px' }}>{b}</span>
              ))}
            </div>
          </div>
          {[
            { title: 'Services', links: ['Buy Data','Store','Track Order','Agent Program'] },
            { title: 'Company', links: ['About Us','Privacy Policy','Terms of Service','Contact'] },
            { title: 'Support', links: ['WhatsApp','Email Us','FAQ','Report Issue'] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{col.title}</h4>
              {col.links.map(l => (
                <a key={l} href="#" style={{ display: 'block', fontSize: 13.5, color: 'rgba(255,255,255,.5)', marginBottom: 10, transition: 'color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#007AFF')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.5)')}
                >{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 13 }}>© {new Date().getFullYear()} SaukiMart. All rights reserved.</p>
          <p style={{ fontSize: 13 }}>Built with ❤️ for Nigerians</p>
        </div>
      </div>
    </footer>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    fetch('/api/data-plans')
      .then(r => r.json())
      .then(d => setPlans(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  return (
    <>
      <GlobalStyle />
      <Ticker />
      <Nav />
      <main>
        <Hero plans={plans} />
        <Plans plans={plans} />
        <Features />
        <AgentsSection />
        <Testimonials />
        <SupportSection />
      </main>
      <Footer />
    </>
  );
}
