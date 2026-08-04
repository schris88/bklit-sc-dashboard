'use client';

import React, { useState } from 'react';
import { Search, LineChart, ArrowUpDown, Filter, Bell, Trash2, Loader2, Plus } from 'lucide-react';

interface WatchlistItem {
  isin: string;
  name: string;
  security_type?: string;
  quote_mid_price?: number;
  quote_currency?: string;
}

interface WatchlistTableProps {
  watchlist: WatchlistItem[];
  selectedIsin: string;
  onSelectIsin: (isin: string) => void;
  onRemoveIsin: (isin: string) => Promise<void>;
  onAddIsin?: (isin: string) => Promise<void>;
  alerts?: any[];
}

export function WatchlistTable({ watchlist, selectedIsin, onSelectIsin, onRemoveIsin, onAddIsin, alerts = [] }: WatchlistTableProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'STOCK' | 'ETF'>('ALL');
  const [sortField, setSortField] = useState<'name' | 'price'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [removingIsin, setRemovingIsin] = useState<string | null>(null);
  const [newIsin, setNewIsin] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Filter
  const filtered = watchlist.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.isin?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || item.security_type === filterType;
    return matchesSearch && matchesType;
  });

  // Sort
  filtered.sort((a, b) => {
    let factor = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'name') return (a.name || '').localeCompare(b.name || '') * factor;
    if (sortField === 'price') return ((a.quote_mid_price || 0) - (b.quote_mid_price || 0)) * factor;
    return 0;
  });

  const toggleSort = (field: 'name' | 'price') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRemove = async (isin: string) => {
    setRemovingIsin(isin);
    try {
      await onRemoveIsin(isin);
    } finally {
      setRemovingIsin(null);
    }
  };

  const handleAdd = async () => {
    if (!newIsin || !onAddIsin) return;
    setIsAdding(true);
    try {
      await onAddIsin(newIsin);
      setNewIsin('');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Watchlist <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{filtered.length} Items</span>
          </h3>
          <p className="text-xs text-slate-400">Tracked securities from your Scalable Capital account</p>
        </div>

        {/* Controls: Search + Filter Tabs + Add */}
        <div className="flex flex-wrap items-center gap-3">
          {onAddIsin && (
            <div className="flex items-center gap-2 mr-2">
              <input
                type="text"
                placeholder="Enter ISIN..."
                value={newIsin}
                onChange={(e) => setNewIsin(e.target.value.toUpperCase())}
                className="bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 w-36 uppercase"
              />
              <button
                onClick={handleAdd}
                disabled={!newIsin || isAdding}
                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                title="Add to Watchlist"
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          )}

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
              <th className="p-3.5 text-right cursor-pointer" onClick={() => toggleSort('price')}>
                <div className="flex items-center justify-end gap-1">
                  Current Price <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3.5 text-center rounded-r-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400">
                  No items found in your watchlist.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isSelected = item.isin === selectedIsin;
                const activeAlertsCount = alerts.filter(a => a.isin === item.isin && a.is_active !== false).length;

                return (
                  <tr
                    key={item.isin}
                    onClick={() => onSelectIsin(item.isin)}
                    className={`cursor-pointer hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-indigo-950/40 border-l-2 border-indigo-500' : ''
                    }`}
                  >
                    <td className="p-3.5">
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        {item.name || 'Unknown'}
                        {activeAlertsCount > 0 && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]" title={`${activeAlertsCount} active price alarms`}>
                            <Bell className="w-3 h-3" />
                            {activeAlertsCount}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{item.isin}</div>
                    </td>
                    <td className="p-3.5">
                      {item.security_type && (
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            item.security_type === 'ETF'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {item.security_type}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right font-mono font-medium text-white">
                      {item.quote_mid_price !== undefined ? `€${item.quote_mid_price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item.isin);
                        }}
                        disabled={removingIsin === item.isin}
                        className="p-1.5 rounded-lg border bg-slate-800 text-slate-400 border-slate-700 hover:bg-rose-500/20 hover:text-rose-400 transition-all disabled:opacity-50"
                        title="Remove from watchlist"
                      >
                        {removingIsin === item.isin ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
