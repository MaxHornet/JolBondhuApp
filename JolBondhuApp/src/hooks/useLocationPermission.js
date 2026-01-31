import { useState, useEffect, useCallback } from 'react';

/**
 * useLocationPermission Hook
 * 
 * Manages location permission state and provides utilities for:
 * - Checking permission status
 * - Requesting permission
 * - Handling permission changes
 * - Storing user preferences
 */

const STORAGE_KEY = 'jolbondhu_location_permission';
const ASK_LATER_KEY = 'jolbondhu_location_ask_later';

export const useLocationPermission = () => {
  const [permissionState, setPermissionState] = useState('prompt'); // prompt, granted, denied, unavailable
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasAskedBefore, setHasAskedBefore] = useState(false);
  const [askLaterTimestamp, setAskLaterTimestamp] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);

  // Check if we should show permission modal
  const shouldShowPermissionModal = useCallback(() => {
    // If already granted or denied, don't show
    if (permissionState === 'granted' || permissionState === 'denied') {
      return false;
    }

    // If unavailable, don't show
    if (permissionState === 'unavailable') {
      return false;
    }

    // If user asked to be asked later, check if 24 hours have passed
    if (askLaterTimestamp) {
      const hoursSinceAsked = (Date.now() - askLaterTimestamp) / (1000 * 60 * 60);
      if (hoursSinceAsked < 24) {
        return false;
      }
    }

    return true;
  }, [permissionState, askLaterTimestamp]);

  // Check initial permission status
  useEffect(() => {
    const checkPermission = async () => {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        setPermissionState('unavailable');
        return;
      }

      // Check stored preference
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHasAskedBefore(true);
      }

      // Check ask later timestamp
      const laterTimestamp = localStorage.getItem(ASK_LATER_KEY);
      if (laterTimestamp) {
        setAskLaterTimestamp(parseInt(laterTimestamp));
      }

      // Check actual permission state
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          setPermissionState(result.state);
          
          // Listen for permission changes
          result.onchange = () => {
            setPermissionState(result.state);
          };
        }
      } catch (err) {
        // Permissions API not supported, will rely on getCurrentPosition
        console.log('Permissions API not supported');
      }
    };

    checkPermission();
  }, []);

  // Request location permission
  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setPermissionState('unavailable');
        setIsLoading(false);
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissionState('granted');
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
          localStorage.setItem(STORAGE_KEY, 'granted');
          localStorage.removeItem(ASK_LATER_KEY);
          setIsLoading(false);
          resolve(position);
        },
        (error) => {
          let errorMessage;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setPermissionState('denied');
              localStorage.setItem(STORAGE_KEY, 'denied');
              errorMessage = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'An unknown error occurred';
          }
          setError(new Error(errorMessage));
          setIsLoading(false);
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    });
  }, []);

  // Handle ask later
  const askLater = useCallback(() => {
    const timestamp = Date.now();
    setAskLaterTimestamp(timestamp);
    localStorage.setItem(ASK_LATER_KEY, timestamp.toString());
  }, []);

  // Get current position (one-time)
  const getCurrentPosition = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setIsLoading(false);
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setCurrentPosition(pos);
          setIsLoading(false);
          resolve(pos);
        },
        (error) => {
          setError(error);
          setIsLoading(false);
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 60000 // Allow 1 minute cached position
        }
      );
    });
  }, []);

  // Watch position (continuous tracking)
  const watchPosition = useCallback((onSuccess, onError, options = {}) => {
    if (!navigator.geolocation) {
      onError && onError(new Error('Geolocation not supported'));
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          heading: position.coords.heading,
          speed: position.coords.speed
        };
        setCurrentPosition(pos);
        onSuccess && onSuccess(pos);
      },
      (error) => {
        onError && onError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options
      }
    );

    return watchId;
  }, []);

  // Clear watch
  const clearWatch = useCallback((watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Open settings (best effort)
  const openSettings = useCallback(() => {
    // Most browsers don't allow direct access to settings
    // Show alert with instructions
    const isAssamese = document.documentElement.lang === 'as';
    alert(
      isAssamese
        ? 'অনুগ্ৰহ কৰি আপোনাৰ ব্ৰাউজাৰ ছেটিংছ খোলক:\n১. ব্ৰাউজাৰ মেনু ক্লিক কৰক (থ্ৰি ডট্)\n২. ছেটিংছ বা পছন্দত যাওক\n৩. প্ৰাইভেছি আৰু সুৰক্ষা বাছক\n৪. অৱস্থান অনুমতি সক্ষম কৰক'
        : 'Please open your browser settings:\n1. Click browser menu (three dots)\n2. Go to Settings or Preferences\n3. Select Privacy and Security\n4. Enable Location permissions'
    );
  }, []);

  return {
    permissionState,
    isLoading,
    error,
    currentPosition,
    hasAskedBefore,
    shouldShowPermissionModal: shouldShowPermissionModal(),
    requestPermission,
    askLater,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    openSettings
  };
};

export default useLocationPermission;
