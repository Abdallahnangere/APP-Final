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

type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

const NETWORKS = ['ALL', 'MTN', 'AIRTEL', 'GLO', '9MOBILE'] as const;

const testimonials: Testimonial[] = [
  {
    name: 'Halima A.',
    role: 'Small Business Owner',
    quote: 'SaukiMart is the first platform where I can buy data, track transfers, and get clean receipts without stress.',
  },
  {
    name: 'Musa M.',
    role: 'Campus Reseller',
    quote: 'The transaction speed is excellent and the dashboard feels premium. My customers trust the receipts instantly.',
  },
  {
    name: 'Khadija S.',
    role: 'Remote Worker',
    quote: 'I fund my wallet, buy bundles, and monitor history in one flow. It feels modern and reliable.',
  },
];

const faqItems = [
  {
    q: 'How fast is data delivery?',
    a: 'Most purchases are fulfilled instantly after successful payment. In rare network delays, fulfillment completes shortly after with clear transaction status.',
  },
  {
    q: 'Can I download receipts for every purchase?',
    a: 'Yes. SaukiMart generates downloadable transaction receipts so users and businesses can retain formal records.',
  },
  {
    q: 'Does SaukiMart support wallet funding and transfers?',
    a: 'Yes. You can fund your wallet, transfer value, and review complete account history from the app interface.',
  },
  {
    q: 'Is there an Android app?',
    a: 'Yes. SaukiMart is available on Google Play and includes update checks to ensure secure, up-to-date usage.',
  },
];

const PageStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Manrope:wght@400;500;600;700;800&display=swap');

    :root{
      --bg:#070B16;
      --bg-soft:#0D1427;
      --surface:#111A31;
      --surface-2:#131F3A;
      --line:rgba(255,255,255,.1);
      --text:#EAF0FF;
      --muted:#A7B0C9;
      --gold:#D8B25A;
      --cyan:#41D7FF;
      --blue:#3D7CFF;
      --green:#24C79A;
      --danger:#FF6F7F;
    }

    *{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{
      background:
        radial-gradient(900px 420px at 15% -10%, rgba(61,124,255,.34), transparent 72%),
        radial-gradient(750px 400px at 92% -15%, rgba(216,178,90,.22), transparent 73%),
        linear-gradient(180deg,#060A14 0%,#070B16 32%,#0B1223 100%);
      color:var(--text);
      font-family:'Manrope',system-ui,sans-serif;
      -webkit-font-smoothing:antialiased;
      text-rendering:optimizeLegibility;
      overflow-x:hidden;
    }

    a{text-decoration:none;color:inherit}
    img{display:block;max-width:100%}

    .shell{max-width:1180px;margin:0 auto;padding:0 22px}

    .nav{
      position:fixed;
      top:0;
      left:0;
      right:0;
      z-index:200;
      backdrop-filter:blur(14px) saturate(130%);
      background:rgba(6,10,20,.66);
      border-bottom:1px solid var(--line);
    }

    .hero-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:20px;align-items:stretch}
    .quick-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    .feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    .plan-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}

    .brand-font{font-family:'Space Grotesk',system-ui,sans-serif;letter-spacing:-.03em}

    .card{
      background:linear-gradient(160deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
      border:1px solid var(--line);
      border-radius:18px;
      box-shadow:0 14px 38px rgba(0,0,0,.35);
    }

    .pill{
      display:inline-flex;
      align-items:center;
      gap:8px;
      border-radius:999px;
      padding:8px 12px;
      border:1px solid rgba(65,215,255,.35);
      background:rgba(65,215,255,.11);
      color:#BFEFFF;
      font-size:12px;
      font-weight:700;
      letter-spacing:.03em;
      text-transform:uppercase;
    }

    .cta-primary{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      border:none;
      border-radius:12px;
      padding:13px 18px;
      font-size:14px;
      font-weight:800;
      background:linear-gradient(135deg,var(--gold),#F0D288);
      color:#1C1507;
      cursor:pointer;
      transition:transform .2s ease, box-shadow .2s ease;
      box-shadow:0 8px 24px rgba(216,178,90,.32);
    }
    .cta-primary:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(216,178,90,.42)}

    .cta-ghost{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      border-radius:12px;
      padding:13px 18px;
      border:1px solid rgba(255,255,255,.16);
      background:rgba(255,255,255,.04);
      color:#EAF0FF;
      font-size:14px;
      font-weight:700;
      transition:all .2s ease;
    }
    .cta-ghost:hover{border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.07)}

    .spotlight{
      position:relative;
      overflow:hidden;
    }
    .spotlight::before{
      content:'';
      position:absolute;
      inset:-120px;
      background:radial-gradient(260px circle at var(--mx,65%) var(--my,35%), rgba(65,215,255,.22), transparent 55%);
      pointer-events:none;
      transition:all .12s linear;
    }

    .reveal{opacity:0;transform:translateY(12px);animation:reveal .66s cubic-bezier(.2,.85,.22,1) forwards}
    @keyframes reveal{to{opacity:1;transform:translateY(0)}}

    @media (max-width:1024px){
      .hero-grid,.two-col{grid-template-columns:1fr}
      .feature-grid,.plan-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      .quick-grid{grid-template-columns:1fr 1fr}
    }

    @media (max-width:740px){
      .shell{padding:0 16px}
      .quick-grid,.feature-grid,.plan-grid{grid-template-columns:1fr}
      .nav-links{display:none}
    }
  `}</style>
);

function Nav() {
  return (
    <header className="nav" aria-label="Main navigation">
      <div className="shell" style={{ height: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }} aria-label="SaukiMart Home">
          <img src="/images/logo.png" alt="SaukiMart logo" style={{ width: 40, height: 40, borderRadius: 10 }} loading="eager" />
          <div>
            <strong className="brand-font" style={{ fontSize: 20 }}>SaukiMart</strong>
            <p style={{ fontSize: 11, color: 'var(--muted)' }}>Premium telecom & fintech commerce</p>
          </div>
        </a>

        <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 18, color: '#CDD6EF', fontSize: 14 }}>
          <a href="#plans">Plans</a>
          <a href="#features">Features</a>
          <a href="#proof">Why us</a>
          <a href="#faq">FAQ</a>
        </nav>

        <a href="/app" className="cta-primary">Open App</a>
      </div>
    </header>
  );
}

function Hero({ plans }: { plans: Plan[] }) {
  const [mouse, setMouse] = useState({ x: 65, y: 35 });

  const bestPrice = useMemo(() => {
    if (!plans.length) return 300;
    return Math.min(...plans.map((p) => p.price));
  }, [plans]);

  return (
    <section style={{ paddingTop: 114, paddingBottom: 32 }}>
      <div className="shell hero-grid">
        <div className="reveal" style={{ animationDelay: '.02s' }}>
          <span className="pill">Modern digital utility commerce</span>
          <h1 className="brand-font" style={{ marginTop: 16, fontSize: 'clamp(2.2rem,5vw,4.2rem)', lineHeight: 1.02 }}>
            The fastest path from wallet funding to data delivery.
          </h1>
          <p style={{ marginTop: 16, color: 'var(--muted)', maxWidth: 650, lineHeight: 1.8, fontSize: 16 }}>
            SaukiMart blends telecom bundles, transfer-ready wallet operations, formal receipts, and device sales in one polished experience.
            Built for daily users and serious resellers who value speed, trust, and premium UX.
          </p>

          <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a href="/app" className="cta-primary">Launch Dashboard</a>
            <a href="https://play.google.com/store/apps/details?id=online.saukimart.twa" target="_blank" rel="noopener noreferrer" className="cta-ghost">Get Android App</a>
            <a href="#plans" className="cta-ghost">Browse Data Plans</a>
          </div>

          <div className="quick-grid" style={{ marginTop: 20 }}>
            {[
              ['10K+', 'Happy Users'],
              ['< 3s', 'Average Delivery'],
              [`N ${bestPrice.toLocaleString('en-NG')}`, 'Entry Plan Price'],
            ].map(([value, label]) => (
              <div key={label} className="card" style={{ padding: 14 }}>
                <p className="brand-font" style={{ fontSize: 24, fontWeight: 700 }}>{value}</p>
                <p style={{ marginTop: 4, fontSize: 12, color: 'var(--muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="card spotlight reveal"
          style={{ padding: 16, animationDelay: '.12s', ['--mx' as string]: `${mouse.x}%`, ['--my' as string]: `${mouse.y}%` }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setMouse({ x, y });
          }}
          aria-label="Wallet preview"
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/images/logo.png" alt="SaukiMart" style={{ width: 34, height: 34, borderRadius: 8 }} loading="lazy" />
                <div>
                  <p style={{ fontWeight: 800 }}>SaukiMart Wallet</p>
                  <p style={{ color: 'var(--muted)', fontSize: 12 }}>Smart balance and receipt ledger</p>
                </div>
              </div>
              <span style={{ color: 'var(--green)', fontWeight: 800, fontSize: 12 }}>LIVE</span>
            </div>

            <div style={{ borderRadius: 16, padding: 16, background: 'linear-gradient(145deg,#122C67,#214DA9)', border: '1px solid rgba(255,255,255,.18)' }}>
              <p style={{ fontSize: 11, letterSpacing: '.08em', opacity: 0.8 }}>AVAILABLE BALANCE</p>
              <p className="brand-font" style={{ marginTop: 6, fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em' }}>N 24,500.00</p>
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                {[
                  ['Funding', 'Virtual account top-up', '#41D7FF'],
                  ['Receipt', 'Downloadable transaction proof', '#D8B25A'],
                  ['Alerts', 'Instant credit push updates', '#24C79A'],
                ].map(([k, v, c]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderRadius: 10, padding: '8px 10px', background: 'rgba(255,255,255,.1)' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: c }}>{k}</span>
                    <span style={{ fontSize: 12, opacity: 0.88 }}>{v}</span>
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

function PlanExplorer({ plans }: { plans: Plan[] }) {
  const [activeNetwork, setActiveNetwork] = useState<(typeof NETWORKS)[number]>('ALL');
  const [maxPrice, setMaxPrice] = useState(5000);

  const filtered = useMemo(() => {
    const list = plans.length
      ? plans
      : [
          { id: 'm1', network: 'MTN', dataSize: '2GB', validity: '30 Days', price: 500 },
          { id: 'a1', network: 'AIRTEL', dataSize: '5GB', validity: '30 Days', price: 1000 },
          { id: 'g1', network: 'GLO', dataSize: '10GB', validity: '30 Days', price: 1800 },
          { id: 'n1', network: '9MOBILE', dataSize: '1GB', validity: '7 Days', price: 300 },
          { id: 'm2', network: 'MTN', dataSize: '15GB', validity: '30 Days', price: 4200 },
          { id: 'a2', network: 'AIRTEL', dataSize: '1.5GB', validity: '7 Days', price: 450 },
        ];

    return list
      .filter((p) => (activeNetwork === 'ALL' ? true : p.network.toUpperCase() === activeNetwork))
      .filter((p) => p.price <= maxPrice)
      .sort((a, b) => a.price - b.price)
      .slice(0, 9);
  }, [activeNetwork, maxPrice, plans]);

  return (
    <section id="plans" style={{ padding: '30px 0 62px' }}>
      <div className="shell card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <p style={{ color: '#8FA2D0', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>Interactive plan explorer</p>
            <h2 className="brand-font" style={{ marginTop: 6, fontSize: 'clamp(1.6rem,3.8vw,2.4rem)' }}>Filter live plan pricing by network and budget</h2>
          </div>
          <a href="/app" className="cta-primary">Buy in App</a>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {NETWORKS.map((network) => {
            const active = network === activeNetwork;
            return (
              <button
                key={network}
                onClick={() => setActiveNetwork(network)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 999,
                  border: active ? '1px solid rgba(216,178,90,.7)' : '1px solid rgba(255,255,255,.14)',
                  background: active ? 'rgba(216,178,90,.18)' : 'rgba(255,255,255,.03)',
                  color: active ? '#F4D896' : '#D4DBF1',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {network}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 16 }}>
          <label htmlFor="priceRange" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#C2CCE9', marginBottom: 8 }}>
            <span>Max budget</span>
            <strong>N {maxPrice.toLocaleString('en-NG')}</strong>
          </label>
          <input
            id="priceRange"
            type="range"
            min={300}
            max={5000}
            step={100}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div className="plan-grid" style={{ marginTop: 16 }}>
          {filtered.map((plan) => (
            <a key={plan.id} href="/app" className="card" style={{ padding: 12, background: 'rgba(255,255,255,.03)' }}>
              <p style={{ fontSize: 11, letterSpacing: '.08em', color: '#8EA1CD', fontWeight: 800 }}>{plan.network}</p>
              <p className="brand-font" style={{ marginTop: 6, fontSize: 22, fontWeight: 700 }}>{plan.dataSize || plan.data || 'Plan'}</p>
              <p style={{ marginTop: 2, color: '#A6B2D2', fontSize: 12 }}>{plan.validity}</p>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#8FC9FF' }}>N {plan.price.toLocaleString('en-NG')}</strong>
                <span style={{ color: '#87F2CE', fontSize: 12, fontWeight: 800 }}>Select</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturePanels() {
  return (
    <section id="features" style={{ padding: '6px 0 62px' }}>
      <div className="shell feature-grid">
        {[
          {
            title: 'Fintech-grade receipts',
            text: 'Structured transaction slips for transfer, deposit, and purchase records with download support.',
            accent: 'linear-gradient(145deg,rgba(65,215,255,.15),rgba(65,215,255,.04))',
          },
          {
            title: 'Wallet + transfer rails',
            text: 'Move funds between users, monitor balances in real time, and keep transaction history neat and auditable.',
            accent: 'linear-gradient(145deg,rgba(36,199,154,.18),rgba(36,199,154,.06))',
          },
          {
            title: 'Premium device storefront',
            text: 'Sell MiFi routers, WiFi tools, and related hardware in the same polished environment as data vending.',
            accent: 'linear-gradient(145deg,rgba(216,178,90,.2),rgba(216,178,90,.06))',
          },
        ].map((item, idx) => (
          <article key={item.title} className="card reveal" style={{ padding: 18, background: item.accent, animationDelay: `${idx * 120}ms` }}>
            <h3 className="brand-font" style={{ fontSize: 25, lineHeight: 1.08 }}>{item.title}</h3>
            <p style={{ marginTop: 10, color: '#CED8F4', fontSize: 14, lineHeight: 1.75 }}>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SocialProof() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="proof" style={{ padding: '0 0 64px' }}>
      <div className="shell two-col">
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: '#8EA4D8', fontWeight: 700 }}>Customer voice</p>
          <h3 className="brand-font" style={{ marginTop: 8, fontSize: 34 }}>Trusted by everyday users and active resellers.</h3>
          <p style={{ marginTop: 10, color: '#C8D3F1', lineHeight: 1.78 }}>People rely on SaukiMart because every part of the flow feels intentional: pricing clarity, transaction confidence, and reliable fulfillment speed.</p>

          <div className="card" style={{ marginTop: 16, padding: 16, background: 'rgba(255,255,255,.03)' }}>
            <p style={{ color: '#EAF0FF', lineHeight: 1.75, fontSize: 16 }}>
              "{testimonials[active].quote}"
            </p>
            <p style={{ marginTop: 14, fontWeight: 800 }}>{testimonials[active].name}</p>
            <p style={{ marginTop: 2, color: '#9EABC9', fontSize: 13 }}>{testimonials[active].role}</p>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            {testimonials.map((t, idx) => (
              <button
                key={t.name}
                onClick={() => setActive(idx)}
                aria-label={`Show testimonial ${idx + 1}`}
                style={{
                  width: 30,
                  height: 8,
                  borderRadius: 99,
                  border: 'none',
                  background: active === idx ? '#D8B25A' : 'rgba(255,255,255,.2)',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: '#8EA4D8', fontWeight: 700 }}>Reliability metrics</p>
          <h3 className="brand-font" style={{ marginTop: 8, fontSize: 30 }}>Operational discipline across payments and telecom.</h3>

          <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
            {[
              ['Delivery consistency', 97],
              ['Receipt generation success', 99],
              ['Wallet action reliability', 98],
            ].map(([name, value]) => (
              <div key={name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: '#D0D9F2' }}>{name}</span>
                  <strong>{value}%</strong>
                </div>
                <div style={{ height: 9, borderRadius: 8, background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}>
                  <div style={{ width: `${value}%`, height: '100%', background: 'linear-gradient(90deg,#41D7FF,#24C79A)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" style={{ paddingBottom: 72 }}>
      <div className="shell card" style={{ padding: 20 }}>
        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: '#8EA4D8', fontWeight: 700 }}>FAQ</p>
        <h3 className="brand-font" style={{ marginTop: 8, fontSize: 34 }}>Answers to common questions</h3>

        <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          {faqItems.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <article key={item.q} className="card" style={{ padding: 14, background: 'rgba(255,255,255,.03)' }}>
                <button
                  onClick={() => setOpen((prev) => (prev === idx ? null : idx))}
                  style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', color: '#ECF2FF', cursor: 'pointer' }}
                >
                  <strong style={{ fontSize: 15 }}>{item.q}</strong>
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <p style={{ marginTop: 10, color: '#BDC9E8', lineHeight: 1.72, fontSize: 14 }}>{item.a}</p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', background: 'rgba(0,0,0,.2)' }}>
      <div className="shell" style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <img src="/images/logo.png" alt="SaukiMart" style={{ width: 32, height: 32, borderRadius: 8 }} loading="lazy" />
          <div>
            <p style={{ fontWeight: 800 }}>SaukiMart</p>
            <p style={{ marginTop: 2, color: '#9BA9CB', fontSize: 12 }}>support@saukimart.online</p>
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', color: '#AAB5D2', fontSize: 13 }}>
          <a href="/privacy">Privacy</a>
          <a href="/support">Support</a>
          <a href="https://play.google.com/store/apps/details?id=online.saukimart.twa" target="_blank" rel="noopener noreferrer">Google Play</a>
        </div>
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
        if (Array.isArray(data)) {
          const cleaned = data.filter((item): item is Plan => {
            if (typeof item !== 'object' || item === null) return false;
            const candidate = item as Partial<Plan>;
            return (
              typeof candidate.id === 'string' &&
              typeof candidate.network === 'string' &&
              typeof candidate.validity === 'string' &&
              typeof candidate.price === 'number'
            );
          });
          setPlans(cleaned);
          return;
        }
        setPlans([]);
      })
      .catch(() => setPlans([]));
  }, []);

  return (
    <>
      <PageStyle />
      <Nav />
      <main>
        <Hero plans={plans} />
        <PlanExplorer plans={plans} />
        <FeaturePanels />
        <SocialProof />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
