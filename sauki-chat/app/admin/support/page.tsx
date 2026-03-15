'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────
interface Session {
  id: string;
  customer_id: string;
  customer_name: string;
  status: string;
  agent_required: boolean;
  agent_mode: boolean;
  last_message: string | null;
  last_message_at: string;
  started_at: string;
  message_count: number;
  unread_count: number;
  internal_notes: string[];
  resolved_at: string | null;
}
interface Message {
  id: string;
  session_id: string;
  sender: 'customer' | 'ai' | 'agent';
  content: string;
  read: boolean;
  created_at: string;
}
interface Stats {
  active_count: string;
  needs_agent_count: string;
  resolved_today: string;
  total: string;
}

// ─── Helpers ─────────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  active:         { label: 'AI Active',    color: '#99f6e4', bg: 'rgba(13,148,136,0.12)',  border: 'rgba(13,148,136,0.25)' },
  agent_required: { label: 'Needs Agent',  color: '#fde68a', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)'  },
  agent_active:   { label: 'Live Agent',   color: '#86efac', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)'  },
  resolved:       { label: 'Resolved',     color: '#a5b4fc', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)' },
  flagged:        { label: 'Flagged',      color: '#fca5a5', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)'  },
};

// ─── Toast ───────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        background: 'rgba(13,148,136,0.95)',
        color: '#f0fdf9',
        padding: '12px 20px',
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 500,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        animation: 'saukiFadeUp 0.25s ease forwards',
        zIndex: 9999,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {message}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function AdminSupportDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [agentInput, setAgentInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [customerTyping, setCustomerTyping] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevSessionsRef = useRef<Session[]>([]);

  const showToast = (msg: string) => setToast(msg);

  // ── Fetch sessions ───────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    const q = new URLSearchParams({ filter });
    if (search) q.set('search', search);
    const res = await fetch(`/api/admin/sessions?${q}`);
    const data = await res.json();
    if (data.sessions) {
      // Detect new escalations
      const prev = prevSessionsRef.current;
      data.sessions.forEach((s: Session) => {
        const old = prev.find((p) => p.id === s.id);
        if (!old && s.status === 'agent_required') {
          showToast(`🔔 New escalation: ${s.customer_name || s.customer_id}`);
        }
        if (old && old.status !== 'agent_required' && s.status === 'agent_required') {
          showToast(`🔔 Agent needed: ${s.customer_name || s.customer_id}`);
        }
      });
      prevSessionsRef.current = data.sessions;
      setSessions(data.sessions);
    }
    if (data.stats) setStats(data.stats);
  }, [filter, search]);

  // ── Fetch messages for selected session ──────────────────────
  const fetchMessages = useCallback(async (sid: string) => {
    setLoadingMessages(true);
    const res = await fetch(`/api/admin/sessions?sessionId=${sid}`);
    const data = await res.json();
    if (data.messages) setMessages(data.messages);
    if (data.session) setSelectedSession(data.session);
    setLoadingMessages(false);
  }, []);

  // ── Admin SSE ────────────────────────────────────────────────
  useEffect(() => {
    const es = new EventSource('/api/admin/stream');

    es.addEventListener('sessions', (e) => {
      const incoming: Session[] = JSON.parse(e.data);
      const prev = prevSessionsRef.current;
      incoming.forEach((s) => {
        const old = prev.find((p) => p.id === s.id);
        if (old && old.status !== 'agent_required' && s.status === 'agent_required') {
          showToast(`🔔 Agent needed: ${s.customer_name || s.customer_id}`);
        }
      });
      prevSessionsRef.current = incoming;
      setSessions(incoming);
    });

    es.addEventListener('new_messages', (e) => {
      const msgs: Message[] = JSON.parse(e.data);
      const relevantToSelected = msgs.filter((m) => m.session_id === selected);
      if (relevantToSelected.length > 0) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          return [...prev, ...relevantToSelected.filter((m) => !ids.has(m.id))];
        });
      }
    });

    es.addEventListener('typing', (e) => {
      const indicators: { session_id: string; sender: string; is_typing: boolean }[] =
        JSON.parse(e.data);
      const customerMap: Record<string, boolean> = {};
      indicators.forEach((t) => {
        if (t.sender === 'customer') customerMap[t.session_id] = t.is_typing;
      });
      setCustomerTyping((prev) => ({ ...prev, ...customerMap }));
    });

    es.onerror = () => es.close();

    return () => es.close();
  }, [selected]);

  // ── Initial fetch and polling ────────────────────────────────
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // ── Select session ───────────────────────────────────────────
  const selectSession = (sid: string) => {
    setSelected(sid);
    fetchMessages(sid);
    setShowNoteInput(false);
    setNoteInput('');
  };

  // ── Scroll to bottom on new messages ────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Admin actions ────────────────────────────────────────────
  const doAction = async (action: string, payload?: Record<string, string>) => {
    if (!selected) return;
    await fetch('/api/admin/intervene', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: selected, action, payload, agentId: 'admin' }),
    });
    fetchMessages(selected);
    fetchSessions();
    showToast(
      action === 'takeover' ? '✅ You took over this chat'
        : action === 'resolve' ? '✅ Chat marked as resolved'
        : action === 'flag' ? '🚩 Chat flagged'
        : action === 'add_note' ? '📝 Note saved'
        : action === 'release' ? '↩️ Released back to AI'
        : '✅ Done'
    );
  };

  const sendAgentMessage = async () => {
    const text = agentInput.trim();
    if (!text || !selected || sending) return;
    setSending(true);
    setAgentInput('');
    await doAction('send_message', { content: text });
    setSending(false);
  };

  const saveNote = async () => {
    const note = noteInput.trim();
    if (!note) return;
    setNoteInput('');
    setShowNoteInput(false);
    await doAction('add_note', { note });
  };

  // ── Filtered sessions ────────────────────────────────────────
  const filteredSessions = sessions.filter((s) => {
    if (!search) return true;
    return (
      s.customer_id.toLowerCase().includes(search.toLowerCase()) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(search.toLowerCase())) ||
      (s.last_message && s.last_message.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const currentSess = selectedSession;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

        .adm-root * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes saukiFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes saukiDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes admPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50%       { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }

        .adm-session-item:hover { background: rgba(255,255,255,0.04) !important; }
        .adm-session-item { transition: background 0.15s; cursor: pointer; }
        .adm-btn { transition: opacity 0.15s, transform 0.15s; cursor: pointer; }
        .adm-btn:hover { opacity: 0.85; }
        .adm-btn:active { transform: scale(0.97); }

        .adm-scroll::-webkit-scrollbar { width: 4px; }
        .adm-scroll::-webkit-scrollbar-track { background: transparent; }
        .adm-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.07);
          border-radius: 4px;
        }

        .adm-filter-tab:hover { background: rgba(255,255,255,0.05) !important; }
        .adm-filter-tab { transition: background 0.15s, color 0.15s; cursor: pointer; }
        .adm-input:focus { outline: none; border-color: rgba(13,148,136,0.5) !important; }
        .adm-input { transition: border-color 0.2s; }
      `}</style>

      <div
        className="adm-root"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          background: 'linear-gradient(145deg, #060810 0%, #080c18 100%)',
          height: '100%',
          minHeight: 600,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#e2e8f0',
        }}
      >
        {/* ── Top Bar ── */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.477 2 2 6.477 2 12c0 1.82.487 3.53 1.338 5L2 22l5.2-1.308A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                  fill="white"
                />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#f0fdf9',
                }}
              >
                Support Admin
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>
                Sauki Mart
              </div>
            </div>
          </div>

          {/* Stats strip */}
          {stats && (
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: 'Active', val: stats.active_count, color: '#99f6e4' },
                {
                  label: 'Needs Agent',
                  val: stats.needs_agent_count,
                  color: '#fde68a',
                  pulse: parseInt(stats.needs_agent_count) > 0,
                },
                { label: 'Resolved Today', val: stats.resolved_today, color: '#a5b4fc' },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    textAlign: 'center',
                    minWidth: 72,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 18,
                      fontWeight: 500,
                      color: s.color,
                      lineHeight: 1,
                      animation: s.pulse ? 'admPulse 1.5s ease-in-out infinite' : undefined,
                    }}
                  >
                    {s.val}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Main Content ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* ── Session List (Left Panel) ── */}
          <div
            style={{
              width: 300,
              flexShrink: 0,
              borderRight: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Search */}
            <div style={{ padding: '12px 12px 8px' }}>
              <input
                className="adm-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID or keyword..."
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 12.5,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            {/* Filter tabs */}
            <div
              style={{
                display: 'flex',
                gap: 4,
                padding: '0 12px 10px',
                overflowX: 'auto',
              }}
            >
              {['all', 'needs_agent', 'active', 'resolved', 'flagged'].map((f) => (
                <button
                  key={f}
                  className="adm-filter-tab"
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: filter === f
                      ? '1px solid rgba(13,148,136,0.4)'
                      : '1px solid transparent',
                    background: filter === f ? 'rgba(13,148,136,0.15)' : 'transparent',
                    color: filter === f ? '#99f6e4' : 'rgba(255,255,255,0.4)',
                    fontSize: 11,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: filter === f ? 500 : 400,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f === 'needs_agent'
                    ? 'Needs Agent'
                    : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Session cards */}
            <div className="adm-scroll" style={{ flex: 1, overflowY: 'auto' }}>
              {filteredSessions.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: 'rgba(255,255,255,0.25)',
                    fontSize: 13,
                  }}
                >
                  No sessions found
                </div>
              )}
              {filteredSessions.map((s) => {
                const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.active;
                const isSelected = selected === s.id;
                const isTyping = customerTyping[s.id];

                return (
                  <div
                    key={s.id}
                    className="adm-session-item"
                    onClick={() => selectSession(s.id)}
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: isSelected
                        ? 'rgba(13,148,136,0.1)'
                        : 'transparent',
                      borderLeft: isSelected
                        ? '3px solid #0d9488'
                        : '3px solid transparent',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 5,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: 13,
                          color: 'rgba(255,255,255,0.85)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        {s.customer_name || s.customer_id.slice(0, 14)}
                        {s.unread_count > 0 && (
                          <span
                            style={{
                              background: '#0d9488',
                              color: 'white',
                              borderRadius: 10,
                              fontSize: 10,
                              padding: '1px 6px',
                              fontWeight: 700,
                            }}
                          >
                            {s.unread_count}
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 10.5,
                          color: 'rgba(255,255,255,0.28)',
                          fontWeight: 300,
                        }}
                      >
                        {timeAgo(s.last_message_at)}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: isTyping
                          ? '#99f6e4'
                          : 'rgba(255,255,255,0.4)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: 6,
                        fontStyle: isTyping ? 'italic' : 'normal',
                        fontWeight: 300,
                      }}
                    >
                      {isTyping ? 'Customer is typing...' : (s.last_message || 'No messages yet')}
                    </div>

                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                      }}
                    >
                      <span style={{ fontSize: 10.5, color: cfg.color, fontWeight: 500 }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Chat Panel (Right) ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {!selected ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  color: 'rgba(255,255,255,0.2)',
                }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.477 2 2 6.477 2 12c0 1.82.487 3.53 1.338 5L2 22l5.2-1.308A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
                <div style={{ fontSize: 14, fontWeight: 300 }}>
                  Select a conversation to view
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div
                  style={{
                    padding: '12px 18px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: '#f0fdf9',
                      }}
                    >
                      {currentSess?.customer_name || currentSess?.customer_id}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>
                      {currentSess && `Started ${formatDate(currentSess.started_at)} · ${currentSess.message_count} messages`}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {currentSess?.status !== 'resolved' && !currentSess?.agent_mode && (
                      <button
                        className="adm-btn"
                        onClick={() => doAction('takeover')}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(34,197,94,0.15)',
                          border: '1px solid rgba(34,197,94,0.3)',
                          borderRadius: 8,
                          color: '#86efac',
                          fontSize: 11.5,
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        🙋 Take Over
                      </button>
                    )}
                    {currentSess?.agent_mode && (
                      <button
                        className="adm-btn"
                        onClick={() => doAction('release')}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(99,102,241,0.15)',
                          border: '1px solid rgba(99,102,241,0.3)',
                          borderRadius: 8,
                          color: '#a5b4fc',
                          fontSize: 11.5,
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        ↩️ Release
                      </button>
                    )}
                    {currentSess?.status !== 'resolved' && (
                      <button
                        className="adm-btn"
                        onClick={() => doAction('resolve')}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(13,148,136,0.12)',
                          border: '1px solid rgba(13,148,136,0.25)',
                          borderRadius: 8,
                          color: '#99f6e4',
                          fontSize: 11.5,
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        ✅ Resolve
                      </button>
                    )}
                    <button
                      className="adm-btn"
                      onClick={() => doAction('flag')}
                      style={{
                        padding: '6px 10px',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 8,
                        color: '#fca5a5',
                        fontSize: 11.5,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      🚩
                    </button>
                    <button
                      className="adm-btn"
                      onClick={() => setShowNoteInput((v) => !v)}
                      style={{
                        padding: '6px 10px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: 11.5,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      📝
                    </button>
                  </div>
                </div>

                {/* Internal note input */}
                {showNoteInput && (
                  <div
                    style={{
                      padding: '10px 16px',
                      background: 'rgba(251,191,36,0.05)',
                      borderBottom: '1px solid rgba(251,191,36,0.1)',
                      display: 'flex',
                      gap: 8,
                      flexShrink: 0,
                      animation: 'saukiFadeUp 0.2s ease',
                    }}
                  >
                    <input
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Add internal note (not visible to customer)..."
                      onKeyDown={(e) => e.key === 'Enter' && saveNote()}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(251,191,36,0.2)',
                        borderRadius: 8,
                        padding: '7px 12px',
                        color: '#fde68a',
                        fontSize: 12.5,
                        fontFamily: "'DM Sans', sans-serif",
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={saveNote}
                      style={{
                        padding: '7px 14px',
                        background: 'rgba(251,191,36,0.15)',
                        border: '1px solid rgba(251,191,36,0.3)',
                        borderRadius: 8,
                        color: '#fde68a',
                        fontSize: 12,
                        fontFamily: "'DM Sans', sans-serif",
                        cursor: 'pointer',
                      }}
                    >
                      Save
                    </button>
                  </div>
                )}

                {/* Internal notes display */}
                {currentSess?.internal_notes && currentSess.internal_notes.length > 0 && (
                  <div
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(251,191,36,0.04)',
                      borderBottom: '1px solid rgba(251,191,36,0.08)',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ fontSize: 10.5, color: '#fde68a', fontWeight: 500, marginBottom: 4 }}>
                      📝 Internal Notes
                    </div>
                    {currentSess.internal_notes.map((n, i) => (
                      <div
                        key={i}
                        style={{ fontSize: 11.5, color: 'rgba(253,230,138,0.7)', marginBottom: 2, fontWeight: 300 }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                )}

                {/* Messages */}
                <div
                  className="adm-scroll"
                  style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}
                >
                  {loadingMessages ? (
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13, paddingTop: 40 }}>
                      Loading...
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isCustomer = msg.sender === 'customer';
                      const isAgent = msg.sender === 'agent';

                      return (
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isCustomer ? 'flex-end' : 'flex-start',
                            marginBottom: 10,
                            animation: 'saukiFadeUp 0.25s ease',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10.5,
                              color: isAgent
                                ? '#86efac'
                                : isCustomer
                                ? 'rgba(255,255,255,0.35)'
                                : '#99f6e4',
                              marginBottom: 3,
                              marginLeft: isCustomer ? 0 : 2,
                              marginRight: isCustomer ? 2 : 0,
                              fontWeight: 500,
                            }}
                          >
                            {isAgent ? '🟢 Agent' : isCustomer ? 'Customer' : 'Sauki AI'}
                          </div>
                          <div
                            style={{
                              maxWidth: '75%',
                              padding: '9px 13px',
                              borderRadius: isCustomer
                                ? '14px 4px 14px 14px'
                                : '4px 14px 14px 14px',
                              ...(isCustomer
                                ? {
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#e2e8f0',
                                  }
                                : isAgent
                                ? {
                                    background: 'rgba(34,197,94,0.1)',
                                    border: '1px solid rgba(34,197,94,0.25)',
                                    color: '#86efac',
                                  }
                                : {
                                    background: 'rgba(13,148,136,0.1)',
                                    border: '1px solid rgba(13,148,136,0.2)',
                                    color: '#99f6e4',
                                  }),
                              fontSize: 13.5,
                              lineHeight: 1.55,
                              fontWeight: 400,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                            }}
                          >
                            {msg.content}
                          </div>
                          <div
                            style={{
                              fontSize: 10.5,
                              color: 'rgba(255,255,255,0.2)',
                              marginTop: 3,
                              fontWeight: 300,
                            }}
                          >
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                      );
                    })
                  )}
                  {customerTyping[selected] && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 8 }}>
                      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>
                        Customer is typing
                      </div>
                      <div style={{
                        padding: '8px 14px',
                        borderRadius: '14px 4px 14px 14px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        gap: 4,
                        alignItems: 'center',
                      }}>
                        {[0, 1, 2].map((i) => (
                          <span key={i} style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: '#5eead4', display: 'inline-block',
                            animation: `saukiDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                          }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Agent input */}
                {currentSess?.status !== 'resolved' && currentSess?.agent_mode && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(34,197,94,0.04)',
                      display: 'flex',
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <input
                      value={agentInput}
                      onChange={(e) => setAgentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendAgentMessage()}
                      placeholder="Reply as agent..."
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: 10,
                        padding: '9px 14px',
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                        outline: 'none',
                      }}
                    />
                    <button
                      className="adm-btn"
                      onClick={sendAgentMessage}
                      disabled={!agentInput.trim() || sending}
                      style={{
                        padding: '9px 16px',
                        background:
                          agentInput.trim() && !sending
                            ? 'linear-gradient(135deg, #16a34a, #0d9488)'
                            : 'rgba(255,255,255,0.06)',
                        border: 'none',
                        borderRadius: 10,
                        color: agentInput.trim() && !sending ? 'white' : 'rgba(255,255,255,0.3)',
                        fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                        boxShadow:
                          agentInput.trim() && !sending
                            ? '0 4px 12px rgba(13,148,136,0.3)'
                            : 'none',
                      }}
                    >
                      Send
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
