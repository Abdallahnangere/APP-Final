'use client';

import { useEffect, useMemo, useState } from 'react';

type Plan = {
  id: string;
  network: string;
  dataSize?: string;
  data?: string;
  validity: string;
  price: number;
};

const NETWORKS = ['ALL', 'MTN', 'AIRTEL', 'GLO', '9MOBILE'] as const;

const PlayBadge = () => (
  <a
    href="https://play.google.com/store/apps/details?id=online.saukimart.twa"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Get it on Google Play"
    style={{ display: 'inline-flex' }}
  >
    <img
      src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
      alt="Get it on Google Play"
      style={{ width: 'min(360px, 88vw)', height: 'auto' }}
      loading="lazy"
    />
  </a>
);

const PageStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Manrope:wght@400;500;600;700;800&display=swap');

    :root{
      --bg:#F6F8FC;
      --ink:#121826;
      --ink-soft:#4E5870;
      --line:#E4EAF5;
      --card:#FFFFFF;
      --brand:#0057D9;
      --brand-deep:#003D96;
      --gold:#C9A84C;
      --mint:#1DBF9B;
      --sky:#18B8F2;
    }

    *{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{
      font-family:'Manrope',system-ui,sans-serif;
      color:var(--ink);
      background:
        radial-gradient(840px 300px at -12% -12%, rgba(0,87,217,.18), transparent 72%),
        radial-gradient(720px 280px at 110% -10%, rgba(201,168,76,.15), transparent 72%),
        var(--bg);
      -webkit-font-smoothing:antialiased;
      text-rendering:optimizeLegibility;
      overflow-x:hidden;
    }

    a{text-decoration:none;color:inherit}
    img{display:block;max-width:100%}
    .shell{max-width:1200px;margin:0 auto;padding:0 22px}

    .top-nav{
      position:fixed;top:0;left:0;right:0;z-index:120;
      background:rgba(246,248,252,.86);
      backdrop-filter:blur(12px) saturate(130%);
      border-bottom:1px solid rgba(18,24,38,.08);
    }

    .hero-grid{display:grid;grid-template-columns:1.12fr .88fr;gap:18px;align-items:stretch}
    .feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    .plan-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}

    .brand{font-family:'Space Grotesk',system-ui,sans-serif;letter-spacing:-.03em}
    .card{background:var(--card);border:1px solid var(--line);border-radius:18px;box-shadow:0 12px 32px rgba(10,30,66,.08)}

    .pill{
      display:inline-flex;align-items:center;gap:8px;border-radius:999px;
      padding:8px 12px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;
      color:#0E3A87;background:rgba(0,87,217,.08);border:1px solid rgba(0,87,217,.2);
    }

    .cta-primary{
      display:inline-flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,var(--brand),var(--brand-deep));color:#fff;
      border-radius:12px;padding:13px 18px;font-weight:800;font-size:14px;
      box-shadow:0 10px 24px rgba(0,87,217,.28);transition:all .2s ease;
    }
    .cta-primary:hover{transform:translateY(-2px)}

    .cta-gold{
      display:inline-flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,#D4B15A,#E4C885);color:#1E1707;
      border-radius:12px;padding:13px 18px;font-weight:800;font-size:14px;
      box-shadow:0 10px 24px rgba(201,168,76,.3);
    }

    .cta-ghost{
      display:inline-flex;align-items:center;justify-content:center;
      border:1px solid var(--line);background:#fff;border-radius:12px;padding:13px 18px;font-weight:700;font-size:14px;color:#1F2A44;
    }

    .fade-up{opacity:0;transform:translateY(12px);animation:fadeUp .65s cubic-bezier(.2,.8,.22,1) forwards}
    @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}

    @media (max-width:1024px){
      .hero-grid,.two-col{grid-template-columns:1fr}
      .feature-grid,.plan-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media (max-width:760px){
      .shell{padding:0 16px}
      .feature-grid,.plan-grid{grid-template-columns:1fr}
      .hide-mobile{display:none}
    }
  `}</style>
);

function Nav() {
  return (
    <header className="top-nav">
      <div className="shell" style={{ height: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <img src="/images/logo.png" alt="SaukiMart" style={{ width: 42, height: 42, borderRadius: 12 }} />
          <div>
            <strong className="brand" style={{ fontSize: 22 }}>SaukiMart</strong>
            <p style={{ fontSize: 11, color: '#64708C' }}>Data, Wallet, Transfers, Devices</p>
          </div>
        </a>

        <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 14, color: '#374460' }}>
          <a href="#features">Features</a>
          <a href="#whatsnew">What\'s New</a>
          <a href="#plans">Plans</a>
          <a href="#faq">FAQ</a>
        </nav>

        <a href="/app" className="cta-primary">Open App</a>
      </div>
    </header>
  );
}

function Hero({ plans }: { plans: Plan[] }) {
  const cheapest = useMemo(() => {
    if (!plans.length) return 300;
    return Math.min(...plans.map((plan) => plan.price));
  }, [plans]);

  return (
    <section style={{ paddingTop: 110, paddingBottom: 26 }}>
      <div className="shell hero-grid">
        <div className="fade-up" style={{ animationDelay: '.02s' }}>
          <span className="pill">Built for speed, trust, and daily reliability</span>
          <h1 className="brand" style={{ marginTop: 14, fontSize: 'clamp(2.2rem,4.7vw,4rem)', lineHeight: 1.04 }}>
            One complete digital commerce app for data, transfers, alerts, and receipts.
          </h1>
          <p style={{ marginTop: 14, color: 'var(--ink-soft)', lineHeight: 1.82, fontSize: 16, maxWidth: 690 }}>
            SaukiMart is more than data vending. It is a full-service wallet and telecom platform where users can buy network bundles,
            send money to other users instantly, receive smart transaction alerts, and keep formal downloadable receipts in one clean experience.
          </p>

          <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="/app" className="cta-primary">Launch SaukiMart App</a>
            <a href="#whatsnew" className="cta-gold">See Major Upgrade</a>
            <a href="#plans" className="cta-ghost">Explore Data Plans</a>
          </div>

          <div style={{ marginTop: 18 }}>
            <PlayBadge />
          </div>

          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10 }}>
            {[
              ['10,000+', 'Active users'],
              ['< 3s', 'Average delivery speed'],
              [`₦${cheapest.toLocaleString('en-NG')}`, 'Starting plan price'],
            ].map(([value, label]) => (
              <div key={label} className="card" style={{ padding: 12 }}>
                <p className="brand" style={{ fontSize: 25, fontWeight: 700 }}>{value}</p>
                <p style={{ marginTop: 2, fontSize: 12, color: '#66718B' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card fade-up" style={{ padding: 18, animationDelay: '.12s' }}>
          <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: '#5A6D92' }}>Why SaukiMart feels different</p>
          <h2 className="brand" style={{ marginTop: 8, fontSize: 32, lineHeight: 1.08 }}>Formal fintech quality with simple user flow.</h2>
          <p style={{ marginTop: 10, color: '#5A657F', lineHeight: 1.78 }}>
            Every transaction is designed to feel dependable and premium: clearer UI states, accurate records,
            faster actions, and trustworthy communication throughout the customer journey.
          </p>

          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
            {[
              ['Wallet + User Transfers', 'Send money directly to another SaukiMart user in seconds.'],
              ['Smart Alert System', 'Real-time updates for deposits, transfers, promotions, and account activity.'],
              ['Professional Receipts', 'Download clean, business-ready proof for every completed transaction.'],
              ['AI Support', '24/7 in-app support for complaints, questions, and quick guidance.'],
            ].map(([title, text]) => (
              <div key={title} style={{ border: '1px solid #E4EAF5', borderRadius: 12, padding: 12, background: '#FBFCFF' }}>
                <p style={{ fontWeight: 800, color: '#1B2A49' }}>{title}</p>
                <p style={{ marginTop: 3, fontSize: 13, color: '#5E6A86', lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatsNew() {
  return (
    <section id="whatsnew" style={{ padding: '18px 0 56px' }}>
      <div className="shell card" style={{ padding: 22, background: 'linear-gradient(145deg,#FFFFFF,#F6FAFF)' }}>
        <p style={{ fontSize: 12, color: '#4B648F', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>Major upgrade in version 4.2</p>
        <h2 className="brand" style={{ marginTop: 8, fontSize: 'clamp(1.7rem,3.7vw,2.7rem)' }}>SaukiMart just got faster, smarter, and cleaner.</h2>

        <div className="feature-grid" style={{ marginTop: 16 }}>
          {[
            ['🤖 AI Support — 24/7, Instant', 'Get help anytime without waiting. The in-app AI assistant handles complaints and answers questions around the clock.'],
            ['📲 User-to-User Transfers', 'Send money directly to any SaukiMart user in seconds. Fast, seamless, and built right into your wallet.'],
            ['🔔 Smart Alert System', 'Receive real-time notifications for transactions, transfers, promotions, and account activity.'],
          ].map(([title, text]) => (
            <article key={title} className="card" style={{ padding: 14, background: '#FFFFFF' }}>
              <h3 className="brand" style={{ fontSize: 22, lineHeight: 1.12 }}>{title}</h3>
              <p style={{ marginTop: 8, color: '#5D6A85', lineHeight: 1.72, fontSize: 14 }}>{text}</p>
            </article>
          ))}
        </div>

        <article className="card" style={{ marginTop: 14, padding: 14 }}>
          <h3 className="brand" style={{ fontSize: 24 }}>✨ Refreshed UI & UX</h3>
          <p style={{ marginTop: 8, color: '#5D6A85', lineHeight: 1.72, fontSize: 14 }}>
            A cleaner, faster, and more intuitive experience from top to bottom.
            Everything feels smoother, looks sharper, and works better for both first-time users and power users.
          </p>
        </article>
      </div>
    </section>
  );
}

function Plans({ plans }: { plans: Plan[] }) {
  const [active, setActive] = useState<(typeof NETWORKS)[number]>('ALL');

  const filtered = useMemo(() => {
    const fallback: Plan[] = [
      { id: '1', network: 'MTN', dataSize: '2GB', validity: '30 Days', price: 500 },
      { id: '2', network: 'AIRTEL', dataSize: '5GB', validity: '30 Days', price: 1000 },
      { id: '3', network: 'GLO', dataSize: '10GB', validity: '30 Days', price: 1800 },
      { id: '4', network: '9MOBILE', dataSize: '1GB', validity: '7 Days', price: 300 },
      { id: '5', network: 'MTN', dataSize: '15GB', validity: '30 Days', price: 4200 },
      { id: '6', network: 'AIRTEL', dataSize: '1.5GB', validity: '7 Days', price: 450 },
    ];

    const list = plans.length ? plans : fallback;
    return list
      .filter((plan) => (active === 'ALL' ? true : plan.network.toUpperCase() === active))
      .sort((a, b) => a.price - b.price)
      .slice(0, 9);
  }, [active, plans]);

  return (
    <section id="plans" style={{ padding: '0 0 62px' }}>
      <div className="shell">
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 12, color: '#5A6D92', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 800 }}>Current pricing showcase</p>
            <h2 className="brand" style={{ marginTop: 6, fontSize: 'clamp(1.6rem,3.4vw,2.4rem)' }}>Popular plans users buy on SaukiMart</h2>
          </div>
          <a href="/app" className="cta-primary">Buy Now in App</a>
        </div>

        <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {NETWORKS.map((net) => (
            <button
              key={net}
              onClick={() => setActive(net)}
              style={{
                padding: '9px 14px',
                borderRadius: 999,
                border: active === net ? '1px solid #0060EA' : '1px solid #D6DEEF',
                background: active === net ? 'rgba(0,87,217,.1)' : '#fff',
                color: active === net ? '#0D4EB2' : '#3B4865',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {net}
            </button>
          ))}
        </div>

        <div className="plan-grid">
          {filtered.map((plan) => (
            <a key={plan.id} href="/app" className="card" style={{ padding: 13 }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', color: '#6B7FA7' }}>{plan.network}</p>
              <p className="brand" style={{ marginTop: 6, fontSize: 25, lineHeight: 1 }}>{plan.dataSize || plan.data || 'Plan'}</p>
              <p style={{ marginTop: 4, color: '#607090', fontSize: 13 }}>{plan.validity}</p>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#0E5AD0', fontSize: 16 }}>₦{plan.price.toLocaleString('en-NG')}</strong>
                <span style={{ color: '#00A779', fontSize: 12, fontWeight: 800 }}>Select</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    ['Is SaukiMart only for data purchases?', 'No. SaukiMart includes data bundles, wallet funding, user transfers, smart alerts, product purchases, and formal receipt handling.'],
    ['Can I use SaukiMart as a reseller platform?', 'Yes. The platform is designed to be fast and credible for both direct users and high-frequency reseller operations.'],
    ['Do I need the Android app?', 'You can use the web app, but the Android app provides the best mobile experience and newest feature access.'],
    ['How do notifications work?', 'The smart alert system sends real-time updates for key account activities so users stay fully informed.'],
  ] as const;

  return (
    <section id="faq" style={{ paddingBottom: 62 }}>
      <div className="shell card" style={{ padding: 20 }}>
        <p style={{ fontSize: 12, color: '#5A6D92', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 800 }}>FAQ</p>
        <h2 className="brand" style={{ marginTop: 6, fontSize: 'clamp(1.6rem,3.4vw,2.4rem)' }}>Questions about SaukiMart</h2>

        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          {items.map(([q, a], idx) => {
            const isOpen = open === idx;
            return (
              <article key={q} className="card" style={{ padding: 12, boxShadow: 'none' }}>
                <button
                  onClick={() => setOpen((prev) => (prev === idx ? null : idx))}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: '#1D2B4A' }}
                >
                  <strong style={{ fontSize: 15 }}>{q}</strong>
                  <span style={{ fontSize: 20 }}>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && <p style={{ marginTop: 8, color: '#5A6886', fontSize: 14, lineHeight: 1.7 }}>{a}</p>}
              </article>
            );
          })}
        </div>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
          <PlayBadge />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #DDE5F2', background: '#FFFFFF' }}>
      <div className="shell" style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <img src="/images/logo.png" alt="SaukiMart" style={{ width: 34, height: 34, borderRadius: 10 }} />
          <div>
            <p style={{ fontWeight: 800, color: '#1E2A45' }}>SaukiMart</p>
            <p style={{ color: '#66728C', fontSize: 12 }}>support@saukimart.online</p>
          </div>
        </div>

        <a href="https://www.anjalventures.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <img src="https://www.anjalventures.com/logo-md.webp" alt="Anjal Ventures" style={{ height: 30, width: 'auto' }} loading="lazy" />
          <span style={{ color: '#4E5B78', fontSize: 13, fontWeight: 700 }}>Built by Anjal Ventures</span>
        </a>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    fetch('/api/data-plans', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: unknown) => {
        if (!Array.isArray(data)) {
          setPlans([]);
          return;
        }

        const cleaned = data.filter((item): item is Plan => {
          if (typeof item !== 'object' || item === null) return false;
          const plan = item as Partial<Plan>;
          return (
            typeof plan.id === 'string' &&
            typeof plan.network === 'string' &&
            typeof plan.validity === 'string' &&
            typeof plan.price === 'number'
          );
        });

        setPlans(cleaned);
      })
      .catch(() => setPlans([]));
  }, []);

  return (
    <>
      <PageStyle />
      <Nav />
      <main>
        <Hero plans={plans} />
        <WhatsNew />
        <Plans plans={plans} />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
