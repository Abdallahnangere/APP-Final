'use client';

import React, { useState, useEffect } from 'react';
import { Send, Play, Pause, History, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

const NETWORK_COLORS: Record<string, string> = {
  MTN: '#FFC300',
  GLO: '#006633',
  AIRTEL: '#E40000',
  '9MOBILE': '#006E51',
};

type GiveawayEntry = {
  id: string;
  phone: string;
  network: string;
  submitted_at: string;
};

type GiveawayHistory = {
  id: string;
  phone: string;
  network: string;
  submitted_at: string;
  sent_at: string;
};

export default function SGRMPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [entries, setEntries] = useState<GiveawayEntry[]>([]);
  const [history, setHistory] = useState<GiveawayHistory[]>([]);
  const [giveawayStatus, setGiveawayStatus] = useState({ is_paused: false });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, historyRes, statusRes] = await Promise.all([
        fetch('/api/giveaway/entries'),
        fetch('/api/giveaway/history'),
        fetch('/api/giveaway/status'),
      ]);

      const entriesData = await entriesRes.json();
      const historyData = await historyRes.json();
      const statusData = await statusRes.json();

      setEntries(Array.isArray(entriesData) ? entriesData : []);
      setHistory(Array.isArray(historyData) ? historyData : []);
      setGiveawayStatus(statusData || { is_paused: false });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendEntry = async (entryId: string) => {
    setSendingId(entryId);
    try {
      const res = await fetch('/api/giveaway/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
      });

      if (res.ok) {
        setEntries((prev: GiveawayEntry[]) => prev.filter((e: GiveawayEntry) => e.id !== entryId));
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to send entry:', error);
    } finally {
      setSendingId(null);
    }
  };

  const handleToggleGiveawayStatus = async () => {
    setTogglingStatus(true);
    try {
      const res = await fetch('/api/giveaway/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_paused: !giveawayStatus.is_paused }),
      });

      if (res.ok) {
        setGiveawayStatus({ is_paused: !giveawayStatus.is_paused });
      }
    } catch (error) {
      console.error('Failed to toggle giveaway status:', error);
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <div
      className="min-h-screen w-full p-4 sm:p-8"
      style={{ background: 'linear-gradient(145deg, #fdfaf4 0%, #fef9ee 40%, #fdf6e3 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-stone-900 mb-2">Saukimart Giveaway</h1>
          <h2 className="text-lg text-stone-600">Admin Control Panel</h2>
        </div>

        {/* Status Section */}
        <div
          className="mb-8 rounded-2xl border border-stone-200 p-6 flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-4 h-4 rounded-full animate-pulse"
              style={{ backgroundColor: giveawayStatus.is_paused ? '#ef4444' : '#22c55e' }}
            />
            <div>
              <p className="text-sm text-stone-500 uppercase tracking-widest">Giveaway Status</p>
              <p className="text-lg font-semibold text-stone-900">
                {giveawayStatus.is_paused ? 'Paused' : 'Active'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleGiveawayStatus}
            disabled={togglingStatus}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: giveawayStatus.is_paused ? '#8B6914' : '#ef4444',
            }}
          >
            {giveawayStatus.is_paused ? (
              <>
                <Play className="w-4 h-4" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            )}
          </button>
        </div>

        {/* Refresh Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 border border-stone-200 hover:bg-white/70 transition-all duration-300 disabled:opacity-60"
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-stone-200">
          {[
            { id: 'active', label: 'Active Entries', icon: '📋' },
            { id: 'history', label: 'Sent History', icon: '📜' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'active' | 'history')}
              className={cn(
                'px-6 py-3 font-medium text-sm transition-all duration-300 border-b-2',
                activeTab === tab.id
                  ? 'border-[#C9A84C] text-[#C9A84C]'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#C9A84C] mx-auto mb-4" />
              <p className="text-stone-500">Loading...</p>
            </div>
          </div>
        ) : activeTab === 'active' ? (
          <div
            className="rounded-2xl border border-stone-200 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}
          >
            {entries.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-400">No active entries at the moment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-stone-100 bg-stone-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-widest">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-widest">
                        Network
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-widest">
                        Submitted
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-stone-600 uppercase tracking-widest">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, idx) => (
                      <tr
                        key={entry.id}
                        className={cn(
                          'transition-colors duration-200',
                          idx !== entries.length - 1 && 'border-b border-stone-100',
                          'hover:bg-stone-50/50'
                        )}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-stone-900">{entry.phone}</td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
                            style={{
                              backgroundColor: NETWORK_COLORS[entry.network] || '#6b7280',
                            }}
                          >
                            {entry.network}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-stone-500">
                          {new Date(entry.submitted_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleSendEntry(entry.id)}
                            disabled={sendingId === entry.id}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#B8860B] text-white font-medium text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {sendingId === entry.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                Send
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div
            className="rounded-2xl border border-stone-200 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}
          >
            {history.length === 0 ? (
              <div className="p-12 text-center">
                <History className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-400">No sent entries yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-stone-100 bg-stone-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-widest">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-widest">
                        Network
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-widest">
                        Submitted
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-stone-600 uppercase tracking-widest">
                        Sent At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={cn(
                          'transition-colors duration-200',
                          idx !== history.length - 1 && 'border-b border-stone-100',
                          'hover:bg-stone-50/50'
                        )}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-stone-900">{item.phone}</td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
                            style={{
                              backgroundColor: NETWORK_COLORS[item.network] || '#6b7280',
                            }}
                          >
                            {item.network}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-stone-500">
                          {new Date(item.submitted_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-stone-500">
                          {new Date(item.sent_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Active Entries', value: entries.length, color: '#3B82F6' },
            { label: 'Total Sent', value: history.length, color: '#10B981' },
            { label: 'Status', value: giveawayStatus.is_paused ? 'Paused' : 'Running', color: '#F59E0B' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-stone-200 p-6"
              style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}
            >
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-2">{stat.label}</p>
              <p
                className="text-2xl font-bold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
