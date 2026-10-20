import React, { useState } from 'react';
import { FuelStation, FuelTrendPoint, MoCFuelNotice } from '../types/market';
import {
  Fuel,
  TrendingDown,
  TrendingUp,
  Gauge,
  Navigation,
  AlertCircle,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  Calendar,
  Info,
  DollarSign,
  Scale,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioAlert } from '../utils/audioAlert';

interface FuelTrackerProps {
  fuelStations: FuelStation[];
  trendPoints: FuelTrendPoint[];
  usdToKhrRate: number;
  mocNotice: MoCFuelNotice;
  onUpdateMoCNotice: (updatedNotice: MoCFuelNotice) => void;
}

export const FuelTracker: React.FC<FuelTrackerProps> = ({
  fuelStations,
  trendPoints,
  usdToKhrRate,
  mocNotice,
  onUpdateMoCNotice,
}) => {
  // Trip calculator state
  const [calcMode, setCalcMode] = useState<'liters' | 'distance'>('distance');
  const [distanceKm, setDistanceKm] = useState<number>(150);
  const [consumptionRate, setConsumptionRate] = useState<number>(7.5);
  const [litersInput, setLitersInput] = useState<number>(40);
  const [selectedFuelType, setSelectedFuelType] = useState<'regular' | 'super' | 'diesel'>('regular');
  const [selectedStation, setSelectedStation] = useState<string>('PTT Cambodia');

  // Edit MoC Notice Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNoticeNumber, setEditNoticeNumber] = useState(mocNotice.noticeNumber);
  const [editPeriod, setEditPeriod] = useState(mocNotice.effectivePeriod);
  const [editRegularCeiling, setEditRegularCeiling] = useState(mocNotice.regularCeilingKHR);
  const [editDieselCeiling, setEditDieselCeiling] = useState(mocNotice.dieselCeilingKHR);
  const [editSuperRate, setEditSuperRate] = useState(mocNotice.superEstimatedKHR);
  const [editStatusText, setEditStatusText] = useState(mocNotice.statusText);

  // Find active station
  const stationObj = fuelStations.find((s) => s.name === selectedStation) || fuelStations[0];
  const pricePerLiter =
    selectedFuelType === 'regular'
      ? stationObj.regularGasolineKHR
      : selectedFuelType === 'super'
      ? stationObj.superGasolineKHR
      : stationObj.dieselKHR;

  const totalLiters =
    calcMode === 'distance' ? (distanceKm * consumptionRate) / 100 : litersInput;
  const totalCostKHR = Math.round(totalLiters * pricePerLiter);
  const totalCostUSD = Math.round((totalCostKHR / usdToKhrRate) * 100) / 100;

  // Handle Save MoC Notice
  const handleSaveMoCNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: MoCFuelNotice = {
      ...mocNotice,
      noticeNumber: editNoticeNumber,
      effectivePeriod: editPeriod,
      regularCeilingKHR: editRegularCeiling,
      dieselCeilingKHR: editDieselCeiling,
      superEstimatedKHR: editSuperRate,
      statusText: editStatusText,
    };
    onUpdateMoCNotice(updated);
    setIsEditModalOpen(false);
    audioAlert.playGoldMilestoneTone();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Official MoC Verification Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-medium tracking-wide">
            <span className="flex items-center gap-1 font-bold text-amber-400">
              <span>🇰🇭</span> ក្រសួងពាណិជ្ជកម្មកម្ពុជា (Ministry of Commerce)
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-300 font-mono font-medium">{mocNotice.noticeNumber}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold">{mocNotice.statusText}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            តម្លៃប្រេងឥន្ធនៈស្តង់ដារក្រសួង និងការប្រៀបធៀបតាមស្ថានីយ
          </h1>
        </div>

        {/* Action Button: Edit / Update with new Ministry announcement */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 rounded-lg transition-colors"
            title="កែសម្រួល ឬអាប់ដេតតាមសេចក្តីជូនដំណឹងថ្មីរបស់ក្រសួង"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Update តាមសេចក្តីជូនដំណឹងក្រសួង</span>
          </button>
        </div>
      </div>

      {/* Official MoC Announcement Card & Formula Breakdown */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 font-bold border border-amber-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>តម្លៃពិដានផ្លូវការ (Official MoC Price Ceiling)</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                អនុវត្ត៖ <strong className="text-white font-mono">{mocNotice.effectivePeriod}</strong>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1 max-w-3xl">
              យោងតាមច្បាប់នៃព្រះរាជាណាចក្រកម្ពុជា <strong>ស្ថានីយប្រេងឥន្ធនៈទាំងអស់ត្រូវបានហាមឃាត់ដាច់ខាត មិនឱ្យលក់លើសពីតម្លៃពិដាននេះឡើយ</strong> (អាចលក់ស្មើ ឬទាបជាងតម្លៃពិដាន)។
            </p>
            <div className="text-[11px] text-slate-400 pt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>🛢️ តម្លៃមូលដ្ឋាន MOPS សិង្ហបុរី: <strong className="text-white font-mono">${mocNotice.mopsOilPriceUSD} /ធុង</strong></span>
              <span>🤝 ប្រាក់ឧបត្ថម្ភរាជរដ្ឋាភិបាល: <strong className="text-emerald-400 font-mono">-${mocNotice.governmentSubsidyUSD}/L</strong> (៤ សេន)</span>
              <span>📅 អាប់ដេតជុំបន្ទាប់: <strong className="text-sky-300">{mocNotice.nextUpdateDate}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 shrink-0">
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400 font-medium">ពិដានសាំងធម្មតា (EA92)</div>
              <div className="text-xl font-bold font-mono text-white">
                {mocNotice.regularCeilingKHR.toLocaleString()} ៛
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-[10px] text-slate-400 font-medium">ពិដានប្រេងម៉ាស៊ូត (DO)</div>
              <div className="text-xl font-bold font-mono text-sky-400">
                {mocNotice.dieselCeilingKHR.toLocaleString()} ៛
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Ministry Rates Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Regular Gasoline (EA92) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white">សាំងធម្មតា (EA92)</span>
              <span className="font-mono text-emerald-400 font-bold">{mocNotice.changeRegularKHR} ៛</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white mt-2">
              {mocNotice.regularCeilingKHR.toLocaleString()} ៛
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-400 mt-0.5">
              ≈ ${(mocNotice.regularCeilingKHR / usdToKhrRate).toFixed(2)} / លីត្រ
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ពិដានកំណត់ដោយក្រសួងពាណិជ្ជកម្ម</span>
          </div>
        </div>

        {/* Super Gasoline (EA95) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white">សាំងស៊ុបពែរ (EA95)</span>
              <span className="text-[11px] text-slate-400 font-sans">ទីផ្សារសេរី</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-2">
              {mocNotice.superEstimatedKHR.toLocaleString()} ៛
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-400 mt-0.5">
              ≈ ${(mocNotice.superEstimatedKHR / usdToKhrRate).toFixed(2)} / លីត្រ
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            តម្លៃមធ្យមតាមស្ថានីយ (ក្រសួងមិនកំណត់ពិដាន)
          </div>
        </div>

        {/* Diesel (DO 50ppm) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white">ប្រេងម៉ាស៊ូត (DO 50ppm)</span>
              <span className="font-mono text-emerald-400 font-bold">{mocNotice.changeDieselKHR} ៛</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-sky-400 mt-2">
              {mocNotice.dieselCeilingKHR.toLocaleString()} ៛
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-400 mt-0.5">
              ≈ ${(mocNotice.dieselCeilingKHR / usdToKhrRate).toFixed(2)} / លីត្រ
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ពិដានកំណត់ដោយក្រសួងពាណិជ្ជកម្ម</span>
          </div>
        </div>

        {/* LPG */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white">ហ្គាសរថយន្ត (LPG)</span>
              <span className="font-mono text-slate-400">ថេរ</span>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-indigo-400 mt-2">
              {mocNotice.lpgEstimatedKHR.toLocaleString()} ៛
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-400 mt-0.5">
              ≈ ${(mocNotice.lpgEstimatedKHR / usdToKhrRate).toFixed(2)} / លីត្រ
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            តម្លៃមធ្យមនៅតាមស្ថានីយទូទាំងប្រទេស
          </div>
        </div>
      </div>

      {/* Main Content: Stations Comparison Table & Trip Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stations Comparison (2 spans) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-white text-base">
                តារាងប្រៀបធៀបតម្លៃតាមបណ្តាស្ថានីយ និងការអនុលោមតាមពិដានក្រសួង
              </h3>
              <div className="text-xs text-slate-400">
                ពិដានសាំងធម្មតា: <strong className="text-white font-mono">{mocNotice.regularCeilingKHR.toLocaleString()}៛</strong> · ពិដានម៉ាស៊ូត: <strong className="text-sky-400 font-mono">{mocNotice.dieselCeilingKHR.toLocaleString()}៛</strong>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>អនុលោមភាព ១០០% ស្របតាមច្បាប់</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="py-2.5 px-3">ស្ថានីយប្រេង</th>
                  <th className="py-2.5 px-3 text-right">សាំងធម្មតា (EA92)</th>
                  <th className="py-2.5 px-3 text-right">សាំងស៊ុបពែរ (EA95)</th>
                  <th className="py-2.5 px-3 text-right">ម៉ាស៊ូត (DO)</th>
                  <th className="py-2.5 px-3 text-left pl-4">កម្មវិធីពិសេស / បញ្ចុះតម្លៃ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {fuelStations.map((st) => {
                  const isRegularExceed = st.regularGasolineKHR > mocNotice.regularCeilingKHR;
                  const isDieselExceed = st.dieselKHR > mocNotice.dieselCeilingKHR;

                  return (
                    <tr
                      key={st.name}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 font-sans font-medium text-white flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: st.logoColor }}
                        />
                        <span className="whitespace-nowrap">{st.name}</span>
                      </td>
                      <td className={`py-3 px-3 text-right tabular-nums ${isRegularExceed ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
                        {st.regularGasolineKHR.toLocaleString()} ៛
                        {st.regularGasolineKHR < mocNotice.regularCeilingKHR && (
                          <span className="text-[10px] text-emerald-400 block font-sans">ក្រោមពិដាន</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right text-amber-400 font-semibold tabular-nums">
                        {st.superGasolineKHR.toLocaleString()} ៛
                      </td>
                      <td className={`py-3 px-3 text-right tabular-nums ${isDieselExceed ? 'text-rose-400 font-bold' : 'text-sky-400'}`}>
                        {st.dieselKHR.toLocaleString()} ៛
                        {st.dieselKHR < mocNotice.dieselCeilingKHR && (
                          <span className="text-[10px] text-emerald-400 block font-sans">ក្រោមពិដាន</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-left pl-4 font-sans text-xs text-slate-400">
                        {st.promotionNote || 'លក់តាមតម្លៃពិដានក្រសួង'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 14-Day Price Trends Visual Mini Bar */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
              <span>ប្រវត្តិការប្រែប្រួលតម្លៃពិដានក្រសួងពាណិជ្ជកម្ម (១០ ថ្ងៃម្តង)</span>
              <span className="text-slate-500 font-normal">គិតជាប្រាក់រៀល/លីត្រ</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {trendPoints.map((tp, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 truncate">{tp.date}</div>
                  <div className="font-mono tabular-nums text-xs font-bold text-white mt-1">
                    {tp.regularKHR.toLocaleString()}៛
                  </div>
                  <div className="text-[10px] text-sky-400 font-mono mt-0.5">
                    ម៉ាស៊ូត: {tp.dieselKHR.toLocaleString()}៛
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trip Fuel Cost Calculator (1 span) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">គណនាថ្លៃប្រេងធ្វើដំណើរ</h3>
                <div className="text-xs text-slate-400">គិតតាមតម្លៃជាក់ស្តែងតាមស្ថានីយ</div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {/* Select mode */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                <button
                  onClick={() => setCalcMode('distance')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    calcMode === 'distance'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  តាមចម្ងាយផ្លូវ (Km)
                </button>
                <button
                  onClick={() => setCalcMode('liters')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    calcMode === 'liters'
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  តាមចំនួនលីត្រ (L)
                </button>
              </div>

              {/* Dynamic Inputs */}
              {calcMode === 'distance' ? (
                <>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      ចម្ងាយផ្លូវធ្វើដំណើរ (Km)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      កម្រិតស៊ីប្រេង (លីត្រ / ១០០ Km)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={consumptionRate}
                      onChange={(e) => setConsumptionRate(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    ចំនួនប្រេងសរុប (លីត្រ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={litersInput}
                    onChange={(e) => setLitersInput(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {/* Select Fuel Type */}
              <div className="grid grid-cols-3 gap-1">
                {(['regular', 'super', 'diesel'] as const).map((ft) => (
                  <button
                    key={ft}
                    onClick={() => setSelectedFuelType(ft)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      selectedFuelType === ft
                        ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {ft === 'regular' ? 'សាំងធម្មតា' : ft === 'super' ? 'ស៊ុបពែរ' : 'ម៉ាស៊ូត'}
                  </button>
                ))}
              </div>

              {/* Station selector for price calculation */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">ជ្រើសរើសស្ថានីយ</label>
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {fuelStations.map((st) => (
                    <option key={st.name} value={st.name}>
                      {st.name} ({pricePerLiter.toLocaleString()} ៛/L)
                    </option>
                  ))}
                </select>
              </div>

              {/* Result Summary */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2 mt-2">
                <div className="text-xs text-slate-400 flex items-center justify-between pb-1 border-b border-slate-800">
                  <span>ប្រេងត្រូវការសរុប:</span>
                  <span className="font-mono text-sky-400 font-semibold">
                    {totalLiters.toFixed(1)} លីត្រ
                  </span>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">ការចំណាយប៉ាន់ស្មានសរុប</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
                    {totalCostKHR.toLocaleString()} ៛
                  </div>
                  <div className="text-xs font-mono tabular-nums text-slate-400">
                    ≈ ${totalCostUSD.toFixed(2)} USD
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            💡 គន្លឹះ៖ ការរក្សាល្បឿនថេរ ៨០-៩០ គីឡូម៉ែត្រ/ម៉ោង ជួយសន្សំសំចៃប្រេងរហូតដល់ ១៥%។
          </div>
        </div>
      </div>

      {/* Edit MoC Notice Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-400 text-slate-950 rounded-lg">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    កែសម្រួលតាមសេចក្តីជូនដំណឹងថ្មីរបស់ក្រសួងពាណិជ្ជកម្ម
                  </h3>
                  <p className="text-xs text-slate-400">Update MoC Official Fuel Price Ceiling</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMoCNotice} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  លេខសេចក្តីជូនដំណឹងផ្លូវការ
                </label>
                <input
                  type="text"
                  value={editNoticeNumber}
                  onChange={(e) => setEditNoticeNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  placeholder="ឧ. សេចក្តីជូនដំណឹងលេខ ១៨២៩/២៦ ព.ណ.អ.ស"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  កាលបរិច្ឆេទអនុវត្ត (រយៈពេល ១០ ថ្ងៃ)
                </label>
                <input
                  type="text"
                  value={editPeriod}
                  onChange={(e) => setEditPeriod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  placeholder="ឧ. ថ្ងៃទី ១១ ដល់ ថ្ងៃទី ២១ តុលា"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    តម្លៃពិដានសាំងធម្មតា EA92 (៛/L)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={editRegularCeiling}
                    onChange={(e) => setEditRegularCeiling(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm font-bold text-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    តម្លៃពិដានប្រេងម៉ាស៊ូត DO (៛/L)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={editDieselCeiling}
                    onChange={(e) => setEditDieselCeiling(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm font-bold text-sky-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    តម្លៃសាំងស៊ុបពែរ EA95 ប៉ាន់ស្មាន (៛/L)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={editSuperRate}
                    onChange={(e) => setEditSuperRate(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    ស្ថានភាពប្រែប្រួល
                  </label>
                  <input
                    type="text"
                    value={editStatusText}
                    onChange={(e) => setEditStatusText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    placeholder="ឧ. ចុះថ្លៃ ៥០ ៛/លីត្រ"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ធានាការអនុលោមតាមច្បាប់៖</span>
                </div>
                <div>• រាល់ស្ថានីយទាំងអស់ (PTT, Total, Tela, Caltex, Sokimex) នឹងធ្វើបច្ចុប្បន្នភាពស្វ័យប្រវត្តិតាមតម្លៃពិដាននេះ។</div>
                <div>• គ្មានស្ថានីយណាអាចលក់ថ្លៃលើសតម្លៃពិដានដែលបានកំណត់នេះឡើយ។</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
                >
                  រក្សាទុក និង Update គ្រប់ស្ថានីយ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
