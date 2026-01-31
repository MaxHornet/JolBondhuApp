import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Shield, Bell, X, Navigation, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Location Permission Modal Component
 * 
 * Shows educational onboarding for location permissions with:
 * - Visual explanation of why location is needed
 * - Permission state management
 * - Graceful handling of denied permissions
 * - Option to ask later or go to settings
 */

const LocationPermissionModal = ({ 
  isOpen, 
  onClose, 
  onPermissionGranted, 
  onPermissionDenied,
  language = 'en',
  darkMode = true 
}) => {
  const [permissionState, setPermissionState] = useState('prompt'); // prompt, granted, denied, unavailable
  const [currentStep, setCurrentStep] = useState(0);

  // Check initial permission status
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      // SAFE: Check if Permissions API exists before using it
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' })
          .then(result => {
            setPermissionState(result.state);
            result.onchange = () => setPermissionState(result.state);
          })
          .catch(() => {
            setPermissionState('prompt');
          });
      } else {
        // Permissions API not supported, fallback to prompt state
        setPermissionState('prompt');
      }
    } else if (isOpen && !navigator.geolocation) {
      setPermissionState('unavailable');
    }
  }, [isOpen]);

  // Educational slides content
  const slides = {
    en: [
      {
        icon: MapPin,
        title: "Stay Safe with Location",
        subtitle: "Real-time flood monitoring",
        description: "We use your location to show flood warnings for your area and send alerts when you enter high-risk zones.",
        color: "text-blue-500",
        bgColor: "bg-blue-500/20"
      },
      {
        icon: Bell,
        title: "Get Instant Alerts",
        subtitle: "Automatic zone detection",
        description: "When you enter a flood-prone area, we'll automatically notify you with safety guidelines and emergency contacts.",
        color: "text-amber-500",
        bgColor: "bg-amber-500/20"
      },
      {
        icon: Shield,
        title: "Emergency Response",
        subtitle: "Faster help when needed",
        description: "In emergencies, your location helps us direct rescue teams and provide accurate information to authorities.",
        color: "text-green-500",
        bgColor: "bg-green-500/20"
      },
      {
        icon: Navigation,
        title: "Accurate Reporting",
        subtitle: "Pinpoint issue locations",
        description: "When you report flooding or electrical hazards, GPS coordinates help authorities respond quickly.",
        color: "text-purple-500",
        bgColor: "bg-purple-500/20"
      }
    ],
    as: [
      {
        icon: MapPin,
        title: "অৱস্থানৰ সৈতে সুৰক্ষিত থাকক",
        subtitle: "ৰিয়েল-টাইম বান নিৰীক্ষণ",
        description: "আমি আপোনাৰ অঞ্চলৰ বান সতৰ্কবাণী দেখুৱাবলৈ আৰু আপুনি উচ্চ-বিপদ অঞ্চলত প্ৰৱেশ কৰিলে সতৰ্কবাণী পঠিয়াবলৈ আপোনাৰ অৱস্থান ব্যৱহাৰ কৰোঁ।",
        color: "text-blue-500",
        bgColor: "bg-blue-500/20"
      },
      {
        icon: Bell,
        title: "তাৎক্ষণিক সতৰ্কবাণী পাওক",
        subtitle: "স্বয়ংক্ৰিয় অঞ্চল চিনাক্তকৰণ",
        description: "যেতিয়া আপুনি বান-প্ৰৱণ অঞ্চলত প্ৰৱেশ কৰে, আমি স্বয়ংক্ৰিয়ভাৱে সুৰক্ষা নিৰ্দেশনা আৰু জৰুৰীকালীন যোগাযোগৰ সৈতে আপোনাক অবগত কৰিম।",
        color: "text-amber-500",
        bgColor: "bg-amber-500/20"
      },
      {
        icon: Shield,
        title: "জৰুৰীকালীন প্ৰতিক্ৰিয়া",
        subtitle: "প্ৰয়োজনীয় সময়ত দ্ৰুত সাহায্য",
        description: "জৰুৰীকালীন পৰিস্থিতিত, আপোনাৰ অৱস্থানে আমাক উদ্ধাৰ দল নিৰ্দেশনা কৰাত আৰু কতৃপক্ষক সঠিক তথ্য প্ৰদান কৰাত সহায় কৰে।",
        color: "text-green-500",
        bgColor: "bg-green-500/20"
      },
      {
        icon: Navigation,
        title: "সঠিক প্ৰতিবেদন",
        subtitle: "সমস্যাৰ স্থান সঠিকভাৱে চিহ্নিত কৰক",
        description: "যেতিয়া আপুনি বান বা বিদ্যুতি বিপদৰ প্ৰতিবেদন দিয়ে, জিপিএছ সমন্বয়বোৰে কতৃপক্ষক দ্ৰুতভাৱে প্ৰতিক্ৰিয়া কৰাত সহায় কৰে।",
        color: "text-purple-500",
        bgColor: "bg-purple-500/20"
      }
    ]
  };

  const currentSlides = slides[language] || slides.en;
  const currentSlide = currentSlides[currentStep];
  const Icon = currentSlide.icon;

  // Handle allow location
  const handleAllowLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissionState('granted');
          onPermissionGranted && onPermissionGranted(position);
        },
        (error) => {
          setPermissionState('denied');
          onPermissionDenied && onPermissionDenied(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setPermissionState('unavailable');
    }
  };

  // Handle ask later
  const handleAskLater = () => {
    onClose && onClose('later');
  };

  // Handle open settings
  const handleOpenSettings = () => {
    // Try to open browser settings (works in some browsers)
    if (window.location.protocol === 'https:') {
      alert(language === 'as' 
        ? "অনুগ্ৰহ কৰি আপোনাৰ ব্ৰাউজাৰ ছেটিংছলৈ যাওক আৰু অৱস্থান অনুমতি সক্ষম কৰক।"
        : "Please go to your browser settings and enable location permissions."
      );
    }
    onClose && onClose('settings');
  };

  // Render based on permission state
  const renderContent = () => {
    switch (permissionState) {
      case 'granted':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {language === 'as' ? 'অৱস্থান সক্ষম!' : 'Location Enabled!'}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 mb-6">
              {language === 'as' 
                ? "আপোনাৰ অৱস্থান সফলতাৰে সক্ষম হৈছে। আপুনি এতিয়া বান সতৰ্কবাণী আৰু জৰুৰীকালীন সতৰ্কবাণী পাব।"
                : "Your location has been successfully enabled. You will now receive flood alerts and emergency warnings."}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onClose && onClose('granted')}
              className="w-full py-3 bg-green-500 text-white font-bold rounded-xl"
            >
              {language === 'as' ? 'আৰম্ভ কৰক' : 'Get Started'}
            </motion.button>
          </div>
        );

      case 'denied':
        return (
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-red-600">
              {language === 'as' ? 'অৱস্থান অস্বীকৃত' : 'Location Denied'}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 mb-4">
              {language === 'as'
                ? "অৱস্থান অনুমতি অস্বীকৃত হৈছে। কিছুমান বৈশিষ্ট্য সীমিত হ'ব।"
                : 'Location permission was denied. Some features will be limited.'}
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {language === 'as'
                ? "আপুনি এতিয়াও প্ৰতিবেদন দাখিল কৰিব পাৰে, কিন্তু আপুনি স্বয়ংক্ৰিয় অঞ্চল সতৰ্কবাণী নাপাব।"
                : "You can still submit reports, but you won't receive automatic zone alerts."}
              </p>
            </div>
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenSettings}
                className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl"
              >
                {language === 'as' ? 'ছেটিংছ খোলক' : 'Open Settings'}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onClose && onClose('denied')}
                className="w-full py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-xl"
              >
                {language === 'as' ? 'বাদ দিয়ক' : 'Continue Anyway'}
              </motion.button>
            </div>
          </div>
        );

      case 'unavailable':
        return (
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {language === 'as' ? 'অৱস্থান সুবিধা নাই' : 'Location Unavailable'}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 mb-6">
              {language === 'as'
                ? "আপোনাৰ ডিভাইচ বা ব্ৰাউজাৰত অৱস্থান সেৱা উপলব্ধ নাই।"
                : "Location services are not available on your device or browser."}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onClose && onClose('unavailable')}
              className="w-full py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-xl"
            >
              {language === 'as' ? 'বুজিছোঁ' : 'I Understand'}
            </motion.button>
          </div>
        );

      default: // prompt
        return (
          <>
            {/* Progress indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {currentSlides.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep 
                      ? 'w-8 bg-blue-500' 
                      : idx < currentStep 
                        ? 'w-4 bg-blue-300' 
                        : 'w-4 bg-gray-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>

            {/* Slide content */}
            <div className="text-center mb-8">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`w-24 h-24 rounded-full ${currentSlide.bgColor} flex items-center justify-center mx-auto mb-4`}
              >
                <Icon className={`w-12 h-12 ${currentSlide.color}`} />
              </motion.div>
              
              <motion.div
                key={`text-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-xl font-bold mb-1">
                  {currentSlide.title}
                </h3>
                <p className={`text-sm font-medium mb-3 ${currentSlide.color}`}>
                  {currentSlide.subtitle}
                </p>
                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed px-2">
                  {currentSlide.description}
                </p>
              </motion.div>
            </div>

            {/* Navigation buttons */}
            <div className="space-y-3">
              {currentStep < currentSlides.length - 1 ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl"
                >
                  {language === 'as' ? 'পৰৱৰ্তী' : 'Next'}
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAllowLocation}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  {language === 'as' ? 'অৱস্থান অনুমতি দিয়ক' : 'Allow Location Access'}
                </motion.button>
              )}
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAskLater}
                className="w-full py-3 text-gray-500 dark:text-slate-400 font-medium text-sm"
              >
                {language === 'as' ? 'পিছত সোধক' : 'Ask Me Later'}
              </motion.button>
            </div>
          </>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl ${
              darkMode 
                ? 'bg-slate-800 border border-slate-700' 
                : 'bg-white border border-gray-200'
            }`}
          >
            {/* Close button */}
            {permissionState !== 'granted' && (
              <button
                onClick={handleAskLater}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}

            {/* Content */}
            {renderContent()}

            {/* Privacy note */}
            {permissionState === 'prompt' && (
              <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-6">
                {language === 'as'
                  ? "আমি আপোনাৰ গোপনীয়তা সম্মান কৰোঁ। আপোনাৰ অৱস্থান কেৱল বান সতৰ্কবাণীৰ বাবে ব্যৱহাৰ কৰা হয়।"
                  : "We respect your privacy. Your location is only used for flood alerts and safety features."}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationPermissionModal;
