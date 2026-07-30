'use client';

import React from 'react';
import { RefreshCw, TrendingUp, ShieldCheck, User, Zap } from 'lucide-react';

interface HeaderProps {
  whoami: { name?: string; id?: string; locale?: string } | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string | null;
}

export function Header({ whoami, onRefresh, isRefreshing, lastUpdated }: HeaderProps) {
  return (
    <header className="glass-panel sticky top-0 z-50 border-b border-slate-800/80 px-6 py-4 mb-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-emerald-500 shadow-lg shadow-indigo-500/20">
            <TrendingUp className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                Scalable Capital
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-indigo-400" /> Bklit UI
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Connected via <code className="text-indigo-400 font-mono">sc</code> CLI
            </p>
          </div>
        </div>

        {/* User Info & Refresh */}
        <div className="flex items-center gap-4">
          {whoami && (
            <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 font-semibold border border-indigo-500/30">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-200">{whoami.name || 'Broker User'}</p>
                <p className="text-[10px] text-slate-400 font-mono">ID: {whoami.id?.slice(0, 8)}...</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-slate-400 hidden lg:inline">
                Updated: {lastUpdated}
              </span>
            )}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Live Data'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
