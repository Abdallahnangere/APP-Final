'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  NIGERIAN_BANKS,
  MIN_TRANSFER_AMOUNT,
  MAX_TRANSFER_AMOUNT,
  calculateTransferFee,
} from '@/lib/nigerianBanks';

type BalanceState = {
  available: number;
  ledger: number;
  fetchedAt: string;
};

type VerifyState = 'idle' | 'verifying' | 'verified' | 'failed';
type TransferStatus = 'all' | 'pending' | 'successful' | 'failed';

type TransferRecord = {
  id: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  transferFee: number;
  totalDeducted: number;
  narration: string;
  status: 'pending' | 'successful' | 'failed';
  flwTransferId: string | null;
  flwReference: string | null;
  txReference: string;
  flwResponse: Record<string, unknown> | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
};

const BG = '#070910';
const PANEL = '#121827';
const PANEL_ALT = '#0f1522';
const TEXT = '#f4f7ff';
const MUTED = '#8f9bb3';
const GOLD = '#d6b56a';
const GOLD_SOFT = 'rgba(214, 181, 106, 0.2)';
const GREEN = '#35d38a';
const RED = '#ff6b81';
const ORANGE = '#ffb454';

const money = (n: number) =>
  `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const dateTime = (v?: string | null) =>
  v ? new Date(v).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

function toRawAmount(value: string) {
  return value.replace(/[^\d]/g, '');
}

function toDisplayAmount(value: string) {
  const raw = toRawAmount(value);
  return raw ? Number(raw).toLocaleString('en-NG') : '';
}

export default function FlutterwaveAdminPage() {
  const [token, setToken] = useState('');
  const [ready, setReady] = useState(false);

  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState('');
  const [balance, setBalance] = useState<BalanceState>({ available: 0, ledger: 0, fetchedAt: '' });
  const [autoRefreshOn, setAutoRefreshOn] = useState(true);

  const [bankSearch, setBankSearch] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [verifyState, setVerifyState] = useState<VerifyState>('idle');
  const [verifyError, setVerifyError] = useState('');
  const [accountName, setAccountName] = useState('');

  const [amountInput, setAmountInput] = useState('');
  const [narration, setNarration] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [requireLargeConfirm, setRequireLargeConfirm] = useState(false);

  const [successModal, setSuccessModal] = useState<{ open: boolean; ref: string; status: string; }>({ open: false, ref: '', status: '' });
  const [errorModal, setErrorModal] = useState<{ open: boolean; message: string; }>({ open: false, message: '' });

  const [records, setRecords] = useState<TransferRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState('');
  const [details, setDetails] = useState<TransferRecord | null>(null);

  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterBank, setFilterBank] = useState('');
  const [filterStatus, setFilterStatus] = useState<TransferStatus>('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    const adminToken = localStorage.getItem('sm_admin_token') || '';
    setToken(adminToken);
    setReady(true);
  }, []);

  const authHeader = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token]);

  const selectedBank = useMemo(
    () => NIGERIAN_BANKS.find((b) => b.code === bankCode) || null,
    [bankCode],
  );

  const filteredBanks = useMemo(() => {
    const q = bankSearch.trim().toLowerCase();
    if (!q) return NIGERIAN_BANKS;
    return NIGERIAN_BANKS.filter((b) => b.name.toLowerCase().includes(q));
  }, [bankSearch]);

  const amount = Number(toRawAmount(amountInput) || 0);
  const fee = amount > 0 ? calculateTransferFee(amount) : 0;
  const totalDeducted = Number((amount + fee).toFixed(2));

  const canVerify = accountNumber.length === 10 && !!bankCode;
  const canProceed =
    verifyState === 'verified' &&
    amount >= MIN_TRANSFER_AMOUNT &&
    amount <= MAX_TRANSFER_AMOUNT &&
    balance.available >= totalDeducted &&
    !!selectedBank;

  const loadBalance = useCallback(async () => {
    if (!token) return;
    setLoadingBalance(true);
    setBalanceError('');
    try {
      const res = await fetch('/api/zmytcd/flutterwave/balance', { headers: authHeader(), cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load balance');
      setBalance({
        available: Number(data.balance?.available || 0),
        ledger: Number(data.balance?.ledger || 0),
        fetchedAt: String(data.fetchedAt || new Date().toISOString()),
      });
    } catch (e: unknown) {
      setBalanceError(e instanceof Error ? e.message : 'Failed to load balance');
    } finally {
      setLoadingBalance(false);
    }
  }, [token, authHeader]);

  const loadTransfers = useCallback(async (nextPage = page) => {
    if (!token) return;
    setRecordsLoading(true);
    setRecordsError('');
    try {
      const qs = new URLSearchParams();
      if (filterFrom) qs.set('from', filterFrom);
      if (filterTo) qs.set('to', filterTo);
      if (filterBank) qs.set('bank', filterBank);
      if (filterStatus && filterStatus !== 'all') qs.set('status', filterStatus);
      if (filterSearch.trim()) qs.set('search', filterSearch.trim());
      qs.set('page', String(nextPage));
      qs.set('pageSize', '15');

      const res = await fetch(`/api/zmytcd/flutterwave/transfers?${qs.toString()}`, { headers: authHeader(), cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load transfer history');

      setRecords(Array.isArray(data.transfers) ? data.transfers : []);
      setPage(Number(data.page || 1));
      setTotalPages(Number(data.totalPages || 1));
      setTotalRows(Number(data.total || 0));
    } catch (e: unknown) {
      setRecordsError(e instanceof Error ? e.message : 'Failed to load transfer history');
    } finally {
      setRecordsLoading(false);
    }
  }, [token, authHeader, page, filterFrom, filterTo, filterBank, filterStatus, filterSearch]);

  useEffect(() => {
    if (!token) return;
    loadBalance();
    loadTransfers(1);
  }, [token, loadBalance, loadTransfers]);

  useEffect(() => {
    if (!token || !autoRefreshOn) return;
    const id = setInterval(() => {
      loadBalance();
    }, 30000);
    return () => clearInterval(id);
  }, [token, autoRefreshOn, loadBalance]);

  const resetForm = () => {
    setBankCode('');
    setBankSearch('');
    setAccountNumber('');
    setVerifyState('idle');
    setVerifyError('');
    setAccountName('');
    setAmountInput('');
    setNarration('');
    setRequireLargeConfirm(false);
  };

  const verifyAccount = async () => {
    if (!canVerify) return;
    setVerifyState('verifying');
    setVerifyError('');
    setAccountName('');

    try {
      const res = await fetch('/api/zmytcd/flutterwave/resolve', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ bankCode, accountNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to verify account');

      setAccountName(String(data.accountName || ''));
      setVerifyState('verified');
    } catch (e: unknown) {
      setVerifyState('failed');
      setVerifyError(e instanceof Error ? e.message : 'Unable to verify account');
    }
  };

  const submitTransfer = async () => {
    if (!selectedBank || !canProceed) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/zmytcd/flutterwave/transfer', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({
          bankCode: selectedBank.code,
          bankName: selectedBank.name,
          accountNumber,
          accountName,
          amount,
          narration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transfer failed');

      setConfirmOpen(false);
      setSuccessModal({
        open: true,
        ref: String(data.transfer?.txReference || data.transfer?.flwReference || ''),
        status: String(data.transfer?.status || 'pending'),
      });
      resetForm();
      await loadBalance();
      await loadTransfers(1);
    } catch (e: unknown) {
      setErrorModal({ open: true, message: e instanceof Error ? e.message : 'Transfer failed' });
    } finally {
      setProcessing(false);
    }
  };

  const exportExcel = () => {
    const headers = [
      'Date & Time',
      'Bank Name',
      'Account Number',
      'Account Name',
      'Amount',
      'Fee',
      'Total Deducted',
      'Narration',
      'Status',
      'Flutterwave Reference',
      'TX Reference',
    ];

    const lines = records.map((r) => [
      dateTime(r.createdAt),
      r.bankName,
      r.accountNumber,
      r.accountName,
      r.amount.toFixed(2),
      r.transferFee.toFixed(2),
      r.totalDeducted.toFixed(2),
      (r.narration || '').replace(/,/g, ' '),
      r.status,
      r.flwReference || '',
      r.txReference,
    ]);

    const csv = [headers, ...lines].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flutterwave-transfers-${Date.now()}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printReceipt = (row: TransferRecord) => {
    const popup = window.open('', '_blank', 'width=760,height=860');
    if (!popup) return;

    popup.document.write(`
      <html>
        <head><title>Transfer Receipt</title></head>
        <body style="font-family:Arial,sans-serif;padding:24px;color:#111;line-height:1.5;">
          <h2>Admin Flutterwave Transfer Receipt</h2>
          <p><b>Date:</b> ${dateTime(row.createdAt)}</p>
          <p><b>Bank:</b> ${row.bankName}</p>
          <p><b>Account Number:</b> ${row.accountNumber}</p>
          <p><b>Account Name:</b> ${row.accountName}</p>
          <p><b>Amount:</b> ${money(row.amount)}</p>
          <p><b>Fee:</b> ${money(row.transferFee)}</p>
          <p><b>Total Deducted:</b> ${money(row.totalDeducted)}</p>
          <p><b>Narration:</b> ${row.narration || '-'}</p>
          <p><b>Status:</b> ${row.status.toUpperCase()}</p>
          <p><b>Flutterwave Ref:</b> ${row.flwReference || '-'}</p>
          <p><b>TX Ref:</b> ${row.txReference}</p>
          <hr />
          <pre style="font-size:12px;background:#f3f5f7;padding:12px;border-radius:8px;overflow:auto;">${JSON.stringify(row.flwResponse || {}, null, 2)}</pre>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  if (!ready) return null;

  if (!token) {
    return (
      <div style={{ minHeight: '100dvh', background: BG, color: TEXT, display: 'grid', placeItems: 'center', padding: 20 }}>
        <div style={{ width: 'min(540px, 96vw)', background: PANEL, border: `1px solid ${GOLD_SOFT}`, borderRadius: 20, padding: 24 }}>
          <h2 style={{ margin: 0, fontSize: 24, color: GOLD }}>Admin Session Required</h2>
          <p style={{ marginTop: 10, color: MUTED }}>Login through the admin dashboard first, then return to this page.</p>
          <a href="/zmytcd" style={{ display: 'inline-block', marginTop: 12, background: GOLD, color: '#1a1a1a', padding: '10px 14px', borderRadius: 10, fontWeight: 700 }}>Go to Admin Login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: `radial-gradient(circle at 8% 10%, rgba(214,181,106,.2), transparent 40%), radial-gradient(circle at 90% 0%, rgba(214,181,106,.12), transparent 38%), ${BG}`, color: TEXT, padding: '28px 18px 60px' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: '.02em' }}>Flutterwave Wallet Management</h1>
          <a href="/zmytcd" style={{ color: GOLD, fontWeight: 700 }}>Back to /zmytcd</a>
        </div>

        <div style={{ background: `linear-gradient(135deg, #151d2f, #0d1321 58%)`, border: `1px solid ${GOLD_SOFT}`, borderRadius: 20, padding: 22, boxShadow: '0 24px 55px rgba(0,0,0,.35)', marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, color: GOLD, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em' }}>Flutterwave Available Balance</p>
              <h2 style={{ margin: '6px 0 2px', fontSize: 44, fontWeight: 900 }}>{loadingBalance ? 'Loading...' : money(balance.available)}</h2>
              <p style={{ margin: 0, color: MUTED }}>Ledger Balance: {loadingBalance ? '...' : money(balance.ledger)}</p>
              <p style={{ margin: '6px 0 0', color: MUTED, fontSize: 12 }}>Last Updated: {balance.fetchedAt ? dateTime(balance.fetchedAt) : '-'}</p>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <button onClick={loadBalance} disabled={loadingBalance} style={{ background: GOLD, color: '#171717', border: 'none', borderRadius: 12, padding: '10px 14px', fontWeight: 800 }}>
                {loadingBalance ? 'Refreshing...' : 'Refresh Balance'}
              </button>
              <button onClick={() => setAutoRefreshOn((v) => !v)} style={{ background: 'transparent', color: autoRefreshOn ? GOLD : MUTED, border: `1px solid ${GOLD_SOFT}`, borderRadius: 10, padding: '8px 12px', fontWeight: 700 }}>
                Auto-refresh: {autoRefreshOn ? 'On (30s)' : 'Off'}
              </button>
            </div>
          </div>
          {balanceError && <p style={{ marginTop: 10, color: RED }}>{balanceError}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 460px) 1fr', gap: 16 }}>
          <div style={{ background: PANEL, border: `1px solid ${GOLD_SOFT}`, borderRadius: 18, padding: 16 }}>
            <h3 style={{ margin: '0 0 12px', color: GOLD }}>Make Transfer</h3>

            <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Bank Search</label>
            <input value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} placeholder="Search bank" style={{ width: '100%', marginTop: 6, marginBottom: 8, padding: '10px 11px', borderRadius: 10, border: '1px solid #273149', background: PANEL_ALT, color: TEXT }} />

            <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Bank Selection</label>
            <select value={bankCode} onChange={(e) => { setBankCode(e.target.value); setVerifyState('idle'); setVerifyError(''); setAccountName(''); }} style={{ width: '100%', marginTop: 6, marginBottom: 12, padding: '10px 11px', borderRadius: 10, border: '1px solid #273149', background: PANEL_ALT, color: TEXT }}>
              <option value="">Select bank</option>
              {filteredBanks.map((bank) => (
                <option key={bank.code} value={bank.code}>{bank.name}</option>
              ))}
            </select>

            <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Account Number</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <input
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                  setVerifyState('idle');
                  setVerifyError('');
                  setAccountName('');
                }}
                placeholder="10-digit account number"
                style={{ flex: 1, padding: '10px 11px', borderRadius: 10, border: '1px solid #273149', background: PANEL_ALT, color: TEXT }}
              />
              {accountNumber.length === 10 && (
                <button onClick={verifyAccount} disabled={!canVerify || verifyState === 'verifying'} style={{ background: '#2c4a85', color: '#fff', border: 'none', borderRadius: 10, padding: '0 12px', fontWeight: 700 }}>
                  {verifyState === 'verifying' ? 'Verifying...' : 'Verify Account'}
                </button>
              )}
            </div>

            {verifyState === 'verified' && (
              <p style={{ margin: '8px 0 0', color: GREEN, fontWeight: 700 }}>✓ Account verified</p>
            )}
            {verifyState === 'failed' && (
              <p style={{ margin: '8px 0 0', color: RED, fontWeight: 700 }}>✗ {verifyError || 'Invalid account details'}</p>
            )}

            <label style={{ fontSize: 12, fontWeight: 700, color: MUTED, display: 'block', marginTop: 12 }}>Account Name</label>
            <input
              value={accountName}
              readOnly
              placeholder="Account name will appear after verification"
              style={{ width: '100%', marginTop: 6, marginBottom: 10, padding: '10px 11px', borderRadius: 10, border: '1px solid #234d3e', background: verifyState === 'verified' ? 'rgba(53,211,138,.15)' : PANEL_ALT, color: verifyState === 'verified' ? GREEN : TEXT }}
            />

            <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Amount</label>
            <input
              value={toDisplayAmount(amountInput)}
              onChange={(e) => setAmountInput(toRawAmount(e.target.value))}
              disabled={verifyState !== 'verified'}
              placeholder="Enter transfer amount"
              style={{ width: '100%', marginTop: 6, marginBottom: 6, padding: '12px 11px', borderRadius: 10, border: '1px solid #273149', background: PANEL_ALT, color: TEXT, fontSize: 17, fontWeight: 700 }}
            />
            <p style={{ margin: '0 0 8px', color: MUTED, fontSize: 12 }}>Available Balance: {money(balance.available)}</p>
            <p style={{ margin: '0 0 8px', color: GOLD, fontSize: 13 }}>Amount: {money(amount)} + Fee: {money(fee)} = Total: {money(totalDeducted)}</p>

            <label style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Narration (Optional)</label>
            <input value={narration} onChange={(e) => setNarration(e.target.value.slice(0, 100))} placeholder="Payment for services, salary, etc." style={{ width: '100%', marginTop: 6, marginBottom: 6, padding: '10px 11px', borderRadius: 10, border: '1px solid #273149', background: PANEL_ALT, color: TEXT }} />
            <p style={{ margin: '0 0 10px', color: MUTED, fontSize: 11 }}>{narration.length}/100</p>

            {amount > 0 && balance.available < totalDeducted && (
              <p style={{ margin: '0 0 10px', color: RED }}>Insufficient Flutterwave balance for this transfer + fee.</p>
            )}

            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!canProceed}
              style={{ width: '100%', marginTop: 2, padding: '12px', borderRadius: 12, border: 'none', background: canProceed ? `linear-gradient(135deg, ${GOLD}, #f0d595)` : '#2d3344', color: canProceed ? '#1b1b1b' : '#9ea8be', fontWeight: 900 }}
            >
              Proceed to Transfer
            </button>

            <p style={{ marginTop: 10, fontSize: 11, color: MUTED }}>Limits: Min {money(MIN_TRANSFER_AMOUNT)} · Max {money(MAX_TRANSFER_AMOUNT)}</p>
          </div>

          <div style={{ background: PANEL, border: `1px solid ${GOLD_SOFT}`, borderRadius: 18, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <h3 style={{ margin: 0, color: GOLD }}>Transfer History</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={exportExcel} style={{ background: 'transparent', color: GOLD, border: `1px solid ${GOLD_SOFT}`, borderRadius: 10, padding: '8px 10px', fontWeight: 700 }}>Export Excel</button>
                <button onClick={() => loadTransfers(page)} style={{ background: '#2c4a85', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 10px', fontWeight: 700 }}>Refresh</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 10 }}>
              <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} style={{ padding: '9px 10px', borderRadius: 9, border: '1px solid #28324a', background: PANEL_ALT, color: TEXT }} />
              <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} style={{ padding: '9px 10px', borderRadius: 9, border: '1px solid #28324a', background: PANEL_ALT, color: TEXT }} />
              <select value={filterBank} onChange={(e) => setFilterBank(e.target.value)} style={{ padding: '9px 10px', borderRadius: 9, border: '1px solid #28324a', background: PANEL_ALT, color: TEXT }}>
                <option value="">All Banks</option>
                {NIGERIAN_BANKS.map((b) => <option key={b.code} value={b.name}>{b.name}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TransferStatus)} style={{ padding: '9px 10px', borderRadius: 9, border: '1px solid #28324a', background: PANEL_ALT, color: TEXT }}>
                <option value="all">All Status</option>
                <option value="successful">Successful</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
              <input value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} placeholder="Search account number/name" style={{ padding: '9px 10px', borderRadius: 9, border: '1px solid #28324a', background: PANEL_ALT, color: TEXT }} />
              <button onClick={() => loadTransfers(1)} style={{ background: '#2c4a85', color: '#fff', border: 'none', borderRadius: 9, padding: '0 11px', fontWeight: 700 }}>Apply</button>
            </div>

            {recordsError && <p style={{ color: RED }}>{recordsError}</p>}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1180 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,.03)' }}>
                    {['Date & Time', 'Bank Name', 'Account Number', 'Account Name', 'Amount', 'Fee', 'Total', 'Narration', 'Status', 'Flutterwave Ref', 'Actions'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', fontSize: 11, padding: '10px 8px', color: MUTED, borderBottom: '1px solid rgba(255,255,255,.08)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recordsLoading && (
                    <tr><td colSpan={11} style={{ padding: 18, color: MUTED }}>Loading transfer history...</td></tr>
                  )}
                  {!recordsLoading && records.length === 0 && (
                    <tr><td colSpan={11} style={{ padding: 18, color: MUTED }}>No transfer records found.</td></tr>
                  )}
                  {!recordsLoading && records.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                      <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>{dateTime(r.createdAt)}</td>
                      <td style={{ padding: '10px 8px' }}>{r.bankName}</td>
                      <td style={{ padding: '10px 8px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{r.accountNumber}</td>
                      <td style={{ padding: '10px 8px' }}>{r.accountName}</td>
                      <td style={{ padding: '10px 8px', fontWeight: 700 }}>{money(r.amount)}</td>
                      <td style={{ padding: '10px 8px' }}>{money(r.transferFee)}</td>
                      <td style={{ padding: '10px 8px' }}>{money(r.totalDeducted)}</td>
                      <td style={{ padding: '10px 8px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.narration || '-'}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '4px 9px',
                          borderRadius: 999,
                          background: r.status === 'successful' ? 'rgba(53,211,138,.15)' : r.status === 'failed' ? 'rgba(255,107,129,.15)' : 'rgba(255,180,84,.15)',
                          color: r.status === 'successful' ? GREEN : r.status === 'failed' ? RED : ORANGE,
                          textTransform: 'uppercase',
                        }}>{r.status}</span>
                      </td>
                      <td style={{ padding: '10px 8px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{r.flwReference || '-'}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <button onClick={() => setDetails(r)} style={{ background: 'transparent', color: GOLD, border: `1px solid ${GOLD_SOFT}`, borderRadius: 8, padding: '6px 8px', fontWeight: 700 }}>View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <p style={{ margin: 0, color: MUTED, fontSize: 12 }}>Rows: {totalRows}</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button disabled={page <= 1} onClick={() => loadTransfers(page - 1)} style={{ background: '#212b43', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px' }}>Prev</button>
                <span style={{ color: MUTED, fontSize: 12 }}>Page {page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => loadTransfers(page + 1)} style={{ background: '#212b43', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 10px' }}>Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmOpen && selectedBank && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3,5,10,.75)', display: 'grid', placeItems: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ width: 'min(560px, 96vw)', background: PANEL, border: `1px solid ${GOLD_SOFT}`, borderRadius: 18, padding: 18 }}>
            <h3 style={{ margin: 0, color: GOLD }}>Confirm Transfer</h3>
            <div style={{ marginTop: 10, display: 'grid', gap: 7 }}>
              <p style={{ margin: 0 }}><b>Bank:</b> {selectedBank.name}</p>
              <p style={{ margin: 0 }}><b>Account Number:</b> {accountNumber}</p>
              <p style={{ margin: 0, color: GREEN }}><b>Account Name:</b> {accountName}</p>
              <p style={{ margin: 0 }}><b>Amount:</b> {money(amount)}</p>
              <p style={{ margin: 0 }}><b>Transfer Fee:</b> {money(fee)}</p>
              <p style={{ margin: 0 }}><b>Total Deduction:</b> {money(totalDeducted)}</p>
              <p style={{ margin: 0 }}><b>Narration:</b> {narration || '-'}</p>
            </div>

            {amount > 100000 && (
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, color: ORANGE, fontWeight: 700 }}>
                <input type="checkbox" checked={requireLargeConfirm} onChange={(e) => setRequireLargeConfirm(e.target.checked)} />
                I confirm this large transfer (&gt; ₦100,000)
              </label>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setConfirmOpen(false)} style={{ background: 'transparent', color: MUTED, border: '1px solid #2a3348', borderRadius: 10, padding: '9px 12px' }}>Cancel</button>
              <button
                onClick={submitTransfer}
                disabled={processing || (amount > 100000 && !requireLargeConfirm)}
                style={{ background: `linear-gradient(135deg, ${GOLD}, #f0d595)`, color: '#1b1b1b', border: 'none', borderRadius: 10, padding: '9px 14px', fontWeight: 900, opacity: processing || (amount > 100000 && !requireLargeConfirm) ? 0.6 : 1 }}
              >
                {processing ? 'Processing transfer...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {processing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'grid', placeItems: 'center', zIndex: 55 }}>
          <div style={{ background: PANEL, padding: '14px 18px', borderRadius: 12, border: `1px solid ${GOLD_SOFT}` }}>Processing transfer...</div>
        </div>
      )}

      {successModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,4,8,.7)', display: 'grid', placeItems: 'center', zIndex: 56, padding: 16 }}>
          <div style={{ width: 'min(460px, 95vw)', background: PANEL, border: `1px solid ${GOLD_SOFT}`, borderRadius: 16, padding: 18 }}>
            <h3 style={{ margin: 0, color: GREEN, fontSize: 22 }}>Transfer Successful</h3>
            <p style={{ marginTop: 8, color: MUTED }}>Reference: {successModal.ref || '-'}</p>
            <p style={{ marginTop: 2, color: MUTED }}>Status: {successModal.status.toUpperCase()}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
              <button onClick={() => setSuccessModal({ open: false, ref: '', status: '' })} style={{ background: GOLD, color: '#1b1b1b', border: 'none', borderRadius: 10, padding: '9px 14px', fontWeight: 800 }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {errorModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,4,8,.7)', display: 'grid', placeItems: 'center', zIndex: 56, padding: 16 }}>
          <div style={{ width: 'min(460px, 95vw)', background: PANEL, border: '1px solid rgba(255,107,129,.3)', borderRadius: 16, padding: 18 }}>
            <h3 style={{ margin: 0, color: RED, fontSize: 22 }}>Transfer Failed</h3>
            <p style={{ marginTop: 8, color: TEXT }}>{errorModal.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
              <button onClick={() => setErrorModal({ open: false, message: '' })} style={{ background: 'transparent', color: MUTED, border: '1px solid #2a3348', borderRadius: 10, padding: '9px 14px' }}>Close</button>
              <button onClick={() => setErrorModal({ open: false, message: '' })} style={{ background: '#2c4a85', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 14px', fontWeight: 800 }}>Try Again</button>
            </div>
          </div>
        </div>
      )}

      {details && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3,5,10,.75)', display: 'grid', placeItems: 'center', zIndex: 57, padding: 16 }}>
          <div style={{ width: 'min(880px, 97vw)', maxHeight: '90vh', overflowY: 'auto', background: PANEL, border: `1px solid ${GOLD_SOFT}`, borderRadius: 16, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: GOLD }}>Transfer Details</h3>
              <button onClick={() => setDetails(null)} style={{ background: 'transparent', color: MUTED, border: '1px solid #2a3348', borderRadius: 10, padding: '7px 10px' }}>Close</button>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: PANEL_ALT, borderRadius: 12, padding: 12 }}>
                <p><b>Date:</b> {dateTime(details.createdAt)}</p>
                <p><b>Bank:</b> {details.bankName}</p>
                <p><b>Account Number:</b> {details.accountNumber}</p>
                <p><b>Account Name:</b> {details.accountName}</p>
                <p><b>Amount:</b> {money(details.amount)}</p>
              </div>
              <div style={{ background: PANEL_ALT, borderRadius: 12, padding: 12 }}>
                <p><b>Fee:</b> {money(details.transferFee)}</p>
                <p><b>Total:</b> {money(details.totalDeducted)}</p>
                <p><b>Status:</b> {details.status.toUpperCase()}</p>
                <p><b>Flutterwave Ref:</b> {details.flwReference || '-'}</p>
                <p><b>TX Ref:</b> {details.txReference}</p>
              </div>
            </div>

            <p style={{ marginTop: 10 }}><b>Narration:</b> {details.narration || '-'}</p>
            {details.errorMessage && <p style={{ color: RED }}><b>Error:</b> {details.errorMessage}</p>}

            <h4 style={{ margin: '12px 0 6px', color: GOLD }}>Flutterwave API Response (JSON)</h4>
            <pre style={{ margin: 0, background: '#0a101d', border: '1px solid #23304a', color: '#d8e5ff', borderRadius: 12, padding: 12, maxHeight: 270, overflow: 'auto', fontSize: 12 }}>{JSON.stringify(details.flwResponse || {}, null, 2)}</pre>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={() => printReceipt(details)} style={{ background: GOLD, color: '#1b1b1b', border: 'none', borderRadius: 10, padding: '9px 12px', fontWeight: 800 }}>Print Receipt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
