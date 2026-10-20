/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { GoldTracker } from './components/GoldTracker';
import { FuelTracker } from './components/FuelTracker';
import { CurrencyTracker } from './components/CurrencyTracker';
import { BankRatesTracker } from './components/BankRatesTracker';
import { WeatherTracker } from './components/WeatherTracker';
import { TelegramNotificationModal } from './components/TelegramNotificationModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { SetGoldAlertModal } from './components/SetGoldAlertModal';
import { CambodiaDailyStandardsBar } from './components/CambodiaDailyStandardsBar';
import { CambodiaDailyStandardsModal } from './components/CambodiaDailyStandardsModal';
import { OfficialCambodia2026Widget } from './components/OfficialCambodia2026Widget';
import {
  INITIAL_GOLD_TYPES,
  INITIAL_FUEL_STATIONS,
  INITIAL_MOC_FUEL_NOTICE,
  generateCompliantFuelStations,
  FUEL_TREND_14D,
  INITIAL_CURRENCIES,
  INITIAL_BANK_PRODUCTS,
  generateGoldHistory,
} from './services/marketData';
import {
  fetchWeatherData,
  CAMBODIA_CITIES,
  CityPreset,
  getFallbackWeatherData,
} from './services/weatherService';
import {
  loadTelegramConfig,
  saveTelegramConfig,
  sendTelegramMessage,
  buildGoldAlertMessage,
  buildRainAlertMessage,
  buildDailyMarketDigestMessage,
} from './services/telegramService';
import {
  loadDailySyncMetadata,
  saveDailySyncMetadata,
  executeCambodiaDailyStandardsSync,
  getCambodiaDateTime,
  getCambodiaDateISO,
} from './services/cambodiaDailySync';
import {
  GoldType,
  TimeFrame,
  WeatherData,
  AlertNotification,
  TelegramConfig,
  CambodiaDailySyncMetadata,
  MoCFuelNotice,
} from './types/market';
import { audioAlert } from './utils/audioAlert';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const REFRESH_INTERVAL_SECONDS = 30;

export default function App() {
  const [activeTab, setActiveTab] = useState<'gold' | 'fuel' | 'currency' | 'bank' | 'weather'>('gold');
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('30D');

  // Market Data States
  const [goldTypes, setGoldTypes] = useState<GoldType[]>(INITIAL_GOLD_TYPES);
  const [mocNotice, setMocNotice] = useState<MoCFuelNotice>(INITIAL_MOC_FUEL_NOTICE);
  const [fuelStations, setFuelStations] = useState(INITIAL_FUEL_STATIONS);
  const [currencies, setCurrencies] = useState(INITIAL_CURRENCIES);
  const [bankProducts] = useState(INITIAL_BANK_PRODUCTS);
  const [historyPoints, setHistoryPoints] = useState(() => generateGoldHistory('30D', 3345));

  // Cambodia Daily Standards Sync State
  const [dailySyncMetadata, setDailySyncMetadata] = useState<CambodiaDailySyncMetadata>(loadDailySyncMetadata);
  const [isStandardsModalOpen, setIsStandardsModalOpen] = useState(false);
  const [isDailySyncing, setIsDailySyncing] = useState(false);

  // Weather State
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityPreset>(CAMBODIA_CITIES[0]);

  // Telegram & Notification States
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(loadTelegramConfig);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Target Price Alert Modal State
  const [goldAlertTarget, setGoldAlertTarget] = useState<{
    isOpen: boolean;
    goldName: string;
    currentPrice: number;
  }>({
    isOpen: false,
    goldName: '',
    currentPrice: 0,
  });

  // Active User Price Alerts Queue
  const [activeUserAlerts, setActiveUserAlerts] = useState<
    Array<{ goldName: string; targetPrice: number; direction: 'above' | 'below'; triggered: boolean }>
  >([]);

  // Toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-refresh states
  const [refreshCountdown, setRefreshCountdown] = useState(REFRESH_INTERVAL_SECONDS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  const rainAlertDispatchedRef = useRef<boolean>(false);

  // Helper Toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Browser Notification Permission check
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    } else {
      setBrowserPermission('unsupported');
    }
  }, []);

  const handleRequestBrowserNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
        if (perm === 'granted') {
          audioAlert.playChime();
          new Notification('Cambodia Market Watch', {
            body: 'ការជូនដំណឹងត្រូវបានបើកដោយជោគជ័យ! 🎉',
          });
          showToast('បានបើកការជូនដំណឹងតាមកម្មវិធីរុករកដោយជោគជ័យ!');
        }
      } catch {
        // ignore
      }
    }
  };

  // Add notification to list & trigger push/audio
  const triggerNotification = useCallback(
    (
      type: AlertNotification['type'],
      titleKhmer: string,
      messageKhmer: string,
      severity: AlertNotification['severity'] = 'info'
    ) => {
      const newNotif: AlertNotification = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', hour12: true }),
        type,
        titleKhmer,
        messageKhmer,
        severity,
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 29)]);

      // Browser push notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(titleKhmer, {
            body: messageKhmer,
          });
        } catch {
          // ignore
        }
      }
    },
    []
  );

  // Execute Cambodia Daily Standards Synchronization
  const handleTriggerDailyStandardsSync = useCallback(async () => {
    setIsDailySyncing(true);
    const pureGold = goldTypes.find((g) => g.id === 'gold-24k');
    const usdItem = currencies.find((c) => c.code === 'USD');
    const krwItem = currencies.find((c) => c.code === 'KRW');
    const regularFuel = fuelStations[0]?.regularGasolineKHR || 4150;
    const dieselFuel = fuelStations[0]?.dieselKHR || 4000;

    const result = await executeCambodiaDailyStandardsSync(
      pureGold?.pricePerDamlungSellUSD || 3345,
      mocNotice.regularCeilingKHR,
      mocNotice.dieselCeilingKHR,
      usdItem?.nbcRate || 4065,
      krwItem?.marketBuyRate || 2.9,
      telegramConfig
    );

    // Update state metadata
    setDailySyncMetadata(loadDailySyncMetadata());
    setIsDailySyncing(false);

    audioAlert.playGoldMilestoneTone();
    showToast(`ទិន្នន័យត្រូវបាន Update តាមស្តង់ដារជាតិថ្ងៃនេះរួចរាល់ (${result.syncTimeKhmer})!`);

    triggerNotification(
      'system',
      '🇰🇭 បាន Update ស្តង់ដារព្រះរាជាណាចក្រកម្ពុជាប្រចាំថ្ងៃ',
      `ទិន្នន័យហាងឆេងមាស ប្រេងឥន្ធនៈ អត្រាប្តូរប្រាក់ NBC និងការប្រាក់ត្រូវបានផ្ទៀងផ្ទាត់ និងធ្វើបច្ចុប្បន្នភាពនៅ ${result.syncTimeKhmer}។`,
      'success'
    );
  }, [goldTypes, currencies, mocNotice, telegramConfig, showToast, triggerNotification]);

  // Handle manual update of MoC announcement
  const handleUpdateMoCNotice = (updatedNotice: MoCFuelNotice) => {
    setMocNotice(updatedNotice);
    const compliantStations = generateCompliantFuelStations(
      updatedNotice.regularCeilingKHR,
      updatedNotice.dieselCeilingKHR
    );
    setFuelStations(compliantStations);
    showToast('បាន Update តម្លៃប្រេងតាមសេចក្តីជូនដំណឹងថ្មីរបស់ក្រសួងរួចរាល់!');
    triggerNotification(
      'fuel',
      '⛽ ក្រសួងពាណិជ្ជកម្ម៖ បច្ចុប្បន្នភាពតម្លៃប្រេងឥន្ធនៈថ្មី',
      `សេចក្តីជូនដំណឹង៖ សាំងធម្មតា EA92 = ${updatedNotice.regularCeilingKHR.toLocaleString()}៛, ម៉ាស៊ូត = ${updatedNotice.dieselCeilingKHR.toLocaleString()}៛ (${updatedNotice.effectivePeriod})`,
      'info'
    );
  };

  // Load weather
  const loadWeather = useCallback(
    async (city: CityPreset, isGps = false) => {
      setIsWeatherLoading(true);
      try {
        const data = await fetchWeatherData(city.lat, city.lon, city.nameKhmer, isGps);
        setWeatherData(data);

        // Check rain alert
        if (data.upcomingRainAlert.willRainSoon && !rainAlertDispatchedRef.current) {
          rainAlertDispatchedRef.current = true;
          audioAlert.playRainAlertTone();
          triggerNotification(
            'weather',
            `🌧️ ជូនដំណឹងមុនពេលភ្លៀងធ្លាក់ (${city.nameKhmer})`,
            `អាចមានភ្លៀងធ្លាក់នៅម៉ោង ${data.upcomingRainAlert.expectedRainTime} ក្នុងប្រូបាប៊ីលីតេ ${data.upcomingRainAlert.probability}% (${data.upcomingRainAlert.intensity})។`,
            'alert'
          );

          // Dispatch to Telegram if enabled
          if (telegramConfig.enabled && telegramConfig.alertRain && telegramConfig.botToken && telegramConfig.chatId) {
            const rainMsg = buildRainAlertMessage(
              city.nameKhmer,
              data.upcomingRainAlert.expectedRainTime,
              data.upcomingRainAlert.probability,
              data.upcomingRainAlert.intensity
            );
            sendTelegramMessage(telegramConfig.botToken, telegramConfig.chatId, rainMsg);
          }
        }
      } catch {
        setWeatherData(getFallbackWeatherData(city.nameKhmer, city.lat, city.lon, isGps));
      } finally {
        setIsWeatherLoading(false);
      }
    },
    [triggerNotification, telegramConfig]
  );

  // GPS Geolocation Handler
  const handleGpsLocate = () => {
    if (!navigator.geolocation) {
      showToast('ឧបករណ៍របស់អ្នកមិនគាំទ្រ GPS ទេ');
      return;
    }

    setIsWeatherLoading(true);
    showToast('កំពុងចាប់យកទីតាំងតាម GPS...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        loadWeather(
          {
            nameKhmer: 'ទីតាំង GPS របស់អ្នក',
            nameEng: 'Current GPS Location',
            lat: latitude,
            lon: longitude,
          },
          true
        );
        showToast('ចាប់យកទីតាំង GPS បានជោគជ័យ!');
      },
      () => {
        showToast('មិនអាចទទួលបាន GPS ទេ។ កំពុងប្រើប្រាស់រាជធានីភ្នំពេញ');
        loadWeather(CAMBODIA_CITIES[0], false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Initial Data & Weather Load + Automatic Daily Sync Check
  useEffect(() => {
    setLastUpdatedTime(new Date().toLocaleTimeString('km-KH'));
    loadWeather(CAMBODIA_CITIES[0], false);

    // Initial welcome notification
    triggerNotification(
      'system',
      'សូមស្វាគមន៍មកកាន់ Cambodia Market Watch',
      'ប្រព័ន្ធកំពុងដំណើរការតាមដានហាងឆេងមាស ប្រេងឥន្ធនៈ អត្រាប្តូរប្រាក់ និងព្យាករណ៍ភ្លៀងដោយស្វ័យប្រវត្តិ។',
      'info'
    );

    // Daily Auto-Sync check on first launch
    const meta = loadDailySyncMetadata();
    if (meta.dailyAutoSyncEnabled && !meta.isDailySyncedToday) {
      // Automatically execute today's Cambodia Standards sync!
      handleTriggerDailyStandardsSync();
    }
  }, [loadWeather, triggerNotification, handleTriggerDailyStandardsSync]);

  // Periodic Daily Calendar Check: Checks every minute if a new Cambodia day has arrived or schedule slots passed
  useEffect(() => {
    const calendarCheckInterval = setInterval(() => {
      const camNow = getCambodiaDateTime();
      const todayISO = getCambodiaDateISO(camNow);
      const meta = loadDailySyncMetadata();

      // If Cambodia date rolled over and daily auto-sync is enabled
      if (meta.dailyAutoSyncEnabled && meta.lastSyncDate !== todayISO) {
        handleTriggerDailyStandardsSync();
      } else {
        setDailySyncMetadata(meta);
      }
    }, 60000);

    return () => clearInterval(calendarCheckInterval);
  }, [handleTriggerDailyStandardsSync]);

  // Handle Timeframe changes for gold chart
  const handleTimeframeChange = (tf: TimeFrame) => {
    setSelectedTimeframe(tf);
    const pureGold = goldTypes.find((g) => g.id === 'gold-24k');
    setHistoryPoints(generateGoldHistory(tf, pureGold?.pricePerDamlungSellUSD || 3345));
  };

  // Auto Refresh & Live Market Ticks Logic
  const performMarketRefresh = useCallback(() => {
    setIsRefreshing(true);
    const nowStr = new Date().toLocaleTimeString('km-KH');
    setLastUpdatedTime(nowStr);

    // Realistic minute-by-minute micro-tick for gold spot and domestic rates
    setGoldTypes((prev) => {
      return prev.map((g) => {
        // Subtle realistic jitter (-2 to +2.5 USD)
        const delta = Math.round((Math.random() * 4.5 - 2) * 10) / 10;
        const newSell = Math.round((g.pricePerDamlungSellUSD + delta) * 10) / 10;
        const newBuy = Math.round((newSell - 30) * 10) / 10;
        const newChiSell = Math.round((newSell / 10) * 10) / 10;
        const newChiBuy = Math.round((newBuy / 10) * 10) / 10;
        const totalChange = Math.round((g.change24hUSD + delta) * 10) / 10;
        const totalChangePct = Math.round((totalChange / 3300) * 1000) / 1000;

        // Check user active alerts
        activeUserAlerts.forEach((alert) => {
          if (!alert.triggered && alert.goldName === g.nameKhmer) {
            const conditionMet =
              (alert.direction === 'above' && newSell >= alert.targetPrice) ||
              (alert.direction === 'below' && newSell <= alert.targetPrice);

            if (conditionMet) {
              alert.triggered = true;
              audioAlert.playGoldMilestoneTone();
              triggerNotification(
                'gold',
                `🏆 គោលដៅតម្លៃមាសបានសម្រេច (${g.nameKhmer})`,
                `តម្លៃបានឈានដល់ $${newSell.toLocaleString()} /តម្លឹង (គោលដៅ: $${alert.targetPrice.toLocaleString()})`,
                'success'
              );

              // Send Telegram Alert if configured
              if (telegramConfig.enabled && telegramConfig.botToken && telegramConfig.chatId) {
                const msg = buildGoldAlertMessage(g.nameKhmer, newSell, totalChange);
                sendTelegramMessage(telegramConfig.botToken, telegramConfig.chatId, msg);
              }
            }
          }
        });

        return {
          ...g,
          pricePerDamlungBuyUSD: newBuy,
          pricePerDamlungSellUSD: newSell,
          pricePerChiBuyUSD: newChiBuy,
          pricePerChiSellUSD: newChiSell,
          change24hUSD: totalChange,
          change24hPercent: totalChangePct,
        };
      });
    });

    // Subtly refresh currencies
    setCurrencies((prev) => {
      return prev.map((c) => {
        if (c.code === 'USD') return c;
        const jitter = (Math.random() * 0.1 - 0.05);
        return {
          ...c,
          change24h: Math.round((c.change24h + jitter) * 100) / 100,
        };
      });
    });

    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  }, [activeUserAlerts, telegramConfig, triggerNotification]);

  // Countdown Timer for Auto Refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          performMarketRefresh();
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [performMarketRefresh]);

  // Send Rain Alert to Telegram manually
  const handleSendRainTelegramAlert = async () => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      setIsTelegramModalOpen(true);
      showToast('សូមភ្ជាប់ Telegram Bot Token និង Chat ID ជាមុនសិន!');
      return;
    }

    if (!weatherData) return;
    const msg = buildRainAlertMessage(
      weatherData.city,
      weatherData.upcomingRainAlert.expectedRainTime,
      weatherData.upcomingRainAlert.probability,
      weatherData.upcomingRainAlert.intensity
    );

    const res = await sendTelegramMessage(telegramConfig.botToken, telegramConfig.chatId, msg);
    if (res.success) {
      showToast('បានផ្ញើដំណឹងភ្លៀងទៅ Telegram ដោយជោគជ័យ! 🎉');
      audioAlert.playChime();
    } else {
      showToast(res.message);
    }
  };

  // Send Daily Report to Telegram manually
  const handleSendDailyTelegramReport = async () => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      setIsTelegramModalOpen(true);
      showToast('សូមភ្ជាប់ Telegram Bot Token និង Chat ID ជាមុនសិន!');
      return;
    }

    const pureGold = goldTypes.find((g) => g.id === 'gold-24k');
    const usdItem = currencies.find((c) => c.code === 'USD');
    const krwItem = currencies.find((c) => c.code === 'KRW');
    const regularFuel = fuelStations[0]?.regularGasolineKHR || 4150;
    const dieselFuel = fuelStations[0]?.dieselKHR || 4000;

    const digestMsg = buildDailyMarketDigestMessage(
      pureGold?.pricePerDamlungSellUSD || 3345,
      regularFuel,
      dieselFuel,
      usdItem?.nbcRate || 4065,
      krwItem?.marketBuyRate || 2.9
    );

    const res = await sendTelegramMessage(telegramConfig.botToken, telegramConfig.chatId, digestMsg);
    if (res.success) {
      showToast('បានផ្ញើរបាយការណ៍ស្តង់ដារប្រចាំថ្ងៃទៅ Telegram រួចរាល់! 🎉');
      audioAlert.playGoldMilestoneTone();
    } else {
      showToast(res.message);
    }
  };

  // Add target gold alert
  const handleSaveGoldAlert = (goldName: string, targetPrice: number, direction: 'above' | 'below') => {
    setActiveUserAlerts((prev) => [...prev, { goldName, targetPrice, direction, triggered: false }]);
    showToast(`បានកំណត់ការជូនដំណឹងសម្រាប់ ${goldName} នៅតម្លៃ $${targetPrice}!`);
    audioAlert.playChime();
  };

  const usdToKhrRate = currencies.find((c) => c.code === 'USD')?.nbcRate || 4065;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Strict 3-zone Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        isAutoRefreshing={isRefreshing}
        refreshCountdown={refreshCountdown}
        onManualRefresh={() => {
          performMarketRefresh();
          showToast('ទិន្នន័យត្រូវបានធ្វើបច្ចុប្បន្នភាព!');
        }}
        hasRainAlert={weatherData?.upcomingRainAlert.willRainSoon || false}
        onOpenStandardsModal={() => setIsStandardsModalOpen(true)}
        isDailySynced={dailySyncMetadata.isDailySyncedToday}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cambodia Standards Daily Update Status Banner */}
        <CambodiaDailyStandardsBar
          metadata={dailySyncMetadata}
          isSyncing={isDailySyncing}
          onTriggerDailySync={handleTriggerDailyStandardsSync}
          onOpenStandardsModal={() => setIsStandardsModalOpen(true)}
        />

        {/* Official 2026 3-Card Summary matching Cambodia Standard Reference */}
        <OfficialCambodia2026Widget
          goldTypes={goldTypes}
          currencies={currencies}
          mocNotice={mocNotice}
          onNavigateToTab={(tab) => setActiveTab(tab)}
        />

        <AnimatePresence mode="wait">
          {activeTab === 'gold' && (
            <motion.div
              key="gold"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <GoldTracker
                goldTypes={goldTypes}
                historyPoints={historyPoints}
                selectedTimeframe={selectedTimeframe}
                onTimeframeChange={handleTimeframeChange}
                usdToKhrRate={usdToKhrRate}
                onSetAlertClick={(goldName, currentPrice) =>
                  setGoldAlertTarget({ isOpen: true, goldName, currentPrice })
                }
              />
            </motion.div>
          )}

          {activeTab === 'fuel' && (
            <motion.div
              key="fuel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <FuelTracker
                fuelStations={fuelStations}
                trendPoints={FUEL_TREND_14D}
                usdToKhrRate={usdToKhrRate}
                mocNotice={mocNotice}
                onUpdateMoCNotice={handleUpdateMoCNotice}
              />
            </motion.div>
          )}

          {activeTab === 'currency' && (
            <motion.div
              key="currency"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <CurrencyTracker
                currencies={currencies}
                lastUpdated={lastUpdatedTime}
              />
            </motion.div>
          )}

          {activeTab === 'bank' && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <BankRatesTracker
                bankProducts={bankProducts}
                usdToKhrRate={usdToKhrRate}
              />
            </motion.div>
          )}

          {activeTab === 'weather' && (
            <motion.div
              key="weather"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <WeatherTracker
                weatherData={weatherData}
                isLoading={isWeatherLoading}
                onRefreshWeather={() => loadWeather(selectedCity, weatherData?.isGps)}
                onCitySelect={(city) => {
                  setSelectedCity(city);
                  loadWeather(city, false);
                }}
                onGpsLocate={handleGpsLocate}
                onSendRainTelegramAlert={handleSendRainTelegramAlert}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Quiet Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Cambodia Market & Weather Live Watch · ហាងឆេងមាស ប្រេងឥន្ធនៈ អត្រាប្តូរប្រាក់ និងអាកាសធាតុស្តង់ដារកម្ពុជា
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsStandardsModalOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              🇰🇭 ស្តង់ដារជាតិ
            </button>
            <span aria-hidden="true">·</span>
            <span>Update ប្រចាំថ្ងៃស្វ័យប្រវត្តិ</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Telegram Alerts
            </button>
          </div>
        </div>
      </footer>

      {/* Cambodia Daily Standards & Schedule Modal */}
      <CambodiaDailyStandardsModal
        isOpen={isStandardsModalOpen}
        onClose={() => setIsStandardsModalOpen(false)}
        metadata={dailySyncMetadata}
        onToggleAutoSync={(enabled) => {
          saveDailySyncMetadata({
            lastSyncDate: dailySyncMetadata.lastSyncDate,
            lastSyncTimeKhmer: dailySyncMetadata.lastSyncTimeKhmer,
            dailyAutoSyncEnabled: enabled,
          });
          setDailySyncMetadata((prev) => ({ ...prev, dailyAutoSyncEnabled: enabled }));
          showToast(enabled ? 'បានបើក Update ស្វ័យប្រវត្តិតាមប្រតិទិនកម្ពុជា' : 'បានបិទ Update ស្វ័យប្រវត្តិ');
        }}
        onTriggerDailySync={handleTriggerDailyStandardsSync}
        isSyncing={isDailySyncing}
        goldTypes={goldTypes}
        fuelStations={fuelStations}
        currencies={currencies}
        onSendTelegramReport={handleSendDailyTelegramReport}
      />

      {/* Telegram Setup & Alert Settings Modal */}
      <TelegramNotificationModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        config={telegramConfig}
        onSaveConfig={(newCfg) => {
          setTelegramConfig(newCfg);
          saveTelegramConfig(newCfg);
          showToast('បានរក្សាទុកការកំណត់ Telegram ដោយជោគជ័យ!');
        }}
        onSendTestMessage={async () => {}}
        browserNotificationPermission={browserPermission}
        onRequestBrowserNotification={handleRequestBrowserNotification}
      />

      {/* Notification Center Log Drawer */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        onClearAll={() => {
          setNotifications([]);
          showToast('បានសម្អាតប្រអប់សារដំណឹងរួចរាល់');
        }}
        onMarkAsRead={(id) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
        }}
      />

      {/* Set Gold Target Alert Modal */}
      <SetGoldAlertModal
        isOpen={goldAlertTarget.isOpen}
        onClose={() => setGoldAlertTarget((prev) => ({ ...prev, isOpen: false }))}
        goldName={goldAlertTarget.goldName}
        currentPrice={goldAlertTarget.currentPrice}
        onSaveAlert={handleSaveGoldAlert}
      />

      {/* Global Toast Floating Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-amber-400/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
