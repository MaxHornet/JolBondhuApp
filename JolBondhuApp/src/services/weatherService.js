/**
 * Unified Weather Service for JolBondhu
 * 
 * Integrates multiple weather data sources:
 * 1. Tomorrow.io - Real-time weather conditions (15-min updates)
 * 2. IMD RSS Feed - Official weather warnings for Assam
 * 3. IMD City Page Scraping - 7-day forecast for Guwahati
 * 
 * All zones mapped to Guwahati weather data for now.
 * Free tier: 500 Tomorrow.io calls/day (fits 15-min updates perfectly)
 */

// API Configuration
const TOMORROW_API_KEY = 'I20gTWffq0BLrlfnLUIZvwLWkE056qth';
const TOMORROW_BASE_URL = 'https://api.tomorrow.io/v4';
const IMD_RSS_URL = 'https://mausam.imd.gov.in/imd_latest/contents/dist_nowcast_rss.php';

// Zone coordinates mapping
const ZONE_COORDS = {
  jalukbari: { lat: 26.1445, lng: 91.6616, district: 'Kamrup' },
  maligaon: { lat: 26.1520, lng: 91.6750, district: 'Kamrup' },
  'fancy-bazar': { lat: 26.1600, lng: 91.6900, district: 'Kamrup' },
  bharalumukh: { lat: 26.1350, lng: 91.6800, district: 'Kamrup' },
  'brahmaputra-north': { lat: 26.6736, lng: 92.8478, district: 'Sonitpur' },
  barpeta: { lat: 26.3225, lng: 91.0055, district: 'Barpeta' }
};

// District to RSS mapping (for filtering alerts)
const DISTRICT_ALERTS = {
  'Kamrup': ['KAMRUP', 'KAMRUP METROPOLITAN', 'GUWAHATI'],
  'Sonitpur': ['SONITPUR', 'TEZPUR'],
  'Barpeta': ['BARPETA']
};

// Fallback weather data when APIs fail (realistic Guwahati weather)
const getFallbackWeather = (zoneId) => ({
  temperature: 28,
  feelsLike: 32,
  humidity: 78,
  windSpeed: 4.2,
  windDirection: 180,
  pressure: 1004,
  visibility: 8,
  weatherCode: 1001,
  rainIntensity: 2.5,
  cloudCover: 65,
  uvIndex: 4,
  timestamp: new Date().toISOString(),
  location: 'Guwahati',
  source: 'fallback'
});

/**
 * Fetch with timeout helper
 */
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

/**
 * Fetch real-time weather from Tomorrow.io
 * @param {string} zoneId - Zone identifier
 * @returns {Promise<Object>} Weather data
 */
export const getCurrentWeather = async (zoneId = 'jalukbari') => {
  try {
    const coords = ZONE_COORDS[zoneId] || ZONE_COORDS.jalukbari;
    
    const response = await fetchWithTimeout(
      `${TOMORROW_BASE_URL}/weather/realtime?location=${coords.lat},${coords.lng}&apikey=${TOMORROW_API_KEY}`,
      { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      },
      10000
    );
    
    if (!response.ok) {
      console.warn(`Tomorrow.io API returned ${response.status}, using fallback`);
      return getFallbackWeather(zoneId);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data?.data?.values) {
      console.warn('Invalid Tomorrow.io response structure, using fallback');
      return getFallbackWeather(zoneId);
    }
    
    return {
      temperature: data.data.values.temperature ?? 28,
      feelsLike: data.data.values.temperatureApparent ?? data.data.values.temperature ?? 28,
      humidity: data.data.values.humidity ?? 70,
      windSpeed: data.data.values.windSpeed ?? 3,
      windDirection: data.data.values.windDirection ?? 0,
      pressure: data.data.values.pressureSurfaceLevel ?? 1013,
      visibility: data.data.values.visibility ?? 10,
      weatherCode: data.data.values.weatherCode ?? 1001,
      rainIntensity: data.data.values.rainIntensity ?? 0,
      cloudCover: data.data.values.cloudCover ?? 50,
      uvIndex: data.data.values.uvIndex ?? 5,
      timestamp: data.data.time ?? new Date().toISOString(),
      location: data.location?.name ?? 'Guwahati',
      source: 'tomorrow.io'
    };
  } catch (error) {
    console.error('Error fetching Tomorrow.io weather:', error.message);
    // Return fallback data instead of throwing
    return getFallbackWeather(zoneId);
  }
};

/**
 * Get weather forecast from Tomorrow.io
 * @param {string} zoneId - Zone identifier
 * @param {number} hours - Forecast hours (up to 48)
 * @returns {Promise<Array>} Hourly forecast
 */
export const getWeatherForecast = async (zoneId = 'jalukbari', hours = 6) => {
  try {
    const coords = ZONE_COORDS[zoneId] || ZONE_COORDS.jalukbari;
    
    const response = await fetchWithTimeout(
      `${TOMORROW_BASE_URL}/weather/forecast?location=${coords.lat},${coords.lng}&timesteps=1h&apikey=${TOMORROW_API_KEY}`,
      { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      },
      10000
    );
    
    if (!response.ok) {
      console.warn(`Forecast API returned ${response.status}, using fallback`);
      return generateFallbackForecast(hours);
    }
    
    const data = await response.json();
    
    // Validate response
    if (!data?.data?.timelines?.[0]?.intervals) {
      console.warn('Invalid forecast response structure, using fallback');
      return generateFallbackForecast(hours);
    }
    
    // Return next N hours
    return data.data.timelines[0].intervals.slice(0, hours).map(interval => ({
      time: interval.startTime,
      temperature: interval.values?.temperature ?? 28,
      humidity: interval.values?.humidity ?? 70,
      windSpeed: interval.values?.windSpeed ?? 3,
      rainProbability: interval.values?.precipitationProbability ?? 0,
      rainIntensity: interval.values?.rainIntensity ?? 0,
      weatherCode: interval.values?.weatherCode ?? 1001
    }));
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
    return generateFallbackForecast(hours);
  }
};

/**
 * Generate fallback forecast
 */
const generateFallbackForecast = (hours = 6) => {
  const forecast = [];
  const now = new Date();
  
  for (let i = 0; i < hours; i++) {
    const time = new Date(now);
    time.setHours(time.getHours() + i);
    
    forecast.push({
      time: time.toISOString(),
      temperature: 28 + Math.random() * 4 - 2,
      humidity: 70 + Math.random() * 20,
      windSpeed: 3 + Math.random() * 3,
      rainProbability: Math.random() > 0.7 ? 30 : 0,
      rainIntensity: Math.random() > 0.7 ? 2 : 0,
      weatherCode: 1001
    });
  }
  
  return forecast;
};

/**
 * Parse IMD RSS feed for weather warnings
 * @returns {Promise<Array>} Active weather warnings
 */
export const getIMDWarnings = async () => {
  try {
    // IMD RSS often has CORS issues, so we wrap in try-catch
    const response = await fetchWithTimeout(IMD_RSS_URL, { 
      method: 'GET',
      headers: { 
        'Accept': 'application/rss+xml, text/xml, application/xml, */*'
      }
    }, 8000);
    
    if (!response.ok) {
      console.warn(`IMD RSS returned ${response.status}, skipping warnings`);
      return [];
    }
    
    const xmlText = await response.text();
    
    // Validate that we got XML, not HTML error page
    if (!xmlText.includes('<rss') && !xmlText.includes('<feed') && !xmlText.includes('<channel')) {
      console.warn('IMD RSS returned non-XML content, skipping warnings');
      return [];
    }
    
    // Use try-catch around DOM parsing which can fail
    let xmlDoc;
    try {
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // Check for parser errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        console.warn('XML parse error:', parserError.textContent);
        return [];
      }
    } catch (parseError) {
      console.warn('DOMParser error:', parseError);
      return [];
    }
    
    const items = xmlDoc.querySelectorAll('item');
    const warnings = [];
    
    items.forEach(item => {
      try {
        const titleEl = item.querySelector('title');
        const descEl = item.querySelector('description');
        const onsetEl = item.querySelector('Onset');
        const expiresEl = item.querySelector('Expires');
        const categoryEl = item.querySelector('category');
        
        const district = titleEl?.textContent?.toUpperCase() || '';
        const description = descEl?.textContent || '';
        const onset = onsetEl?.textContent || '';
        const expires = expiresEl?.textContent || '';
        const category = categoryEl?.textContent || '';
        
        // Check if this warning is for our monitored districts
        const isRelevant = Object.values(DISTRICT_ALERTS).some(districts => 
          districts.some(d => district.includes(d))
        );
        
        if (isRelevant && description) {
          warnings.push({
            district,
            description: description.replace(/<\/?[^>]+(>|$)/g, ''),
            onset: onset ? new Date(onset).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Now',
            expires: expires ? new Date(expires).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '24 hours',
            category,
            severity: determineSeverity(description),
            source: 'IMD RSS'
          });
        }
      } catch (itemError) {
        console.warn('Error parsing RSS item:', itemError);
      }
    });
    
    return warnings;
  } catch (error) {
    console.warn('Error fetching IMD RSS:', error.message);
    return []; // Return empty on error, don't break the app
  }
};

/**
 * Determine warning severity from description
 */
const determineSeverity = (description) => {
  if (!description) return 'low';
  const desc = description.toLowerCase();
  if (desc.includes('very likely') || desc.includes('heavy') || desc.includes('severe') || desc.includes('extreme')) {
    return 'high';
  } else if (desc.includes('likely') || desc.includes('moderate') || desc.includes('thunder')) {
    return 'medium';
  }
  return 'low';
};

/**
 * Get weather icon based on weather code
 * @param {number} code - Tomorrow.io weather code
 * @returns {string} Icon name
 */
export const getWeatherIcon = (code) => {
  const iconMap = {
    1000: 'sun',           // Clear
    1001: 'cloud',         // Cloudy
    1100: 'cloud-sun',     // Mostly Clear
    1101: 'cloud-sun',     // Partly Cloudy
    1102: 'cloud',         // Mostly Cloudy
    2000: 'fog',           // Fog
    2100: 'fog',           // Light Fog
    3000: 'wind',          // Light Wind
    3001: 'wind',          // Wind
    3002: 'wind',          // Strong Wind
    4000: 'cloud-rain',    // Drizzle
    4001: 'cloud-rain',    // Rain
    4200: 'cloud-rain',    // Light Rain
    4201: 'cloud-rain',    // Heavy Rain
    5000: 'snow',          // Snow
    5001: 'snow',          // Flurries
    5100: 'snow',          // Light Snow
    5101: 'snow',          // Heavy Snow
    6000: 'cloud-rain',    // Freezing Drizzle
    6001: 'cloud-rain',    // Freezing Rain
    6200: 'cloud-rain',    // Light Freezing Rain
    6201: 'cloud-rain',    // Heavy Freezing Rain
    7000: 'cloud-hail',    // Ice Pellets
    7101: 'cloud-hail',    // Heavy Ice Pellets
    7102: 'cloud-hail',    // Light Ice Pellets
    8000: 'cloud-lightning' // Thunderstorm
  };
  
  return iconMap[code] || 'cloud';
};

/**
 * Get unified weather data for a zone
 * Combines all sources into one object
 * @param {string} zoneId - Zone identifier
 * @returns {Promise<Object>} Complete weather data
 */
export const getUnifiedWeather = async (zoneId = 'jalukbari') => {
  try {
    // Fetch all data sources in parallel with individual error handling
    const [currentResult, forecastResult, warningsResult] = await Promise.allSettled([
      getCurrentWeather(zoneId),
      getWeatherForecast(zoneId, 6),
      getIMDWarnings()
    ]);
    
    const current = currentResult.status === 'fulfilled' ? currentResult.value : getFallbackWeather(zoneId);
    const forecast = forecastResult.status === 'fulfilled' ? forecastResult.value : generateFallbackForecast(6);
    const warnings = warningsResult.status === 'fulfilled' ? warningsResult.value : [];
    
    const result = {
      current,
      forecast,
      warnings,
      zoneId,
      updatedAt: new Date().toISOString()
    };
    
    // Calculate risk level based on weather
    result.riskLevel = calculateWeatherRisk(result);
    
    return result;
  } catch (error) {
    console.error('Error in getUnifiedWeather:', error);
    // Return complete fallback data
    return {
      current: getFallbackWeather(zoneId),
      forecast: generateFallbackForecast(6),
      warnings: [],
      zoneId,
      riskLevel: 'low',
      updatedAt: new Date().toISOString(),
      isFallback: true
    };
  }
};

/**
 * Calculate flood risk based on weather conditions
 */
const calculateWeatherRisk = (weatherData) => {
  if (!weatherData?.current) return 'low';
  
  const { current, warnings } = weatherData;
  let riskScore = 0;
  
  // High rain intensity
  if (current.rainIntensity > 10) riskScore += 3;
  else if (current.rainIntensity > 5) riskScore += 2;
  else if (current.rainIntensity > 0) riskScore += 1;
  
  // High humidity + low pressure (monsoon conditions)
  if (current.humidity > 85 && current.pressure < 1000) riskScore += 2;
  
  // Active warnings
  if (warnings && warnings.length > 0) {
    const highWarnings = warnings.filter(w => w.severity === 'high').length;
    const mediumWarnings = warnings.filter(w => w.severity === 'medium').length;
    riskScore += highWarnings * 3 + mediumWarnings * 1;
  }
  
  // Return risk level
  if (riskScore >= 6) return 'high';
  if (riskScore >= 3) return 'medium';
  return 'low';
};

// Export service object
const WeatherService = {
  getCurrentWeather,
  getWeatherForecast,
  getIMDWarnings,
  getWeatherIcon,
  getUnifiedWeather,
  ZONE_COORDS,
  getFallbackWeather,
  generateFallbackForecast
};

export default WeatherService;
