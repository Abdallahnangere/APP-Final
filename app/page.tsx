'use client';
import { useState, useEffect } from 'react';

type Plan = { id: string; network: string; dataSize: string; validity: string; price: number };

const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Playfair+Display:wght@700;900&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--blue:#007AFF;--green:#34C759;--red:#FF3B30;--gold:#FFCC00;--bg:#F2F2F7;--card:#fff;--text:#1C1C1E;--sub:#6C6C70;--border:#E5E5EA}
    html{scroll-behavior:smooth}
    body{font-family:'DM Sans',system-ui,sans-serif;background:#fff;color:var(--text);-webkit-font-smoothing:antialiased}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(0,0,0,.12);border-radius:2px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
    @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(0,122,255,.3)}50%{box-shadow:0 0 40px rgba(0,122,255,.6)}}
    .fade{opacity:0;animation:fadeUp .7s cubic-bezier(.32,.72,0,1) both}
    .float{animation:float 5s ease-in-out infinite}
    a{text-decoration:none;color:inherit}
    button{border:none;cursor:pointer;font-family:inherit}
    @media(max-width:768px){.hide-mob{display:none!important}.grid-2{grid-template-columns:1fr!important}.hero-grid{grid-template-columns:1fr!important;text-align:center}.mockup-wrap{display:flex;justify-content:center}.hero-btns{justify-content:center!important}.hero-stats{justify-content:center!important}.feat-grid{grid-template-columns:1fr 1fr!important}.rev-grid{grid-template-columns:1fr 1fr!important}}
  `}</style>
);

function Ticker() {
  const items = ['⚡ Instant Data Delivery','✅ MTN · Airtel · Glo','🎁 Cashback Rewards','🔒 SMEDAN Certified','💳 Virtual Account Funding','📦 Quality Devices & SIMs','🌍 Airtel SIM Activation Worldwide','⭐ 10,000+ Happy Customers'];
  return (
    <div style={{background:'linear-gradient(90deg,#007AFF,#0040FF)',overflow:'hidden',height:38,display:'flex',alignItems:'center'}}>
      <div style={{display:'flex',gap:64,whiteSpace:'nowrap',animation:'ticker 32s linear infinite'}}>
        {[...items,...items].map((item,i)=>(
          <span key={i} style={{fontSize:13,fontWeight:600,color:'#fff',letterSpacing:.4}}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function Nav() {
  const [scrolled,setScrolled]=useState(false);
  const [open,setOpen]=useState(false);
  useEffect(()=>{const h=()=>setScrolled(window.scrollY>20);window.addEventListener('scroll',h);return()=>window.removeEventListener('scroll',h)},[]);
  return (
    <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,transition:'all .3s',background:scrolled?'rgba(255,255,255,.92)':'transparent',backdropFilter:scrolled?'blur(20px)':'none',borderBottom:scrolled?'1px solid rgba(0,0,0,.06)':'none'}}>
      <div style={{maxWidth:1120,margin:'0 auto',padding:'0 24px',height:66,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/" style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:38,height:38,borderRadius:11,background:'linear-gradient(135deg,#007AFF,#0040FF)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(0,122,255,.4)'}}>
            <span style={{color:'#fff',fontWeight:900,fontSize:16,fontFamily:"'DM Sans',sans-serif"}}>S</span>
          </div>
          <span style={{fontWeight:800,fontSize:19,color:'#1C1C1E',letterSpacing:-.5}}>SaukiMart</span>
        </a>
        <div className="hide-mob" style={{display:'flex',gap:32,alignItems:'center'}}>
          {[['Data Plans','#data-plans'],['Store','#store'],['Agents','#agents'],['Support','#support']].map(([l,h])=>(
            <a key={l} href={h} style={{fontSize:14,fontWeight:500,color:'#3C3C43',transition:'color .15s'}}
              onMouseEnter={e=>(e.currentTarget.style.color='#007AFF')} onMouseLeave={e=>(e.currentTarget.style.color='#3C3C43')}>{l}</a>
          ))}
          <a href="/app" style={{background:'#007AFF',color:'#fff',borderRadius:22,padding:'10px 22px',fontSize:14,fontWeight:700,transition:'all .2s',boxShadow:'0 4px 14px rgba(0,122,255,.35)'}}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-1px)';(e.currentTarget as HTMLElement).style.boxShadow='0 6px 20px rgba(0,122,255,.5)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='none';(e.currentTarget as HTMLElement).style.boxShadow='0 4px 14px rgba(0,122,255,.35)'}}>
            Open App →
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section style={{paddingTop:100,paddingBottom:80,background:'linear-gradient(165deg,#EEF6FF 0%,#F8FFFE 40%,#fff 70%)',overflow:'hidden'}}>
      <div className="hero-grid" style={{maxWidth:1120,margin:'0 auto',padding:'0 24px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center'}}>
        <div className="fade" style={{animationDelay:'.1s'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(0,122,255,.07)',border:'1px solid rgba(0,122,255,.15)',borderRadius:24,padding:'6px 16px',marginBottom:22}}>
            <span style={{fontSize:13}}>✅</span>
            <span style={{fontSize:13,fontWeight:700,color:'#007AFF'}}>SMEDAN Certified · Trusted by 10,000+</span>
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:58,fontWeight:900,lineHeight:1.08,color:'#1C1C1E',letterSpacing:-2,marginBottom:22}}>
            Fast Data.<br/><span style={{color:'#007AFF'}}>Better Prices.</span><br/>
            <span style={{fontSize:38,color:'#3C3C43'}}>Always Instant.</span>
          </h1>
          <p style={{fontSize:18,color:'#6C6C70',lineHeight:1.75,maxWidth:440,marginBottom:36}}>
            Buy MTN, Airtel & Glo data bundles in seconds. Fund your wallet, shop our store, and earn cashback — all in one premium platform.
          </p>
          <div className="hero-btns" style={{display:'flex',gap:14,flexWrap:'wrap',marginBottom:44}}>
            <a href="/app" style={{background:'#007AFF',color:'#fff',borderRadius:15,padding:'15px 30px',fontSize:16,fontWeight:700,display:'inline-flex',alignItems:'center',gap:9,transition:'all .2s',boxShadow:'0 6px 24px rgba(0,122,255,.38)'}}>
              Buy Data Now <span style={{fontSize:20}}>→</span>
            </a>
            <a href="#agents" style={{background:'#fff',color:'#1C1C1E',borderRadius:15,padding:'15px 30px',fontSize:16,fontWeight:600,border:'1.5px solid #E5E5EA',display:'inline-flex',alignItems:'center',gap:9,transition:'all .2s'}}>
              Become an Agent
            </a>
          </div>
          <div className="hero-stats" style={{display:'flex',gap:36}}>
            {[['10K+','Happy Users'],['₦50M+','Processed'],['< 3s','Avg Delivery'],['100%','Uptime']].map(([v,l])=>(
              <div key={l}><div style={{fontSize:22,fontWeight:900,color:'#1C1C1E',letterSpacing:-.5}}>{v}</div><div style={{fontSize:12,color:'#8E8E93',marginTop:3}}>{l}</div></div>
            ))}
          </div>
        </div>
        <div className="mockup-wrap fade" style={{display:'flex',justifyContent:'center',position:'relative',animationDelay:'.3s'}}>
          <div className="float" style={{width:285,background:'#1C1C1E',borderRadius:48,padding:13,boxShadow:'0 48px 96px rgba(0,0,0,.28)'}}>
            <div style={{background:'#000',borderRadius:38,overflow:'hidden',height:575}}>
              <div style={{background:'linear-gradient(165deg,#0050FF,#007AFF)',padding:'22px 18px 26px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
                  <div><p style={{color:'rgba(255,255,255,.7)',fontSize:11,fontWeight:500}}>Welcome back,</p><p style={{color:'#fff',fontSize:16,fontWeight:800}}>Abubakar A.</p></div>
                  <div style={{width:38,height:38,borderRadius:12,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900,fontSize:14}}>AA</div>
                </div>
                <p style={{color:'rgba(255,255,255,.6)',fontSize:11,marginBottom:5}}>Wallet Balance</p>
                <p style={{color:'#fff',fontSize:30,fontWeight:900,letterSpacing:-1}}>₦ 24,500<span style={{fontSize:16,opacity:.7}}>.00</span></p>
                <div style={{background:'rgba(255,255,255,.1)',borderRadius:11,padding:'10px 13px',marginTop:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div><p style={{color:'rgba(255,255,255,.6)',fontSize:10}}>Opay</p><p style={{color:'#fff',fontSize:14,fontWeight:700,letterSpacing:.5}}>3080 209 892</p></div>
                  <span style={{fontSize:16}}>📋</span>
                </div>
              </div>
              <div style={{background:'#F2F2F7',padding:'14px',flex:1}}>
                <p style={{fontSize:10,fontWeight:700,color:'#8E8E93',marginBottom:10,letterSpacing:.5}}>QUICK SERVICES</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14}}>
                  {[{icon:'📡',label:'Buy Data',bg:'#E8F0FE'},{icon:'🛒',label:'Store',bg:'#E8FAE8'},{icon:'📶',label:'SIM Activation',bg:'#FFF3E0'},{icon:'👤',label:'Profile',bg:'#FBE9E7'}].map(s=>(
                    <div key={s.label} style={{background:s.bg,borderRadius:13,padding:'13px 11px',display:'flex',flexDirection:'column',gap:5}}>
                      <span style={{fontSize:18}}>{s.icon}</span><span style={{fontSize:11,fontWeight:600,color:'#1C1C1E'}}>{s.label}</span>
                    </div>
                  ))}
                </div>
                {[{n:'MTN 2GB · 08033221',p:'-₦950',c:'#FF3B30'},{n:'Glo 1GB · 07011004',p:'-₦499',c:'#FF3B30'},{n:'Deposit',p:'+₦5,000',c:'#34C759'}].map((tx,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:i<2?'1px solid rgba(0,0,0,.05)':'none'}}>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <div style={{width:30,height:30,borderRadius:9,background:'#E8F0FE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>📡</div>
                      <div><p style={{fontSize:11,fontWeight:600,color:'#1C1C1E'}}>{tx.n.split(' ·')[0]}</p><p style={{fontSize:9,color:'#8E8E93'}}>{tx.n.split('·')[1]}</p></div>
                    </div>
                    <p style={{fontSize:12,fontWeight:800,color:tx.c}}>{tx.p}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {[{top:'8%',right:'-20%',left:'auto',bg:'#E8FAE8',icon:'✅',label:'Instant'},
            {top:'52%',right:'-22%',left:'auto',bg:'#FFF3E0',icon:'🎁',label:'Cashback'},
            {top:'80%',left:'-18%',right:'auto',bg:'#E8F0FE',icon:'🔒',label:'Secure'}].map((b,i)=>(
            <div key={i} style={{position:'absolute',...(b as Record<string,string>),display:'flex',alignItems:'center',gap:7,background:b.bg,borderRadius:40,padding:'8px 14px',boxShadow:'0 6px 20px rgba(0,0,0,.1)',whiteSpace:'nowrap'}}>
              <span style={{fontSize:15}}>{b.icon}</span><span style={{fontSize:12,fontWeight:700,color:'#1C1C1E'}}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Plans({plans}:{plans:Plan[]}) {
  const [net,setNet]=useState('MTN');
  const filtered=plans.filter(p=>p.network.toUpperCase()===net);
  const nets=[{id:'MTN',emoji:'🟡',color:'#FFCC00'},{id:'GLO',emoji:'🟢',color:'#00892C'},{id:'AIRTEL',emoji:'🔴',color:'#E40000'}];
  return (
    <section id="data-plans" style={{padding:'80px 24px',background:'#F2F2F7'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:52}}>
          <p style={{color:'#007AFF',fontWeight:700,fontSize:13,letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>Data Plans</p>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:46,fontWeight:900,color:'#1C1C1E',letterSpacing:-1.5}}>Nigeria's Best Prices</h2>
          <p style={{color:'#6C6C70',fontSize:17,marginTop:10}}>Cheapest data bundles — delivered under 3 seconds</p>
          <div style={{display:'inline-flex',gap:8,marginTop:28,background:'#fff',borderRadius:16,padding:6,boxShadow:'0 2px 14px rgba(0,0,0,.07)'}}>
            {nets.map(n=>(
              <button key={n.id} onClick={()=>setNet(n.id)} style={{padding:'10px 26px',borderRadius:11,border:'none',fontWeight:700,fontSize:14,transition:'all .2s',background:net===n.id?'#007AFF':'transparent',color:net===n.id?'#fff':'#6C6C70',boxShadow:net===n.id?'0 3px 10px rgba(0,122,255,.3)':'none'}}>
                {n.emoji} {n.id}
              </button>
            ))}
          </div>
        </div>
        {filtered.length===0?<p style={{textAlign:'center',color:'#8E8E93',padding:'40px 0'}}>Plans loading — open app to buy data instantly.</p>:(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(195px,1fr))',gap:16}}>
            {filtered.map(p=>(
              <a href="/app" key={p.id} style={{background:'#fff',borderRadius:22,padding:22,boxShadow:'0 2px 14px rgba(0,0,0,.06)',border:'1.5px solid transparent',transition:'all .22s',display:'block'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='#007AFF';(e.currentTarget as HTMLElement).style.transform='translateY(-4px)';(e.currentTarget as HTMLElement).style.boxShadow='0 10px 30px rgba(0,122,255,.15)'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='transparent';(e.currentTarget as HTMLElement).style.transform='none';(e.currentTarget as HTMLElement).style.boxShadow='0 2px 14px rgba(0,0,0,.06)'}}>
                <div style={{width:46,height:46,borderRadius:14,background:'#EEF5FF',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14,fontSize:22}}>📡</div>
                <div style={{fontSize:28,fontWeight:900,color:'#1C1C1E',letterSpacing:-.8}}>{p.dataSize}</div>
                <div style={{fontSize:13,color:'#8E8E93',marginTop:3}}>Valid {p.validity}</div>
                <div style={{marginTop:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:22,fontWeight:900,color:'#007AFF'}}>₦{p.price.toLocaleString()}</span>
                  <span style={{fontSize:12,fontWeight:700,color:'#34C759',background:'#E8FAE8',padding:'4px 10px',borderRadius:20}}>Buy →</span>
                </div>
              </a>
            ))}
          </div>
        )}
        <div style={{textAlign:'center',marginTop:36}}>
          <a href="/app" style={{display:'inline-flex',alignItems:'center',gap:8,background:'#007AFF',color:'#fff',borderRadius:14,padding:'14px 28px',fontWeight:700,fontSize:15}}>View All Plans & Buy Now →</a>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const f=[
    {icon:'⚡',title:'< 3 Second Delivery',desc:'Data hits the SIM in under 3 seconds. No waiting, no delays, no failed orders.',bg:'#FFF8E1'},
    {icon:'🔒',title:'Bank-Grade Security',desc:'SHA-256 encrypted PINs, Flutterwave PCI-DSS processing. Your money is safe.',bg:'#E8F0FE'},
    {icon:'🎁',title:'Cashback & Rewards',desc:'Earn cashback on every purchase. Referral bonuses. Real money back in your wallet.',bg:'#E8FAE8'},
    {icon:'🏦',title:'Personal Virtual Account',desc:'Get a dedicated virtual account at registration. Fund instantly via bank transfer.',bg:'#FBE9E7'},
    {icon:'🌍',title:'Global SIM Activation',desc:'Buy an Airtel SIM anywhere in the world and activate remotely with 30GB data.',bg:'#F3E8FF'},
    {icon:'📦',title:'Premium Device Store',desc:'Buy quality devices, SIM cards, and accessories shipped straight to your door.',bg:'#E0F7FA'},
  ];
  return (
    <section style={{padding:'80px 24px',background:'#fff'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <p style={{color:'#007AFF',fontWeight:700,fontSize:13,letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>Why SaukiMart</p>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:46,fontWeight:900,color:'#1C1C1E',letterSpacing:-1.5}}>Everything You Need</h2>
        </div>
        <div className="feat-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:22}}>
          {f.map(x=>(
            <div key={x.title} style={{background:x.bg,borderRadius:26,padding:30,transition:'transform .22s'}}
              onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-5px)')} onMouseLeave={e=>(e.currentTarget.style.transform='none')}>
              <div style={{fontSize:38,marginBottom:18}}>{x.icon}</div>
              <h3 style={{fontSize:18,fontWeight:800,color:'#1C1C1E',marginBottom:10}}>{x.title}</h3>
              <p style={{fontSize:14,color:'#3C3C43',lineHeight:1.65}}>{x.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SimActivation() {
  return (
    <section style={{padding:'80px 24px',background:'linear-gradient(135deg,#0040FF,#007AFF)'}}>
      <div style={{maxWidth:1120,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center'}} className="grid-2">
        <div>
          <span style={{background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,255,255,.2)',borderRadius:24,padding:'5px 15px',fontSize:12,fontWeight:700,color:'#fff',display:'inline-block',marginBottom:20}}>🌍 New Feature</span>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:44,fontWeight:900,color:'#fff',lineHeight:1.1,letterSpacing:-1,marginBottom:20}}>Airtel SIM<br/>Remote Activation</h2>
          <p style={{color:'rgba(255,255,255,.75)',fontSize:16,lineHeight:1.8,marginBottom:28}}>Buy an Airtel SIM card anywhere in the world. Send us the serial number or a photo. We'll activate a <strong style={{color:'#fff'}}>30GB monthly plan</strong> in under 1 hour — all for just ₦5,000.</p>
          {['Buy Airtel SIM anywhere globally','Send us the serial number / photo','We activate 30GB data in &lt; 1 hour','Valid for 30 days, renewable monthly'].map(b=>(
            <div key={b} style={{display:'flex',alignItems:'center',gap:12,marginBottom:13}}>
              <div style={{width:22,height:22,borderRadius:11,background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#fff',flexShrink:0}}>✓</div>
              <span style={{color:'rgba(255,255,255,.85)',fontSize:15}} dangerouslySetInnerHTML={{__html:b}} />
            </div>
          ))}
          <a href="/app" style={{display:'inline-flex',alignItems:'center',gap:9,background:'#FFCC00',color:'#000',borderRadius:15,padding:'15px 30px',fontSize:15,fontWeight:800,marginTop:28}}>Activate Now — ₦5,000 →</a>
        </div>
        <div style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',borderRadius:28,padding:36}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
            {[['📦','Step 1','Buy any Airtel SIM anywhere'],['📸','Step 2','Snap front & back of SIM pack'],['📨','Step 3','Submit in our app'],['⚡','Done','30GB activated in < 1 hour']].map(([i,s,d])=>(
              <div key={s} style={{background:'rgba(255,255,255,.08)',borderRadius:20,padding:20}}>
                <span style={{fontSize:28}}>{i}</span>
                <p style={{color:'#FFCC00',fontWeight:800,fontSize:13,marginTop:10}}>{s}</p>
                <p style={{color:'rgba(255,255,255,.7)',fontSize:13,marginTop:4,lineHeight:1.5}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Agents() {
  return (
    <section id="agents" style={{padding:'80px 24px',background:'linear-gradient(145deg,#1C1C1E,#000)'}}>
      <div style={{maxWidth:1120,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center'}} className="grid-2">
        <div>
          <span style={{background:'rgba(255,204,0,.12)',border:'1px solid rgba(255,204,0,.2)',borderRadius:24,padding:'5px 14px',fontSize:12,fontWeight:700,color:'#FFCC00',display:'inline-block',marginBottom:20}}>⭐ Agent Program</span>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:46,fontWeight:900,color:'#fff',lineHeight:1.1,letterSpacing:-1.5,marginBottom:20}}>Earn Money<br/>Reselling Data</h2>
          <p style={{color:'rgba(255,255,255,.6)',fontSize:16,lineHeight:1.8,marginBottom:28}}>Register free, fund your wallet, resell data to customers. Earn cashback on every single transaction automatically.</p>
          {['Free registration — zero startup cost','Cashback on every purchase','Personal virtual bank account','Real-time balance tracking','24/7 priority support'].map(b=>(
            <div key={b} style={{display:'flex',alignItems:'center',gap:12,marginBottom:13}}>
              <div style={{width:22,height:22,borderRadius:11,background:'#34C759',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff',flexShrink:0}}>✓</div>
              <span style={{color:'rgba(255,255,255,.8)',fontSize:15}}>{b}</span>
            </div>
          ))}
          <a href="/app" style={{display:'inline-flex',alignItems:'center',gap:9,background:'#FFCC00',color:'#000',borderRadius:15,padding:'15px 30px',fontSize:15,fontWeight:800,marginTop:24}}>Register as Agent →</a>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          {[{l:'Active Agents',v:'1,200+',i:'👥',bg:'rgba(255,255,255,.05)'},{l:'Avg Monthly Earnings',v:'₦12K+',i:'💰',bg:'rgba(52,199,89,.1)'},{l:'Data Plans',v:'50+',i:'📡',bg:'rgba(0,122,255,.1)'},{l:'Cashback Paid',v:'₦2M+',i:'🎁',bg:'rgba(255,204,0,.08)'}].map(s=>(
            <div key={s.l} style={{background:s.bg,border:'1px solid rgba(255,255,255,.07)',borderRadius:22,padding:'26px 20px'}}>
              <span style={{fontSize:28}}>{s.i}</span>
              <p style={{fontSize:28,fontWeight:900,color:'#fff',marginTop:12,letterSpacing:-.8}}>{s.v}</p>
              <p style={{fontSize:12,color:'rgba(255,255,255,.4)',marginTop:4}}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const r=[
    {n:'Abubakar M.',l:'Kano',t:'SaukiMart changed my hustle. I make over ₦15k monthly reselling. The cashback is real and instant!'},
    {n:'Fatima A.',l:'Lagos',t:'Fastest data delivery ever experienced. Bought 2GB and it arrived in literally 2 seconds. Mind-blowing.'},
    {n:'Ibrahim K.',l:'Abuja',t:'The virtual account feature is genius. Customers transfer, I buy instantly. Super professional platform.'},
    {n:'Halima B.',l:'Kaduna',t:'Best Glo prices in Nigeria. I checked every platform — SaukiMart beats them all consistently.'},
  ];
  return (
    <section style={{padding:'80px 24px',background:'#F2F2F7'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:52}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:46,fontWeight:900,color:'#1C1C1E',letterSpacing:-1.5}}>Loved by Nigerians</h2>
          <p style={{color:'#6C6C70',fontSize:17,marginTop:10}}>Thousands trust SaukiMart every day</p>
        </div>
        <div className="rev-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
          {r.map(x=>(
            <div key={x.n} style={{background:'#fff',borderRadius:22,padding:26,boxShadow:'0 2px 14px rgba(0,0,0,.06)',transition:'transform .2s'}}
              onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-4px)')} onMouseLeave={e=>(e.currentTarget.style.transform='none')}>
              <div style={{display:'flex',gap:2,marginBottom:14}}>{'★★★★★'.split('').map((_,i)=><span key={i} style={{color:'#FFCC00',fontSize:16}}>★</span>)}</div>
              <p style={{fontSize:14,color:'#3C3C43',lineHeight:1.7,marginBottom:18}}>"{x.t}"</p>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:38,height:38,borderRadius:19,background:'linear-gradient(135deg,#007AFF,#0040FF)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:14}}>{x.n[0]}</div>
                <div><p style={{fontWeight:700,fontSize:13,color:'#1C1C1E'}}>{x.n}</p><p style={{fontSize:12,color:'#8E8E93'}}>{x.l}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Support() {
  return (
    <section id="support" style={{padding:'80px 24px',background:'#fff'}}>
      <div style={{maxWidth:680,margin:'0 auto',textAlign:'center'}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:44,fontWeight:900,color:'#1C1C1E',letterSpacing:-1.5,marginBottom:14}}>Need Help?</h2>
        <p style={{color:'#6C6C70',fontSize:17,lineHeight:1.7,marginBottom:40}}>Our team responds within 30 minutes. Reach us via WhatsApp or email anytime.</p>
        <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
          <a href="https://wa.me/2347044647081" target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:12,background:'#25D366',color:'#fff',borderRadius:15,padding:'16px 28px',fontWeight:700,fontSize:15}}>💬 WhatsApp Us</a>
          <a href="mailto:support@saukimart.online" style={{display:'flex',alignItems:'center',gap:12,background:'#F2F2F7',color:'#1C1C1E',borderRadius:15,padding:'16px 28px',fontWeight:700,fontSize:15,border:'1.5px solid #E5E5EA'}}>📧 Email Support</a>
        </div>
        <p style={{color:'#8E8E93',fontSize:13,marginTop:22}}>support@saukimart.online · +2347044647081 · +2348061934056</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{background:'#1C1C1E',color:'rgba(255,255,255,.55)',padding:'64px 24px 32px'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:48,marginBottom:52}} className="grid-2">
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
              <div style={{width:38,height:38,borderRadius:11,background:'linear-gradient(135deg,#007AFF,#0040FF)',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{color:'#fff',fontWeight:900,fontSize:16}}>S</span></div>
              <span style={{fontWeight:800,fontSize:19,color:'#fff'}}>SaukiMart</span>
            </div>
            <p style={{fontSize:14,lineHeight:1.8,maxWidth:270}}>Nigeria's fastest data reseller platform. Instant delivery, best prices, and cashback rewards.</p>
            <div style={{display:'flex',gap:10,marginTop:22,flexWrap:'wrap'}}>
              {['SMEDAN Certified','Flutterwave Partner','PCI-DSS Compliant'].map(b=>(
                <span key={b} style={{fontSize:10.5,fontWeight:600,color:'#8E8E93',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.07)',borderRadius:20,padding:'4px 11px'}}>{b}</span>
              ))}
            </div>
          </div>
          {[{t:'Services',l:['Buy Data','Device Store','SIM Activation','Agent Program']},{t:'Company',l:['About Us','Privacy Policy','Terms of Service','Contact']},{t:'Support',l:['WhatsApp','Email Us','FAQ','Report Issue']}].map(col=>(
            <div key={col.t}>
              <h4 style={{color:'#fff',fontWeight:700,fontSize:14,marginBottom:18}}>{col.t}</h4>
              {col.l.map(l=>(
                <a key={l} href={l==='Privacy Policy'?'/privacy':'#'} style={{display:'block',fontSize:13.5,color:'rgba(255,255,255,.45)',marginBottom:11,transition:'color .15s'}}
                  onMouseEnter={e=>(e.currentTarget.style.color='#007AFF')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,.45)')}>{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{borderTop:'1px solid rgba(255,255,255,.07)',paddingTop:26,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
          <p style={{fontSize:13}}>© {new Date().getFullYear()} SaukiMart: Data & Devices. All rights reserved.</p>
          <p style={{fontSize:13}}>Built with ❤️ for Nigerians</p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [plans,setPlans]=useState<Plan[]>([]);
  useEffect(()=>{fetch('/api/data-plans').then(r=>r.json()).then(d=>setPlans(Array.isArray(d)?d:[])).catch(()=>{})},[]);
  return (<><S/><Ticker/><Nav/><main><Hero/><Plans plans={plans}/><Features/><SimActivation/><Agents/><Testimonials/><Support/></main><Footer/></>);
}
