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
      if (tx.type === 'wallet_funding') return sum; // Don't count deposits as revenue
      return sum + tx.amount;
    }, 0);
    
    const dataSales = transactions.filter(tx => tx.type === 'data').length;
    const storeSales = transactions.filter(tx => tx.type === 'ecommerce').length;
    const totalDeposits = transactions
      .filter(tx => tx.type === 'wallet_funding')
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate trends (last 7 vs previous 7 days)
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

    // Top performing category
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
      conversionRate: totalDeposits > 0 ? ((totalRevenue / totalDeposits) * 100).toFixed(1) : '0'
    };
  }, [transactions]);

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
    <div className="space-y-5">
      {/* Main Stats */}
      <div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 ml-2">Performance Dashboard</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard 
            icon={ShoppingBag} 
            label="Total Revenue" 
            value={formatCurrency(analytics.totalRevenue)}
            trend={analytics.revenueGrowth}
            color="blue"
          />
          <StatCard 
            icon={Wallet} 
            label="Available Balance" 
            value={formatCurrency(agent.balance)}
            color="green"
          />
          <StatCard 
            icon={Activity} 
            label="Total Sales" 
            value={`${analytics.dataSales + analytics.storeSales}`}
            color="purple"
          />
          <StatCard 
            icon={TrendingUp} 
            label="Conversion Rate" 
            value={`${analytics.conversionRate}%`}
            color="orange"
          />
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <MotionDiv
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 hover:border-blue-300 transition-all shadow-sm"
        >
          <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-2">Data Sales</p>
          <p className="text-xl font-black text-blue-900">{analytics.dataSales}</p>
          <p className="text-[9px] text-blue-700 font-semibold mt-1">
            {formatCurrency(transactions
              .filter(tx => tx.type === 'data')
              .reduce((sum, tx) => sum + tx.amount, 0))}
          </p>
        </MotionDiv>

        <MotionDiv
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 hover:border-purple-300 transition-all shadow-sm"
        >
          <p className="text-[8px] font-black text-purple-600 uppercase tracking-widest mb-2">Store Sales</p>
          <p className="text-xl font-black text-purple-900">{analytics.storeSales}</p>
          <p className="text-[9px] text-purple-700 font-semibold mt-1">
            {formatCurrency(transactions
              .filter(tx => tx.type === 'ecommerce')
              .reduce((sum, tx) => sum + tx.amount, 0))}
          </p>
        </MotionDiv>

        <MotionDiv
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-white border-2 border-green-200 hover:border-green-300 transition-all shadow-sm"
        >
          <p className="text-[8px] font-black text-green-600 uppercase tracking-widest mb-2">Total Deposits</p>
          <p className="text-xl font-black text-green-900">{formatCurrency(analytics.totalDeposits)}</p>
          <p className="text-[9px] text-green-700 font-semibold mt-1">Funded</p>
        </MotionDiv>

        <MotionDiv
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 hover:border-amber-300 transition-all shadow-sm"
        >
          <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-2">Top Category</p>
          <p className="text-xl font-black text-amber-900">{analytics.topCategory}</p>
          <p className="text-[9px] text-amber-700 font-semibold mt-1">Best Performer</p>
        </MotionDiv>
      </div>

      {/* Intelligence Panel */}
      <MotionDiv
        whileHover={{ y: -2 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border-2 border-slate-700 text-white shadow-xl"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <BarChart3 className="w-6 h-6 text-amber-300" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-2">Smart Insight</p>
            {analytics.revenueGrowth > 0 ? (
              <>
                <p className="text-sm font-black text-white mb-1">
                  Revenue up {analytics.revenueGrowth.toFixed(1)}% this week! 🚀
                </p>
                <p className="text-xs text-white/70 font-semibold">
                  Keep momentum: {analytics.topCategory} category is your strength.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-black text-white mb-1">
                  {analytics.totalTransactions === 0 ? "Welcome to your agent dashboard!" : `Keep pushing forward!`}
                </p>
                <p className="text-xs text-white/70 font-semibold">
                  {analytics.totalTransactions === 0 
                    ? "Complete your first transaction to get insights."
                    : `You've made ${analytics.totalTransactions} transaction${analytics.totalTransactions !== 1 ? 's' : ''} so far.`}
                </p>
              </>
            )}
          </div>
        </div>
      </MotionDiv>
    </div>
  );
};
