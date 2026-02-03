import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { stationPolygons } from '../data/stationPolygons';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const riskColors = {
  High: { fill: '#ef4444', stroke: '#dc2626' },
  Medium: { fill: '#eab308', stroke: '#ca8a04' },
  Low: { fill: '#22c55e', stroke: '#16a34a' }
};

const stationRiskColors = {
  High: { fill: '#f87171', stroke: '#dc2626', dash: '5, 5' },
  Medium: { fill: '#fcd34d', stroke: '#ca8a04', dash: '5, 5' },
  Low: { fill: '#86efac', stroke: '#16a34a', dash: '5, 5' }
};

const ZoneMap = ({ 
  basins: initialBasins, 
  selectedBasin, 
  onBasinSelect,
  selectedStation,
  onStationSelect,
  darkMode, 
  language, 
  t,
  showStations = true
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonsRef = useRef([]);
  const stationPolygonsRef = useRef([]);
  const markersRef = useRef([]);
  const [isClient, setIsClient] = useState(false);

  const [basins] = useState(initialBasins);

  const center = [26.1480, 91.6750];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 8,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    if (darkMode) {
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }
      ).addTo(map);
    } else {
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }
      ).addTo(map);
    }

    mapInstanceRef.current = map;

    const handleResize = () => {
      setTimeout(() => map.invalidateSize(), 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, darkMode]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isClient) return;

    polygonsRef.current.forEach((polygon) => polygon.remove());
    polygonsRef.current = [];

    (basins || []).forEach((basin) => {
      if (!basin.polygon || basin.polygon.length === 0) return;

      const isSelected = selectedBasin?.id === basin.id;
      const colors = riskColors[basin.riskLevel] || riskColors.Low;
      
      const name = language === 'as' && basin.nameAssamese 
        ? basin.nameAssamese 
        : basin.name;

      const polygon = L.polygon(basin.polygon, {
        color: isSelected ? '#0d9488' : colors.stroke,
        fillColor: colors.fill,
        fillOpacity: isSelected ? 0.5 : 0.35,
        weight: isSelected ? 3 : 2,
        dashArray: isSelected ? undefined : '5, 5',
      }).addTo(mapInstanceRef.current);

      const riskLevelText = language === 'as' 
        ? (basin.riskLevel === 'High' ? 'উচ্চ' : basin.riskLevel === 'Medium' ? 'মধ্যম' : 'নিম্ন')
        : basin.riskLevel;

      const tooltipContent = `
        <div style="min-width: 180px; padding: 4px;">
          <p style="font-weight: 600; margin: 0 0 4px 0;">${name}</p>
          <div style="font-size: 12px; color: #666;">
            <p style="margin: 2px 0;"><strong>${t.riskLevel}:</strong> <span style="color: ${
              basin.riskLevel === 'High' ? '#dc2626' : basin.riskLevel === 'Medium' ? '#ca8a04' : '#16a34a'
            }; font-weight: 600;">${riskLevelText}</span></p>
            <p style="margin: 2px 0;"><strong>${t.currentRainfall}:</strong> ${basin.rainfall} ${t.mm}</p>
            <p style="margin: 2px 0;"><strong>${t.riverLevel}:</strong> ${basin.riverLevel} m</p>
          </div>
        </div>
      `;

      polygon.bindTooltip(tooltipContent, { sticky: true });
      polygon.on('click', () => onBasinSelect && onBasinSelect(basin));

      polygon.on('mouseover', () => {
        polygon.setStyle({ fillOpacity: 0.6, weight: 3 });
      });
      polygon.on('mouseout', () => {
        polygon.setStyle({
          fillOpacity: isSelected ? 0.5 : 0.35,
          weight: isSelected ? 3 : 2,
        });
      });

      polygonsRef.current.push(polygon);
    });
  }, [basins, selectedBasin, language, t, isClient, onBasinSelect]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isClient || !showStations) return;

    stationPolygonsRef.current.forEach((polygon) => polygon.remove());
    markersRef.current.forEach((marker) => marker.remove());
    stationPolygonsRef.current = [];
    markersRef.current = [];

    stationPolygons.forEach((station) => {
      if (!station.polygon || station.polygon.length === 0) return;

      const isSelected = selectedStation?.id === station.id;
      const colors = stationRiskColors[station.riskLevel] || stationRiskColors.Low;

      const stationPolygon = L.polygon(station.polygon, {
        color: isSelected ? '#3b82f6' : colors.stroke,
        fillColor: colors.fill,
        fillOpacity: isSelected ? 0.6 : 0.25,
        weight: isSelected ? 3 : 1.5,
        dashArray: colors.dash,
      }).addTo(mapInstanceRef.current);

      const tooltipContent = `
        <div style="min-width: 200px; padding: 4px;">
          <p style="font-weight: 600; margin: 0 0 4px 0; color: ${
            station.riskLevel === 'High' ? '#dc2626' : 
            station.riskLevel === 'Medium' ? '#ca8a04' : '#16a34a'
          };">${station.name}</p>
          <div style="font-size: 11px; color: #666;">
            <p style="margin: 2px 0;"><strong>Station:</strong> ${station.stationCode}</p>
            <p style="margin: 2px 0;"><strong>River:</strong> ${station.riverName}</p>
            <p style="margin: 2px 0;"><strong>District:</strong> ${station.district}</p>
            <p style="margin: 2px 0;"><strong>Risk:</strong> <span style="color: ${
              station.riskLevel === 'High' ? '#dc2626' : 
              station.riskLevel === 'Medium' ? '#ca8a04' : '#16a34a'
            };">${station.riskLevel}</span></p>
          </div>
        </div>
      `;

      stationPolygon.bindTooltip(tooltipContent, { sticky: true });
      stationPolygon.on('click', () => {
        if (onStationSelect) {
          onStationSelect({
            ...station,
            polygon: station.polygon,
            coords: [station.lat, station.lon]
          });
        }
      });

      stationPolygon.on('mouseover', () => {
        stationPolygon.setStyle({ fillOpacity: 0.5, weight: 2 });
      });
      stationPolygon.on('mouseout', () => {
        stationPolygon.setStyle({
          fillOpacity: isSelected ? 0.6 : 0.25,
          weight: isSelected ? 3 : 1.5,
        });
      });

      stationPolygonsRef.current.push(stationPolygon);
    });
  }, [showStations, selectedStation, isClient, onStationSelect]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (selectedStation && selectedStation.coords) {
      mapInstanceRef.current.flyTo(selectedStation.coords, 12, {
        duration: 0.8,
      });
    } else if (selectedBasin && selectedBasin.coords) {
      mapInstanceRef.current.flyTo(selectedBasin.coords, 12, {
        duration: 0.8,
      });
    }
  }, [selectedStation, selectedBasin]);

  if (!isClient) {
    return (
      <div className={`rounded-2xl overflow-hidden border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-sm`}>
        <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'} flex items-center gap-2`}>
          <MapPin className="text-teal-500" size={20} />
          <h3 className="font-semibold">{t.liveZoneMap}</h3>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          <div className="text-gray-400">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl overflow-hidden border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-sm`}>
      <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'} flex items-center gap-2`}>
        <MapPin className="text-teal-500" size={20} />
        <h3 className="font-semibold">{t.liveZoneMap}</h3>
      </div>
      
      <div className="relative h-64 w-full">
        <div ref={mapContainerRef} className="h-full w-full" />
        
        <div className={`absolute bottom-3 left-3 z-[1000] rounded-lg p-2 shadow-lg backdrop-blur-sm ${darkMode ? 'bg-slate-800/90' : 'bg-white/90'}`}>
          <p className={`mb-1.5 text-[10px] font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.riskLevel}
          </p>
          <div className="space-y-1">
            {['High', 'Medium', 'Low'].map((level) => {
              const label = language === 'as' 
                ? (level === 'High' ? 'উচ্চ' : level === 'Medium' ? 'মধ্যম' : 'নিম্ন')
                : level;
              return (
                <div key={level} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: riskColors[level].fill }}
                  />
                  <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
                </div>
              );
            })}
          </div>
          {showStations && (
            <>
              <div className="border-t my-2 pt-2">
                <p className={`mb-1.5 text-[10px] font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Stations
                </p>
                {['High', 'Medium', 'Low'].map((level) => {
                  const stationLabel = language === 'as' 
                    ? (level === 'High' ? 'উচ্চ' : level === 'Medium' ? 'মধ্যম' : 'নিম্ন')
                    : level;
                  return (
                    <div key={`station-${level}`} className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-sm"
                        style={{ backgroundColor: stationRiskColors[level].fill }}
                      />
                      <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{stationLabel}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className={`absolute bottom-3 right-3 z-[1000] rounded-lg px-2 py-1 text-xs font-medium shadow-lg backdrop-blur-sm ${darkMode ? 'bg-slate-800/90 text-gray-300' : 'bg-white/90 text-gray-700'}`}>
          Assam, India
        </div>
      </div>
    </div>
  );
};

export default ZoneMap;
