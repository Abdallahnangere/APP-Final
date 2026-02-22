'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Download, Search, Users, Smartphone, Signal, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

type Entry = {
  id: number;
  phone: string;
  network: string;
  submitted_at: string;
};

const NETWORK_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  MTN:     { bg: 'bg-yellow-50',  text: 'text-yellow-700',  dot: '#FFC300' },
  GLO:     { bg: 'bg-green-50',   text: 'text-green-700',   dot: '#006633' },
  AIRTEL:  { bg: 'bg-red-50',     text: 'text-red-600',     dot: '#E40000' },
  '9MOBILE': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: '#006E51' },
};

function exportCSV(entries: Entry[]) {
  const header = 'ID,Phone,Network,Submitted At\n';
  const rows = entries.map(e =>
    `${e.id},${e.phone},${e.network},"${new Date(e.submitted_at).toLocaleString()}"`
  ).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `giveaway-entries-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SGRMPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [networkFilter, setNetworkFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const fetchEntries = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/giveaway/entries');
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const filtered = entries.filter(e => {
    const matchSearch = e.phone.includes(search) || e.network.toLowerCase().includes(search.toLowerCase());
    const matchNetwork = networkFilter === 'ALL' || e.network === networkFilter;
    return matchSearch && matchNetwork;
  });

  const networks = ['ALL', ...Array.from(new Set(entries.map(e => e.network)))];

  // Stats
  const networkCounts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.network] = (acc[e.network] || 0) + 1;
    return acc;
  }, {});

  const topNetwork = Object.entries(networkCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div
      className="min-h-screen w-full p-4 sm:p-8"
      style={{ background: 'linear-gradient(145deg, #fdfaf4 0%, #fef9ee 50%, #fdf6e3 100%)' }}
    >
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: '#C9A84C' }}>
                Saukimart · Ramadan Giveaway
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                Submissions
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchEntries(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 bg-white/70 text-stone-600 text-sm font-medium hover:border-[#C9A84C]/50 transition-all"
              >
                <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
                Refresh
              </button>
              <button
                onClick={() => exportCSV(filtered)}
                disabled={filtered.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #8B6914)' }}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Gold divider */}
          <div className="mt-4 h-px w-full" style={{ background: 'linear-gradient(90deg, #C9A84C44, transparent)' }} />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-white/75 backdrop-blur-sm border border-stone-100 rounded-2xl px-5 py-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-[#C9A84C]" />
              <span className="text-xs text-stone-400 uppercase tracking-wider font-medium">Total Entries</span>
            </div>
            <p className="text-3xl font-bold text-stone-900">{entries.length}</p>
          </div>
          <div className="bg-white/75 backdrop-blur-sm border border-stone-100 rounded-2xl px-5 py-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Signal className="w-4 h-4 text-[#C9A84C]" />
              <span className="text-xs text-stone-400 uppercase tracking-wider font-medium">Top Network</span>
            </div>
            <p className="text-3xl font-bold text-stone-900">{topNetwork ? topNetwork[0] : '—'}</p>
            {topNetwork && <p className="text-xs text-stone-400 mt-0.5">{topNetwork[1]} entries</p>}
          </div>
          <div className="bg-white/75 backdrop-blur-sm border border-stone-100 rounded-2xl px-5 py-4 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-[#C9A84C]" />
              <span className="text-xs text-stone-400 uppercase tracking-wider font-medium">Latest Entry</span>
            </div>
            <p className="text-sm font-semibold text-stone-700 truncate">
              {entries[0]
                ? new Date(entries[0].submitted_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                : '—'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
            <input
              type="text"
              placeholder="Search by phone or network…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white/70 text-sm text-stone-700 placeholder:text-stone-300 outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {networks.map(n => (
              <button
                key={n}
                onClick={() => setNetworkFilter(n)}
                className={cn(
                  'px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wide border transition-all',
                  networkFilter === n
                    ? 'border-[#C9A84C] text-[#8B6914] bg-[#fdf8ec]'
                    : 'border-stone-200 text-stone-400 bg-white/50 hover:border-stone-300'
                )}
              >
                {n === 'ALL' ? `All (${entries.length})` : `${n} (${networkCounts[n] || 0})`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/75 backdrop-blur-sm border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-[#C9A84C]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <Smartphone className="w-8 h-8 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-400 text-sm font-medium">
                {entries.length === 0 ? 'No submissions yet.' : 'No results match your search.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-50">
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-stone-400">#</th>
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-stone-400">Phone</th>
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-stone-400">Network</th>
                  <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-stone-400">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map((e, i) => {
                  const net = NETWORK_COLORS[e.network] || { bg: 'bg-stone-50', text: 'text-stone-600', dot: '#aaa' };
                  return (
                    <tr key={e.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-stone-300 font-mono">{i + 1}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-sm font-semibold text-stone-800">{e.phone}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase', net.bg, net.text)}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: net.dot }} />
                          {e.network}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-stone-400">
                        {new Date(e.submitted_at).toLocaleString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Footer count */}
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-stone-50 text-xs text-stone-300 font-medium">
              Showing {filtered.length} of {entries.length} entries
            </div>
          )}
        </div>
      </div>
    </div>
  );
      }
