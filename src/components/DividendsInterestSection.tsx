'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Coins,
  Percent,
  TrendingUp,
  Search,
  Award,
  ChevronDown,
  ChevronUp,
  History
} from 'lucide-react';

interface TransactionItem {
  id: string;
  type: string;
  cash_transaction_type?: string;
  amount: number;
  currency: string;
  description: string;
  last_event_datetime: string;
  related_isin?: string | null;
  custodian?: string;
}

interface DividendsInterestSectionProps {
  transactions: TransactionItem[];
  loading: boolean;
}

export function DividendsInterestSection({ transactions, loading }: DividendsInterestSectionProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'DISTRIBUTION' | 'INTEREST'>('ALL');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Calculate totals (excluding subscription fees)
  let totalDividends = 0;
  let dividendCount = 0;
  let totalInterestEarned = 0;
  let interestCount = 0;

  const monthlyMap: Record<string, { month: string; dividends: number; interest: number }> = {};
  const assetPayoutMap: Record<string, { name: string; amount: number; count: number }> = {};

  // Filter out subscription fees and process cash yield items
  const yieldTransactions = transactions.filter((tx) => {
    const type = tx.cash_transaction_type || tx.type;
    return type === 'DISTRIBUTION' || (type === 'INTEREST' && tx.amount > 0);
  });

  yieldTransactions.forEach((tx) => {
    const type = tx.cash_transaction_type || tx.type;
    const amount = tx.amount || 0;
    const dateObj = new Date(tx.last_event_datetime);
    const monthKey = dateObj.toLocaleDateString('de-DE', { year: '2-digit', month: 'short' });

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { month: monthKey, dividends: 0, interest: 0 };
    }

    if (type === 'DISTRIBUTION') {
      totalDividends += amount;
      dividendCount++;
      monthlyMap[monthKey].dividends += amount;

      const name = tx.description || 'Unknown Security';
      if (!assetPayoutMap[name]) {
        assetPayoutMap[name] = { name, amount: 0, count: 0 };
      }
      assetPayoutMap[name].amount += amount;
      assetPayoutMap[name].count++;
    } else if (type === 'INTEREST' && amount > 0) {
      totalInterestEarned += amount;
      interestCount++;
      monthlyMap[monthKey].interest += amount;
    }
  });

  const totalCashYield = totalDividends + totalInterestEarned;

  // Monthly chart data (reverse so oldest is first)
  const monthlyChartData = Object.values(monthlyMap).reverse();

  // Top Dividend Assets
  const topAssets = Object.values(assetPayoutMap)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Filter transactions for table
  const filteredTxs = yieldTransactions.filter((tx) => {
    const type = tx.cash_transaction_type || tx.type;
    const matchesCategory = filterCategory === 'ALL' || type === filterCategory;
    const matchesSearch =
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      (tx.related_isin && tx.related_isin.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl mb-8 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Coins className="w-3 h-3 text-emerald-400" /> CASH YIELD & EARNINGS
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Dividends & Interest Income
          </h2>
          <p className="text-xs text-slate-400">Cash distributions and credit interest payouts</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Cash Yield */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Cash Yield</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-400 tracking-tight mb-1">
            {formatCurrency(totalCashYield)}
          </div>
          <div className="text-xs text-slate-400">
            Combined Payouts & Interest
          </div>
        </div>

        {/* Total Dividends */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dividends</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-purple-300 tracking-tight mb-1">
            {formatCurrency(totalDividends)}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>{dividendCount} Payouts</span>
            <span className="font-semibold text-purple-300">Avg {formatCurrency(dividendCount ? totalDividends / dividendCount : 0)}</span>
          </div>
        </div>

        {/* Interest Income */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interest Income</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-indigo-300 tracking-tight mb-1">
            {formatCurrency(totalInterestEarned)}
          </div>
          <div className="text-xs text-slate-400">
            {interestCount} Cash Interest Payouts
          </div>
        </div>

        {/* Highest Single Payout */}
        <div className="glass-panel p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Single Payout</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-300 tracking-tight mb-1">
            {formatCurrency(topAssets.length > 0 ? topAssets[0].amount : 0)}
          </div>
          <div className="text-xs text-slate-400 truncate">
            {topAssets.length > 0 ? topAssets[0].name : '-'}
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Chart & Top Payers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bar Chart: Monthly Income */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Monthly Cash Income Breakdown</h3>
              <p className="text-xs text-slate-400">Dividends vs Interest Payouts per month</p>
            </div>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="glass-panel p-2.5 rounded-xl border border-indigo-500/30 text-xs">
                          <p className="font-bold text-white mb-1">{d.month}</p>
                          <p className="text-purple-300 font-semibold">Dividends: €{d.dividends.toFixed(2)}</p>
                          {d.interest > 0 && <p className="text-indigo-300 font-semibold">Interest: €{d.interest.toFixed(2)}</p>}
                          <p className="text-emerald-400 font-bold border-t border-slate-700/80 pt-1 mt-1">
                            Total: €{(d.dividends + d.interest).toFixed(2)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="dividends" name="Dividends" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interest" name="Interest Income" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Dividend Contributors */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Top Dividend Payers</h3>
            <p className="text-xs text-slate-400 mb-4">Highest paying assets</p>
            <div className="space-y-3">
              {topAssets.map((asset) => (
                <div key={asset.name} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="truncate pr-2">
                    <p className="font-bold text-white truncate">{asset.name}</p>
                    <p className="text-[10px] text-slate-400">{asset.count} Payouts</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-sm flex-shrink-0">
                    {formatCurrency(asset.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Transactions History Accordion */}
      <div className="border-t border-slate-800/80 pt-4">
        <button
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Cash Payout History ({yieldTransactions.length} Events)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>{isHistoryOpen ? 'Hide History' : 'Show History'}</span>
            {isHistoryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isHistoryOpen && (
          <div className="mt-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-sm font-bold text-white">Cash Payout Log</h3>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search payout..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44"
                  />
                </div>

                <div className="flex items-center bg-slate-900/80 p-0.5 rounded-xl border border-slate-800 text-[11px]">
                  {(['ALL', 'DISTRIBUTION', 'INTEREST'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-2.5 py-1 font-semibold rounded-lg transition-all ${
                        filterCategory === cat ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat === 'DISTRIBUTION' ? 'Dividends' : cat === 'INTEREST' ? 'Interest' : 'All Payouts'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Description / Security</th>
                    <th className="p-3 text-right">Payout Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredTxs.map((tx) => {
                    const type = tx.cash_transaction_type || tx.type;

                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-mono text-slate-400">
                          {new Date(tx.last_event_datetime).toLocaleDateString('de-DE')}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                              type === 'DISTRIBUTION'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}
                          >
                            {type === 'DISTRIBUTION' ? 'DIVIDEND' : 'INTEREST'}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-white">
                          {tx.description}
                          {tx.related_isin && <span className="block text-[10px] font-mono text-slate-400">{tx.related_isin}</span>}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400">
                          +{formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
