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

const PageStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

    :root{
      --ink:#111319;
      --ink-soft:#5F6572;
      --paper:#F7F8FB;
      --card:#FFFFFF;
      --line:#E5E8F0;
      --brand:#0057D9;
      --brand-deep:#003B95;
      --mint:#19B394;
      --gold:#C89F45;
      --night:#0D1528;
    }

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{
      font-family:'Manrope',system-ui,sans-serif;
      color:var(--ink);
      background:
        radial-gradient(800px 300px at 8% -8%, rgba(0,87,217,.14), transparent 72%),
        radial-gradient(780px 300px at 92% -14%, rgba(200,159,69,.17), transparent 72%),
        var(--paper);
      -webkit-font-smoothing:antialiased;
      text-rendering:optimizeLegibility;
    }

    a{color:inherit;text-decoration:none}
    button{font-family:inherit}

    .shell{max-width:1180px;margin:0 auto;padding:0 22px}

    .glass-nav{
      position:fixed;top:0;left:0;right:0;z-index:120;
      background:rgba(247,248,251,.8);
      backdrop-filter:blur(14px) saturate(130%);
      border-bottom:1px solid rgba(17,19,25,.06);
    }

    .hero-grid{
      display:grid;
      grid-template-columns:1.05fr .95fr;
      gap:36px;
      align-items:center;
    }

    .hero-title{
      font-family:'Plus Jakarta Sans',system-ui,sans-serif;
      font-size:clamp(2.1rem, 5vw, 4rem);
      line-height:1.03;
      letter-spacing:-0.03em;
      font-weight:800;
    }

    .luxury-card{
      background:var(--card);
      border:1px solid var(--line);
      border-radius:24px;
      box-shadow:0 20px 55px rgba(13,21,40,.08);
    }

    .coin{
      width:74px;
      height:74px;
      border-radius:50%;
      background:
        radial-gradient(circle at 30% 26%, #FFE59A, #E1B85A 43%, #A77721 100%);
      border:2px solid rgba(255,255,255,.58);
      box-shadow:inset 0 2px 7px rgba(255,255,255,.4), 0 12px 26px rgba(200,159,69,.32);
      display:grid;
      place-items:center;
      font-weight:800;
      color:#352404;
      animation:floatCoin 4s ease-in-out infinite;
    }

    .noise{
      position:absolute;
      inset:0;
      pointer-events:none;
      background-image:radial-gradient(rgba(17,19,25,.05) .6px, transparent .6px);
      background-size:5px 5px;
      opacity:.25;
      mix-blend-mode:multiply;
      border-radius:inherit;
    }

    .plan-grid{
      display:grid;
      grid-template-columns:repeat(4,minmax(0,1fr));
      gap:14px;
    }

    .feature-grid{
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:14px;
    }

    .fade-rise{animation:fadeRise .7s cubic-bezier(.21,.78,.23,1) both}

    @keyframes fadeRise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes floatCoin{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes pulseRing{0%{transform:scale(1);opacity:.25}100%{transform:scale(1.14);opacity:0}}

    @media (max-width:1024px){
      .plan-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .feature-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .hero-grid{grid-template-columns:1fr;gap:24px}
    }

    @media (max-width:700px){
      .shell{padding:0 16px}
      .feature-grid{grid-template-columns:1fr}
      .plan-grid{grid-template-columns:1fr}
    }
  `}</style>
);

function NavBar() {
  return (
    <header className="glass-nav">
      <div className="shell" style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <img src="/images/logo.png" alt="SaukiMart" style={{ width: 38, height: 38, borderRadius: 11, objectFit: 'cover' }} />
          <span style={{ fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontWeight: 800, letterSpacing: '-0.01em' }}>SaukiMart</span>
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 14, color: '#3B4250' }}>
          <a href="#plans">Plans</a>
          <a href="#platform">Platform</a>
          <a href="#support">Support</a>
          <a
            href="/app"
            style={{
              background: 'linear-gradient(130deg,var(--brand),var(--brand-deep))',
              color: '#fff',
              borderRadius: 999,
              padding: '10px 16px',
              fontWeight: 700,
            }}
          >
            Open App
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero({ plans }: { plans: Plan[] }) {
  const preview = useMemo(() => plans.slice(0, 4), [plans]);

  return (
    <section style={{ paddingTop: 116, paddingBottom: 56 }}>
      <div className="shell hero-grid">
        <div className="fade-rise" style={{ animationDelay: '.04s' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0,87,217,.08)',
              border: '1px solid rgba(0,87,217,.2)',
              color: 'var(--brand-deep)',
              borderRadius: 999,
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            Fintech Commerce Platform
          </div>
          <h1 className="hero-title">A more premium way to buy data, move money, and scale digital sales.</h1>
          <p style={{ marginTop: 18, color: 'var(--ink-soft)', fontSize: 16, lineHeight: 1.8, maxWidth: 610 }}>
            SaukiMart now delivers a refined digital commerce experience for modern users and high-performance resellers.
            Fast delivery, transparent receipts, and enterprise-level reliability in one seamless product.
          </p>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a
              href="/app"
              style={{
                background: 'linear-gradient(130deg,var(--brand),var(--brand-deep))',
                color: '#fff',
                borderRadius: 14,
                padding: '14px 22px',
                fontWeight: 800,
              }}
            >
              Launch SaukiMart
            </a>
            <a
              href="#plans"
              style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: 14,
                padding: '14px 22px',
                fontWeight: 700,
              }}
            >
              Explore Data Plans
            </a>
          </div>
          <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12 }}>
            {[
              ['10K+', 'Active users'],
              ['< 3s', 'Delivery speed'],
              ['24/7', 'Support window'],
            ].map(([value, label]) => (
              <div key={label} className="luxury-card" style={{ padding: '14px 12px' }}>
                <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</p>
                <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="fade-rise" style={{ animationDelay: '.14s' }}>
          <div className="luxury-card" style={{ position: 'relative', overflow: 'hidden', padding: 18 }}>
            <div className="noise" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src="/images/logo.png" alt="SaukiMart" style={{ width: 34, height: 34, borderRadius: 9 }} />
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 13 }}>SaukiMart Ledger</p>
                    <p style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Live transaction quality</p>
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <div className="coin">SM</div>
                  <div style={{ position: 'absolute', inset: -4, border: '1px solid rgba(200,159,69,.45)', borderRadius: '50%', animation: 'pulseRing 1.8s ease-out infinite' }} />
                </div>
              </div>

              <div style={{ background: 'linear-gradient(145deg,#092968,#0057D9)', borderRadius: 20, padding: 18, color: '#fff' }}>
                <p style={{ fontSize: 11, opacity: 0.7, marginBottom: 6, letterSpacing: '0.08em' }}>TOTAL BALANCE</p>
                <p style={{ fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontWeight: 800, fontSize: 34, letterSpacing: '-0.03em' }}>N 24,500.00</p>
                <p style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>Virtual Account: 3080209892</p>
              </div>

              <div className="plan-grid" style={{ marginTop: 14 }}>
                {(preview.length ? preview : [
                  { id: 'x1', network: 'MTN', dataSize: '2GB', validity: '30 Days', price: 500 },
                  { id: 'x2', network: 'AIRTEL', dataSize: '5GB', validity: '30 Days', price: 1000 },
                  { id: 'x3', network: 'GLO', dataSize: '10GB', validity: '30 Days', price: 1800 },
                  { id: 'x4', network: 'MTN', dataSize: '500MB', validity: '7 Days', price: 150 },
                ]).map((plan) => (
                  <div key={plan.id} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: 12 }}>
                    <p style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>{plan.network}</p>
                    <p style={{ marginTop: 2, fontWeight: 800 }}>{plan.dataSize || plan.data || 'Plan'}</p>
                    <p style={{ marginTop: 8, color: 'var(--brand)', fontWeight: 800, fontSize: 13 }}>N {Number(plan.price).toLocaleString('en-NG')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Platform() {
  const items = [
    {
      title: 'Luxury Financial Clarity',
      text: 'Receipts, balances, and status states are presented with clear hierarchy and elegant typography.',
      tone: 'linear-gradient(145deg, rgba(0,87,217,.09), rgba(0,87,217,.03))',
    },
    {
      title: 'Operational Speed',
      text: 'From plan discovery to payment confirmation, flows are optimized for low-friction completion.',
      tone: 'linear-gradient(145deg, rgba(25,179,148,.12), rgba(25,179,148,.04))',
    },
    {
      title: 'Trust-Forward Design',
      text: 'A restrained premium style with predictable interactions suitable for enterprise acquisition standards.',
      tone: 'linear-gradient(145deg, rgba(200,159,69,.15), rgba(200,159,69,.05))',
    },
  ];

  return (
    <section id="platform" style={{ padding: '24px 0 64px' }}>
      <div className="shell feature-grid">
        {items.map((item, i) => (
          <article key={item.title} className="luxury-card fade-rise" style={{ padding: 18, background: item.tone, animationDelay: `${i * 90}ms` }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{item.title}</p>
            <p style={{ marginTop: 10, color: '#364053', fontSize: 14, lineHeight: 1.7 }}>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PlansShowcase({ plans }: { plans: Plan[] }) {
  const top = useMemo(() => {
    if (!plans.length) return [] as Plan[];
    return [...plans].sort((a, b) => a.price - b.price).slice(0, 8);
  }, [plans]);

  return (
    <section id="plans" style={{ padding: '68px 0', background: '#fff', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <div className="shell">
        <div style={{ marginBottom: 26, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Market Snapshot</p>
            <h2 style={{ marginTop: 8, fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontWeight: 800, letterSpacing: '-0.02em', fontSize: 'clamp(1.6rem,3.3vw,2.4rem)' }}>Top data plans on SaukiMart</h2>
          </div>
          <a href="/app" style={{ color: 'var(--brand-deep)', fontWeight: 800 }}>View all in app</a>
        </div>

        <div className="plan-grid">
          {(top.length ? top : [
            { id: 'p1', network: 'MTN', dataSize: '2GB', validity: '30 Days', price: 500 },
            { id: 'p2', network: 'AIRTEL', dataSize: '5GB', validity: '30 Days', price: 1000 },
            { id: 'p3', network: 'GLO', dataSize: '10GB', validity: '30 Days', price: 1800 },
            { id: 'p4', network: 'MTN', dataSize: '500MB', validity: '7 Days', price: 150 },
          ]).map((plan) => (
            <a
              key={plan.id}
              href="/app"
              className="luxury-card"
              style={{
                padding: 14,
                transition: 'transform .2s ease, box-shadow .2s ease',
                background: 'linear-gradient(170deg,#fff,#FBFCFF)',
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 800, color: '#6E7687', letterSpacing: '.06em' }}>{plan.network}</p>
              <p style={{ marginTop: 6, fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em' }}>{plan.dataSize || plan.data || 'Plan'}</p>
              <p style={{ marginTop: 2, color: '#6E7687', fontSize: 12 }}>{plan.validity}</p>
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--brand)', fontWeight: 800, fontSize: 16 }}>N {Number(plan.price).toLocaleString('en-NG')}</span>
                <span style={{ color: 'var(--mint)', fontWeight: 800, fontSize: 12 }}>Buy now</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="support" style={{ padding: '70px 0 82px' }}>
      <div className="shell">
        <div
          className="luxury-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(145deg,#0D1528 0%,#132648 45%,#083B93 100%)',
            color: '#fff',
            padding: '34px 28px',
          }}
        >
          <div className="noise" style={{ opacity: 0.2 }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 20 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', opacity: 0.8, textTransform: 'uppercase' }}>Ready for premium digital commerce</p>
              <h3 style={{ marginTop: 10, fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", fontSize: 'clamp(1.6rem,3.3vw,2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Built to deliver value at acquisition-grade quality.
              </h3>
              <p style={{ marginTop: 12, color: 'rgba(255,255,255,.78)', fontSize: 14, lineHeight: 1.75, maxWidth: 520 }}>
                Launch the product experience and review the refined transaction flows and receipts now.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
              <a href="/app" style={{ background: '#fff', color: '#10254A', borderRadius: 12, textAlign: 'center', padding: '13px 16px', fontWeight: 800 }}>Open App Experience</a>
              <a href="mailto:support@saukimart.online" style={{ border: '1px solid rgba(255,255,255,.28)', borderRadius: 12, textAlign: 'center', padding: '13px 16px', fontWeight: 700 }}>support@saukimart.online</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', background: '#fff' }}>
      <div className="shell" style={{ padding: '24px 0 30px', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <img src="/images/logo.png" alt="SaukiMart" style={{ width: 30, height: 30, borderRadius: 8 }} />
          <span style={{ fontWeight: 800 }}>SaukiMart</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>support@saukimart.online</p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    fetch('/api/data-plans')
      .then((r) => r.json())
      .then((d) => setPlans(Array.isArray(d) ? d : []))
      .catch(() => setPlans([]));
  }, []);

  return (
    <>
      <PageStyle />
      <NavBar />
      <main>
        <Hero plans={plans} />
        <Platform />
        <PlansShowcase plans={plans} />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
