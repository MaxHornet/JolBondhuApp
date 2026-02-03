import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Bell,
    AlertTriangle,
    Droplets,
    CheckCircle,
    Filter,
    ChevronDown,
    RefreshCw,
    Clock,
    Globe,
    MapPin,
    Newspaper,
    Radio,
    ExternalLink,
    Settings,
    X,
    Phone,
    User,
    CheckCircle2
} from 'lucide-react'
import { apiService } from '../services/apiService'

/**
 * AlertsPage Component (Enhanced with Tabs)
 * 
 * Features:
 * - Two tabs: "All Alerts" (news/regional) and "Local Alerts" (zone-specific)
 * - Fetches alerts from API every 30 seconds
 * - News section for regional flood updates
 * - Filter by zone
 */

function AlertsPage({ basins, darkMode, language, t }) {
    const [activeTab, setActiveTab] = useState('local') // 'local' or 'all'
    const [alerts, setAlerts] = useState([])
    const [newsAlerts, setNewsAlerts] = useState([])
    const [filterZone, setFilterZone] = useState('all')
    const [showFilter, setShowFilter] = useState(false)
    const [loading, setLoading] = useState(true)
    const [newsLoading, setNewsLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [error, setError] = useState(null)
    const [previousAlertCount, setPreviousAlertCount] = useState(0)

    // Notification settings state
    const [showNotificationModal, setShowNotificationModal] = useState(false)
    const [notificationForm, setNotificationForm] = useState({ name: '', phone: '' })
    const [registrationStatus, setRegistrationStatus] = useState(null) // null, 'loading', 'success', 'error'
    const [registrationMessage, setRegistrationMessage] = useState('')
    const [isRegistered, setIsRegistered] = useState(false)

    // Sample regional flood news (will be replaced with actual News API)
    const sampleNewsAlerts = [
        {
            id: 'news-1',
            title: 'Brahmaputra Water Level Rising',
            titleAssamese: 'ব্ৰহ্মপুত্ৰৰ পানীৰ স্তৰ বৃদ্ধি',
            message: 'Water levels in Brahmaputra at Neamatighat have crossed the warning mark. Residents advised to stay alert.',
            messageAssamese: 'নিমাতিঘাটত ব্ৰহ্মপুত্ৰৰ পানীৰ স্তৰে সতৰ্কতা চিহ্ন অতিক্ৰম কৰিছে। বাসিন্দাসকলক সতৰ্ক থাকিবলৈ পৰামৰ্শ দিয়া হৈছে।',
            source: 'IMD Guwahati',
            time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            severity: 'medium',
            isRegional: true
        },
        {
            id: 'news-2',
            title: 'Heavy Rainfall Alert for Kamrup District',
            titleAssamese: 'কামৰূপ জিলাৰ বাবে প্ৰচণ্ড বৰষুণৰ সতৰ্কবাণী',
            message: 'IMD has issued orange alert for Kamrup district. Expected rainfall of 64-115mm in next 24 hours.',
            messageAssamese: 'আইএমডিয়ে কামৰূপ জিলাৰ বাবে কমলা সতৰ্কবাণী জাৰি কৰিছে। পৰৱৰ্তী ২৪ ঘণ্টাত ৬৪-১১৫ মিমি বৰষুণ হোৱাৰ সম্ভাৱনা।',
            source: 'IMD',
            time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            severity: 'high',
            isRegional: true
        },
        {
            id: 'news-3',
            title: 'SDRF Teams Deployed in Flood-Affected Areas',
            titleAssamese: 'বানপীড়িত অঞ্চলত এচডিআৰএফ দল মোতায়েন',
            message: 'State Disaster Response Force teams have been deployed in low-lying areas of Guwahati as a precautionary measure.',
            messageAssamese: 'সাৱধানতামূলক ব্যৱস্থা হিচাপে গুৱাহাটীৰ নিম্নভূমি অঞ্চলত ৰাজ্যিক দুৰ্যোগ প্ৰতিক্ৰিয়া বাহিনীৰ দল মোতায়েন কৰা হৈছে।',
            source: 'ASDMA',
            time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            severity: 'low',
            isRegional: true
        },
        {
            id: 'news-4',
            title: 'Traffic Advisory: Waterlogging Expected',
            titleAssamese: 'যাতায়াত পৰামৰ্শ: পানী জমা হোৱাৰ সম্ভাৱনা',
            message: 'Due to expected heavy rainfall, waterlogging may occur in GS Road, Zoo Road areas. Commuters advised to plan accordingly.',
            messageAssamese: 'প্ৰত্যাশিত প্ৰচণ্ড বৰষুণৰ বাবে জিএছ ৰোড, চিৰিয়াখানা ৰোড অঞ্চলত পানী জমা হ\'ব পাৰে। যাত্ৰীসকলক সেই অনুসৰি পৰিকল্পনা কৰিবলৈ পৰামৰ্শ দিয়া হৈছে।',
            source: 'GMC Traffic',
            time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            severity: 'medium',
            isRegional: true
        }
    ]

    // Fetch local alerts from API
    const fetchAlerts = async () => {
        try {
            setLoading(true)
            setError(null)

            const data = await apiService.getAlerts(filterZone === 'all' ? null : filterZone, true)

            // Check if new alerts arrived
            if (data.length > previousAlertCount && previousAlertCount > 0) {
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

    // Fetch news alerts (placeholder - would integrate with News API)
    const fetchNewsAlerts = async () => {
        try {
            setNewsLoading(true)
            // TODO: Integrate with actual News API when details are provided
            // For now, using sample data
            await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
            setNewsAlerts(sampleNewsAlerts)
        } catch (err) {
            console.error('Error fetching news:', err)
        } finally {
            setNewsLoading(false)
        }
    }

    // Check registration status from localStorage
    useEffect(() => {
        const savedRegistration = localStorage.getItem('jolbondhu_notification_registration')
        if (savedRegistration) {
            try {
                const data = JSON.parse(savedRegistration)
                setNotificationForm({ name: data.name, phone: data.phone })
                setIsRegistered(true)
            } catch (err) {
                console.error('Error parsing saved registration:', err)
            }
        }
    }, [])

    // Initial fetch and polling
    useEffect(() => {
        fetchAlerts()
        fetchNewsAlerts()

        // Poll every 30 seconds
        const interval = setInterval(fetchAlerts, 30000)
        return () => clearInterval(interval)
    }, [filterZone])

    // Get color classes for severity
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return { bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500', dot: 'bg-red-500' }
            case 'medium': return { bg: 'bg-amber-500/20', text: 'text-amber-500', border: 'border-amber-500', dot: 'bg-amber-500' }
            case 'low': return { bg: 'bg-green-500/20', text: 'text-green-500', border: 'border-green-500', dot: 'bg-green-500' }
            default: return { bg: 'bg-slate-500/20', text: 'text-slate-500', border: 'border-slate-500', dot: 'bg-slate-500' }
        }
    }

    // Format relative time
    const formatRelativeTime = (timestamp) => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        const now = new Date()
        const diff = Math.floor((now - date) / 1000 / 60)

        if (diff < 1) return language === 'as' ? 'এইমাত্ৰ' : 'Just now'
        if (diff < 60) return language === 'as' ? `${diff} মিনিট আগতে` : `${diff} min ago`
        if (diff < 1440) return language === 'as' ? `${Math.floor(diff / 60)} ঘণ্টা আগতে` : `${Math.floor(diff / 60)}h ago`
        return language === 'as' ? `${Math.floor(diff / 1440)} দিন আগতে` : `${Math.floor(diff / 1440)}d ago`
    }

    // Handle notification registration
    const handleNotificationRegistration = async (e) => {
        e.preventDefault()

        // Validate inputs
        if (!notificationForm.name.trim() || !notificationForm.phone.trim()) {
            setRegistrationStatus('error')
            setRegistrationMessage(language === 'as' ? 'নাম আৰু ফোন নম্বৰ প্ৰয়োজনীয়' : 'Name and phone number are required')
            return
        }

        // Basic phone validation (should start with + and have digits)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/
        if (!phoneRegex.test(notificationForm.phone.replace(/[\s-]/g, ''))) {
            setRegistrationStatus('error')
            setRegistrationMessage(language === 'as' ? 'অবৈধ ফোন নম্বৰ' : 'Invalid phone number. Include country code (e.g., +919876543210)')
            return
        }

        setRegistrationStatus('loading')
        setRegistrationMessage('')

        try {
            const response = await fetch('http://localhost:3001/register-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: notificationForm.name.trim(),
                    phone: notificationForm.phone.trim()
                })
            })

            const data = await response.json()

            if (response.ok) {
                // Save to localStorage
                localStorage.setItem('jolbondhu_notification_registration', JSON.stringify({
                    name: notificationForm.name.trim(),
                    phone: notificationForm.phone.trim(),
                    registeredAt: new Date().toISOString()
                }))

                setIsRegistered(true)
                setRegistrationStatus('success')
                setRegistrationMessage(language === 'as' ? 'সফলভাবে নিবন্ধিত! আপুনি এতিয়া SMS সতৰ্কবাণী পাব।' : 'Successfully registered! You will now receive SMS alerts.')

                // Close modal after 2 seconds
                setTimeout(() => {
                    setShowNotificationModal(false)
                    setRegistrationStatus(null)
                    setRegistrationMessage('')
                }, 2000)
            } else {
                setRegistrationStatus('error')
                setRegistrationMessage(data.error || (language === 'as' ? 'নিবন্ধন বিফল' : 'Registration failed'))
            }
        } catch (err) {
            console.error('Registration error:', err)
            setRegistrationStatus('error')
            setRegistrationMessage(language === 'as' ? 'সংযোগ ত্ৰুটি' : 'Connection error. Please try again.')
        }
    }

    // Render notification settings modal
    const renderNotificationModal = () => {
        return (
            <AnimatePresence>
                {showNotificationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowNotificationModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full max-w-md rounded-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-primary-500/20' : 'bg-primary-50'}`}>
                                        <Bell className="w-5 h-5 text-primary-500" />
                                    </div>
                                    <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {language === 'as' ? 'SMS সতৰ্কবাণী' : 'SMS Alerts'}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowNotificationModal(false)}
                                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                                >
                                    <X className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`} />
                                </button>
                            </div>

                            {/* Info */}
                            <div className={`p-4 rounded-xl mb-6 ${darkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-blue-900'}`}>
                                    {language === 'as'
                                        ? 'প্ৰকৃত সময়ত বানপানীৰ সতৰ্কবাণী SMS যোগে পাবলৈ নিবন্ধন কৰক।'
                                        : 'Register to receive real-time flood alerts via SMS on your phone.'}
                                </p>
                            </div>

                            {/* Registration Form */}
                            <form onSubmit={handleNotificationRegistration} className="space-y-4">
                                {/* Name Input */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            {language === 'as' ? 'নাম' : 'Name'}
                                        </div>
                                    </label>
                                    <input
                                        type="text"
                                        value={notificationForm.name}
                                        onChange={(e) => setNotificationForm({ ...notificationForm, name: e.target.value })}
                                        placeholder={language === 'as' ? 'আপোনৰ নাম' : 'Your name'}
                                        disabled={isRegistered}
                                        className={`w-full px-4 py-3 rounded-xl border transition-colors ${darkMode
                                                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-primary-500'
                                                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-primary-500'
                                            } focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50`}
                                    />
                                </div>

                                {/* Phone Input */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            {language === 'as' ? 'ফোন নম্বৰ' : 'Phone Number'}
                                        </div>
                                    </label>
                                    <input
                                        type="tel"
                                        value={notificationForm.phone}
                                        onChange={(e) => setNotificationForm({ ...notificationForm, phone: e.target.value })}
                                        placeholder="+919876543210"
                                        disabled={isRegistered}
                                        className={`w-full px-4 py-3 rounded-xl border transition-colors ${darkMode
                                                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-primary-500'
                                                : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-primary-500'
                                            } focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50`}
                                    />
                                    <p className={`text-xs mt-1.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                        {language === 'as' ? 'দেশৰ কোড সহ (যেনে +91)' : 'Include country code (e.g., +91)'}
                                    </p>
                                </div>

                                {/* Status Messages */}
                                {registrationMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-3 rounded-xl text-sm ${registrationStatus === 'success'
                                                ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                                : 'bg-red-500/20 text-red-500 border border-red-500/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {registrationStatus === 'success' && <CheckCircle2 className="w-4 h-4" />}
                                            {registrationMessage}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Submit Button */}
                                {!isRegistered && (
                                    <button
                                        type="submit"
                                        disabled={registrationStatus === 'loading'}
                                        className={`w-full py-3 rounded-xl font-semibold transition-all ${registrationStatus === 'loading'
                                                ? 'bg-primary-400 cursor-not-allowed'
                                                : 'bg-primary-500 hover:bg-primary-600'
                                            } text-white flex items-center justify-center gap-2`}
                                    >
                                        {registrationStatus === 'loading' ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                {language === 'as' ? 'নিবন্ধন কৰা হৈছে...' : 'Registering...'}
                                            </>
                                        ) : (
                                            <>
                                                <Bell className="w-5 h-5" />
                                                {language === 'as' ? 'নিবন্ধন কৰক' : 'Register for Alerts'}
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* Already Registered Status */}
                                {isRegistered && (
                                    <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30">
                                        <div className="flex items-center gap-2 text-green-500">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="font-semibold">
                                                {language === 'as' ? 'নিবন্ধিত' : 'Registered'}
                                            </span>
                                        </div>
                                        <p className={`text-xs mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                            {language === 'as'
                                                ? 'আপুনি SMS সতৰ্কবাণী পাব।'
                                                : 'You will receive SMS alerts.'}
                                        </p>
                                    </div>
                                )}
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        )
    }

    // Tab content components
    const renderTabContent = () => {
        if (activeTab === 'all') {
            return renderAllAlerts()
        }
        return renderLocalAlerts()
    }

    // Render "All Alerts" tab content (news/regional)
    const renderAllAlerts = () => {
        if (newsLoading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full"></div>
                </div>
            )
        }

        return (
            <div className="space-y-3">
                {newsAlerts.map((news, index) => {
                    const colors = getSeverityColor(news.severity)
                    return (
                        <motion.div
                            key={news.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Severity dot instead of icon */}
                                <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${colors.dot}`}></div>

                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {language === 'as' ? news.titleAssamese : news.title}
                                    </h3>

                                    <p className={`text-xs mt-1.5 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                        {language === 'as' ? news.messageAssamese : news.message}
                                    </p>

                                    <div className="flex items-center gap-3 mt-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                                            <Radio className="w-3 h-3" />
                                            {news.source}
                                        </span>
                                        <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                            {formatRelativeTime(news.time)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        )
    }

    // Render "Local Alerts" tab content
    const renderLocalAlerts = () => {
        if (loading && alerts.length === 0) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full"></div>
                </div>
            )
        }

        if (error) {
            return (
                <div className={`text-center py-12 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    <p>{language === 'as' ? 'ত্ৰুটি: আপডেট লোড কৰিব নোৱাৰি' : 'Error: Could not load alerts'}</p>
                    <button
                        onClick={fetchAlerts}
                        className="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm"
                    >
                        {language === 'as' ? 'পুনৰ চেষ্টা কৰক' : 'Retry'}
                    </button>
                </div>
            )
        }

        if (alerts.length === 0) {
            return (
                <div className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{language === 'as' ? 'কোনো সতৰ্কবাণী নাই' : 'No local alerts'}</p>
                </div>
            )
        }

        return (
            <div className="space-y-3">
                {alerts.map((alert, index) => {
                    const colors = getSeverityColor(alert.severity)
                    const basin = basins.find(b => b.id === alert.basinId)

                    return (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'}`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Severity dot instead of icon */}
                                <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${colors.dot}`}></div>

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

                                    <p className={`text-xs mt-1.5 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                        {language === 'as' ? alert.messageAssamese : alert.message}
                                    </p>

                                    <div className="flex items-center gap-3 mt-3">
                                        {basin && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                                                <MapPin className="w-3 h-3" />
                                                {language === 'as' ? basin.nameAssamese : basin.name}
                                            </span>
                                        )}
                                        <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                            {formatRelativeTime(alert.issuedAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        )
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
                        {language === 'as' ? 'সতৰ্কবাণী' : 'Alerts'}
                    </h1>
                    {lastUpdated && activeTab === 'local' && (
                        <p className={`text-xs mt-1 flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            <Clock className="w-3 h-3" />
                            {language === 'as' ? 'আপডেট:' : 'Updated:'} {formatRelativeTime(lastUpdated)}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Notification Settings Button */}
                    <button
                        onClick={() => setShowNotificationModal(true)}
                        className={`p-2 rounded-lg transition-colors relative ${darkMode
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        {isRegistered && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-current rounded-full" />
                        )}
                    </button>

                    {/* Refresh Button */}
                    <button
                        onClick={activeTab === 'local' ? fetchAlerts : fetchNewsAlerts}
                        disabled={loading || newsLoading}
                        className={`p-2 rounded-lg transition-colors ${darkMode
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            } ${(loading || newsLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <RefreshCw className={`w-4 h-4 ${(loading || newsLoading) ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Filter Button - Only for Local Alerts */}
                    {activeTab === 'local' && (
                        <div className="relative">
                            <button
                                onClick={() => setShowFilter(!showFilter)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${darkMode
                                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                <ChevronDown className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Filter Dropdown */}
                            <AnimatePresence>
                                {showFilter && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg z-50 overflow-hidden ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}
                                    >
                                        <button
                                            onClick={() => { setFilterZone('all'); setShowFilter(false) }}
                                            className={`w-full px-4 py-3 text-left text-sm ${filterZone === 'all' ? 'bg-primary-500/20 text-primary-500' : ''} ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50'}`}
                                        >
                                            {t.allZones}
                                        </button>
                                        {basins.map(basin => (
                                            <button
                                                key={basin.id}
                                                onClick={() => { setFilterZone(basin.id); setShowFilter(false) }}
                                                className={`w-full px-4 py-3 text-left text-sm ${filterZone === basin.id ? 'bg-primary-500/20 text-primary-500' : ''} ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-50 text-gray-700'}`}
                                            >
                                                {language === 'as' ? basin.nameAssamese : basin.name}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className={`flex gap-2 mb-4 p-1 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                <button
                    onClick={() => setActiveTab('local')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'local'
                        ? 'bg-primary-500 text-white shadow-md'
                        : darkMode
                            ? 'text-slate-400 hover:text-slate-300'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    <MapPin className="w-4 h-4" />
                    {language === 'as' ? 'স্থানীয় সতৰ্কবাণী' : 'Local Alerts'}
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'all'
                        ? 'bg-primary-500 text-white shadow-md'
                        : darkMode
                            ? 'text-slate-400 hover:text-slate-300'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                >
                    <Globe className="w-4 h-4" />
                    {language === 'as' ? 'সকলো সতৰ্কবাণী' : 'All Alerts'}
                </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: activeTab === 'local' ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: activeTab === 'local' ? 20 : -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderTabContent()}
                </motion.div>
            </AnimatePresence>

            {/* Notification Settings Modal */}
            {renderNotificationModal()}
        </motion.div>
    )
}

export default AlertsPage
