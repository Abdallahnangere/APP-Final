import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/sessions?filter=all|needs_agent|active|resolved|flagged&sessionId=xxx
export async function GET(req: NextRequest) {
  try {
    const filter = req.nextUrl.searchParams.get('filter') || 'all';
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    const search = req.nextUrl.searchParams.get('search') || '';

    // Fetch single session with messages
    if (sessionId) {
      const session = await db.query(
        `SELECT * FROM chat_sessions WHERE id = $1`,
        [sessionId]
      );
      const messages = await db.query(
        `SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC`,
        [sessionId]
      );

      // Mark customer messages as read
      await db.query(
        `UPDATE chat_messages SET read = true 
         WHERE session_id = $1 AND sender = 'customer' AND read = false`,
        [sessionId]
      );

      return NextResponse.json({
        session: session.rows[0],
        messages: messages.rows,
      });
    }

    // Build filter clause
    const filterMap: Record<string, string> = {
      needs_agent: `AND s.status = 'agent_required'`,
      active: `AND s.status IN ('active', 'agent_active')`,
      resolved: `AND s.status = 'resolved'`,
      flagged: `AND s.status = 'flagged'`,
      all: '',
    };
    const filterClause = filterMap[filter] ?? '';
    const searchClause = search
      ? `AND (s.customer_id ILIKE $1 OR s.customer_name ILIKE $1 OR s.last_message ILIKE $1)`
      : '';
    const params = search ? [`%${search}%`] : [];

    const sessions = await db.query(
      `SELECT 
         s.*,
         COUNT(m.id) FILTER (WHERE m.read = false AND m.sender = 'customer') AS unread_count
       FROM chat_sessions s
       LEFT JOIN chat_messages m ON m.session_id = s.id
       WHERE 1=1 ${filterClause} ${searchClause}
       GROUP BY s.id
       ORDER BY 
         CASE s.status 
           WHEN 'agent_required' THEN 1
           WHEN 'agent_active' THEN 2
           WHEN 'active' THEN 3
           WHEN 'flagged' THEN 4
           ELSE 5
         END,
         s.last_message_at DESC
       LIMIT 100`,
      params
    );

    // Stats
    const stats = await db.query(
      `SELECT
         COUNT(*) FILTER (WHERE status IN ('active','agent_active')) AS active_count,
         COUNT(*) FILTER (WHERE status = 'agent_required')           AS needs_agent_count,
         COUNT(*) FILTER (WHERE status = 'resolved' 
           AND resolved_at > NOW() - INTERVAL '24 hours')            AS resolved_today,
         COUNT(*)                                                     AS total
       FROM chat_sessions`
    );

    return NextResponse.json({
      sessions: sessions.rows,
      stats: stats.rows[0],
    });
  } catch (err) {
    console.error('Admin sessions error:', err);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
