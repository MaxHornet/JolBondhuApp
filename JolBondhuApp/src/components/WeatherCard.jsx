import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets, 
  Eye,
  Gauge,
  AlertTriangle,
  RefreshCw,
  MapPin,
  CloudLightning
} from 'lucide-react';

/**
 * WeatherCard Component
 * 
 * Displays real-time weather information for a zone
 * Shows: Current temp, conditions, humidity, wind, alerts
 * Expandable to show 6-hour forecast
 * 
 * SAFETY: All data access is protected with null checks and defaults
 */

const WeatherIcon = ({ code, className = "w-6 h-6" }) => {
  // Map weather codes to icons
  const getIcon = () => {
    if (!code) return Cloud;
    
    // Thunderstorm
    if (code === 8000) return CloudLightning;
    
    // Rain/Freezing Rain
    if ([4000, 4001, 4200, 4201, 6000, 6001, 6200, 6201].includes(code)) 
      return CloudRain;
    
    // Fog - use Cloud as alternative since Fog icon not available
    if ([2000, 2100].includes(code)) 
      return Cloud;
    
    // Clear/Sunny
    if (code === 1000) 
      return Sun;
    
    // Partly cloudy
    if ([1100, 1101].includes(code)) 
      return Cloud;
    
    // Cloudy
    if ([1001, 1102].includes(code)) 
      return Cloud;
    
    return Cloud;
  };

  const Icon = getIcon();
  return <Icon className={className} />;
};

const WeatherCard = ({ 
  weather, 
  waterLevel, 
  zoneId, 
  loading, 
  lastUpdated, 
  isOffline,
  onRefresh,
  language = 'en',
  darkMode = true,
  t
}) => {
  const [activeTab, setActiveTab] = useState('current'); // current, forecast, alerts

  // SAFETY: Ensure weather is always an object
  const safeWeather = weather || {};
  const safeWaterLevel = waterLevel || {};

  // SAFETY: Extract values with defaults
  const current = safeWeather.current || {
    temperature: 28,
    feelsLike: 32,
    humidity: 70,
    windSpeed: 3,
    visibility: 10,
    weatherCode: 1001,
    rainIntensity: 0
  };
  
  const forecast = Array.isArray(safeWeather.forecast) ? safeWeather.forecast : [];
  const alerts = Array.isArray(safeWeather.warnings) ? safeWeather.warnings : [];
  const riskLevel = safeWeather.riskLevel || 'low';

  // Get translations
  const getText = (key) => {
    const texts = {
      en: {
        weather: 'Weather',
        current: 'Current',
        forecast: 'Forecast',
        alerts: 'Alerts',
        humidity: 'Humidity',
        wind: 'Wind',
        visibility: 'Visibility',
        pressure: 'Pressure',
        updated: 'Updated',
        offline: 'Offline mode',
        refresh: 'Refresh',
        noAlerts: 'No active alerts',
        highRisk: 'High Risk',
        mediumRisk: 'Medium Risk',
        lowRisk: 'Low Risk',
        waterLevel: 'Water Level',
        dangerLevel: 'Danger Level',
        riskStatus: 'Risk Status'
      },
      as: {
        weather: 'বতৰ',
        current: 'বৰ্তমান',
        forecast: 'পূৰ্বানুমান',
        alerts: 'সতৰ্কবাণী',
        humidity: 'আৰ্দ্ৰতা',
        wind: 'বতাহ',
        visibility: 'দৃশ্যমানতা',
        pressure: 'চাপ',
        updated: 'আপডেট কৰা হৈছে',
        offline: 'অফলাইন মোড',
        refresh: 'ৰিফ্ৰেছ কৰক',
        noAlerts: 'কোনো সক্ৰিয় সতৰ্কবাণী নাই',
        highRisk: 'উচ্চ বিপদ',
        mediumRisk: 'মধ্যম বিপদ',
        lowRisk: 'কম বিপদ',
        waterLevel: 'পানীৰ স্তৰ',
        dangerLevel: 'বিপদ স্তৰ',
        riskStatus: 'বিপদ অৱস্থা'
      }
    };
    return texts[language]?.[key] || texts.en[key];
  };

  // Format time ago
  const getTimeAgo = (date) => {
    if (!date) return language === 'as' ? 'অজ্ঞাত' : 'Unknown';
    try {
      const minutes = Math.floor((new Date() - new Date(date)) / 60000);
      if (minutes < 1) return language === 'as' ? 'এতিয়াই' : 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      return `${Math.floor(minutes / 60)}h ago`;
    } catch (e) {
      return language === 'as' ? 'অজ্ঞাত' : 'Unknown';
    }
  };

  // Get risk color
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'text-red-500 bg-red-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/20';
      case 'low': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  // Format temperature safely
  const formatTemp = (temp) => {
    const num = typeof temp === 'number' ? temp : parseFloat(temp);
    return isNaN(num) ? '--' : Math.round(num);
  };

  // Format number safely
  const formatNumber = (val, decimals = 0) => {
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(num)) return '--';
    return decimals > 0 ? num.toFixed(decimals) : Math.round(num);
  };

  // Render loading state
  if (loading && !safeWeather.current) {
    return (
      <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-20 bg-gray-300 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-12 bg-gray-300 rounded"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" />
            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {getText('weather')}
            </h3>
            {isOffline && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-500">
                {getText('offline')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {getTimeAgo(lastUpdated)}
            </span>
            <motion.button
              whileTap={{ scale: 0.9, rotate: 360 }}
              onClick={onRefresh}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Zone Info */}
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
          <MapPin className="w-3 h-3" />
          <span>Guwahati, Assam</span>
        </div>
      </div>

      {/* Current Weather */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <WeatherIcon code={current.weatherCode} className="w-12 h-12 text-blue-500" />
            <div>
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {formatTemp(current.temperature)}°C
              </div>
              <div className="text-sm text-gray-500">
                Feels like {formatTemp(current.feelsLike || current.temperature)}°
              </div>
            </div>
          </div>
          
          {/* Risk Badge */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${getRiskColor(riskLevel)}`}>
            {getText(`${riskLevel}Risk`)}
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <Droplets className="w-4 h-4 text-blue-500 mb-1" />
            <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {formatNumber(current.humidity)}%
            </div>
            <div className="text-xs text-gray-500">{getText('humidity')}</div>
          </div>
          
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <Wind className="w-4 h-4 text-teal-500 mb-1" />
            <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {formatNumber((current.windSpeed || 0) * 3.6)} km/h
            </div>
            <div className="text-xs text-gray-500">{getText('wind')}</div>
          </div>
          
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <Eye className="w-4 h-4 text-amber-500 mb-1" />
            <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {formatNumber(current.visibility || 5)} km
            </div>
            <div className="text-xs text-gray-500">{getText('visibility')}</div>
          </div>
        </div>

        {/* Water Level Status */}
        {safeWaterLevel.currentLevel && (
          <div className={`p-3 rounded-xl mb-4 border ${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-500" />
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {getText('waterLevel')}
                </span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskColor(safeWaterLevel.status || 'low')}`}>
                {language === 'as' 
                  ? (safeWaterLevel.statusAssamese || 'স্বাভাৱিক')
                  : (safeWaterLevel.status || 'Normal')
                }
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {formatNumber(safeWaterLevel.currentLevel, 1)}m
              </span>
              <span className="text-xs text-gray-500">
                / {getText('dangerLevel')}: {formatNumber(safeWaterLevel.dangerLevel, 2)}m
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {['current', 'forecast', 'alerts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : darkMode
                    ? 'bg-slate-700 text-gray-300'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              {getText(tab)}
              {tab === 'alerts' && alerts.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">
                  {alerts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'forecast' && forecast.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {forecast.slice(0, 6).map((hour, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}
                >
                  <span className="text-xs text-gray-500">
                    {hour.time 
                      ? new Date(hour.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                      : '--:--'
                    }
                  </span>
                  <div className="flex items-center gap-2">
                    <WeatherIcon code={hour.weatherCode} className="w-4 h-4" />
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {formatTemp(hour.temperature)}°
                    </span>
                    {(hour.rainProbability || 0) > 30 && (
                      <span className="text-xs text-blue-500">
                        {formatNumber(hour.rainProbability)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'alerts' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {alerts.length === 0 ? (
                <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Cloud className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{getText('noAlerts')}</p>
                </div>
              ) : (
                alerts.slice(0, 3).map((alert, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.severity === 'high' 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
                        alert.severity === 'high' ? 'text-red-500' : 'text-amber-500'
                      }`} />
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {alert.district || 'Alert'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {alert.description || 'No description available'}
                        </p>
                        {alert.expires && (
                          <p className="text-xs text-gray-400 mt-1">
                            Until: {new Date(alert.expires).toLocaleTimeString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WeatherCard;
