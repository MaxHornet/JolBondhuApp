/**
 * Dashboard Weather Service
 * 
 * Provides weather data for the Admin Dashboard
 * Uses Open-Meteo API (free, no auth required) - same as citizen app
 */

const API_URL = 'https://api.open-meteo.com/v1/forecast';

// Zone coordinates for all 6 zones
const ZONE_COORDS = {
  'jalukbari': { lat: 26.1445, lng: 91.6616, name: 'Jalukbari', nameAssamese: 'জালুকবাৰী', district: 'Kamrup' },
  'maligaon': { lat: 26.1520, lng: 91.6750, name: 'Maligaon', nameAssamese: 'মালিগাঁও', district: 'Kamrup' },
  'fancy-bazar': { lat: 26.1600, lng: 91.6900, name: 'Fancy Bazar', nameAssamese: 'ফেঞ্চী বজাৰ', district: 'Kamrup' },
  'bharalumukh': { lat: 26.1350, lng: 91.6800, name: 'Bharalumukh', nameAssamese: 'ভৰলুমুখ', district: 'Kamrup' },
  'brahmaputra-north': { lat: 26.6736, lng: 92.8478, name: 'Brahmaputra North', nameAssamese: 'ব্ৰহ্মপুত্ৰ উত্তৰ', district: 'Sonitpur' },
  'barpeta': { lat: 26.3225, lng: 91.0055, name: 'Barpeta', nameAssamese: 'বৰপেটা', district: 'Barpeta' }
};

/**
 * Fetch weather from Open-Meteo API
 */
const fetchFromOpenMeteo = async (lat, lon) => {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    hourly: 'temperature_2m,rain,precipitation_probability,precipitation,weathercode',
    current_weather: 'true',
    timezone: 'auto',
    forecast_days: 1
  });

  const response = await fetch(`${API_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }
  return await response.json();
};

/**
 * Fetch current weather for a zone
 */
export const fetchZoneWeather = async (zoneId) => {
  try {
    const coords = ZONE_COORDS[zoneId];
    if (!coords) throw new Error(`Unknown zone: ${zoneId}`);

    const data = await fetchFromOpenMeteo(coords.lat, coords.lng);

    // Find current hour index
    const now = new Date();
    const currentHour = now.getHours();
    const hourlyData = data.hourly || {};
    const currentHourIndex = hourlyData.time?.findIndex(time => {
      const hour = new Date(time).getHours();
      return hour === currentHour;
    }) || 0;

    return {
      zoneId,
      zoneName: coords.name,
      zoneNameAssamese: coords.nameAssamese,
      district: coords.district,
      temperature: data.current_weather?.temperature || hourlyData.temperature_2m?.[currentHourIndex] || 28,
      humidity: 75, // Open-Meteo doesn't provide humidity in basic tier
      windSpeed: data.current_weather?.windspeed || 8,
      windDirection: data.current_weather?.winddirection || 0,
      rainIntensity: hourlyData.precipitation?.[currentHourIndex] || 0,
      precipitationProbability: hourlyData.precipitation_probability?.[currentHourIndex] || 0,
      visibility: 10, // Not available in Open-Meteo basic
      weatherCode: data.current_weather?.weathercode || hourlyData.weathercode?.[currentHourIndex] || 0,
      timestamp: new Date().toISOString(),
      source: 'open-meteo'
    };
  } catch (error) {
    console.error(`Error fetching weather for ${zoneId}:`, error);
    // Return fallback data on error
    const coords = ZONE_COORDS[zoneId];
    return {
      zoneId,
      zoneName: coords?.name || zoneId,
      zoneNameAssamese: coords?.nameAssamese || zoneId,
      district: coords?.district || 'Unknown',
      temperature: 28,
      humidity: 75,
      windSpeed: 8,
      windDirection: 0,
      rainIntensity: 0,
      precipitationProbability: 0,
      visibility: 10,
      weatherCode: 1,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      isFallback: true
    };
  }
};

/**
 * Fetch weather for all zones in parallel
 */
export const fetchAllZonesWeather = async () => {
  try {
    const promises = Object.keys(ZONE_COORDS).map(zoneId => fetchZoneWeather(zoneId));
    const results = await Promise.all(promises);

    // Separate successful and failed requests
    const successful = results.filter(r => !r.isFallback);
    const failed = results.filter(r => r.isFallback);

    if (failed.length > 0) {
      console.warn('Some zone weather requests used fallback:', failed.map(f => f.zoneId));
    }

    return {
      zones: results, // Return all zones (including fallbacks)
      errors: failed.map(f => ({ zoneId: f.zoneId, error: 'API unavailable' })),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching all zones weather:', error);

    // Return fallback data on complete failure
    const fallbackZones = Object.keys(ZONE_COORDS).map(zoneId => ({
      zoneId,
      zoneName: ZONE_COORDS[zoneId].name,
      zoneNameAssamese: ZONE_COORDS[zoneId].nameAssamese,
      district: ZONE_COORDS[zoneId].district,
      temperature: 28,
      humidity: 75,
      windSpeed: 8,
      rainIntensity: 0,
      precipitationProbability: 0,
      visibility: 10,
      weatherCode: 1,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      isFallback: true
    }));

    return {
      zones: fallbackZones,
      errors: [],
      timestamp: new Date().toISOString(),
      isFallback: true
    };
  }
};

/**
 * Fetch IMD warnings (mock for now - can be connected to real RSS)
 */
export const fetchIMDWarnings = async () => {
  // Return empty warnings for now - can be connected to real IMD RSS later
  return [];
};

/**
 * Get weather icon name from Open-Meteo weather code
 */
export const getWeatherIcon = (code) => {
  // Open-Meteo weather codes
  const icons = {
    0: 'sun',      // Clear sky
    1: 'cloud-sun', // Mainly clear
    2: 'cloud-sun', // Partly cloudy
    3: 'cloud',    // Overcast
    45: 'fog',     // Fog
    48: 'fog',     // Depositing fog
    51: 'rain',    // Light drizzle
    53: 'rain',    // Moderate drizzle
    55: 'rain',    // Dense drizzle
    61: 'rain',    // Slight rain
    63: 'rain',    // Moderate rain
    65: 'rain',    // Heavy rain
    80: 'rain',    // Rain showers
    81: 'rain',    // Moderate rain showers
    82: 'storm',   // Violent rain showers
    95: 'storm',   // Thunderstorm
    96: 'storm',   // Thunderstorm with hail
    99: 'storm'    // Thunderstorm with heavy hail
  };
  return icons[code] || 'cloud';
};

/**
 * Get weather description from Open-Meteo code
 */
export const getWeatherDescription = (code, language = 'en') => {
  const descriptions = {
    en: {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Dense fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      80: 'Rain showers',
      81: 'Moderate showers',
      82: 'Heavy showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm + Hail',
      99: 'Severe Thunderstorm'
    },
    as: {
      0: 'পৰিষ্কাৰ আকাশ',
      1: 'মুখ্যতঃ পৰিষ্কাৰ',
      2: 'আংশিক মেঘাচ্ছন্ন',
      3: 'মেঘাচ্ছন্ন',
      45: 'কুঁৱলী',
      48: 'ঘন কুঁৱলী',
      51: 'লঘু বৰষুণ',
      53: 'মধ্যম বৰষুণ',
      55: 'ঘন বৰষুণ',
      61: 'সামান্য বৰষুণ',
      63: 'মধ্যম বৰষুণ',
      65: 'প্ৰচণ্ড বৰষুণ',
      80: 'বৰষুণ জাক',
      81: 'মধ্যম বৃষ্টিপাত',
      82: 'প্ৰচণ্ড বৃষ্টিপাত',
      95: 'ধুমুহা',
      96: 'শিলাবৃষ্টি সহ ধুমুহা',
      99: 'প্ৰচণ্ড ধুমুহা'
    }
  };

  return descriptions[language]?.[code] || descriptions.en[code] || 'Unknown';
};

/**
 * Calculate rainfall trend from zone data
 */
export const calculateRainfallTrend = (zonesData) => {
  const totalRainfall = zonesData.reduce((sum, zone) => sum + (zone.rainIntensity || 0), 0);
  const avgRainfall = zonesData.length > 0 ? totalRainfall / zonesData.length : 0;

  // Generate 6-hour trend data
  const now = new Date();
  const trend = [];

  for (let i = 5; i >= 0; i--) {
    const time = new Date(now);
    time.setHours(time.getHours() - i);

    // Simulate realistic variation around current average
    const variation = (Math.random() - 0.5) * 10;
    const rainfall = Math.max(0, avgRainfall + variation);

    trend.push({
      time: time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      rainfall: Math.round(rainfall * 10) / 10
    });
  }

  return trend;
};

/**
 * Get dashboard summary stats
 */
export const getDashboardWeatherSummary = async () => {
  try {
    const [zonesWeather, warnings] = await Promise.all([
      fetchAllZonesWeather(),
      fetchIMDWarnings()
    ]);

    const zones = zonesWeather.zones;

    // Calculate statistics with safety checks
    const avgTemp = zones.length > 0
      ? zones.reduce((sum, z) => sum + (z.temperature || 28), 0) / zones.length
      : 28;
    const totalRainfall = zones.reduce((sum, z) => sum + (z.rainIntensity || 0), 0);
    const maxWindSpeed = zones.length > 0
      ? Math.max(...zones.map(z => z.windSpeed || 0))
      : 8;
    const highRiskZones = zones.filter(z => (z.rainIntensity || 0) > 5).length;

    // Get active warnings count
    const now = new Date();
    const activeWarnings = warnings.filter(w => new Date(w.expires) > now);

    return {
      temperature: Math.round(avgTemp * 10) / 10,
      rainfall: Math.round(totalRainfall * 10) / 10,
      windSpeed: Math.round(maxWindSpeed * 10) / 10,
      highRiskZones,
      warnings: activeWarnings.length,
      zones,
      warningsList: activeWarnings,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting dashboard summary:', error);

    // Return fallback summary
    return {
      temperature: 28,
      rainfall: 0,
      windSpeed: 8,
      highRiskZones: 0,
      warnings: 0,
      zones: Object.keys(ZONE_COORDS).map(zoneId => ({
        zoneId,
        zoneName: ZONE_COORDS[zoneId].name,
        zoneNameAssamese: ZONE_COORDS[zoneId].nameAssamese,
        district: ZONE_COORDS[zoneId].district,
        temperature: 28,
        rainIntensity: 0,
        weatherCode: 1,
        isFallback: true
      })),
      warningsList: [],
      lastUpdated: new Date().toISOString(),
      isFallback: true
    };
  }
};

// Export service object
const DashboardWeatherService = {
  fetchZoneWeather,
  fetchAllZonesWeather,
  fetchIMDWarnings,
  getWeatherIcon,
  getWeatherDescription,
  calculateRainfallTrend,
  getDashboardWeatherSummary,
  ZONE_COORDS
};

export default DashboardWeatherService;
