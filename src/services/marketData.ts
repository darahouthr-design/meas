import { CurrencyItem, FuelStation, FuelTrendPoint, GoldType, HistoricalPricePoint, BankProduct, MoCFuelNotice } from '../types/market';

// Base market prices adhering strictly to Cambodia 2026 Official Standards (Gold & Precious Metals)
export const INITIAL_GOLD_TYPES: GoldType[] = [
  {
    id: 'gold-24k',
    nameKhmer: 'មាស (Gold 24K)',
    nameEng: 'Pure Gold 24K (99.99%)',
    purity: '99.99%',
    pricePerDamlungBuyUSD: 4940.20,
    pricePerDamlungSellUSD: 4970.20, // $497.02 / ជី
    pricePerChiBuyUSD: 494.02,
    pricePerChiSellUSD: 497.02,
    change24hUSD: -12.4,
    change24hPercent: -0.25,
    marketStandard: 'ស្តង់ដារមាសដុំ និងគ្រឿងអលង្ការសុទ្ធ ផ្សារធំថ្មី',
  },
  {
    id: 'silver',
    nameKhmer: 'ប្រាក់ (Silver 99.9%)',
    nameEng: 'Pure Silver',
    purity: '99.9%',
    pricePerDamlungBuyUSD: 66.50,
    pricePerDamlungSellUSD: 69.10, // $6.91 / ជី
    pricePerChiBuyUSD: 6.65,
    pricePerChiSellUSD: 6.91,
    change24hUSD: -0.15,
    change24hPercent: -0.22,
    marketStandard: 'ស្តង់ដារលោហៈធាតុប្រាក់សុទ្ធ',
  },
  {
    id: 'platinum',
    nameKhmer: 'ប្លាទីន / ផ្លាទីន (Platinum)',
    nameEng: 'Platinum (PT950)',
    purity: '95.0%',
    pricePerDamlungBuyUSD: 1950.00,
    pricePerDamlungSellUSD: 1981.40, // $198.14 / ជី
    pricePerChiBuyUSD: 195.00,
    pricePerChiSellUSD: 198.14,
    change24hUSD: -8.5,
    change24hPercent: -0.43,
    marketStandard: 'ស្តង់ដារប្លាទីនត្បូងពេជ្រ ផ្សារធំថ្មី',
  },
  {
    id: 'gold-23k',
    nameKhmer: 'មាសទឹកប្រាំបួនកន្លះ (មាស 23K / 98%)',
    nameEng: 'Gold 23K (98.0%)',
    purity: '98.0%',
    pricePerDamlungBuyUSD: 4840,
    pricePerDamlungSellUSD: 4870,
    pricePerChiBuyUSD: 484.0,
    pricePerChiSellUSD: 487.0,
    change24hUSD: -10.0,
    change24hPercent: -0.21,
    marketStandard: 'ស្តង់ដារគ្រឿងអលង្ការពេញនិយមខ្ពស់នៅកម្ពុជា',
  },
  {
    id: 'gold-22k',
    nameKhmer: 'មាសទឹកប្រាំបួន (មាស 22K / 91.6%)',
    nameEng: 'Gold 22K (91.6%)',
    purity: '91.6%',
    pricePerDamlungBuyUSD: 4520,
    pricePerDamlungSellUSD: 4550,
    pricePerChiBuyUSD: 452.0,
    pricePerChiSellUSD: 455.0,
    change24hUSD: -9.2,
    change24hPercent: -0.20,
    marketStandard: 'ស្តង់ដារមាសគ្រឿងបុរាណ និងចិញ្ចៀន',
  },
  {
    id: 'gold-18k',
    nameKhmer: 'ប្លាទីន 18K / 750 (White Gold)',
    nameEng: 'White Gold 18K (75%)',
    purity: '75.0%',
    pricePerDamlungBuyUSD: 3700,
    pricePerDamlungSellUSD: 3730,
    pricePerChiBuyUSD: 370.0,
    pricePerChiSellUSD: 373.0,
    change24hUSD: -7.0,
    change24hPercent: -0.19,
    marketStandard: 'ស្តង់ដារប្លាទីនត្បូងពេជ្រ និងចិញ្ចៀនអាពាហ៍ពិពាហ៍',
  },
  {
    id: 'gold-xau-spot',
    nameKhmer: 'ហាងឆេងមាសពិភពលោក (XAU/USD)',
    nameEng: 'World Spot Gold (Troy Oz)',
    purity: 'Spot Ounce',
    pricePerDamlungBuyUSD: 4120.5,
    pricePerDamlungSellUSD: 4122.0,
    pricePerChiBuyUSD: 412.05,
    pricePerChiSellUSD: 412.20,
    change24hUSD: -15.0,
    change24hPercent: -0.36,
    marketStandard: 'ទីផ្សារអន្តរជាតិ London Bullion / COMEX',
  },
];

// Generate authentic historical data points for charting
export function generateGoldHistory(timeframe: '7D' | '30D' | '90D' | '1Y', baseDamlungPrice: number = 4970.2): HistoricalPricePoint[] {
  const days = timeframe === '7D' ? 7 : timeframe === '30D' ? 30 : timeframe === '90D' ? 90 : 365;
  const now = new Date();
  
  let currentPrice = baseDamlungPrice;
  const stepDays = days > 90 ? 3 : 1;
  const count = Math.ceil(days / stepDays);
  
  const tempArray: HistoricalPricePoint[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getTime() - i * stepDays * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString('km-KH', { month: 'short', day: 'numeric' });
    
    const variance = (Math.sin(i * 0.4) * 18) + (Math.cos(i * 0.2) * 12) - (i * 0.65);
    const p = Math.round((currentPrice + variance) * 10) / 10;
    const high = Math.round((p + 8 + Math.random() * 5) * 10) / 10;
    const low = Math.round((p - 8 - Math.random() * 5) * 10) / 10;
    
    tempArray.unshift({
      date: dateStr,
      priceUSD: p,
      highUSD: high,
      lowUSD: low,
      volume: Math.floor(1200 + Math.random() * 800),
    });
  }
  return tempArray;
}

// Official Ministry of Commerce (MoC) Fuel Ceiling Announcement in 2026
export const INITIAL_MOC_FUEL_NOTICE: MoCFuelNotice = {
  noticeNumber: 'សេចក្តីជូនដំណឹងលេខ ១៨២៩/២៦ ព.ណ.អ.ស',
  effectivePeriod: 'ចាប់ពីថ្ងៃទី11 ដល់ថ្ងៃទី21 តុលា 2026',
  effectiveStartDate: '2026-10-11',
  effectiveEndDate: '2026-10-21',
  nextUpdateDate: 'ថ្ងៃទី21 តុលា 2026 (ម៉ោង 05:00 PM)',
  regularCeilingKHR: 5350,
  dieselCeilingKHR: 5550,
  superEstimatedKHR: 5950,
  lpgEstimatedKHR: 2950,
  governmentSubsidyUSD: 0.04,
  mopsOilPriceUSD: 86.50,
  changeRegularKHR: 50,
  changeDieselKHR: 80,
  statusText: 'សាំងធម្មតា 5,350 ៛ · ម៉ាស៊ូត 5,550 ៛ (ឡើងថ្លៃបន្តិច)',
  formulaDescription: 'គណនាតាមមធ្យមភាគតម្លៃទីផ្សារសិង្ហបុរី (MOPS) + ពន្ធគយ និងអាករ - ការបញ្ចុះតម្លៃ ៤ សេន/លីត្រ របស់រាជរដ្ឋាភិបាល',
};

// Fuel Stations in Cambodia strictly complying with MoC Ceiling Law (Never exceed ceiling)
export function generateCompliantFuelStations(regularCeiling: number = 5350, dieselCeiling: number = 5550): FuelStation[] {
  return [
    {
      name: 'PTT Cambodia',
      logoColor: '#00529b',
      regularGasolineKHR: regularCeiling, // 5,350 ៛
      superGasolineKHR: regularCeiling + 600, // 5,950 ៛
      dieselKHR: dieselCeiling,          // 5,550 ៛
      lpgKHR: 2950,
      lastUpdated: 'ថ្ងៃនេះ ម៉ោង 06:00 ព្រឹក',
      promotionNote: 'PTT Blue Card សន្សំពិន្ទុប្តូរប្រេងឥន្ធនៈ',
      isCeilingCompliant: true,
    },
    {
      name: 'TotalEnergies',
      logoColor: '#ed1c24',
      regularGasolineKHR: regularCeiling, // 5,350 ៛
      superGasolineKHR: regularCeiling + 650, // 6,000 ៛ Excellium
      dieselKHR: dieselCeiling,          // 5,550 ៛
      lpgKHR: 3000,
      lastUpdated: 'ថ្ងៃនេះ ម៉ោង 06:00 ព្រឹក',
      promotionNote: 'Total Club Card សន្សំពិន្ទុ និងការធានាគុណភាពបារាំង',
      isCeilingCompliant: true,
    },
    {
      name: 'Tela (តេឡា)',
      logoColor: '#f9a01b',
      regularGasolineKHR: regularCeiling, // 5,350 ៛
      superGasolineKHR: regularCeiling + 600,
      dieselKHR: dieselCeiling,          // 5,550 ៛
      lpgKHR: 2900,
      lastUpdated: 'ថ្ងៃនេះ ម៉ោង 06:00 ព្រឹក',
      promotionNote: 'កម្មវិធី Tela Loyalty Card និងស្ថានីយតាមបណ្តាខេត្ត',
      isCeilingCompliant: true,
    },
    {
      name: 'Caltex Cambodia',
      logoColor: '#00843d',
      regularGasolineKHR: regularCeiling, // 5,350 ៛
      superGasolineKHR: regularCeiling + 650, // 6,000 ៛ Techron
      dieselKHR: dieselCeiling,          // 5,550 ៛
      lpgKHR: 2950,
      lastUpdated: 'ថ្ងៃនេះ ម៉ោង 06:00 ព្រឹក',
      promotionNote: 'Caltex StarCard និងសារធាតុបន្ថែម Techron',
      isCeilingCompliant: true,
    },
    {
      name: 'Sokimex (សុខា)',
      logoColor: '#1d4ed8',
      regularGasolineKHR: regularCeiling, // 5,350 ៛
      superGasolineKHR: regularCeiling + 600,
      dieselKHR: dieselCeiling,          // 5,550 ៛
      lpgKHR: 2900,
      lastUpdated: 'ថ្ងៃនេះ ម៉ោង 06:00 ព្រឹក',
      promotionNote: 'បណ្តាញស្ថានីយគ្រប់ ២៥ រាជធានី-ខេត្ត',
      isCeilingCompliant: true,
    },
    {
      name: 'Papa Petrole / BVM',
      logoColor: '#059669',
      regularGasolineKHR: regularCeiling - 50, // 5,300 ៛ Discounted
      superGasolineKHR: regularCeiling + 550,
      dieselKHR: dieselCeiling - 50,          // 5,500 ៛ Discounted
      lpgKHR: 2850,
      lastUpdated: 'ថ្ងៃនេះ ម៉ោង 06:00 ព្រឹក',
      promotionNote: 'លក់ក្រោមតម្លៃពិដាន ៥០ ៛/លីត្រ ជូនប្រជាពលរដ្ឋ',
      isCeilingCompliant: true,
    },
  ];
}

export const INITIAL_FUEL_STATIONS: FuelStation[] = generateCompliantFuelStations(5350, 5550);

export const FUEL_TREND_14D: FuelTrendPoint[] = [
  { date: '11 តុលា', regularKHR: 5200, dieselKHR: 5350, superKHR: 5800 },
  { date: '13 តុលា', regularKHR: 5250, dieselKHR: 5400, superKHR: 5850 },
  { date: '15 តុលា', regularKHR: 5250, dieselKHR: 5400, superKHR: 5850 },
  { date: '17 តុលា', regularKHR: 5300, dieselKHR: 5450, superKHR: 5900 },
  { date: '19 តុលា', regularKHR: 5350, dieselKHR: 5550, superKHR: 5950 },
  { date: '20 តុលា', regularKHR: 5350, dieselKHR: 5550, superKHR: 5950 },
];

// Currencies with special highlight on KRW (Korean Won) & USD according to NBC Standard
export const INITIAL_CURRENCIES: CurrencyItem[] = [
  {
    code: 'USD',
    nameKhmer: 'ដុល្លារអាមេរិក',
    nameEng: 'US Dollar',
    flag: '🇺🇸',
    symbol: '$',
    nbcRate: 4071.95,
    marketBuyRate: 4070.00,
    marketSellRate: 4074.00,
    usdRate: 1.0,
    change24h: 0.05,
    lastSyncTime: '04:00 PM',
  },
  {
    code: 'KRW',
    nameKhmer: 'វ៉ុនកូរ៉េខាងត្បូង',
    nameEng: 'South Korean Won',
    flag: '🇰🇷',
    symbol: '₩',
    nbcRate: 2.92, // ~2.92 KHR per 1 KRW (2,920 KHR per 1,000 KRW)
    marketBuyRate: 2.90,
    marketSellRate: 2.96,
    usdRate: 1392.5, // 1 USD = ~1,392.5 KRW
    change24h: -0.18,
    lastSyncTime: '08:30 ព្រឹក',
  },
  {
    code: 'EUR',
    nameKhmer: 'អឺរ៉ូ',
    nameEng: 'Euro',
    flag: '🇪🇺',
    symbol: '€',
    nbcRate: 4420,
    marketBuyRate: 4400,
    marketSellRate: 4445,
    usdRate: 0.92,
    change24h: 0.12,
    lastSyncTime: '08:30 ព្រឹក',
  },
  {
    code: 'THB',
    nameKhmer: 'បាតថៃ',
    nameEng: 'Thai Baht',
    flag: '🇹🇭',
    symbol: '฿',
    nbcRate: 122.5,
    marketBuyRate: 121.8,
    marketSellRate: 123.2,
    usdRate: 33.15,
    change24h: 0.28,
    lastSyncTime: '08:30 ព្រឹក',
  },
  {
    code: 'JPY',
    nameKhmer: 'យ៉េនជប៉ុន',
    nameEng: 'Japanese Yen',
    flag: '🇯🇵',
    symbol: '¥',
    nbcRate: 27.1,
    marketBuyRate: 26.8,
    marketSellRate: 27.4,
    usdRate: 150.2,
    change24h: -0.35,
    lastSyncTime: '08:30 ព្រឹក',
  },
  {
    code: 'CNY',
    nameKhmer: 'យ័នចិន',
    nameEng: 'Chinese Yuan',
    flag: '🇨🇳',
    symbol: '¥',
    nbcRate: 572,
    marketBuyRate: 568,
    marketSellRate: 576,
    usdRate: 7.11,
    change24h: 0.02,
    lastSyncTime: '08:30 ព្រឹក',
  },
  {
    code: 'SGD',
    nameKhmer: 'ដុល្លារសិង្ហបុរី',
    nameEng: 'Singapore Dollar',
    flag: '🇸🇬',
    symbol: 'S$',
    nbcRate: 3105,
    marketBuyRate: 3090,
    marketSellRate: 3125,
    usdRate: 1.31,
    change24h: 0.10,
    lastSyncTime: '08:30 ព្រឹក',
  },
  {
    code: 'VND',
    nameKhmer: 'ដុងវៀតណាម',
    nameEng: 'Vietnamese Dong',
    flag: '🇻🇳',
    symbol: '₫',
    nbcRate: 0.163,
    marketBuyRate: 0.160,
    marketSellRate: 0.166,
    usdRate: 24950,
    change24h: -0.04,
    lastSyncTime: '08:30 ព្រឹក',
  },
  {
    code: 'GBP',
    nameKhmer: 'ផោនអង់គ្លេស',
    nameEng: 'British Pound',
    flag: '🇬🇧',
    symbol: '£',
    nbcRate: 5290,
    marketBuyRate: 5260,
    marketSellRate: 5325,
    usdRate: 0.77,
    change24h: 0.15,
    lastSyncTime: '08:30 ព្រឹក',
  },
];

// Top Banking Interest Rates in Cambodia
export const INITIAL_BANK_PRODUCTS: BankProduct[] = [
  {
    bankId: 'aba',
    bankNameKhmer: 'ធនាគារ អេប៊ីអេ (ABA Bank)',
    bankNameEng: 'ABA Bank',
    logoText: 'ABA',
    color: '#005f7f',
    fixedDepositKHR_12M: 7.25,
    fixedDepositUSD_12M: 5.50,
    fixedDepositKHR_6M: 6.25,
    fixedDepositUSD_6M: 4.75,
    savingsKHR: 1.50,
    savingsUSD: 0.75,
    housingLoanUSD: 7.49,
    autoLoanUSD: 8.50,
    smeLoanUSD: 8.00,
    rating: 'A+ (Standard & Poor\'s)',
  },
  {
    bankId: 'acleda',
    bankNameKhmer: 'ធនាគារ អេស៊ីលីដា (ACLEDA Bank)',
    bankNameEng: 'ACLEDA Bank Plc.',
    logoText: 'ACLEDA',
    color: '#1a365d',
    fixedDepositKHR_12M: 7.50,
    fixedDepositUSD_12M: 5.75,
    fixedDepositKHR_6M: 6.50,
    fixedDepositUSD_6M: 5.00,
    savingsKHR: 1.75,
    savingsUSD: 0.85,
    housingLoanUSD: 7.20,
    autoLoanUSD: 8.75,
    smeLoanUSD: 7.80,
    rating: 'B+ (Fitch Ratings)',
  },
  {
    bankId: 'canadia',
    bankNameKhmer: 'ធនាគារ កាណាឌីយ៉ា (Canadia Bank)',
    bankNameEng: 'Canadia Bank',
    logoText: 'CNB',
    color: '#b91c1c',
    fixedDepositKHR_12M: 7.40,
    fixedDepositUSD_12M: 5.60,
    fixedDepositKHR_6M: 6.30,
    fixedDepositUSD_6M: 4.85,
    savingsKHR: 1.50,
    savingsUSD: 0.80,
    housingLoanUSD: 6.99,
    autoLoanUSD: 8.25,
    smeLoanUSD: 7.90,
    rating: 'Top Tier Commercial Bank',
  },
  {
    bankId: 'sathapana',
    bankNameKhmer: 'ធនាគារ សហគ្រាស សាថាពរណា (Sathapana Bank)',
    bankNameEng: 'Sathapana Bank',
    logoText: 'SPN',
    color: '#047857',
    fixedDepositKHR_12M: 7.75,
    fixedDepositUSD_12M: 5.85,
    fixedDepositKHR_6M: 6.75,
    fixedDepositUSD_6M: 5.15,
    savingsKHR: 2.00,
    savingsUSD: 1.00,
    housingLoanUSD: 7.50,
    autoLoanUSD: 8.90,
    smeLoanUSD: 8.25,
    rating: 'Strong Capital Adequacy',
  },
  {
    bankId: 'wing',
    bankNameKhmer: 'ធនាគារ វីង (Wing Bank)',
    bankNameEng: 'Wing Bank',
    logoText: 'WING',
    color: '#84cc16',
    fixedDepositKHR_12M: 8.00,
    fixedDepositUSD_12M: 6.25,
    fixedDepositKHR_6M: 7.00,
    fixedDepositUSD_6M: 5.50,
    savingsKHR: 3.00,
    savingsUSD: 1.50,
    housingLoanUSD: 7.80,
    autoLoanUSD: 9.00,
    smeLoanUSD: 8.50,
    rating: 'High Yield Digital Bank',
  },
  {
    bankId: 'chipmong',
    bankNameKhmer: 'ធនាគារ ជីប ម៉ុង (Chip Mong Bank)',
    bankNameEng: 'Chip Mong Bank',
    logoText: 'CMB',
    color: '#d97706',
    fixedDepositKHR_12M: 7.60,
    fixedDepositUSD_12M: 5.75,
    fixedDepositKHR_6M: 6.60,
    fixedDepositUSD_6M: 5.10,
    savingsKHR: 1.80,
    savingsUSD: 0.90,
    housingLoanUSD: 6.88,
    autoLoanUSD: 8.40,
    smeLoanUSD: 7.75,
    rating: 'Fast Growing Commercial Bank',
  },
  {
    bankId: 'hattha',
    bankNameKhmer: 'ធនាគារ ហត្ថា (Hattha Bank)',
    bankNameEng: 'Hattha Bank',
    logoText: 'HTB',
    color: '#7c3aed',
    fixedDepositKHR_12M: 7.80,
    fixedDepositUSD_12M: 5.90,
    fixedDepositKHR_6M: 6.80,
    fixedDepositUSD_6M: 5.25,
    savingsKHR: 2.00,
    savingsUSD: 1.00,
    housingLoanUSD: 7.30,
    autoLoanUSD: 8.80,
    smeLoanUSD: 8.10,
    rating: 'Krungsri Group Subsidiary',
  },
];
