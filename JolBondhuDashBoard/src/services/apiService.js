const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Utility function for fetch with error handling
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const apiService = {
  // Basins/Zones
  getBasins: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/basins`);
  },

  getBasinById: async (basinId) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/basins/${basinId}`);
  },

  updateBasin: async (basinId, data) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/basins/${basinId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // Reports
  getReports: async (basinId = null, status = null) => {
    let url = `${API_BASE_URL}/reports`;
    const params = new URLSearchParams();
    
    if (basinId) params.append('basinId', basinId);
    if (status) params.append('status', status);
    params.append('_sort', 'timestamp');
    params.append('_order', 'desc');
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return fetchWithErrorHandling(url);
  },

  updateReportStatus: async (reportId, status) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  },

  // Alerts
  getAlerts: async (basinId = null, active = true) => {
    let url = `${API_BASE_URL}/alerts`;
    const params = new URLSearchParams();
    
    if (basinId) params.append('basinId', basinId);
    if (active) params.append('active', 'true');
    params.append('_sort', 'issuedAt');
    params.append('_order', 'desc');
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return fetchWithErrorHandling(url);
  },

  sendAlert: async (alert) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
  },

  // Broadcasts
  sendBroadcast: async (broadcast) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/broadcasts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(broadcast)
    });
  },

  getBroadcasts: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/broadcasts?_sort=issuedAt&_order=desc`);
  },

  // Polling helper
  startPolling: (callback, interval = 30000) => {
    return setInterval(callback, interval);
  },

  stopPolling: (intervalId) => {
    clearInterval(intervalId);
  }
};

export default apiService;
