import React from 'react';
import { CambodiaDailySyncMetadata } from '../types/market';
import { ShieldCheck, Calendar, Clock, RefreshCw, ChevronRight, Sparkles, Send } from 'lucide-react';

interface CambodiaDailyStandardsBarProps {
  metadata: CambodiaDailySyncMetadata;
  isSyncing: boolean;
  onTriggerDailySync: () => void;
  onOpenStandardsModal: () => void;
}

export const CambodiaDailyStandardsBar: React.FC<CambodiaDailyStandardsBarProps> = ({
  metadata,
  isSyncing,
  onTriggerDailySync,
  onOpenStandardsModal,
}) => {
  const nextSlot = metadata.scheduleSlots.find((s) => s.isNext);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/20 border border-amber-500/25 rounded-2xl p-3.5 sm:p-4 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left side: Cambodian Standards Emblem & Date */}
        <div className="flex items-start sm:items-center gap-3">
          <img
            src="/assets/aistudio/Golden_Khmer_Financial_Marketplace_Emblem_5812dedc.png"
            alt="Emblem"
            className="w-11 h-11 object-contain drop-shadow-md shrink-0"
          />

          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <span>🇰🇭</span> ស្តង់ដារព្រះរាជាណាចក្រកម្ពុជា (Cambodia Standards)
              </span>
              <span aria-hidden="true" className="text-slate-600 hidden sm:inline">·</span>
              <span className="text-slate-300 font-medium">
                {metadata.cambodiaDateFormatted}
              </span>
            </div>

            <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>
                បច្ចុប្បន្នភាពចុងក្រោយ: <strong className="text-slate-200 font-mono">{metadata.lastSyncTimeKhmer}</strong>
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-400">
                {metadata.isDailySyncedToday ? '✓ បាន Sync ស្តង់ដារថ្ងៃនេះ' : '⚠️ មិនទាន់បាន Sync ថ្ងៃនេះ'}
              </span>
              {nextSlot && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-sky-400">
                    ជុំបន្ទាប់៖ {nextSlot.time} ({nextSlot.id === 'morning' ? 'ព្រឹក' : nextSlot.id === 'afternoon' ? 'រសៀល' : 'ល្ងាច'})
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Interactive Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* View Details Modal Button */}
          <button
            onClick={onOpenStandardsModal}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <span>កាលវិភាគ & ឯកសារយោង</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Trigger Daily Sync Now */}
          <button
            onClick={onTriggerDailySync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg shadow-sm transition-all whitespace-nowrap"
            title="ធ្វើបច្ចុប្បន្នភាពទិន្នន័យទាំងអស់តាមស្តង់ដារជាតិថ្ងៃនេះ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'កំពុង Update...' : 'Update ស្តង់ដារប្រចាំថ្ងៃ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
