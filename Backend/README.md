# JolBondhu Backend

JSON-Server backend for JolBondhu Dashboard-Citizen App integration.

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Server runs on http://localhost:3001
```

## API Endpoints

### Reports
- `GET /reports` - Get all reports
- `GET /reports?basinId={id}` - Filter by zone
- `POST /reports` - Submit new report
- `PATCH /reports/{id}` - Update report status

### Alerts
- `GET /alerts` - Get all alerts
- `POST /alerts` - Send new alert
- `GET /alerts?active=true` - Get active alerts only

### Basins
- `GET /basins` - Get all zones
- `GET /basins/{id}` - Get specific zone
- `PATCH /basins/{id}` - Update zone status

### Broadcasts
- `GET /broadcasts` - Get all broadcasts
- `POST /broadcasts` - Send broadcast to all zones

## Features

- CORS enabled for cross-origin requests
- 200ms artificial delay (simulates real network)
- Auto-saves to db.json
- RESTful API design

## Ports

- Backend: 3001
- Dashboard: 5173
- Citizen App: 5174

## Migration to Production

Change `API_BASE_URL` in both apps from `http://localhost:3001` to your production API endpoint.
