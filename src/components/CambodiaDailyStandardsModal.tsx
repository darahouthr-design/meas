import React, { useState } from 'react';
import { CambodiaDailySyncMetadata, GoldType, FuelStation, CurrencyItem } from '../types/market';
import {
  X,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Copy,
  Send,
  Download,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { audioAlert } from '../utils/audioAlert';

interface CambodiaDailyStandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: CambodiaDailySyncMetadata;
  onToggleAutoSync: (enabled: boolean) => void;
  onTriggerDailySync: () => void;
  isSyncing: boolean;
  goldTypes: GoldType[];
  fuelStations: FuelStation[];
  currencies: CurrencyItem[];
  onSendTelegramReport: () => Promise<void>;
}

export const CambodiaDailyStandardsModal: React.FC<CambodiaDailyStandardsModalProps> = ({
  isOpen,
  onClose,
  metadata,
  onToggleAutoSync,
  onTriggerDailySync,
  isSyncing,
  goldTypes,
  fuelStations,
  currencies,
  onSendTelegramReport,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);

  if (!isOpen) return null;

  const gold24k = goldTypes.find((g) => g.id === 'gold-24k');
  const usdItem = currencies.find((c) => c.code === 'USD');
  const krwItem = currencies.find((c) => c.code === 'KRW');
  const regularFuel = fuelStations[0]?.regularGasolineKHR || 4150;
  const dieselFuel = fuelStations[0]?.dieselKHR || 4000;

  // Generate plain-text standardized daily report for easy copy & distribution
  const dailyReportText = `🇰🇭 របាយការណ៍ហាងឆេងស្តង់ដារកម្ពុជាប្រចាំថ្ងៃ (${metadata.cambodiaDateFormatted})
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🕒 ម៉ោងធ្វើបច្ចុប្បន្នភាព៖ ${metadata.lastSyncTimeKhmer} (ម៉ោងនៅភ្នំពេញ UTC+7)

🥇 ១. ហាងឆេងមាសស្តង់ដារទីផ្សារកម្ពុជា៖
  • មាសទឹកដប់ 24K (99.99%)៖ លក់ $${gold24k?.pricePerDamlungSellUSD.toLocaleString()} / ទិញ $${gold24k?.pricePerDamlungBuyUSD.toLocaleString()} (ក្នុង ១ តម្លឹង)
  • មាសទឹកដប់ 24K (ក្នុង ១ ជី)៖ $${((gold24k?.pricePerDamlungSellUSD || 3345) / 10).toFixed(1)}
  • ប្លាទីន/ផ្លាទីន 18K (75%)៖ លក់ $${goldTypes.find(g => g.id === 'gold-18k')?.pricePerDamlungSellUSD.toLocaleString()} /តម្លឹង

⛽ ២. តម្លៃប្រេងឥន្ធនៈស្តង់ដារក្រសួងពាណិជ្ជកម្ម៖
  • សាំងធម្មតា EA92៖ ${regularFuel.toLocaleString()} ៛/លីត្រ
  • សាំងស៊ុបពែរ EA95៖ ${(fuelStations[0]?.superGasolineKHR || 4650).toLocaleString()} ៛/លីត្រ
  • ប្រេងម៉ាស៊ូត DO៖ ${dieselFuel.toLocaleString()} ៛/លីត្រ

💱 ៣. អត្រាប្តូរប្រាក់ផ្លូវការធនាគារជាតិនៃកម្ពុជា (NBC) & ទីផ្សារសេរី៖
  • 1 USD (ដុល្លារ) = ${usdItem?.nbcRate.toLocaleString()} ៛ (ទីផ្សារទិញ: ${usdItem?.marketBuyRate.toLocaleString()} ៛ / លក់: ${usdItem?.marketSellRate.toLocaleString()} ៛)
  • 1,000 KRW (វ៉ុនកូរ៉េ) = ${((krwItem?.marketBuyRate || 2.9) * 1000).toFixed(0)} ៛
  • 1 USD = ${krwItem?.usdRate.toLocaleString()} ₩ (វ៉ុនកូរ៉េ)

📌 យោងតាម៖ ធនាគារជាតិនៃកម្ពុជា (NBC), ក្រសួងពាណិជ្ជកម្ម (MoC), និងសមាគមអាជីវករមាសកម្ពុជា`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(dailyReportText);
    setCopied(true);
    audioAlert.playChime();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTelegramClick = async () => {
    setIsSendingTelegram(true);
    await onSendTelegramReport();
    setIsSendingTelegram(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                ស្តង់ដារបច្ចុប្បន្នភាពប្រចាំថ្ងៃក្នុងព្រះរាជាណាចក្រកម្ពុជា
              </h2>
              <p className="text-xs text-slate-400">
                Cambodia Official Daily Standardization & Update Schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Daily Auto-Sync Switcher */}
          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <div className="text-sm font-semibold text-white">
                ដំណើរការ Update ដោយស្វ័យប្រវត្តិរៀងរាល់ថ្ងៃ
              </div>
              <div className="text-xs text-slate-400">
                ប្រព័ន្ធនឹងធ្វើបច្ចុប្បន្នភាពទិន្នន័យទាំងអស់ដោយស្វ័យប្រវត្តិតាមម៉ោងកំណត់នៅកម្ពុជា
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={metadata.dailyAutoSyncEnabled}
                onChange={(e) => onToggleAutoSync(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
            </label>
          </div>

          {/* Official Cambodia 3-slot Daily Update Schedule */}
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>កាលវិភាគអាប់ដេតផ្លូវការប្រចាំថ្ងៃនៅកម្ពុជា (UTC+7)</span>
            </h3>

            <div className="space-y-2">
              {metadata.scheduleSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    slot.isNext
                      ? 'bg-amber-500/10 border-amber-400/50 text-white'
                      : slot.passed
                      ? 'bg-slate-950 border-slate-800/80 text-slate-300'
                      : 'bg-slate-950/40 border-slate-800/40 text-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 text-xs px-2 py-0.5 bg-slate-900 rounded">
                        {slot.time}
                      </span>
                      <h4 className="text-sm font-semibold text-white">
                        {slot.labelKhmer}
                      </h4>
                    </div>

                    <span className="text-xs font-semibold">
                      {slot.passed ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> រួចរាល់
                        </span>
                      ) : slot.isNext ? (
                        <span className="text-amber-400 animate-pulse font-mono">
                          ● ជុំបន្ទាប់
                        </span>
                      ) : (
                        <span className="text-slate-500">រង់ចាំ</span>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 pl-1">
                    {slot.descriptionKhmer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* National Official Authority References */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>ប្រភព និងស្ថាប័នស្តង់ដារផ្លូវការជាតិ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metadata.standardSources.map((src, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{src.name} ({src.abbr})</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-medium">
                      {src.status}
                    </span>
                  </div>
                  <div className="text-slate-400">អាជ្ញាធរ: {src.authority}</div>
                  <div className="text-slate-500">ប្រេកង់ផ្សាយ: {src.frequency}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Standard Daily Summary Export Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">
                  របាយការណ៍សង្ខេបស្តង់ដារប្រចាំថ្ងៃ (Daily Market Digest)
                </h4>
                <div className="text-[11px] text-slate-400">
                  រៀបចំរួចជាស្រេចសម្រាប់ចែកចាយក្នុង Telegram, Facebook ឬបោះពុម្ព
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyReport}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{copied ? 'បានចម្លងរួច!' : 'ចម្លងអត្ថបទ'}</span>
                </button>
                <button
                  onClick={handleTelegramClick}
                  disabled={isSendingTelegram}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isSendingTelegram ? 'animate-spin' : ''}`} />
                  <span>ផ្ញើ Telegram</span>
                </button>
              </div>
            </div>

            <pre className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg text-[11px] text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
              {dailyReportText}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950">
          <div className="text-[11px] text-slate-500">
            អនុលោមតាមស្តង់ដារទីផ្សារក្នុងព្រះរាជាណាចក្រកម្ពុជា
          </div>
          <button
            onClick={() => {
              onTriggerDailySync();
              onClose();
            }}
            disabled={isSyncing}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
          >
            {isSyncing ? 'កំពុង Update...' : 'Update ស្តង់ដារថ្ងៃនេះម្តងទៀត'}
          </button>
        </div>
      </div>
    </div>
  );
};
