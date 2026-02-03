import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, ChevronDown, ChevronUp, AlertTriangle, RefreshCw, MapPin, Droplets, Search, Filter } from 'lucide-react';
import { apiService } from '../services/apiService';
import { stationPolygons } from '../data/stationPolygons';

const WaterLevelStations = ({ darkMode, language, selectedStation, onStationSelect, translations }) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getWaterLevels();
      
      if (data && data.length > 0) {
        const enrichedData = data.map(station => {
          const polygonData = stationPolygons.find(sp => sp.id === station.id);
          return {
            ...station,
            polygon: polygonData?.polygon || null,
            coords: polygonData ? [polygonData.lat, polygonData.lon] : [station.lat, station.lon]
          };
        });
        setStations(enrichedData);
      } else {
        setStations([]);
      }
    } catch (err) {
      console.error('Error fetching water levels:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      if (selectedDistrict && s.district?.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }
      if (filter === 'high') return s.riskLevel === 'High';
      if (filter === 'medium') return s.riskLevel === 'Medium';
      if (filter === 'low') return s.riskLevel === 'Low';
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return s.name?.toLowerCase().includes(term) ||
               s.district?.toLowerCase().includes(term) ||
               s.riverName?.toLowerCase().includes(term) ||
               s.stationCode?.toLowerCase().includes(term);
      }
      return true;
    });
  }, [stations, filter, searchTerm, selectedDistrict]);

  const highCount = stations.filter(s => s.riskLevel === 'High').length;
  const mediumCount = stations.filter(s => s.riskLevel === 'Medium').length;
  const lowCount = stations.filter(s => s.riskLevel === 'Low').length;

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'Medium': return 'text-amber-500 bg-amber-500/20 border-amber-500/30';
      default: return 'text-green-500 bg-green-500/20 border-green-500/30';
    }
  };

  const getRiskBgColor = (level) => {
    switch (level) {
      case 'High': return 'bg-red-500/10 hover:bg-red-500/20';
      case 'Medium': return 'bg-amber-500/10 hover:bg-amber-500/20';
      default: return 'bg-green-500/10 hover:bg-green-500/20';
    }
  };

  const getText = (key) => {
    const texts = {
      en: {
        title: 'Water Level Stations',
        high: 'High Risk',
        medium: 'Medium Risk',
        low: 'Normal',
        all: 'All',
        current: 'Current',
        danger: 'Danger Level',
        warning: 'Warning Level',
        station: 'Station',
        river: 'River',
        loading: 'Loading...',
        error: 'Error loading data',
        noData: 'No stations found',
        refresh: 'Refresh',
        searchPlaceholder: 'Search stations...',
        filterByDistrict: 'Filter by District',
        clearFilter: 'Clear Filter'
      },
      as: {
        title: 'পানীৰ স্তৰ ষ্টেচন',
        high: 'উচ্চ বিপদ',
        medium: 'মধ্যম বিপদ',
        low: 'স্বাভাৱিক',
        all: 'সকলো',
        current: 'বৰ্তমান',
        danger: 'বিপদ স্তৰ',
        warning: 'সতৰ্কবাণী স্তৰ',
        station: 'ষ্টেচন',
        river: 'নদী',
        loading: 'লোড হৈ আছে...',
        error: 'ডেটা লোড কৰাত ত্রুটি',
        noData: 'কোনো ষ্টেচন পোৱা নগ\'ল',
        refresh: 'ৰিফ্রেছ',
        searchPlaceholder: 'ষ্টেচন বিচাৰক...',
        filterByDistrict: 'জিলা অনুযায়ী ফিল্টাৰ কৰক',
        clearFilter: 'ফিল্টাৰ সাফ কৰক'
      }
    };
    return texts[language]?.[key] || texts.en[key];
  };

  const districts = [...new Set(stations.map(s => s.district))].sort();

  return (
    <div className={`rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-sm overflow-hidden`}>
      <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">{getText('title')}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              {stations.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              title={getText('refresh')}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {highCount > 0 && (
            <button
              onClick={() => setFilter(filter === 'high' ? 'all' : 'high')}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                filter === 'high' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-red-500/20 text-red-500'
              }`}
            >
              {highCount} {getText('high')}
            </button>
          )}
          {mediumCount > 0 && (
            <button
              onClick={() => setFilter(filter === 'medium' ? 'all' : 'medium')}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                filter === 'medium' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-amber-500/20 text-amber-500'
              }`}
            >
              {mediumCount} {getText('medium')}
            </button>
          )}
          <button
            onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}
            className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
              filter === 'low' 
                ? 'bg-green-500 text-white' 
                : 'bg-green-500/20 text-green-500'
            }`}
          >
            {lowCount} {getText('low')}
          </button>
        </div>

        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder={getText('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border ${
              darkMode 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`flex gap-1 p-2 border-b ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'}`}>
              {['all', 'high', 'medium', 'low'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filter === f
                      ? (f === 'high' ? 'bg-red-500 text-white' :
                         f === 'medium' ? 'bg-amber-500 text-white' :
                         f === 'low' ? 'bg-green-500 text-white' :
                         'bg-blue-500 text-white')
                      : darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {getText(f)}
                </button>
              ))}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  {getText('loading')}
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                  {getText('error')}
                </div>
              ) : filteredStations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {getText('noData')}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredStations.map((station) => (
                    <motion.div
                      key={station.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => onStationSelect && onStationSelect(station)}
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedStation?.id === station.id
                          ? darkMode ? 'bg-blue-500/20 border-l-4 border-blue-500' : 'bg-blue-50 border-l-4 border-blue-500'
                          : getRiskBgColor(station.riskLevel)
                      } ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-sm truncate">
                              {station.name}
                            </span>
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${getRiskColor(station.riskLevel)}`}>
                              {station.riskLevel}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Droplets className="w-3 h-3" />
                              {station.riverName}
                            </span>
                            <span>•</span>
                            <span>{station.district}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <motion.div
                            key={station.currentFlowLevel}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className={`text-lg font-bold ${
                              station.riskLevel === 'High' ? 'text-red-500' :
                              station.riskLevel === 'Medium' ? 'text-amber-500' :
                              'text-green-500'
                            }`}
                          >
                            {station.currentFlowLevel?.toFixed(2) || '--'} m
                          </motion.div>
                          {station.dangerFlowLevel && (
                            <div className="text-[10px] text-gray-500">
                              {getText('danger')}: {station.dangerFlowLevel} m
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {filteredStations.length > 0 && (
              <div className={`p-2 text-center border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <span className="text-xs text-gray-500">
                  {filteredStations.length} {getText('station')}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WaterLevelStations;
