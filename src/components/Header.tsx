import React from 'react';
import { Bell, RefreshCw, Send, CloudRain, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'gold' | 'fuel' | 'currency' | 'bank' | 'weather';
  setActiveTab: (tab: 'gold' | 'fuel' | 'currency' | 'bank' | 'weather') => void;
  onOpenTelegramModal: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  isAutoRefreshing: boolean;
  refreshCountdown: number;
  onManualRefresh: () => void;
  hasRainAlert: boolean;
  onOpenStandardsModal: () => void;
  isDailySynced: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenTelegramModal,
  onOpenNotifications,
  unreadNotificationsCount,
  isAutoRefreshing,
  refreshCountdown,
  onManualRefresh,
  hasRainAlert,
  onOpenStandardsModal,
  isDailySynced,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 md:gap-8 h-16">
          {/* Zone 1: Single text element wordmark with emblem */}
          <a href="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
            <img
              src="/assets/aistudio/Golden_Khmer_Financial_Marketplace_Emblem_5812dedc.png"
              alt="ផ្សារមាស & ហិរញ្ញវត្ថុ Logo"
              className="w-9 h-9 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
            />
            <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
              ផ្សារមាស & ហិរញ្ញវត្ថុ
            </span>
          </a>

          {/* Zone 2: 5 clean single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('gold')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'gold'
                  ? 'bg-amber-500/10 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              ហាងឆេងមាស
            </button>
            <button
              onClick={() => setActiveTab('fuel')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'fuel'
                  ? 'bg-amber-500/10 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              តម្លៃប្រេងឥន្ធនៈ
            </button>
            <button
              onClick={() => setActiveTab('currency')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'currency'
                  ? 'bg-amber-500/10 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              អត្រាប្តូរប្រាក់ (KRW/USD)
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'bank'
                  ? 'bg-amber-500/10 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              អត្រាការប្រាក់ធនាគារ
            </button>
            <button
              onClick={() => setActiveTab('weather')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'weather'
                  ? 'bg-amber-500/10 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {hasRainAlert && (
                <CloudRain className="w-4 h-4 text-sky-400 animate-bounce" />
              )}
              <span>អាកាសធាតុ & ភ្លៀង</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Cambodia Standards Daily Status Badge */}
            <button
              onClick={onOpenStandardsModal}
              title="ស្តង់ដារកម្ពុជា & កាលវិភាគអាប់ដេតប្រចាំថ្ងៃ"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold hidden sm:inline">ស្តង់ដារកម្ពុជា</span>
              <span className="text-[10px] px-1 py-0.2 bg-amber-400/20 text-amber-300 rounded font-mono">
                {isDailySynced ? '✓' : 'Sync'}
              </span>
            </button>

            {/* Auto refresh countdown & button */}
            <button
              onClick={onManualRefresh}
              title={`ធ្វើបច្ចុប្បន្នភាព (ស្វ័យប្រវត្តិក្នងរយៈពេល ${refreshCountdown}វិនាទី)`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isAutoRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-mono tabular-nums text-xs hidden sm:inline text-slate-400">
                {refreshCountdown}s
              </span>
            </button>

            {/* Notification Center Trigger */}
            <button
              onClick={onOpenNotifications}
              title="ប្រអប់សារដំណឹង"
              className="relative p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Telegram Bot Setup Modal Button */}
            <button
              onClick={onOpenTelegramModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Bot</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar">
          <button
            onClick={() => setActiveTab('gold')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap shrink-0 font-medium ${
              activeTab === 'gold' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            ហាងឆេងមាស
          </button>
          <button
            onClick={() => setActiveTab('fuel')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap shrink-0 font-medium ${
              activeTab === 'fuel' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            តម្លៃប្រេង
          </button>
          <button
            onClick={() => setActiveTab('currency')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap shrink-0 font-medium ${
              activeTab === 'currency' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            ប្តូរប្រាក់ KRW/USD
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap shrink-0 font-medium ${
              activeTab === 'bank' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            ការប្រាក់ធនាគារ
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md whitespace-nowrap shrink-0 font-medium ${
              activeTab === 'weather' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            {hasRainAlert && <CloudRain className="w-3 h-3 text-sky-400" />}
            <span>អាកាសធាតុ & ភ្លៀង</span>
          </button>
        </div>
      </div>
    </header>
  );
};
