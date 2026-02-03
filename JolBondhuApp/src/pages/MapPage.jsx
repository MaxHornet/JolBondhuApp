import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Polygon, Popup, Marker, useMap } from 'react-leaflet'
import { MapPin, Navigation, Droplets, AlertTriangle, X, Shield } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import HazardZoneOverlay from '../components/HazardZoneOverlay'
import CommunityActionsPanel from '../components/CommunityActionsPanel'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom user location marker with blue tick
const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: `<div class="relative w-10 h-10 flex items-center justify-center">
    <div class="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
    <div class="w-10 h-10 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
})

// Custom reporter location marker (red)
const reporterIcon = L.divIcon({
    className: 'reporter-location-marker',
    html: `<div class="relative w-8 h-8 flex items-center justify-center">
    <div class="absolute inset-0 bg-red-500 rounded-full opacity-30 animate-pulse"></div>
    <div class="w-8 h-8 bg-red-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
})

// Component to fly to selected zone
function FlyToZone({ basin }) {
    const map = useMap()

    useEffect(() => {
        if (basin) {
            map.flyTo(basin.coords, 14, { duration: 1 })
        }
    }, [basin, map])

    return null
}

function MapPage({ basins, darkMode, language, t }) {
    const [selectedBasin, setSelectedBasin] = useState(null)
    const [userLocation, setUserLocation] = useState(null)
    const [gettingLocation, setGettingLocation] = useState(false)
    const [nearbyRiskZone, setNearbyRiskZone] = useState(null)
    const [dismissedWarning, setDismissedWarning] = useState(false)
    const [reporterLocations, setReporterLocations] = useState([])

    // Fetch citizen reports with locations
    useEffect(() => {
        fetchReporterLocations()
        // Refresh every 30 seconds for real-time updates
        const interval = setInterval(fetchReporterLocations, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchReporterLocations = async () => {
        try {
            const response = await fetch('http://localhost:3001/reports')
            if (response.ok) {
                const reports = await response.json()
                // Filter reports that have location data
                const locationsWithData = reports
                    .filter(report => report.location && report.location.lat && report.location.lng)
                    .map(report => ({
                        id: report.id,
                        lat: report.location.lat,
                        lng: report.location.lng,
                        name: report.location.name || 'Citizen Report',
                        reportType: report.reportType || 'General',
                        createdAt: report.createdAt,
                        severity: report.severity || 'medium'
                    }))
                setReporterLocations(locationsWithData)
                console.log('Loaded reporter locations:', locationsWithData.length)
            }
        } catch (error) {
            console.error('Failed to fetch reporter locations:', error)
        }
    }

    // Get user's current location
    const getUserLocation = () => {
        setGettingLocation(true)
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude])
                    setGettingLocation(false)
                },
                (error) => {
                    console.error('Error getting location:', error)
                    setGettingLocation(false)
                },
                { enableHighAccuracy: true, timeout: 10000 }
            )
        }
    }

    // Get polygon color based on risk level with enhanced visuals
    const getPolygonColor = (riskLevel) => {
        switch (riskLevel) {
            case 'High': return { color: '#dc2626', fillColor: '#ef4444', weight: 3, dashArray: null }
            case 'Medium': return { color: '#d97706', fillColor: '#f59e0b', weight: 2, dashArray: '5, 5' }
            case 'Low': return { color: '#16a34a', fillColor: '#22c55e', weight: 2, dashArray: '3, 6' }
            default: return { color: '#2563eb', fillColor: '#3b82f6', weight: 2, dashArray: null }
        }
    }

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371 // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    // Check proximity to risk zones when user location updates
    useEffect(() => {
        if (!userLocation || dismissedWarning) return

        // Find nearby high/medium risk zones (within 2km)
        const riskZones = basins.filter(basin => {
            if (basin.riskLevel !== 'High' && basin.riskLevel !== 'Medium') return false
            const distance = calculateDistance(
                userLocation[0], userLocation[1],
                basin.coords[0], basin.coords[1]
            )
            return distance < 2 // 2km radius
        })

        if (riskZones.length > 0) {
            // Prioritize high risk zones
            const highRisk = riskZones.find(z => z.riskLevel === 'High')
            setNearbyRiskZone(highRisk || riskZones[0])
        } else {
            setNearbyRiskZone(null)
        }
    }, [userLocation, basins, dismissedWarning])

    // Default center on Guwahati
    const defaultCenter = [26.1445, 91.6616]

    return (
        <div className="h-[calc(100vh-8rem)] relative">
            {/* Proximity Warning Banner */}
            <AnimatePresence>
                {nearbyRiskZone && !dismissedWarning && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`absolute top-2 left-2 right-2 z-[1001] p-3 rounded-xl shadow-lg ${nearbyRiskZone.riskLevel === 'High'
                            ? 'bg-gradient-to-r from-red-600 to-red-500'
                            : 'bg-gradient-to-r from-amber-600 to-amber-500'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm">
                                    {language === 'as' ? 'সতৰ্কবাণী: আপুনি বিপদ অঞ্চলৰ ওচৰত আছে' : 'Warning: You are near a risk zone'}
                                </p>
                                <p className="text-white/80 text-xs mt-0.5">
                                    {language === 'as' ? nearbyRiskZone.nameAssamese : nearbyRiskZone.name} - {nearbyRiskZone.riskLevel} {language === 'as' ? 'বিপদ' : 'Risk'}
                                </p>
                            </div>
                            <button
                                onClick={() => setDismissedWarning(true)}
                                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Map Container */}
            <MapContainer
                center={defaultCenter}
                zoom={12}
                className="w-full h-full z-0"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url={darkMode
                        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                    }
                />

                {/* Zone Polygons with Enhanced Styling */}
                {basins.map(basin => {
                    const colors = getPolygonColor(basin.riskLevel)
                    const isSelected = selectedBasin?.id === basin.id
                    return (
                        <Polygon
                            key={basin.id}
                            positions={basin.polygon}
                            pathOptions={{
                                color: colors.color,
                                fillColor: colors.fillColor,
                                fillOpacity: isSelected ? 0.6 : (basin.riskLevel === 'High' ? 0.45 : 0.3),
                                weight: isSelected ? 4 : colors.weight,
                                dashArray: isSelected ? null : colors.dashArray
                            }}
                            eventHandlers={{
                                click: () => setSelectedBasin(basin)
                            }}
                        >
                            <Popup>
                                <div className="p-1">
                                    <h3 className="font-semibold text-sm mb-1">
                                        {language === 'as' ? basin.nameAssamese : basin.name}
                                    </h3>
                                    <div className="space-y-1 text-xs">
                                        <p className="flex items-center gap-1">
                                            <span className={`w-2 h-2 rounded-full ${basin.riskLevel === 'High' ? 'bg-red-500' :
                                                basin.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                                                }`}></span>
                                            {basin.riskLevel} Risk
                                        </p>
                                        <p>Rainfall: {basin.rainfall} mm</p>
                                        <p>Water Level: {basin.estimatedWaterLevel}m</p>
                                    </div>
                                </div>
                            </Popup>
                        </Polygon>
                    )
                })}

                {/* User Location Marker */}
                {userLocation && (
                    <Marker position={userLocation} icon={userIcon}>
                        <Popup>{t.yourLocation}</Popup>
                    </Marker>
                )}

                {/* Reporter Location Markers */}
                {reporterLocations.map(reporter => (
                    <Marker
                        key={reporter.id}
                        position={[reporter.lat, reporter.lng]}
                        icon={reporterIcon}
                    >
                        <Popup>
                            <div className="p-1 min-w-[150px]">
                                <h4 className="font-semibold text-sm mb-1">
                                    {language === 'as' ? 'নাগৰিক প্ৰতিবেদন' : 'Citizen Report'}
                                </h4>
                                <p className="text-xs text-gray-600 mb-1">
                                    {reporter.name}
                                </p>
                                <div className="text-xs text-gray-500">
                                    <p>{language === 'as' ? 'প্ৰকাৰ:' : 'Type:'} {reporter.reportType}</p>
                                    <p className="text-[10px] mt-1">
                                        {new Date(reporter.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Hazard Zone Overlays */}
                <HazardZoneOverlay language={language} />

                {/* Fly to selected zone */}
                {selectedBasin && <FlyToZone basin={selectedBasin} />}
            </MapContainer>

            {/* Floating Controls */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                {/* Get Location Button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={getUserLocation}
                    disabled={gettingLocation}
                    className={`p-3 rounded-xl shadow-lg ${darkMode
                        ? 'bg-slate-800 text-white'
                        : 'bg-white text-gray-800'
                        }`}
                >
                    <Navigation className={`w-5 h-5 ${gettingLocation ? 'animate-pulse' : ''}`} />
                </motion.button>
            </div>

            {/* Legend */}
            <div className={`absolute bottom-4 left-4 z-[1000] p-3 rounded-xl shadow-lg ${darkMode ? 'bg-slate-800/95 backdrop-blur-lg' : 'bg-white/95 backdrop-blur-lg'
                }`}>
                <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    {language === 'as' ? 'বিপদ স্তৰ' : 'Risk Level'}
                </p>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-500"></div>
                        <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            {t.highRisk}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-amber-500"></div>
                        <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            {t.mediumRisk}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-500"></div>
                        <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            {t.lowRisk}
                        </span>
                    </div>
                </div>
            </div>

            {/* Selected Zone Info Card */}
            {selectedBasin && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute bottom-4 right-4 left-28 z-[1000] p-4 rounded-xl shadow-lg ${darkMode ? 'bg-slate-800/95 backdrop-blur-lg' : 'bg-white/95 backdrop-blur-lg'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedBasin.riskLevel === 'High' ? 'bg-red-500/20' :
                            selectedBasin.riskLevel === 'Medium' ? 'bg-amber-500/20' : 'bg-green-500/20'
                            }`}>
                            {selectedBasin.riskLevel === 'High' ? (
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            ) : (
                                <Droplets className={`w-5 h-5 ${selectedBasin.riskLevel === 'Medium' ? 'text-amber-500' : 'text-green-500'
                                    }`} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {language === 'as' ? selectedBasin.nameAssamese : selectedBasin.name}
                            </h3>
                            <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                {language === 'as' ? selectedBasin.locationAssamese : selectedBasin.location}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={`text-xs ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                                    {selectedBasin.rainfall} mm
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedBasin.riskLevel === 'High'
                                    ? 'bg-red-500/20 text-red-500'
                                    : selectedBasin.riskLevel === 'Medium'
                                        ? 'bg-amber-500/20 text-amber-500'
                                        : 'bg-green-500/20 text-green-500'
                                    }`}>
                                    {selectedBasin.riskLevel}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedBasin(null)}
                            className={`p-1 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                        >
                            <span className="text-lg">×</span>
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Tap hint */}
            {!selectedBasin && (
                <div className={`absolute bottom-4 right-4 z-[1000] px-3 py-2 rounded-lg text-xs ${darkMode ? 'bg-slate-800/80 text-slate-300' : 'bg-white/80 text-gray-600'
                    }`}>
                    {t.tapZoneInfo}
                </div>
            )}

            {/* Community Actions Panel */}
            <CommunityActionsPanel
                language={language}
                darkMode={darkMode}
                userLocation={userLocation ? { lat: userLocation[0], lng: userLocation[1] } : null}
            />
        </div>
    )
}

export default MapPage
