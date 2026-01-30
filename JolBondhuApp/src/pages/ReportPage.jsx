import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Camera,
    MapPin,
    Send,
    X,
    CheckCircle,
    CloudOff,
    Droplets,
    Construction,
    Home,
    AlertTriangle,
    HelpCircle
} from 'lucide-react'
import { issueTypes } from '../data/sharedData'

function ReportPage({ basins, isOnline, onSubmit, darkMode, language, t }) {
    const [issueType, setIssueType] = useState('')
    const [description, setDescription] = useState('')
    const [photo, setPhoto] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [location, setLocation] = useState(null)
    const [gettingLocation, setGettingLocation] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'queued' | null

    const fileInputRef = useRef(null)

    // Get icon component for issue type
    const getIcon = (iconName) => {
        switch (iconName) {
            case 'droplets': return Droplets
            case 'construction': return Construction
            case 'home': return Home
            case 'road': return AlertTriangle
            default: return HelpCircle
        }
    }

    // Get user location on mount
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    })
                    setGettingLocation(false)
                },
                (error) => {
                    console.error('Error getting location:', error)
                    setGettingLocation(false)
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            )
        } else {
            setGettingLocation(false)
        }
    }, [])

    // Handle photo selection
    const handlePhotoSelect = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setPhoto(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhotoPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    // Remove selected photo
    const removePhoto = () => {
        setPhoto(null)
        setPhotoPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!issueType || !description) return

        setIsSubmitting(true)

        // Create report object
        const report = {
            issueType,
            description,
            photoData: photoPreview, // In real app, you'd upload the file
            location,
            timestamp: new Date().toISOString()
        }

        // Add to pending reports (works offline)
        onSubmit(report)

        // Simulate submission delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        setIsSubmitting(false)
        setSubmitStatus(isOnline ? 'success' : 'queued')

        // Reset form after showing status
        setTimeout(() => {
            setIssueType('')
            setDescription('')
            setPhoto(null)
            setPhotoPreview(null)
            setSubmitStatus(null)
        }, 3000)
    }

    // Success/Queued overlay
    if (submitStatus) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center p-6"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    {submitStatus === 'success' ? (
                        <>
                            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {t.reportSuccess}
                            </h2>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                                <CloudOff className="w-10 h-10 text-amber-500" />
                            </div>
                            <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {t.reportQueued}
                            </h2>
                        </>
                    )}
                </motion.div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-4 pb-8"
        >
            <h1 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {t.reportProblem}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Issue Type Selection */}
                <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {t.issueType}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {issueTypes.map(type => {
                            const Icon = getIcon(type.icon)
                            const isSelected = issueType === type.id
                            return (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setIssueType(type.id)}
                                    className={`p-3 rounded-xl flex items-center gap-2 transition-all ${isSelected
                                            ? 'bg-primary-500 text-white'
                                            : darkMode
                                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        {language === 'as' ? type.as : type.en}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {t.description}
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t.descriptionPlaceholder}
                        rows={4}
                        className={`w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent ${darkMode
                                ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                                : 'bg-white border-gray-200 text-gray-800 placeholder:text-gray-400'
                            }`}
                    />
                </div>

                {/* Photo Upload */}
                <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {t.addPhoto}
                    </label>

                    {photoPreview ? (
                        <div className="relative rounded-xl overflow-hidden">
                            <img
                                src={photoPreview}
                                alt="Preview"
                                className="w-full h-48 object-cover"
                            />
                            <button
                                type="button"
                                onClick={removePhoto}
                                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full p-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-colors ${darkMode
                                    ? 'border-slate-700 hover:border-slate-600 text-slate-400'
                                    : 'border-gray-300 hover:border-gray-400 text-gray-500'
                                }`}
                        >
                            <Camera className="w-8 h-8" />
                            <span className="text-sm">{t.addPhoto}</span>
                        </button>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoSelect}
                        className="hidden"
                    />
                </div>

                {/* Location */}
                <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {t.yourLocation}
                    </label>
                    <div className={`p-3 rounded-xl flex items-center gap-3 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'
                        }`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${location ? 'bg-green-500/20' : 'bg-slate-700'
                            }`}>
                            <MapPin className={`w-5 h-5 ${location ? 'text-green-500' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1">
                            {gettingLocation ? (
                                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                    {t.gettingLocation}
                                </p>
                            ) : location ? (
                                <>
                                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                    </p>
                                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                        Accuracy: ±{Math.round(location.accuracy)}m
                                    </p>
                                </>
                            ) : (
                                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                    {language === 'as' ? 'অৱস্থান উপলব্ধ নহয়' : 'Location not available'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Offline Indicator */}
                {!isOnline && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/20 text-amber-500">
                        <CloudOff className="w-5 h-5" />
                        <span className="text-sm">{t.offline}</span>
                    </div>
                )}

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    disabled={!issueType || !description || isSubmitting}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${!issueType || !description || isSubmitting
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            : 'bg-primary-500 hover:bg-primary-600 text-white'
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            {t.submitting}
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            {t.submit}
                        </>
                    )}
                </motion.button>
            </form>
        </motion.div>
    )
}

export default ReportPage
