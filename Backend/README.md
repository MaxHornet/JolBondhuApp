# JolBondhu Backend API

Real-time JSON API server for JolBondhu Flood Monitoring System.

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Server runs on http://localhost:3001
```

## API Endpoints

### Reports (Citizen → Dashboard)
- `GET /reports` - Get all reports
- `GET /reports?basinId={id}` - Filter by zone
- `GET /reports?status=pending` - Filter by status
- `POST /reports` - Submit new report
- `PATCH /reports/{id}` - Update report status

### Alerts (Dashboard → Citizens)
- `GET /alerts` - Get all alerts
- `GET /alerts?basinId={id}` - Filter by zone
- `GET /alerts?active=true` - Active alerts only
- `POST /alerts` - Send zone-specific alert

### Broadcasts (Dashboard → All Citizens)
- `GET /broadcasts` - Get all broadcasts
- `POST /broadcasts` - Send broadcast to all zones

### Basins/Zones
- `GET /basins` - Get all 9 monitoring zones
- `GET /basins/{id}` - Get specific zone
- `PATCH /basins/{id}` - Update zone status (risk, rainfall, etc.)

## Data Structure

### Report Object
```json
{
  "id": "report_1234567890",
  "basinId": "jalukbari",
  "userName": "Rahul Das",
  "issueType": "waterlogging",
  "description": "Water level rising near my house",
  "location": { "lat": 26.1445, "lng": 91.6616 },
  "photoData": "data:image/jpeg;base64,...",
  "timestamp": "2026-01-31T12:30:00Z",
  "status": "pending",
  "language": "en"
}
```

### Alert Object
```json
{
  "id": "alert_1234567890",
  "basinId": "jalukbari",
  "type": "flood_warning",
  "severity": "high",
  "title": "Flood Warning - Jalukbari",
  "titleAssamese": "বান সতৰ্কবাণী - জালুকবাৰী",
  "message": "Water level rising rapidly...",
  "issuedBy": "Admin",
  "issuedAt": "2026-01-31T12:00:00Z",
  "expiresAt": "2026-01-31T18:00:00Z",
  "active": true
}
```

### Basin Object
```json
{
  "id": "jalukbari",
  "name": "Jalukbari (Main)",
  "nameAssamese": "জালুকবাৰী (মুখ্য)",
  "location": "Guwahati, Kamrup",
  "riskLevel": "High",
  "rainfall": 45.2,
  "riverLevel": "48.2",
  "drainageBlockage": 72,
  "coords": [26.1445, 91.6616]
}
```

## Features

- ✅ **CORS Enabled** - Cross-origin requests allowed for development
- ✅ **Auto-Save** - All changes persist to db.json
- ✅ **30-Second Polling** - Frontend apps poll every 30s for real-time updates
- ✅ **Bilingual Support** - All data includes English + Assamese
- ✅ **9 Monitoring Zones** - Complete coverage of Guwahati flood-prone areas

## Ports

| Service | Port | URL |
|---------|------|-----|
| Backend API | 3001 | http://localhost:3001 |
| Dashboard | 5173 | http://localhost:5173 |
| Citizen App | 5174 | http://localhost:5174 |

## Commands

```bash
# Development
npm start          # Start with 200ms delay simulation
npm run dev        # Same as start

# All services
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Dashboard
cd ../JolBondhuDashBoard && npm run dev

# Terminal 3: Citizen App
cd ../JolBondhuApp && npm run dev
```

## Production Migration

To deploy to AWS or any cloud service:

1. **Change API_BASE_URL** in frontend apps:
   ```javascript
   // From
   const API_BASE_URL = 'http://localhost:3001';
   // To
   const API_BASE_URL = 'https://your-api-domain.com';
   ```

2. **Replace JSON-Server** with:
   - AWS API Gateway + Lambda
   - Express.js + MongoDB/PostgreSQL
   - Firebase/Firestore
   - Any REST API backend

3. **Database Migration**:
   - Export db.json data
   - Import to production database
   - Update API endpoints in frontend

## File Structure

```
backend/
├── package.json       # Dependencies & scripts
├── db.json           # Database (9 basins + reports + alerts)
├── cors.js           # CORS middleware
└── README.md         # This file
```

## Environment Variables

Create `.env` file (optional):
```env
PORT=3001
DELAY_MS=200
```

## License

MIT - JolBondhu Team
