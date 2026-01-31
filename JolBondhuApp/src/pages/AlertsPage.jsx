import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Bell,
    AlertTriangle,
    Droplets,
    CheckCircle,
    Filter,
    ChevronDown,
    RefreshCw,
    Clock
} from 'lucide-react'
import { apiService } from '../services/apiService'

/**
 * AlertsPage Component (Enhanced with Real-time API Polling)
 * 
 * Features:
 * - Fetches alerts from API every 30 seconds
 * - Pull-to-refresh functionality
 * - Shows last updated timestamp
 * - Visual "New Alert" badge animation
 * - Filter by zone
 */

function AlertsPage({ basins, darkMode, language, t }) {
    const [alerts, setAlerts] = useState([])
    const [filterZone, setFilterZone] = useState('all')
    const [showFilter, setShowFilter] = useState(false)
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [error, setError] = useState(null)
    const [previousAlertCount, setPreviousAlertCount] = useState(0)

    // Fetch alerts from API
    const fetchAlerts = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const data = await apiService.getAlerts(filterZone === 'all' ? null : filterZone, true)
            
            // Check if new alerts arrived
            if (data.length > previousAlertCount && previousAlertCount > 0) {
                // Mark the newest alerts as "new"
                const newAlerts = data.slice(0, data.length - previousAlertCount)
                newAlerts.forEach(alert => {
                    alert.isNew = true
                })
            }
            
            setPreviousAlertCount(data.length)
            setAlerts(data)
            setLastUpdated(new Date())
        } catch (err) {
            console.error('Error fetching alerts:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch and polling
    useEffect(() => {
        fetchAlerts()
        
        // Poll every 30 seconds
        const interval = setInterval(fetchAlerts, 30000)
        return () => clearInterval(interval)
    }, [filterZone])

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

    // Format alert time
    const formatTime = (timestamp) => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        return date.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        })
    }

    // Format relative time (e.g., "5 minutes ago")
    const formatRelativeTime = (timestamp) => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        const now = new Date()
        const diff = Math.floor((now - date) / 1000 / 60) // minutes
        
        if (diff < 1) return language === 'as' ? 'এইমাত্ৰ' : 'Just now'
        if (diff < 60) return language === 'as' ? `${diff} মিনিট আগতে` : `${diff} min ago`
        if (diff < 1440) return language === 'as' ? `${Math.floor(diff / 60)} ঘণ্টা আগতে` : `${Math.floor(diff / 60)} hours ago`
        return language === 'as' ? `${Math.floor(diff / 1440)} দিন আগতে` : `${Math.floor(diff / 1440)} days ago`
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {t.allAlerts}
                    </h1>
                    {lastUpdated && (
                        <p className={`text-xs mt-1 flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            <Clock className="w-3 h-3" />
                            {language === 'as' ? 'আপডেট:' : 'Updated:'} {formatRelativeTime(lastUpdated)}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Refresh Button */}
                    <button
                        onClick={fetchAlerts}
                        disabled={loading}
                        className={`p-2 rounded-lg transition-colors ${darkMode
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>

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
            </div>

            {/* Alerts List */}
            <div className="space-y-3">
                {loading && alerts.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : error ? (
                    <div className={`text-center py-12 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                        <p>{language === 'as' ? 'ত্ৰুটি: আপডেট লোড কৰিব নোৱাৰি' : 'Error: Could not load alerts'}</p>
                        <button
                            onClick={fetchAlerts}
                            className="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm"
                        >
                            {language === 'as' ? 'পুনৰ চেষ্টা কৰক' : 'Retry'}
                        </button>
                    </div>
                ) : alerts.length === 0 ? (
                    <div className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{language === 'as' ? 'কোনো সতৰ্কবাণী নাই' : 'No alerts'}</p>
                    </div>
                ) : (
                    alerts.map((alert, index) => {
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
                                                <motion.span 
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex-shrink-0"
                                                >
                                                    {t.newAlert}
                                                </motion.span>
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
                                                {formatTime(alert.issuedAt)}
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
