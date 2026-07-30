'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { PieChart as PieIcon, BarChart2 } from 'lucide-react';

interface HoldingItem {
  name: string;
  security_type: string;
  valuation: number;
}

interface AssetAllocationChartProps {
  holdings: HoldingItem[];
  totalValuation: number;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4', '#14b8a6'];

export function AssetAllocationChart({ holdings, totalValuation }: AssetAllocationChartProps) {
  // Aggregate by security type
  const typeMap: Record<string, number> = {};
  holdings.forEach((h) => {
    typeMap[h.security_type] = (typeMap[h.security_type] || 0) + h.valuation;
  });

  const pieData = Object.entries(typeMap).map(([type, val]) => ({
    name: type,
    value: val
  }));

  // Top 6 holdings
  const sortedHoldings = [...holdings]
    .sort((a, b) => b.valuation - a.valuation)
    .slice(0, 6)
    .map((h) => ({
      shortName: h.name.length > 18 ? h.name.slice(0, 18) + '...' : h.name,
      valuation: h.valuation,
      percentage: totalValuation ? ((h.valuation / totalValuation) * 100).toFixed(1) : '0'
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Donut Chart: Asset Class breakdown */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Asset Class Distribution</h3>
            <p className="text-xs text-slate-400">Securities breakdown by category</p>
          </div>
        </div>

        <div className="h-[240px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(15, 23, 42, 0.8)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0];
                    const pct = totalValuation ? ((Number(data.value) / totalValuation) * 100).toFixed(1) : '0';
                    return (
                      <div className="glass-panel p-2.5 rounded-xl border border-indigo-500/30 text-xs">
                        <p className="font-bold text-white mb-0.5">{data.name}</p>
                        <p className="text-indigo-300 font-semibold">
                          €{Number(data.value).toLocaleString('de-DE')} ({pct}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-2">
          {pieData.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <span className="text-slate-300 font-medium">{item.name}</span>
              <span className="text-slate-400 font-mono">
                (€{item.value.toLocaleString('de-DE', { maximumFractionDigits: 0 })})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart: Top Holdings */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Top 6 Portfolio Holdings</h3>
            <p className="text-xs text-slate-400">Largest position sizes by value</p>
          </div>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedHoldings} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="shortName" stroke="#94a3b8" fontSize={11} width={130} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="glass-panel p-2.5 rounded-xl border border-emerald-500/30 text-xs">
                        <p className="font-bold text-white">{d.shortName}</p>
                        <p className="text-emerald-400 font-semibold">
                          €{d.valuation.toLocaleString('de-DE')} ({d.percentage}% of portfolio)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="valuation" fill="#10b981" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
