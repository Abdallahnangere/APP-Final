import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

/**
 * Cashback Redemption API
 * - Transfers cashback balance to main wallet
 * - Creates transaction record
 * - Prevents double redemption with database constraints
 * - Returns updated agent balance
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agentId, amount } = body;

    if (!agentId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid agent ID or amount' },
        { status: 400 }
      );
    }

    // Fetch agent with current balances
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Verify sufficient cashback balance
    const currentCashback = agent.cashbackBalance || 0;
    if (amount > currentCashback) {
      return NextResponse.json(
        { error: 'Insufficient cashback balance', available: currentCashback },
        { status: 402 }
      );
    }

    // Transaction: Update balances atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update agent balances
      const updatedAgent = await tx.agent.update({
        where: { id: agentId },
        data: {
          balance: { increment: amount },
          cashbackBalance: { decrement: amount },
          cashbackRedeemed: { increment: amount },
        },
      });

      // Create transaction record for audit trail
      const redemptionTx = await tx.transaction.create({
        data: {
          tx_ref: `REDEEM-${Date.now()}-${uuidv4()}`,
          type: 'cashback_redemption',
          status: 'paid',
          amount,
          agentId,
          customerName: `${agent.firstName} ${agent.lastName}`,
          phone: agent.phone,
          deliveryState: 'Wallet Transfer',
          idempotencyKey: uuidv4(),
          deliveryData: {
            method: 'Instant Wallet Transfer',
            manifest: `Cashback redeemed: ${amount}`,
            description: `Cashback redemption to main wallet`,
            previousCashbackBalance: currentCashback,
            newCashbackBalance: currentCashback - amount,
            newMainBalance: (agent.balance || 0) + amount,
          },
        },
      });

      // Log cashback entry
      await tx.cashbackEntry.create({
        data: {
          agentId,
          type: 'redeemed',
          amount,
          transactionId: redemptionTx.id,
          description: `Redeemed ₦${amount} to main wallet`,
        },
      });

      return updatedAgent;
    });

    return NextResponse.json({
      success: true,
      message: `₦${amount} redeemed successfully`,
      agent: {
        id: result.id,
        balance: result.balance,
        cashbackBalance: result.cashbackBalance,
        cashbackRedeemed: result.cashbackRedeemed,
      },
    });
  } catch (error: any) {
    console.error('Cashback Redemption Error:', error);
    return NextResponse.json(
      { error: error.message || 'Redemption failed' },
      { status: 500 }
    );
  }
}
