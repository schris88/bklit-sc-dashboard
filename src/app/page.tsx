'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { OverviewCards } from '@/components/OverviewCards';
import { PerformanceChart } from '@/components/PerformanceChart';
import { TagesgeldCard } from '@/components/TagesgeldCard';
import { AssetAllocationChart } from '@/components/AssetAllocationChart';
import { DividendsInterestSection } from '@/components/DividendsInterestSection';
import { HoldingsTable } from '@/components/HoldingsTable';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [whoami, setWhoami] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tagesgeld, setTagesgeld] = useState<any>(null);
  const [selectedIsin, setSelectedIsin] = useState<string>('LU0274208692');
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

      if (whoamiRes.ok) setWhoami(whoamiRes.data);
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

      setLastUpdated(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      console.error('Failed to fetch SC data:', err);
      setError(err.message || 'Failed to sync with Scalable Capital CLI');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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

  return (
    <div className="min-h-screen pb-16">
      <Header
        whoami={whoami}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      <main className="max-w-7xl mx-auto px-6">
        {error && (
          <div className="glass-panel p-4 rounded-xl border border-rose-500/30 text-rose-400 mb-6 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
      </main>
    </div>
  );
}
