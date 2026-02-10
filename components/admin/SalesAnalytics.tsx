// Admin Sales Analytics Component
// File: components/admin/SalesAnalytics.tsx

import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types';
import { formatCurrency } from '../../lib/utils';
import {
  Edit2, Save, X, TrendingUp, DollarSign, Percent,
  Calendar, BarChart3, Download,Loader2
} from 'lucide-react';

interface DailySalesData {
  date: string;
  totalTransactions: number;
  totalSales: number;
  totalProfit: number;
  averageProfitMargin: number;
  items: TransactionWithCost[];
}

interface TransactionWithCost extends Transaction {
  cost?: {
    costPrice: number;
    salePrice: number;
    profit: number;
    profitMargin: number;
    itemType: string;
  };
}

interface SalesAnalyticsProps {
  transactions: TransactionWithCost[];
  onRefresh?: () => void;
}

export const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ transactions, onRefresh }) => {
  const [dailyData, setDailyData] = useState<DailySalesData[]>([]);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editingCost, setEditingCost] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Group transactions by date
  useEffect(() => {
    const grouped = transactions.reduce((acc, tx) => {
      const date = new Date(tx.createdAt).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(tx);
      return acc;
    }, {} as Record<string, TransactionWithCost[]>);

    // Calculate daily summaries
    const dailySummary = Object.entries(grouped)
      .map(([date, items]) => {
        const totalSales = items.reduce((sum, item) => sum + item.amount, 0);
        const totalProfit = items.reduce((sum, item) => sum + (item.cost?.profit || 0), 0);
        const avgMargin = items.length > 0 
          ? items.reduce((sum, item) => sum + (item.cost?.profitMargin || 0), 0) / items.length 
          : 0;

        return {
          date,
          totalTransactions: items.length,
          totalSales,
          totalProfit,
          averageProfitMargin: avgMargin,
          items
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setDailyData(dailySummary);
  }, [transactions]);

  const handleUpdateCost = async (transactionId: string, costPrice: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/transaction-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          costPrice,
          password: localStorage.getItem('adminPassword')
        })
      });

      if (!response.ok) throw new Error('Failed to update cost');
      
      setEditingTransactionId(null);
      onRefresh?.();
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const totalRevenue = dailyData.reduce((sum, d) => sum + d.totalSales, 0);
  const totalCosts = transactions.reduce((sum, tx) => sum + (tx.cost?.costPrice || 0), 0);
  const totalProfit = dailyData.reduce((sum, d) => sum + d.totalProfit, 0);
  const overallMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : '0';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(totalRevenue)}</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Costs</span>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatCurrency(totalCosts)}</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-200 bg-green-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-green-600 uppercase">Total Profit</span>
            <BarChart3 className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-black text-green-700">{formatCurrency(totalProfit)}</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Profit Margin</span>
            <Percent className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{overallMargin}%</p>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Daily Sales Breakdown
        </h3>

        {dailyData.map((day) => (
          <div key={day.date} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {/* Day Header */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-b border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Date</p>
                  <p className="text-sm font-black text-slate-900">{day.date}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Transactions</p>
                  <p className="text-sm font-black text-slate-900">{day.totalTransactions}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Sales</p>
                  <p className="text-sm font-black text-blue-600">{formatCurrency(day.totalSales)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Profit</p>
                  <p className="text-sm font-black text-green-600">{formatCurrency(day.totalProfit)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Margin</p>
                  <p className="text-sm font-black text-purple-600">{day.averageProfitMargin.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead >
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Ref</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Type</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-600">Sale Price</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-600">Cost Price</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-600">Profit</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-600">Margin %</th>
                    <th className="px-4 py-2 text-center font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {day.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                          {item.tx_ref.slice(-6)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold capitalize text-slate-700">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingTransactionId === item.id ? (
                          <input
                            type="number"
                            value={editingCost}
                            onChange={(e) => setEditingCost(parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-right"
                            placeholder="0"
                          />
                        ) : (
                          <span className="font-semibold text-slate-900">
                            {formatCurrency(item.cost?.costPrice || 0)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-black ${(item.cost?.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(item.cost?.profit || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {(item.cost?.profitMargin || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editingTransactionId === item.id ? (
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => handleUpdateCost(item.id, editingCost)}
                              disabled={isLoading}
                              className="p-1 hover:bg-green-100 rounded text-green-600"
                              title="Save"
                            >
                              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setEditingTransactionId(null)}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingTransactionId(item.id);
                              setEditingCost(item.cost?.costPrice || 0);
                            }}
                            className="p-1 hover:bg-blue-100 rounded text-blue-600"
                            title="Edit cost"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesAnalytics;
