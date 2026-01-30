import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

// Components
import Header from './components/Header'
import BottomNav from './components/BottomNav'

// Pages
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import ReportPage from './pages/ReportPage'
import AlertsPage from './pages/AlertsPage'
import SafetyPage from './pages/SafetyPage'

// Data
import { translations, basins, alerts } from './data/sharedData'

// Hooks
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { usePendingReports } from './hooks/usePendingReports'

function App() {
    const [darkMode, setDarkMode] = useState(true) // Default to dark mode for modern look
    const [language, setLanguage] = useState('en')
    const location = useLocation()

    // Online/offline status tracking
    const isOnline = useOnlineStatus()

    // Pending reports in local storage
    const { pendingReports, addReport, syncReports } = usePendingReports()

    // Get translations
    const t = translations[language]

    // Apply dark mode class
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    // Auto-sync when coming online
    useEffect(() => {
        if (isOnline && pendingReports.length > 0) {
            syncReports()
        }
    }, [isOnline])

    // Page transition variants
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    }

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-800'
            }`}>
            {/* Header */}
            <Header
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                language={language}
                setLanguage={setLanguage}
                isOnline={isOnline}
                pendingCount={pendingReports.length}
                t={t}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-20">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        <Routes location={location}>
                            <Route
                                path="/"
                                element={
                                    <HomePage
                                        basins={basins}
                                        alerts={alerts}
                                        darkMode={darkMode}
                                        language={language}
                                        t={t}
                                    />
                                }
                            />
                            <Route
                                path="/map"
                                element={
                                    <MapPage
                                        basins={basins}
                                        darkMode={darkMode}
                                        language={language}
                                        t={t}
                                    />
                                }
                            />
                            <Route
                                path="/report"
                                element={
                                    <ReportPage
                                        basins={basins}
                                        isOnline={isOnline}
                                        onSubmit={addReport}
                                        darkMode={darkMode}
                                        language={language}
                                        t={t}
                                    />
                                }
                            />
                            <Route
                                path="/alerts"
                                element={
                                    <AlertsPage
                                        alerts={alerts}
                                        basins={basins}
                                        darkMode={darkMode}
                                        language={language}
                                        t={t}
                                    />
                                }
                            />
                            <Route
                                path="/safety"
                                element={
                                    <SafetyPage
                                        basins={basins}
                                        darkMode={darkMode}
                                        language={language}
                                        t={t}
                                    />
                                }
                            />
                        </Routes>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Bottom Navigation */}
            <BottomNav
                darkMode={darkMode}
                language={language}
                t={t}
                pendingCount={pendingReports.length}
            />
        </div>
    )
}

export default App
