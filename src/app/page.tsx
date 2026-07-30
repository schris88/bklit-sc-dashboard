'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { OverviewCards } from '@/components/OverviewCards';
import { PerformanceChart } from '@/components/PerformanceChart';
import { TagesgeldCard } from '@/components/TagesgeldCard';
import { AssetAllocationChart } from '@/components/AssetAllocationChart';
import { DividendsInterestSection } from '@/components/DividendsInterestSection';
import { HoldingsTable } from '@/components/HoldingsTable';
import { LoginModal } from '@/components/LoginModal';
import { Loader2, AlertCircle, LogIn } from 'lucide-react';

export default function Dashboard() {
  const [whoami, setWhoami] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tagesgeld, setTagesgeld] = useState<any>(null);
  const [selectedIsin, setSelectedIsin] = useState<string>('LU0274208692');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const [whoamiRes, overviewRes, holdingsRes, transactionsRes, tagesgeldRes] = await Promise.all([
        fetch('/api/sc/whoami').then((r) => r.json()),
        fetch('/api/sc/overview').then((r) => r.json()),
        fetch('/api/sc/holdings').then((r) => r.json()),
        fetch('/api/sc/transactions').then((r) => r.json()),
        fetch('/api/sc/tagesgeld').then((r) => r.json())
      ]);

      if (whoamiRes.ok && whoamiRes.data?.name) {
        setWhoami(whoamiRes.data);
      } else {
        setWhoami(null);
      }

      if (overviewRes.ok) setOverview(overviewRes.data);
      if (holdingsRes.ok && holdingsRes.data?.result?.items) {
        const items = holdingsRes.data.result.items;
        setHoldings(items);
        if (items.length > 0 && !selectedIsin) {
          setSelectedIsin(items[0].isin);
        }
      }

      if (transactionsRes.ok && transactionsRes.data?.result?.items) {
        setTransactions(transactionsRes.data.result.items);
      }

      if (tagesgeldRes.ok && tagesgeldRes.data) {
        setTagesgeld(tagesgeldRes.data);
      }

      setRefreshTrigger((prev) => prev + 1);
      setLastUpdated(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      console.error('Failed to fetch SC data:', err);
      setError(err.message || 'Failed to sync with Scalable Capital CLI');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/sc/logout', { method: 'POST' });
      setWhoami(null);
      setOverview(null);
      setHoldings([]);
      setTransactions([]);
      setTagesgeld(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-300 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm font-semibold tracking-wide">Connecting to Scalable Capital CLI...</p>
      </div>
    );
  }

  const totalValuation = overview?.result?.valuation?.total || 0;
  const tagesgeldBalance = tagesgeld?.result?.balance || 0;
  const isLoggedIn = Boolean(whoami && whoami.name);

  return (
    <div className="min-h-screen pb-16">
      <Header
        whoami={whoami}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-6">
        {error && (
          <div className="glass-panel p-4 rounded-xl border border-rose-500/30 text-rose-400 mb-6 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isLoggedIn ? (
          <div className="glass-panel p-12 rounded-2xl text-center max-w-xl mx-auto my-12 border border-slate-700/80">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Scalable Session Disconnected</h2>
            <p className="text-sm text-slate-400 mb-6">
              Please authenticate via OAuth 2.0 device authorization to view your portfolio, charts, Tagesgeld, and yield analytics.
            </p>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/30 hover:scale-105"
            >
              Connect Scalable Account
            </button>
          </div>
        ) : (
          <>
            {/* Top Portfolio & Combined Wealth Metrics */}
            <OverviewCards
              overviewData={overview}
              holdingsCount={holdings.length}
              tagesgeldBalance={tagesgeldBalance}
            />

            {/* Tagesgeld Account Card */}
            <TagesgeldCard tagesgeldData={tagesgeld} />

            {/* Main Performance Chart */}
            <PerformanceChart
              holdings={holdings}
              selectedIsin={selectedIsin}
              onSelectIsin={setSelectedIsin}
              refreshTrigger={refreshTrigger}
            />

            {/* Dividends & Interest Income Section */}
            <DividendsInterestSection transactions={transactions} loading={isRefreshing} />

            {/* Asset Distribution & Top Holdings */}
            <AssetAllocationChart holdings={holdings} totalValuation={totalValuation} />

            {/* Holdings Table */}
            <HoldingsTable
              holdings={holdings}
              selectedIsin={selectedIsin}
              onSelectIsin={setSelectedIsin}
            />
          </>
        )}
      </main>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={fetchData}
      />
    </div>
  );
}
