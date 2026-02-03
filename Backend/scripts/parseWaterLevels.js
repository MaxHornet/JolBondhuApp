/**
 * Water Level Data Parser
 * Parses water_level_data.csv and generates JSON for db.json
 */

const fs = require('fs');
const path = require('path');

// Read CSV file - it's in the HACKATHON root directory
const csvPath = path.join(__dirname, '..', '..', 'water_level_data.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvContent.split('\n');
const headers = lines[0].split(',');

const waterLevels = [];

for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV with commas in quoted fields
    const values = line.split(',');

    const station = {
        id: `wl_${values[0]}`,
        stationCode: values[2],
        name: values[6],
        lat: parseFloat(values[3]),
        lon: parseFloat(values[4]),
        district: values[9],
        rcName: values[10],
        riverName: values[15],
        basinName: values[16],
        highFlowLevel: parseFloat(values[11]) || null,
        dangerFlowLevel: parseFloat(values[12]) || null,
        warningFlowLevel: parseFloat(values[13]) || null,
        currentFlowLevel: parseFloat(values[14]) || null,
        lastUpdate: values[17],
        riskColor: values[18],
        type: values[7]
    };

    // Calculate risk level
    if (station.currentFlowLevel && station.dangerFlowLevel) {
        const ratio = station.currentFlowLevel / station.dangerFlowLevel;
        if (ratio >= 0.95) {
            station.riskLevel = 'High';
        } else if (ratio >= 0.8) {
            station.riskLevel = 'Medium';
        } else {
            station.riskLevel = 'Low';
        }
    } else {
        station.riskLevel = 'Low';
    }

    waterLevels.push(station);
}

// Output as JSON
console.log(JSON.stringify(waterLevels, null, 2));

// Write to file
const outputPath = path.join(__dirname, 'water_levels.json');
fs.writeFileSync(outputPath, JSON.stringify(waterLevels, null, 2));
console.log(`\nWritten ${waterLevels.length} stations to ${outputPath}`);
