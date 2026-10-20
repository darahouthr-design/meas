import React, { useState } from 'react';
import { X, BellRing, Check, DollarSign } from 'lucide-react';

interface SetGoldAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  goldName: string;
  currentPrice: number;
  onSaveAlert: (goldName: string, targetPrice: number, direction: 'above' | 'below') => void;
}

export const SetGoldAlertModal: React.FC<SetGoldAlertModalProps> = ({
  isOpen,
  onClose,
  goldName,
  currentPrice,
  onSaveAlert,
}) => {
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState<number>(Math.round(currentPrice * 1.02));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAlert(goldName, targetPrice, direction);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-lg">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">កំណត់ការជូនដំណឹងតម្លៃ</h3>
              <p className="text-xs text-slate-400">{goldName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">តម្លៃលក់បច្ចុប្បន្ន:</span>
            <span className="font-mono text-base font-bold text-amber-400">
              ${currentPrice.toLocaleString()} /តម្លឹង
            </span>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">
              ជូនដំណឹងនៅពេលតម្លៃប្រែប្រួល៖
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setDirection('above');
                  setTargetPrice(Math.round(currentPrice * 1.02));
                }}
                className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  direction === 'above'
                    ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                📈 ឡើងដល់ ឬលើស
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirection('below');
                  setTargetPrice(Math.round(currentPrice * 0.98));
                }}
                className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  direction === 'below'
                    ? 'border-rose-400 bg-rose-500/10 text-rose-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                📉 ធ្លាក់ចុះដល់ ឬក្រោម
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">
              កម្រិតតម្លៃកំណត់គោលដៅ ($ USD ក្នុង ១ តម្លឹង)
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-base font-mono text-white focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
            ℹ️ ប្រព័ន្ធនឹងផ្ញើសារដំណឹងភ្លាមៗតាម Browser Push និង Telegram Bot (ប្រសិនបើបានភ្ជាប់) នៅពេលតម្លៃទីផ្សារឈានដល់កម្រិតនេះ។
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              បង្កើតការជូនដំណឹង
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
