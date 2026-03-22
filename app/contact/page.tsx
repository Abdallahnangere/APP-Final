export default function ContactPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#F5F5F7',
        color: '#1D1D1F',
        fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',BlinkMacSystemFont,'Segoe UI',sans-serif",
      }}
    >
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '84px 20px 32px' }}>
        <div
          style={{
            borderRadius: 24,
            background: 'linear-gradient(135deg,#0B72E7,#0761C2)',
            padding: '36px 30px',
            color: '#FFFFFF',
            boxShadow: '0 16px 40px rgba(7,97,194,.24)',
          }}
        >
          <p style={{ fontSize: 12, letterSpacing: '.08em', opacity: 0.85, textTransform: 'uppercase', fontWeight: 700 }}>Contact SaukiMart</p>
          <h1 style={{ marginTop: 10, fontSize: 'clamp(32px,5vw,52px)', lineHeight: 1.06, letterSpacing: '-.03em' }}>Let us help you quickly.</h1>
          <p style={{ marginTop: 12, maxWidth: 620, lineHeight: 1.7, opacity: 0.95 }}>
            For account help, privacy requests, payment issues, or partnership inquiries, use any channel below.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px 64px' }}>
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
          {[
            { title: 'Email', value: 'support@saukimart.online', href: 'mailto:support@saukimart.online', note: 'Best for detailed support' },
            { title: 'WhatsApp', value: '+234 704 464 7081', href: 'https://wa.me/2347044647081', note: 'Fast response for urgent issues' },
            { title: 'Phone', value: '+234 806 193 4056', href: 'tel:+2348061934056', note: 'Business hours support' },
            { title: 'In-App Support', value: 'Open support chat', href: '/support', note: 'Chat directly with support' },
          ].map((c) => (
            <a
              key={c.title}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel={c.href.startsWith('http') ? 'noreferrer' : undefined}
              style={{
                display: 'block',
                borderRadius: 18,
                border: '1px solid rgba(15,23,42,.08)',
                background: '#FFFFFF',
                padding: '20px 18px',
                boxShadow: '0 8px 24px rgba(15,23,42,.05)',
              }}
            >
              <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: '#6E6E73', fontWeight: 700 }}>{c.title}</p>
              <p style={{ marginTop: 6, color: '#0B72E7', fontWeight: 800 }}>{c.value}</p>
              <p style={{ marginTop: 8, fontSize: 13, color: '#6E6E73' }}>{c.note}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
