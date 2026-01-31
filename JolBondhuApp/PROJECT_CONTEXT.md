# JolBondhu+ Citizen App - Project Context

## Project Identity

**Project Name:** JolBondhu+ Citizen App  
**Location:** `d:\Hackathon\JolBondhuApp`  
**Type:** React + Vite + Tailwind CSS Progressive Web App (PWA)  
**Purpose:** Citizen-facing mobile app for flood monitoring and issue reporting  
**Current Status:** Fully integrated with backend API, production ready

### Project Fingerprint
**ID:** jolbondhu-citizen-pwa  
**Created:** 2026-01-30  
**Last Updated:** 2026-01-31

---

## Related Projects

| Project | Path | Purpose |
|---------|------|---------|
| **Admin Dashboard** | `d:\Hackathon\NewMain` | Municipal control center |
| **This App** | `d:\Hackathon\JolBondhuApp` | Citizen-facing PWA |

The projects share the same data structure and are designed to work together.

---

## Technical Stack

- **Framework:** React 18.2.0
- **Build Tool:** Vite 5.0.8
- **Styling:** Tailwind CSS 3.3.6
- **Map Library:** Leaflet 1.9.4 + react-leaflet 4.2.1
- **Animations:** Framer Motion 10.16.16
- **Routing:** React Router DOM 6.21.1
- **PWA:** vite-plugin-pwa 0.17.4
- **Icons:** Lucide React 0.294.0
- **Font:** Inter (Google Fonts)

---

## File Structure

```
JolBondhuApp/
├── src/
│   ├── App.jsx                # Main app, routing, state management
│   ├── main.jsx               # React root render
│   ├── index.css              # Global styles, Tailwind imports
│   ├── data/
│   │   └── sharedData.js      # Basins, alerts, translations (shared with admin)
│   ├── components/
│   │   ├── Header.jsx         # Top bar with online status, language toggle
│   │   └── BottomNav.jsx      # Mobile navigation with animated indicators
│   ├── pages/
│   │   ├── HomePage.jsx       # Alert overview, zone status cards
│   │   ├── MapPage.jsx        # Leaflet map with risk polygons
│   │   ├── ReportPage.jsx     # Issue reporting with photo/GPS capture
│   │   ├── AlertsPage.jsx     # All alerts with zone filtering
│   │   └── SafetyPage.jsx     # Emergency contacts & safety tips
│   └── hooks/
│       ├── useOnlineStatus.js # Tracks browser online/offline state
│       └── usePendingReports.js # Manages offline report queue
├── public/
│   └── favicon.svg            # Water drop icon
├── index.html                 # HTML entry with PWA meta tags
├── package.json               # Dependencies
├── vite.config.js             # Vite + PWA configuration
├── tailwind.config.js         # Tailwind customization
├── postcss.config.js          # PostCSS for Tailwind
└── README.md                  # Quick start guide
```

---

## Current Features

### ✅ Implemented

- **5 Pages:** Home, Map, Report, Alerts, Safety
- **Interactive Leaflet Map** with colored risk polygons
- **Issue Reporting** with camera/gallery photo capture
- **GPS Location Capture** with accuracy display
- **Offline-First Architecture:**
  - Service worker caches app shell
  - LocalStorage for pending reports
  - Auto-sync when online
  - Offline indicator in header
- **PWA Installable:** manifest.json + service worker
- **Dark Mode:** Full dark theme support
- **Bilingual:** English + Assamese (অসমীয়া)
- **Mobile-First:** Bottom navigation, touch-friendly

### ✅ API-Connected Features (Phase 3)

- **Report Submission API:** Direct POST to http://localhost:3001/reports with offline fallback
- **Real-time Alert Receiving:** 30-second polling from Dashboard API for live flood alerts
- **User Name Prompt:** Personalized welcome with name persistence in localStorage
- **Dashboard Integration:** Bidirectional communication with admin Dashboard
- **Offline Report Queue:** Auto-sync pending reports when connection restored

### Data Structure

**Basin Object:**
```javascript
{
  id: "jalukbari",
  name: "Jalukbari (Main)",
  nameAssamese: "জালুকবাৰী (মুখ্য)",
  location: "Guwahati, Kamrup",
  riskLevel: "High", // High, Medium, Low
  rainfall: 45.2,
  coords: [26.1445, 91.6616],
  polygon: [[lat, lng], ...], // 6 vertices
  rainfallData: [{ time, rainfall }, ...]
}
```

**Alert Object:**
```javascript
{
  id: "1",
  basinId: "jalukbari",
  type: "flood_warning", // flood_warning, waterlogging, drain_block, all_clear
  severity: "high", // high, medium, low
  title: "Flood Warning - Jalukbari",
  titleAssamese: "বান সতৰ্কবাণী - জালুকবাৰী",
  message: "...",
  messageAssamese: "...",
  time: "5 mins ago",
  isNew: true
}
```

---

## How to Run

```bash
cd d:\Hackathon\JolBondhuApp
npm install   # First time only
npm run dev   # Starts at http://localhost:5174
npm run build # Production build
```

**Run both apps:**
- Citizen: `npm run dev` in JolBondhuApp → http://localhost:5174
- Admin: `npm run dev` in NewMain → http://localhost:5173

---

## API Integration (Completed)

### Backend Connection
- **API Endpoint:** http://localhost:3001 (JSON-Server)
- **Polling Interval:** 30-second polling for real-time alerts and data updates
- **Report Submission:** Direct API submission with offline fallback to localStorage

### API-Connected Features
- ✅ **Report submission** - POST /reports with photo, location, and metadata
- ✅ **Alert receiving** - GET /alerts with 30-second polling for real-time updates from Dashboard
- ✅ **Name prompt** - User name stored in localStorage with welcome prompt

---

## API Integration Points

Currently connected to backend API at http://localhost:3001. For development reference:

### 1. Basin Data (App.jsx)
**Endpoint:** `GET /api/basins`  
**Polling:** Every 30 seconds  
**Response:** Array of basin objects

### 2. Alerts (AlertsPage.jsx)
**Endpoint:** `GET /api/alerts`  
**Polling:** Every 30 seconds  
**Response:** Array of alert objects

### 3. Report Submission (ReportPage.jsx)
**Endpoint:** `POST /api/reports`  
**Body:** `{ issueType, description, photoData, location, timestamp }`  
**Offline:** Saved to localStorage, synced when online

---

## Offline Architecture

```
User submits report
       ↓
   Is Online? ──No──→ Save to localStorage
       ↓ Yes              ↓
   POST to API      Show "Queued" badge
       ↓                  ↓
   Success         Online event detected
                         ↓
                   Sync pending reports
```

**Key Files:**
- `useOnlineStatus.js` - Listens to online/offline events
- `usePendingReports.js` - Manages localStorage queue
- `vite.config.js` - PWA service worker config

---

## New Features (Phase 3)

### ✅ Implemented

- **User Name Prompt:** First-time users see a welcome modal to enter their name, persisted in localStorage
- **Real-time Alert Receiving:** 30-second polling connects to Dashboard API for live alert updates
- **Offline Report Queue:** Reports saved locally when offline, auto-synced when connection restored
- **Report Submission API:** Direct POST to backend with success/failure feedback
- **Dashboard Integration:** Bidirectional communication with admin Dashboard

---

## Change History

### 2026-01-31 - Phase 3 Complete - API Integration
- Integrated with backend API at http://localhost:3001
- Added real-time alert polling (30-second interval)
- Implemented report submission with offline fallback
- Added user name prompt with localStorage persistence
- Connected Report, Alert receiving, and Name prompt features to API
- Status: Production-ready

### 2026-01-30 - Initial Creation
- Created complete citizen PWA
- Implemented 5 pages: Home, Map, Report, Alerts, Safety
- Added offline-first architecture
- Dark mode and bilingual support
- PWA installable with service worker

---

## Testing Checklist

Before ending any session, verify:
- [ ] `npm run build` completes without errors
- [ ] Home page shows zone cards and alerts
- [ ] Map page shows colored polygons
- [ ] Report page captures photo and GPS
- [ ] Alerts page filters by zone
- [ ] Safety page shows emergency contacts
- [ ] Language toggle (EN ↔ অসমীয়া) works
- [ ] Dark mode toggle works
- [ ] Offline indicator shows when disconnected
- [ ] Pending reports badge appears when offline

---

## Future Enhancements

### Phase 4: Next Steps
- **User Registration/Login** - Authentication system with secure login
- **Push Notifications (FCM)** - Firebase Cloud Messaging for real-time alerts
- **AWS S3 for Photo Storage** - Cloud storage for report photos with CDN delivery

### Phase 1: Backend Integration ✓ (Completed)
- Connect to real API endpoints ✓
- Implement actual report upload ✓
- Add push notifications (moved to Phase 4)

### Phase 2: Enhanced Features ✓ (Completed)
- Real-time WebSocket updates (using 30s polling) ✓
- Photo compression before upload ✓
- Multiple photos per report
- Report status tracking

### Phase 3: Production ✓ (Completed)
- User authentication (moved to Phase 4)
- Report history page
- Navigation to flood zones
- Share alerts feature
- API Integration with Dashboard ✓
- Real-time alert receiving ✓
- Offline report queue with auto-sync ✓

---

## Agent Reminder

**ATTENTION FUTURE AGENTS:**
- Always check this file before making changes
- Update "Change History" after every session
- Test build with `npm run build` before finishing
- Maintain bilingual support (don't remove Assamese)
- Keep demo data working until API is connected
- **Related Project:** Admin dashboard in `d:\Hackathon\NewMain`
- See AGENTS_UPDATE_PROTOCOL.md for workspace rules

**Project Fingerprint:** jolbondhu-citizen-pwa

---

**Last Updated:** 2026-01-31  
**Status:** Production-ready, fully integrated with backend API
