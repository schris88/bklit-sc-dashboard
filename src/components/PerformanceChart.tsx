'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Calendar, TrendingUp, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface SecurityItem {
  isin: string;
  name: string;
  security_type: string;
  valuation: number;
}

interface PerformanceChartProps {
  holdings: SecurityItem[];
  selectedIsin: string;
  onSelectIsin: (isin: string) => void;
}

const TIMEFRAMES = [
  { label: '1D', value: '1d' },
  { label: '7D', value: '7d' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: 'YTD', value: 'ytd' },
  { label: '1Y', value: '1y' },
  { label: 'MAX', value: 'max' }
];

export function PerformanceChart({ holdings, selectedIsin, onSelectIsin }: PerformanceChartProps) {
  const [timeframe, setTimeframe] = useState<string>('1y');
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSecurity = holdings.find((h) => h.isin === selectedIsin) || holdings[0];

  useEffect(() => {
    if (!selectedIsin) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/sc/chart?isin=${selectedIsin}&timeframe=${timeframe}`)
      .then((res) => res.json())
      .then((res) => {
        if (!isMounted) return;
        if (res.ok && res.data) {
          const rawPoints = res.data.data_points || res.data.points || res.data.result?.points || (Array.isArray(res.data.result) ? res.data.result : []);
          const formatted = rawPoints.map((pt: any) => {
            const dateObj = new Date(pt.timestamp_utc);
            return {
              timestamp: pt.timestamp_utc,
              dateStr: dateObj.toLocaleDateString('de-DE', { month: 'short', day: 'numeric', year: '2-digit' }),
              price: pt.mid_price
            };
          });
          setChartData(formatted);
        } else {
          setError(res.error || 'No chart data available');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to fetch chart');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedIsin, timeframe]);

  // Calculate start vs end change
  const startPrice = chartData.length > 0 ? chartData[0].price : 0;
  const endPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
  const priceChange = endPrice - startPrice;
  const percentChange = startPrice ? ((priceChange / startPrice) * 100).toFixed(2) : '0.00';
  const isPositive = priceChange >= 0;

  const minPrice = chartData.length > 0 ? Math.min(...chartData.map((d) => d.price)) : 0;
  const maxPrice = chartData.length > 0 ? Math.max(...chartData.map((d) => d.price)) : 0;
  const yDomainPadding = (maxPrice - minPrice) * 0.1 || 1;

  return (
    <div className="glass-panel p-6 rounded-2xl mb-8 relative overflow-hidden">
      {/* Background glow gradient */}
      <div className={`absolute top-0 right-1/4 w-96 h-96 ${isPositive ? 'bg-emerald-500/10' : 'bg-rose-500/10'} rounded-full blur-3xl pointer-events-none transition-all duration-500`} />

      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {selectedSecurity?.security_type || 'SECURITY'}
            </span>
            <span className="text-xs text-slate-400 font-mono">{selectedIsin}</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {selectedSecurity?.name || 'Security Performance'}
          </h2>
          {chartData.length > 0 && (
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-black tracking-tight text-white">
                €{endPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </span>
              <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} € ({isPositive ? '+' : ''}{percentChange}%)
              </span>
            </div>
          )}
        </div>

        {/* Security & Timeframe Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Security dropdown */}
          <select
            value={selectedIsin}
            onChange={(e) => onSelectIsin(e.target.value)}
            className="bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {holdings.map((h) => (
              <option key={h.isin} value={h.isin}>
                {h.name} ({h.security_type})
              </option>
            ))}
          </select>

          {/* Timeframe pill buttons */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  timeframe === tf.value
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[360px] w-full relative z-10">
        {loading ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-xs font-medium">Fetching real-time market series...</p>
          </div>
        ) : error ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-rose-400 gap-2">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-slate-400">
            No chart points found for this timeframe.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradientGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="chartGradientRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />

              <XAxis
                dataKey="dateStr"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />

              <YAxis
                domain={[Math.max(0, minPrice - yDomainPadding), maxPrice + yDomainPadding]}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                orientation="right"
                tickFormatter={(val) => `€${val.toFixed(2)}`}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload;
                    return (
                      <div className="glass-panel p-3 rounded-xl shadow-2xl border border-indigo-500/30 text-xs">
                        <p className="text-slate-400 font-mono mb-1">{dataPoint.dateStr}</p>
                        <p className="text-base font-black text-white">
                          €{dataPoint.price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {startPrice > 0 && (
                <ReferenceLine
                  y={startPrice}
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{ value: 'Period Start', fill: '#64748b', fontSize: 10, position: 'insideTopLeft' }}
                />
              )}

              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#10b981' : '#f43f5e'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={isPositive ? 'url(#chartGradientGreen)' : 'url(#chartGradientRed)'}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
