import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Bell,
    AlertTriangle,
    Droplets,
    CheckCircle,
    Filter,
    ChevronDown
} from 'lucide-react'

function AlertsPage({ alerts, basins, darkMode, language, t }) {
    const [filterZone, setFilterZone] = useState('all')
    const [showFilter, setShowFilter] = useState(false)

    // Filter alerts by zone
    const filteredAlerts = filterZone === 'all'
        ? alerts
        : alerts.filter(a => a.basinId === filterZone)

    // Get icon for alert type
    const getAlertIcon = (type, severity) => {
        if (severity === 'high') return AlertTriangle
        if (type === 'waterlogging') return Droplets
        if (type === 'all_clear') return CheckCircle
        return Bell
    }

    // Get color classes for severity
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return { bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500' }
            case 'medium': return { bg: 'bg-amber-500/20', text: 'text-amber-500', border: 'border-amber-500' }
            case 'low': return { bg: 'bg-green-500/20', text: 'text-green-500', border: 'border-green-500' }
            default: return { bg: 'bg-slate-500/20', text: 'text-slate-500', border: 'border-slate-500' }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {t.allAlerts}
                </h1>

                {/* Filter Button */}
                <div className="relative">
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${darkMode
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm">{t.filterByZone}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Filter Dropdown */}
                    {showFilter && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg z-50 overflow-hidden ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
                                }`}
                        >
                            <button
                                onClick={() => { setFilterZone('all'); setShowFilter(false) }}
                                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2 ${filterZone === 'all' ? 'bg-primary-500/20 text-primary-500' : ''
                                    } ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}`}
                            >
                                {t.allZones}
                            </button>
                            {basins.map(basin => (
                                <button
                                    key={basin.id}
                                    onClick={() => { setFilterZone(basin.id); setShowFilter(false) }}
                                    className={`w-full px-4 py-3 text-left text-sm ${filterZone === basin.id ? 'bg-primary-500/20 text-primary-500' : ''
                                        } ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-50 text-gray-700'}`}
                                >
                                    {language === 'as' ? basin.nameAssamese : basin.name}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-3">
                {filteredAlerts.length === 0 ? (
                    <div className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{language === 'as' ? 'কোনো সতৰ্কবাণী নাই' : 'No alerts'}</p>
                    </div>
                ) : (
                    filteredAlerts.map((alert, index) => {
                        const Icon = getAlertIcon(alert.type, alert.severity)
                        const colors = getSeverityColor(alert.severity)
                        const basin = basins.find(b => b.id === alert.basinId)

                        return (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-4 rounded-xl border-l-4 ${colors.border} ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg}`}>
                                        <Icon className={`w-5 h-5 ${colors.text}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {language === 'as' ? alert.titleAssamese : alert.title}
                                            </h3>
                                            {alert.isNew && (
                                                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex-shrink-0">
                                                    {t.newAlert}
                                                </span>
                                            )}
                                        </div>

                                        <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                            {language === 'as' ? alert.messageAssamese : alert.message}
                                        </p>

                                        <div className="flex items-center gap-3 mt-2">
                                            {basin && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {language === 'as' ? basin.nameAssamese : basin.name}
                                                </span>
                                            )}
                                            <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                                {alert.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>
        </motion.div>
    )
}

export default AlertsPage
