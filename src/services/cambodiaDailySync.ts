import { CambodiaDailySyncMetadata, GoldType, CurrencyItem, FuelStation, TelegramConfig } from '../types/market';
import { sendTelegramMessage, buildDailyMarketDigestMessage } from './telegramService';

const SYNC_STORAGE_KEY = 'cambodia_daily_sync_state';

// Convert current moment to Cambodia Time (UTC+7)
export function getCambodiaDateTime(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 3600000);
}

export function formatCambodiaDateKhmer(d: Date): string {
  const khmerDays = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
  const khmerMonths = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];
  const khmerNumerals = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  const toKhmerNum = (num: number) => num.toString().split('').map(n => khmerNumerals[parseInt(n)] || n).join('');

  const dayName = khmerDays[d.getDay()];
  const day = toKhmerNum(d.getDate());
  const month = khmerMonths[d.getMonth()];
  const year = toKhmerNum(d.getFullYear());

  return `ថ្ងៃ${dayName} ទី${day} ខែ${month} ឆ្នាំ${year}`;
}

export function getCambodiaDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getCambodiaTimeFormatted(d: Date): string {
  return d.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

export function loadDailySyncMetadata(): CambodiaDailySyncMetadata {
  const camNow = getCambodiaDateTime();
  const todayISO = getCambodiaDateISO(camNow);

  let lastSyncDate = '';
  let lastSyncTimeKhmer = '08:30 ព្រឹក';
  let dailyAutoSyncEnabled = true;

  try {
    const raw = localStorage.getItem(SYNC_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      lastSyncDate = parsed.lastSyncDate || '';
      lastSyncTimeKhmer = parsed.lastSyncTimeKhmer || '08:30 ព្រឹក';
      if (typeof parsed.dailyAutoSyncEnabled === 'boolean') {
        dailyAutoSyncEnabled = parsed.dailyAutoSyncEnabled;
      }
    }
  } catch {
    // ignore
  }

  const isDailySyncedToday = lastSyncDate === todayISO;

  const currentHour = camNow.getHours() + camNow.getMinutes() / 60;

  const scheduleSlots = [
    {
      id: 'morning',
      time: '08:30 ព្រឹក',
      labelKhmer: 'ជុំទី ១៖ ពេលព្រឹក (Morning Sync)',
      descriptionKhmer: 'ផ្សាយអត្រាប្តូរប្រាក់ផ្លូវការធនាគារជាតិ (NBC) និងបើកក្តារហាងឆេងមាស',
      passed: currentHour >= 8.5,
      isNext: currentHour < 8.5,
    },
    {
      id: 'afternoon',
      time: '02:00 រសៀល',
      labelKhmer: 'ជុំទី ២៖ ពេលរសៀល (Mid-Day Sync)',
      descriptionKhmer: 'បច្ចុប្បន្នភាពទីផ្សារមាសអន្តរជាតិ និងរ៉ាដាភ្លៀងធ្លាក់ពេលល្ងាច',
      passed: currentHour >= 14,
      isNext: currentHour >= 8.5 && currentHour < 14,
    },
    {
      id: 'evening',
      time: '06:00 ល្ងាច',
      labelKhmer: 'ជុំទី ៣៖ បិទទីផ្សារ (Daily Close)',
      descriptionKhmer: 'របាយការណ៍សង្ខេបបិទទីផ្សារប្រចាំថ្ងៃ និងផ្ញើចូល Telegram Bot',
      passed: currentHour >= 18,
      isNext: currentHour >= 14 && currentHour < 18,
    },
  ];

  const standardSources = [
    {
      name: 'ធនាគារជាតិនៃកម្ពុជា',
      abbr: 'NBC',
      authority: 'រាជរដ្ឋាភិបាលកម្ពុជា',
      frequency: 'រៀងរាល់ព្រឹក ម៉ោង 8:30',
      status: 'ទាន់សម័យ' as const,
    },
    {
      name: 'ក្រសួងពាណិជ្ជកម្ម',
      abbr: 'MoC',
      authority: 'នាយកដ្ឋានប្រេងឥន្ធនៈ',
      frequency: 'រៀងរាល់ ១០ ថ្ងៃម្តង',
      status: 'ទាន់សម័យ' as const,
    },
    {
      name: 'សមាគមអាជីវករមាសកម្ពុជា',
      abbr: 'CGTA',
      authority: 'ផ្សារធំថ្មី & អូឡាំពិក',
      frequency: '២ ដងក្នុងមួយថ្ងៃ',
      status: 'ទាន់សម័យ' as const,
    },
    {
      name: 'ក្រសួងធនធានទឹក និងឧតុនិយម',
      abbr: 'MOWRAM',
      authority: 'នាយកដ្ឋានឧតុនិយម',
      frequency: 'ប្រចាំថ្ងៃ & តាមម៉ោង',
      status: 'សកម្ម' as const,
    },
  ];

  return {
    lastSyncDate,
    lastSyncTimeKhmer,
    cambodiaDateFormatted: formatCambodiaDateKhmer(camNow),
    isDailySyncedToday,
    dailyAutoSyncEnabled,
    scheduleSlots,
    standardSources,
  };
}

export function saveDailySyncMetadata(meta: { lastSyncDate: string; lastSyncTimeKhmer: string; dailyAutoSyncEnabled?: boolean }) {
  try {
    const raw = localStorage.getItem(SYNC_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify({ ...existing, ...meta }));
  } catch {
    // ignore
  }
}

// Perform Cambodia Standards Daily Sync
export async function executeCambodiaDailyStandardsSync(
  gold24kSellUSD: number,
  fuelRegularKHR: number,
  fuelDieselKHR: number,
  usdKhrRate: number,
  krwKhrRate: number,
  telegramConfig?: TelegramConfig
): Promise<{ success: boolean; syncTimeKhmer: string; cambodiaDate: string; telegramSent: boolean }> {
  const camNow = getCambodiaDateTime();
  const dateISO = getCambodiaDateISO(camNow);
  const timeKhmer = getCambodiaTimeFormatted(camNow);

  saveDailySyncMetadata({
    lastSyncDate: dateISO,
    lastSyncTimeKhmer: timeKhmer,
  });

  let telegramSent = false;

  // Check if daily telegram report is enabled
  if (
    telegramConfig &&
    telegramConfig.enabled &&
    telegramConfig.alertDailyReport &&
    telegramConfig.botToken &&
    telegramConfig.chatId
  ) {
    try {
      const digestMsg = buildDailyMarketDigestMessage(
        gold24kSellUSD,
        fuelRegularKHR,
        fuelDieselKHR,
        usdKhrRate,
        krwKhrRate
      );
      const res = await sendTelegramMessage(telegramConfig.botToken, telegramConfig.chatId, digestMsg);
      telegramSent = res.success;
    } catch {
      // ignore
    }
  }

  return {
    success: true,
    syncTimeKhmer: timeKhmer,
    cambodiaDate: formatCambodiaDateKhmer(camNow),
    telegramSent,
  };
}
