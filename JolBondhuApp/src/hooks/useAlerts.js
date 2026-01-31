import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

export const useAlerts = (basinId = null, pollingInterval = 30000) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getAlerts(basinId, true);
      setAlerts(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [basinId]);

  useEffect(() => {
    // Initial fetch
    fetchAlerts();

    // Set up polling
    const intervalId = apiService.startPolling(fetchAlerts, pollingInterval);

    return () => {
      apiService.stopPolling(intervalId);
    };
  }, [fetchAlerts, pollingInterval]);

  const refreshAlerts = async () => {
    await fetchAlerts();
  };

  return {
    alerts,
    loading,
    error,
    lastUpdated,
    refreshAlerts
  };
};

export default useAlerts;
