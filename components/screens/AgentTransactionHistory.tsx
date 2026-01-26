import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter, Download, TrendingUp, TrendingDown, Search, Calendar } from 'lucide-react';
import { Transaction } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { Input } from '../ui/Input';

interface AgentTransactionHistoryProps {
  transactions: Transaction[];
  onBack: () => void;
  agentId: string;
}

export const AgentTransactionHistory: React.FC<AgentTransactionHistoryProps> = ({ 
  transactions, 
  onBack,
  agentId
}) => {
  const [filterType, setFilterType] = useState<'all' | 'data' | 'ecommerce' | 'wallet_funding'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'delivered' | 'pending' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter agent transactions
  const agentTransactions = transactions.filter(tx => tx.agentId === agentId);

  // Apply filters
  const filteredTransactions = agentTransactions.filter(tx => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tx.tx_ref.toLowerCase().includes(query) ||
        tx.phone?.toLowerCase().includes(query) ||
        tx.customerName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Calculate totals
  const totals = {
    sales: filteredTransactions.filter(tx => tx.type !== 'wallet_funding').length,
    revenue: filteredTransactions
      .filter(tx => tx.type !== 'wallet_funding' && tx.status === 'delivered')
      .reduce((sum, tx) => sum + tx.amount, 0),
    pending: filteredTransactions.filter(tx => tx.status === 'pending' || tx.status === 'paid').length,
  };

  const MotionDiv = motion.div as any;

  return (
    <div className="h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-900 uppercase">Transaction History</h1>
            <p className="text-xs text-slate-500 font-bold mt-1">{filteredTransactions.length} transactions</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by reference, phone, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-lg text-sm pl-10 pr-4 bg-white border border-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-[10px] text-blue-600 font-bold uppercase">Sales</p>
            <p className="text-lg font-black text-blue-700 mt-1">{totals.sales}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-[10px] text-green-600 font-bold uppercase">Revenue</p>
            <p className="text-lg font-black text-green-700 mt-1">{formatCurrency(totals.revenue)}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <p className="text-[10px] text-amber-600 font-bold uppercase">Pending</p>
            <p className="text-lg font-black text-amber-700 mt-1">{totals.pending}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { key: 'all' as const, label: 'All', icon: null },
            { key: 'data' as const, label: 'Data', icon: '📱' },
            { key: 'ecommerce' as const, label: 'Store', icon: '🛍️' },
            { key: 'wallet_funding' as const, label: 'Deposit', icon: '↓' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterType(filter.key)}
              className={cn(
                'px-4 py-2 rounded-lg font-bold text-xs uppercase whitespace-nowrap transition-all',
                filterType === filter.key
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              {filter.icon && <span className="mr-1">{filter.icon}</span>}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-bold uppercase text-sm">No transactions found</p>
            <p className="text-slate-400 text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filteredTransactions.map((tx, index) => (
            <MotionDiv
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all active:scale-95"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left Side - Icon & Details */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0',
                      tx.type === 'wallet_funding'
                        ? 'bg-green-600'
                        : tx.type === 'data'
                          ? 'bg-blue-600'
                          : 'bg-purple-600'
                    )}
                  >
                    {tx.type === 'wallet_funding' ? '↓' : tx.type === 'data' ? '📱' : '🛍️'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 uppercase truncate">
                      {tx.type === 'wallet_funding'
                        ? 'Wallet Deposit'
                        : tx.type === 'data'
                          ? 'Data Sale'
                          : 'Store Sale'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {tx.phone || tx.customerName || 'N/A'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {/* Status Badge */}
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase px-2 py-1 rounded',
                          tx.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : tx.status === 'paid'
                              ? 'bg-blue-100 text-blue-700'
                              : tx.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                        )}
                      >
                        {tx.status === 'delivered'
                          ? '✓ Completed'
                          : tx.status === 'paid'
                            ? 'Processing'
                            : tx.status === 'failed'
                              ? 'Failed'
                              : 'Pending'}
                      </span>
                      {/* Reference */}
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {tx.tx_ref.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Amount */}
                <div className="text-right flex-shrink-0">
                  <p
                    className={cn(
                      'text-lg font-black whitespace-nowrap',
                      tx.type === 'wallet_funding' ? 'text-green-600' : 'text-slate-900'
                    )}
                  >
                    {tx.type === 'wallet_funding' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </p>
                  {tx.type !== 'wallet_funding' && (
                    <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-500">
                      {tx.type === 'data' && '📱 Data'}
                      {tx.type === 'ecommerce' && '🛍️ Store'}
                    </div>
                  )}
                </div>
              </div>
            </MotionDiv>
          ))
        )}
      </div>

      {/* Sticky Footer */}
      {filteredTransactions.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex gap-2">
          <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-bold uppercase text-sm flex items-center justify-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      )}
    </div>
  );
};
