import React from 'react';
import { Transaction } from '../types';
import { formatCurrency } from '../lib/utils';

interface Props {
  transactions: Transaction[];
  title?: string;
  generatedAt?: string;
  company?: { name: string; website?: string; email?: string; phone?: string };
}

export const AdminStatement: React.FC<Props> = ({ transactions, title = 'Transaction Statement', generatedAt, company }) => {
  const total = transactions.reduce((s, t) => s + (t.amount || 0), 0);
  const dateRange = transactions.length ? `${new Date(transactions[0].createdAt).toLocaleDateString()} - ${new Date(transactions[transactions.length - 1].createdAt).toLocaleDateString()}` : '';

  return (
    <div style={{ position: 'fixed', left: '-9999px', top: 0, opacity: 0, pointerEvents: 'none' }}>
      <div id="admin-statement-root" style={{ width: 800, background: '#fff', color: '#0f172a', fontFamily: "'Inter', sans-serif", padding: 24, boxSizing: 'border-box' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/logo.png" alt="Sauki" style={{ width: '90%', height: '90%', objectFit: 'contain' }} crossOrigin="anonymous" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>SAUKI MART</h2>
              <div style={{ fontSize: 12, color: '#475569' }}>Statement • {title}</div>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: 12 }}>
            <div style={{ fontWeight: 700 }}>{company?.website || 'sukimart.online'}</div>
            <div style={{ color: '#475569' }}>{company?.phone || '0806 193 4056'} • {company?.email || 'support@sukimart.online'}</div>
            <div style={{ marginTop: 6, color: '#475569' }}>{generatedAt || new Date().toLocaleString()}</div>
          </div>
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, border: '1px solid #e6eef6', borderRadius: 8, marginBottom: 16, background: '#f8fafc' }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>Transactions</div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{transactions.length} items</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>Period</div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{dateRange}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>Total</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{formatCurrency(total)}</div>
          </div>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid #eef2f7', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead style={{ background: '#f1f5f9', color: '#0f172a', textTransform: 'uppercase', fontSize: 11 }}>
              <tr>
                <th style={{ padding: '10px 12px', textAlign: 'left', width: 140 }}>Date & Time</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', width: 160 }}>Ref</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Phone</th>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', width: 100 }}>Amount</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', width: 100 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #eef2f7' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#475569' }}>{new Date(tx.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700 }}>{tx.tx_ref}</td>
                  <td style={{ padding: '10px 12px' }}>{tx.phone}</td>
                  <td style={{ padding: '10px 12px', textTransform: 'uppercase' }}>{tx.type}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800 }}>{formatCurrency(tx.amount)}</td>
                  <td style={{ padding: '10px 12px' }}>{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 18, borderTop: '1px dashed #e6eef6', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#64748b', fontSize: 12 }}>
            Sauki Mart • www.sukimart.online • support@sukimart.online
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Generated by Admin Portal</div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatement;
