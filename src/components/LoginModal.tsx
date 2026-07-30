'use client';

import React, { useState } from 'react';
import { ShieldCheck, Zap, ExternalLink, Loader2, X, CheckCircle2, AlertCircle, Copy, Lock, LogIn } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [isReadOnly, setIsReadOnly] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [authData, setAuthData] = useState<{ authUrl: string; userCode: string } | null>(null);
  const [polling, setPolling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStartLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      setAuthData(null);

      const res = await fetch('/api/sc/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readOnly: isReadOnly })
      }).then((r) => r.json());

      if (res.ok && res.authUrl) {
        setAuthData({ authUrl: res.authUrl, userCode: res.userCode });
        startPollingSession();
      } else {
        setError(res.error || 'Failed to generate authorization URL');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to login API');
    } finally {
      setLoading(false);
    }
  };

  const startPollingSession = () => {
    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/sc/whoami').then((r) => r.json());
        if (res.ok && res.data?.name) {
          clearInterval(interval);
          setPolling(false);
          onLoginSuccess();
          onClose();
        }
      } catch (_) {}
    }, 2500);

    // Stop polling after 4 minutes
    setTimeout(() => {
      clearInterval(interval);
      setPolling(false);
    }, 240000);
  };

  const copyCode = () => {
    if (authData?.userCode) {
      navigator.clipboard.writeText(authData.userCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-700/80 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Connect Scalable Capital</h2>
            <p className="text-xs text-slate-400">OAuth 2.0 Device Authentication</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!authData ? (
          <div className="space-y-4">
            {/* Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select Security Mode:</label>
              
              <div
                onClick={() => setIsReadOnly(true)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isReadOnly
                    ? 'bg-indigo-950/60 border-indigo-500/80 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Read-Only Mode (Recommended)
                  </span>
                  <input type="radio" checked={isReadOnly} onChange={() => {}} className="text-indigo-600" />
                </div>
                <p className="text-[11px] text-slate-400 pl-5">
                  Restricts CLI to queries only. Prevents accidental order execution.
                </p>
              </div>

              <div
                onClick={() => setIsReadOnly(false)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  !isReadOnly
                    ? 'bg-indigo-950/60 border-indigo-500/80 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" /> Full Access Trading Mode
                  </span>
                  <input type="radio" checked={!isReadOnly} onChange={() => {}} className="text-indigo-600" />
                </div>
                <p className="text-[11px] text-slate-400 pl-5">
                  Allows trading commands and price alert management.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleStartLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Auth Code...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Generate Scalable Auth Code</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <p className="text-xs text-slate-400 mb-1">Your Scalable Capital Activation Code:</p>
              <div className="flex items-center justify-center gap-2 my-2">
                <span className="text-2xl font-black font-mono text-white tracking-widest bg-indigo-500/20 px-3 py-1 rounded-lg border border-indigo-500/30">
                  {authData.userCode}
                </span>
                <button
                  onClick={copyCode}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copy Code"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && <span className="text-[10px] text-emerald-400 font-semibold">Copied to clipboard!</span>}
            </div>

            <a
              href={authData.authUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <span>Open Scalable Authorization Page</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {polling && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Waiting for browser confirmation...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
