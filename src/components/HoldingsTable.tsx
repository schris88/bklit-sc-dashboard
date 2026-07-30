'use client';

import React, { useState } from 'react';
import { Search, LineChart, ArrowUpDown, Filter, Sparkles } from 'lucide-react';

interface HoldingItem {
  isin: string;
  name: string;
  security_type: string;
  quantity: number;
  fifo_price: number;
  quote_mid_price: number;
  valuation: number;
  quote_currency: string;
}

interface HoldingsTableProps {
  holdings: HoldingItem[];
  selectedIsin: string;
  onSelectIsin: (isin: string) => void;
}

export function HoldingsTable({ holdings, selectedIsin, onSelectIsin }: HoldingsTableProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'STOCK' | 'ETF'>('ALL');
  const [sortField, setSortField] = useState<'valuation' | 'gain' | 'name'>('valuation');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Compute calculated metrics
  const processed = holdings.map((h) => {
    const totalCost = h.fifo_price * h.quantity;
    const gainEur = h.valuation - totalCost;
    const gainPct = totalCost ? (gainEur / totalCost) * 100 : 0;

    return {
      ...h,
      totalCost,
      gainEur,
      gainPct
    };
  });

  // Filter
  const filtered = processed.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.isin.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || item.security_type === filterType;
    return matchesSearch && matchesType;
  });

  // Sort
  filtered.sort((a, b) => {
    let factor = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'valuation') return (a.valuation - b.valuation) * factor;
    if (sortField === 'gain') return (a.gainPct - b.gainPct) * factor;
    if (sortField === 'name') return a.name.localeCompare(b.name) * factor;
    return 0;
  });

  const toggleSort = (field: 'valuation' | 'gain' | 'name') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Portfolio Holdings <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{filtered.length} Positions</span>
          </h3>
          <p className="text-xs text-slate-400">Live positions from Scalable Capital broker</p>
        </div>

        {/* Controls: Search + Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ISIN or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64"
            />
          </div>

          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            {(['ALL', 'STOCK', 'ETF'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 font-semibold rounded-lg transition-all ${
                  filterType === t
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3.5 rounded-l-xl cursor-pointer" onClick={() => toggleSort('name')}>
                <div className="flex items-center gap-1">
                  Name / ISIN <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3.5">Type</th>
              <th className="p-3.5 text-right">Quantity</th>
              <th className="p-3.5 text-right">Buy Price</th>
              <th className="p-3.5 text-right">Current Price</th>
              <th className="p-3.5 text-right cursor-pointer" onClick={() => toggleSort('valuation')}>
                <div className="flex items-center justify-end gap-1">
                  Valuation <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3.5 text-right cursor-pointer" onClick={() => toggleSort('gain')}>
                <div className="flex items-center justify-end gap-1">
                  Unrealized P&L <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3.5 text-center rounded-r-xl">Chart</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((item) => {
              const isSelected = item.isin === selectedIsin;
              const isGain = item.gainEur >= 0;

              return (
                <tr
                  key={item.isin}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isSelected ? 'bg-indigo-950/40 border-l-2 border-indigo-500' : ''
                  }`}
                >
                  <td className="p-3.5">
                    <div className="font-bold text-white text-sm">{item.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{item.isin}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        item.security_type === 'ETF'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.security_type}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-200">
                    {item.quantity.toLocaleString('de-DE', { maximumFractionDigits: 3 })}
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-400">
                    €{item.fifo_price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3.5 text-right font-mono font-medium text-white">
                    €{item.quote_mid_price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-white text-sm">
                    €{item.valuation.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md ${
                        isGain
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {isGain ? '+' : ''}€{item.gainEur.toFixed(2)} ({isGain ? '+' : ''}{item.gainPct.toFixed(2)}%)
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => onSelectIsin(item.isin)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-indigo-600/30 hover:text-indigo-300'
                      }`}
                      title="View chart in performance panel"
                    >
                      <LineChart className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
