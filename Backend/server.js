const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { broadcastNotifications } = require('./services/twilioService');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3001;
const REPORT_LIMIT = 10;
const BACKUP_FILE = path.join(__dirname, 'report_backup.json');

// Automated cleanup function for old reports
const cleanupOldReports = async () => {
    try {
        const db = router.db;
        const reports = db.get('reports').value() || [];

        if (reports.length > REPORT_LIMIT) {
            // Sort by timestamp (oldest first)
            const sortedReports = reports.sort((a, b) =>
                new Date(a.timestamp) - new Date(b.timestamp)
            );

            // Get reports to archive (oldest 5, keeping only latest 10)
            const reportsToArchive = sortedReports.slice(0, reports.length - REPORT_LIMIT);
            const reportsToKeep = sortedReports.slice(reports.length - REPORT_LIMIT);

            // Archive to backup file
            let backupData = { reports: [] };
            try {
                if (fs.existsSync(BACKUP_FILE)) {
                    const backupContent = fs.readFileSync(BACKUP_FILE, 'utf8');
                    backupData = JSON.parse(backupContent);
                }
            } catch (e) {
                // Backup file doesn't exist yet, start fresh
            }

            backupData.reports = [...backupData.reports, ...reportsToArchive];

            // Add archive metadata
            backupData.lastArchiveDate = new Date().toISOString();
            backupData.archivedCount = reportsToArchive.length;

            fs.writeFileSync(BACKUP_FILE, JSON.stringify(backupData, null, 2));

            // Update main DB with only reports to keep
            db.set('reports', reportsToKeep).write();

            console.log(`[Cleanup] Archived ${reportsToArchive.length} old reports, kept latest ${REPORT_LIMIT}`);
        }
    } catch (error) {
        console.error('[Cleanup] Error:', error.message);
    }
};

// Initialize reports with reward fields if missing
const initializeReports = () => {
    try {
        const db = router.db;
        const reports = db.get('reports').value() || [];

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

        let updated = false;
        const updatedReports = reports.map(report => {
            if (!report.hasOwnProperty('rewardStatus')) {
                updated = true;
                return { ...report, ...rewardFields };
            }
            return report;
        });

        if (updated) {
            db.set('reports', updatedReports).write();
            console.log('[Init] Added reward fields to existing reports');
        }
    } catch (error) {
        console.error('[Init] Error:', error.message);
    }
};

// Run initialization on startup
initializeReports();

server.use(middlewares);

server.post('/register-notification', (req, res) => {
    try {
        const { name, phone } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone required' });
        }

        const db = router.db;
        const users = db.get('notification_users');

        const existing = users.find({ phone }).value();
        if (existing) {
            return res.status(200).json({ 
                message: 'User already registered', 
                user: existing 
            });
        }

        const newUser = {
            id: Date.now(),
            name,
            phone,
            registeredAt: new Date().toISOString()
        };

        users.push(newUser).write();
        res.status(201).json({ 
            message: 'Registration successful', 
            user: newUser 
        });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.render = (req, res) => {
    const data = res.locals.data;
    
    if (res.statusCode === 201) {
        try {
            const db = router.db;
            const recipients = db.get('notification_users').value() || [];
            const phoneNumbers = recipients.map(u => u.phone);

            if (phoneNumbers.length > 0) {
                if (req.path === '/alerts' && req.method === 'POST') {
                    if (req.body.channels?.includes('whatsapp')) {
                        const message = `JolBondhu ALERT: ${req.body.title}\n${req.body.message}`;
                        console.log(`Broadcasting alert to ${phoneNumbers.length} users via WhatsApp...`);
                        broadcastNotifications(phoneNumbers, message);
                    }
                }
                
                if (req.path === '/reports' && req.method === 'POST') {
                    const basins = db.get('basins').value() || [];
                    const basin = basins.find(b => b.id === req.body.basinId);

                    const locationText = basin
                        ? basin.name
                        : (req.body.location
                            ? `${req.body.location.lat.toFixed(4)}, ${req.body.location.lng.toFixed(4)}`
                            : 'Unknown');

                    const message = `JolBondhu CITIZEN REPORT

Issue: ${req.body.issueType || 'Unknown Issue'}
Location: ${locationText}
Reported by: ${req.body.userName || 'Anonymous'}

Details: ${req.body.description || 'No description provided'}

Check the app for more information.`;

                    console.log(`Notifying ${phoneNumbers.length} users about new citizen report via WhatsApp...`);
                    broadcastNotifications(phoneNumbers, message);

                    // Trigger automated cleanup after new report
                    cleanupOldReports();
                }
            }
        } catch (error) {
            console.error('Notification error:', error);
        }
    }
    
    res.jsonp(data);
};

server.use(router);

server.listen(PORT, () => {
    console.log(`JolBondhu Backend running on port ${PORT}`);
    console.log(`WhatsApp notifications enabled`);
});
