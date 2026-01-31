/**
 * Broadcast Alert API Service
 * 
 * Handles all alert-related API operations:
 * - Broadcasting alerts to citizens
 * - Sending targeted warnings
 * - Fetching delivery status
 * - Managing alert templates
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Request timeout in milliseconds
const TIMEOUT = 30000;

/**
 * Helper function to make API requests with timeout
 */
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

/**
 * Broadcast an alert to all citizens in specified zones
 * @param {Object} alertData - Alert data
 * @param {string} alertData.basinId - Zone ID (or 'all' for all zones)
 * @param {string} alertData.message - Alert message
 * @param {string} alertData.severity - 'high', 'medium', or 'low'
 * @param {Array} alertData.channels - Delivery channels ['sms', 'push', 'email']
 * @param {string} alertData.type - Alert type: 'flood_warning', 'evacuation', 'all_clear', 'custom'
 * @returns {Promise<Object>} Response with recipients count and alert ID
 */
export const broadcastAlert = async (alertData) => {
  const alertPayload = {
    id: `alert_${Date.now()}`,
    basinId: alertData.basinId || 'all',
    type: alertData.type || 'custom',
    severity: alertData.severity || 'medium',
    title: alertData.title || `Alert - ${alertData.basinId || 'All Zones'}`,
    titleAssamese: alertData.titleAssamese || `সতৰ্কবাণী - ${alertData.basinId || 'সকলো অঞ্চল'}`,
    message: alertData.message,
    messageAssamese: alertData.messageAssamese || alertData.message,
    issuedBy: 'Admin',
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    active: true,
    recipients: alertData.basinId ? [alertData.basinId] : ['all'],
    channels: alertData.channels || ['app'],
  };

  // Send to /alerts endpoint
  const response = await fetchWithTimeout(`${API_BASE_URL}/alerts`, {
    method: 'POST',
    body: JSON.stringify(alertPayload),
  });

  return {
    success: true,
    alertId: response.id,
    basinId: alertData.basinId,
    message: alertData.message,
    severity: alertData.severity,
    timestamp: alertPayload.issuedAt,
    recipientsNotified: 100, // Placeholder until real delivery tracking
    channels: alertData.channels || ['app'],
    status: 'sent',
  };
};

/**
 * Send targeted warning to specific recipient groups
 * @param {Object} warningData - Warning data
 * @param {string} warningData.basinId - Zone ID
 * @param {string} warningData.message - Warning message
 * @param {Array} warningData.recipients - Recipient types: ['citizens', 'authorities', 'emergency_services']
 * @param {string} warningData.priority - 'high', 'medium', or 'low'
 * @returns {Promise<Object>} Response with delivery counts
 */
export const sendWarning = async (warningData) => {
  const warningPayload = {
    id: `warning_${Date.now()}`,
    basinId: warningData.basinId,
    type: 'warning',
    severity: warningData.priority || 'medium',
    title: `Warning - ${warningData.basinId}`,
    titleAssamese: `সতৰ্কবাণী - ${warningData.basinId}`,
    message: warningData.message,
    messageAssamese: warningData.message,
    issuedBy: 'Admin',
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    active: true,
    recipients: warningData.recipients || ['citizens'],
    channels: ['app'],
  };

  const response = await fetchWithTimeout(`${API_BASE_URL}/alerts`, {
    method: 'POST',
    body: JSON.stringify(warningPayload),
  });

  return {
    success: true,
    warningId: response.id,
    basinId: warningData.basinId,
    message: warningData.message,
    recipients: warningData.recipients,
    priority: warningData.priority,
    timestamp: warningPayload.issuedAt,
    totalRecipients: 50, // Placeholder
  };
};

/**
 * Get delivery status of a broadcast alert
 * @param {string} alertId - The alert ID
 * @returns {Promise<Object>} Delivery status details
 */
export const getAlertDeliveryStatus = async (alertId) => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/alerts/${alertId}`);
  
  return {
    alertId,
    status: response.active ? 'active' : 'expired',
    totalRecipients: response.sentTo || 0,
    delivered: response.deliveredCount || 0,
    failed: 0,
    pending: 0,
    channels: {
      app: { sent: response.sentTo || 0, delivered: response.deliveredCount || 0, failed: 0, pending: 0 }
    },
  };
};

/**
 * Get alert templates for quick sending
 * @returns {Promise<Array>} List of alert templates
 */
export const getAlertTemplates = async () => {
  // Templates are hardcoded but can be moved to API later
  const mockTemplates = {
    en: [
      {
        id: 'flood_warning_high',
        type: 'flood_warning',
        severity: 'high',
        title: 'Flood Warning - High Risk',
        titleAssamese: 'বান সতৰ্কবাণী - উচ্চ বিপদ',
        message: 'URGENT: Flood waters rising rapidly in your area. Move to higher ground immediately. Avoid flooded roads. Stay safe!',
        messageAssamese: 'জৰুৰী: আপোনাৰ অঞ্চলত বানৰ পানী বেগাই বাঢ়িছে। তৎক্ষণাত ওখ ঠাইলৈ যাওক। বানৰ পানীত পথ এৰাই চলক। সুৰক্ষিত থাকক!',
        category: 'urgent'
      },
      {
        id: 'evacuation_notice',
        type: 'evacuation',
        severity: 'high',
        title: 'Evacuation Notice',
        titleAssamese: 'উদ্বাসন বিজ্ঞপ্তি',
        message: 'EVACUATION ORDER: Please evacuate to designated shelter immediately. Take emergency kit and important documents.',
        messageAssamese: 'উদ্বাসন আদেশ: অনুগ্ৰহ কৰি নিৰ্দিষ্ট আশ্ৰয়স্থললৈ তৎক্ষণাত উদ্বাসন কৰক। জৰুৰীকালীন কিট আৰু গুৰুত্বপূৰ্ণ নথিপত্ৰ ল\'ব।',
        category: 'urgent'
      },
      {
        id: 'waterlogging_alert',
        type: 'waterlogging',
        severity: 'medium',
        title: 'Waterlogging Alert',
        titleAssamese: 'জলবন্ধতা সতৰ্কবাণী',
        message: 'Waterlogging reported in your area. Avoid low-lying areas and use alternate routes. Drive carefully.',
        messageAssamese: 'আপোনাৰ অঞ্চলত জলবন্ধতা পোৱা গৈছে। নিম্নাঞ্চল এৰাই চলক আৰু বিকল্প পথ ব্যৱহাৰ কৰক। সাৱধানে গাড়ী চলাওক।',
        category: 'warning'
      },
      {
        id: 'all_clear',
        type: 'all_clear',
        severity: 'low',
        title: 'All Clear',
        titleAssamese: 'স্বাভাৱিক পৰিস্থিতি',
        message: 'Flood waters receding. Roads are now safe. Continue to monitor updates. Thank you for your patience.',
        messageAssamese: 'বানৰ পানী কমি আছে। পথ এতিয়া সুৰক্ষিত। আপডেট নিৰীক্ষণ কৰি থাকক। আপোনাৰ ধৈৰ্যৰ বাবে ধন্যবাদ।',
        category: 'info'
      },
      {
        id: 'electricity_hazard',
        type: 'electricity_hazard',
        severity: 'high',
        title: 'Electricity Hazard Warning',
        titleAssamese: 'বিদ্যুতি বিপদ সতৰ্কবাণী',
        message: 'DANGER: Downed power lines reported. Do not approach. Stay at least 10 meters away. Report to 1912.',
        messageAssamese: 'বিপদ: পতিত হোৱা বিদ্যুতি তাঁৰৰ খবৰ পোৱা গৈছে। ওচৰ নাযাব। কমেও ১০ মিটাৰ আঁতৰত থাকক। ১৯১২ ত Report কৰক।',
        category: 'urgent'
      }
    ]
  };
  
  return mockTemplates;
};

/**
 * Get active alerts history
 * @param {Object} filters - Filter options
 * @param {string} filters.basinId - Filter by zone
 * @param {string} filters.severity - Filter by severity
 * @param {number} filters.limit - Number of results to return
 * @returns {Promise<Array>} List of alerts
 */
export const getAlertHistory = async (filters = {}) => {
  let url = `${API_BASE_URL}/alerts?_sort=issuedAt&_order=desc`;
  
  if (filters.basinId) {
    url += `&basinId=${filters.basinId}`;
  }
  if (filters.severity) {
    url += `&severity=${filters.severity}`;
  }
  if (filters.limit) {
    url += `&_limit=${filters.limit}`;
  }

  const alerts = await fetchWithTimeout(url);
  return alerts;
};

/**
 * Cancel an active alert
 * @param {string} alertId - Alert ID to cancel
 * @param {string} reason - Reason for cancellation
 * @returns {Promise<Object>} Cancellation confirmation
 */
export const cancelAlert = async (alertId, reason) => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/alerts/${alertId}`, {
    method: 'PATCH',
    body: JSON.stringify({ active: false, cancelledReason: reason }),
  });

  return {
    success: true,
    alertId,
    cancelledAt: new Date().toISOString(),
    reason,
    message: 'Alert cancelled successfully',
  };
};

/**
 * Get delivery statistics for dashboard
 * @param {string} period - 'today', 'week', 'month'
 * @returns {Promise<Object>} Statistics data
 */
export const getDeliveryStats = async (period = 'today') => {
  // Get all alerts and calculate stats
  const alerts = await fetchWithTimeout(`${API_BASE_URL}/alerts`);
  const broadcasts = await fetchWithTimeout(`${API_BASE_URL}/broadcasts`);
  
  const totalAlerts = alerts.length;
  const totalRecipients = alerts.reduce((sum, a) => sum + (a.sentTo || 0), 0);
  const delivered = alerts.reduce((sum, a) => sum + (a.deliveredCount || 0), 0);
  const deliveryRate = totalRecipients > 0 ? (delivered / totalRecipients * 100).toFixed(1) : 0;
  
  return {
    totalAlerts,
    totalRecipients,
    deliveryRate,
    byChannel: {
      app: { sent: totalRecipients, delivered: delivered, rate: deliveryRate }
    },
    bySeverity: {
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length
    }
  };
};

// Export all functions as a service object
const BroadcastAlertService = {
  broadcastAlert,
  sendWarning,
  getAlertDeliveryStatus,
  getAlertTemplates,
  getAlertHistory,
  cancelAlert,
  getDeliveryStats
};

export default BroadcastAlertService;
