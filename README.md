# JolBondhu - Flood Monitoring System 🌊

[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-success)](https://web.dev/progressive-web-apps/)
[![API](https://img.shields.io/badge/API-RESTful-success)](http://localhost:3001)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()

> **JolBondhu (জলবন্ধু)** - "Water Friend" - Real-time flood monitoring and citizen reporting system for Guwahati, Assam.

## 🎯 Overview

JolBondhu is a comprehensive flood monitoring solution that connects municipal authorities with citizens through a real-time, bidirectional communication platform. The system consists of three integrated components working together to provide early warnings, collect ground-level reports, and coordinate emergency responses.

### System Components

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────────┐
│  Citizen App    │◄────►│  Backend API │◄────►│    Dashboard    │
│   (Port 5174)   │ HTTP │  (Port 3001) │ HTTP │   (Port 5173)   │
└─────────────────┘      └──────────────┘      └─────────────────┘
        │                         │                      │
        │ Submit Report           │ Store in db.json     │ View Reports
        │ Get Alerts              │                      │ Send Alerts
        └─────────────────────────┘                      └──────────┘
```

| Component | Description | Port | Tech Stack |
|-----------|-------------|------|------------|
| **[Dashboard](./JolBondhuDashBoard/)** | Municipal control center for monitoring zones and managing alerts | 5173 | React + Vite + Tailwind |
| **[Citizen App](./JolBondhuApp/)** | Mobile PWA for citizens to report issues and receive warnings | 5174 | React + PWA + Leaflet |
| **[Backend](./backend/)** | REST API server providing real-time data synchronization | 3001 | JSON-Server |

## ✨ Key Features

### Dashboard (Admin Interface)
- 🗺️ **Interactive Zone Map** - 9 flood monitoring zones with polygon overlays
- 📊 **Real-time Monitoring** - Live risk status, rainfall, and river levels
- 📡 **Citizen Reports** - View and manage reports with photos and GPS
- 📢 **Alert Broadcasting** - Send targeted or mass alerts to citizens
- 🌐 **Bilingual Support** - English and Assamese (অসমীয়া)
- 🌙 **Dark Mode** - Eye-friendly interface toggle

### Citizen App (Mobile PWA)
- 📷 **Issue Reporting** - Submit reports with photos and GPS location
- 🔔 **Real-time Alerts** - Receive flood warnings from authorities
- 🗺️ **Zone Mapping** - View flood risk zones on interactive map
- 📴 **Offline-First** - Works without internet, syncs when online
- 👤 **Anonymous Reporting** - No registration required
- 📱 **Installable** - Add to home screen like native app

### Backend API
- 🔄 **RESTful API** - Full CRUD operations for all data
- ⚡ **Real-time Sync** - 30-second polling across all clients
- 💾 **Auto-Persist** - JSON database with automatic saving
- 🌐 **CORS Enabled** - Cross-origin support for local development

## 🗺️ Monitoring Zones (9 Basins)

| ID | Zone Name | Location | Risk Level | Coordinates |
|----|-----------|----------|------------|-------------|
| `jalukbari` | Jalukbari (Main) | Guwahati, Kamrup | 🔴 High | 26.1445, 91.6616 |
| `maligaon` | Maligaon | Guwahati, Kamrup | 🟡 Medium | 26.1520, 91.6750 |
| `fancy-bazar` | Fancy Bazar | Guwahati, Kamrup | 🟢 Low | 26.1600, 91.6900 |
| `bharalumukh` | Bharalumukh | Guwahati, Kamrup | 🟡 Medium | 26.1350, 91.6800 |
| `brahmaputra-north` | Brahmaputra North Bank | Sonitpur | 🔴 High | 26.6736, 92.8478 |
| `barpeta` | Barpeta Zone | Barpeta | 🟡 Medium | 26.3225, 91.0055 |
| `nalbari` | Nalbari Area | Nalbari | 🟢 Low | 26.4454, 91.4419 |
| `kamrup-central` | Kamrup Central | Kamrup | 🟢 Low | 26.1445, 91.7362 |
| `goalpara` | Goalpara Zone | Goalpara | 🟡 Medium | 26.1649, 90.6252 |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd JolBondhu
```

### 2. Start Backend Server

```bash
cd backend
npm install
npm start
# Backend API: http://localhost:3001
```

### 3. Start Dashboard (in new terminal)

```bash
cd JolBondhuDashBoard
npm install
npm run dev
# Dashboard: http://localhost:5173
```

### 4. Start Citizen App (in new terminal)

```bash
cd JolBondhuApp
npm install
npm run dev
# Citizen App: http://localhost:5174
```

**All three services must run simultaneously for full functionality.**

## 📊 System Architecture

### Data Flow

1. **Citizen → Dashboard**: Reports submitted via Citizen App appear in Dashboard within 30 seconds
2. **Dashboard → Citizen**: Alerts sent from Dashboard appear in Citizen App instantly
3. **Real-time Updates**: All clients sync every 30 seconds for latest data

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `GET /basins` | GET | Fetch all monitoring zones |
| `GET /reports` | GET | Fetch citizen reports |
| `POST /reports` | POST | Submit new report |
| `GET /alerts` | GET | Fetch alerts |
| `POST /alerts` | POST | Send alert to zone |
| `PATCH /basins/:id` | PATCH | Update zone status |

### Polling Intervals

- **Weather Data**: 15 minutes (Tomorrow.io API)
- **Basin/Zone Data**: 30 seconds
- **Reports**: 30 seconds
- **Alerts**: 30 seconds

## 🛠️ Tech Stack

### Frontend (Both Apps)
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Leaflet** - Interactive maps
- **Lucide React** - Icons
- **Framer Motion** - Animations

### Citizen App Only
- **React Router DOM** - Navigation
- **vite-plugin-pwa** - PWA capabilities
- **IndexedDB** - Offline storage

### Dashboard Only
- **Recharts** - Data visualization

### Backend
- **JSON-Server** - Mock REST API
- **CORS** - Cross-origin support

## 📁 Project Structure

```
JolBondhu/
├── JolBondhuDashBoard/          # Admin Dashboard
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API services
│   │   └── App.jsx             # Main application
│   ├── package.json
│   └── README.md               # Detailed docs
│
├── JolBondhuApp/               # Citizen PWA
│   ├── src/
│   │   ├── components/          # UI components
│   │   ├── pages/              # 5 page components
│   │   ├── hooks/              # Custom React hooks
│   │   └── services/           # API services
│   ├── package.json
│   └── README.md               # Detailed docs
│
├── backend/                    # REST API
│   ├── db.json                 # Database with 9 basins
│   ├── package.json
│   └── README.md               # Quick start guide
│
└── README.md                   # This file
```

## 🌐 Deployment

### Production Architecture (AWS)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Citizen App   │────▶│  API Gateway     │────▶│  Lambda         │
│   (S3 Static)   │     │  (HTTP/REST)     │     │  (Node.js)      │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                           │
                                                ┌──────────┴──────────┐
                                                │     DynamoDB        │
                                                │   (Zone + Reports)  │
                                                └─────────────────────┘
                                                           ▲
┌─────────────────┐     ┌──────────────────┐              │
│   Dashboard     │────▶│  CloudFront CDN  │──────────────┘
│   (S3 Static)   │     │                  │
└─────────────────┘     └──────────────────┘
```

### Deployment Steps

1. **Update API URLs** in both frontend apps
2. **Replace JSON-Server** with AWS Lambda + API Gateway
3. **Migrate db.json** to DynamoDB
4. **Deploy static files** to S3
5. **Configure CloudFront** for CDN

See individual project READMEs for detailed deployment instructions.

## 📝 API Documentation

### Submit Report (Citizen App)

```http
POST /reports
Content-Type: application/json

{
  "id": "report_${timestamp}",
  "basinId": "jalukbari",
  "userName": "Rahul Das",
  "issueType": "waterlogging",
  "description": "Water rising near my house",
  "location": { "lat": 26.1445, "lng": 91.6616 },
  "photoData": "data:image/jpeg;base64,...",
  "timestamp": "2026-01-31T12:30:00Z",
  "status": "pending"
}
```

### Send Alert (Dashboard)

```http
POST /alerts
Content-Type: application/json

{
  "id": "alert_${timestamp}",
  "basinId": "jalukbari",
  "type": "flood_warning",
  "severity": "high",
  "title": "Flood Warning - Jalukbari",
  "titleAssamese": "বান সতৰ্কবাণী - জালুকবাৰী",
  "message": "Water level rising rapidly...",
  "messageAssamese": "পানীৰ স্তৰ বেগাই বাঢ়িছে...",
  "issuedAt": "2026-01-31T12:00:00Z"
}
```

## 🎓 Features by Component

| Feature | Dashboard | Citizen App | Backend |
|---------|-----------|-------------|---------|
| **View Zones** | ✅ Interactive map | ✅ Map + List | ✅ 9 basins in db.json |
| **Submit Reports** | ❌ N/A | ✅ With photo + GPS | ✅ POST /reports |
| **View Reports** | ✅ Zone-filtered | ❌ N/A | ✅ GET /reports |
| **Send Alerts** | ✅ Broadcast + Targeted | ❌ N/A | ✅ POST /alerts |
| **Receive Alerts** | ❌ N/A | ✅ Real-time | ✅ GET /alerts |
| **Risk Updates** | ✅ Real-time status | ✅ Weather cards | ✅ PATCH /basins |
| **Offline Support** | ❌ N/A | ✅ Queue + sync | ❌ N/A |
| **Weather Data** | ✅ Charts + Widget | ✅ Cards | ❌ N/A |
| **Bilingual** | ✅ EN + অসমীয়া | ✅ EN + অসমীয়া | ✅ Both languages |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

1. **CORS errors**: Ensure backend is running on port 3001
2. **API not connecting**: Check all three services are running
3. **Photos not loading**: Verify base64 encoding in reports
4. **Offline sync not working**: Clear localStorage and retry

### Support

For issues and questions:
- Check individual project READMEs
- Open an issue on GitHub
- Review the [DOCUMENT.md](./DOCUMENT.md) for detailed documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for **Guwahati Municipal Corporation** flood response
- Supports **UN SDG 13**: Climate Action
- Weather data provided by **Tomorrow.io**
- Inspired by real-world flood management needs in Assam

---

**Version**: 2.0  
**Status**: ✅ Production Ready - Fully Integrated  
**Last Updated**: January 31, 2026  
**System Status**: Dashboard ↔ API ↔ Citizen App (100% Connected)

## 📞 Quick Links

- [📊 Dashboard README](./JolBondhuDashBoard/README.md)
- [📱 Citizen App README](./JolBondhuApp/README.md)
- [⚙️ Backend README](./backend/README.md)
- [📚 Full Documentation](./DOCUMENT.md)
