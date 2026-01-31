import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, Thermometer, AlertTriangle, MapPin, ChevronDown, RefreshCw } from 'lucide-react';
import DashboardWeatherService from '../services/dashboardWeatherService';

/**
 * WeatherWidget Component
 * 
 * Displays real-time weather summary in the dashboard TopBar
 * Shows: Current temp, weather icon, and active warning count
 * Click to expand and see all zones weather
 */

const WeatherIcon = ({ code, className = "w-5 h-5" }) => {
  const iconMap = {
    'sun': Sun,
    'cloud': Cloud,
    'cloud-sun': Cloud,
    'rain': CloudRain,
    'storm': CloudRain,
    'fog': Cloud
  };
  
  const Icon = iconMap[code] || Cloud;
  return <Icon className={className} />;
};

const WeatherWidget = ({ darkMode, language, t }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch weather data
  const fetchWeather = async () => {
    try {
      setLoading(true);
      const data = await DashboardWeatherService.getDashboardWeatherSummary();
      setWeather(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Weather widget error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWeather();
    
    // Auto-refresh every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Get translations
  const getText = (key) => {
    const texts = {
      en: {
        weather: 'Weather',
        warnings: 'Warnings',
        temp: 'Temp',
        rainfall: 'Rain',
        wind: 'Wind',
        zones: 'Zones',
        highRisk: 'High Risk',
        refresh: 'Refresh',
        lastUpdated: 'Updated',
        offline: 'Offline'
      },
      as: {
        weather: 'বতৰ',
        warnings: 'সতৰ্কবাণী',
        temp: 'তাপমাত্ৰা',
        rainfall: 'বৰ্ষণ',
        wind: 'বতাহ',
        zones: 'অঞ্চল',
        highRisk: 'উচ্চ বিপদ',
        refresh: 'ৰিফ্ৰেছ',
        lastUpdated: 'আপডেট',
        offline: 'অফলাইন'
      }
    };
    return texts[language]?.[key] || texts.en[key];
  };

  if (loading && !weather) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
        <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
        <span className="text-xs text-gray-500">{getText('weather')}...</span>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <button 
        onClick={fetchWeather}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'}`}
      >
        <RefreshCw className="w-3 h-3" />
        {getText('refresh')}
      </button>
    );
  }

  if (!weather) return null;

  // Get representative zone (first one or Guwahati area)
  const guwahatiZone = weather.zones.find(z => z.district === 'Kamrup') || weather.zones[0];
  const weatherIcon = DashboardWeatherService.getWeatherIcon(guwahatiZone?.weatherCode);

  return (
    <div className="relative">
      {/* Main Widget Button */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${darkMode 
          ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' 
          : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}
      >
        {/* Weather Icon */}
        <div className="flex items-center gap-2">
          <WeatherIcon 
            code={weatherIcon} 
            className={`w-5 h-5 ${guwahatiZone?.rainIntensity > 0 ? 'text-blue-500' : 'text-amber-500'}`} 
          />
          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {Math.round(weather.temperature)}°C
          </span>
        </div>

        {/* Divider */}
        <div className={`w-px h-4 ${darkMode ? 'bg-slate-600' : 'bg-gray-300'}`}></div>

        {/* Warnings Badge */}
        {weather.warnings > 0 ? (
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-red-500">
              {weather.warnings}
            </span>
          </div>
        ) : (
          <Cloud className="w-4 h-4 text-green-500" />
        )}

        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Expanded Dropdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl border z-50 ${darkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white border-gray-200'
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-500" />
                  <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {getText('weather')}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {lastUpdated?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchWeather();
                    }}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    <RefreshCw className={`w-3 h-3 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="p-4 grid grid-cols-3 gap-3">
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                <Thermometer className="w-4 h-4 text-red-500 mb-1" />
                <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {Math.round(weather.temperature)}°
                </div>
                <div className="text-xs text-gray-500">{getText('temp')}</div>
              </div>

              <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                <CloudRain className="w-4 h-4 text-blue-500 mb-1" />
                <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {Math.round(weather.rainfall * 10) / 10}
                </div>
                <div className="text-xs text-gray-500">{getText('rainfall')} mm</div>
              </div>

              <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                <Wind className="w-4 h-4 text-teal-500 mb-1" />
                <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {Math.round(weather.windSpeed * 3.6)}
                </div>
                <div className="text-xs text-gray-500">{getText('wind')} km/h</div>
              </div>
            </div>

            {/* Warnings Section */}
            {weather.warningsList.length > 0 && (
              <div className={`px-4 pb-4 ${darkMode ? 'border-t border-slate-700' : 'border-t border-gray-200'}`}>
                <div className="flex items-center gap-2 mt-3 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {getText('warnings')}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                    {weather.warnings}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {weather.warningsList.slice(0, 3).map((warning) => (
                    <div 
                      key={warning.id}
                      className={`p-2 rounded-lg text-xs border-l-2 ${
                        warning.severity === 'high' 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      }`}
                    >
                      <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {warning.district}
                      </div>
                      <div className="text-gray-500 mt-0.5 line-clamp-2">
                        {language === 'as' && warning.descriptionAssamese 
                          ? warning.descriptionAssamese 
                          : warning.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Zones */}
            <div className={`px-4 pb-4 ${weather.warningsList.length > 0 ? '' : 'border-t ' + (darkMode ? 'border-slate-700' : 'border-gray-200')}`}>
              <h4 className={`font-semibold text-sm mt-3 mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {getText('zones')}
              </h4>
              <div className="space-y-1.5">
                {weather.zones.map((zone) => (
                  <div 
                    key={zone.zoneId}
                    className={`flex items-center justify-between p-2 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className={`text-xs ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {language === 'as' && zone.zoneNameAssamese 
                          ? zone.zoneNameAssamese 
                          : zone.zoneName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <WeatherIcon 
                        code={DashboardWeatherService.getWeatherIcon(zone.weatherCode)} 
                        className="w-3 h-3 text-gray-400" 
                      />
                      <span className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {Math.round(zone.temperature)}°
                      </span>
                      {(zone.rainIntensity || 0) > 5 && (
                        <span className="text-xs text-red-500 font-bold">
                          {getText('highRisk')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeatherWidget;
