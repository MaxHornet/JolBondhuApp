/**
 * Merge water levels into db.json
 */

const fs = require('fs');
const path = require('path');

// Read db.json
const dbPath = path.join(__dirname, '..', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// Read water levels JSON
const waterLevelsPath = path.join(__dirname, 'water_levels.json');
const waterLevels = JSON.parse(fs.readFileSync(waterLevelsPath, 'utf-8'));

// Add waterLevels collection to db
db.waterLevels = waterLevels;

// Write back to db.json
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`Added ${waterLevels.length} water level stations to db.json`);
console.log('Collections in db.json:', Object.keys(db).join(', '));
