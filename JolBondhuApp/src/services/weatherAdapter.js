/**
 * Weather Adapter
 * 
 * Adapts Open-Meteo API response to match the expected format
 * for existing components (originally designed for Tomorrow.io)
 */

/**
 * Calculate risk level from precipitation data
 */
const calculateRiskFromPrecipitation = (weatherData) => {
    const precip = weatherData.precipitation || weatherData.rain || 0;
    const precipProb = weatherData.precipitationProbability || 0;

    if (precip > 10 || precipProb > 80) return 'high';
    if (precip > 5 || precipProb > 60) return 'medium';
    return 'low';
};

/**
 * Convert Open-Meteo WMO code to Tomorrow.io code
 * This ensures existing UI components display correct icons
 */
const convertWeatherCode = (wmoCode) => {
    // Clear
    if (wmoCode === 0) return 1000;

    // Cloudy / Partly Cloudy
    if (wmoCode <= 3) return 1100;

    // Fog
    if (wmoCode === 45 || wmoCode === 48) return 2000;

    // Drizzle
    if (wmoCode >= 51 && wmoCode <= 57) return 4000;

    // Rain
    if (wmoCode >= 61 && wmoCode <= 67) return 4001; // Rain
    if (wmoCode >= 80 && wmoCode <= 82) return 4200; // Heavy Rain

    // Snow
    if (wmoCode >= 71 && wmoCode <= 77) return 5000;
    if (wmoCode === 85 || wmoCode === 86) return 5100;

    // Thunderstorm
    if (wmoCode >= 95) return 8000;

    return 1001; // Default to Cloudy
};

/**
 * Adapt Open-Meteo current weather to Tomorrow.io format
 */
export const adaptCurrentWeather = (openMeteoData) => {
    if (!openMeteoData) return null;

    return {
        temperature: openMeteoData.temperature,
        feelsLike: openMeteoData.temperature, // Open-Meteo doesn't provide feels-like
        humidity: 70, // Not available in Open-Meteo, use reasonable default
        windSpeed: openMeteoData.windSpeed || 0,
        windDirection: openMeteoData.windDirection || 0,
        visibility: 10, // Not available, use default
        weatherCode: convertWeatherCode(openMeteoData.weatherCode), // CONVERTED
        rainIntensity: openMeteoData.rain || 0,
        precipitation: openMeteoData.precipitation || 0,
        precipitationProbability: openMeteoData.precipitationProbability || 0,
        maxTemp: openMeteoData.maxTemp,
        minTemp: openMeteoData.minTemp,
        isDay: openMeteoData.isDay
    };
};

/**
 * Adapt Open-Meteo hourly forecast to Tomorrow.io format
 */
export const adaptHourlyForecast = (hourlyData) => {
    if (!Array.isArray(hourlyData)) return [];

    return hourlyData.map(hour => ({
        time: hour.time,
        temperature: hour.temperature,
        weatherCode: convertWeatherCode(hour.weatherCode), // CONVERTED
        rainProbability: hour.precipitationProbability || 0,
        precipitation: hour.precipitation || 0,
        isDay: hour.isDay
    }));
};

/**
 * Adapt complete Open-Meteo response to unified weather format
 */
export const adaptOpenMeteoToUnified = (currentData, forecastData = []) => {
    return {
        current: adaptCurrentWeather(currentData),
        forecast: adaptHourlyForecast(forecastData),
        warnings: [], // IMD warnings handled separately
        riskLevel: calculateRiskFromPrecipitation(currentData || {}),
        updatedAt: new Date().toISOString(),
        isFallback: false,
        source: 'open-meteo'
    };
};

export default {
    adaptCurrentWeather,
    adaptHourlyForecast,
    adaptOpenMeteoToUnified,
    calculateRiskFromPrecipitation
};
