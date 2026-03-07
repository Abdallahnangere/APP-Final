'use client';
import { useState, useEffect } from 'react';

type Plan = { id: string; network: string; dataSize: string; validity: string; price: number };

const AppleStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    
    :root{
      --bg-light:#F5F5F7;
      --bg-dark:#000000;
      --card:#FFFFFF;
      --text-primary:#1D1D1F;
      --text-secondary:#6E6E73;
      --text-tertiary:#A1A1A6;
      --accent:#0071E3;
      --accent-hover:#0077ED;
      --success:#34C759;
      --error:#FF3B30;
      --border:rgba(0,0,0,0.08);
    }
    
    html{scroll-behavior:smooth}
    body{font-family:-apple-system,"SF Pro Display","SF Pro Text",BlinkMacSystemFont,system-ui,sans-serif;background:var(--bg-light);color:var(--text-primary);-webkit-font-smoothing:antialiased}
    
    ::-webkit-scrollbar{width:8px}::-webkit-scrollbar-thumb{background:#D5D5D7;border-radius:4px}
    
    button{border:none;cursor:pointer;font-family:inherit;background:none}
    a{text-decoration:none;color:inherit}
    
    @keyframes fadeUpScroll{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideDownNav{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
    
    .fade-in{opacity:0;animation:fadeUpScroll 0.7s cubic-bezier(0.25,0.1,0.25,1) forwards}
    .fade-in-delay-1{animation-delay:0.1s}
    .fade-in-delay-2{animation-delay:0.2s}
    .fade-in-delay-3{animation-delay:0.3s}
    
    @media(max-width:768px){
      .hide-mobile{display:none!important}
      .grid-2{grid-template-columns:1fr!important}
      .grid-3{grid-template-columns:repeat(2,1fr)!important}
      .featured-section{text-align:center!important}
    }
    
    @media(max-width:480px){
      .grid-3{grid-template-columns:1fr!important}
    }
  `}</style>
);


function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      height: 48,
      background: scrolled ? 'rgba(245,245,247,0.72)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      transition: 'all 0.3s cubic-bezier(0.25,0.1,0.25,1)',
    }}>
      <div style={{
        maxWidth: 980,
        margin: '0 auto',
        padding: '0 22px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <a href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600,
          fontSize: 16,
          color: 'var(--text-primary)',
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
          }}>S</div>
          SaukiMart
        </a>
        
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="hide-mobile">
          {[['Data Plans', '#data-plans'], ['Store', '#store'], ['About', '#about']].map(([label, href]) => (
            <a key={label} href={href} style={{
              fontSize: 14,
              fontWeight: 400,
              color: 'var(--text-secondary)',
              transition: 'color 0.2s',
            }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
              {label}
            </a>
          ))}
        </div>
        
        <a href="/app" style={{
          padding: '12px 22px',
          background: 'var(--accent)',
          color: '#fff',
          borderRadius: 980,
          fontSize: 14,
          fontWeight: 600,
          transition: 'all 0.2s',
        }} onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)';
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
        }} onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        }}>
          Get Started
        </a>
      </div>
    </nav>
  );
}


function Hero() {
  return (
    <section style={{
      paddingTop: 120,
      paddingBottom: 120,
      background: '#fff',
      marginTop: 48,
    }}>
      <div style={{
        maxWidth: 980,
        margin: '0 auto',
        padding: '0 22px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
          <p className="fade-in" style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: 16,
          }}>Data Plans &amp; Devices</p>
          
          <h1 className="fade-in fade-in-delay-1" style={{
            fontSize: 'clamp(48px, 8vw, 72px)',
            fontWeight: 700,
            letterSpacing: '-0.004em',
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            marginBottom: 24,
          }}>
            Instant Data.<br/>Better Prices.
          </h1>
          
          <p className="fade-in fade-in-delay-2" style={{
            fontSize: 'clamp(16px, 2vw, 21px)',
            fontWeight: 400,
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            marginBottom: 48,
          }}>
            Buy MTN, Airtel, and Glo data bundles. Fund your wallet. Shop quality devices. All delivered in seconds.
          </p>
          
          <div className="fade-in fade-in-delay-3" style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <a href="/app" style={{
              padding: '12px 22px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 980,
              fontSize: 16,
              fontWeight: 600,
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }} onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
            }} onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}>
              Buy Data Now →
            </a>
            
            <a href="#" style={{
              padding: '12px 22px',
              background: 'transparent',
              color: 'var(--accent)',
              borderRadius: 980,
              fontSize: 16,
              fontWeight: 600,
              border: '1px solid var(--border)',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }} onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(0,113,227,0.06)';
            }} onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}>
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      title: 'Sub-3 Second Delivery',
      description: 'Data hits your SIM in under 3 seconds. No waiting. No failed orders.',
    },
    {
      title: 'Best Prices Guaranteed',
      description: 'Shop rates from every major network. We beat every competitor consistently.',
    },
    {
      title: 'Cashback Rewards',
      description: 'Earn money back on every purchase. Referral bonuses. Real value.',
    },
    {
      title: 'Bank-Grade Security',
      description: 'SHA-256 encryption, PCI-DSS Level 1 processing, zero compromises.',
    },
    {
      title: 'Virtual Bank Account',
      description: 'Get a dedicated account at signup. Fund instantly via bank transfer.',
    },
    {
      title: 'Global SIM Activation',
      description: 'Buy Airtel SIM anywhere. Activate remotely with 30GB data included.',
    },
  ];
  
  return (
    <section style={{
      padding: '120px 22px',
      background: 'var(--bg-light)',
    }}>
      <div style={{
        maxWidth: 980,
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 style={{
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 700,
            letterSpacing: '-0.003em',
            color: 'var(--text-primary)',
            marginBottom: 24,
          }}>Everything You Need</h2>
          
          <p style={{
            fontSize: 18,
            fontWeight: 400,
            color: 'var(--text-secondary)',
            maxWidth: 540,
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            A platform rebuilt from the ground up for Nigerian users. Fast, secure, and built to last.
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 32,
        }} className="grid-3">
          {features.map((feature, idx) => (
            <div key={idx} className="fade-in" style={{
              animationDelay: `${idx * 0.1}s`,
              padding: 32,
              background: '#fff',
              borderRadius: 20,
              border: '1px solid var(--border)',
              transition: 'all 0.3s cubic-bezier(0.25,0.1,0.25,1)',
              cursor: 'pointer',
            }} onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.border = '1px solid var(--accent)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 20px rgba(0,113,227,0.08)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
            }} onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.border = '1px solid var(--border)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 12,
                lineHeight: 1.4,
              }}>
                {feature.title}
              </h3>
              
              <p style={{
                fontSize: 15,
                fontWeight: 400,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function DataPlans({ plans }: { plans: Plan[] }) {
  const [selected, setSelected] = useState('MTN');
  const filtered = plans.filter(p => p.network.toUpperCase() === selected);
  const networks = ['MTN', 'AIRTEL', 'GLO'];
  
  return (
    <section id="data-plans" style={{
      padding: '120px 22px',
      background: '#fff',
    }}>
      <div style={{
        maxWidth: 980,
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 style={{
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 700,
            letterSpacing: '-0.003em',
            color: 'var(--text-primary)',
            marginBottom: 24,
          }}>Data Plans</h2>
          
          <p style={{
            fontSize: 18,
            fontWeight: 400,
            color: 'var(--text-secondary)',
            maxWidth: 540,
            margin: '0 auto 48px',
            lineHeight: 1.6,
          }}>
            Cheapest bundles from every network. Guaranteed delivery under 3 seconds.
          </p>
          
          <div style={{
            display: 'inline-flex',
            gap: 8,
            background: 'var(--bg-light)',
            padding: 8,
            borderRadius: 12,
            border: '1px solid var(--border)',
          }}>
            {networks.map(net => (
              <button key={net} onClick={() => setSelected(net)} style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: selected === net ? '#fff' : 'transparent',
                color: selected === net ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.2s',
                cursor: 'pointer',
                boxShadow: selected === net ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}>
                {net}
              </button>
            ))}
          </div>
        </div>
        
        {filtered.length === 0 ? (
          <p style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            padding: '40px 0',
          }}>Plans loading — open the app to see all available bundles.</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16,
          }}>
            {filtered.map(plan => (
              <a key={plan.id} href="/app" style={{
                padding: 24,
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: 20,
                transition: 'all 0.3s cubic-bezier(0.25,0.1,0.25,1)',
                display: 'block',
                textDecoration: 'none',
              }} onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.border = '1px solid var(--accent)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 20px rgba(0,113,227,0.08)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }} onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.border = '1px solid var(--border)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}>
                <p style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                }}>{plan.dataSize}</p>
                
                <p style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: 16,
                }}>
                  Valid {plan.validity}
                </p>
                
                <div style={{
                  paddingTop: 16,
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <p style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--accent)',
                  }}>₦{plan.price.toLocaleString()}</p>
                  
                  <p style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--accent)',
                  }}>Buy →</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{
      padding: '120px 22px',
      background: '#fff',
    }}>
      <div style={{
        maxWidth: 980,
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: 'clamp(36px, 6vw, 56px)',
          fontWeight: 700,
          letterSpacing: '-0.003em',
          color: 'var(--text-primary)',
          marginBottom: 24,
        }}>Ready to Start?</h2>
        
        <p style={{
          fontSize: 18,
          fontWeight: 400,
          color: 'var(--text-secondary)',
          maxWidth: 540,
          margin: '0 auto 48px',
          lineHeight: 1.6,
        }}>
          Get instant data delivery, cashback rewards, and a premium shopping experience.
        </p>
        
        <a href="/app" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 22px',
          background: 'var(--accent)',
          color: '#fff',
          borderRadius: 980,
          fontSize: 16,
          fontWeight: 600,
          transition: 'all 0.2s',
        }} onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)';
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
        }} onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        }}>
          Download App →
        </a>
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer style={{
      padding: '80px 22px 32px',
      background: '#1D1D1F',
      color: '#6E6E73',
      borderTop: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{
        maxWidth: 980,
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 40,
          marginBottom: 64,
        }} className="grid-2">
          <div>
            <p style={{
              fontWeight: 600,
              color: '#F5F5F7',
              marginBottom: 16,
              fontSize: 14,
            }}>SaukiMart</p>
            <p style={{
              fontSize: 13,
              lineHeight: 1.6,
              color: '#8E8E93',
            }}>Nigeria's fastest data reseller platform. Instant delivery, best prices, trusted by thousands.</p>
          </div>
          
          {[
            { title: 'Services', links: ['Buy Data', 'Device Store', 'SIM Activation'] },
            { title: 'Company', links: ['About', 'Privacy Policy', 'Terms'] },
            { title: 'Support', links: ['Help', 'Contact', 'FAQ'] },
          ].map(col => (
            <div key={col.title}>
              <p style={{
                fontWeight: 600,
                color: '#F5F5F7',
                marginBottom: 16,
                fontSize: 14,
              }}>
                {col.title}
              </p>
              {col.links.map(link => (
                <a key={link} href="#" style={{
                  display: 'block',
                  fontSize: 13,
                  color: '#8E8E93',
                  marginBottom: 12,
                  transition: 'color 0.2s',
                }} onMouseEnter={e => (e.currentTarget.style.color = '#F5F5F7')} onMouseLeave={e => (e.currentTarget.style.color = '#8E8E93')}>
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
        
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <p style={{ fontSize: 12, color: '#8E8E93' }}>© 2026 SaukiMart. All rights reserved.</p>
          <p style={{ fontSize: 12, color: '#8E8E93' }}>Nigeria's premium data reseller platform</p>
        </div>
      </div>
    </footer>
  );
}

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
      <AppleStyles />
      <Navigation />
      <main>
        <Hero />
        <Features />
        <DataPlans plans={plans} />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
