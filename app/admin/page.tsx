'use client';

/**
 * SaukiMart Admin Panel — /admin/page.tsx
 * Full CRUD: Products, DataPlans, Agents, Transactions, SystemMessages, Support, Webhooks, Console
 */

import React, { useState, useEffect, useCallback } from 'react';

// ─── TYPES ─────────────────────────────────────────────────────────────────
interface Agent { id: string; firstName: string; lastName: string; phone: string; balance: number; cashbackBalance: number; totalCashbackEarned: number; isActive: boolean; flwAccountNumber?: string; flwBankName?: string; flwAccountName?: string; createdAt: string; }
interface Product { id: string; name: string; description?: string; price: number; image: string; inStock: boolean; category: string; }
interface DataPlan { id: string; network: string; data: string; validity: string; price: number; planId: number; }
interface Transaction { id: string; tx_ref: string; type: string; status: string; phone: string; amount: number; agentCashbackAmount?: number; createdAt: string; dataPlan?: { network: string; data: string; validity: string }; product?: { name: string }; agent?: { firstName: string; lastName: string }; }
interface SystemMessage { id: string; content: string; type: string; isActive: boolean; createdAt: string; }
interface SupportTicket { id: string; phone: string; message: string; status: string; createdAt: string; }
interface WebhookLog { id: string; source: string; payload: any; createdAt: string; }

type Tab = 'dashboard' | 'agents' | 'products' | 'plans' | 'transactions' | 'messages' | 'support' | 'webhooks' | 'console';

// ─── STYLES ────────────────────────────────────────────────────────────────
const AdminStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', system-ui, sans-serif; background: #08080E; color: #CBD5E1; -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
    input, textarea, select { outline: none; font-family: inherit; }
    button { border: none; cursor: pointer; font-family: inherit; }

    .ai { background: #0F0F18; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; overflow: hidden; }
    .ai-p { background: #0F0F18; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 20px; }

    .inp { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 9px 13px; color: #E2E8F0; font-size: 14px; transition: border-color 0.2s; }
    .inp:focus { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.04); }
    .inp::placeholder { color: rgba(255,255,255,0.2); }
    select.inp option { background: #1a1a2e; }

    .btn { padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 600; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
    .btn-p { background: linear-gradient(135deg,#6366F1,#7C3AED); color: #fff; }
    .btn-p:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-d { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.18); }
    .btn-d:hover { background: rgba(239,68,68,0.22); }
    .btn-g { background: rgba(255,255,255,0.04); color: #94A3B8; border: 1px solid rgba(255,255,255,0.08); }
    .btn-g:hover { background: rgba(255,255,255,0.08); color: #CBD5E1; }
    .btn-s { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.18); }
    .btn-s:hover { background: rgba(34,197,94,0.22); }
    .btn-o { background: rgba(251,146,60,0.12); color: #fb923c; border: 1px solid rgba(251,146,60,0.18); }
    .btn-o:hover { background: rgba(251,146,60,0.22); }

    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .b-green { background: rgba(34,197,94,0.12); color: #4ade80; }
    .b-red { background: rgba(239,68,68,0.12); color: #f87171; }
    .b-yellow { background: rgba(251,191,36,0.12); color: #fbbf24; }
    .b-blue { background: rgba(99,102,241,0.12); color: #a5b4fc; }
    .b-purple { background: rgba(168,85,247,0.12); color: #c084fc; }
    .b-gray { background: rgba(255,255,255,0.06); color: #64748B; }

    .nav-link { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; color: #475569; font-size: 13.5px; font-weight: 500; cursor: pointer; transition: all 0.15s; width: 100%; background: none; border: none; }
    .nav-link:hover { background: rgba(255,255,255,0.04); color: #94A3B8; }
    .nav-link.active { background: rgba(99,102,241,0.14); color: #A5B4FC; }

    .tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
    .tbl th { padding: 10px 14px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #334155; border-bottom: 1px solid rgba(255,255,255,0.05); white-space: nowrap; }
    .tbl td { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.03); color: #64748B; vertical-align: middle; }
    .tbl tr:hover td { background: rgba(255,255,255,0.015); }
    .tbl tr:last-child td { border-bottom: none; }

    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: #0F0F18; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; padding: 28px; }

    @keyframes fi { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .fi { animation: fi 0.22s ease; }

    .spin { width: 18px; height: 18px; border: 2px solid rgba(99,102,241,0.2); border-top-color: #6366F1; border-radius: 50%; animation: rot 0.7s linear infinite; }
    @keyframes rot { to { transform: rotate(360deg); } }

    .code { font-family: 'JetBrains Mono', monospace; font-size: 12px; }

    .stat-g { background: linear-gradient(135deg,rgba(99,102,241,0.12),rgba(124,58,237,0.06)); border: 1px solid rgba(99,102,241,0.15); border-radius: 16px; padding: 20px; }
  `}</style>
);

// ─── HELPERS ───────────────────────────────────────────────────────────────
const Spinner = () => <div className="spin" />;

function useToast() {
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const show = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3200); };
  return { toast, show };
}

function Toast({ t }: { t: { msg: string; ok: boolean } }) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: '#0F0F18', border: `1px solid ${t.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 9, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', animation: 'fi 0.2s ease', maxWidth: 360 }}>
      <div style={{ width: 7, height: 7, borderRadius: 4, background: t.ok ? '#4ade80' : '#f87171', flexShrink: 0 }} />
      <span style={{ color: '#E2E8F0', fontSize: 13.5, fontWeight: 500 }}>{t.msg}</span>
    </div>
  );
}

function ModalConfirm({ title, desc, onConfirm, onCancel }: { title: string; desc: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 380 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0', marginBottom: 8 }}>{title}</h3>
        <p style={{ color: '#475569', fontSize: 14, marginBottom: 24 }}>{desc}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} className="btn btn-g" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
          <button onClick={onConfirm} className="btn btn-d" style={{ flex: 1, justifyContent: 'center' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function SectionHead({ title, sub, right }: { title: string; sub: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#E2E8F0', letterSpacing: -0.5 }}>{title}</h2>
        <p style={{ color: '#334155', fontSize: 13.5, marginTop: 3 }}>{sub}</p>
      </div>
      {right}
    </div>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <label style={{ display: 'block', fontSize: 11, color: '#475569', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7 }}>{label}</label>;
}

// ─── STATUS BADGES ─────────────────────────────────────────────────────────
const statusClass: Record<string, string> = { delivered: 'b-green', paid: 'b-blue', pending: 'b-yellow', failed: 'b-red', open: 'b-yellow', closed: 'b-green', active: 'b-green', suspended: 'b-red', data: 'b-blue', ecommerce: 'b-purple', wallet_funding: 'b-green', info: 'b-blue', warning: 'b-yellow', error: 'b-red', success: 'b-green' };

// ─── LOGIN ─────────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    setLoading(true); setErr('');
    try {
      const r = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
      if (!r.ok) throw new Error();
      onLogin();
    } catch { setErr('Invalid password.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08080E' }}>
      <div style={{ width: 360, padding: 36, background: '#0F0F18', borderRadius: 24, border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, background: 'linear-gradient(135deg,#6366F1,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24 }}>⚡</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#E2E8F0', letterSpacing: -0.5 }}>Admin Console</h1>
          <p style={{ color: '#334155', fontSize: 13, marginTop: 4 }}>SaukiMart Management System</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Admin password" className="inp" autoFocus style={{ padding: '12px 14px', fontSize: 15 }} />
          {err && <p style={{ color: '#f87171', fontSize: 13 }}>{err}</p>}
          <button onClick={submit} disabled={loading} className="btn btn-p" style={{ justifyContent: 'center', padding: '12px', fontSize: 15, width: '100%' }}>
            {loading ? <Spinner /> : 'Sign In →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [agR, prR, plR, txR] = await Promise.all([
          fetch('/api/admin/agents').then(r => r.json()),
          fetch('/api/products').then(r => r.json()),
          fetch('/api/data-plans').then(r => r.json()),
          fetch('/api/transactions/list?limit=200').then(r => r.json()),
        ]);
        const agents = Array.isArray(agR) ? agR : [];
        const products = Array.isArray(prR) ? prR : [];
        const plans = Array.isArray(plR) ? plR : [];
        const txs: Transaction[] = Array.isArray(txR) ? txR : (txR?.transactions || []);
        setRecentTx(txs.slice(0, 8));
        setStats({
          agents: agents.length, active: agents.filter((a: any) => a.isActive).length,
          products: products.length, plans: plans.length,
          txCount: txs.length,
          revenue: txs.filter(t => ['delivered','paid'].includes(t.status)).reduce((s, t) => s + t.amount, 0),
          pending: txs.filter(t => t.status === 'pending').length,
          failed: txs.filter(t => t.status === 'failed').length,
          walletTotal: agents.reduce((s: number, a: any) => s + (a.balance || 0), 0),
          cashbackTotal: agents.reduce((s: number, a: any) => s + (a.cashbackBalance || 0), 0),
        });
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Spinner /></div>;

  const kpis = [
    { label: 'Total Revenue', value: `₦${(stats?.revenue || 0).toLocaleString()}`, icon: '💰', cls: 'b-green' },
    { label: 'Transactions', value: (stats?.txCount || 0).toLocaleString(), icon: '💳', cls: 'b-blue' },
    { label: 'Registered Users', value: stats?.agents || 0, icon: '👥', cls: 'b-purple' },
    { label: 'Pending Orders', value: stats?.pending || 0, icon: '⏳', cls: 'b-yellow' },
    { label: 'Failed Orders', value: stats?.failed || 0, icon: '❌', cls: 'b-red' },
    { label: 'Wallet Holdings', value: `₦${(stats?.walletTotal || 0).toLocaleString()}`, icon: '🏦', cls: 'b-blue' },
    { label: 'Cashback Owed', value: `₦${(stats?.cashbackTotal || 0).toFixed(0)}`, icon: '🎁', cls: 'b-purple' },
    { label: 'Products', value: `${stats?.products || 0} / ${stats?.plans || 0} plans`, icon: '📦', cls: 'b-gray' },
  ];

  return (
    <div className="fi">
      <SectionHead title="Dashboard" sub="Platform at a glance" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {kpis.map(k => (
          <div key={k.label} className="stat-g">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{k.icon}</span>
              <span className={`badge ${k.cls}`}>{typeof k.value === 'number' && k.value === 0 ? '—' : ''}</span>
            </div>
            <p style={{ fontSize: 24, fontWeight: 800, color: '#E2E8F0', letterSpacing: -0.8 }}>{k.value}</p>
            <p style={{ fontSize: 12.5, color: '#334155', marginTop: 4 }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="ai">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: 0.8 }}>Recent Transactions</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead><tr><th>Ref</th><th>Type</th><th>Phone</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {recentTx.map(tx => (
                <tr key={tx.id}>
                  <td className="code" style={{ color: '#6366F1' }}>{tx.tx_ref?.slice(-12) || '—'}</td>
                  <td><span className={`badge ${statusClass[tx.type] || 'b-gray'}`}>{tx.type}</span></td>
                  <td>{tx.phone}</td>
                  <td style={{ color: '#4ade80', fontWeight: 600 }}>₦{tx.amount.toLocaleString()}</td>
                  <td><span className={`badge ${statusClass[tx.status] || 'b-gray'}`}>{tx.status}</span></td>
                  <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── AGENTS ────────────────────────────────────────────────────────────────
function Agents({ showToast }: { showToast: (m: string, ok?: boolean) => void }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<Agent | null>(null);
  const [balModal, setBalModal] = useState<Agent | null>(null);
  const [balAmount, setBalAmount] = useState('');
  const [balType, setBalType] = useState<'credit' | 'debit'>('credit');
  const [balLoading, setBalLoading] = useState(false);
  const [agentTxs, setAgentTxs] = useState<Transaction[]>([]);
  const [showTxModal, setShowTxModal] = useState<Agent | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch('/api/admin/agents'); setAgents(await r.json()); } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (a: Agent) => {
    try {
      const r = await fetch(`/api/admin/agents/${a.id}/toggle`, { method: 'POST' });
      if (!r.ok) throw new Error();
      showToast(`Agent ${a.isActive ? 'suspended' : 'activated'}`);
      load();
    } catch { showToast('Failed', false); }
  };

  const adjustBal = async () => {
    if (!balAmount || !balModal) return;
    setBalLoading(true);
    try {
      const r = await fetch(`/api/admin/agents/${balModal.id}/balance`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(balAmount), type: balType }),
      });
      if (!r.ok) throw new Error();
      showToast(`₦${parseFloat(balAmount).toLocaleString()} ${balType}ed`);
      setBalModal(null); setBalAmount(''); load();
    } catch { showToast('Failed', false); }
    finally { setBalLoading(false); }
  };

  const loadTxs = async (a: Agent) => {
    setShowTxModal(a);
    try {
      const r = await fetch(`/api/admin/agents/${a.id}/transactions`);
      const d = await r.json();
      setAgentTxs(d.transactions || d || []);
    } catch {}
  };

  const filtered = agents.filter(a =>
    `${a.firstName} ${a.lastName} ${a.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fi">
      {detail && (
        <div className="overlay">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0' }}>Agent Details</h3>
              <button onClick={() => setDetail(null)} className="btn btn-g" style={{ padding: '4px 10px' }}>✕</button>
            </div>
            {([
              ['Full Name', `${detail.firstName} ${detail.lastName}`],
              ['Phone', detail.phone],
              ['Balance', `₦${detail.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`],
              ['Cashback Balance', `₦${detail.cashbackBalance.toFixed(2)}`],
              ['Total Earned', `₦${(detail.totalCashbackEarned || 0).toFixed(2)}`],
              ['Account Number', detail.flwAccountNumber || '—'],
              ['Account Name', detail.flwAccountName || '—'],
              ['Bank', detail.flwBankName || '—'],
              ['Status', detail.isActive ? '✅ Active' : '❌ Suspended'],
              ['Member Since', new Date(detail.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#475569', fontSize: 13.5 }}>{l}</span>
                <span style={{ color: '#CBD5E1', fontSize: 13.5, fontWeight: 500, textAlign: 'right', maxWidth: 220 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={() => { setDetail(null); setBalModal(detail); }} className="btn btn-p" style={{ flex: 1, justifyContent: 'center' }}>💰 Adjust Balance</button>
              <button onClick={() => { setDetail(null); loadTxs(detail); }} className="btn btn-g" style={{ flex: 1, justifyContent: 'center' }}>📋 Transactions</button>
            </div>
          </div>
        </div>
      )}

      {balModal && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>Adjust Balance</h3>
            <p style={{ color: '#475569', fontSize: 13, marginBottom: 20 }}>{balModal.firstName} {balModal.lastName} — Current: <strong style={{ color: '#4ade80' }}>₦{balModal.balance.toLocaleString()}</strong></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['credit', 'debit'] as const).map(t => (
                  <button key={t} onClick={() => setBalType(t)} className={`btn ${balType === t ? (t === 'credit' ? 'btn-s' : 'btn-d') : 'btn-g'}`} style={{ flex: 1, justifyContent: 'center', textTransform: 'capitalize' }}>{t}</button>
                ))}
              </div>
              <div>
                <FieldLabel label="Amount (₦)" />
                <input value={balAmount} onChange={e => setBalAmount(e.target.value)} placeholder="0.00" type="number" className="inp" />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={() => { setBalModal(null); setBalAmount(''); }} className="btn btn-g" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={adjustBal} disabled={balLoading} className="btn btn-p" style={{ flex: 1, justifyContent: 'center' }}>
                  {balLoading ? <Spinner /> : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTxModal && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 680 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0' }}>{showTxModal.firstName}'s Transactions</h3>
              <button onClick={() => setShowTxModal(null)} className="btn btn-g" style={{ padding: '4px 10px' }}>✕</button>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              <table className="tbl">
                <thead><tr><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {agentTxs.map(tx => (
                    <tr key={tx.id}>
                      <td><span className={`badge ${statusClass[tx.type] || 'b-gray'}`}>{tx.type}</span></td>
                      <td style={{ color: '#4ade80', fontWeight: 600 }}>₦{tx.amount.toLocaleString()}</td>
                      <td><span className={`badge ${statusClass[tx.status] || 'b-gray'}`}>{tx.status}</span></td>
                      <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <SectionHead title="Users / Agents" sub={`${agents.length} registered accounts`} right={
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or phone…" className="inp" style={{ width: 240 }} />
          <button onClick={load} className="btn btn-g">↻</button>
        </div>
      } />

      <div className="ai">
        {loading ? <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr><th>Name</th><th>Phone</th><th>Balance</th><th>Cashback</th><th>Account #</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td style={{ color: '#CBD5E1', fontWeight: 600 }}>{a.firstName} {a.lastName}</td>
                    <td className="code">{a.phone}</td>
                    <td style={{ color: '#4ade80', fontWeight: 600 }}>₦{a.balance.toLocaleString()}</td>
                    <td>₦{a.cashbackBalance.toFixed(2)}</td>
                    <td className="code" style={{ fontSize: 12 }}>{a.flwAccountNumber || '—'}</td>
                    <td><span className={`badge ${a.isActive ? 'b-green' : 'b-red'}`}>{a.isActive ? 'Active' : 'Suspended'}</span></td>
                    <td style={{ fontSize: 12 }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => setDetail(a)} className="btn btn-g" style={{ padding: '4px 9px', fontSize: 12 }}>View</button>
                        <button onClick={() => setBalModal(a)} className="btn btn-p" style={{ padding: '4px 9px', fontSize: 12 }}>₦</button>
                        <button onClick={() => toggle(a)} className={`btn ${a.isActive ? 'btn-d' : 'btn-s'}`} style={{ padding: '4px 9px', fontSize: 12 }}>
                          {a.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PRODUCTS ──────────────────────────────────────────────────────────────
function Products({ showToast }: { showToast: (m: string, ok?: boolean) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Product> | null>(null);
  const [del, setDel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch('/api/products'); setProducts(await r.json()); } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!modal?.name || !modal?.price) return showToast('Name and price are required', false);
    setSaving(true);
    try {
      const r = await fetch(modal.id ? `/api/admin/products/${modal.id}` : '/api/admin/products', {
        method: modal.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modal),
      });
      if (!r.ok) throw new Error();
      showToast(modal.id ? 'Product updated' : 'Product created');
      setModal(null); load();
    } catch { showToast('Save failed', false); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      showToast('Product deleted');
      setDel(null); load();
    } catch { showToast('Delete failed', false); }
  };

  const F = ({ label, field, type = 'text', placeholder = '' }: { label: string; field: keyof Product; type?: string; placeholder?: string }) => (
    <div>
      <FieldLabel label={label} />
      <input type={type} value={(modal as any)?.[field] ?? ''} onChange={e => setModal(m => ({ ...m, [field]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }) as any)} placeholder={placeholder} className="inp" />
    </div>
  );

  return (
    <div className="fi">
      {del && <ModalConfirm title="Delete Product?" desc="This action cannot be undone." onConfirm={() => remove(del)} onCancel={() => setDel(null)} />}
      {modal && (
        <div className="overlay">
          <div className="modal">
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0', marginBottom: 20 }}>{modal.id ? 'Edit Product' : 'New Product'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <F label="Name *" field="name" />
              <F label="Description" field="description" placeholder="Optional" />
              <F label="Price (₦) *" field="price" type="number" />
              <F label="Image URL" field="image" placeholder="https://..." />
              <div>
                <FieldLabel label="Category" />
                <select value={modal.category || 'device'} onChange={e => setModal(m => ({ ...m, category: e.target.value }) as any)} className="inp">
                  {['device', 'sim', 'package'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 9, color: '#94A3B8', fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={modal.inStock !== false} onChange={e => setModal(m => ({ ...m, inStock: e.target.checked }) as any)} />
                In Stock
              </label>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button onClick={() => setModal(null)} className="btn btn-g" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={save} disabled={saving} className="btn btn-p" style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? <Spinner /> : 'Save Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SectionHead title="Products" sub={`${products.length} items in store`} right={
        <button onClick={() => setModal({ inStock: true, category: 'device' })} className="btn btn-p">+ New Product</button>
      } />

      <div className="ai">
        {loading ? <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.image ? <img src={p.image} alt="" style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 8 }} /> : <div style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }} />}</td>
                    <td style={{ color: '#CBD5E1', fontWeight: 600 }}>{p.name}</td>
                    <td><span className="badge b-purple">{p.category}</span></td>
                    <td style={{ color: '#4ade80', fontWeight: 600 }}>₦{p.price.toLocaleString()}</td>
                    <td><span className={`badge ${p.inStock ? 'b-green' : 'b-red'}`}>{p.inStock ? 'In Stock' : 'Out'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => setModal(p)} className="btn btn-g" style={{ padding: '4px 9px', fontSize: 12 }}>Edit</button>
                        <button onClick={() => setDel(p.id)} className="btn btn-d" style={{ padding: '4px 9px', fontSize: 12 }}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DATA PLANS ─────────────────────────────────────────────────────────────
function DataPlans({ showToast }: { showToast: (m: string, ok?: boolean) => void }) {
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<DataPlan> | null>(null);
  const [del, setDel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [netFilter, setNetFilter] = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch('/api/data-plans'); setPlans(await r.json()); } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!modal?.network || !modal?.data || !modal?.validity || !modal?.price) return showToast('All fields required', false);
    setSaving(true);
    try {
      const r = await fetch(modal.id ? `/api/admin/data-plans/${modal.id}` : '/api/admin/data-plans', {
        method: modal.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modal),
      });
      if (!r.ok) throw new Error();
      showToast(modal.id ? 'Plan updated' : 'Plan created');
      setModal(null); load();
    } catch { showToast('Save failed', false); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    try {
      await fetch(`/api/admin/data-plans/${id}`, { method: 'DELETE' });
      showToast('Plan deleted');
      setDel(null); load();
    } catch { showToast('Failed', false); }
  };

  const netColors: Record<string, string> = { MTN: '#FFCC00', AIRTEL: '#E40000', GLO: '#00892C' };
  const filtered = netFilter === 'ALL' ? plans : plans.filter(p => p.network === netFilter);

  return (
    <div className="fi">
      {del && <ModalConfirm title="Delete Plan?" desc="Agents won't be able to purchase this plan." onConfirm={() => remove(del)} onCancel={() => setDel(null)} />}
      {modal && (
        <div className="overlay">
          <div className="modal">
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0', marginBottom: 20 }}>{modal.id ? 'Edit Plan' : 'New Data Plan'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div>
                <FieldLabel label="Network *" />
                <select value={modal.network || ''} onChange={e => setModal(m => ({ ...m, network: e.target.value }) as any)} className="inp">
                  <option value="">Select network…</option>
                  {['MTN', 'AIRTEL', 'GLO'].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              {([
                { label: 'Data Size *', field: 'data', placeholder: 'e.g. 5GB' },
                { label: 'Validity *', field: 'validity', placeholder: 'e.g. 30 Days' },
                { label: 'Price (₦) *', field: 'price', type: 'number' },
                { label: 'Amigo Plan ID *', field: 'planId', type: 'number', placeholder: 'API plan ID' },
              ] as any[]).map(({ label, field, type = 'text', placeholder = '' }) => (
                <div key={field}>
                  <FieldLabel label={label} />
                  <input type={type} value={(modal as any)[field] ?? ''} onChange={e => setModal(m => ({ ...m, [field]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }) as any)} placeholder={placeholder} className="inp" />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button onClick={() => setModal(null)} className="btn btn-g" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={save} disabled={saving} className="btn btn-p" style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? <Spinner /> : 'Save Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SectionHead title="Data Plans" sub={`${plans.length} plans configured`} right={
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL', 'MTN', 'AIRTEL', 'GLO'].map(n => (
              <button key={n} onClick={() => setNetFilter(n)} className={`btn ${netFilter === n ? 'btn-p' : 'btn-g'}`} style={{ padding: '6px 12px' }}>{n}</button>
            ))}
          </div>
          <button onClick={() => setModal({})} className="btn btn-p">+ New Plan</button>
        </div>
      } />

      <div className="ai">
        {loading ? <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr><th>Network</th><th>Data</th><th>Validity</th><th>Price</th><th>Amigo ID</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 5, background: netColors[p.network] || '#fff', display: 'inline-block' }} />
                        <span style={{ color: '#CBD5E1', fontWeight: 700 }}>{p.network}</span>
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#E2E8F0', fontSize: 15 }}>{p.data}</td>
                    <td>{p.validity}</td>
                    <td style={{ color: '#4ade80', fontWeight: 600 }}>₦{p.price.toLocaleString()}</td>
                    <td className="code" style={{ color: '#6366F1' }}>{p.planId}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => setModal(p)} className="btn btn-g" style={{ padding: '4px 9px', fontSize: 12 }}>Edit</button>
                        <button onClick={() => setDel(p.id)} className="btn btn-d" style={{ padding: '4px 9px', fontSize: 12 }}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────
function Transactions({ showToast }: { showToast: (m: string, ok?: boolean) => void }) {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<Transaction | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '500' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const r = await fetch(`/api/transactions/list?${params}`);
      const d = await r.json();
      setTxs(Array.isArray(d) ? d : (d?.transactions || []));
    } catch {}
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const r = await fetch(`/api/admin/transactions/${id}/status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error();
      showToast(`Status updated to ${status}`);
      load();
    } catch { showToast('Update failed', false); }
    finally { setUpdating(null); }
  };

  const filtered = txs.filter(t => {
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchSearch = !search || t.phone.includes(search) || t.tx_ref?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const statuses = ['all', 'pending', 'paid', 'delivered', 'failed'];
  const types = ['all', 'data', 'ecommerce', 'wallet_funding'];

  return (
    <div className="fi">
      {detail && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0' }}>Transaction Details</h3>
              <button onClick={() => setDetail(null)} className="btn btn-g" style={{ padding: '4px 10px' }}>✕</button>
            </div>
            {([
              ['Reference', detail.tx_ref],
              ['Type', detail.type],
              ['Status', detail.status],
              ['Phone', detail.phone],
              ['Amount', `₦${detail.amount.toLocaleString()}`],
              ['Cashback', `₦${(detail.agentCashbackAmount || 0).toFixed(2)}`],
              ['Data Plan', detail.dataPlan ? `${detail.dataPlan.data} (${detail.dataPlan.network})` : '—'],
              ['Product', detail.product?.name || '—'],
              ['Agent', detail.agent ? `${detail.agent.firstName} ${detail.agent.lastName}` : '—'],
              ['Date', new Date(detail.createdAt).toLocaleString()],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#475569', fontSize: 13 }}>{l}</span>
                <span style={{ color: '#CBD5E1', fontSize: 13, fontWeight: 500, fontFamily: l === 'Reference' ? 'monospace' : 'inherit' }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <FieldLabel label="Update Status" />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['pending', 'paid', 'delivered', 'failed'].map(s => (
                  <button key={s} onClick={() => { updateStatus(detail.id, s); setDetail(null); }}
                    className={`btn ${detail.status === s ? 'btn-p' : 'btn-g'}`} style={{ padding: '6px 12px', textTransform: 'capitalize' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <SectionHead title="Transactions" sub={`${txs.length} total records`} right={
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search phone / ref…" className="inp" style={{ width: 200 }} />
          <button onClick={load} className="btn btn-g">↻</button>
        </div>
      } />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`btn ${statusFilter === s ? 'btn-p' : 'btn-g'}`} style={{ padding: '5px 12px', textTransform: 'capitalize' }}>{s}</button>
        ))}
        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`btn ${typeFilter === t ? 'btn-o' : 'btn-g'}`} style={{ padding: '5px 12px', textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      <div className="ai">
        {loading ? <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr><th>Ref</th><th>Type</th><th>Phone</th><th>Amount</th><th>Status</th><th>Agent</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.slice(0, 100).map(tx => (
                  <tr key={tx.id}>
                    <td className="code" style={{ color: '#6366F1', fontSize: 11 }}>{tx.tx_ref?.slice(-14) || '—'}</td>
                    <td><span className={`badge ${statusClass[tx.type] || 'b-gray'}`}>{tx.type}</span></td>
                    <td>{tx.phone}</td>
                    <td style={{ color: '#4ade80', fontWeight: 600 }}>₦{tx.amount.toLocaleString()}</td>
                    <td><span className={`badge ${statusClass[tx.status] || 'b-gray'}`}>{tx.status}</span></td>
                    <td style={{ fontSize: 12 }}>{tx.agent ? `${tx.agent.firstName}` : '—'}</td>
                    <td style={{ fontSize: 12 }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => setDetail(tx)} className="btn btn-g" style={{ padding: '4px 9px', fontSize: 12 }}>View</button>
                        {tx.status === 'pending' && (
                          <button onClick={() => updateStatus(tx.id, 'delivered')} disabled={!!updating} className="btn btn-s" style={{ padding: '4px 9px', fontSize: 12 }}>
                            {updating === tx.id ? <Spinner /> : '✓ Mark Delivered'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SYSTEM MESSAGES ──────────────────────────────────────────────────────
function SystemMessages({ showToast }: { showToast: (m: string, ok?: boolean) => void }) {
  const [msgs, setMsgs] = useState<SystemMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<SystemMessage> | null>(null);
  const [del, setDel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch('/api/admin/messages'); setMsgs(await r.json()); } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!modal?.content) return showToast('Content required', false);
    setSaving(true);
    try {
      const r = await fetch(modal.id ? `/api/admin/messages/${modal.id}` : '/api/admin/messages', {
        method: modal.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modal),
      });
      if (!r.ok) throw new Error();
      showToast(modal.id ? 'Message updated' : 'Message created');
      setModal(null); load();
    } catch { showToast('Save failed', false); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    showToast('Message deleted');
    setDel(null); load();
  };

  const toggleActive = async (m: SystemMessage) => {
    try {
      await fetch(`/api/admin/messages/${m.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...m, isActive: !m.isActive }),
      });
      showToast(`Message ${m.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch { showToast('Failed', false); }
  };

  return (
    <div className="fi">
      {del && <ModalConfirm title="Delete Message?" desc="The message will be removed." onConfirm={() => remove(del)} onCancel={() => setDel(null)} />}
      {modal && (
        <div className="overlay">
          <div className="modal">
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0', marginBottom: 20 }}>{modal.id ? 'Edit Message' : 'New System Message'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div>
                <FieldLabel label="Message Content *" />
                <textarea value={modal.content || ''} onChange={e => setModal(m => ({ ...m, content: e.target.value }) as any)} placeholder="Announcement text…" className="inp" rows={4} style={{ resize: 'vertical' }} />
              </div>
              <div>
                <FieldLabel label="Type" />
                <select value={modal.type || 'info'} onChange={e => setModal(m => ({ ...m, type: e.target.value }) as any)} className="inp">
                  {['info', 'warning', 'error', 'success'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 9, color: '#94A3B8', fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={modal.isActive !== false} onChange={e => setModal(m => ({ ...m, isActive: e.target.checked }) as any)} />
                Active (visible to users)
              </label>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button onClick={() => setModal(null)} className="btn btn-g" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={save} disabled={saving} className="btn btn-p" style={{ flex: 1, justifyContent: 'center' }}>
                  {saving ? <Spinner /> : 'Save Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SectionHead title="System Messages" sub="Announcements visible to app users" right={
        <button onClick={() => setModal({ isActive: true, type: 'info' })} className="btn btn-p">+ New Message</button>
      } />

      <div className="ai">
        {loading ? <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr><th>Content</th><th>Type</th><th>Active</th><th>Created</th><th>Actions</th></tr></thead>
              <tbody>
                {msgs.map(m => (
                  <tr key={m.id}>
                    <td style={{ maxWidth: 300, color: '#CBD5E1' }}><span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.content}</span></td>
                    <td><span className={`badge ${statusClass[m.type] || 'b-gray'}`}>{m.type}</span></td>
                    <td><span className={`badge ${m.isActive ? 'b-green' : 'b-gray'}`}>{m.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ fontSize: 12 }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => setModal(m)} className="btn btn-g" style={{ padding: '4px 9px', fontSize: 12 }}>Edit</button>
                        <button onClick={() => toggleActive(m)} className={`btn ${m.isActive ? 'btn-d' : 'btn-s'}`} style={{ padding: '4px 9px', fontSize: 12 }}>{m.isActive ? 'Deactivate' : 'Activate'}</button>
                        <button onClick={() => setDel(m.id)} className="btn btn-d" style={{ padding: '4px 9px', fontSize: 12 }}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SUPPORT TICKETS ──────────────────────────────────────────────────────
function Support({ showToast }: { showToast: (m: string, ok?: boolean) => void }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState<SupportTicket | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/support');
      setTickets(await r.json());
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const closeTicket = async (id: string) => {
    try {
      await fetch(`/api/admin/support/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'closed' }) });
      showToast('Ticket closed');
      setDetail(null); load();
    } catch { showToast('Failed', false); }
  };

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div className="fi">
      {detail && (
        <div className="overlay">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0' }}>Support Ticket</h3>
              <button onClick={() => setDetail(null)} className="btn btn-g" style={{ padding: '4px 10px' }}>✕</button>
            </div>
            {([
              ['Phone', detail.phone],
              ['Status', detail.status],
              ['Created', new Date(detail.createdAt).toLocaleString()],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#475569', fontSize: 13 }}>{l}</span>
                <span style={{ color: '#CBD5E1', fontSize: 13, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <FieldLabel label="Message" />
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14, color: '#94A3B8', fontSize: 14, lineHeight: 1.7 }}>{detail.message}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <a href={`https://wa.me/${detail.phone.replace(/^0/, '234')}`} target="_blank" rel="noopener noreferrer" className="btn btn-s" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>💬 WhatsApp</a>
              {detail.status === 'open' && (
                <button onClick={() => closeTicket(detail.id)} className="btn btn-p" style={{ flex: 1, justifyContent: 'center' }}>✓ Close Ticket</button>
              )}
            </div>
          </div>
        </div>
      )}

      <SectionHead title="Support Tickets" sub={`${tickets.filter(t => t.status === 'open').length} open tickets`} right={
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'open', 'closed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn ${filter === f ? 'btn-p' : 'btn-g'}`} style={{ padding: '5px 12px', textTransform: 'capitalize' }}>{f}</button>
          ))}
          <button onClick={load} className="btn btn-g">↻</button>
        </div>
      } />

      <div className="ai">
        {loading ? <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#334155' }}>No tickets found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr><th>Phone</th><th>Message</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td>{t.phone}</td>
                    <td style={{ maxWidth: 300 }}><span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: '#94A3B8' }}>{t.message}</span></td>
                    <td><span className={`badge ${statusClass[t.status] || 'b-gray'}`}>{t.status}</span></td>
                    <td style={{ fontSize: 12 }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => setDetail(t)} className="btn btn-g" style={{ padding: '4px 9px', fontSize: 12 }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WEBHOOKS ─────────────────────────────────────────────────────────────
function Webhooks({ showToast }: { showToast: (m: string, ok?: boolean) => void }) {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<WebhookLog | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch('/api/admin/webhooks'); const d = await r.json(); setLogs(Array.isArray(d) ? d : (d?.logs || [])); } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="fi">
      {detail && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 620 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0' }}>Webhook Payload</h3>
              <button onClick={() => setDetail(null)} className="btn btn-g" style={{ padding: '4px 10px' }}>✕</button>
            </div>
            <p style={{ color: '#475569', fontSize: 12.5, marginBottom: 12 }}>Source: <strong style={{ color: '#a5b4fc' }}>{detail.source}</strong> · {new Date(detail.createdAt).toLocaleString()}</p>
            <pre className="code" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 16, color: '#94A3B8', overflowX: 'auto', maxHeight: 400, fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify(detail.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <SectionHead title="Webhook Logs" sub="Incoming payment & delivery webhooks" right={
        <button onClick={load} className="btn btn-g">↻ Refresh</button>
      } />

      <div className="ai">
        {loading ? <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr><th>Source</th><th>Event</th><th>Status</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {logs.map(l => {
                  const p = l.payload || {};
                  return (
                    <tr key={l.id}>
                      <td><span className="badge b-blue">{l.source}</span></td>
                      <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{p.event || p.type || '—'}</td>
                      <td><span className={`badge ${(p.data?.status === 'successful' || p.status === 'successful') ? 'b-green' : 'b-yellow'}`}>{p.data?.status || p.status || '—'}</span></td>
                      <td style={{ color: '#4ade80' }}>{p.data?.amount ? `₦${p.data.amount.toLocaleString()}` : '—'}</td>
                      <td style={{ fontSize: 12 }}>{new Date(l.createdAt).toLocaleString()}</td>
                      <td>
                        <button onClick={() => setDetail(l)} className="btn btn-g" style={{ padding: '4px 9px', fontSize: 12 }}>View JSON</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CONSOLE ──────────────────────────────────────────────────────────────
function DevConsole({ showToast }: { showToast: (m: string, ok?: boolean) => void }) {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [body, setBody] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!url) return;
    setLoading(true); setOutput('Loading…');
    try {
      const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
      if (['POST', 'PUT'].includes(method) && body) opts.body = body;
      const r = await fetch(url, opts);
      const text = await r.text();
      try {
        const json = JSON.parse(text);
        setOutput(`// HTTP ${r.status}\n${JSON.stringify(json, null, 2)}`);
      } catch { setOutput(`// HTTP ${r.status}\n${text}`); }
    } catch (e: any) { setOutput(`// Error\n${e.message}`); }
    finally { setLoading(false); }
  };

  const presets = [
    { label: 'List Agents', method: 'GET', url: '/api/admin/agents' },
    { label: 'List Products', method: 'GET', url: '/api/products' },
    { label: 'List Plans', method: 'GET', url: '/api/data-plans' },
    { label: 'Recent Transactions', method: 'GET', url: '/api/transactions/list?limit=10' },
    { label: 'Support Tickets', method: 'GET', url: '/api/admin/support' },
    { label: 'Webhook Logs', method: 'GET', url: '/api/admin/webhooks' },
    { label: 'System Messages', method: 'GET', url: '/api/admin/messages' },
  ];

  return (
    <div className="fi">
      <SectionHead title="API Console" sub="Test API endpoints directly" />

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: '#334155', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7 }}>Presets</p>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {presets.map(p => (
            <button key={p.label} onClick={() => { setMethod(p.method); setUrl(p.url); }} className="btn btn-g" style={{ padding: '5px 12px', fontSize: 12 }}>{p.label}</button>
          ))}
        </div>
      </div>

      <div className="ai-p" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <select value={method} onChange={e => setMethod(e.target.value)} className="inp" style={{ width: 100 }}>
            {['GET', 'POST', 'PUT', 'DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()} placeholder="/api/…" className="inp" style={{ flex: 1, fontFamily: 'monospace' }} />
          <button onClick={run} disabled={loading || !url} className="btn btn-p">
            {loading ? <Spinner /> : '▶ Run'}
          </button>
        </div>
        {['POST', 'PUT'].includes(method) && (
          <div>
            <FieldLabel label="Request Body (JSON)" />
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder='{"key": "value"}' className="inp code" rows={4} style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} />
          </div>
        )}
      </div>

      {output && (
        <div className="ai">
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: 0.7 }}>Response</p>
            <button onClick={() => navigator.clipboard?.writeText(output)} className="btn btn-g" style={{ padding: '3px 9px', fontSize: 11 }}>Copy</button>
          </div>
          <pre className="code" style={{ padding: 16, color: '#94A3B8', overflowX: 'auto', maxHeight: 500, fontSize: 12, lineHeight: 1.6 }}>{output}</pre>
        </div>
      )}
    </div>
  );
}

// ─── SIDEBAR ───────────────────────────────────────────────────────────────
const NAV_ITEMS: { key: Tab; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { key: 'agents', label: 'Users & Agents', icon: '👥' },
  { key: 'products', label: 'Products', icon: '📦' },
  { key: 'plans', label: 'Data Plans', icon: '📶' },
  { key: 'transactions', label: 'Transactions', icon: '💳' },
  { key: 'messages', label: 'System Messages', icon: '📢' },
  { key: 'support', label: 'Support Tickets', icon: '🎫' },
  { key: 'webhooks', label: 'Webhook Logs', icon: '🔗' },
  { key: 'console', label: 'API Console', icon: '⌨️' },
];

// ─── MAIN ADMIN ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast, show } = useToast();

  useEffect(() => {
    const saved = sessionStorage.getItem('sm_admin');
    if (saved) setAuthed(true);
  }, []);

  const handleLogin = () => { sessionStorage.setItem('sm_admin', '1'); setAuthed(true); };
  const handleLogout = () => { sessionStorage.removeItem('sm_admin'); setAuthed(false); };

  if (!authed) return <><AdminStyle /><AdminLogin onLogin={handleLogin} /></>;

  const renderTab = () => {
    const props = { showToast: show };
    switch (tab) {
      case 'dashboard': return <Dashboard />;
      case 'agents': return <Agents {...props} />;
      case 'products': return <Products {...props} />;
      case 'plans': return <DataPlans {...props} />;
      case 'transactions': return <Transactions {...props} />;
      case 'messages': return <SystemMessages {...props} />;
      case 'support': return <Support {...props} />;
      case 'webhooks': return <Webhooks {...props} />;
      case 'console': return <DevConsole {...props} />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <AdminStyle />
      {toast && <Toast t={toast} />}

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside style={{
          width: sidebarOpen ? 220 : 60, flexShrink: 0,
          background: '#0A0A12', borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.2s cubic-bezier(0.32,0.72,0,1)',
          position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
        }}>
          {/* Logo */}
          <div style={{ padding: '16px 14px 8px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>⚡</div>
            {sidebarOpen && <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#E2E8F0', lineHeight: 1 }}>SaukiMart</p>
              <p style={{ fontSize: 10.5, color: '#334155', marginTop: 2 }}>Admin Console</p>
            </div>}
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
            {NAV_ITEMS.map(item => (
              <button key={item.key} onClick={() => setTab(item.key)} className={`nav-link ${tab === item.key ? 'active' : ''}`} title={!sidebarOpen ? item.label : undefined}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => setSidebarOpen(o => !o)} className="nav-link" title="Toggle sidebar">
              <span style={{ fontSize: 16 }}>{sidebarOpen ? '←' : '→'}</span>
              {sidebarOpen && <span>Collapse</span>}
            </button>
            <button onClick={handleLogout} className="nav-link" style={{ color: '#7f1d1d' }}>
              <span style={{ fontSize: 16 }}>⎋</span>
              {sidebarOpen && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '32px 28px', maxWidth: 'calc(100vw - 60px)' }}>
          {renderTab()}
        </main>
      </div>
    </>
  );
}
