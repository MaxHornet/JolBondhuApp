import { apiService } from './apiService';

class ReportService {
  constructor() {
    this.STORAGE_KEY = 'jolbondhu_pending_reports';
    this.USERNAME_KEY = 'jolbondhu_username';
  }

  // Get pending reports from localStorage
  getPendingReports() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading pending reports:', error);
      return [];
    }
  }

  // Save pending reports to localStorage
  savePendingReports(reports) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));
    } catch (error) {
      console.error('Error saving pending reports:', error);
    }
  }

  // Add report to pending queue
  queueReport(report) {
    const pending = this.getPendingReports();
    const reportWithId = {
      ...report,
      localId: `local_${Date.now()}`,
      queuedAt: new Date().toISOString()
    };
    pending.push(reportWithId);
    this.savePendingReports(pending);
    return reportWithId;
  }

  // Remove report from pending queue
  removeFromQueue(localId) {
    const pending = this.getPendingReports();
    const filtered = pending.filter(r => r.localId !== localId);
    this.savePendingReports(filtered);
  }

  // Submit single report to API
  async submitToAPI(report) {
    try {
      const response = await apiService.submitReport(report);
      return { success: true, data: response };
    } catch (error) {
      console.error('Failed to submit report:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync all pending reports
  async syncPendingReports() {
    const pending = this.getPendingReports();
    const results = [];

    for (const report of pending) {
      const { localId, queuedAt, ...reportData } = report;
      const result = await this.submitToAPI(reportData);
      
      if (result.success) {
        this.removeFromQueue(localId);
        results.push({ localId, status: 'synced', data: result.data });
      } else {
        results.push({ localId, status: 'failed', error: result.error });
      }
    }

    return results;
  }

  // Get or set username
  getUserName() {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  setUserName(name) {
    localStorage.setItem(this.USERNAME_KEY, name);
  }

  hasUserName() {
    return !!this.getUserName();
  }
}

export const reportService = new ReportService();
export default reportService;
