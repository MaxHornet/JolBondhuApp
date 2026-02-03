import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Droplets, CircleOff, Beaker, Waves, MapPin } from 'lucide-react';

const WarningLevelCard = ({ 
  station, 
  language = 'en', 
  translations,
  isSimulationMode = false,
  darkMode = false
}) => {
  if (!station) {
    return (
      <div className={`relative overflow-hidden rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-sm p-6`}>
        <div className="text-center text-gray-500">
          <Waves className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Select a water level station to view details</p>
        </div>
      </div>
    );
  }

  const riskConfig = {
    High: {
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      pulseColor: 'bg-red-500',
      gradient: 'from-red-500/20 to-orange-500/10'
    },
    Medium: {
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      pulseColor: 'bg-amber-500',
      gradient: 'from-amber-500/20 to-yellow-500/10'
    },
    Low: {
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      pulseColor: 'bg-green-500',
      gradient: 'from-green-500/20 to-emerald-500/10'
    }
  };

  const risk = riskConfig[station.riskLevel] || riskConfig.Low;
  const stationName = language === 'as' ? station.name : station.name;
  
  const getText = (key) => {
    return translations?.[key] || key;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border ${risk.bgColor} ${risk.borderColor} shadow-lg`}
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${risk.gradient} opacity-50`} />
      
      {/* Animated pulse effect for high risk */}
      {station.riskLevel === 'High' && (
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{
            repeat: Infinity,
            duration: 2
          }}
          className={`absolute inset-0 ${risk.pulseColor} rounded-2xl blur-3xl`}
        />
      )}

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isSimulationMode ? (
              <Beaker className="w-5 h-5 text-purple-500" />
            ) : (
              <AlertTriangle className={`w-5 h-5 ${risk.color}`} />
            )}
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {getText('warningLevelCard')}
              {isSimulationMode && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-500/20 text-purple-500">
                  SIMULATION
                </span>
              )}
            </span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${risk.bgColor} ${risk.color}`}>
            {station.riskLevel} {getText('risk')}
          </div>
        </div>

        {/* Station Info */}
        <div className="flex items-start gap-4 mb-4">
          {/* Pulsating Circle */}
          <div className="relative flex h-16 w-16 items-center justify-center flex-shrink-0">
            {station.riskLevel === 'High' && (
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.2, 0.5]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1
                }}
                className={`absolute inset-0 rounded-full ${risk.pulseColor}`}
              />
            )}
            <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${risk.bgColor} border-2 ${risk.borderColor}`}>
              <Waves className={`h-6 w-6 ${risk.color}`} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {stationName}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="w-3 h-3" />
              <span>{station.district}</span>
              <span>•</span>
              <span>{station.riverName}</span>
            </div>
          </div>
        </div>

        {/* Flow Level Display */}
        <div className="mb-4">
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getText('currentFlowLevel')}
              </p>
              <motion.p
                key={station.currentFlowLevel}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-bold text-gray-900 dark:text-white"
              >
                {station.currentFlowLevel?.toFixed(2) || '--'}
                <span className="text-lg font-normal text-gray-500 ml-1">m</span>
              </motion.p>
            </div>
            {station.dangerFlowLevel && (
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getText('dangerLevel')}
                </p>
                <p className="text-xl font-semibold text-red-500">
                  {station.dangerFlowLevel} m
                </p>
              </div>
            )}
          </div>
          
          {/* Level comparison bar */}
          {station.highFlowLevel && (
            <div className="relative h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min((station.currentFlowLevel / station.highFlowLevel) * 100, 100)}%` 
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`absolute left-0 top-0 h-full rounded-full ${
                  station.riskLevel === 'High' ? 'bg-red-500' :
                  station.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                }`}
              />
              {station.dangerFlowLevel && (
                <div 
                  className="absolute top-0 h-full w-0.5 bg-red-700"
                  style={{ left: `${(station.dangerFlowLevel / station.highFlowLevel) * 100}%` }}
                />
              )}
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ scale: 0.95, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl p-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}
          >
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Droplets className="w-3 h-3" />
              <span>{getText('highFlowLevel')}</span>
            </div>
            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {station.highFlowLevel || '--'}
              <span className="text-xs font-normal text-gray-500 ml-1">m</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className={`rounded-xl p-3 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}
          >
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <CircleOff className="w-3 h-3" />
              <span>{getText('stationCode')}</span>
            </div>
            <p className={`text-sm font-mono font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {station.stationCode || '--'}
            </p>
          </motion.div>

        </div>

        {/* Station details */}
        <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <span>{getText('rcName')}:</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{station.rcName}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{getText('basin')}:</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{station.basinName}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WarningLevelCard;
