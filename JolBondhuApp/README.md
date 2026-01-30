# JolBondhu+ Citizen App 🌊

A mobile-first Progressive Web App (PWA) for flood monitoring and citizen reporting in Assam, India.

## Features ✨

- **📱 Offline-First**: Works without internet, syncs when online
- **🗺️ Interactive Map**: View flood zones with risk levels
- **📷 Report Issues**: Capture photos + GPS location
- **🔔 Real-time Alerts**: Get flood warnings by zone
- **🛡️ Safety Guidelines**: Emergency contacts & tips
- **🌙 Dark Mode**: Eye-friendly dark theme
- **🌐 Bilingual**: English & Assamese support

## Quick Start 🚀

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development Server

- **Citizen App**: http://localhost:5174
- **Admin Dashboard** (NewMain): http://localhost:5173

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

## Integration with Admin Dashboard 🔗

This app shares data structure with the NewMain admin dashboard:
- Same basin/zone definitions
- Same alert format
- Same translations

Reports submitted here appear in the admin Citizen Feed.

## Offline Mode 📴

The app works fully offline:
1. **Zone data** cached on first load
2. **Reports saved locally** when offline
3. **Auto-syncs** when connection restored
4. **Offline indicator** in header

## Demo Tips 🎯

1. Toggle airplane mode to test offline
2. Submit a report while offline
3. Watch it sync when back online
4. Switch languages with EN/অ toggle
5. Tap zones on map for details

---

**Built for Urban Resilience & SDG 13: Climate Action**
