import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import RiskStatusCard from './components/RiskStatusCard';
import RainfallChart from './components/RainfallChart';
import ZoneList from './components/ZoneList';
import CitizenFeed from './components/CitizenFeed';
import ActionCenter from './components/ActionCenter';
import ZoneMap from './components/ZoneMap';
import SimulationPanel from './components/SimulationPanel';
import SimulationToast, { useSimulationToast } from './components/SimulationToast';
import WaterLevelStations from './components/WaterLevelStations';
import WarningLevelCard from './components/WarningLevelCard';
import LiveMap from './pages/LiveMap';
import Analytics from './pages/Analytics';
import CitizenReportsPage from './pages/CitizenReportsPage';
import { mockData } from './data/mockData';
import { apiService } from './services/apiService';
import { generateSimulatedBasins, DEFAULT_PARAMS } from './services/simulationService';
import { Beaker } from 'lucide-react';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jolbondhu-dark-mode');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [language, setLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBasin, setSelectedBasin] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [basins, setBasins] = useState(mockData.basins);
  const [liveBasins, setLiveBasins] = useState(mockData.basins);
  const [isLoading, setIsLoading] = useState(true);

  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [simulationPanelOpen, setSimulationPanelOpen] = useState(false);
  const [simulationParams, setSimulationParams] = useState(DEFAULT_PARAMS);

  const { toasts, dismissToast, showWarning, showSuccess, showInfo } = useSimulationToast();

  const [hasNewAlerts, setHasNewAlerts] = useState(false);

  useEffect(() => {
    const fetchBasins = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getBasins();
        if (data && data.length > 0) {
          setLiveBasins(data);
          if (!isSimulationMode) {
            setBasins(data);
          }
          setSelectedBasin(data[0]);
        }
      } catch (error) {
        console.error('Error fetching basins:', error);
        if (!selectedBasin && mockData.basins.length > 0) {
          setSelectedBasin(mockData.basins[0]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBasins();
  }, []);

  useEffect(() => {
    if (isSimulationMode) {
      const simulatedBasins = generateSimulatedBasins(liveBasins, simulationParams);
      setBasins(simulatedBasins);
      showInfo('Switched to simulation mode', 'Simulation');
    } else {
      setBasins(liveBasins);
    }
  }, [isSimulationMode]);

  useEffect(() => {
    if (isSimulationMode) {
      const simulatedBasins = generateSimulatedBasins(liveBasins, simulationParams);
      setBasins(simulatedBasins);
    }
  }, [simulationParams]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const updatedData = await apiService.getBasins();
        if (updatedData && updatedData.length > 0) {
          setBasins(updatedData);
          if (selectedBasin) {
            const updatedSelected = updatedData.find(b => b.id === selectedBasin.id);
            if (updatedSelected) {
              setSelectedBasin(updatedSelected);
            }
          }
        }
      } catch (error) {
        console.error('Error polling basin updates:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedBasin?.id]);

  const t = mockData.translations[language];

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('jolbondhu-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleStationSelect = (station) => {
    setSelectedStation(station);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'livemap':
        return (
          <LiveMap
            darkMode={darkMode}
            language={language}
            translations={t}
          />
        );
      case 'analytics':
        return (
          <Analytics
            darkMode={darkMode}
            language={language}
            translations={t}
          />
        );
      case 'reports':
        return (
          <CitizenReportsPage
            darkMode={darkMode}
            language={language}
            translations={t}
            selectedStation={selectedStation}
          />
        );
      case 'dashboard':
      default:
        return (
          <main className="p-4 lg:p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
            >
              {/* Hero Risk Status - Spans 2 columns */}
              <div className="lg:col-span-2 space-y-4">
                {selectedStation ? (
                  <WarningLevelCard
                    station={selectedStation}
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
                ) : (
                  <RiskStatusCard
                    basin={selectedBasin}
                    darkMode={darkMode}
                    language={language}
                    t={t}
                  />
                )}
              </div>

              {/* Action Center */}
              <div className="lg:col-span-1">
                <ActionCenter
                  darkMode={darkMode}
                  language={language}
                  t={t}
                  selectedBasin={selectedBasin}
                />
              </div>

              {/* Rainfall Chart */}
              <div className="lg:col-span-1">
                <RainfallChart
                  selectedBasin={selectedBasin}
                  darkMode={darkMode}
                  language={language}
                  t={t}
                />
              </div>

              {/* Zone Map with Stations */}
              <div className="lg:col-span-2">
                <ZoneMap
                  basins={basins}
                  selectedBasin={selectedBasin}
                  onBasinSelect={setSelectedBasin}
                  selectedStation={selectedStation}
                  onStationSelect={handleStationSelect}
                  darkMode={darkMode}
                  language={language}
                  t={t}
                  showStations={true}
                />
              </div>

              {/* Zone List */}
              <div className="lg:col-span-1">
                <ZoneList
                  basins={basins}
                  selectedBasin={selectedBasin}
                  onSelect={setSelectedBasin}
                  darkMode={darkMode}
                  language={language}
                  t={t}
                />
              </div>

              {/* Water Level Stations */}
              <div className="lg:col-span-1">
                <WaterLevelStations
                  darkMode={darkMode}
                  language={language}
                  selectedStation={selectedStation}
                  onStationSelect={handleStationSelect}
                  translations={t}
                />
              </div>

              {/* Citizen Feed - Spans full width on mobile, 2 columns on large */}
              <div className="lg:col-span-2">
                <CitizenFeed
                  selectedBasin={selectedBasin}
                  darkMode={darkMode}
                  language={language}
                  t={t}
                />
              </div>
            </motion.div>
          </main>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-800'}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        darkMode={darkMode}
        t={t}
        language={language}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <SimulationPanel
        isOpen={simulationPanelOpen}
        onClose={() => setSimulationPanelOpen(false)}
        isSimulationMode={isSimulationMode}
        onToggleMode={() => setIsSimulationMode(!isSimulationMode)}
        params={simulationParams}
        onParamsChange={setSimulationParams}
        darkMode={darkMode}
        language={language}
        t={t}
      />

      <SimulationToast
        toasts={toasts}
        onDismiss={dismissToast}
        darkMode={darkMode}
      />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSimulationPanelOpen(!simulationPanelOpen)}
        className={`fixed left-4 top-20 z-30 p-3 rounded-xl shadow-lg border transition-all ${isSimulationMode
          ? 'bg-purple-500 text-white border-purple-600'
          : darkMode
            ? 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          } ${simulationPanelOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        title={language === 'as' ? 'চিমুলেচন মোড' : 'Simulation Mode'}
      >
        <Beaker className="w-5 h-5" />
      </motion.button>

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <TopBar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          language={language}
          setLanguage={setLanguage}
          onMenuClick={() => setSidebarOpen(true)}
          t={t}
          currentTime={currentTime}
        />

        {renderContent()}
      </div>
    </div>
  );
}

export default App;
