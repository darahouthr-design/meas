import { TelegramConfig } from '../types/market';

export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  enabled: false,
  botToken: '',
  chatId: '',
  alertGoldPriceHigh: 3400,
  alertGoldPriceLow: 3200,
  alertRain: true,
  alertDailyReport: true,
};

const STORAGE_KEY = 'cambodia_market_telegram_config';

export function loadTelegramConfig(): TelegramConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_TELEGRAM_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_TELEGRAM_CONFIG;
}

export function saveTelegramConfig(config: TelegramConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  messageHtml: string
): Promise<{ success: boolean; message: string }> {
  if (!botToken || !chatId) {
    return {
      success: false,
      message: 'សូមបញ្ចូល Telegram Bot Token និង Chat ID ជាមុនសិន!',
    };
  }

  const cleanToken = botToken.trim().replace(/^bot/i, '');
  const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: messageHtml,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json();
    if (response.ok && result.ok) {
      return {
        success: true,
        message: 'សារត្រូវបានផ្ញើទៅកាន់ Telegram ដោយជោគជ័យ! 🎉',
      };
    } else {
      return {
        success: false,
        message: `Telegram Error: ${result.description || 'មិនអាចផ្ញើសារបានទេ។ សូមពិនិត្យ Bot Token និង Chat ID'}`
      };
    }
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : 'Unknown network error';
    return {
      success: false,
      message: `ការតភ្ជាប់មានបញ្ហា (${errMessage})។ សូមប្រាកដថាអ្នកបានចាប់ផ្តើម /start ជាមួយ bot របស់អ្នក។`,
    };
  }
}

// Pre-formatted messages for Telegram
export function buildGoldAlertMessage(goldNameKhmer: string, priceDamlung: number, changeUSD: number): string {
  const isUp = changeUSD >= 0;
  return `<b>⚡ ដំណឹងហាងឆេងមាសបន្ទាន់ (Gold Alert)</b>
━━━━━━━━━━━━━━━━━━━━
<b>ប្រភេទមាស:</b> ${goldNameKhmer}
<b>តម្លៃលក់ចេញ:</b> <code>$${priceDamlung.toLocaleString()}</code> /តម្លឹង
<b>បម្រែបម្រួល:</b> ${isUp ? '📈 +' : '📉 -'}$${Math.abs(changeUSD)} (${isUp ? 'ឡើងថ្លៃ' : 'ចុះថ្លៃ'})
<b>ពេលវេលា:</b> ${new Date().toLocaleTimeString('km-KH')}

<i>📡 ជូនដំណឹងដោយស្វ័យប្រវត្តិតាមរយៈ Cambodia Gold & Market Watch</i>`;
}

export function buildRainAlertMessage(cityKhmer: string, expectedTime: string, prob: number, intensity: string): string {
  return `<b>🌧️ ការជូនដំណឹងមុនពេលភ្លៀងធ្លាក់ (Rain Alert)</b>
━━━━━━━━━━━━━━━━━━━━
📍 <b>ទីតាំង:</b> ${cityKhmer}
⏰ <b>ពេលវេលារំពឹងទុក:</b> ${expectedTime}
🌧️ <b>ប្រូបាប៊ីលីតេធ្លាក់ភ្លៀង:</b> <code>${prob}%</code>
💨 <b>កម្រិតទឹកភ្លៀង:</b> ${intensity}

⚠️ <i>សូមរៀបចំទុកដាក់សម្ភារៈ និងត្រៀមឆ័ត្រ ឬអាវភ្លៀងតាមខ្លួនពេលធ្វើដំណើរ!</i>`;
}

export function buildDailyMarketDigestMessage(
  gold24kDamlung: number,
  fuelRegular: number,
  fuelDiesel: number,
  usdKhr: number,
  krwKhr: number
): string {
  return `<b>📊 របាយការណ៍សង្ខេបទីផ្សារប្រចាំថ្ងៃ (Daily Market Digest)</b>
━━━━━━━━━━━━━━━━━━━━
📅 <b>កាលបរិច្ឆេទ:</b> ${new Date().toLocaleDateString('km-KH')}

🥇 <b>ហាងឆេងមាស 24K:</b>
  • $${gold24kDamlung.toLocaleString()} /តម្លឹង (~${(gold24kDamlung / 10).toFixed(1)}$ /ជី)

⛽ <b>តម្លៃប្រេងឥន្ធនៈ (ក្រសួងពាណិជ្ជកម្ម):</b>
  • សាំងធម្មតា EA92: <code>${fuelRegular.toLocaleString()}៛</code>/លីត្រ
  • ប្រេងម៉ាស៊ូត DO: <code>${fuelDiesel.toLocaleString()}៛</code>/លីត្រ

💱 <b>អត្រាប្តូរប្រាក់:</b>
  • 1 USD = <code>${usdKhr.toLocaleString()}៛</code>
  • 1,000 KRW (វ៉ុនកូរ៉េ) = <code>${(krwKhr * 1000).toFixed(0)}៛</code>

<i>Cambodia Gold & Market Watch</i>`;
}
