'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────
interface Message {
  id: string;
  session_id: string;
  sender: 'customer' | 'ai' | 'agent';
  content: string;
  read: boolean;
  delivered: boolean;
  created_at: string;
}
interface Session {
  id: string;
  status: string;
  agent_required: boolean;
  agent_mode: boolean;
}

// ─── Utilities ───────────────────────────────────────────────
function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}
function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}
function getOrCreateCustomerId() {
  if (typeof window === 'undefined') return 'guest';
  let id = localStorage.getItem('sauki_customer_id');
  if (!id) {
    id = 'guest_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('sauki_customer_id', id);
  }
  return id;
}
function groupByDate(messages: Message[]) {
  const groups: { label: string; messages: Message[] }[] = [];
  let current = '';
  messages.forEach((m) => {
    const label = formatDateLabel(m.created_at);
    if (label !== current) {
      groups.push({ label, messages: [] });
      current = label;
    }
    groups[groups.length - 1].messages.push(m);
  });
  return groups;
}

// ─── Typing Dots Component ────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 2px' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#5eead4',
            display: 'inline-block',
            animation: `saukiDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function SupportChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newSession, setNewSession] = useState(false);
  const [sseRetryTick, setSseRetryTick] = useState(0);
  const [idleWarning, setIdleWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();
  const eventSourceRef = useRef<EventSource | null>(null);
  const initialScrollDoneRef = useRef(false);

  // ── Init session ────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const customerId = getOrCreateCustomerId();
      const storedSessionId = sessionStorage.getItem('sauki_session_id');

      let sid = storedSessionId;
      if (!sid) {
        const res = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId, customerName: 'Customer' }),
        });
        const data = await res.json();
        sid = data.session.id;
        sessionStorage.setItem('sauki_session_id', sid!);
        setMessages([]);
      } else {
        const res = await fetch(`/api/chat/sessions?sessionId=${sid}`);
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
        if (data.session) setSession(data.session);
      }

      initialScrollDoneRef.current = false;
      setSessionId(sid);
    };
    init();
  }, [newSession]);

  // ── SSE connection ──────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    const lastPersistedMsg = [...messages].reverse().find((m) => !m.id.startsWith('temp_'));
    const es = new EventSource(
      `/api/chat/stream?sessionId=${sessionId}${lastPersistedMsg ? `&lastId=${lastPersistedMsg.id}` : ''}`
    );
    eventSourceRef.current = es;

    es.addEventListener('messages', (e) => {
      const incoming: Message[] = JSON.parse(e.data);
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        const fresh = incoming.filter((m) => !ids.has(m.id));
        if (fresh.length > 0) {
          const isAtBottom = scrollRef.current
            ? scrollRef.current.scrollHeight -
                scrollRef.current.scrollTop -
                scrollRef.current.clientHeight <
              100
            : true;
          if (!isAtBottom) setUnreadCount((c) => c + fresh.length);
          return [...prev, ...fresh];
        }
        return prev;
      });
    });

    es.addEventListener('session', (e) => {
      setSession(JSON.parse(e.data));
    });

    es.addEventListener('typing', (e) => {
      const indicators: { sender: string; is_typing: boolean }[] = JSON.parse(e.data);
      setAiTyping(indicators.some((t) => t.sender === 'ai' && t.is_typing));
      setAgentTyping(indicators.some((t) => t.sender === 'agent' && t.is_typing));
    });

    es.onerror = () => {
      es.close();
      // Reconnect after 2s
      setTimeout(() => setSseRetryTick((v) => v + 1), 2000);
    };

    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, sseRetryTick]);

  // ── Auto scroll ─────────────────────────────────────────────
  useEffect(() => {
    if (!messages.length || initialScrollDoneRef.current) return;

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      setUnreadCount(0);
      setShowScrollBtn(false);
      initialScrollDoneRef.current = true;
    });
  }, [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
    }
  }, [messages, aiTyping, agentTyping]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!near);
    if (near) setUnreadCount(0);
  };

  // ── Idle detection ──────────────────────────────────────────
  const resetIdle = useCallback(() => {
    setIdleWarning(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdleWarning(true), 5 * 60 * 1000);
  }, []);

  useEffect(() => {
    resetIdle();
    return () => clearTimeout(idleTimer.current);
  }, [resetIdle]);

  // ── Send message ────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !sessionId || sending) return;
    setInput('');
    setSending(true);
    resetIdle();

    // Optimistically add customer message
    const tempMsg: Message = {
      id: 'temp_' + Date.now(),
      session_id: sessionId,
      sender: 'customer',
      content: text,
      read: false,
      delivered: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          content: text,
          customerId: getOrCreateCustomerId(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (data?.customerMessage) {
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempMsg.id);
          const ids = new Set(withoutTemp.map((m) => m.id));
          if (!ids.has(data.customerMessage.id)) {
            withoutTemp.push(data.customerMessage as Message);
          }
          return withoutTemp;
        });
      }

      if (data?.aiMessage) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          if (!ids.has(data.aiMessage.id)) {
            return [...prev, data.aiMessage as Message];
          }
          return prev;
        });
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to process message');
      }
    } catch {
      // silently fail — SSE will sync
    } finally {
      setSending(false);
    }
  };

  // ── Typing indicator send ────────────────────────────────────
  const sendTyping = (typing: boolean) => {
    if (!sessionId) return;
    fetch('/api/chat/typing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, sender: 'customer', isTyping: typing }),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      return;
    }
    clearTimeout(typingTimer.current);
    sendTyping(true);
    typingTimer.current = setTimeout(() => sendTyping(false), 2500);
  };

  useEffect(() => {
    return () => {
      clearTimeout(typingTimer.current);
      sendTyping(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // ── Start new session ────────────────────────────────────────
  const startNewSession = async () => {
    sessionStorage.removeItem('sauki_session_id');
    setMessages([]);
    setSession(null);
    setSessionId(null);
    initialScrollDoneRef.current = false;
    setNewSession((v) => !v);
  };

  // ── Render ───────────────────────────────────────────────────
  const grouped = groupByDate(messages);
  const showTyping = aiTyping || agentTyping;
  const typingLabel = agentTyping ? 'Agent is typing' : 'Sauki AI is typing';
  const isEscalated = session?.agent_required || false;
  const isAgentActive = session?.agent_mode || false;
  const statusBannerText = isAgentActive
    ? '🟢 You are now connected to a live agent'
    : isEscalated
    ? '🟠 Connecting you to a live agent - please stay on this chat'
    : '🤖 Sauki AI is active and ready to help';
  const statusBannerBg = isAgentActive
    ? 'rgba(34,197,94,0.08)'
    : isEscalated
    ? 'rgba(251,191,36,0.08)'
    : 'rgba(45,212,191,0.08)';
  const statusBannerBorder = isAgentActive
    ? 'rgba(34,197,94,0.15)'
    : isEscalated
    ? 'rgba(251,191,36,0.15)'
    : 'rgba(45,212,191,0.15)';
  const statusBannerColor = isAgentActive
    ? '#86efac'
    : isEscalated
    ? '#fde68a'
    : '#99f6e4';

  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .sauki-chat-root * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes saukiDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes saukiFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes saukiPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(45, 212, 191, 0.5); }
          50%       { box-shadow: 0 0 0 6px rgba(45, 212, 191, 0); }
        }
        @keyframes saukiSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes saukiShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .sauki-msg { animation: saukiFadeUp 0.28s ease forwards; }

        .sauki-input-area textarea:focus { outline: none; }

        .sauki-scroll::-webkit-scrollbar { width: 4px; }
        .sauki-scroll::-webkit-scrollbar-track { background: transparent; }
        .sauki-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 4px;
        }

        .sauki-send-btn:active { transform: scale(0.93); }
        .sauki-send-btn { transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), background 0.2s; }

        .sauki-session-btn:hover { background: rgba(255,255,255,0.07) !important; }
        .sauki-session-btn { transition: background 0.2s; }
      `}</style>

      <div
        className="sauki-chat-root"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          background: 'linear-gradient(145deg, #080c14 0%, #0a1120 50%, #080c14 100%)',
          borderRadius: 20,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 520,
          maxHeight: 720,
          width: '100%',
          maxWidth: 480,
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
        onMouseMove={resetIdle}
        onClick={resetIdle}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Logo mark */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 16px rgba(13,148,136,0.4)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.477 2 2 6.477 2 12c0 1.82.487 3.53 1.338 5L2 22l5.2-1.308A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                  fill="white"
                  fillOpacity="0.9"
                />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  color: '#f0fdf9',
                  letterSpacing: '-0.01em',
                }}
              >
                Sauki Mart
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.45)',
                  fontWeight: 300,
                  letterSpacing: '0.01em',
                }}
              >
                Support Centre
              </div>
            </div>
          </div>

          {/* Status + New Session */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 20,
                background: isAgentActive
                  ? 'rgba(34,197,94,0.12)'
                  : isEscalated
                  ? 'rgba(251,191,36,0.12)'
                  : 'rgba(45,212,191,0.12)',
                border: `1px solid ${
                  isAgentActive
                    ? 'rgba(34,197,94,0.25)'
                    : isEscalated
                    ? 'rgba(251,191,36,0.25)'
                    : 'rgba(45,212,191,0.25)'
                }`,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isAgentActive ? '#22c55e' : isEscalated ? '#fbbf24' : '#2dd4bf',
                  display: 'inline-block',
                  animation: 'saukiPulse 2s ease-in-out infinite',
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: isAgentActive ? '#86efac' : isEscalated ? '#fde68a' : '#99f6e4',
                }}
              >
                {isAgentActive ? 'Live Agent' : isEscalated ? 'Connecting...' : 'Online'}
              </span>
            </div>

            <button
              className="sauki-session-btn"
              onClick={startNewSession}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                color: 'rgba(255,255,255,0.5)',
                fontSize: 11,
                fontFamily: "'DM Sans', sans-serif",
                padding: '5px 10px',
                cursor: 'pointer',
                fontWeight: 400,
              }}
            >
              New chat
            </button>
          </div>
        </div>

        {/* ── Status Banner ── */}
        <div
          style={{
            animation: 'saukiSlideDown 0.3s ease forwards',
            padding: '9px 20px',
            background: statusBannerBg,
            borderBottom: `1px solid ${statusBannerBorder}`,
            fontSize: 12.5,
            color: statusBannerColor,
            textAlign: 'center',
            fontWeight: 400,
            letterSpacing: '0.01em',
            flexShrink: 0,
          }}
        >
          {statusBannerText}
        </div>

        {/* ── Idle Warning ── */}
        {idleWarning && (
          <div
            style={{
              animation: 'saukiSlideDown 0.3s ease forwards',
              padding: '9px 20px',
              background: 'rgba(99,102,241,0.08)',
              borderBottom: '1px solid rgba(99,102,241,0.15)',
              fontSize: 12.5,
              color: '#a5b4fc',
              textAlign: 'center',
              fontWeight: 400,
              flexShrink: 0,
            }}
          >
            Still there? Your session is active - an agent will respond soon.
          </div>
        )}

        {/* ── Messages ── */}
        <div
          className="sauki-scroll"
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                opacity: 0.5,
                paddingBottom: 40,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.477 2 2 6.477 2 12c0 1.82.487 3.53 1.338 5L2 22l5.2-1.308A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                    fill="white"
                    fillOpacity="0.8"
                  />
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: 4,
                  }}
                >
                  Sauki Mart Support
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>
                  Say hi to get started
                </div>
              </div>
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.label}>
              {/* Date divider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  margin: '12px 0 10px',
                }}
              >
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.3)',
                    fontWeight: 400,
                    letterSpacing: '0.03em',
                  }}
                >
                  {group.label}
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {group.messages.map((msg, idx) => {
                const isCustomer = msg.sender === 'customer';
                const isFirst =
                  idx === 0 || group.messages[idx - 1].sender !== msg.sender;
                const isLast =
                  idx === group.messages.length - 1 ||
                  group.messages[idx + 1].sender !== msg.sender;

                return (
                  <div
                    key={msg.id}
                    className="sauki-msg"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isCustomer ? 'flex-end' : 'flex-start',
                      marginBottom: isLast ? 8 : 2,
                    }}
                  >
                    {/* Sender label */}
                    {isFirst && !isCustomer && (
                      <div
                        style={{
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.35)',
                          marginBottom: 4,
                          marginLeft: 4,
                          fontWeight: 500,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {msg.sender === 'agent' ? '🟢 Agent' : 'Sauki AI'}
                      </div>
                    )}

                    <div
                      style={{
                        maxWidth: '82%',
                        padding: '10px 14px',
                        borderRadius: isCustomer
                          ? `16px 4px 16px 16px`
                          : `4px 16px 16px 16px`,
                        ...(isCustomer
                          ? {
                              background:
                                'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
                              color: '#f0fdf9',
                              boxShadow: '0 4px 16px rgba(13,148,136,0.25)',
                            }
                          : msg.sender === 'agent'
                          ? {
                              background: 'rgba(34,197,94,0.08)',
                              border: '1px solid rgba(34,197,94,0.2)',
                              color: '#e2e8f0',
                            }
                          : {
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              backdropFilter: 'blur(16px)',
                              color: '#e2e8f0',
                            }),
                        fontSize: 14,
                        lineHeight: 1.55,
                        fontWeight: 400,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.content}
                    </div>

                    {/* Timestamp + read receipt */}
                    {isLast && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          marginTop: 4,
                          marginRight: isCustomer ? 2 : 0,
                          marginLeft: isCustomer ? 0 : 2,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: 'rgba(255,255,255,0.28)',
                            fontWeight: 300,
                          }}
                        >
                          {formatTime(msg.created_at)}
                        </span>
                        {isCustomer && (
                          <span
                            style={{
                              fontSize: 11,
                              color: msg.read
                                ? '#2dd4bf'
                                : 'rgba(255,255,255,0.35)',
                              letterSpacing: '-1px',
                            }}
                          >
                            {msg.read ? '✓✓' : msg.delivered ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Typing Indicator */}
          {showTyping && (
            <div
              className="sauki-msg"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.35)',
                  marginBottom: 4,
                  marginLeft: 4,
                  fontWeight: 500,
                }}
              >
                {typingLabel}
              </div>
              <div
                style={{
                  padding: '10px 16px',
                  borderRadius: '4px 16px 16px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Scroll to bottom button ── */}
        {showScrollBtn && (
          <button
            onClick={() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              setUnreadCount(0);
            }}
            style={{
              position: 'absolute',
              bottom: 90,
              right: 16,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(13,148,136,0.9)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              color: 'white',
              fontSize: 18,
              transition: 'transform 0.2s',
            }}
          >
            {unreadCount > 0 ? (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                {unreadCount}
              </span>
            ) : (
              '↓'
            )}
          </button>
        )}

        {/* ── Input Bar ── */}
        <div
          style={{
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            className="sauki-input-area"
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 14,
              padding: '10px 14px',
              transition: 'border-color 0.2s',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onBlur={() => sendTyping(false)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                resize: 'none',
                lineHeight: 1.5,
                maxHeight: 100,
                overflow: 'auto',
              }}
            />
          </div>

          {/* Send Button */}
          <button
            className="sauki-send-btn"
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background:
                input.trim() && !sending
                  ? 'linear-gradient(135deg, #0d9488, #0891b2)'
                  : 'rgba(255,255,255,0.06)',
              border: 'none',
              cursor: input.trim() && !sending ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow:
                input.trim() && !sending
                  ? '0 4px 14px rgba(13,148,136,0.4)'
                  : 'none',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              style={{ transform: 'rotate(45deg)' }}
            >
              <path
                d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                stroke={input.trim() && !sending ? 'white' : 'rgba(255,255,255,0.3)'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Powered by footer */}
        <div
          style={{
            textAlign: 'center',
            padding: '6px 0',
            fontSize: 10.5,
            color: 'rgba(255,255,255,0.18)',
            fontWeight: 300,
            letterSpacing: '0.03em',
            background: 'rgba(0,0,0,0.2)',
            flexShrink: 0,
          }}
        >
          Powered by Sauki AI · Sauki Mart
        </div>
      </div>
    </>
  );
}
