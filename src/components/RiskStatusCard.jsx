// AGENT: Update PROJECT_CONTEXT.md after any changes
// Location: ./PROJECT_CONTEXT.md  ← RELATIVE PATH (auto-detected)
// Protocol: See AGENTS_UPDATE_PROTOCOL.md in workspace root
// RULE: Always maintain context for current and future agents
// NOTE: If context not found here, search parent directories
// PROJECT FINGERPRINT: jolbondhu-dashboard-testing2

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Droplets, TrendingUp, MapPin, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';

const RiskStatusCard = ({ basin: initialBasin, darkMode, language, t }) => {
  const [basinData, setBasinData] = useState(initialBasin);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  // Fetch real-time risk status from API with 30-second polling
  useEffect(() => {
    const fetchRiskStatus = async () => {
      if (!initialBasin?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch fresh data from API
        const data = await apiService.getBasinById(initialBasin.id);
        setBasinData(data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching risk status:', err);
        setError(err.message);
        // Fallback to initial data if API fails
        setBasinData(initialBasin);
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchRiskStatus();
    
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchRiskStatus, 30000);
    
    return () => clearInterval(interval);
  }, [initialBasin?.id]); // Only re-run when basin ID changes

  // Manual refresh function
  const handleRefresh = async () => {
    if (!initialBasin?.id) return;
    
    try {
      setLoading(true);
      const data = await apiService.getBasinById(initialBasin.id);
      setBasinData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error refreshing risk status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'High': return 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'Medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      default: return 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    }
  };

  // Get bilingual content
  const basinName = language === 'as' && basinData?.nameAssamese ? basinData.nameAssamese : basinData?.name;
  const basinLocation = language === 'as' && basinData?.locationAssamese ? basinData.locationAssamese : basinData?.location;

  // Translate risk level
  const riskLevelText = language === 'as'
    ? (basinData?.riskLevel === 'High' ? 'উচ্চ' : basinData?.riskLevel === 'Medium' ? 'মধ্যম' : 'নিম্ন')
    : basinData?.riskLevel;

  // Format time ago
  const getTimeAgo = (date) => {
    if (!date) return '';
    const minutes = Math.floor((new Date() - date) / 60000);
    if (minutes < 1) return language === 'as' ? 'এতিয়াই' : 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-6 border ${getRiskColor(basinData?.riskLevel)} ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg relative`}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center z-10">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={18} />
            <h3 className="text-lg font-bold">{basinName}</h3>
          </div>
          <p className="text-sm opacity-80">{basinLocation || 'Assam, India'}</p>
          {lastUpdated && (
            <p className="text-xs opacity-60 mt-1">
              {language === 'as' ? 'আপডেট কৰা হৈছে: ' : 'Updated: '}{getTimeAgo(lastUpdated)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            title={language === 'as' ? 'ৰিফ্ৰেছ কৰক' : 'Refresh'}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          {basinData?.riskLevel === 'High' && (
            <div className="pulse-alert p-2 rounded-full bg-red-500 text-white">
              <AlertTriangle size={24} />
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {language === 'as' 
            ? 'ত্ৰুটি: ডেটা লোড কৰাত বিফল। পুনৰ চেষ্টা কৰক।'
            : `Error: ${error}. Please try again.`
          }
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-white/50'} backdrop-blur`}>
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Droplets size={16} />
            <span className="text-sm">{t.currentRainfall}</span>
          </div>
          <p className="text-2xl font-bold">{basinData?.rainfall || '45'} {t.mm}</p>
        </div>
        
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-white/50'} backdrop-blur`}>
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <TrendingUp size={16} />
            <span className="text-sm">{t.riverLevel}</span>
          </div>
          <p className="text-2xl font-bold">{basinData?.riverLevel || '12.5'} m</p>
        </div>
      </div>

      {basinData?.riskLevel === 'High' && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm font-medium text-center">
          {t.floodAlertActive}
        </div>
      )}

      {/* Risk Level Badge */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm opacity-70">{t.riskLevel}:</span>
        <span className={`px-2 py-1 rounded text-sm font-semibold ${
          basinData?.riskLevel === 'High' ? 'bg-red-500 text-white' :
          basinData?.riskLevel === 'Medium' ? 'bg-amber-500 text-white' :
          'bg-green-500 text-white'
        }`}>
          {riskLevelText}
        </span>
      </div>
    </motion.div>
  );
};

export default RiskStatusCard;
