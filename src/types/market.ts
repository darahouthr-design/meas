export type TimeFrame = '7D' | '30D' | '90D' | '1Y';

export interface GoldUnitConversion {
  unitName: string; // Damlung (តម្លឹង), Chi (ជី), Gram (ក្រាម), Ounce (អោនស៍), Kilo (គីឡូ)
  unitKhmer: string;
  weightGrams: number;
  buyPriceUSD: number;
  sellPriceUSD: number;
  buyPriceKHR: number;
  sellPriceKHR: number;
}

export interface GoldType {
  id: string;
  nameKhmer: string;
  nameEng: string;
  purity: string; // 99.99%, 98%, 91.6%, 75%, 58.5%
  pricePerDamlungBuyUSD: number;
  pricePerDamlungSellUSD: number;
  pricePerChiBuyUSD: number;
  pricePerChiSellUSD: number;
  change24hUSD: number;
  change24hPercent: number;
  marketStandard?: string;
}

export interface HistoricalPricePoint {
  date: string;
  priceUSD: number; // per Damlung or per Ounce
  highUSD: number;
  lowUSD: number;
  volume?: number;
}

export interface MoCFuelNotice {
  noticeNumber: string;
  effectivePeriod: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  nextUpdateDate: string;
  regularCeilingKHR: number;
  dieselCeilingKHR: number;
  superEstimatedKHR: number;
  lpgEstimatedKHR: number;
  governmentSubsidyUSD: number;
  mopsOilPriceUSD: number;
  changeRegularKHR: number;
  changeDieselKHR: number;
  statusText: string;
  formulaDescription: string;
}

export interface FuelStation {
  name: string;
  logoColor: string;
  regularGasolineKHR: number; // EA92 (must not exceed MoC ceiling)
  superGasolineKHR: number;   // EA95 (market rate)
  dieselKHR: number;          // DO 50ppm (must not exceed MoC ceiling)
  lpgKHR: number;
  lastUpdated: string;
  promotionNote?: string;
  isCeilingCompliant: boolean;
}

export interface FuelTrendPoint {
  date: string;
  regularKHR: number;
  dieselKHR: number;
  superKHR: number;
}

export interface CurrencyItem {
  code: string;
  nameKhmer: string;
  nameEng: string;
  flag: string;
  symbol: string;
  nbcRate: number;       // In KHR
  marketBuyRate: number; // In KHR
  marketSellRate: number;// In KHR
  usdRate: number;       // Rate against 1 USD
  change24h: number;     // %
  lastSyncTime?: string;
}

export interface BankProduct {
  bankId: string;
  bankNameKhmer: string;
  bankNameEng: string;
  logoText: string;
  color: string;
  fixedDepositKHR_12M: number; // % per year
  fixedDepositUSD_12M: number;
  fixedDepositKHR_6M: number;
  fixedDepositUSD_6M: number;
  savingsKHR: number;
  savingsUSD: number;
  housingLoanUSD: number;
  autoLoanUSD: number;
  smeLoanUSD: number;
  rating: string;
}

export interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  isGps: boolean;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  conditionTextKhmer: string;
  isRainingNow: boolean;
  rainProbabilityNextHour: number;
  upcomingRainAlert: {
    willRainSoon: boolean;
    hoursUntilRain: number;
    expectedRainTime: string;
    probability: number;
    intensity: 'ស្រាល (Light)' | 'មធ្យម (Moderate)' | 'ខ្លាំង (Heavy)' | 'គ្មាន (None)';
  };
  hourly: {
    time: string;
    temp: number;
    precipitationProbability: number;
    rainAmount: number;
  }[];
  daily: {
    date: string;
    dayNameKhmer: string;
    tempMax: number;
    tempMin: number;
    rainProbMax: number;
    weatherCode: number;
  }[];
  lastUpdated: string;
}

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  alertGoldPriceHigh: number;
  alertGoldPriceLow: number;
  alertRain: boolean;
  alertDailyReport: boolean;
  lastSentAlert?: string;
  lastDailyReportDate?: string;
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  type: 'gold' | 'fuel' | 'currency' | 'weather' | 'system';
  titleKhmer: string;
  messageKhmer: string;
  severity: 'info' | 'warning' | 'alert' | 'success';
  read: boolean;
}

export interface CambodiaDailySyncMetadata {
  lastSyncDate: string; // YYYY-MM-DD in Cambodia time (ICT UTC+7)
  lastSyncTimeKhmer: string;
  cambodiaDateFormatted: string; // e.g. ថ្ងៃអង្គារ ទី២០ ខែតុលា ឆ្នាំ២០២៦
  isDailySyncedToday: boolean;
  dailyAutoSyncEnabled: boolean;
  scheduleSlots: {
    id: string;
    time: string;
    labelKhmer: string;
    descriptionKhmer: string;
    passed: boolean;
    isNext: boolean;
  }[];
  standardSources: {
    name: string;
    abbr: string;
    authority: string;
    frequency: string;
    status: 'សកម្ម' | 'ទាន់សម័យ';
  }[];
}
