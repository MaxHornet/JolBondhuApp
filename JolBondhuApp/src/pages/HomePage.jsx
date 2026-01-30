import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    AlertTriangle,
    Droplets,
    MapPin,
    ChevronRight,
    Camera,
    Map,
    Shield,
    TrendingUp
} from 'lucide-react'

function HomePage({ basins, alerts, darkMode, language, t }) {
    // Get high risk zones
    const highRiskZones = basins.filter(b => b.riskLevel === 'High')
    const mediumRiskZones = basins.filter(b => b.riskLevel === 'Medium')
    const lowRiskZones = basins.filter(b => b.riskLevel === 'Low')

    // Get recent alerts (newest first)
    const recentAlerts = alerts.filter(a => a.severity === 'high').slice(0, 3)

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-4 py-4 space-y-5"
        >
            {/* Alert Banner for High Risk */}
            {highRiskZones.length > 0 && (
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-red-500 p-4"
                >
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIgMCAyLjQgMCAzLjYuMi43LjEgMS40LjMgMiAuNy42LjQuOC45LjggMS41cy0uMiAxLjEtLjggMS41Yy0uNi40LTEuMy42LTIgLjctMS4yLjItMi40LjItMy42LjItMS4yIDAtMi40IDAtMy42LS4yLS43LS4xLTEuNC0uMy0yLS43LS42LS40LS44LS45LS44LTEuNXMuMi0xLjEuOC0xLjVjLjYtLjQgMS4zLS42IDItLjcgMS4yLS4yIDIuNC0uMiAzLjYtLjJ6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                    <div className="relative flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold text-sm mb-1">
                                {language === 'as' ? 'বান সতৰ্কবাণী সক্ৰিয়' : 'Flood Alert Active'}
                            </h3>
                            <p className="text-white/90 text-xs">
                                {highRiskZones.length} {language === 'as' ? 'অঞ্চলত উচ্চ বিপদ' : 'zones at high risk'}: {' '}
                                {highRiskZones.map(z => language === 'as' ? z.nameAssamese : z.name).join(', ')}
                            </p>
                        </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 pulse-ring"></div>
                </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
                <h2 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    {t.quickActions}
                </h2>
                <div className="grid grid-cols-3 gap-3">
                    <Link
                        to="/report"
                        className={`p-4 rounded-2xl text-center transition-all active:scale-95 ${darkMode
                                ? 'bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600'
                                : 'bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500'
                            }`}
                    >
                        <Camera className="w-6 h-6 text-white mx-auto mb-2" />
                        <span className="text-white text-xs font-medium">{t.reportIssue}</span>
                    </Link>

                    <Link
                        to="/map"
                        className={`p-4 rounded-2xl text-center transition-all active:scale-95 ${darkMode
                                ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600'
                                : 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500'
                            }`}
                    >
                        <Map className="w-6 h-6 text-white mx-auto mb-2" />
                        <span className="text-white text-xs font-medium">{t.viewMap}</span>
                    </Link>

                    <Link
                        to="/safety"
                        className={`p-4 rounded-2xl text-center transition-all active:scale-95 ${darkMode
                                ? 'bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600'
                                : 'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500'
                            }`}
                    >
                        <Shield className="w-6 h-6 text-white mx-auto mb-2" />
                        <span className="text-white text-xs font-medium">{t.safetyTips}</span>
                    </Link>
                </div>
            </motion.div>

            {/* Zone Status Summary */}
            <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {t.zoneStatus}
                    </h2>
                    <Link
                        to="/map"
                        className="text-xs text-primary-500 font-medium flex items-center gap-1"
                    >
                        {t.viewAll}
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Risk Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-red-500/20' : 'bg-red-50'} border border-red-500/30`}>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className={`text-xs font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                {t.highRisk}
                            </span>
                        </div>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                            {highRiskZones.length}
                        </p>
                    </div>

                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-amber-500/20' : 'bg-amber-50'} border border-amber-500/30`}>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <span className={`text-xs font-medium ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                                {t.mediumRisk}
                            </span>
                        </div>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                            {mediumRiskZones.length}
                        </p>
                    </div>

                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-green-500/20' : 'bg-green-50'} border border-green-500/30`}>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className={`text-xs font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                {t.lowRisk}
                            </span>
                        </div>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                            {lowRiskZones.length}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Zone List */}
            <motion.div variants={itemVariants}>
                <h2 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    {language === 'as' ? 'সকলো অঞ্চল' : 'All Zones'}
                </h2>
                <div className="space-y-2">
                    {basins.map((basin, index) => (
                        <motion.div
                            key={basin.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-3 rounded-xl flex items-center gap-3 ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${basin.riskLevel === 'High'
                                    ? 'bg-red-500/20'
                                    : basin.riskLevel === 'Medium'
                                        ? 'bg-amber-500/20'
                                        : 'bg-green-500/20'
                                }`}>
                                <Droplets className={`w-5 h-5 ${basin.riskLevel === 'High'
                                        ? 'text-red-500'
                                        : basin.riskLevel === 'Medium'
                                            ? 'text-amber-500'
                                            : 'text-green-500'
                                    }`} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {language === 'as' ? basin.nameAssamese : basin.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                        {basin.rainfall} mm
                                    </span>
                                    <span className={`text-xs ${darkMode ? 'text-slate-600' : 'text-gray-300'}`}>•</span>
                                    <span className={`text-xs ${basin.riskLevel === 'High'
                                            ? 'text-red-500'
                                            : basin.riskLevel === 'Medium'
                                                ? 'text-amber-500'
                                                : 'text-green-500'
                                        }`}>
                                        {language === 'as'
                                            ? (basin.riskLevel === 'High' ? 'উচ্চ' : basin.riskLevel === 'Medium' ? 'মধ্যম' : 'কম')
                                            : basin.riskLevel
                                        }
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <TrendingUp className={`w-4 h-4 ${basin.riskLevel === 'High' ? 'text-red-500' : 'text-slate-400'
                                    }`} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Recent High Priority Alerts */}
            {recentAlerts.length > 0 && (
                <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                            {t.currentAlerts}
                        </h2>
                        <Link
                            to="/alerts"
                            className="text-xs text-primary-500 font-medium flex items-center gap-1"
                        >
                            {t.viewAll}
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {recentAlerts.map(alert => (
                            <div
                                key={alert.id}
                                className={`p-3 rounded-xl border-l-4 ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'
                                    } ${alert.severity === 'high'
                                        ? 'border-l-red-500'
                                        : alert.severity === 'medium'
                                            ? 'border-l-amber-500'
                                            : 'border-l-green-500'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h4 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                            {language === 'as' ? alert.titleAssamese : alert.title}
                                        </h4>
                                        <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                            {language === 'as' ? alert.messageAssamese : alert.message}
                                        </p>
                                    </div>
                                    {alert.isNew && (
                                        <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                                            {t.newAlert}
                                        </span>
                                    )}
                                </div>
                                <p className={`text-[10px] mt-2 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                    {alert.time}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}

export default HomePage
