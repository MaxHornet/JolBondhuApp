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
    HelpCircle,
    User,
    ChevronRight,
    Shield,
    Mic,
    Square,
    Play,
    Pause,
    Trash2
} from 'lucide-react'
import { issueTypes } from '../data/sharedData'
import { reportService } from '../services/reportService'

function ReportPage({ basins, isOnline, onSubmit, darkMode, language, t }) {
    const [issueType, setIssueType] = useState('')
    const [description, setDescription] = useState('')
    const [photo, setPhoto] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [voiceData, setVoiceData] = useState(null)
    const [location, setLocation] = useState(null)
    const [gettingLocation, setGettingLocation] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'queued' | null
    
    // Name prompt states
    const [userName, setUserName] = useState('')
    const [showNamePrompt, setShowNamePrompt] = useState(false)
    const [tempName, setTempName] = useState('')

    // Voice recording states
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [audioBlob, setAudioBlob] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [audioUrl, setAudioUrl] = useState(null)
    
    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    const timerRef = useRef(null)
    const audioPlayerRef = useRef(null)
    const fileInputRef = useRef(null)

    // Check for user name on mount
    useEffect(() => {
        const savedName = reportService.getUserName()
        if (savedName) {
            setUserName(savedName)
        }
    }, [])

    // Cleanup audio URL on unmount
    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl)
            }
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [audioUrl])

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

    // Start voice recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                setAudioBlob(audioBlob)
                
                // Convert to base64 for storage
                const reader = new FileReader()
                reader.onloadend = () => {
                    setVoiceData(reader.result)
                    setAudioUrl(reader.result)
                }
                reader.readAsDataURL(audioBlob)

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
            setRecordingTime(0)

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)
        } catch (error) {
            console.error('Error starting recording:', error)
            alert(language === 'as' 
                ? 'মাইক্ৰ’ফোন এক্সেছ কৰিবলৈ অনুমতি দিয়ক' 
                : 'Please allow microphone access to record')
        }
    }

    // Stop voice recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }

    // Delete voice recording
    const deleteRecording = () => {
        setVoiceData(null)
        setAudioBlob(null)
        setAudioUrl(null)
        setRecordingTime(0)
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl)
        }
    }

    // Play/Pause audio
    const togglePlayback = () => {
        if (audioPlayerRef.current) {
            if (isPlaying) {
                audioPlayerRef.current.pause()
            } else {
                audioPlayerRef.current.play()
            }
        }
    }

    // Format recording time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // Handle name prompt save
    const handleSaveName = (name) => {
        if (name.trim()) {
            reportService.setUserName(name.trim())
            setUserName(name.trim())
            setShowNamePrompt(false)
            setTempName('')
        }
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!issueType || !description) return

        // Check if user name exists, if not show prompt
        if (!userName && !reportService.hasUserName()) {
            setShowNamePrompt(true)
            return
        }

        setIsSubmitting(true)

        // Create report object
        const report = {
            basinId: location ? detectBasinFromLocation(location, basins) : 'unknown',
            issueType,
            description,
            photoData: photoPreview,
            voiceData: voiceData, // Include voice data
            location,
            timestamp: new Date().toISOString(),
            userName: userName || reportService.getUserName() || 'Anonymous'
        }

        // Submit to API if online, otherwise queue
        if (isOnline) {
            try {
                const response = await fetch('http://localhost:3001/reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(report)
                })
                if (response.ok) {
                    setSubmitStatus('success')
                } else {
                    throw new Error('API Error')
                }
            } catch (error) {
                console.error('Submit error:', error)
                onSubmit(report)
                setSubmitStatus('queued')
            }
        } else {
            onSubmit(report)
            setSubmitStatus('queued')
        }

        setIsSubmitting(false)

        // Reset form after showing status
        setTimeout(() => {
            setIssueType('')
            setDescription('')
            setPhoto(null)
            setPhotoPreview(null)
            setVoiceData(null)
            setAudioBlob(null)
            setAudioUrl(null)
            setRecordingTime(0)
            setSubmitStatus(null)
        }, 3000)
    }

    // Helper to detect basin from location (simplified)
    const detectBasinFromLocation = (loc, basinList) => {
        // In real app, you'd use proper geofencing
        // For now, return first basin or 'unknown'
        if (basinList && basinList.length > 0) {
            // Find closest basin by distance
            let closest = basinList[0]
            let minDist = Infinity
            
            basinList.forEach(basin => {
                const dist = Math.sqrt(
                    Math.pow(loc.lat - basin.coords[0], 2) + 
                    Math.pow(loc.lng - basin.coords[1], 2)
                )
                if (dist < minDist) {
                    minDist = dist
                    closest = basin
                }
            })
            
            return closest.id
        }
        return 'unknown'
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

                {/* Voice Recording */}
                <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {language === 'as' ? 'কণ্ঠ বাৰ্তা (বিকল্প)' : 'Voice Message (Optional)'}
                    </label>

                    {voiceData ? (
                        <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-3 mb-3">
                                <button
                                    type="button"
                                    onClick={togglePlayback}
                                    className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white hover:bg-primary-600 transition-colors"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </button>
                                <div className="flex-1">
                                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {language === 'as' ? 'কণ্ঠ বাৰ্তা সংযুক্ত' : 'Voice message attached'}
                                    </p>
                                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                        {formatTime(recordingTime)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={deleteRecording}
                                    className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <audio
                                ref={audioPlayerRef}
                                src={audioUrl}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onEnded={() => setIsPlaying(false)}
                                className="w-full"
                                controls
                            />
                        </div>
                    ) : isRecording ? (
                        <div className={`p-4 rounded-xl border-2 border-red-500 ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                                        <Square className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className={`text-lg font-bold text-red-500`}>
                                        {formatTime(recordingTime)}
                                    </p>
                                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                        {language === 'as' ? 'ৰেকৰ্ডিং চলি আছে...' : 'Recording...'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={stopRecording}
                                    className="px-4 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                                >
                                    {language === 'as' ? 'ৰোখক' : 'Stop'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={startRecording}
                            className={`w-full p-4 rounded-xl border-2 border-dashed flex items-center gap-3 transition-colors ${darkMode
                                    ? 'border-slate-700 hover:border-slate-600 text-slate-400'
                                    : 'border-gray-300 hover:border-gray-400 text-gray-500'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                                <Mic className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium">
                                    {language === 'as' ? 'কণ্ঠ বাৰ্তা ৰেকৰ্ড কৰক' : 'Record voice message'}
                                </p>
                                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                    {language === 'as' ? 'ব্যৱস্থা বৰ্ণনা কৰিবলৈ টিপক' : 'Tap to describe the issue verbally'}
                                </p>
                            </div>
                        </button>
                    )}
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

            {/* Name Prompt Modal */}
            <AnimatePresence>
                {showNamePrompt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
                        >
                            <div className="text-center mb-6">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-primary-500/20' : 'bg-primary-100'}`}>
                                    <User className="w-8 h-8 text-primary-500" />
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {language === 'as' ? 'আপোনাৰ নাম দিয়ক' : 'Enter Your Name'}
                                </h3>
                                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                    {language === 'as' 
                                        ? 'আপোনাৰ প্ৰতিবেদন আৰু ব্যৱহাৰকাৰীৰ অভিজ্ঞতা উন্নত কৰিবলৈ' 
                                        : 'To improve your reporting and user experience'}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        placeholder={language === 'as' ? 'আপোনাৰ নাম' : 'Your Name'}
                                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent ${darkMode
                                                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-500'
                                                : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400'
                                            }`}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && tempName.trim()) {
                                                handleSaveName(tempName)
                                            }
                                        }}
                                    />
                                </div>

                                <div className={`flex items-start gap-2 p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                                    <Shield className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                        {language === 'as' 
                                            ? 'আপোনাৰ নাম স্থানীয়ভাৱে সংৰক্ষিত হৈ থাকিব আৰু কেৱল প্ৰতিবেদনৰ সৈতে পঠিওৱা হব। কোনো একাউণ্ট প্ৰয়োজন নহয়।'
                                            : 'Your name will be stored locally and only sent with reports. No account required.'}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNamePrompt(false)
                                            setTempName('')
                                            // Continue with anonymous submission
                                            handleSubmit({ preventDefault: () => {}, skipNameCheck: true })
                                        }}
                                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${darkMode
                                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {language === 'as' ? 'বাদ দিয়ক' : 'Skip'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSaveName(tempName)}
                                        disabled={!tempName.trim()}
                                        className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${!tempName.trim()
                                                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                                : 'bg-primary-500 hover:bg-primary-600 text-white'
                                            }`}
                                    >
                                        {language === 'as' ? 'সঞ্চয় কৰক' : 'Save'}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default ReportPage
