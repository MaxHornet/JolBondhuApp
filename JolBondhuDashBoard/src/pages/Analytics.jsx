import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Droplets, MapPin, AlertTriangle, Activity, Waves } from 'lucide-react';
import { apiService } from '../services/apiService';
import { stationPolygons } from '../data/stationPolygons';

const Analytics = ({ darkMode, language, translations }) => {
  const [waterLevels, setWaterLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = translations;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getWaterLevels();
        setWaterLevels(data || []);
      } catch (err) {
        console.error('Error fetching water levels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const total = waterLevels.length;
    const highRisk = waterLevels.filter(s => s.riskLevel === 'High').length;
    const mediumRisk = waterLevels.filter(s => s.riskLevel === 'Medium').length;
    const lowRisk = waterLevels.filter(s => s.riskLevel === 'Low').length;
    
    const districts = [...new Set(waterLevels.map(s => s.district))];
    const rivers = [...new Set(waterLevels.map(s => s.riverName))];
    
    const avgFlow = waterLevels.length > 0 
      ? waterLevels.reduce((sum, s) => sum + (s.currentFlowLevel || 0), 0) / waterLevels.length 
      : 0;
    
    const maxFlow = waterLevels.length > 0
      ? Math.max(...waterLevels.map(s => s.currentFlowLevel || 0))
      : 0;
    
    const minFlow = waterLevels.length > 0
      ? Math.min(...waterLevels.map(s => s.currentFlowLevel || 0))
      : 0;

    const highFlowStations = waterLevels.filter(s => 
      s.currentFlowLevel && s.highFlowLevel && 
      (s.currentFlowLevel / s.highFlowLevel) > 0.8
    ).length;

    return {
      total,
      highRisk,
      mediumRisk,
      lowRisk,
      districts: districts.length,
      rivers: rivers.length,
      avgFlow: avgFlow.toFixed(2),
      maxFlow: maxFlow.toFixed(2),
      minFlow: minFlow.toFixed(2),
      highFlowStations
    };
  }, [waterLevels]);

  const districtStats = useMemo(() => {
    const districts = {};
    waterLevels.forEach(station => {
      if (!districts[station.district]) {
        districts[station.district] = {
          name: station.district,
          total: 0,
          high: 0,
          medium: 0,
          low: 0,
          avgLevel: 0,
          totalLevel: 0
        };
      }
      districts[station.district].total++;
      if (station.riskLevel === 'High') districts[station.district].high++;
      if (station.riskLevel === 'Medium') districts[station.district].medium++;
      if (station.riskLevel === 'Low') districts[station.district].low++;
      districts[station.district].totalLevel += station.currentFlowLevel || 0;
    });
    
    return Object.values(districts)
      .map(d => ({ ...d, avgLevel: (d.totalLevel / d.total).toFixed(2) }))
      .sort((a, b) => b.high - a.high);
  }, [waterLevels]);

  const riverStats = useMemo(() => {
    const rivers = {};
    waterLevels.forEach(station => {
      if (!rivers[station.riverName]) {
        rivers[station.riverName] = {
          name: station.riverName,
          total: 0,
          high: 0,
          medium: 0,
          low: 0,
          stations: []
        };
      }
      rivers[station.riverName].total++;
      if (station.riskLevel === 'High') rivers[station.riverName].high++;
      if (station.riskLevel === 'Medium') rivers[station.riverName].medium++;
      if (station.riskLevel === 'Low') rivers[station.riverName].low++;
      rivers[station.riverName].stations.push(station.name);
    });
    
    return Object.values(rivers).sort((a, b) => b.total - a.total);
  }, [waterLevels]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-500 bg-red-500/20';
      case 'Medium': return 'text-amber-500 bg-amber-500/20';
      default: return 'text-green-500 bg-green-500/20';
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {loading ? '...' : value}
          </p>
          {subtitle && (
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${
          darkMode ? `bg-${color}-500/20` : `bg-${color}-100`
        }`}>
          <Icon className={`w-5 h-5 ${
            darkMode ? `text-${color}-400` : `text-${color}-600`
          }`} />
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
          {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{trend > 0 ? '+' : ''}{trend}% from yesterday</span>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {t.analytics}
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Real-time analytics and insights from water level monitoring stations
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Activity className={`w-8 h-8 animate-spin ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <StatCard
                title="Total Stations"
                value={stats.total}
                subtitle="Monitoring points"
                icon={MapPin}
                color="blue"
              />
              <StatCard
                title="High Risk"
                value={stats.highRisk}
                subtitle={`${((stats.highRisk / stats.total) * 100).toFixed(0)}% of total`}
                icon={AlertTriangle}
                color="red"
              />
              <StatCard
                title="Medium Risk"
                value={stats.mediumRisk}
                subtitle={`${((stats.mediumRisk / stats.total) * 100).toFixed(0)}% of total`}
                icon={Activity}
                color="amber"
              />
              <StatCard
                title="Avg Flow Level"
                value={`${stats.avgFlow}m`}
                subtitle={`Max: ${stats.maxFlow}m`}
                icon={Droplets}
                color="cyan"
              />
              <StatCard
                title="Districts"
                value={stats.districts}
                subtitle="Covered areas"
                icon={Waves}
                color="green"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* District Risk Distribution */}
              <div className={`rounded-xl border p-4 ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  District Risk Distribution
                </h3>
                <div className="space-y-3">
                  {districtStats.slice(0, 8).map((district, idx) => (
                    <div key={district.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{district.name}</span>
                        <div className="flex items-center gap-2">
                          {district.high > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-500/20 text-red-500">
                              {district.high}
                            </span>
                          )}
                          {district.medium > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-500">
                              {district.medium}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-green-500/20 text-green-500">
                            {district.low}
                          </span>
                        </div>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${(district.high / district.total) * 100}%` }}
                        />
                        <div 
                          className="bg-amber-500" 
                          style={{ width: `${(district.medium / district.total) * 100}%` }}
                        />
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${(district.low / district.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* River Basin Analysis */}
              <div className={`rounded-xl border p-4 ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
              }`}>
                <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  River Basin Analysis
                </h3>
                <div className="space-y-3">
                  {riverStats.slice(0, 8).map((river) => (
                    <div key={river.name} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <div className="flex-1">
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {river.name}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {river.total} stations
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {river.high > 0 && (
                          <span className="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-500">
                            {river.high} High
                          </span>
                        )}
                        {river.medium > 0 && (
                          <span className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-500">
                            {river.medium} Med
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-500">
                          {river.low} Low
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* High Risk Stations Table */}
            <div className={`rounded-xl border overflow-hidden ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Critical Stations (High Risk)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                    <tr>
                      <th className={`text-left p-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Station
                      </th>
                      <th className={`text-left p-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        River
                      </th>
                      <th className={`text-left p-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        District
                      </th>
                      <th className={`text-right p-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Current Level
                      </th>
                      <th className={`text-right p-3 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Danger Level
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {waterLevels
                      .filter(s => s.riskLevel === 'High')
                      .sort((a, b) => b.currentFlowLevel - a.currentFlowLevel)
                      .slice(0, 15)
                      .map((station) => (
                        <tr key={station.id} className={darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}>
                          <td className={`p-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            <div>
                              <p className="font-medium">{station.name}</p>
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                {station.stationCode}
                              </p>
                            </div>
                          </td>
                          <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {station.riverName}
                          </td>
                          <td className={`p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {station.district}
                          </td>
                          <td className={`p-3 text-right font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                            {station.currentFlowLevel?.toFixed(2)} m
                          </td>
                          <td className={`p-3 text-right ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {station.dangerFlowLevel ? `${station.dangerFlowLevel} m` : '--'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
