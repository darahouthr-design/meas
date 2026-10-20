import React, { useState, useMemo } from 'react';
import { GoldType, HistoricalPricePoint, TimeFrame } from '../types/market';
import { TrendingUp, TrendingDown, ArrowUpRight, Calculator, BellRing, Sparkles, Scale } from 'lucide-react';
import { motion } from 'motion/react';

interface GoldTrackerProps {
  goldTypes: GoldType[];
  historyPoints: HistoricalPricePoint[];
  selectedTimeframe: TimeFrame;
  onTimeframeChange: (tf: TimeFrame) => void;
  usdToKhrRate: number;
  onSetAlertClick: (goldName: string, currentPrice: number) => void;
}

export const GoldTracker: React.FC<GoldTrackerProps> = ({
  goldTypes,
  historyPoints,
  selectedTimeframe,
  onTimeframeChange,
  usdToKhrRate,
  onSetAlertClick,
}) => {
  const [activeUnit, setActiveUnit] = useState<'damlung' | 'chi' | 'gram' | 'kilo'>('damlung');
  const [calcAmount, setCalcAmount] = useState<number>(1);
  const [calcGoldId, setCalcGoldId] = useState<string>('gold-24k');
  const [calcUnit, setCalcUnit] = useState<'damlung' | 'chi' | 'gram' | 'kilo'>('damlung');
  const [hoveredPoint, setHoveredPoint] = useState<HistoricalPricePoint | null>(null);

  // Selected gold for calculation
  const selectedGold = useMemo(() => {
    return goldTypes.find((g) => g.id === calcGoldId) || goldTypes[0];
  }, [goldTypes, calcGoldId]);

  // Conversion rates (1 Damlung = 10 Chi = 37.5 Grams = 0.0375 Kilo)
  // 1 Kilo = 26.6667 Damlung
  const calculatedPrices = useMemo(() => {
    let multiplierToDamlung = 1;
    if (calcUnit === 'chi') multiplierToDamlung = 0.1;
    if (calcUnit === 'gram') multiplierToDamlung = 1 / 37.5;
    if (calcUnit === 'kilo') multiplierToDamlung = 26.66667;

    const totalDamlung = calcAmount * multiplierToDamlung;
    const buyUSD = totalDamlung * selectedGold.pricePerDamlungBuyUSD;
    const sellUSD = totalDamlung * selectedGold.pricePerDamlungSellUSD;

    return {
      totalDamlung,
      totalGrams: totalDamlung * 37.5,
      totalChi: totalDamlung * 10,
      buyUSD,
      sellUSD,
      buyKHR: buyUSD * usdToKhrRate,
      sellKHR: sellUSD * usdToKhrRate,
    };
  }, [calcAmount, calcUnit, selectedGold, usdToKhrRate]);

  // SVG Chart Dimensions & Computations
  const chartConfig = useMemo(() => {
    if (!historyPoints || historyPoints.length === 0) return null;
    const prices = historyPoints.map((p) => p.priceUSD);
    const minPrice = Math.floor(Math.min(...prices) * 0.998);
    const maxPrice = Math.ceil(Math.max(...prices) * 10.002) / 10;
    const range = maxPrice - minPrice || 1;

    const width = 800;
    const height = 280;
    const paddingX = 40;
    const paddingY = 30;
    const usableW = width - paddingX * 2;
    const usableH = height - paddingY * 2;

    const pointsCoordinates = historyPoints.map((point, index) => {
      const x = paddingX + (index / (historyPoints.length - 1)) * usableW;
      const y = height - paddingY - ((point.priceUSD - minPrice) / range) * usableH;
      return { x, y, point };
    });

    // Create SVG path string
    const pathD = pointsCoordinates.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    // Area fill path
    const areaD = `${pathD} L ${pointsCoordinates[pointsCoordinates.length - 1].x} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;

    const firstPrice = historyPoints[0].priceUSD;
    const lastPrice = historyPoints[historyPoints.length - 1].priceUSD;
    const isGain = lastPrice >= firstPrice;
    const diffUSD = Math.round((lastPrice - firstPrice) * 10) / 10;
    const diffPercent = Math.round(((diffUSD / firstPrice) * 100) * 100) / 100;

    return {
      width,
      height,
      minPrice,
      maxPrice,
      pointsCoordinates,
      pathD,
      areaD,
      isGain,
      diffUSD,
      diffPercent,
      firstPrice,
      lastPrice,
    };
  }, [historyPoints]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Price Kicker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-medium tracking-wide">
            <span>ទីផ្សារហាងឆេងមាសកម្ពុជា</span>
            <span aria-hidden="true">·</span>
            <span>ធ្វើបច្ចុប្បន្នភាពផ្ទាល់រៀងរាល់នាទី</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">អត្រា 1 USD = {usdToKhrRate.toLocaleString()} ៛</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            ហាងឆេងមាសប្រចាំថ្ងៃ និងក្រាហ្វិកវិភាគ
          </h1>
        </div>

        {/* Units Switcher Filter Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveUnit('damlung')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeUnit === 'damlung'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            គិតជាតម្លឹង (Tael)
          </button>
          <button
            onClick={() => setActiveUnit('chi')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeUnit === 'chi'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            គិតជាជី (Chi)
          </button>
          <button
            onClick={() => setActiveUnit('gram')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeUnit === 'gram'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            គិតជាក្រាម (Gram)
          </button>
          <button
            onClick={() => setActiveUnit('kilo')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeUnit === 'kilo'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            គិតជាគីឡូ (Kg)
          </button>
        </div>
      </div>

      {/* Gold Price Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {goldTypes.map((gold) => {
          let buyUSD = gold.pricePerDamlungBuyUSD;
          let sellUSD = gold.pricePerDamlungSellUSD;
          let unitLabelKhmer = 'តម្លឹង';

          if (activeUnit === 'chi') {
            buyUSD = gold.pricePerChiBuyUSD;
            sellUSD = gold.pricePerChiSellUSD;
            unitLabelKhmer = 'ជី';
          } else if (activeUnit === 'gram') {
            buyUSD = Math.round((gold.pricePerDamlungBuyUSD / 37.5) * 100) / 100;
            sellUSD = Math.round((gold.pricePerDamlungSellUSD / 37.5) * 100) / 100;
            unitLabelKhmer = 'ក្រាម';
          } else if (activeUnit === 'kilo') {
            buyUSD = Math.round(gold.pricePerDamlungBuyUSD * 26.66667);
            sellUSD = Math.round(gold.pricePerDamlungSellUSD * 26.66667);
            unitLabelKhmer = 'គីឡូក្រាម';
          }

          const buyKHR = Math.round(buyUSD * usdToKhrRate);
          const sellKHR = Math.round(sellUSD * usdToKhrRate);
          const isUp = gold.change24hUSD >= 0;

          return (
            <motion.div
              key={gold.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-amber-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">
                      {gold.nameKhmer}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {gold.nameEng} · {gold.purity}
                    </div>
                    {gold.marketStandard && (
                      <div className="text-[10px] text-amber-400/90 font-medium mt-1 leading-snug">
                        🇰🇭 {gold.marketStandard}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onSetAlertClick(gold.nameKhmer, gold.pricePerDamlungSellUSD)}
                    title="កំណត់ការជូនដំណឹងតម្លៃមាស"
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                  >
                    <BellRing className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {/* Selling Price (តម្លៃលក់ចេញ) */}
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>តម្លៃលក់ចេញ (Sell)</span>
                      <span className="font-mono text-emerald-400 text-xs">/{unitLabelKhmer}</span>
                    </div>
                    <div className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-0.5">
                      ${sellUSD.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-slate-400">
                      ≈ {sellKHR.toLocaleString()} ៛
                    </div>
                  </div>

                  {/* Buying Price (តម្លៃទិញចូល) */}
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>តម្លៃទិញចូល (Buy)</span>
                      <span className="font-mono text-slate-400 text-xs">/{unitLabelKhmer}</span>
                    </div>
                    <div className="text-base font-semibold font-mono tabular-nums text-slate-200 mt-0.5">
                      ${buyUSD.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-slate-500">
                      ≈ {buyKHR.toLocaleString()} ៛
                    </div>
                  </div>
                </div>
              </div>

              {/* 24h Trend footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">បម្រែបម្រួល 24h:</span>
                <span className={`font-mono tabular-nums font-semibold flex items-center gap-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isUp ? '+' : ''}${Math.abs(gold.change24hUSD)} ({gold.change24hPercent}%)
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Daily Gold Price Chart & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column (2 spans) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-xs text-slate-400">
                ក្រាហ្វិកវិភាគការប្រែប្រួលតម្លៃមាសទឹកដប់ 24K (ក្នុង 1 តម្លឹង)
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono tabular-nums text-white">
                  ${hoveredPoint ? hoveredPoint.priceUSD.toLocaleString() : chartConfig?.lastPrice.toLocaleString()}
                </span>
                {chartConfig && (
                  <span className={`text-xs font-mono tabular-nums font-semibold flex items-center ${chartConfig.isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {chartConfig.isGain ? '+' : ''}${chartConfig.diffUSD} ({chartConfig.diffPercent}%)
                  </span>
                )}
                <span className="text-xs text-slate-500 ml-2">
                  {hoveredPoint ? `កាលបរិច្ឆេទ: ${hoveredPoint.date}` : `គិតត្រឹមថ្ងៃនេះ`}
                </span>
              </div>
            </div>

            {/* Timeframe selector controls */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg self-start sm:self-auto">
              {(['7D', '30D', '90D', '1Y'] as TimeFrame[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => onTimeframeChange(tf)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    selectedTimeframe === tf
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf === '7D' ? '7 ថ្ងៃ' : tf === '30D' ? '30 ថ្ងៃ' : tf === '90D' ? '90 ថ្ងៃ' : '1 ឆ្នាំ'}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line Chart Viewport */}
          {chartConfig && (
            <div className="relative w-full h-[240px] sm:h-[280px]">
              <svg
                viewBox={`0 0 ${chartConfig.width} ${chartConfig.height}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference grid lines */}
                {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
                  const y = 30 + ratio * (chartConfig.height - 60);
                  const val = Math.round(chartConfig.maxPrice - ratio * (chartConfig.maxPrice - chartConfig.minPrice));
                  return (
                    <g key={ratio}>
                      <line
                        x1="40"
                        y1={y}
                        x2={chartConfig.width - 40}
                        y2={y}
                        stroke="#334155"
                        strokeDasharray="3 3"
                        strokeOpacity="0.5"
                      />
                      <text
                        x="32"
                        y={y + 4}
                        fill="#64748b"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        ${val}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area */}
                <path d={chartConfig.areaD} fill="url(#goldGradient)" />

                {/* Line Path */}
                <path
                  d={chartConfig.pathD}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points */}
                {chartConfig.pointsCoordinates.map((pt, idx) => {
                  const isHovered = hoveredPoint?.date === pt.point.date;
                  return (
                    <g key={idx}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 3}
                        fill={isHovered ? '#f59e0b' : '#fbbf24'}
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-150"
                        onMouseEnter={() => setHoveredPoint(pt.point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* Chart footer metadata */}
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-800">
            <span>អប្បបរមា: ${chartConfig?.minPrice}</span>
            <span>មធ្យមភាគ: ${Math.round(((chartConfig?.minPrice || 0) + (chartConfig?.maxPrice || 0)) / 2)}</span>
            <span>អតិបរមា: ${chartConfig?.maxPrice}</span>
          </div>
        </div>

        {/* Gold Calculator & Unit Standard Guide (1 span) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">គណនាតម្លៃមាសរហ័ស</h3>
                <div className="text-xs text-slate-400">គិតតាមទម្ងន់ជាក់ស្តែង</div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {/* Select gold type */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">ប្រភេទមាស</label>
                <select
                  value={calcGoldId}
                  onChange={(e) => setCalcGoldId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  {goldTypes.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nameKhmer}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount input & Unit */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">ទម្ងន់មាស</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">ខ្នាតគិត</label>
                  <select
                    value={calcUnit}
                    onChange={(e) => setCalcUnit(e.target.value as 'damlung' | 'chi' | 'gram' | 'kilo')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="damlung">តម្លឹង (Tael)</option>
                    <option value="chi">ជី (Chi)</option>
                    <option value="gram">ក្រាម (Gram)</option>
                    <option value="kilo">គីឡូ (Kilo)</option>
                  </select>
                </div>
              </div>

              {/* Calculation Summary Result */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2 mt-2">
                <div className="text-xs text-slate-400 pb-1 border-b border-slate-800/80 flex items-center justify-between">
                  <span>ទម្ងន់សរុបស្មើនឹង:</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    {calculatedPrices.totalGrams.toFixed(2)} ក្រាម ({calculatedPrices.totalChi.toFixed(2)} ជី)
                  </span>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400">តម្លៃលក់ចេញ (អ្នកទិញត្រូវបង់)</div>
                  <div className="text-lg font-bold font-mono tabular-nums text-amber-400">
                    ${calculatedPrices.sellUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs font-mono tabular-nums text-slate-400">
                    ≈ {Math.round(calculatedPrices.sellKHR).toLocaleString()} ៛
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-400">តម្លៃទិញចូល (ហាងទិញពីអ្នក)</div>
                  <div className="text-sm font-semibold font-mono tabular-nums text-slate-300">
                    ${calculatedPrices.buyUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs font-mono tabular-nums text-slate-500">
                    ≈ {Math.round(calculatedPrices.buyKHR).toLocaleString()} ៛
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Conversions Reference Standard */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300 flex items-center gap-1">
              <Scale className="w-3 h-3 text-amber-400" />
              <span>ស្តង់ដារខ្នាតមាសខ្មែរ៖</span>
            </div>
            <div>• ១ គីឡូក្រាម = ២៦.៦៦៦៧ តម្លឹង (១,០០០ ក្រាម)</div>
            <div>• ១ តម្លឹង = ១០ ជី = ៣៧.៥ ក្រាម</div>
            <div>• ១ ជី = ១០ ហ៊ុន = ៣.៧៥ ក្រាម</div>
          </div>
        </div>
      </div>
    </div>
  );
};
