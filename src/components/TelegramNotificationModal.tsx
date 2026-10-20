import React, { useState } from 'react';
import { TelegramConfig } from '../types/market';
import {
  Send,
  X,
  Check,
  AlertCircle,
  Bell,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  CloudRain,
  Coins,
} from 'lucide-react';
import { sendTelegramMessage } from '../services/telegramService';
import { audioAlert } from '../utils/audioAlert';

interface TelegramNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelegramConfig;
  onSaveConfig: (cfg: TelegramConfig) => void;
  onSendTestMessage: () => Promise<void>;
  browserNotificationPermission: NotificationPermission | 'unsupported';
  onRequestBrowserNotification: () => Promise<void>;
}

export const TelegramNotificationModal: React.FC<TelegramNotificationModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onSendTestMessage,
  browserNotificationPermission,
  onRequestBrowserNotification,
}) => {
  const [botToken, setBotToken] = useState(config.botToken);
  const [chatId, setChatId] = useState(config.chatId);
  const [enabled, setEnabled] = useState(config.enabled);
  const [alertGoldPriceHigh, setAlertGoldPriceHigh] = useState(config.alertGoldPriceHigh || 3400);
  const [alertGoldPriceLow, setAlertGoldPriceLow] = useState(config.alertGoldPriceLow || 3200);
  const [alertRain, setAlertRain] = useState(config.alertRain ?? true);
  const [alertDailyReport, setAlertDailyReport] = useState(config.alertDailyReport ?? true);

  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const newCfg: TelegramConfig = {
      ...config,
      enabled,
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      alertGoldPriceHigh,
      alertGoldPriceLow,
      alertRain,
      alertDailyReport,
    };
    onSaveConfig(newCfg);
    onClose();
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setTestResult(null);

    const testMsg = `<b>🔔 សារសាកល្បង Telegram Bot (Test Message)</b>
━━━━━━━━━━━━━━━━━━━━
🎉 សូមអបអរសាទរ! ការតភ្ជាប់រវាង <b>Cambodia Gold & Market Watch</b> និង Telegram Bot របស់អ្នកទទួលបានជោគជ័យ។

ប្រព័ន្ធនឹងចាប់ផ្តើមផ្ញើដំណឹង៖
• ⚡ ហាងឆេងមាសប្រែប្រួល
• 🌧️ ព្យាករណ៍ភ្លៀងធ្លាក់ជាមុន
• 📊 របាយការណ៍ទីផ្សារសង្ខេបប្រចាំថ្ងៃ

<i>ពេលវេលា៖ ${new Date().toLocaleTimeString('km-KH')}</i>`;

    const res = await sendTelegramMessage(botToken, chatId, testMsg);
    setTestResult(res);
    setIsSendingTest(false);

    if (res.success) {
      audioAlert.playGoldMilestoneTone();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-lg">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                ការកំណត់ Telegram Bot & សារជូនដំណឹង
              </h2>
              <p className="text-xs text-slate-400">
                ទទួលដំណឹងហាងឆេងមាស និងភ្លៀងធ្លាក់ទាន់ហេតុការណ៍
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

        <div className="p-5 space-y-5">
          {/* Browser Notification Section */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  ការជូនដំណឹងតាមកម្មវិធីរុករក (Browser Push)
                </div>
                <div className="text-[11px] text-slate-400">
                  {browserNotificationPermission === 'granted'
                    ? '✅ បានអនុញ្ញាតទទួលដំណឹងលើអេក្រង់'
                    : 'ជូនដំណឹងលោតលើអេក្រង់ទូរស័ព្ទ / កុំព្យូទ័រ'}
                </div>
              </div>
            </div>
            {browserNotificationPermission !== 'granted' ? (
              <button
                onClick={onRequestBrowserNotification}
                className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors whitespace-nowrap"
              >
                បើកដំណើរការ
              </button>
            ) : (
              <span className="text-xs font-semibold text-emerald-400 font-mono">
                បើករួចរាល់
              </span>
            )}
          </div>

          {/* Telegram Activation Switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <div className="text-sm font-semibold text-white">
                បើកដំណើរការផ្ញើដំណឹងតាម Telegram
              </div>
              <div className="text-xs text-slate-400">
                ផ្ញើសារចូលគណនីផ្ទាល់ខ្លួន ក្រុម (Group) ឬប៉ុស្តិ៍ (Channel) របស់អ្នក
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
            </label>
          </div>

          {/* Setup Guide Toggle */}
          <div>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{showGuide ? 'លាក់ការណែនាំបង្កើត Bot' : 'របៀបបង្កើត Telegram Bot ដោយឥតគិតថ្លៃ (៣ ជំហាន)'}</span>
            </button>

            {showGuide && (
              <div className="mt-2 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
                <div>
                  <strong className="text-amber-400">ជំហានទី ១:</strong> ចូល Telegram ស្វែងរក <code className="text-white bg-slate-800 px-1 rounded">@BotFather</code> ហើយចុច Start រួចផ្ញើពាក្យ <code className="text-white bg-slate-800 px-1 rounded">/newbot</code>។
                </div>
                <div>
                  <strong className="text-amber-400">ជំហានទី ២:</strong> ដាក់ឈ្មោះ bot របស់អ្នក។ បន្ទាប់មក BotFather នឹងផ្តល់ជូន <strong>HTTP API Token</strong> (ឧ. <code className="text-white bg-slate-800 px-1 rounded">123456789:ABC...</code>)។
                </div>
                <div>
                  <strong className="text-amber-400">ជំហានទី ៣:</strong> ចុច Start bot នោះ។ ដើម្បីដឹងលេខ Chat ID របស់អ្នក សូមឆាតទៅ <code className="text-white bg-slate-800 px-1 rounded">@userinfobot</code> ឬប្រសិនបើជា Channel សូមបញ្ចូល Bot ជា Admin ហើយប្រើ @channel_username។
                </div>
              </div>
            )}
          </div>

          {/* Form Credentials */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Telegram Bot Token
              </label>
              <input
                type="text"
                placeholder="ឧទាហរណ៍៖ 123456789:AAHKq8..."
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Chat ID ឬ Channel Username
              </label>
              <input
                type="text"
                placeholder="ឧទាហរណ៍៖ 987654321 ឬ @my_gold_channel"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Alert Threshold Options */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200">
              លក្ខខណ្ឌជូនដំណឹងដោយស្វ័យប្រវត្តិ (Alert Triggers)
            </h4>

            {/* Rain alert checkbox */}
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={alertRain}
                onChange={(e) => setAlertRain(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-amber-400 focus:ring-0"
              />
              <span className="flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                <span>ជូនដំណឹងមុនពេលភ្លៀងធ្លាក់ (នៅពេលប្រូបាប៊ីលីតេ &gt; ៤០%)</span>
              </span>
            </label>

            {/* Daily report checkbox */}
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={alertDailyReport}
                onChange={(e) => setAlertDailyReport(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-amber-400 focus:ring-0"
              />
              <span>ផ្ញើរបាយការណ៍សង្ខេបហាងឆេងមាស ប្រេង និងប្តូរប្រាក់ប្រចាំថ្ងៃ</span>
            </label>

            {/* Gold Threshold Alert */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" />
                <span>កំណត់កម្រិតព្រមានតម្លៃមាស 24K (ក្នុង ១ តម្លឹង)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">ជូនដំណឹងបើឡើងលើស ($)</span>
                  <input
                    type="number"
                    value={alertGoldPriceHigh}
                    onChange={(e) => setAlertGoldPriceHigh(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-white"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">ជូនដំណឹងបើធ្លាក់ក្រោម ($)</span>
                  <input
                    type="number"
                    value={alertGoldPriceLow}
                    onChange={(e) => setAlertGoldPriceLow(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span className="leading-tight">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={handleSendTest}
            disabled={isSendingTest || !botToken || !chatId}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-spin' : ''}`} />
            <span>{isSendingTest ? 'កំពុងផ្ញើសាកល្បង...' : 'ផ្ញើសារសាកល្បង'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              បោះបង់
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors"
            >
              រក្សាទុកការកំណត់
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
