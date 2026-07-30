'use client';

import React from 'react';
import { Wallet, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Layers, Landmark } from 'lucide-react';

interface OverviewCardsProps {
  overviewData: any;
  holdingsCount: number;
  tagesgeldBalance?: number;
}

export function OverviewCards({ overviewData, holdingsCount, tagesgeldBalance = 0 }: OverviewCardsProps) {
  const valuation = overviewData?.result?.valuation || { securities: 0, crypto: 0, total: 0 };
  const totalValuation = valuation.total || 0;
  const securitiesValuation = valuation.securities || 0;
  const cash = totalValuation - securitiesValuation;

  const totalWealth = totalValuation + tagesgeldBalance;

  const performances = overviewData?.result?.performance || [];
  
  const getPerf = (timeframe: string) => {
    const item = performances.find((p: any) => p.timeframe === timeframe);
    return item ? item.simpleAbsoluteReturn : 0;
  };

  const intraday = getPerf('INTRADAY');
  const oneYear = getPerf('ONE_YEAR');
  const maxPerf = getPerf('MAX');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* Total Combined Wealth */}
      <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group border border-indigo-500/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl group-hover:bg-indigo-500/25 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Total Combined Assets</span>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-500/30">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white tracking-tight mb-2">
          {formatCurrency(totalWealth)}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Broker: {formatCurrency(totalValuation)}</span>
          {tagesgeldBalance > 0 && (
            <span className="font-semibold text-blue-300 flex items-center gap-1">
              <Landmark className="w-3 h-3" /> {formatCurrency(tagesgeldBalance)}
            </span>
          )}
        </div>
      </div>

      {/* Broker Securities Valuation */}
      <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Securities</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white tracking-tight mb-2">
          {formatCurrency(securitiesValuation)}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{holdingsCount} Active Positions</span>
          <span className="font-semibold text-emerald-400">
            {((securitiesValuation / (totalValuation || 1)) * 100).toFixed(1)}% of broker
          </span>
        </div>
      </div>

      {/* 1-Year Performance */}
      <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">1-Year Return</span>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-white tracking-tight mb-2">
          {formatCurrency(oneYear)}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${oneYear >= 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
            {oneYear >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            +{((oneYear / (securitiesValuation - oneYear || 1)) * 100).toFixed(1)}% YoY
          </span>
        </div>
      </div>

      {/* All-Time Return */}
      <div className="glass-panel glass-panel-hover p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">All-Time Gain</span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-amber-300 tracking-tight mb-2">
          {formatCurrency(maxPerf)}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="text-slate-400">Broker Cash: {formatCurrency(cash)}</span>
          <span className="font-semibold text-amber-400">Max Growth</span>
        </div>
      </div>
    </div>
  );
}
