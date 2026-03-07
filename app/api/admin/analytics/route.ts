import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const h = req.headers.get('authorization');
  if (!h?.startsWith('Bearer ') || !(await verifyAdminToken(h.slice(7)))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '30');

  const [users] = await sql`SELECT COUNT(*) as total FROM users`;
  const [activeToday] = await sql`SELECT COUNT(*) as c FROM users WHERE updated_at > NOW() - INTERVAL '1 day'`;
  const [totalTxns] = await sql`SELECT COUNT(*) as c, COALESCE(SUM(amount),0) as vol FROM transactions WHERE status='success' AND created_at > NOW() - INTERVAL '${days} days'`;
  const [totalDeposits] = await sql`SELECT COALESCE(SUM(amount),0) as vol FROM deposits WHERE created_at > NOW() - INTERVAL '${days} days'`;

  // Sales calc: sum selling price and cost price for each transaction
  const salesData = await sql`
    SELECT
      t.type,
      t.amount as selling_price,
      CASE
        WHEN t.type='data' THEN dp.cost_price
        WHEN t.type='product' THEN p.cost_price
        WHEN t.type='sim_activation' THEN 3500
        ELSE 0
      END as cost_price,
      t.created_at
    FROM transactions t
    LEFT JOIN data_plans dp ON t.type='data' AND dp.plan_id = t.plan_id
    LEFT JOIN products p ON t.type='product' AND p.id = t.product_id
    WHERE t.status='success' AND t.type IN ('data','product','sim_activation')
    AND t.created_at > NOW() - INTERVAL '${days} days'
    ORDER BY t.created_at DESC
  `;

  const totalRevenue = salesData.reduce((s: number, r: Record<string,unknown>) => s + parseFloat(r.selling_price as string), 0);
  const totalCost = salesData.reduce((s: number, r: Record<string,unknown>) => s + parseFloat((r.cost_price as string) || '0'), 0);
  const totalProfit = totalRevenue - totalCost;

  // Daily breakdown
  const dailyTxns = await sql`
    SELECT DATE(created_at) as day, COUNT(*) as count, SUM(amount) as revenue
    FROM transactions WHERE status='success' AND created_at > NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at) ORDER BY day DESC LIMIT ${days}
  `;

  // Recent transactions with user info
  const recentTxns = await sql`
    SELECT t.id, t.type, t.description, t.amount, t.status, t.created_at,
           u.first_name, u.last_name, u.phone
    FROM transactions t JOIN users u ON t.user_id = u.id
    WHERE t.status='success' ORDER BY t.created_at DESC LIMIT 20
  `;

  return NextResponse.json({
    overview: {
      totalUsers: parseInt(users.total),
      activeToday: parseInt(activeToday.c),
      totalTransactions: parseInt(totalTxns.c),
      transactionVolume: parseFloat(totalTxns.vol),
      totalDeposits: parseFloat(totalDeposits.vol),
      totalRevenue,
      totalCost,
      totalProfit,
    },
    dailyBreakdown: dailyTxns,
    recentTransactions: recentTxns,
    salesData: salesData.slice(0, 100),
  });
}
