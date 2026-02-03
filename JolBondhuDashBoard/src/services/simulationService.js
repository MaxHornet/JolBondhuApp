/**
 * Simulation Service
 * Port of simulation.ts from oldproject to JavaScript
 * 
 * Provides functions to calculate flood risk and water levels
 * based on simulation parameters.
 */

/**
 * Calculate flood risk level based on simulation params
 * @param {Object} params - { rainfall, blockage, soilSaturation }
 * @returns {'High' | 'Medium' | 'Low'}
 */
export function calculateRisk(params) {
    const { rainfall, blockage, soilSaturation } = params;

    // Soil saturation modifier (0-20 effective rainfall bonus)
    const saturationBonus = (soilSaturation / 100) * 20;
    const effectiveRainfall = rainfall + saturationBonus;

    // High risk: Heavy rainfall combined with significant blockage
    if (effectiveRainfall > 100 && blockage > 50) {
        return "High";
    }

    // High risk: Extreme rainfall regardless of blockage
    if (effectiveRainfall > 150) {
        return "High";
    }

    // High risk: Extreme blockage with moderate rainfall
    if (blockage > 80 && effectiveRainfall > 60) {
        return "High";
    }

    // Low risk: Light rainfall
    if (rainfall < 30 && blockage < 40) {
        return "Low";
    }

    // Medium risk: Everything else
    return "Medium";
}

/**
 * Calculate estimated water level based on params
 * @param {Object} params - { rainfall, blockage, soilSaturation }
 * @returns {number} Water level in meters
 */
export function calculateWaterLevel(params) {
    const { rainfall, blockage, soilSaturation } = params;

    // Base water level from rainfall (mm to meters conversion)
    let baseLevel = (rainfall / 1000) * 3;

    // Blockage increases water level
    const blockageMultiplier = 1 + (blockage / 100);
    baseLevel *= blockageMultiplier;

    // Soil saturation reduces absorption
    const saturationMultiplier = 1 + (soilSaturation / 100) * 0.5;
    baseLevel *= saturationMultiplier;

    return Math.round(baseLevel * 100) / 100;
}

/**
 * Generate a simulated basin with given params
 * @param {Object} basin - Original basin data
 * @param {Object} params - Simulation parameters
 * @returns {Object} Modified basin with simulated values
 */
export function generateSimulatedBasin(basin, params) {
    const riskLevel = calculateRisk(params);
    const waterLevel = calculateWaterLevel(params);

    return {
        ...basin,
        riskLevel,
        rainfall: params.rainfall,
        drainageBlockage: params.blockage,
        estimatedWaterLevel: waterLevel,
        isSimulated: true
    };
}

/**
 * Generate all basins with simulation params
 * @param {Array} basins - Original basins array
 * @param {Object} params - Simulation parameters
 * @returns {Array} Array of simulated basins
 */
export function generateSimulatedBasins(basins, params) {
    return basins.map(basin => {
        // Add some variation per basin
        const variation = {
            rainfall: params.rainfall * (0.8 + Math.random() * 0.4),
            blockage: params.blockage * (0.7 + Math.random() * 0.6),
            soilSaturation: params.soilSaturation * (0.9 + Math.random() * 0.2)
        };

        return generateSimulatedBasin(basin, variation);
    });
}

/**
 * Generate simulated rainfall chart data
 * @param {Object} params - Simulation parameters
 * @param {number} hours - Number of hours of data to generate
 * @returns {Array} Rainfall data for chart
 */
export function generateRainfallChartData(params, hours = 6) {
    const data = [];
    const baseRainfall = params.rainfall;

    for (let i = 0; i < hours; i++) {
        const hour = new Date();
        hour.setHours(hour.getHours() - (hours - 1 - i));

        // Add some variation
        const variation = 0.5 + Math.random();
        let rainfall = Math.round(baseRainfall * variation * (i + 1) / hours);

        data.push({
            time: hour.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            rainfall: Math.min(rainfall, params.rainfall) // Cap at max
        });
    }

    return data;
}

// Default simulation parameters
export const DEFAULT_PARAMS = {
    rainfall: 50,
    blockage: 30,
    soilSaturation: 50
};

export default {
    calculateRisk,
    calculateWaterLevel,
    generateSimulatedBasin,
    generateSimulatedBasins,
    generateRainfallChartData,
    DEFAULT_PARAMS
};
