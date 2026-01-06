
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { password } = await req.json();

        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all successful transactions (paid or delivered) excluding wallet funding (which isn't a sale)
        const transactions = await prisma.transaction.findMany({
            where: {
                status: { in: ['paid', 'delivered'] },
                type: { in: ['ecommerce', 'data'] }
            },
            include: {
                product: true,
                dataPlan: true
            }
        });

        // Aggregation Logic
        const ledger: Record<string, any> = {};

        transactions.forEach(tx => {
            let key = '';
            let name = '';
            let unitPrice = 0;
            let type = '';

            if (tx.type === 'data' && tx.dataPlan) {
                key = `PLAN-${tx.dataPlan.id}`;
                name = `${tx.dataPlan.network} ${tx.dataPlan.data}`;
                unitPrice = tx.dataPlan.price;
                type = 'Data Bundle';
            } else if (tx.type === 'ecommerce' && tx.product) {
                key = `PROD-${tx.product.id}`;
                name = tx.product.name;
                unitPrice = tx.product.price;
                type = 'Device/Item';
            } else {
                // Fallback for custom or deleted items
                key = `UNKNOWN-${tx.amount}`;
                name = (tx.deliveryData as any)?.manifest || 'Unknown Item';
                unitPrice = tx.amount;
                type = 'Custom';
            }

            if (!ledger[key]) {
                ledger[key] = {
                    key,
                    name,
                    type,
                    unitPrice,
                    unitsSold: 0,
                    totalRevenue: 0
                };
            }

            ledger[key].unitsSold += 1;
            ledger[key].totalRevenue += tx.amount;
        });

        // Calculate Fees and Settlement
        const report = Object.values(ledger).map(item => {
            const fee = item.totalRevenue * 0.02; // 2% Fee
            const vatOnFee = fee * 0.075; // 7.5% VAT on the Fee
            const settlement = item.totalRevenue - fee - vatOnFee;

            return {
                ...item,
                fee,
                vatOnFee,
                settlement
            };
        });

        return NextResponse.json({ report });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: 'Calculation Error' }, { status: 500 });
    }
}
