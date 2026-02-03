const jsonServer = require('json-server');
const path = require('path');
require('dotenv').config();

const { broadcastNotifications } = require('./services/twilioService');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3001;

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
