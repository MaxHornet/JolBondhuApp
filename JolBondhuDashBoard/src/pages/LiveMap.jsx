import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Layers, ZoomIn, ZoomOut, Maximize2, Minimize2, Info } from 'lucide-react';
import ZoneMap from '../components/ZoneMap';
import WarningLevelCard from '../components/WarningLevelCard';
import { stationPolygons } from '../data/stationPolygons';
import { apiService } from '../services/apiService';

const LiveMap = ({ darkMode, language, translations }) => {
  const [waterLevels, setWaterLevels] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedBasin, setSelectedBasin] = useState(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [showStations, setShowStations] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [mapKey, setMapKey] = useState(0);

  const t = translations;

  useEffect(() => {
    const fetchWaterLevels = async () => {
      try {
        const data = await apiService.getWaterLevels();
        setWaterLevels(data || []);
      } catch (err) {
        console.error('Error fetching water levels:', err);
      }
    };
    fetchWaterLevels();
  }, []);

  const handleStationSelect = (station) => {
    const waterData = waterLevels.find(w => w.id === station.id);
    const enrichedStation = {
      ...station,
      ...waterData,
      coords: station.coords || [station.lat, station.lon]
    };
    setSelectedStation(enrichedStation);
    setSelectedBasin(null);
  };

  const handleBasinSelect = (basin) => {
    setSelectedBasin(basin);
    setSelectedStation(null);
  };

  const handleResetView = () => {
    setSelectedStation(null);
    setSelectedBasin(null);
    setMapKey(prev => prev + 1);
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {t.liveMap}
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Interactive map showing all monitoring zones and water level stations
          </p>
        </motion.div>

        <div className="flex flex-col xl:flex-row gap-4 h-[calc(100vh-140px)]">
          {/* Main Map Area - Takes most of the space */}
          <div className={`flex-1 min-h-[400px] xl:min-h-0 ${mapFullscreen ? 'fixed inset-4 z-50' : ''}`}>
            <div className={`relative rounded-2xl overflow-hidden border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-lg h-full w-full ${mapFullscreen ? 'h-full' : ''}`}>
              {/* Map Controls */}
              <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <button
                  onClick={() => setShowZones(!showZones)}
                  className={`p-2 rounded-lg shadow-lg transition-colors ${
                    showZones 
                      ? darkMode ? 'bg-teal-600 text-white' : 'bg-teal-500 text-white'
                      : darkMode ? 'bg-slate-700 text-gray-300' : 'bg-white text-gray-700'
                  }`}
                  title={showZones ? 'Hide Zones' : 'Show Zones'}
                >
                  <Layers className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowStations(!showStations)}
                  className={`p-2 rounded-lg shadow-lg transition-colors ${
                    showStations 
                      ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                      : darkMode ? 'bg-slate-700 text-gray-300' : 'bg-white text-gray-700'
                  }`}
                  title={showStations ? 'Hide Stations' : 'Show Stations'}
                >
                  <Map className="w-5 h-5" />
                </button>
                <button
                  onClick={handleResetView}
                  className={`p-2 rounded-lg shadow-lg transition-colors ${
                    darkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Reset View"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setMapFullscreen(!mapFullscreen)}
                  className={`p-2 rounded-lg shadow-lg transition-colors ${
                    darkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  title={mapFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {mapFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Info Badge */}
              <div className={`absolute top-4 left-4 z-[1000] rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm ${darkMode ? 'bg-slate-800/90 text-gray-300' : 'bg-white/90 text-gray-700'}`}>
                <div className="flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>Click on zones or stations to view details</span>
                </div>
              </div>

              <ZoneMap
                key={mapKey}
                selectedBasin={selectedBasin}
                onBasinSelect={handleBasinSelect}
                selectedStation={selectedStation}
                onStationSelect={handleStationSelect}
                darkMode={darkMode}
                language={language}
                t={t}
                showStations={showStations}
              />
            </div>
          </div>

          {/* Side Panel - Fixed width on right */}
          {!mapFullscreen && (
            <div className="w-full xl:w-80 flex-shrink-0 space-y-4 overflow-y-auto">
              {selectedStation ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <WarningLevelCard
                    station={selectedStation}
                    darkMode={darkMode}
                    language={language}
                    translations={{
                      warningLevelCard: 'Selected Station',
                      risk: 'Risk',
                      currentFlowLevel: 'Current Level',
                      dangerLevel: 'Danger Level',
                      highFlowLevel: 'High Level',
                      stationCode: 'Code',
                      rcName: 'RC',
                      basin: 'Basin'
                    }}
                  />
                  <button
                    onClick={() => setSelectedStation(null)}
                    className={`mt-2 w-full py-2 text-sm rounded-lg transition-colors ${
                      darkMode 
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Clear Selection
                  </button>
                </motion.div>
              ) : selectedBasin ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className={`rounded-2xl border p-4 ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                  }`}>
                    <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedBasin.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Risk Level: <span className={`font-semibold ${
                        selectedBasin.riskLevel === 'High' ? 'text-red-500' :
                        selectedBasin.riskLevel === 'Medium' ? 'text-amber-500' :
                        'text-green-500'
                      }`}>{selectedBasin.riskLevel}</span>
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Rainfall: {selectedBasin.rainfall} mm
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      River Level: {selectedBasin.riverLevel} m
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBasin(null)}
                    className={`mt-2 w-full py-2 text-sm rounded-lg transition-colors ${
                      darkMode 
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Clear Selection
                  </button>
                </motion.div>
              ) : (
                <div className={`rounded-2xl border p-4 text-center ${
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                }`}>
                  <Map className={`w-12 h-12 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Select a zone or station on the map to view details
                  </p>
                </div>
              )}

              {/* Station Quick List */}
              <div className={`rounded-2xl border overflow-hidden ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`p-3 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    High Risk Stations
                  </h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {stationPolygons
                    .filter(s => s.riskLevel === 'High')
                    .slice(0, 10)
                    .map(station => (
                      <button
                        key={station.id}
                        onClick={() => handleStationSelect(station)}
                        className={`w-full p-3 text-left border-b last:border-b-0 transition-colors ${
                          darkMode 
                            ? 'border-slate-700 hover:bg-slate-700' 
                            : 'border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {station.name}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {station.riverName} • {station.district}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-500">
                            {station.riskLevel}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
