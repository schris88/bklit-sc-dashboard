'use client';

import React from 'react';
import { Landmark, Percent, Calendar, Sparkles, TrendingUp, ShieldCheck, Clock } from 'lucide-react';

interface TagesgeldData {
  account?: {
    display_name?: string;
    is_active?: boolean;
    owner_kind?: string;
  };
  result?: {
    balance?: number;
    current_accrued_amount?: number;
    current_interest_bearing_amount?: number;
    deposit_accrued_lifetime_amount?: number;
    estimated_next_payout_amount?: number;
    interest_rate?: number;
    next_payout_date?: string;
  };
  savings_account_id?: string;
}

interface TagesgeldCardProps {
  tagesgeldData: TagesgeldData | null;
}

export function TagesgeldCard({ tagesgeldData }: TagesgeldCardProps) {
  if (!tagesgeldData || !tagesgeldData.result) return null;

  const result = tagesgeldData.result;
  const account = tagesgeldData.account;

  const balance = result.balance || 0;
  const interestRate = (result.interest_rate || 0) * 100;
  const accruedMonth = result.current_accrued_amount || 0;
  const nextPayout = result.estimated_next_payout_amount || 0;
  const lifetimeAccrued = result.deposit_accrued_lifetime_amount || 0;

  const nextPayoutDateObj = result.next_payout_date ? new Date(result.next_payout_date) : null;
  const formattedPayoutDate = nextPayoutDateObj
    ? nextPayoutDateObj.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
    : '1st of next month';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl mb-8 relative overflow-hidden group">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/15 transition-all pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left Side: Header & Primary Balance */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-blue-400" /> TAGESGELD KONTO
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Active (24/7 Liquidity)
            </span>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">
            Overnight Savings Account
          </h2>
          
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black tracking-tight text-white">
              {formatCurrency(balance)}
            </span>
            <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Percent className="w-3 h-3 mr-1 text-indigo-400" />
              {interestRate.toFixed(2)}% p.a. Variable Interest
            </span>
          </div>
        </div>

        {/* Right Side: Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-3/5">
          {/* Current Month Accrued Interest */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Accrued This Month</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-base font-bold text-emerald-400 font-mono">
              +{formatCurrency(accruedMonth)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Accrues daily</p>
          </div>

          {/* Estimated Next Payout */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Est. Next Payout</span>
              <Clock className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-base font-bold text-blue-300 font-mono">
              +{formatCurrency(nextPayout)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{formattedPayoutDate}</p>
          </div>

          {/* Lifetime Interest Earned */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Lifetime Interest</span>
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <p className="text-base font-bold text-purple-300 font-mono">
              +{formatCurrency(lifetimeAccrued)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Total interest earned</p>
          </div>
        </div>
      </div>
    </div>
  );
}
