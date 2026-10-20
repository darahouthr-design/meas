import { WeatherData } from '../types/market';

export interface CityPreset {
  nameKhmer: string;
  nameEng: string;
  lat: number;
  lon: number;
}

export const CAMBODIA_CITIES: CityPreset[] = [
  { nameKhmer: 'រាជធានីភ្នំពេញ (Phnom Penh)', nameEng: 'Phnom Penh', lat: 11.5564, lon: 104.9282 },
  { nameKhmer: 'សៀមរាប (Siem Reap)', nameEng: 'Siem Reap', lat: 13.3671, lon: 103.8448 },
  { nameKhmer: 'បាត់ដំបង (Battambang)', nameEng: 'Battambang', lat: 13.0957, lon: 103.2022 },
  { nameKhmer: 'ព្រះសីហនុ (Sihanoukville)', nameEng: 'Sihanoukville', lat: 10.6275, lon: 103.5221 },
  { nameKhmer: 'កំពត (Kampot)', nameEng: 'Kampot', lat: 10.6104, lon: 104.1818 },
  { nameKhmer: 'កណ្តាល (Kandal)', nameEng: 'Kandal', lat: 11.4587, lon: 105.0089 },
  { nameKhmer: 'សេអ៊ូល (Seoul, Korea)', nameEng: 'Seoul, Korea', lat: 37.5665, lon: 126.9780 },
];

export function getWeatherConditionKhmer(code: number): { text: string; icon: string } {
  switch (code) {
    case 0:
      return { text: 'មេឃស្រឡះល្អ (Sunny / Clear)', icon: 'Sun' };
    case 1:
      return { text: 'មេឃស្រឡះខ្លះ (Mainly Clear)', icon: 'SunMedium' };
    case 2:
      return { text: 'មានពពកខ្លះៗ (Partly Cloudy)', icon: 'CloudSun' };
    case 3:
      return { text: 'មានពពកច្រើន (Overcast)', icon: 'Cloud' };
    case 45:
    case 48:
      return { text: 'មានអ័ព្ទចុះត្រជាក់ (Fog)', icon: 'CloudFog' };
    case 51:
    case 53:
    case 55:
      return { text: 'ភ្លៀងរលឹមស្រាល (Light Drizzle)', icon: 'CloudDrizzle' };
    case 61:
      return { text: 'ភ្លៀងធ្លាក់កម្រិតស្រាល (Slight Rain)', icon: 'CloudRain' };
    case 63:
      return { text: 'ភ្លៀងធ្លាក់កម្រិតមធ្យម (Moderate Rain)', icon: 'CloudRain' };
    case 65:
      return { text: 'ភ្លៀងធ្លាក់ខ្លាំង (Heavy Rain)', icon: 'CloudRain' };
    case 80:
    case 81:
    case 82:
      return { text: 'ភ្លៀងកក់ខែ/ខ្យល់កន្ត្រាក់ (Rain Showers)', icon: 'CloudRainWind' };
    case 95:
    case 96:
    case 99:
      return { text: 'មានផ្គររន្ទះ និងភ្លៀង (Thunderstorm)', icon: 'CloudLightning' };
    default:
      return { text: 'អាកាសធាតុធម្មតា (Fair)', icon: 'Sun' };
  }
}

export async function fetchWeatherData(lat: number, lon: number, cityName: string = 'រាជធានីភ្នំពេញ', isGps: boolean = false): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation,rain,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`;
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }
    const data = await res.json();

    const current = data.current || {};
    const hourly = data.hourly || { time: [], precipitation_probability: [], precipitation: [], temperature_2m: [] };
    const daily = data.daily || { time: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_probability_max: [], weather_code: [] };

    const currentProb = (hourly.precipitation_probability && hourly.precipitation_probability[0]) || 0;
    const isRainingNow = (current.rain > 0.1 || current.precipitation > 0.1 || [51,53,55,61,63,65,80,81,82,95].includes(current.weather_code));

    // Inspect next 6 hours for Rain Alert
    let willRainSoon = false;
    let hoursUntilRain = 0;
    let expectedRainTime = '';
    let peakProb = currentProb;
    let rainIntensity: 'ស្រាល (Light)' | 'មធ្យម (Moderate)' | 'ខ្លាំង (Heavy)' | 'គ្មាន (None)' = 'គ្មាន (None)';

    // Find current hour index
    const nowIso = new Date().toISOString().slice(0, 13);
    const startIdx = hourly.time.findIndex((t: string) => t.startsWith(nowIso)) >= 0 
      ? hourly.time.findIndex((t: string) => t.startsWith(nowIso)) 
      : 0;

    for (let i = startIdx; i < Math.min(startIdx + 6, hourly.time.length); i++) {
      const prob = hourly.precipitation_probability[i] || 0;
      const amount = hourly.precipitation[i] || 0;
      if (prob > peakProb) peakProb = prob;

      if ((prob >= 40 || amount >= 0.5) && !willRainSoon) {
        willRainSoon = true;
        hoursUntilRain = Math.max(1, i - startIdx);
        const dateObj = new Date(hourly.time[i]);
        expectedRainTime = dateObj.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', hour12: true });
        
        if (amount > 4 || prob >= 80) {
          rainIntensity = 'ខ្លាំង (Heavy)';
        } else if (amount > 1.5 || prob >= 60) {
          rainIntensity = 'មធ្យម (Moderate)';
        } else {
          rainIntensity = 'ស្រាល (Light)';
        }
      }
    }

    // Format hourly 24h
    const formattedHourly = [];
    const limit = Math.min(startIdx + 24, hourly.time.length);
    for (let i = startIdx; i < limit; i++) {
      const d = new Date(hourly.time[i]);
      formattedHourly.push({
        time: d.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', hour12: true }),
        temp: Math.round(hourly.temperature_2m[i] || 30),
        precipitationProbability: hourly.precipitation_probability[i] || 0,
        rainAmount: hourly.precipitation[i] || 0,
      });
    }

    // Format daily 7 days
    const formattedDaily = [];
    const khmerDays = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
    for (let i = 0; i < daily.time.length; i++) {
      const d = new Date(daily.time[i]);
      const dayIdx = d.getDay();
      formattedDaily.push({
        date: daily.time[i],
        dayNameKhmer: i === 0 ? 'ថ្ងៃនេះ' : khmerDays[dayIdx],
        tempMax: Math.round(daily.temperature_2m_max[i] || 33),
        tempMin: Math.round(daily.temperature_2m_min[i] || 24),
        rainProbMax: daily.precipitation_probability_max[i] || 0,
        weatherCode: daily.weather_code[i] || 0,
      });
    }

    return {
      city: cityName,
      country: cityName.includes('Seoul') ? 'កូរ៉េខាងត្បូង' : 'កម្ពុជា',
      latitude: lat,
      longitude: lon,
      isGps,
      temperature: Math.round(current.temperature_2m || 31),
      apparentTemperature: Math.round(current.apparent_temperature || 34),
      humidity: Math.round(current.relative_humidity_2m || 70),
      windSpeed: Math.round(current.wind_speed_10m || 12),
      weatherCode: current.weather_code || 0,
      conditionTextKhmer: getWeatherConditionKhmer(current.weather_code || 0).text,
      isRainingNow,
      rainProbabilityNextHour: currentProb,
      upcomingRainAlert: {
        willRainSoon,
        hoursUntilRain,
        expectedRainTime: expectedRainTime || 'ក្នុងពេលឆាប់ៗ',
        probability: peakProb,
        intensity: rainIntensity,
      },
      hourly: formattedHourly,
      daily: formattedDaily,
      lastUpdated: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
    };
  } catch {
    // Return resilient fallback data if network issues occur
    return getFallbackWeatherData(cityName, lat, lon, isGps);
  }
}

export function getFallbackWeatherData(cityName: string, lat: number, lon: number, isGps: boolean): WeatherData {
  return {
    city: cityName,
    country: 'កម្ពុជា',
    latitude: lat,
    longitude: lon,
    isGps,
    temperature: 32,
    apparentTemperature: 36,
    humidity: 74,
    windSpeed: 14,
    weatherCode: 2,
    conditionTextKhmer: 'មានពពកខ្លះៗ (Partly Cloudy)',
    isRainingNow: false,
    rainProbabilityNextHour: 25,
    upcomingRainAlert: {
      willRainSoon: true,
      hoursUntilRain: 2,
      expectedRainTime: 'ម៉ោង 03:30 រសៀល',
      probability: 65,
      intensity: 'មធ្យម (Moderate)',
    },
    hourly: [
      { time: '12:00 PM', temp: 33, precipitationProbability: 15, rainAmount: 0 },
      { time: '01:00 PM', temp: 34, precipitationProbability: 25, rainAmount: 0 },
      { time: '02:00 PM', temp: 33, precipitationProbability: 40, rainAmount: 0.2 },
      { time: '03:00 PM', temp: 31, precipitationProbability: 65, rainAmount: 1.8 },
      { time: '04:00 PM', temp: 29, precipitationProbability: 75, rainAmount: 3.5 },
      { time: '05:00 PM', temp: 28, precipitationProbability: 50, rainAmount: 1.1 },
      { time: '06:00 PM', temp: 28, precipitationProbability: 20, rainAmount: 0 },
      { time: '07:00 PM', temp: 27, precipitationProbability: 10, rainAmount: 0 },
    ],
    daily: [
      { date: '2026-10-20', dayNameKhmer: 'ថ្ងៃនេះ', tempMax: 33, tempMin: 25, rainProbMax: 65, weatherCode: 61 },
      { date: '2026-10-21', dayNameKhmer: 'ពុធ', tempMax: 34, tempMin: 25, rainProbMax: 40, weatherCode: 2 },
      { date: '2026-10-22', dayNameKhmer: 'ព្រហស្បតិ៍', tempMax: 32, tempMin: 24, rainProbMax: 70, weatherCode: 63 },
      { date: '2026-10-23', dayNameKhmer: 'សុក្រ', tempMax: 33, tempMin: 25, rainProbMax: 50, weatherCode: 80 },
      { date: '2026-10-24', dayNameKhmer: 'សៅរ៍', tempMax: 34, tempMin: 26, rainProbMax: 30, weatherCode: 1 },
      { date: '2026-10-25', dayNameKhmer: 'អាទិត្យ', tempMax: 33, tempMin: 25, rainProbMax: 45, weatherCode: 61 },
      { date: '2026-10-26', dayNameKhmer: 'ច័ន្ទ', tempMax: 34, tempMin: 25, rainProbMax: 20, weatherCode: 0 },
    ],
    lastUpdated: new Date().toLocaleTimeString('km-KH'),
  };
}
