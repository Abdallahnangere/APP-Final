import { NextRequest, NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ') || !(await verifyAdminToken(auth.slice(7)))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await initDB();

  // Seed default data plans if empty
  const sql = (await import('@/lib/db')).default;
  const existing = await sql`SELECT COUNT(*) as c FROM data_plans`;
  if (parseInt(existing[0].c) === 0) {
    await sql`
      INSERT INTO data_plans (network, network_id, plan_id, data_size, validity, selling_price, cost_price) VALUES
      ('MTN',1,5000,'500MB','30 days',350,299),
      ('MTN',1,1001,'1GB','30 days',500,429),
      ('MTN',1,6666,'2GB','30 days',950,849),
      ('MTN',1,3333,'3GB','30 days',1450,1329),
      ('MTN',1,9999,'5GB','30 days',1999,1799),
      ('MTN',1,7777,'7GB','30 days',2799,2499),
      ('MTN',1,1110,'10GB','30 days',4299,3899),
      ('GLO',2,218,'200MB','30 days',150,99),
      ('GLO',2,217,'500MB','30 days',250,199),
      ('GLO',2,206,'1GB','30 days',499,399),
      ('GLO',2,195,'2GB','30 days',999,799),
      ('GLO',2,196,'3GB','30 days',1399,1199),
      ('GLO',2,222,'5GB','30 days',2299,1999),
      ('AIRTEL',4,539,'500MB','7 days',649,549),
      ('AIRTEL',4,400,'1GB','7 days',849,749),
      ('AIRTEL',4,532,'3GB','30 days',2199,1950),
      ('AIRTEL',4,391,'4GB','30 days',2699,2419),
      ('AIRTEL',4,392,'10GB','30 days',4299,3899)
    `;
  }

  return NextResponse.json({ success: true, message: 'Database initialized' });
}
