const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'db.json');

const rewardFields = {
  rewardAmount: null,
  rewardStatus: 'pending',
  rewardReason: '',
  upiId: '',
  verifiers: [],
  incidentId: '',
  approvedAt: null,
  rejectedAt: null,
  disbursedAt: null
};

function addRewardFieldsToReports(reports) {
  return reports.map(report => ({
    ...report,
    ...rewardFields
  }));
}

async function updateDB() {
  try {
    console.log('Reading db.json...');
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const db = JSON.parse(data);

    if (db.reports && db.reports.length > 0) {
      console.log(`Found ${db.reports.length} reports. Adding reward fields...`);
      db.reports = addRewardFieldsToReports(db.reports);

      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
      console.log('Successfully updated db.json with reward fields!');
    } else {
      console.log('No reports found in db.json');
    }
  } catch (error) {
    console.error('Error updating db.json:', error.message);
    process.exit(1);
  }
}

updateDB();
