import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyToken } from '@/lib/auth';

const GREETINGS = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup', 'yo', 'greetings', "what's up", 'whats up'];

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function contains(text: string, phrases: string[]) {
  const norm = normalize(text);
  return phrases.some(p => norm.includes(p));
}

function looksLikeOrderId(text: string) {
  // simple heuristic: contains 'order' and digits
  return /order\s*#?\s*\w*\d+/i.test(text) || /\bORD\w*\d+/i.test(text);
}

async function getOrCreateSession(userId: string, forceNew = false) {
  if (forceNew) {
    const [newSession] = await sql`
      INSERT INTO chat_sessions (user_id, last_activity, last_message) VALUES (${userId}, NOW(), '')
      RETURNING *
    `;
    return newSession;
  }

  const [session] = await sql`
    SELECT * FROM chat_sessions
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
    LIMIT 1
  `;

  if (session) {
    // refresh last_activity
    await sql`
      UPDATE chat_sessions SET last_activity = NOW(), updated_at = NOW() WHERE id = ${session.id}
    `;
    return { ...session };
  }

  const [newSession] = await sql`
    INSERT INTO chat_sessions (user_id, last_activity, last_message) VALUES (${userId}, NOW(), '')
    RETURNING *
  `;
  return newSession;
}

async function fetchSessionMessages(sessionId: string) {
  return sql`
    SELECT id, sender, message, created_at, delivered_at, read_at
    FROM chats
    WHERE session_id = ${sessionId}
    ORDER BY created_at ASC
  `;
}

async function markDeliveredAndRead(sessionId: string) {
  await sql`
    UPDATE chats
    SET delivered_at = NOW(), read_at = NOW()
    WHERE session_id = ${sessionId} AND sender != 'user' AND (delivered_at IS NULL OR read_at IS NULL)
  `;
}

async function insertChatMessage(sessionId: string, userId: string, sender: string, message: string) {
  const trimmed = message.trim();
  const [msg] = await sql`
    INSERT INTO chats (session_id, user_id, sender, message)
    VALUES (${sessionId}, ${userId}, ${sender}, ${trimmed})
    RETURNING id, sender, message, created_at
  `;
  return msg;
}


function generateSaukiResponse(message: string, session: any) {
  const text = normalize(message);

  // 1) If escalated and user wants AI back
  if (session.agent_required && text === 'hi sauki ai') {
    return {
      response: "👋 Welcome to Sauki Mart Support Centre! I'm Sauki AI, and I'll be assisting you while an agent becomes available. How can I help you today?",
      update: { agent_required: false, status: 'ai', abusive_warned: false },
    };
  }

  // 2) If session already escalated, stop replying
  if (session.agent_required) {
    return { response: null, update: {} };
  }

  // 3) Greeting as first message
  if ((!session.last_message || session.last_message === '') && contains(text, GREETINGS)) {
    return {
      response: "👋 Welcome to Sauki Mart Support Centre! I'm Sauki AI, and I'll be assisting you while an agent becomes available. How can I help you today?",
      update: { status: 'ai' },
    };
  }

  // 4) Abusive language
  const abusiveWords = ['fuck', 'shit', 'bitch', 'asshole', 'damn', 'idiot', 'stupid'];
  if (contains(text, abusiveWords)) {
    if (!session.abusive_warned) {
      return {
        response: "I completely understand your frustration and we truly want to resolve this for you. Let's keep our conversation respectful so I can help you as quickly as possible. 🙏",
        update: { abusive_warned: true },
      };
    }
    return {
      response: null,
      update: { agent_required: true, status: 'needs_agent' },
      escalateNote: 'Abusive language detected',
    };
  }

  // 5) Customer requests human agent
  if (contains(text, ['agent', 'human', 'real person', 'talk to someone', 'stop the ai', 'stop ai', 'speak to someone'])) {
    return {
      response: "Of course! I'm connecting you to a live agent now. Please stay on this chat — someone will be with you shortly. 🙏",
      update: { agent_required: true, status: 'needs_agent' },
    };
  }

  // 6) Can't buy data
  if (contains(text, ['can\'t buy', "can't buy", 'cannot buy', 'unable to buy', 'purchase failing', 'payment not going through', 'data purchase', 'buying data', 'buy data', 'purchase data', 'data is not loading'])) {
    // if they already tried and still not working, escalate
    if (contains(text, ['still', 'still not', 'still does', 'still doesnt', 'still doesn', 'still did not', 'still isn'])) {
      return {
        response: "We're really sorry about this 😔. Your complaint has been logged and forwarded to a live agent who will look into this personally. Please stay on this chat — the agent will respond to you shortly. Thank you so much for your patience!",
        update: { agent_required: true, status: 'needs_agent' },
      };
    }

    return {
      response: `Sorry to hear that! Here's what to try:
1️⃣ Log out of your Sauki Mart account completely
2️⃣ Log back in and attempt the purchase again

If the issue continues after that, please wait a few minutes and try once more — a brief downtime may be occurring on our end. We sincerely apologize for the inconvenience! 🙏`,
      update: { status: 'ai' },
    };
  }

  // 7) Data sent but recipient did not receive
  if (contains(text, ['sent data', 'sent bundle', 'data not received', 'no data', 'recipient has not', 'recipient did not', 'receiver has not', 'receiver did not'])) {
    return {
      response: `Not to worry! Please ask the recipient to dial *323*4# to check their data balance directly — SMS delivery notifications are sometimes delayed by the network. The data is most likely already there! 📶

Let me know what they see after checking.`,
      update: { status: 'ai' },
    };
  }

  // 8) Recipient checked *323*4# and still no data
  if (text.includes('323') && contains(text, ['still', 'not showing', 'still not', 'no data', 'not reflecting'])) {
    return {
      response: "We're really sorry about this 😔. Your complaint has been logged and forwarded to a live agent who will look into this personally. Please stay on this chat — the agent will respond to you shortly. Thank you so much for your patience!",
      update: { agent_required: true, status: 'needs_agent' },
    };
  }

  // 9) Money not credited
  if (contains(text, ['wallet not credited', 'money not credited', 'not credited', 'balance not updated', 'wallet balance']) && contains(text, ['payment', 'sent', 'sent money', 'paid'])) {
    // escalate if reference present
    if (text.match(/ref(erence)?\b|txn\b|tx\b/)) {
      return {
        response: "Thank you! Your reference has been noted. I'm escalating this to our payments team right now. An agent will follow up with you shortly. 🙏",
        update: { agent_required: true, status: 'needs_agent' },
      };
    }
    return {
      response: `We're sorry to hear that! 💳 Please note that your payment has not been received on our end yet. Kindly check with your bank or mobile money provider to confirm whether the transaction was debited from your account.

If the payment was debited but your wallet is still not credited after 30 minutes, please share your transaction reference number here and we will escalate this to our payments team immediately.`,
      update: { status: 'ai' },
    };
  }

  // 10) Device / order issues
  if (contains(text, ['order', 'delivery', 'delivered', 'wrong item', 'damaged', 'not arrived', 'not delivered', 'missing item'])) {
    // If we already have an order id, escalate
    if (looksLikeOrderId(text)) {
      return {
        response: "Thank you! I've flagged your order for our team. An agent will review it and get back to you shortly. Please stay on this chat! 📦",
        update: { agent_required: true, status: 'needs_agent' },
      };
    }
    return {
      response: `We're sorry about your order experience! Please provide your order ID and we'll look into this right away. If you don't have your order ID, check your confirmation email or your order history in the app.`,
      update: { status: 'ai' },
    };
  }

  // 11) Account issues
  if (contains(text, ['can\'t log in', "can't log in", 'cannot log in', 'locked', 'forgot password', 'forget password', 'login issue', 'cannot access', 'account locked'])) {
    return {
      response: `Sorry about that! Here's what to try:
1️⃣ Tap 'Forgot Password' on the login screen to reset via your email or phone number
2️⃣ Check your spam folder if you don't see the reset email

If your account appears locked or you're still unable to access it after resetting, let me know and I'll connect you to an agent right away.`,
      update: { status: 'ai' },
    };
  }

  // 12) Out of scope
  return {
    response: "I'm only able to assist with Sauki Mart-related issues — data bundles, devices, payments, or your account. For anything else, please reach out through our other channels. 😊",
    update: { status: 'ai' },
  };
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const forceNew = url.searchParams.get('new') === 'true';
  const session = await getOrCreateSession(payload.userId as string, forceNew);

  // Mark system/agent messages as delivered/read
  await markDeliveredAndRead(session.id);

  const messages = await fetchSessionMessages(session.id);

  const response = NextResponse.json({ session, messages });
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return response;
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(auth.slice(7));
  if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 });

  const userId = payload.userId as string;
  const session = await getOrCreateSession(userId);

  // If escalated, do not respond with AI (unless user says 'HI SAUKI AI')
  const userMsg = await insertChatMessage(session.id, userId, 'user', message);
  await sql`UPDATE chat_sessions SET last_message = ${message.trim()}, last_activity = NOW(), updated_at = NOW() WHERE id = ${session.id}`;

  // Determine AI response
  const behavior = generateSaukiResponse(message, session);

  const updatedStatus = behavior.update?.status ?? session.status;
  const updatedAgentRequired = behavior.update?.agent_required ?? session.agent_required;
  const updatedAbusiveWarned = behavior.update?.abusive_warned ?? session.abusive_warned;

  await sql`
    UPDATE chat_sessions
    SET last_message = ${message.trim()},
        last_activity = NOW(),
        updated_at = NOW(),
        status = ${updatedStatus},
        agent_required = ${updatedAgentRequired},
        abusive_warned = ${updatedAbusiveWarned}
    WHERE id = ${session.id}
  `;

  if (behavior.escalateNote) {
    await sql`INSERT INTO chat_notes (session_id, created_by, note) VALUES (${session.id}, 'AI', ${behavior.escalateNote})`;
  }

  let aiMsg = null;
  if (behavior.response) {
    aiMsg = await insertChatMessage(session.id, userId, 'ai', behavior.response);
  }

  const updatedSession = await sql`SELECT * FROM chat_sessions WHERE id = ${session.id}`;
  const messages = await fetchSessionMessages(session.id);
  const response = NextResponse.json({ session: updatedSession[0], messages });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
