# JolBondhu+ Citizen App 🌊

A mobile-first Progressive Web App (PWA) for flood monitoring and citizen reporting in Guwahati, Assam. Fully integrated with municipal dashboard via REST API.

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-success)](https://web.dev/progressive-web-apps/)
[![API](https://img.shields.io/badge/API-Integrated-success)](http://localhost:3001)

## Features ✨

- **📡 Real-Time API**: Connected to dashboard via REST API (30s updates)
- **📱 Offline-First**: Works without internet, syncs when online
- **🗺️ Interactive Map**: View flood zones with live risk levels
- **📷 Report Issues**: Submit reports with photos + GPS to dashboard
- **🔔 Instant Alerts**: Receive flood warnings from authorities
- **👤 Anonymous Reporting**: Name prompt (no registration required)
- **🛡️ Safety Guidelines**: Emergency contacts & tips
- **🌙 Dark Mode**: Eye-friendly dark theme
- **🌐 Bilingual**: English & Assamese support

## Quick Start 🚀

### Prerequisites
This app requires the backend API to be running for full functionality.

### System Architecture
```
Citizen App (5174) ←→ Backend API (3001) ←→ Dashboard (5173)
```

### Installation & Setup

```bash
# 1. Start Backend (in separate terminal)
cd ../backend
npm install
npm start
# Backend: http://localhost:3001

# 2. Start Citizen App
cd ../JolBondhuApp
npm install
npm run dev
# Citizen App: http://localhost:5174

# 3. (Optional) Start Dashboard
cd ../JolBondhuDashBoard
npm install
npm run dev
# Dashboard: http://localhost:5173
```

### Build for Production
```bash
npm run build
npm run preview
```

## Development Server

- **Citizen App**: http://localhost:5174
- **Backend API**: http://localhost:3001
- **Admin Dashboard**: http://localhost:5173

## Project Structure 📁

```
JolBondhuApp/
├── src/
│   ├── App.jsx              # Main app with routing
│   ├── data/
│   │   └── sharedData.js    # Basins, alerts, translations
│   ├── components/
│   │   ├── Header.jsx       # Top bar with status
│   │   └── BottomNav.jsx    # Mobile navigation
│   ├── pages/
│   │   ├── HomePage.jsx     # Alert overview
│   │   ├── MapPage.jsx      # Leaflet map
│   │   ├── ReportPage.jsx   # Issue reporting
│   │   ├── AlertsPage.jsx   # All alerts
│   │   └── SafetyPage.jsx   # Emergency info
│   └── hooks/
│       ├── useOnlineStatus.js
│       └── usePendingReports.js
├── public/
│   └── favicon.svg
├── vite.config.js           # PWA configuration
└── package.json
```

## Tech Stack 🛠️

- **React 18** + Vite
- **Tailwind CSS** for styling
- **Leaflet** for maps
- **Framer Motion** for animations
- **vite-plugin-pwa** for offline support
- **React Router** for navigation

## API Integration 🔗

### Real-Time Communication
The app communicates with the municipal dashboard via REST API:

**Submit Reports → Dashboard**
- Reports with photos & GPS sent instantly to dashboard
- Dashboard officials see reports within 30 seconds
- Status updates: pending → under review → resolved

**Receive Alerts ← Dashboard**
- Flood warnings broadcast by authorities
- Instant notification in app (30s polling)
- Zone-specific and all-zone broadcasts

### API Endpoints

| Feature | Endpoint | Method |
|---------|----------|--------|
| Submit Report | `/reports` | POST |
| Get Alerts | `/alerts` | GET |
| Get Zones | `/basins` | GET |
| Zone Status | `/basins/{id}` | GET |

### Data Sync
- **Polling Interval**: 30 seconds for real-time updates
- **Offline Queue**: Reports saved locally, synced when online
- **Optimistic UI**: Shows immediately, confirms in background

## Offline Mode 📴

The app works fully offline with intelligent syncing:

### Features
1. **Zone data** cached on first load
2. **Reports saved locally** when offline (localStorage queue)
3. **Auto-syncs** when connection restored
4. **Offline indicator** in header
5. **Retry mechanism** for failed uploads

### How It Works
```
User submits report
       ↓
   Online? 
   ├─ Yes → Send to API immediately
   └─ No  → Save to localStorage queue
              ↓
      Connection restored
              ↓
      Auto-sync pending reports
              ↓
      Clear queue on success
```

## New Features (Phase 3) 🆕

### Real-Time API Integration
- ✅ Connected to backend API (Port 3001)
- ✅ 30-second polling for alerts and updates
- ✅ Reports sent instantly to municipal dashboard
- ✅ Live zone status updates

### Anonymous Reporting
- ✅ Name prompt on first report (saved to localStorage)
- ✅ No registration or login required
- ✅ Optional: Add user authentication in Phase 4

### Enhanced Offline Support
- ✅ Intelligent queue management
- ✅ Auto-sync with retry logic
- ✅ Persisted across app restarts

### Weather Integration
- ✅ Real-time weather from Tomorrow.io API
- ✅ IMD official warnings
- ✅ Water level monitoring
- ✅ 15-minute weather updates

## Demo Tips 🎯

1. **Test Offline Mode**: Toggle airplane mode, submit report, restore connection
2. **Watch Real-Time Sync**: Submit report, check dashboard within 30 seconds
3. **Receive Alerts**: Send alert from dashboard, see it appear in app
4. **Name Persistence**: Enter name once, it remembers for future reports
5. **Language Toggle**: Switch between EN and অসমীয়া instantly
6. **Zone Details**: Tap any zone on map for live status

## Production Roadmap 🗺️

### Phase 4: Coming Soon
- 🔄 User Registration/Login (Cognito)
- 🔄 Push Notifications (Firebase Cloud Messaging)
- 🔄 AWS S3 for photo storage (instead of base64)
- 🔄 Geofencing alerts (enter/exit zones)
- 🔄 Historical data analytics

### AWS Deployment
```
┌─────────────────┐      ┌──────────────────┐
│   S3 (Static)   │      │  API Gateway     │
│  Citizen App    │◄────►│  + CloudFront    │
└─────────────────┘      └──────────────────┘
```

## Current Status ✅

**Phase 1-3: Complete**
- ✅ PWA with offline support
- ✅ 5-page mobile interface
- ✅ Photo capture with GPS
- ✅ Real-time API integration
- ✅ Anonymous reporting
- ✅ Bilingual (EN + অসমীয়া)
- ✅ Weather + IMD warnings
- ✅ Bidirectional sync with dashboard

**System Operational**: Dashboard ↔ API ↔ Citizen App

---

**Built for:** Guwahati Municipal Flood Response  
**Mission:** Urban Resilience & SDG 13: Climate Action  
**Status:** Production Ready | Fully Integrated  
**Last Updated:** January 31, 2026
