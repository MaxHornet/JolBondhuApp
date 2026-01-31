/**
 * Water Level Service for JolBondhu
 * 
 * Provides river water level data and flood risk assessment
 * Sources:
 * 1. Assam Water Resources Department (static danger levels)
 * 2. CWC (Central Water Commission) - when available
 * 3. Calculated estimates based on rainfall + historical patterns
 * 
 * Note: Real-time water level APIs require government authentication
 * This service uses baseline danger levels + weather correlation
 */

// River gauge stations and their danger levels
// Source: https://waterresources.assam.gov.in/portlets/flood-information-system
const RIVER_STATIONS = {
  'brahmaputra-guwahati': {
    name: 'Brahmaputra at Guwahati D.C. Court',
    nameAssamese: 'গুৱাহাটী ডি.চি. কোৰ্টত ব্ৰহ্মপুত্ৰ',
    district: 'Kamrup',
    dangerLevel: 49.68, // meters
    highestFloodLevel: 51.46, // meters
    highestFloodDate: '21.7.2004',
    coords: { lat: 26.1445, lng: 91.6616 },
    zones: ['jalukbari', 'maligaon', 'fancy-bazar', 'bharalumukh']
  },
  'brahmaputra-dibrugarh': {
    name: 'Brahmaputra at Dibrugarh',
    nameAssamese: 'ডিব্ৰুগড়ত ব্ৰহ্মপুত্ৰ',
    district: 'Dibrugarh',
    dangerLevel: 105.70,
    highestFloodLevel: 106.48,
    highestFloodDate: '3.9.1998',
    coords: { lat: 27.4728, lng: 94.9120 },
    zones: []
  },
  'brahmaputra-tezpur': {
    name: 'Brahmaputra at Tezpur',
    nameAssamese: 'তেজপুৰত ব্ৰহ্মপুত্ৰ',
    district: 'Sonitpur',
    dangerLevel: 65.23,
    highestFloodLevel: 66.59,
    highestFloodDate: '27.8.1988',
    coords: { lat: 26.6333, lng: 92.8000 },
    zones: ['brahmaputra-north']
  },
  'brahmaputra-goalpara': {
    name: 'Brahmaputra at Goalpara',
    nameAssamese: 'গোৱালপাৰাত ব্ৰহ্মপুত্ৰ',
    district: 'Goalpara',
    dangerLevel: 36.27,
    highestFloodLevel: 37.43,
    highestFloodDate: '7.1954',
    coords: { lat: 26.1667, lng: 90.6167 },
    zones: []
  },
  'barak': {
    name: 'Barak at A.P. Ghat',
    nameAssamese: 'এ.পি. ঘাটত বৰাক',
    district: 'Cachar',
    dangerLevel: 19.83,
    highestFloodLevel: 21.84,
    highestFloodDate: '1.8.1989',
    coords: { lat: 24.8333, lng: 92.8000 },
    zones: []
  }
};

// Historical correlation: rainfall to water level rise (approximate)
// Based on typical Brahmaputra basin hydrology
const RAINFALL_CORRELATION = {
  light: { threshold: 0, levelRise: 0.1, timeLag: 12 }, // 0-10mm, 12h lag
  moderate: { threshold: 10, levelRise: 0.3, timeLag: 8 }, // 10-30mm, 8h lag
  heavy: { threshold: 30, levelRise: 0.8, timeLag: 6 }, // 30-70mm, 6h lag
  veryHeavy: { threshold: 70, levelRise: 1.5, timeLag: 4 } // >70mm, 4h lag
};

/**
 * Get river station data by zone
 * @param {string} zoneId - Zone identifier
 * @returns {Object|null} Station data
 */
export const getStationByZone = (zoneId) => {
  const station = Object.values(RIVER_STATIONS).find(s => 
    s.zones.includes(zoneId)
  );
  return station || RIVER_STATIONS['brahmaputra-guwahati']; // Default to Guwahati
};

/**
 * Calculate estimated water level based on rainfall data
 * This is a fallback when real-time gauge data is unavailable
 * @param {string} zoneId - Zone identifier
 * @param {number} rainfall24h - 24-hour rainfall in mm
 * @param {number} currentLevel - Current level if known (optional)
 * @returns {Object} Water level estimate
 */
export const estimateWaterLevel = (zoneId, rainfall24h = 0, currentLevel = null) => {
  const station = getStationByZone(zoneId);
  
  // Determine rainfall category
  let category = 'light';
  if (rainfall24h >= 70) category = 'veryHeavy';
  else if (rainfall24h >= 30) category = 'heavy';
  else if (rainfall24h >= 10) category = 'moderate';
  
  const correlation = RAINFALL_CORRELATION[category];
  
  // Estimate current level
  let estimatedLevel;
  if (currentLevel) {
    // If we have current level, add projected rise
    estimatedLevel = currentLevel + correlation.levelRise;
  } else {
    // Otherwise estimate from danger level baseline
    // Assume river is at 60% of danger level during normal conditions
    const baseLevel = station.dangerLevel * 0.6;
    estimatedLevel = baseLevel + correlation.levelRise;
  }
  
  // Calculate status
  const status = getWaterLevelStatus(estimatedLevel, station.dangerLevel);
  
  return {
    station: station.name,
    stationAssamese: station.nameAssamese,
    currentLevel: parseFloat(estimatedLevel.toFixed(2)),
    dangerLevel: station.dangerLevel,
    highestFloodLevel: station.highestFloodLevel,
    status: status.level,
    statusAssamese: status.levelAssamese,
    trend: status.trend,
    rainfall24h,
    estimatedRise: correlation.levelRise,
    timeToPeak: correlation.timeLag,
    lastUpdated: new Date().toISOString(),
    isEstimated: true,
    source: 'Calculated from rainfall correlation'
  };
};

/**
 * Determine water level status
 */
const getWaterLevelStatus = (level, dangerLevel) => {
  const ratio = level / dangerLevel;
  
  if (ratio >= 1.0) {
    return { 
      level: 'danger', 
      levelAssamese: 'বিপদ', 
      trend: 'critical',
      color: 'red'
    };
  } else if (ratio >= 0.85) {
    return { 
      level: 'warning', 
      levelAssamese: 'সতৰ্কবাণী', 
      trend: 'rising',
      color: 'orange'
    };
  } else if (ratio >= 0.70) {
    return { 
      level: 'alert', 
      levelAssamese: 'সতৰ্ক', 
      trend: 'moderate',
      color: 'yellow'
    };
  } else {
    return { 
      level: 'normal', 
      levelAssamese: 'স্বাভাৱিক', 
      trend: 'stable',
      color: 'green'
    };
  }
};

/**
 * Get all stations for dashboard
 * @returns {Array} All river stations
 */
export const getAllStations = () => {
  return Object.entries(RIVER_STATIONS).map(([id, station]) => ({
    id,
    ...station,
    status: 'normal', // Default status
    currentLevel: station.dangerLevel * 0.6 // Estimate at 60% of danger
  }));
};

/**
 * Calculate flood risk for all zones
 * Combines water level + weather data
 * @param {Object} weatherData - Weather data from weatherService
 * @returns {Array} Zone risk levels
 */
export const calculateZoneRisks = (weatherData) => {
  const zones = ['jalukbari', 'maligaon', 'fancy-bazar', 'bharalumukh', 'brahmaputra-north', 'barpeta'];
  
  return zones.map(zoneId => {
    const station = getStationByZone(zoneId);
    const rainfall = weatherData?.current?.rainIntensity || 0;
    
    // Get water level estimate
    const waterLevel = estimateWaterLevel(zoneId, rainfall * 24); // Convert to 24h estimate
    
    // Calculate combined risk
    let riskLevel = 'low';
    const weatherRisk = weatherData?.riskLevel || 'low';
    
    if (waterLevel.status === 'danger' || weatherRisk === 'high') {
      riskLevel = 'high';
    } else if (waterLevel.status === 'warning' || waterLevel.status === 'alert' || weatherRisk === 'medium') {
      riskLevel = 'medium';
    }
    
    return {
      zoneId,
      district: station.district,
      waterLevel,
      weatherRisk,
      overallRisk: riskLevel,
      recommendedAction: getRecommendedAction(riskLevel)
    };
  });
};

/**
 * Get recommended action based on risk level
 */
const getRecommendedAction = (riskLevel) => {
  const actions = {
    high: {
      en: 'Immediate evacuation recommended. Move to higher ground.',
      as: 'তৎক্ষণাত উদ্বাসন পৰামৰ্শ দিয়া হৈছে। ওখ ঠাইলৈ যাওক।'
    },
    medium: {
      en: 'Stay alert. Prepare emergency kit. Monitor updates.',
      as: 'সতৰ্ক থাকক। জৰুৰীকালীন কিট সাজু কৰক। আপডেট নিৰীক্ষণ কৰক।'
    },
    low: {
      en: 'Normal conditions. Continue monitoring.',
      as: 'স্বাভাৱিক পৰিস্থিতি। নিৰীক্ষণ জাৰি ৰাখক।'
    }
  };
  
  return actions[riskLevel] || actions.low;
};

/**
 * Get historical flood data for a station
 * @param {string} stationId - Station identifier
 * @returns {Object} Historical flood information
 */
export const getHistoricalFloodData = (stationId) => {
  const station = RIVER_STATIONS[stationId];
  if (!station) return null;
  
  return {
    highestFloodLevel: station.highestFloodLevel,
    highestFloodDate: station.highestFloodDate,
    dangerLevel: station.dangerLevel,
    floodHistory: [
      { year: 2004, level: 51.46, date: '21.7.2004' },
      { year: 1998, level: 51.10, date: '12.9.1998' },
      { year: 1988, level: 50.80, date: '15.8.1988' }
    ]
  };
};

// Export service object
const WaterLevelService = {
  getStationByZone,
  estimateWaterLevel,
  getAllStations,
  calculateZoneRisks,
  getHistoricalFloodData,
  RIVER_STATIONS
};

export default WaterLevelService;
