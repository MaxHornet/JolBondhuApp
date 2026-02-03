import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, Image as ImageIcon, AlertTriangle, MapPin, CloudRain, Mic, Play, Pause, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardWeatherService from '../services/dashboardWeatherService';
import { apiService } from '../services/apiService';

/**
 * CitizenFeed Component (Updated with Real API Integration)
 * 
 * Displays citizen reports with IMD official warnings at the top
 * Shows zone-specific reports from API with 30-second polling
 */

const CitizenFeed = ({ selectedBasin, darkMode, language, t }) => {
  const [reports, setReports] = useState([]);
  const [imWarnings, setIMWarnings] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch IMD warnings, weather, and reports for the zone
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch real reports from API
        if (selectedBasin?.id) {
          const apiReports = await apiService.getReports(selectedBasin.id);
          // Transform API reports to component format
          const formattedReports = apiReports.map(report => ({
            id: report.id,
            basinId: report.basinId,
            user: report.userName || 'Anonymous',
            location: selectedBasin?.location || 'Unknown Location',
            locationAssamese: selectedBasin?.locationAssamese || 'অজ্ঞাত অৱস্থান',
            time: new Date(report.timestamp).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            content: `${report.issueType}: ${report.description}`,
            messageAssamese: `${report.issueType}: ${report.description}`,
            type: 'report',
            image: !!report.photoData,
            photoData: report.photoData || null,
            voiceData: report.voiceData || null,
            status: report.status
          }));
          setReports(formattedReports);
        }

        // Fetch IMD warnings
        const warnings = await DashboardWeatherService.fetchIMDWarnings();

        // Filter warnings for selected basin's district
        const relevantWarnings = warnings.filter(w => {
          const district = selectedBasin?.id === 'brahmaputra-north' ? 'SONITPUR' : 'KAMRUP';
          return w.district.includes(district) || w.district.includes('GUWAHATI');
        });

        setIMWarnings(relevantWarnings);

        // Fetch zone weather
        if (selectedBasin?.id) {
          const zoneWeather = await DashboardWeatherService.fetchZoneWeather(selectedBasin.id);
          setWeather(zoneWeather);
        }
      } catch (error) {
        console.error('Error fetching feed data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh every 30 seconds (reports) and 15 minutes (weather/warnings)
    const reportInterval = setInterval(fetchData, 30000); // 30 seconds for reports
    return () => clearInterval(reportInterval);
  }, [selectedBasin?.id]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'alert': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'update': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  // Translate report type
  const getTypeLabel = (type) => {
    if (language !== 'as') return type.charAt(0).toUpperCase() + type.slice(1);
    switch (type) {
      case 'alert': return 'সতৰ্কবাণী';
      case 'update': return 'আপডেট';
      default: return 'প্ৰতিবেদন';
    }
  };

  // Filter reports by selected basin
  const filteredReports = reports?.filter(report => report?.basinId === selectedBasin?.id) || [];

  // Get bilingual zone name for header
  const zoneName = language === 'as' && selectedBasin?.nameAssamese
    ? selectedBasin.nameAssamese
    : selectedBasin?.name;

  // Format warning time
  const formatWarningTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Check if warning is still active
  const isWarningActive = (expires) => {
    if (!expires) return false;
    return new Date(expires) > new Date();
  };

  return (
    <div className={`rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-sm`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-2">
        <MessageSquare className="text-teal-500" size={20} />
        <div>
          <h3 className="font-semibold">{t.citizenReportsFeed}</h3>
          <p className="text-xs text-gray-500">{zoneName}</p>
        </div>
      </div>

      {/* IMD Official Warnings Section */}
      <AnimatePresence>
        {imWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`border-b ${darkMode ? 'border-slate-700 bg-red-900/10' : 'border-gray-200 bg-red-50'}`}
          >
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className={`text-xs font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {language === 'as' ? 'IMD সতৰ্কবাণী (অফিচিয়েল)' : 'IMD Warnings (Official)'}
                </span>
              </div>

              <div className="space-y-2">
                {imWarnings.filter(w => isWarningActive(w.expires)).slice(0, 2).map((warning) => (
                  <div
                    key={warning.id}
                    className={`p-2.5 rounded-lg border-l-2 ${warning.severity === 'high'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {warning.district}
                        </div>
                        <div className={`text-xs mt-0.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {language === 'as' && warning.descriptionAssamese
                            ? warning.descriptionAssamese
                            : warning.description}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${warning.severity === 'high'
                              ? 'bg-red-500 text-white'
                              : 'bg-amber-500 text-white'
                            }`}>
                            {warning.severity.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Until {formatWarningTime(warning.expires)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {imWarnings.filter(w => isWarningActive(w.expires)).length > 2 && (
                  <div className="text-center">
                    <span className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      +{imWarnings.filter(w => isWarningActive(w.expires)).length - 2} more {language === 'as' ? 'আৰু' : 'more'} active
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Weather Mini-Card */}
      {weather && (
        <div className={`p-3 border-b ${darkMode ? 'border-slate-700 bg-blue-900/10' : 'border-gray-200 bg-blue-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-500" />
              <span className={`text-xs ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {language === 'as' ? 'বৰ্তমান বতৰ:' : 'Current Weather:'}
              </span>
              <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {Math.round(weather.temperature)}°C
              </span>
              {(weather.rainIntensity || 0) > 0 && (
                <span className="text-xs text-blue-500">
                  ({weather.rainIntensity.toFixed(1)} mm/h)
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {Math.round(weather.humidity)}% {language === 'as' ? 'আৰ্দ্ৰতা' : 'humidity'}
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="divide-y divide-gray-200 dark:divide-slate-700 max-h-80 overflow-y-auto">
        {filteredReports.length > 0 ? (
          filteredReports.map((report, idx) => {
            // Get bilingual content
            const reportContent = language === 'as' && report?.messageAssamese
              ? report.messageAssamese
              : report?.content;
            const reportLocation = language === 'as' && report?.locationAssamese
              ? report.locationAssamese
              : report?.location;

            return (
              <motion.div
                key={report?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getTypeColor(report?.type)}`}>
                      {report?.user?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{report?.user}</div>
                      <div className="text-xs text-gray-500">{reportLocation}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    {report?.time}
                  </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 ml-10">
                  {reportContent}
                </p>

                {/* Display actual photo if available */}
                {report?.photoData && (
                  <div className="ml-10 mt-2">
                    <img
                      src={report.photoData}
                      alt="Report photo"
                      className="w-full max-h-48 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(report.photoData, '_blank')}
                    />
                  </div>
                )}

                {/* Display audio player for voice messages */}
                {report?.voiceData && (
                  <div className={`ml-10 mt-2 p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 size={16} className="text-teal-500" />
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {language === 'as' ? 'ভয়েচ মেছেজ' : 'Voice Message'}
                      </span>
                    </div>
                    <audio
                      controls
                      src={report.voiceData}
                      className="w-full h-8"
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                )}

                {/* Fallback: Show placeholder if image flag is set but no photoData */}
                {report?.image && !report?.photoData && (
                  <div className="ml-10 mt-2">
                    <div className={`w-full h-32 rounded-lg border-2 border-dashed flex items-center justify-center ${darkMode ? 'border-slate-600 bg-slate-700/50' : 'border-gray-300 bg-gray-50'}`}>
                      <div className="text-center text-gray-400">
                        <ImageIcon size={24} className="mx-auto mb-1" />
                        <span className="text-xs">{t.photoAttached}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {language === 'as' ? t.noReportsAs : t.noReports}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenFeed;
