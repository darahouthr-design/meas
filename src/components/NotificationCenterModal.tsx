import React from 'react';
import { AlertNotification } from '../types/market';
import { Bell, X, Trash2, CheckCircle2, AlertTriangle, CloudRain, Coins, Fuel, DollarSign } from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AlertNotification[];
  onClearAll: () => void;
  onMarkAsRead: (id: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onMarkAsRead,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: AlertNotification['type']) => {
    switch (type) {
      case 'gold':
        return <Coins className="w-4 h-4 text-amber-400" />;
      case 'fuel':
        return <Fuel className="w-4 h-4 text-emerald-400" />;
      case 'currency':
        return <DollarSign className="w-4 h-4 text-indigo-400" />;
      case 'weather':
        return <CloudRain className="w-4 h-4 text-sky-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border-l sm:border border-slate-800 sm:rounded-2xl w-full max-w-md h-full sm:h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white">ប្រអប់សារជូនដំណឹង</h2>
              <div className="text-xs text-slate-400">
                {notifications.length} សារដំណឹងចុងក្រោយ
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                title="លុបសារទាំងអស់"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
              <CheckCircle2 className="w-10 h-10 text-slate-600 mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium text-slate-400">មិនមានសារដំណឹងថ្មីទេ</p>
              <p className="text-xs text-slate-600 mt-1">
                ប្រព័ន្ធនឹងបង្ហាញដំណឹងនៅទីនេះ នៅពេលមានបម្រែបម្រួលហាងឆេង ឬព្យាករណ៍ភ្លៀង
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => onMarkAsRead(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  item.read
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                    : 'bg-slate-950 border-amber-500/30 text-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-slate-900 rounded-lg shrink-0 mt-0.5 border border-slate-800">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white truncate">
                        {item.titleKhmer}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {item.messageKhmer}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 text-center bg-slate-950">
          សារដំណឹងត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិ
        </div>
      </div>
    </div>
  );
};
