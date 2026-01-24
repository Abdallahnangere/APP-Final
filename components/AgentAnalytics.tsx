import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Wallet, ShoppingBag, Activity } from 'lucide-react';
import { Agent, Transaction } from '../types';
import { formatCurrency, cn } from '../lib/utils';

interface AgentAnalyticsProps {
  agent: Agent;
  transactions: Transaction[];
}

export const AgentAnalytics: React.FC<AgentAnalyticsProps> = ({ agent, transactions }) => {
  const MotionDiv = motion.div as any;

  // Calculate analytics metrics
  const analytics = useMemo(() => {
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, tx) => {
      if (tx.type === 'wallet_funding') return sum;
      return sum + tx.amount;
    }, 0);
    
    const dataSales = transactions.filter(tx => tx.type === 'data').length;
    const storeSales = transactions.filter(tx => tx.type === 'ecommerce').length;
    const totalDeposits = transactions
      .filter(tx => tx.type === 'wallet_funding')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    const currentWeekRevenue = transactions
      .filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate >= weekAgo && tx.type !== 'wallet_funding';
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    const previousWeekRevenue = transactions
      .filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate >= twoWeeksAgo && txDate < weekAgo && tx.type !== 'wallet_funding';
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    const revenueGrowth = previousWeekRevenue > 0 
      ? ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100 
      : 0;

    const dataSalesRevenue = transactions
      .filter(tx => tx.type === 'data')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const storeSalesRevenue = transactions
      .filter(tx => tx.type === 'ecommerce')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const topCategory = dataSalesRevenue > storeSalesRevenue ? 'Data' : 'Store';

    return {
      totalTransactions,
      totalRevenue,
      dataSales,
      storeSales,
      totalDeposits,
      revenueGrowth,
      topCategory,
      currentWeekRevenue,
      previousWeekRevenue,
      conversionRate: totalDeposits > 0 ? ((totalRevenue / totalDeposits) * 100).toFixed(1) : '0',
      dataSalesRevenue,
      storeSalesRevenue
    };
  }, [transactions]);

  // StatCard Component
  const StatCard = ({ icon: Icon, label, value, trend, color = 'blue' }: any) => (
    <MotionDiv
      whileHover={{ y: -4 }}
      className={cn(
        "p-5 rounded-[1.75rem] border-2 shadow-lg transition-all",
        color === 'blue' && "bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:border-blue-300",
        color === 'green' && "bg-gradient-to-br from-green-50 to-white border-green-200 hover:border-green-300",
        color === 'purple' && "bg-gradient-to-br from-purple-50 to-white border-purple-200 hover:border-purple-300",
        color === 'orange' && "bg-gradient-to-br from-orange-50 to-white border-orange-200 hover:border-orange-300"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "p-3 rounded-xl",
          color === 'blue' && "bg-blue-100 text-blue-600",
          color === 'green' && "bg-green-100 text-green-600",
          color === 'purple' && "bg-purple-100 text-purple-600",
          color === 'orange' && "bg-orange-100 text-orange-600"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={cn(
            "text-xs font-black px-2 py-1 rounded-lg",
            trend >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
    </MotionDiv>
  );

  return (
    <div className="space-y-4">
      {/* Buy Data & Products Summary - Top */}
      <div>
        <h3 className="text-xs font-black text-slate-600 uppercase tracking-wide mb-2">Sales Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-[10px] text-blue-900 font-bold uppercase tracking-wider mb-1">Data Sales</p>
            <p className="text-lg font-black text-blue-900">{analytics.dataSales}</p>
            <p className="text-xs text-blue-700 font-semibold mt-1">{formatCurrency(analytics.dataSalesRevenue)}</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-[10px] text-purple-900 font-bold uppercase tracking-wider mb-1">Device Sales</p>
            <p className="text-lg font-black text-purple-900">{analytics.storeSales}</p>
            <p className="text-xs text-purple-700 font-semibold mt-1">{formatCurrency(analytics.storeSalesRevenue)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
