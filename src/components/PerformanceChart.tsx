'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Bell, BellPlus, Trash2, Loader2, AlertCircle, TrendingUp, LineChart } from 'lucide-react';

interface SecurityItem {
  isin: string;
  name: string;
  security_type: string;
  valuation: number;
}

interface PriceAlert {
  alert_id: string;
  isin: string;
  name: string;
  price: number;
  direction: 'UP' | 'DOWN';
  is_active: boolean;
}

interface PerformanceChartProps {
  holdings: SecurityItem[];
  selectedIsin: string;
  onSelectIsin: (isin: string) => void;
  refreshTrigger?: number;
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

const PRESET_PERCENTAGES = [
  { label: '+10%', value: 10, isUp: true },
  { label: '+5%', value: 5, isUp: true },
  { label: '+2%', value: 2, isUp: true },
  { label: '+1%', value: 1, isUp: true },
  { label: '-1%', value: -1, isUp: false },
  { label: '-2%', value: -2, isUp: false },
  { label: '-5%', value: -5, isUp: false },
  { label: '-10%', value: -10, isUp: false }
];

export function PerformanceChart({ holdings, selectedIsin, onSelectIsin, refreshTrigger = 0 }: PerformanceChartProps) {
  const [timeframe, setTimeframe] = useState<string>('1y');
  const [chartData, setChartData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  const [showTrendline, setShowTrendline] = useState<boolean>(true);
  const [showSMA20, setShowSMA20] = useState<boolean>(false);
  const [showSMA50, setShowSMA50] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [alertActionLoading, setAlertActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSecurity = holdings.find((h) => h.isin === selectedIsin) || holdings[0];

  // Fetch chart data and compute trendlines
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
          
          // Calculate Linear Regression Slope & Intercept
          const n = rawPoints.length;
          let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
          rawPoints.forEach((pt: any, i: number) => {
            sumX += i;
            sumY += pt.mid_price;
            sumXY += i * pt.mid_price;
            sumX2 += i * i;
          });
          const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
          const intercept = n > 0 ? (sumY - slope * sumX) / n : 0;

          const formatted = rawPoints.map((pt: any, i: number) => {
            const dateObj = new Date(pt.timestamp_utc);
            const trendVal = slope * i + intercept;

            // Calculate SMA 20
            let sma20Val = null;
            if (i >= 19) {
              let sum = 0;
              for (let k = i - 19; k <= i; k++) sum += rawPoints[k].mid_price;
              sma20Val = sum / 20;
            }

            // Calculate SMA 50
            let sma50Val = null;
            if (i >= 49) {
              let sum = 0;
              for (let k = i - 49; k <= i; k++) sum += rawPoints[k].mid_price;
              sma50Val = sum / 50;
            }

            return {
              timestamp: pt.timestamp_utc,
              dateStr: dateObj.toLocaleDateString('de-DE', { month: 'short', day: 'numeric', year: '2-digit' }),
              price: pt.mid_price,
              trendline: Number(trendVal.toFixed(4)),
              sma20: sma20Val ? Number(sma20Val.toFixed(4)) : null,
              sma50: sma50Val ? Number(sma50Val.toFixed(4)) : null
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
  }, [selectedIsin, timeframe, refreshTrigger]);

  // Fetch price alerts
  const fetchAlerts = () => {
    fetch('/api/sc/alerts')
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && res.data) {
          const items = res.data.result?.items || res.data.items || (Array.isArray(res.data.result) ? res.data.result : []);
          setAlerts(Array.isArray(items) ? items : []);
        }
      })
      .catch((err) => console.error('Error fetching alerts:', err));
  };

  useEffect(() => {
    fetchAlerts();
  }, [refreshTrigger]);

  // Add price alert handler
  const handleAddAlertByPrice = async (targetPrice: number) => {
    if (!selectedIsin || targetPrice <= 0) return;

    try {
      setAlertActionLoading(true);
      const res = await fetch('/api/sc/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', isin: selectedIsin, price: targetPrice })
      }).then((r) => r.json());

      if (res.ok) {
        fetchAlerts();
      } else {
        alert(res.error || 'Failed to set price alert');
      }
    } catch (err: any) {
      console.error('Error adding alert:', err);
    } finally {
      setAlertActionLoading(false);
    }
  };

  // Add percentage preset alert handler
  const handleAddPresetAlert = (percentOffset: number) => {
    const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
    if (!currentPrice) return;
    const targetPrice = currentPrice * (1 + percentOffset / 100);
    handleAddAlertByPrice(targetPrice);
  };

  // Remove price alert handler
  const handleRemoveAlert = async (alertId: string) => {
    try {
      setAlertActionLoading(true);
      const res = await fetch('/api/sc/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', alert_id: alertId })
      }).then((r) => r.json());

      if (res.ok) {
        fetchAlerts();
      } else {
        alert(res.error || 'Failed to remove price alert');
      }
    } catch (err: any) {
      console.error('Error removing alert:', err);
    } finally {
      setAlertActionLoading(false);
    }
  };

  // Calculate start vs end change
  const startPrice = chartData.length > 0 ? chartData[0].price : 0;
  const endPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
  const priceChange = endPrice - startPrice;
  const percentChange = startPrice ? ((priceChange / startPrice) * 100).toFixed(2) : '0.00';
  const isPositive = priceChange >= 0;

  // Active alerts for the selected stock
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const activeStockAlerts = safeAlerts.filter(
    (a) => a.isin === selectedIsin && a.is_active !== false
  );

  // Y domain padding including active alert lines & trendlines
  const allPrices = [
    ...chartData.map((d) => d.price),
    ...activeStockAlerts.map((a) => a.price)
  ];
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;
  const yDomainPadding = (maxPrice - minPrice) * 0.12 || 1;

  return (
    <div className="glass-panel p-6 rounded-2xl mb-8 relative overflow-hidden">
      {/* Background glow gradient */}
      <div className={`absolute top-0 right-1/4 w-96 h-96 ${isPositive ? 'bg-emerald-500/10' : 'bg-rose-500/10'} rounded-full blur-3xl pointer-events-none transition-all duration-500`} />

      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 relative z-10">
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

      {/* Trendlines & Technical Indicator Toggles */}
      <div className="flex items-center justify-between gap-3 mb-4 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 relative z-10 flex-wrap">
        <div className="flex items-center gap-2">
          <LineChart className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-300">Technical Indicators:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTrendline(!showTrendline)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              showTrendline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-0.5 bg-amber-400 rounded-full inline-block"></span>
            <span>Linear Trend</span>
          </button>

          <button
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              showSMA20
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-0.5 bg-sky-400 rounded-full inline-block"></span>
            <span>SMA 20</span>
          </button>

          <button
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              showSMA50
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:text-slate-200'
            }`}
          >
            <span className="w-2.5 h-0.5 bg-purple-400 rounded-full inline-block"></span>
            <span>SMA 50</span>
          </button>
        </div>
      </div>

      {/* Preset Alarms & Price Alert Controls Bar */}
      <div className="glass-panel p-4 rounded-xl mb-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Quick Price Alarms</span>
            </div>
            <p className="text-[11px] text-slate-400">Set percentage or custom price trigger lines directly on the chart</p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_PERCENTAGES.map((preset) => (
              <button
                key={preset.label}
                disabled={alertActionLoading || !endPrice}
                onClick={() => handleAddPresetAlert(preset.value)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
                  preset.isUp
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                }`}
                title={`Set alert at ${preset.label} (€${(endPrice * (1 + preset.value / 100)).toFixed(2)})`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Price Input */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="Custom €..."
              value={customPriceInput}
              onChange={(e) => setCustomPriceInput(e.target.value)}
              className="bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-xl px-3 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 w-28"
            />
            <button
              disabled={alertActionLoading || !customPriceInput}
              onClick={() => {
                const val = parseFloat(customPriceInput);
                if (val > 0) {
                  handleAddAlertByPrice(val);
                  setCustomPriceInput('');
                }
              }}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <BellPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Active Alerts List Pills */}
        {activeStockAlerts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Active Alarms:</span>
            {activeStockAlerts.map((alert) => {
              const diffPct = endPrice ? (((alert.price - endPrice) / endPrice) * 100).toFixed(1) : '0.0';
              const isAbove = alert.price >= endPrice;

              return (
                <div
                  key={alert.alert_id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border ${
                    isAbove
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                  }`}
                >
                  <Bell className="w-3 h-3 text-amber-400" />
                  <span>
                    €{alert.price.toFixed(2)} ({Number(diffPct) >= 0 ? '+' : ''}{diffPct}%)
                  </span>
                  <button
                    disabled={alertActionLoading}
                    onClick={() => handleRemoveAlert(alert.alert_id)}
                    className="ml-1 p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete price alarm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="h-[380px] w-full relative z-10">
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
                      <div className="glass-panel p-3.5 rounded-xl shadow-2xl border border-indigo-500/30 text-xs space-y-1">
                        <p className="text-slate-400 font-mono mb-1">{dataPoint.dateStr}</p>
                        <p className="text-base font-black text-white">
                          €{dataPoint.price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </p>
                        {showTrendline && dataPoint.trendline && (
                          <p className="text-amber-400 font-mono text-[11px]">
                            Trendline: €{dataPoint.trendline.toFixed(2)}
                          </p>
                        )}
                        {showSMA20 && dataPoint.sma20 && (
                          <p className="text-sky-400 font-mono text-[11px]">
                            SMA 20: €{dataPoint.sma20.toFixed(2)}
                          </p>
                        )}
                        {showSMA50 && dataPoint.sma50 && (
                          <p className="text-purple-400 font-mono text-[11px]">
                            SMA 50: €{dataPoint.sma50.toFixed(2)}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Period Start Reference Line */}
              {startPrice > 0 && (
                <ReferenceLine
                  y={startPrice}
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{ value: 'Start', fill: '#64748b', fontSize: 10, position: 'insideTopLeft' }}
                />
              )}

              {/* Horizontal Reference Lines for Active Price Alarms */}
              {activeStockAlerts.map((alert) => {
                const isAbove = alert.price >= endPrice;
                const lineColor = isAbove ? '#10b981' : '#f43f5e';
                const diffPct = endPrice ? (((alert.price - endPrice) / endPrice) * 100).toFixed(1) : '0.0';

                return (
                  <ReferenceLine
                    key={alert.alert_id}
                    y={alert.price}
                    stroke={lineColor}
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                    label={{
                      value: `🔔 €${alert.price.toFixed(2)} (${Number(diffPct) >= 0 ? '+' : ''}${diffPct}%)`,
                      fill: lineColor,
                      fontSize: 11,
                      fontWeight: 'bold',
                      position: isAbove ? 'top' : 'bottom'
                    }}
                  />
                );
              })}

              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#10b981' : '#f43f5e'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={isPositive ? 'url(#chartGradientGreen)' : 'url(#chartGradientRed)'}
                animationDuration={800}
              />

              {/* Linear Trendline Overlay */}
              {showTrendline && (
                <Line
                  type="monotone"
                  dataKey="trendline"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  dot={false}
                  name="Linear Trend"
                />
              )}

              {/* SMA 20 Overlay */}
              {showSMA20 && (
                <Line
                  type="monotone"
                  dataKey="sma20"
                  stroke="#38bdf8"
                  strokeWidth={1.5}
                  dot={false}
                  name="SMA 20"
                />
              )}

              {/* SMA 50 Overlay */}
              {showSMA50 && (
                <Line
                  type="monotone"
                  dataKey="sma50"
                  stroke="#c084fc"
                  strokeWidth={1.5}
                  dot={false}
                  name="SMA 50"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
