/**
 * Open-Meteo Weather Service
 * 
 * Fetches real-time weather data from Open-Meteo API
 * Free API, no authentication required
 */

const API_URL = 'https://api.open-meteo.com/v1/forecast';

// Default coordinates for Guwahati, Assam
const DEFAULT_COORDS = {
    lat: 26.1844,
    lon: 91.7458
};

/**
 * Fetch weather data from Open-Meteo API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 */
export async function fetchWeather(lat = DEFAULT_COORDS.lat, lon = DEFAULT_COORDS.lon) {
    try {
        const params = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            hourly: 'temperature_2m,rain,precipitation_probability,precipitation,is_day,weathercode',
            daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode',
            current_weather: 'true',
            timezone: 'auto',
            past_days: 7,  // Include 7 days of historical data
            forecast_days: 7  // 7 days of forecast
        });

        const response = await fetch(`${API_URL}?${params}`);

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
}

/**
 * Get current weather data formatted for the app
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Formatted current weather
 */
export async function getCurrentWeather(lat, lon) {
    const data = await fetchWeather(lat, lon);

    if (!data || !data.current_weather) {
        return null;
    }

    // Find current hour index in hourly data
    const now = new Date();
    const currentHour = now.getHours();
    const currentHourIndex = data.hourly?.time?.findIndex(time => {
        const hour = new Date(time).getHours();
        return hour === currentHour;
    }) || 0;

    // Get hourly data for current hour
    const hourlyData = data.hourly || {};

    return {
        temperature: data.current_weather.temperature,
        weatherCode: data.current_weather.weathercode,
        windSpeed: data.current_weather.windspeed,
        windDirection: data.current_weather.winddirection,
        isDay: hourlyData.is_day?.[currentHourIndex] === 1,

        // Precipitation data - what user requested instead of humidity/visibility
        precipitationProbability: hourlyData.precipitation_probability?.[currentHourIndex] || 0,
        precipitation: hourlyData.precipitation?.[currentHourIndex] || 0,
        rain: hourlyData.rain?.[currentHourIndex] || 0,

        // Daily summary
        maxTemp: data.daily?.temperature_2m_max?.[0] || null,
        minTemp: data.daily?.temperature_2m_min?.[0] || null,
        dailyPrecipitation: data.daily?.precipitation_sum?.[0] || 0,
        dailyPrecipProbability: data.daily?.precipitation_probability_max?.[0] || 0,

        // Metadata
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Get weather description from code
 * @param {number} code - Weather code from API
 * @param {string} language - 'en' or 'as'
 * @returns {string} Weather description
 */
export function getWeatherDescription(code, language = 'en') {
    const descriptions = {
        en: {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Depositing fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with hail',
            99: 'Thunderstorm with heavy hail'
        },
        as: {
            0: 'পৰিষ্কাৰ আকাশ',
            1: 'মুখ্যতঃ পৰিষ্কাৰ',
            2: 'আংশিকভাৱে মেঘাচ্ছন্ন',
            3: 'মেঘাচ্ছন্ন',
            45: 'কুঁৱলী',
            48: 'ঘন কুঁৱলী',
            51: 'লঘু টোপাল বৰষুণ',
            53: 'মধ্যম টোপাল বৰষুণ',
            55: 'ঘন টোপাল বৰষুণ',
            61: 'সামান্য বৰষুণ',
            63: 'মধ্যম বৰষুণ',
            65: 'প্ৰচণ্ড বৰষুণ',
            71: 'সামান্য বৰফ',
            73: 'মধ্যম বৰফ',
            75: 'প্ৰচণ্ড বৰফ',
            80: 'সামান্য বৰষুণ জাক',
            81: 'মধ্যম বৰষুণ জাক',
            82: 'প্ৰচণ্ড বৰষুণ জাক',
            95: 'ধুমুহা',
            96: 'শিলাবৃষ্টি সহ ধুমুহা',
            99: 'প্ৰচণ্ড শিলাবৃষ্টি সহ ধুমুহা'
        }
    };

    const langDescriptions = descriptions[language] || descriptions.en;
    return langDescriptions[code] || (language === 'as' ? 'অজ্ঞাত' : 'Unknown');
}

/**
 * Get hourly forecast for next 12 hours
 * @param {number} lat - Latitude  
 * @param {number} lon - Longitude
 * @returns {Promise<Array>} Hourly forecast data
 */
export async function getHourlyForecast(lat, lon) {
    const data = await fetchWeather(lat, lon);

    if (!data?.hourly?.time) {
        return [];
    }

    const now = new Date();
    const forecast = [];

    for (let i = 0; i < Math.min(12, data.hourly.time.length); i++) {
        const time = new Date(data.hourly.time[i]);

        // Only include future hours
        if (time < now) continue;

        forecast.push({
            time: data.hourly.time[i],
            temperature: data.hourly.temperature_2m[i],
            precipitationProbability: data.hourly.precipitation_probability[i],
            precipitation: data.hourly.precipitation[i],
            weatherCode: data.hourly.weathercode[i],
            isDay: data.hourly.is_day[i] === 1
        });

        if (forecast.length >= 6) break;
    }

    return forecast;
}

/**
 * Get historical weather data for past 7 days
 * @param {number} lat - Latitude  
 * @param {number} lon - Longitude
 * @returns {Promise<Array>} Historical daily data
 */
export async function getHistoricalData(lat, lon) {
    const data = await fetchWeather(lat, lon);

    if (!data?.daily?.time) {
        return [];
    }

    // past_days=7 means we get 7 historical days before today
    // Total days = past_days (7) + 1 (today) + forecast_days (7) = 15 days
    // Historical data is in indices 0-6 (7 days)
    const historical = [];

    for (let i = 0; i < 7; i++) {
        historical.push({
            date: data.daily.time[i],
            maxTemp: data.daily.temperature_2m_max[i],
            minTemp: data.daily.temperature_2m_min[i],
            precipitation: data.daily.precipitation_sum[i] || 0,
            weatherCode: data.daily.weathercode[i]
        });
    }

    return historical;
}

export default {
    fetchWeather,
    getCurrentWeather,
    getWeatherDescription,
    getHourlyForecast,
    getHistoricalData,
    DEFAULT_COORDS
};
