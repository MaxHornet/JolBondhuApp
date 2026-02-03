import { useEffect, useState } from 'react';
import { Circle, Popup, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';

const HazardZoneOverlay = ({ language = 'en' }) => {
    const [hazardZones, setHazardZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const map = useMap();

    // Fetch hazard zones
    useEffect(() => {
        fetchHazardZones();
        // Refresh every 2 minutes
        const interval = setInterval(fetchHazardZones, 120000);
        return () => clearInterval(interval);
    }, []);

    const fetchHazardZones = async () => {
        try {
            const response = await fetch('http://localhost:3002/api/hazard_zones');
            if (response.ok) {
                const data = await response.json();
                setHazardZones(data);
                console.log('Loaded hazard zones:', data.length);
            }
        } catch (error) {
            console.error('Failed to load hazard zones:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high':
                return { fill: '#ef4444', stroke: '#dc2626' }; // Red
            case 'medium':
                return { fill: '#f59e0b', stroke: '#d97706' }; // Orange
            case 'low':
                return { fill: '#eab308', stroke: '#ca8a04' }; // Yellow
            default:
                return { fill: '#6b7280', stroke: '#4b5563' }; // Gray
        }
    };

    const formatTimeAgo = (isoDate) => {
        const now = new Date();
        const reported = new Date(isoDate);
        const diffMs = now - reported;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffHrs > 0) {
            return language === 'as' ? `${diffHrs} ঘণ্টা পূৰ্বে` : `${diffHrs}h ago`;
        }
        return language === 'as' ? `${diffMins} মিনিট পূৰ্বে` : `${diffMins}m ago`;
    };

    if (loading) return null;

    return (
        <>
            {hazardZones.map((zone) => {
                const colors = getSeverityColor(zone.severity);
                return (
                    <Circle
                        key={zone.id}
                        center={[zone.location.lat, zone.location.lng]}
                        radius={zone.radius}
                        pathOptions={{
                            fillColor: colors.fill,
                            color: colors.stroke,
                            fillOpacity: 0.3,
                            weight: 2,
                            dashArray: '5, 5'
                        }}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <div className="flex items-start gap-2 mb-2">
                                    <AlertTriangle className={`w-5 h-5 ${zone.severity === 'high' ? 'text-red-500' :
                                            zone.severity === 'medium' ? 'text-orange-500' :
                                                'text-yellow-500'
                                        }`} />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm mb-1">
                                            {language === 'as' ? zone.descriptionAssamese : zone.description}
                                        </h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatTimeAgo(zone.reportedAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                            <MapPin className="w-3 h-3" />
                                            <span>{zone.location.lat.toFixed(4)}, {zone.location.lng.toFixed(4)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${zone.severity === 'high' ? 'bg-red-100 text-red-700' :
                                        zone.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {zone.severity.toUpperCase()}
                                </div>
                            </div>
                        </Popup>
                    </Circle>
                );
            })}
        </>
    );
};

export default HazardZoneOverlay;
