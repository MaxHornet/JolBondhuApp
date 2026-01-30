import React from 'react'
import { motion } from 'framer-motion'
import {
    Sun,
    Moon,
    Wifi,
    WifiOff,
    CloudOff,
    Bell
} from 'lucide-react'

function Header({
    darkMode,
    setDarkMode,
    language,
    setLanguage,
    isOnline,
    pendingCount,
    t
}) {
    return (
        <header className={`sticky top-0 z-50 ${darkMode
                ? 'bg-slate-800/95 backdrop-blur-lg border-b border-slate-700/50'
                : 'bg-white/95 backdrop-blur-lg border-b border-gray-200'
            }`}>
            <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo & App Name */}
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                <path d="M12 6c-2.21 0-4 1.79-4 4 0 1.1.45 2.1 1.17 2.83L12 15.5l2.83-2.67A3.97 3.97 0 0016 10c0-2.21-1.79-4-4-4z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">{t.appName}</h1>
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                {t.appTagline}
                            </p>
                        </div>
                    </div>

                    {/* Right Side Controls */}
                    <div className="flex items-center gap-2">
                        {/* Online/Offline Status */}
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${isOnline
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                        >
                            {isOnline ? (
                                <>
                                    <Wifi className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{t.online}</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="w-3.5 h-3.5 offline-indicator" />
                                    <span className="hidden sm:inline">Offline</span>
                                </>
                            )}
                        </motion.div>

                        {/* Pending Reports Badge */}
                        {pendingCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium"
                            >
                                <CloudOff className="w-3.5 h-3.5" />
                                <span>{pendingCount}</span>
                            </motion.div>
                        )}

                        {/* Language Toggle */}
                        <div className={`flex rounded-lg overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-100'
                            }`}>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${language === 'en'
                                        ? 'bg-primary-500 text-white'
                                        : darkMode ? 'text-slate-300 hover:bg-slate-600' : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => setLanguage('as')}
                                className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${language === 'as'
                                        ? 'bg-primary-500 text-white'
                                        : darkMode ? 'text-slate-300 hover:bg-slate-600' : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                অ
                            </button>
                        </div>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-lg transition-colors ${darkMode
                                    ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
