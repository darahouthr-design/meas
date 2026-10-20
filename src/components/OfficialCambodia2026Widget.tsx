import React, { useState } from 'react';
import { ChevronRight, Minus, Plus, MoreHorizontal } from 'lucide-react';
import { GoldType, CurrencyItem, MoCFuelNotice } from '../types/market';

interface OfficialCambodia2026WidgetProps {
  goldTypes: GoldType[];
  currencies: CurrencyItem[];
  mocNotice: MoCFuelNotice;
  onNavigateToTab: (tab: 'gold' | 'fuel' | 'currency') => void;
}

export const OfficialCambodia2026Widget: React.FC<OfficialCambodia2026WidgetProps> = ({
  goldTypes,
  currencies,
  mocNotice,
  onNavigateToTab,
}) => {
  // Metals state
  const [selectedUnit, setSelectedUnit] = useState<'chi' | 'damlung' | 'gram'>('chi');
  
  // Fuel calculator liters state
  const [liters, setLiters] = useState<number>(1);

  // Currency converter state
  const [fromAmount, setFromAmount] = useState<number>(1);
  const [sourceType, setSourceType] = useState<'global' | 'nbc'>('global');

  // Find metals
  const gold = goldTypes.find((g) => g.id === 'gold-24k');
  const silver = goldTypes.find((g) => g.id === 'silver');
  const platinum = goldTypes.find((g) => g.id === 'platinum');

  // Unit multiplier relative to Chi
  const unitMultiplier = selectedUnit === 'damlung' ? 10 : selectedUnit === 'gram' ? (1 / 3.75) : 1;

  const goldPrice = gold ? Math.round(gold.pricePerChiSellUSD * unitMultiplier * 100) / 100 : 497.02;
  const silverPrice = silver ? Math.round(silver.pricePerChiSellUSD * unitMultiplier * 100) / 100 : 6.91;
  const platinumPrice = platinum ? Math.round(platinum.pricePerChiSellUSD * unitMultiplier * 100) / 100 : 198.14;

  // Currency
  const usdRate = currencies.find((c) => c.code === 'USD')?.nbcRate || 4071.95;
  const convertedKhr = Math.round(fromAmount * usdRate * 100) / 100;

  // Fuel calculation
  const totalRegularCost = liters * mocNotice.regularCeilingKHR;
  const totalDieselCost = liters * mocNotice.dieselCeilingKHR;

  return (
    <div className="mb-8">
      {/* Centered Top Title exactly matching screenshot */}
      <div className="text-center mb-5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
          តម្លៃប្រេង អត្រាប្តូរប្រាក់ លោហៈធាតុ
        </h2>
        <div className="text-xs text-amber-400 mt-0.5 font-medium">
          ស្តង់ដារផ្លូវការកម្ពុជា ឆ្នាំ២០២៦ (Cambodia 2026 Official Standard View)
        </div>
      </div>

      {/* 3 Mobile / Desktop Authentic Cards matching user's reference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {/* CARD 1: ហាងឆេងលោហៈធាតុ (Precious Metals) */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between hover:border-amber-400/40 transition-colors">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  ហាងឆេងលោហៈធាតុ
                </h3>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  ថ្ងៃទី20 តុលា 2026 ម៉ោង03:55 PM
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('gold')}
                className="text-slate-500 hover:text-white p-1"
                title="ជម្រើសបន្ថែម"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Metals Price Rows */}
            <div className="mt-4 space-y-3.5">
              {/* Gold (មាស) */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-sm">មាស</span>
                <span className="font-mono tabular-nums font-bold text-base text-white">
                  ${goldPrice.toFixed(2)}
                </span>
                {/* Red descending sparkline as in screenshot */}
                <div className="w-20 h-6">
                  <svg viewBox="0 0 80 24" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="redFade1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 4 Q 25 2, 40 10 T 65 18 T 80 16 L 80 24 L 0 24 Z"
                      fill="url(#redFade1)"
                    />
                    <path
                      d="M 0 4 Q 25 2, 40 10 T 65 18 T 80 16"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              {/* Silver (ប្រាក់) */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-sm">ប្រាក់</span>
                <span className="font-mono tabular-nums font-bold text-base text-white">
                  ${silverPrice.toFixed(2)}
                </span>
                <div className="w-20 h-6">
                  <svg viewBox="0 0 80 24" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="redFade2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 4 Q 20 6, 45 16 T 65 12 T 80 18 L 80 24 L 0 24 Z"
                      fill="url(#redFade2)"
                    />
                    <path
                      d="M 0 4 Q 20 6, 45 16 T 65 12 T 80 18"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              {/* Platinum (ប្លាទីន) */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-sm">ប្លាទីន</span>
                <span className="font-mono tabular-nums font-bold text-base text-white">
                  ${platinumPrice.toFixed(2)}
                </span>
                <div className="w-20 h-6">
                  <svg viewBox="0 0 80 24" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="redFade3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 4 L 35 4 L 45 18 L 65 18 L 75 8 L 80 18 L 80 24 L 0 24 Z"
                      fill="url(#redFade3)"
                    />
                    <path
                      d="M 0 4 L 35 4 L 45 18 L 65 18 L 75 8 L 80 18"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer controls */}
          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span>ខ្នាត</span>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value as 'chi' | 'damlung' | 'gram')}
                className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400 font-semibold"
              >
                <option value="chi">ជី (Chi)</option>
                <option value="damlung">តម្លឹង (Tael)</option>
                <option value="gram">ក្រាម (Gram)</option>
              </select>
            </div>

            <button
              onClick={() => onNavigateToTab('gold')}
              className="text-slate-300 hover:text-amber-400 font-medium flex items-center gap-1 transition-colors"
            >
              <span>លម្អិត</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 2: អត្រាប្តូរប្រាក់ (Currency Exchange) */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between hover:border-amber-400/40 transition-colors">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  អត្រាប្តូរប្រាក់
                </h3>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  ថ្ងៃទី20 តុលា 2026 ម៉ោង04:00 PM
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('currency')}
                className="text-slate-500 hover:text-white p-1"
                title="ជម្រើសបន្ថែម"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Input & Output boxes matching screenshot */}
            <div className="mt-4 space-y-2.5">
              {/* USD Input */}
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <input
                  type="number"
                  min="0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-24 bg-transparent text-white font-mono text-base font-bold focus:outline-none"
                />
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <span>🇺🇸</span>
                  <span>អាមេរិក (ដុល្លារ)</span>
                  <span className="text-slate-500 text-[10px]">▾</span>
                </div>
              </div>

              {/* KHR Output */}
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-white font-mono text-base font-bold tabular-nums">
                  {convertedKhr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <span>🇰🇭</span>
                  <span>កម្ពុជា (រៀល)</span>
                  <span className="text-slate-500 text-[10px]">▾</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer controls */}
          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span>ប្រភព</span>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as 'global' | 'nbc')}
                className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400 font-semibold"
              >
                <option value="global">សាកល</option>
                <option value="nbc">ធនាគារជាតិ NBC</option>
              </select>
            </div>

            <button
              onClick={() => onNavigateToTab('currency')}
              className="text-slate-300 hover:text-amber-400 font-medium flex items-center gap-1 transition-colors"
            >
              <span>លម្អិត</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 3: តម្លៃលក់រាយប្រេងឥន្ធនៈតាមស្ថានីយ (Fuel Retail Prices) */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between hover:border-amber-400/40 transition-colors">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  តម្លៃលក់រាយប្រេងឥន្ធនៈតាមស្ថានីយ
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {mocNotice.effectivePeriod}
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('fuel')}
                className="text-slate-500 hover:text-white p-1"
                title="ជម្រើសបន្ថែម"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Fuel Prices exactly matching screenshot */}
            <div className="mt-4 space-y-3.5">
              {/* Regular Gasoline (ប្រេងសាំងធម្មតា) */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 text-sm block">ប្រេងសាំងធម្មតា</span>
                  {liters > 1 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {liters}L = {totalRegularCost.toLocaleString()}៛
                    </span>
                  )}
                </div>
                <span className="font-mono tabular-nums font-bold text-base text-white">
                  {mocNotice.regularCeilingKHR.toLocaleString()} ៛
                </span>
                {/* Green ascending sparkline as in screenshot */}
                <div className="w-20 h-6">
                  <svg viewBox="0 0 80 24" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="greenFade1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 18 Q 20 14, 40 16 T 60 4 T 80 2 L 80 24 L 0 24 Z"
                      fill="url(#greenFade1)"
                    />
                    <path
                      d="M 0 18 Q 20 14, 40 16 T 60 4 T 80 2"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              {/* Diesel (ប្រេងម៉ាស៊ូត) */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 text-sm block">ប្រេងម៉ាស៊ូត</span>
                  {liters > 1 && (
                    <span className="text-[10px] text-sky-400 font-mono">
                      {liters}L = {totalDieselCost.toLocaleString()}៛
                    </span>
                  )}
                </div>
                <span className="font-mono tabular-nums font-bold text-base text-sky-400">
                  {mocNotice.dieselCeilingKHR.toLocaleString()} ៛
                </span>
                <div className="w-20 h-6">
                  <svg viewBox="0 0 80 24" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="greenFade2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 16 Q 25 18, 45 12 T 65 4 T 80 6 L 80 24 L 0 24 Z"
                      fill="url(#greenFade2)"
                    />
                    <path
                      d="M 0 16 Q 25 18, 45 12 T 65 4 T 80 6"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer controls: Stepper [ - ] 1 [ + ] */}
          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span>ចំនួនលីត្រ</span>
              <div className="flex items-center border border-slate-800 rounded-md bg-slate-950 p-0.5">
                <button
                  onClick={() => setLiters(Math.max(1, liters - 1))}
                  className="p-1 hover:text-amber-400 text-slate-400 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2 font-mono font-bold text-white text-xs">
                  {liters}
                </span>
                <button
                  onClick={() => setLiters(liters + 1)}
                  className="p-1 hover:text-amber-400 text-slate-400 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('fuel')}
              className="text-slate-300 hover:text-amber-400 font-medium flex items-center gap-1 transition-colors"
            >
              <span>លម្អិត</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
