import React, { useState } from 'react';
import { WeatherData } from '../types/market';
import { CAMBODIA_CITIES, CityPreset } from '../services/weatherService';
import {
  CloudRain,
  MapPin,
  Compass,
  Wind,
  Droplets,
  Thermometer,
  Sun,
  CloudSun,
  CloudLightning,
  AlertTriangle,
  Volume2,
  RefreshCw,
  Send,
  Umbrella,
} from 'lucide-react';
import { audioAlert } from '../utils/audioAlert';
import { motion } from 'motion/react';

interface WeatherTrackerProps {
  weatherData: WeatherData | null;
  isLoading: boolean;
  onRefreshWeather: () => void;
  onCitySelect: (city: CityPreset) => void;
  onGpsLocate: () => void;
  onSendRainTelegramAlert: () => void;
}

export const WeatherTracker: React.FC<WeatherTrackerProps> = ({
  weatherData,
  isLoading,
  onRefreshWeather,
  onCitySelect,
  onGpsLocate,
  onSendRainTelegramAlert,
}) => {
  const [testTonePlayed, setTestTonePlayed] = useState(false);

  const handleTestAudioChime = () => {
    audioAlert.playRainAlertTone();
    setTestTonePlayed(true);
    setTimeout(() => setTestTonePlayed(false), 2000);
  };

  if (!weatherData && isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-3" />
        <p>កំពុងទាញយកទិន្នន័យអាកាសធាតុ និងរ៉ាដាទឹកភ្លៀង...</p>
      </div>
    );
  }

  if (!weatherData) return null;

  const { upcomingRainAlert } = weatherData;

  return (
    <div className="space-y-6">
      {/* Top Banner with GPS Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-medium tracking-wide">
            <span>ប្រព័ន្ធរ៉ាដា និងព្យាករណ៍អាកាសធាតុ Open-Meteo</span>
            <span aria-hidden="true">·</span>
            <span>ធ្វើបច្ចុប្បន្នភាព: {weatherData.lastUpdated}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1 flex items-center gap-2">
            <span>ព្យាករណ៍អាកាសធាតុ & ការជូនដំណឹងភ្លៀងធ្លាក់</span>
          </h1>
        </div>

        {/* Location selector & GPS Locator Button */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onGpsLocate}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              weatherData.isGps
                ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="ចាប់យកទីតាំងតាមប្រព័ន្ធ GPS ទូរស័ព្ទ ឬកុំព្យូទ័ររបស់អ្នក"
          >
            <Compass className={`w-3.5 h-3.5 text-sky-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{weatherData.isGps ? 'GPS ទីតាំងបច្ចុប្បន្ន' : 'ចាប់យកទីតាំងតាម GPS'}</span>
          </button>

          {/* Quick city dropdown */}
          <select
            value={weatherData.city}
            onChange={(e) => {
              const selected = CAMBODIA_CITIES.find((c) => c.nameKhmer === e.target.value);
              if (selected) onCitySelect(selected);
            }}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            {CAMBODIA_CITIES.map((c) => (
              <option key={c.nameKhmer} value={c.nameKhmer}>
                📍 {c.nameKhmer}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RAIN ALERT HERO BANNER (Crucial User Requirement: ជូនដំណឹងមុនពេលភ្លៀងធ្លាក់) */}
      {upcomingRainAlert.willRainSoon ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-500/50 rounded-2xl p-5 shadow-lg shadow-sky-950/50"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-sky-500/20 text-sky-400 rounded-xl shrink-0 border border-sky-400/30">
                <CloudRain className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400 font-mono">
                    ⚠️ ជូនដំណឹងមុនពេលភ្លៀងធ្លាក់ (Rain Forecast Alert)
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold font-mono">
                    ប្រូបាប៊ីលីតេ {upcomingRainAlert.probability}%
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                  អាចមានភ្លៀងធ្លាក់នៅម៉ោង {upcomingRainAlert.expectedRainTime} ({weatherData.city})
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  កម្រិតទឹកភ្លៀងត្រូវបានព្យាករណ៍: <span className="text-sky-300 font-semibold">{upcomingRainAlert.intensity}</span>។
                  សូមត្រៀមឆ័ត្រ អាវភ្លៀង ឬរៀបចំទុកដាក់សម្ភារៈ និងប្រុងប្រយ័ត្នពេលធ្វើដំណើរតាមដងផ្លូវ។
                </p>
              </div>
            </div>

            {/* Alert Action buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                onClick={handleTestAudioChime}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                title="សាកល្បងសំឡេងប្រកាសអាសន្ន"
              >
                <Volume2 className="w-4 h-4 text-sky-400" />
                <span>{testTonePlayed ? 'កំពុងបន្លឺសំឡេង...' : 'សាកល្បងសំឡេង'}</span>
              </button>

              <button
                onClick={onSendRainTelegramAlert}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors"
                title="ផ្ញើដំណឹងនេះទៅ Telegram Bot ភ្លាមៗ"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ផ្ញើទៅ Telegram</span>
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-400">ស្ថានភាពអាកាសធាតុស្ងួតល្អ</div>
              <div className="text-sm text-slate-300">
                មិនមានសញ្ញាធ្លាក់ភ្លៀងក្នុងរយៈពេល ៣-៦ ម៉ោងបន្ទាប់នៅ {weatherData.city} ទេ។
              </div>
            </div>
          </div>
          <button
            onClick={handleTestAudioChime}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg"
          >
            សាកល្បងសំឡេងរោទិ៍
          </button>
        </div>
      )}

      {/* Current Conditions Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Temperature */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>សីតុណ្ហភាព</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-white mt-2">
            {weatherData.temperature}°C
          </div>
          <div className="text-xs text-slate-400 mt-1">
            មានអារម្មណ៍ដូច {weatherData.apparentTemperature}°C
          </div>
        </div>

        {/* Rain Probability Now */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ឱកាសភ្លៀង</span>
            <CloudRain className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-sky-400 mt-2">
            {weatherData.rainProbabilityNextHour}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {weatherData.isRainingNow ? '🌧️ កំពុងមានភ្លៀង' : 'មិនទាន់មានភ្លៀងទេ'}
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>សំណើមបរិយាកាស</span>
            <Droplets className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-white mt-2">
            {weatherData.humidity}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            កម្រិតសំណើមធៀប
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ល្បឿនខ្យល់</span>
            <Wind className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-white mt-2">
            {weatherData.windSpeed} <span className="text-sm font-normal">km/h</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate">
            {weatherData.conditionTextKhmer}
          </div>
        </div>
      </div>

      {/* Hourly Rain Probability Forecast (24 Hours Timeline) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base">
              រ៉ាដាប្រូបាប៊ីលីតេធ្លាក់ភ្លៀង ២៤ ម៉ោងខាងមុខ (Precipitation Probability)
            </h3>
            <div className="text-xs text-slate-400">
              តាមដានរៀងរាល់ម៉ោង ដើម្បីដឹងច្បាស់ពីពេលវេលាភ្លៀងធ្លាក់
            </div>
          </div>
        </div>

        {/* 24h Scrollable Bar Strip */}
        <div className="flex items-end gap-2 overflow-x-auto pb-3 pt-6 no-scrollbar">
          {weatherData.hourly.map((hour, idx) => {
            const prob = hour.precipitationProbability;
            const isHighRain = prob >= 50;

            return (
              <div
                key={idx}
                className="flex flex-col items-center min-w-[54px] group"
              >
                {/* Bar */}
                <div className="text-[10px] font-mono text-slate-400 mb-1 group-hover:text-white">
                  {hour.temp}°
                </div>
                <div className="w-7 h-28 bg-slate-950 rounded-t-md relative flex items-end p-0.5 border border-slate-800/80">
                  <div
                    style={{ height: `${Math.max(6, prob)}%` }}
                    className={`w-full rounded-t transition-all ${
                      isHighRain
                        ? 'bg-gradient-to-t from-sky-600 to-sky-400 shadow-sm shadow-sky-500/50'
                        : prob > 20
                        ? 'bg-sky-600/60'
                        : 'bg-slate-700/40'
                    }`}
                  />
                </div>
                <div className={`text-[11px] font-mono tabular-nums font-bold mt-1 ${isHighRain ? 'text-sky-400' : 'text-slate-400'}`}>
                  {prob}%
                </div>
                <div className="text-[10px] text-slate-500 whitespace-nowrap mt-0.5 font-sans">
                  {hour.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Forecast Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <h3 className="font-bold text-white text-base mb-3">
          ព្យាករណ៍ ៧ ថ្ងៃបន្ទាប់ (7-Day Daily Outlook)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
          {weatherData.daily.map((day, idx) => (
            <div
              key={idx}
              className={`bg-slate-950 p-3 rounded-xl border text-center ${
                idx === 0 ? 'border-amber-400/50 bg-amber-500/5' : 'border-slate-800'
              }`}
            >
              <div className="text-xs font-semibold text-slate-300">
                {day.dayNameKhmer}
              </div>
              <div className="my-2">
                {day.rainProbMax >= 50 ? (
                  <CloudRain className="w-6 h-6 mx-auto text-sky-400" />
                ) : (
                  <Sun className="w-6 h-6 mx-auto text-amber-400" />
                )}
              </div>
              <div className="text-xs font-bold font-mono text-white">
                {day.tempMax}° / <span className="text-slate-500 font-normal">{day.tempMin}°</span>
              </div>
              <div className="text-[10px] text-sky-400 font-mono mt-1">
                💧 {day.rainProbMax}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
