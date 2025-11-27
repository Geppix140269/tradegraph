'use client';

import { useState } from 'react';
import { Search, Building2, Ship, TrendingUp, Shield, Globe } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { QuickTemplates } from '@/components/search/QuickTemplates';

/**
 * Landing / Home Page
 *
 * The first screen users see after login.
 * Designed for immediate action:
 * 1. Single intelligent search bar
 * 2. Role-based quick templates
 * 3. Recent searches and watchlist alerts
 *
 * Persona-specific messaging based on user.role stored in context.
 */
export default function HomePage() {
  const [searchFocused, setSearchFocused] = useState(false);

  // Mock user - would come from auth context
  const user = {
    name: 'Maria',
    role: 'exporter' as const,
    tier: 'PRO' as const,
  };

  const welcomeMessages = {
    exporter: 'Find qualified buyers with real import history',
    importer: 'Discover reliable suppliers and benchmark prices',
    logistics: 'Identify shippers and optimize routes',
    chamber: 'Support your members with trade intelligence',
    government: 'Monitor trade flows and detect anomalies',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">TradeGraph</span>
            </div>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="/search" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Search
              </a>
              <a href="/watchlists" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Watchlists
              </a>
              <a href="/reports" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Reports
              </a>
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.tier} Plan
              </span>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user.name[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        {/* Welcome */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}
          </h1>
          <p className="text-lg text-gray-600">
            {welcomeMessages[user.role]}
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-12">
          <SearchBar
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search by HS code, company name, or product..."
          />
          <p className="mt-2 text-center text-sm text-gray-500">
            Try: "HS 7308, importers, Germany" or "steel pipe suppliers China"
          </p>
        </div>

        {/* Quick templates */}
        <div className="mb-12">
          <h2 className="text-sm font-medium text-gray-700 mb-4">
            Quick searches for {user.role}s
          </h2>
          <QuickTemplates role={user.role} />
        </div>

        {/* Recent activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent searches */}
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              Recent Searches
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">HS 730890, DE, ES, PL</p>
                  <p className="text-xs text-gray-500">127 results · 2 days ago</p>
                </div>
                <button className="btn-ghost text-xs">Run</button>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">"ACME Corp"</p>
                  <p className="text-xs text-gray-500">1 company · 5 days ago</p>
                </div>
                <button className="btn-ghost text-xs">Run</button>
              </li>
            </ul>
          </div>

          {/* Watchlist alerts */}
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              Watchlist Alerts
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-2 w-2 mt-1.5 rounded-full bg-yellow-400"></span>
                <div>
                  <p className="text-sm text-gray-900">3 new shipments for "Widget GmbH"</p>
                  <p className="text-xs text-gray-500">Since your last check</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 h-2 w-2 mt-1.5 rounded-full bg-blue-400"></span>
                <div>
                  <p className="text-sm text-gray-900">New AD duty on HS 7604 from CN</p>
                  <p className="text-xs text-gray-500">Effective Jan 15, 2025</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Stats banner */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-900">2.4B</div>
            <div className="text-xs text-gray-500">Shipment records</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-900">180M</div>
            <div className="text-xs text-gray-500">Companies</div>
          </div>
          <div className="card p-4">
            <div className="text-2xl font-bold text-gray-900">240</div>
            <div className="text-xs text-gray-500">Countries</div>
          </div>
        </div>
      </main>
    </div>
  );
}
