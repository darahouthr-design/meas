import React, { useState } from 'react';
import { CurrencyItem } from '../types/market';
import { ArrowRightLeft, TrendingUp, TrendingDown, RefreshCw, Send, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface CurrencyTrackerProps {
  currencies: CurrencyItem[];
  lastUpdated: string;
}

export const CurrencyTracker: React.FC<CurrencyTrackerProps> = ({
  currencies,
  lastUpdated,
}) => {
  const [fromCode, setFromCode] = useState<string>('KRW'); // South Korean Won default as requested
  const [toCode, setToCode] = useState<string>('KHR');     // Cambodian Riel default
  const [amount, setAmount] = useState<number>(100000);    // 100,000 KRW

  // Find currencies
  const fromCurrency = currencies.find((c) => c.code === fromCode) || currencies[0];
  const toCurrency = currencies.find((c) => c.code === toCode) || currencies[1];

  // Korean Won & USD specifics for quick comparison
  const krwItem = currencies.find((c) => c.code === 'KRW');
  const usdItem = currencies.find((c) => c.code === 'USD');

  // Conversion math
  // All market rates are expressed relative to KHR:
  // KHR value of 1 unit of currency = currency.marketBuyRate
  const convertAmount = () => {
    let valueInKHR = 0;
    if (fromCode === 'KHR') {
      valueInKHR = amount;
    } else {
      valueInKHR = amount * (fromCurrency.marketBuyRate || 1);
    }

    if (toCode === 'KHR') {
      return valueInKHR;
    } else {
      return valueInKHR / (toCurrency.marketSellRate || 1);
    }
  };

  const convertedValue = convertAmount();

  const handleSwap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-medium tracking-wide">
            <span>ធនាគារជាតិនៃកម្ពុជា (NBC) & ទីផ្សារសេរី</span>
            <span aria-hidden="true">·</span>
            <span>ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ: {lastUpdated}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            អត្រាប្តូរប្រាក់អន្តរជាតិ (ប្រៀបធៀប កូរ៉េ KRW & ដុល្លារ USD)
          </h1>
        </div>
      </div>

      {/* KRW & USD Dedicated Spotlight Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KRW to KHR */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🇰🇷</span> វ៉ុនកូរ៉េ ធៀប រៀល (KRW → KHR)
            </span>
            <span className="font-mono">ទីផ្សារជាក់ស្តែង</span>
          </div>
          <div className="mt-2">
            <div className="text-xs text-slate-400">១,០០០ វ៉ុន (1,000 KRW) ស្មើនឹង</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white mt-0.5">
              {krwItem ? (krwItem.marketBuyRate * 1000).toFixed(0) : '2,900'} ៛
            </div>
            <div className="text-xs text-slate-400 mt-1">
              ១០០,០០០ វ៉ុន ≈ {krwItem ? ((krwItem.marketBuyRate * 100000)).toLocaleString() : '290,000'} ៛
            </div>
          </div>
        </div>

        {/* USD to KRW */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🇺🇸</span> ដុល្លារ ធៀប វ៉ុនកូរ៉េ (USD → KRW)
            </span>
            <span className="font-mono">សកលលោក</span>
          </div>
          <div className="mt-2">
            <div className="text-xs text-slate-400">១ ដុល្លារ (1 USD) ស្មើនឹង</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-0.5">
              {krwItem ? krwItem.usdRate.toLocaleString() : '1,392.5'} ₩
            </div>
            <div className="text-xs text-slate-400 mt-1">
              ១០០ ដុល្លារ ≈ {krwItem ? (krwItem.usdRate * 100).toLocaleString() : '139,250'} វ៉ុន
            </div>
          </div>
        </div>

        {/* USD to KHR */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🇺🇸</span> ដុល្លារ ធៀប រៀល (USD → KHR)
            </span>
            <span className="font-mono">NBC កម្ពុជា</span>
          </div>
          <div className="mt-2">
            <div className="text-xs text-slate-400">១ ដុល្លារ (1 USD) ស្មើនឹង</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
              {usdItem ? usdItem.nbcRate.toLocaleString() : '4,065'} ៛
            </div>
            <div className="text-xs text-slate-400 mt-1">
              ទិញចូល: {usdItem?.marketBuyRate.toLocaleString()} ៛ · លក់ចេញ: {usdItem?.marketSellRate.toLocaleString()} ៛
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Exchange Rates Table & Quick Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currency Table (2 spans) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">
                តារាងអត្រាប្តូរប្រាក់ផ្លូវការ និងទីផ្សារសេរី
              </h3>
              <div className="text-xs text-slate-400">
                ប្រៀបធៀបអត្រាធនាគារជាតិកម្ពុជា និងទីផ្សារទិញ-លក់
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="py-2.5 px-3">រូបិយប័ណ្ណ</th>
                  <th className="py-2.5 px-3 text-right">អត្រា NBC (៛)</th>
                  <th className="py-2.5 px-3 text-right">ទិញចូល (Buy ៛)</th>
                  <th className="py-2.5 px-3 text-right">លក់ចេញ (Sell ៛)</th>
                  <th className="py-2.5 px-3 text-right">ធៀប USD ($)</th>
                  <th className="py-2.5 px-3 text-right">24h (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {currencies.map((curr) => {
                  const isUp = curr.change24h >= 0;
                  const isHighlight = curr.code === 'KRW' || curr.code === 'USD';

                  return (
                    <tr
                      key={curr.code}
                      className={`hover:bg-slate-800/40 transition-colors ${isHighlight ? 'bg-amber-500/5' : ''}`}
                    >
                      <td className="py-3 px-3 font-sans font-medium text-white flex items-center gap-2">
                        <span className="text-lg">{curr.flag}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold font-mono">{curr.code}</span>
                            {isHighlight && (
                              <span className="text-[10px] px-1 py-0.2 bg-amber-400/20 text-amber-300 rounded font-sans font-medium">
                                សំខាន់
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-normal">
                            {curr.nameKhmer}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                        {curr.nbcRate >= 1 ? curr.nbcRate.toLocaleString() : curr.nbcRate.toFixed(3)} ៛
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-semibold tabular-nums">
                        {curr.marketBuyRate >= 1 ? curr.marketBuyRate.toLocaleString() : curr.marketBuyRate.toFixed(3)} ៛
                      </td>
                      <td className="py-3 px-3 text-right text-amber-400 font-semibold tabular-nums">
                        {curr.marketSellRate >= 1 ? curr.marketSellRate.toLocaleString() : curr.marketSellRate.toFixed(3)} ៛
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400 tabular-nums">
                        {curr.code === 'USD' ? '1.00' : curr.usdRate.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums">
                        <span className={`text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isUp ? '+' : ''}{curr.change24h}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Currency Converter (1 span) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">កម្មវិធីគណនាប្តូរប្រាក់</h3>
                <div className="text-xs text-slate-400">ប្តូរភ្លាមៗតាមអត្រាជាក់ស្តែង</div>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {/* Amount to Convert */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">ចំនួនទឹកប្រាក់ត្រូវប្តូរ</label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-base font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Currency Selector Row */}
              <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">ពី (From)</label>
                  <select
                    value={fromCode}
                    onChange={(e) => setFromCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="KHR">🇰🇭 KHR (រៀល)</option>
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} - {c.nameKhmer}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSwap}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                    title="ផ្លាស់ប្តូររូបិយប័ណ្ណ"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">ទៅជា (To)</label>
                  <select
                    value={toCode}
                    onChange={(e) => setToCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="KHR">🇰🇭 KHR (រៀល)</option>
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} - {c.nameKhmer}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Amount presets for KRW, USD, KHR */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400">ចំនួនទឹកប្រាក់គំរូញឹកញាប់៖</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '50,000 ₩', amt: 50000, curr: 'KRW' },
                    { label: '100,000 ₩', amt: 100000, curr: 'KRW' },
                    { label: '$100', amt: 100, curr: 'USD' },
                    { label: '$500', amt: 500, curr: 'USD' },
                    { label: '500,000 ៛', amt: 500000, curr: 'KHR' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setFromCode(p.curr);
                        setAmount(p.amt);
                      }}
                      className="px-2 py-1 text-[11px] bg-slate-950 border border-slate-800 rounded text-slate-300 hover:text-amber-400 hover:border-slate-700 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Result Container */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-1 mt-3">
                <div className="text-xs text-slate-400">
                  {amount.toLocaleString()} {fromCode} ស្មើនឹងប្រហែល
                </div>
                <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
                  {convertedValue.toLocaleString(undefined, {
                    minimumFractionDigits: toCode === 'KHR' || toCode === 'KRW' ? 0 : 2,
                    maximumFractionDigits: toCode === 'KHR' || toCode === 'KRW' ? 0 : 2,
                  })}{' '}
                  {toCode === 'KHR' ? '៛' : toCode}
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                  ផ្អែកលើអត្រាទិញ-លក់ទីផ្សារបច្ចុប្បន្ន
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            ℹ️ អត្រាប្តូរប្រាក់អាចមានភាពខុសគ្នាតិចតួចនៅតាមបញ្ជរប្តូរប្រាក់នីមួយៗ។
          </div>
        </div>
      </div>
    </div>
  );
};
