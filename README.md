# Jolbondhu Flood Monitoring Dashboard 🌊

A real-time flood monitoring and risk assessment dashboard for Guwahati, Assam. Fully integrated with citizen reporting system via REST API.

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.6-38B2AC)](https://tailwindcss.com/)
[![API](https://img.shields.io/badge/API-Integrated-success)](http://localhost:3001)

## Overview

Jolbondhu (জলবন্ধু - "Water Friend") provides real-time flood monitoring across 9 critical zones in Guwahati. The dashboard receives live citizen reports and sends alerts to the citizen mobile app via REST API.

## Key Features

### 🗺️ Interactive Zone Map
Leaflet-powered polygon map with CartoDB Voyager tiles. Zones are color-coded by risk level (High=Red, Medium=Yellow, Low=Green). Click any zone to select it and the map flies to that location with smooth animation.

### 🌍 9 Monitoring Zones
Complete coverage of flood-prone areas including Jalukbari (Main), Maligaon, Fancy Bazar, Bharalumukh, Brahmaputra North Bank, Barpeta Zone, Nalbari Area, Kamrup Central, and Goalpara Zone.

### 🌊 Real-time Risk Status
Live API-connected status card displays current zone data with rainfall levels (mm), river height (m), drainage blockage percentage, and dynamic risk badges. Updates every 30 seconds automatically. High-risk zones trigger visual flood alerts.

### 📊 Zone-Linked Components
When you select a zone, the entire dashboard updates: Citizen Feed filters to show only that zone's reports, Rainfall Chart displays 6-hour history, and Risk Status updates with zone-specific data.

### 🌐 Dual-Language Support
Complete bilingual interface with EN | অসমীয়ä toggle. All zone names, reports, locations, and UI labels translate instantly. Maintains readability in both languages.

### ⚡ Action Center
Four functional action buttons with modal interfaces: Emergency Contacts (local emergency numbers), Safety Guidelines (risk-specific instructions), Broadcast Alert (mass notifications to all citizens), Send Warning (targeted zone-specific alerts). All alerts sent via API to citizen app instantly.

### 📡 Real-Time Citizen Reports
Live feed of citizen-submitted reports with photos and GPS coordinates. Reports appear in dashboard within 30 seconds of submission. Filter by zone and update status (pending → under review → resolved).

### 📱 Collapsible Sidebar
Hamburger menu toggle (☰) controls sidebar visibility. Expanded: 256px with full navigation text. Collapsed: 64px icon-only mode. Smooth CSS transitions on toggle.

### 🌙 Dark Mode
Full dark theme support using slate color palette. Toggle button in TopBar switches between light and dark modes instantly. Preserves contrast and readability in both themes.

### 🔄 API Integration
- Receives citizen reports in real-time (30s polling)
- Sends alerts to citizen app instantly
- Syncs zone status updates across both apps
- RESTful API with JSON-Server backend

## Technical Stack

- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.4.21
- **Styling:** Tailwind CSS 3.3.6
- **Maps:** Leaflet 1.9.4 + React-Leaflet 4.2.1
- **Charts:** Recharts 2.10.3
- **Animations:** Framer Motion 10.16.16
- **Icons:** Lucide React 0.294.0

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend API running (see below)

### System Architecture

This dashboard works with two other components:
- **Backend API** (Port 3001): JSON-Server providing data
- **Citizen App** (Port 5174): Mobile PWA for citizens

### Installation & Setup

```bash
# 1. Start Backend (in separate terminal)
cd ../backend
npm install
npm start
# Backend: http://localhost:3001

# 2. Start Dashboard
cd ../JolBondhuDashBoard
npm install
npm run dev
# Dashboard: http://localhost:5173

# 3. (Optional) Start Citizen App
cd ../JolBondhuApp
npm install
npm run dev
# Citizen App: http://localhost:5174
```

All three services must run simultaneously for full integration.

### Build for Production

```bash
npm run build
```

Output goes to `dist/` folder.

## Project Structure

```
NewMain/
├── src/
│   ├── App.jsx                    # Main app component, state management
│   ├── main.jsx                   # React root render
│   ├── index.css                  # Global styles, Tailwind imports
│   ├── data/
│   │   └── mockData.js           # 9 basins, 10 reports, translations
│   └── components/
│       ├── Sidebar.jsx           # Navigation sidebar
│       ├── TopBar.jsx            # Header with language/dark mode
│       ├── ZoneMap.jsx           # Leaflet polygon map
│       ├── RiskStatusCard.jsx    # Zone risk display
│       ├── RainfallChart.jsx     # 6-hour rainfall trends
│       ├── ZoneList.jsx          # Zone selection list
│       ├── CitizenFeed.jsx       # Zone-filtered reports
│       └── ActionCenter.jsx      # Action buttons + modals
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## API Integration

### Backend API (JSON-Server)
- **URL:** http://localhost:3001
- **Type:** RESTful JSON API
- **Features:** Real-time data, CORS enabled, auto-persist

### API Endpoints

| Endpoint | Method | Purpose | Polling |
|----------|--------|---------|---------|
| `GET /basins` | GET | Fetch all 9 zones | 30s |
| `GET /basins/{id}` | GET | Zone details | 30s |
| `PATCH /basins/{id}` | PATCH | Update zone status | On action |
| `GET /reports` | GET | All citizen reports | 30s |
| `GET /reports?basinId={id}` | GET | Zone-specific reports | 30s |
| `PATCH /reports/{id}` | PATCH | Update report status | On action |
| `POST /alerts` | POST | Send alert to zone | On action |
| `POST /broadcasts` | POST | Broadcast to all | On action |

### Data Structure

#### Basin Object
```javascript
{
  id: "jalukbari",
  name: "Jalukbari (Main)",
  nameAssamese: "জালুকবাৰী (মুখ্য)",
  location: "Guwahati, Kamrup",
  riskLevel: "High", // High | Medium | Low
  rainfall: 45.2,
  riverLevel: "48.2",
  drainageBlockage: 72,
  estimatedWaterLevel: 2.5,
  coords: [26.1445, 91.6616],
  polygon: [[lat, lng], ...],
  updatedAt: "2026-01-31T12:00:00Z"
}
```

#### Report Object (from Citizen App)
```javascript
{
  id: "report_1234567890",
  basinId: "jalukbari",
  userName: "Rahul Das",
  issueType: "waterlogging",
  description: "Water rising near my house",
  location: { lat: 26.1445, lng: 91.6616 },
  photoData: "data:image/jpeg;base64,...",
  timestamp: "2026-01-31T12:30:00Z",
  status: "pending", // pending | under_review | action_taken | resolved
  language: "en"
}
```

## Current Status ✅

### Phase 1-3: Complete
- ✅ All 9 monitoring zones active with real-time updates
- ✅ Interactive map with polygon selection
- ✅ Zone-linked component updates (30s polling)
- ✅ Real-time citizen report feed
- ✅ Alert broadcasting to citizen app
- ✅ Bilingual support (EN + অসমীয়া)
- ✅ Dark mode toggle
- ✅ Collapsible sidebar
- ✅ 4 working action modals with API integration
- ✅ Weather integration (Tomorrow.io + IMD RSS)
- ✅ Water level calculations
- ✅ **API fully integrated and operational**

### Phase 4: Planned
- 🔄 AWS Deployment (Lambda + API Gateway + DynamoDB)
- 🔄 User Authentication (Admin login)
- 🔄 Push Notifications (Firebase)
- 🔄 Analytics Dashboard

## Production Deployment

### AWS Serverless Architecture
```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   S3 (Static)   │      │  API Gateway     │      │  Lambda         │
│   Dashboard     │◄────►│  + CloudFront    │◄────►│  Functions      │
└─────────────────┘      └──────────────────┘      └────────┬────────┘
                                                           │
                                                ┌──────────┴──────────┐
                                                │     DynamoDB        │
                                                │   (Zone + Reports)  │
                                                └─────────────────────┘
```

### Migration Steps
1. Update `API_BASE_URL` in `src/services/apiService.js`
2. Replace JSON-Server with AWS Lambda functions
3. Migrate `db.json` to DynamoDB
4. Deploy static files to S3
5. Configure CloudFront CDN

## License

Private project for demonstration purposes.

---

**Built for:** Guwahati Flood Monitoring  
**Status:** Production Ready | API Fully Integrated  
**System:** Dashboard ↔ API ↔ Citizen App  
**Last Updated:** January 31, 2026
