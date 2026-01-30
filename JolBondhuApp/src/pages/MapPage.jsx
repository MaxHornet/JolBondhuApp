import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Polygon, Popup, Marker, useMap } from 'react-leaflet'
import { MapPin, Navigation, Droplets, AlertTriangle } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom user location marker
const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg relative">
    <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
  </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
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

    // Get polygon color based on risk level
    const getPolygonColor = (riskLevel) => {
        switch (riskLevel) {
            case 'High': return { color: '#ef4444', fillColor: '#ef4444' }
            case 'Medium': return { color: '#f59e0b', fillColor: '#f59e0b' }
            case 'Low': return { color: '#22c55e', fillColor: '#22c55e' }
            default: return { color: '#3b82f6', fillColor: '#3b82f6' }
        }
    }

    // Default center on Guwahati
    const defaultCenter = [26.1445, 91.6616]

    return (
        <div className="h-[calc(100vh-8rem)] relative">
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

                {/* Zone Polygons */}
                {basins.map(basin => {
                    const colors = getPolygonColor(basin.riskLevel)
                    return (
                        <Polygon
                            key={basin.id}
                            positions={basin.polygon}
                            pathOptions={{
                                ...colors,
                                fillOpacity: selectedBasin?.id === basin.id ? 0.5 : 0.3,
                                weight: selectedBasin?.id === basin.id ? 3 : 2
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
        </div>
    )
}

export default MapPage
