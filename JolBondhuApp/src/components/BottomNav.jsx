import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Home,
    Map,
    Camera,
    Bell,
    Shield
} from 'lucide-react'

function BottomNav({ darkMode, language, t, pendingCount }) {
    const location = useLocation()

    const navItems = [
        { path: '/', icon: Home, label: t.home },
        { path: '/map', icon: Map, label: t.map },
        { path: '/report', icon: Camera, label: t.report, badge: pendingCount },
        { path: '/alerts', icon: Bell, label: t.alerts },
        { path: '/safety', icon: Shield, label: t.safety },
    ]

    return (
        <nav className={`fixed bottom-0 left-0 right-0 z-50 ${darkMode
                ? 'bg-slate-800/95 backdrop-blur-lg border-t border-slate-700/50'
                : 'bg-white/95 backdrop-blur-lg border-t border-gray-200'
            }`}>
            <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
                {navItems.map(({ path, icon: Icon, label, badge }) => {
                    const isActive = location.pathname === path

                    return (
                        <NavLink
                            key={path}
                            to={path}
                            className="relative flex flex-col items-center gap-0.5 px-3 py-1.5"
                        >
                            <div className="relative">
                                {isActive && (
                                    <motion.div
                                        layoutId="navIndicator"
                                        className="absolute inset-0 -m-1.5 rounded-xl bg-primary-500/20"
                                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    />
                                )}
                                <Icon
                                    className={`w-5 h-5 relative z-10 transition-colors ${isActive
                                            ? 'text-primary-500'
                                            : darkMode ? 'text-slate-400' : 'text-gray-500'
                                        }`}
                                />
                                {/* Badge for pending reports */}
                                {badge > 0 && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center"
                                    >
                                        {badge > 9 ? '9+' : badge}
                                    </motion.div>
                                )}
                            </div>
                            <span className={`text-[10px] font-medium transition-colors ${isActive
                                    ? 'text-primary-500'
                                    : darkMode ? 'text-slate-400' : 'text-gray-500'
                                }`}>
                                {label}
                            </span>
                        </NavLink>
                    )
                })}
            </div>
        </nav>
    )
}

export default BottomNav
