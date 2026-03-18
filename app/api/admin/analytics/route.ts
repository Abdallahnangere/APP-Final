import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const LAGOS_TIMEZONE = 'Africa/Lagos';

function buildAnalyticsWindow(searchParams: URLSearchParams) {
  const filter = searchParams.get('filter') || '';
  const selectedDate = searchParams.get('date') || '';

  if (selectedDate) {
    return {
      label: selectedDate,
      txClause: `DATE(created_at AT TIME ZONE '${LAGOS_TIMEZONE}') = $1`,
      depositClause: `DATE(created_at AT TIME ZONE '${LAGOS_TIMEZONE}') = $1`,
      recentClause: `DATE(t.created_at AT TIME ZONE '${LAGOS_TIMEZONE}') = $1`,
      params: [selectedDate],
    };
  }

  if (filter === 'today') {
    return {
      label: 'today',
      txClause: `DATE(created_at AT TIME ZONE '${LAGOS_TIMEZONE}') = DATE(NOW() AT TIME ZONE '${LAGOS_TIMEZONE}')`,
      depositClause: `DATE(created_at AT TIME ZONE '${LAGOS_TIMEZONE}') = DATE(NOW() AT TIME ZONE '${LAGOS_TIMEZONE}')`,
      recentClause: `DATE(t.created_at AT TIME ZONE '${LAGOS_TIMEZONE}') = DATE(NOW() AT TIME ZONE '${LAGOS_TIMEZONE}')`,
      params: [],
    };
  }

  if (filter === 'week') {
    return {
      label: 'last 7 days',
      txClause: `(created_at AT TIME ZONE '${LAGOS_TIMEZONE}') >= ((NOW() AT TIME ZONE '${LAGOS_TIMEZONE}') - INTERVAL '6 days')`,
      depositClause: `(created_at AT TIME ZONE '${LAGOS_TIMEZONE}') >= ((NOW() AT TIME ZONE '${LAGOS_TIMEZONE}') - INTERVAL '6 days')`,
      recentClause: `(t.created_at AT TIME ZONE '${LAGOS_TIMEZONE}') >= ((NOW() AT TIME ZONE '${LAGOS_TIMEZONE}') - INTERVAL '6 days')`,
      params: [],
    };
  }

  if (filter === 'month') {
    return {
      label: 'this month',
      txClause: `DATE_TRUNC('month', created_at AT TIME ZONE '${LAGOS_TIMEZONE}') = DATE_TRUNC('month', NOW() AT TIME ZONE '${LAGOS_TIMEZONE}')`,
      depositClause: `DATE_TRUNC('month', created_at AT TIME ZONE '${LAGOS_TIMEZONE}') = DATE_TRUNC('month', NOW() AT TIME ZONE '${LAGOS_TIMEZONE}')`,
      recentClause: `DATE_TRUNC('month', t.created_at AT TIME ZONE '${LAGOS_TIMEZONE}') = DATE_TRUNC('month', NOW() AT TIME ZONE '${LAGOS_TIMEZONE}')`,
      params: [],
    };
  }

  return {
    label: 'last 30 days',
    txClause: `(created_at AT TIME ZONE '${LAGOS_TIMEZONE}') >= ((NOW() AT TIME ZONE '${LAGOS_TIMEZONE}') - INTERVAL '30 days')`,
    depositClause: `(created_at AT TIME ZONE '${LAGOS_TIMEZONE}') >= ((NOW() AT TIME ZONE '${LAGOS_TIMEZONE}') - INTERVAL '30 days')`,
    recentClause: `(t.created_at AT TIME ZONE '${LAGOS_TIMEZONE}') >= ((NOW() AT TIME ZONE '${LAGOS_TIMEZONE}') - INTERVAL '30 days')`,
    params: [],
  };
}

export async function GET(req: NextRequest) {
  const h = req.headers.get('authorization');
  if (!h?.startsWith('Bearer ') || !(await verifyAdminToken(h.slice(7)))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const window = buildAnalyticsWindow(searchParams);

  const usersResult = await db.query<{ total: string }>('SELECT COUNT(*) as total FROM users');
  const activeTodayResult = await db.query<{ c: string }>(`SELECT COUNT(*) as c FROM users WHERE DATE(updated_at AT TIME ZONE '${LAGOS_TIMEZONE}') = DATE(NOW() AT TIME ZONE '${LAGOS_TIMEZONE}')`);
  const totalTxnsResult = await db.query<{ c: string; vol: string }>(
    `SELECT COUNT(*) as c, COALESCE(SUM(amount),0) as vol FROM transactions WHERE status='success' AND ${window.txClause}`,
    window.params,
  );
  const totalDepositsResult = await db.query<{ vol: string }>(
    `SELECT COALESCE(SUM(amount),0) as vol FROM deposits WHERE ${window.depositClause}`,
    window.params,
  );
  const cashbackResult = await db.query<{ total: string }>('SELECT COALESCE(SUM(cashback_balance),0) as total FROM users');

  const [users] = usersResult.rows;
  const [activeToday] = activeTodayResult.rows;
  const [totalTxns] = totalTxnsResult.rows;
  const [totalDeposits] = totalDepositsResult.rows;
  const [cashbackLiability] = cashbackResult.rows;

  // Sales calc: sum selling price and cost price for each transaction
  const salesDataResult = await db.query<Record<string, unknown>>(
    `
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
    AND ${window.recentClause}
    ORDER BY t.created_at DESC
  `,
    window.params,
  );
  const salesData = salesDataResult.rows;

  const totalRevenue = salesData.reduce((s: number, r: Record<string,unknown>) => s + parseFloat(r.selling_price as string), 0);
  const totalCost = salesData.reduce((s: number, r: Record<string,unknown>) => s + parseFloat((r.cost_price as string) || '0'), 0);
  const totalProfit = totalRevenue - totalCost;
  const dataSales = salesData.filter(row => row.type === 'data').length;
  const productSales = salesData.filter(row => row.type === 'product').length;
  const simSales = salesData.filter(row => row.type === 'sim_activation').length;
  const averageTransaction = parseInt(totalTxns.c || '0', 10) > 0 ? totalRevenue / parseInt(totalTxns.c || '0', 10) : 0;

  // Daily breakdown
  const dailyTxnsResult = await db.query<Record<string, unknown>>(
    `
    SELECT DATE(created_at AT TIME ZONE '${LAGOS_TIMEZONE}') as day, COUNT(*) as count, COALESCE(SUM(amount),0) as revenue
    FROM transactions WHERE status='success' AND ${window.txClause}
    GROUP BY DATE(created_at AT TIME ZONE '${LAGOS_TIMEZONE}') ORDER BY day DESC LIMIT 31
  `,
    window.params,
  );
  const dailyTxns = dailyTxnsResult.rows;

  // Recent transactions with user info
  const recentTxnsResult = await db.query<Record<string, unknown>>(
    `
    SELECT t.id, t.type, t.description, t.amount, t.status, t.created_at,
           u.first_name, u.last_name, u.phone
    FROM transactions t JOIN users u ON t.user_id = u.id
    WHERE t.status='success' AND ${window.recentClause}
    ORDER BY t.created_at DESC LIMIT 20
  `,
    window.params,
  );
  const recentTxns = recentTxnsResult.rows;

  const response = NextResponse.json({
    overview: {
      totalUsers: parseInt(users.total),
      activeToday: parseInt(activeToday.c),
      totalTransactions: parseInt(totalTxns.c),
      transactionVolume: parseFloat(totalTxns.vol),
      totalDeposits: parseFloat(totalDeposits.vol),
      totalRevenue,
      totalCost,
      totalProfit,
      dataSales,
      productSales,
      simSales,
      avgTransaction: averageTransaction,
      rangeLabel: window.label,
      totalCashbackLiability: parseFloat(cashbackLiability.total),
    },
    dailyBreakdown: dailyTxns,
    recentTransactions: recentTxns,
    salesData: salesData.slice(0, 100),
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
