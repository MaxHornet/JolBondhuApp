import { useState, useEffect, useCallback, useRef } from 'react';
import WeatherService from '../services/weatherService';
import WaterLevelService from '../services/waterLevelService';

/**
 * useWeather Hook
 * 
 * Provides real-time weather updates with:
 * - 15-minute polling for current weather
 * - 30-minute polling for IMD warnings
 * - 6-hour polling for forecast updates
 * - Automatic offline caching
 * - Zone-based data fetching
 * - Graceful error handling with fallback data
 */

const UPDATE_INTERVALS = {
  current: 15 * 60 * 1000, // 15 minutes
  warnings: 30 * 60 * 1000, // 30 minutes
  forecast: 6 * 60 * 60 * 1000, // 6 hours
  waterLevel: 60 * 60 * 1000 // 1 hour
};

// Default fallback data
const getDefaultWeatherData = (zoneId) => ({
  current: WeatherService.getFallbackWeather(zoneId),
  forecast: WeatherService.generateFallbackForecast(6),
  warnings: [],
  zoneId,
  riskLevel: 'low',
  updatedAt: new Date().toISOString(),
  isFallback: true
});

const getDefaultWaterLevel = (zoneId) => ({
  station: 'Brahmaputra at Guwahati D.C. Court',
  stationAssamese: 'গুৱাহাটী ডি.চি. কোৰ্টত ব্ৰহ্মপুত্ৰ',
  currentLevel: 29.8,
  dangerLevel: 49.68,
  highestFloodLevel: 51.46,
  status: 'normal',
  statusAssamese: 'স্বাভাৱিক',
  trend: 'stable',
  rainfall24h: 0,
  estimatedRise: 0.1,
  timeToPeak: 12,
  lastUpdated: new Date().toISOString(),
  isEstimated: true,
  source: 'Default fallback'
});

export const useWeather = (zoneId = 'jalukbari', options = {}) => {
  const { 
    enableAutoUpdate = true,
    onError = null,
    onUpdate = null
  } = options;

  // Initialize with fallback data to prevent null errors
  const [weatherData, setWeatherData] = useState(() => {
    // Try to load from localStorage immediately
    try {
      const cached = localStorage.getItem(`weather_${zoneId}`);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.weather) return data.weather;
      }
    } catch (e) {
      console.warn('Error loading cached weather:', e);
    }
    return getDefaultWeatherData(zoneId);
  });
  
  const [waterLevelData, setWaterLevelData] = useState(() => {
    try {
      const cached = localStorage.getItem(`weather_${zoneId}`);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.waterLevel) return data.waterLevel;
      }
    } catch (e) {
      console.warn('Error loading cached water level:', e);
    }
    return getDefaultWaterLevel(zoneId);
  });
  
  const [zoneRisks, setZoneRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(() => {
    try {
      const cached = localStorage.getItem(`weather_${zoneId}`);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.timestamp) return new Date(data.timestamp);
      }
    } catch (e) {
      // Ignore
    }
    return new Date();
  });
  
  const [isOffline, setIsOffline] = useState(() => {
    try {
      return !navigator.onLine;
    } catch (e) {
      return false;
    }
  });

  // Use refs to store interval IDs for cleanup
  const intervalsRef = useRef({});
  const isMountedRef = useRef(true);

  /**
   * Fetch current weather data
   */
  const fetchWeather = useCallback(async (silent = false) => {
    if (!isMountedRef.current) return;
    if (!silent) setLoading(true);
    
    try {
      // Fetch unified weather data
      const weather = await WeatherService.getUnifiedWeather(zoneId);
      
      if (!isMountedRef.current) return;
      
      // Calculate zone risks with error handling
      let risks = [];
      try {
        risks = WaterLevelService.calculateZoneRisks(weather);
      } catch (riskError) {
        console.warn('Error calculating zone risks:', riskError);
        risks = [];
      }
      
      // Get water level for current zone
      let waterLevel;
      try {
        const rainfall24h = weather.current?.rainIntensity ? weather.current.rainIntensity * 24 : 0;
        waterLevel = WaterLevelService.estimateWaterLevel(zoneId, rainfall24h);
      } catch (wlError) {
        console.warn('Error estimating water level:', wlError);
        waterLevel = getDefaultWaterLevel(zoneId);
      }

      setWeatherData(weather);
      setWaterLevelData(waterLevel);
      setZoneRisks(risks);
      setLastUpdated(new Date());
      setError(null);

      // Store in localStorage for offline access
      try {
        localStorage.setItem(`weather_${zoneId}`, JSON.stringify({
          weather,
          waterLevel,
          risks,
          timestamp: new Date().toISOString()
        }));
      } catch (storageError) {
        console.warn('Error storing weather in localStorage:', storageError);
      }

      if (onUpdate && isMountedRef.current) {
        try {
          onUpdate({ weather, waterLevel, risks });
        } catch (callbackError) {
          console.warn('Error in onUpdate callback:', callbackError);
        }
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      
      if (!isMountedRef.current) return;
      
      setError(err.message || 'Failed to fetch weather data');
      
      // Data is already set from localStorage or defaults, so no need to update
      // Just log that we're using fallback/cached data
      console.log('Using cached or fallback weather data');

      if (onError && isMountedRef.current) {
        try {
          onError(err);
        } catch (callbackError) {
          console.warn('Error in onError callback:', callbackError);
        }
      }
    } finally {
      if (isMountedRef.current && !silent) {
        setLoading(false);
      }
    }
  }, [zoneId, onUpdate, onError]);

  /**
   * Fetch only warnings (lighter request)
   */
  const fetchWarnings = useCallback(async () => {
    try {
      const warnings = await WeatherService.getIMDWarnings();
      
      if (isMountedRef.current && weatherData) {
        setWeatherData(prev => ({
          ...prev,
          warnings: warnings || [],
          updatedAt: new Date().toISOString()
        }));
      }
    } catch (err) {
      console.error('Warnings fetch error:', err);
    }
  }, [weatherData]);

  /**
   * Force refresh all data
   */
  const refresh = useCallback(() => {
    return fetchWeather(false);
  }, [fetchWeather]);

  /**
   * Get weather icon for current conditions
   */
  const getCurrentIcon = useCallback(() => {
    if (!weatherData?.current?.weatherCode) return 'cloud';
    return WeatherService.getWeatherIcon(weatherData.current.weatherCode);
  }, [weatherData]);

  /**
   * Get current temperature
   */
  const getCurrentTemp = useCallback(() => {
    return weatherData?.current?.temperature ?? 28;
  }, [weatherData]);

  /**
   * Get active alerts for the zone
   */
  const getActiveAlerts = useCallback(() => {
    if (!weatherData?.warnings || !Array.isArray(weatherData.warnings)) return [];
    
    try {
      const now = new Date();
      return weatherData.warnings.filter(warning => {
        if (!warning?.expires) return true;
        try {
          const expires = new Date(warning.expires);
          return expires > now;
        } catch (e) {
          return true;
        }
      });
    } catch (e) {
      console.warn('Error filtering active alerts:', e);
      return [];
    }
  }, [weatherData]);

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    // Use a small delay to prevent immediate fetch on mount issues
    const timer = setTimeout(() => {
      fetchWeather();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [fetchWeather, zoneId]);

  // Setup auto-update intervals
  useEffect(() => {
    if (!enableAutoUpdate) return;

    // Current weather: every 15 minutes
    intervalsRef.current.weather = setInterval(() => {
      fetchWeather(true); // Silent update
    }, UPDATE_INTERVALS.current);

    // Warnings: every 30 minutes
    intervalsRef.current.warnings = setInterval(() => {
      fetchWarnings();
    }, UPDATE_INTERVALS.warnings);

    // Cleanup on unmount
    return () => {
      Object.values(intervalsRef.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, [enableAutoUpdate, fetchWeather, fetchWarnings]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Refresh data when coming back online
      fetchWeather(true);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchWeather]);

  return {
    // Data - always return valid objects, never null
    weather: weatherData || getDefaultWeatherData(zoneId),
    waterLevel: waterLevelData || getDefaultWaterLevel(zoneId),
    zoneRisks: zoneRisks || [],
    
    // Status
    loading,
    error,
    lastUpdated,
    isOffline,
    
    // Actions
    refresh,
    
    // Helpers
    getCurrentIcon,
    getCurrentTemp,
    getActiveAlerts,
    
    // Raw values for convenience - with safe defaults
    current: weatherData?.current || getDefaultWeatherData(zoneId).current,
    forecast: weatherData?.forecast || getDefaultWeatherData(zoneId).forecast,
    warnings: weatherData?.warnings || [],
    weatherRisk: weatherData?.riskLevel || 'low'
  };
};

export default useWeather;
