# 📊 Scalable Capital Web Dashboard

> **A modern, interactive web dashboard for the official [Scalable Capital CLI (`scalable-cli`)](https://github.com/ScalableCapital/scalable-cli).**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Scalable Capital CLI](https://img.shields.io/badge/Powered_by-scalable--cli-00d084)](https://github.com/ScalableCapital/scalable-cli)

---

## 💙 Thank You Note to the Scalable Capital Team

A massive **thank you** to the engineering and product team at **Scalable Capital** for creating and releasing the official [Scalable Capital CLI (`scalable-cli`)](https://github.com/ScalableCapital/scalable-cli)! 🚀

Opening up a native, developer-focused command-line interface with structured JSON output (`--json`) is a game-changer for retail investors, developers, and automation enthusiasts. It allows building clean, privacy-conscious tools like this dashboard without resorting to fragile web scraping or unofficial API hacks.

Kudos to the team for supporting developer tools and fostering an open ecosystem for personal finance innovation!

---

## 🌟 Overview

The **Scalable Capital Web Dashboard** (`bklit-sc-dashboard`) brings a sleek, visual frontend interface to your Scalable Capital portfolio using the data provided directly by `scalable-cli`.

It communicates with local `sc` CLI endpoints via lightweight Next.js API routes, giving you real-time insights into your portfolio performance, Tagesgeld cash interest, asset allocation, historical charts, and transaction history — all wrapped in a modern dark-mode aesthetic with smooth micro-animations.

---

## ✨ Features

- 💼 **Portfolio & Combined Wealth Overview**: Real-time total valuation, Tagesgeld balance, cash position, buying power, and daily gain/loss tracking.
- 📈 **Interactive Historical Charts**: Interactive performance charts powered by `@visx` and `recharts` for individual securities (ISINs) and overall portfolio.
- 📋 **Holdings Breakdown**: Detailed holdings table with real-time quotes, allocation percentages, gain/loss indicators, and smooth scrolling chart sync.
- 🏦 **Tagesgeld Account Integration**: Dedicated Tagesgeld card displaying interest rates, current balance, and accrued interest earnings.
- 💵 **Dividends & Interest Tracking**: Detailed view of past dividend payouts, coupon distributions, and cash interest.
- 🔔 **Price Alerts & Savings Plans**: Overview of active price alerts and automated savings plans.
- 🔐 **OAuth 2.0 & Read-Only Safety**: Integrates with `sc login` Device Code flow and fully supports `--local-read-only` authentication mode for maximum security.

---

## 🔗 Prerequisites & Dependencies

To use this dashboard, you need the official **Scalable Capital CLI** installed on your system.

### 1. Install `scalable-cli`
On macOS via Homebrew:
```bash
brew tap ScalableCapital/tap
brew install scalable-cli
```
Or download binary installers directly from the [ScalableCapital/scalable-cli Releases](https://github.com/ScalableCapital/scalable-cli/releases).

### 2. Beta Access Allowlisting
The CLI is currently in beta:
1. Run `sc installation-code` in your terminal to obtain your unique installation code.
2. Email `cli.beta@scalable.capital` from your registered Scalable Capital email address with the subject **"Scalable CLI Allowlisting"** and include your code.
3. Once confirmed, you can authenticate via the dashboard or directly in your terminal (`sc login`).

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/schris88/bklit-sc-dashboard.git
cd bklit-sc-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🛠️ How It Works (Architecture)

This application is built with **Next.js 16 (App Router)** and acts as a local UI wrapper around `scalable-cli`:

```
┌────────────────────────────────┐
│   Web Dashboard (React 19)     │
└──────────────┬─────────────────┘
               │  HTTP Fetch
┌──────────────▼─────────────────┐
│ Next.js API Routes (/api/sc/*) │
└──────────────┬─────────────────┘
               │  Executes shell commands
┌──────────────▼─────────────────┐
│  Scalable Capital CLI (`sc`)   │
└──────────────┬─────────────────┘
               │  OAuth 2.0 / Broker API
┌──────────────▼─────────────────┐
│     Scalable Capital Backend   │
└────────────────────────────────┘
```

The Next.js API layer routes request to the local `sc` CLI:
- `/api/sc/whoami` ➔ `sc whoami --json`
- `/api/sc/overview` ➔ `sc broker overview --json`
- `/api/sc/holdings` ➔ `sc broker holdings --json`
- `/api/sc/tagesgeld` ➔ `sc broker tagesgeld --json`
- `/api/sc/transactions` ➔ `sc broker transactions --json`
- `/api/sc/chart` ➔ `sc broker chart --isin <ISIN> --timeframe <timeframe> --json`
- `/api/sc/alerts` ➔ `sc broker price-alerts --json`

---

## 🔒 Security & Privacy Notice

- **Local Execution**: All data stays on your local machine. The dashboard only communicates with your local installation of `scalable-cli`.
- **Read-Only Mode Recommended**: We strongly recommend logging in with `sc login --local-read-only` when using third-party dashboards to prevent accidental trading execution.
- **Disclaimer**: This project is an independent community open-source project and is **not** officially affiliated with, endorsed by, or maintained by Scalable Capital GmbH.

---

## 👨‍💻 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: React 19, Tailwind CSS v4, Framer Motion
- **Icons**: Lucide React
- **Charting**: `@visx` & Recharts
- **CLI Bridge**: Node.js `child_process` / `scalable-cli`

---

## 📜 Links & References

- 📦 **Official Scalable Capital CLI**: [github.com/ScalableCapital/scalable-cli](https://github.com/ScalableCapital/scalable-cli)
- 📊 **Dashboard Repository**: [github.com/schris88/bklit-sc-dashboard](https://github.com/schris88/bklit-sc-dashboard)
