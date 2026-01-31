import { useState, useEffect } from 'react'
import { reportService } from '../services/reportService'
import { apiService } from '../services/apiService'

const STORAGE_KEY = 'jolbondhu_pending_reports'

/**
 * Hook to manage pending reports in local storage
 * Reports are stored when offline and synced when online
 */
export function usePendingReports() {
    const [pendingReports, setPendingReports] = useState([])
    const [isSyncing, setIsSyncing] = useState(false)

    // Load pending reports from local storage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                setPendingReports(JSON.parse(stored))
            }
        } catch (error) {
            console.error('Error loading pending reports:', error)
        }
    }, [])

    // Save pending reports to local storage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingReports))
        } catch (error) {
            console.error('Error saving pending reports:', error)
        }
    }, [pendingReports])

    /**
     * Add a new report to the pending queue
     * @param {Object} report - The report to add
     */
    const addReport = (report) => {
        const newReport = {
            ...report,
            id: `report_${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'pending'
        }
        setPendingReports(prev => [...prev, newReport])
        return newReport
    }

    /**
     * Remove a report from the pending queue
     * @param {string} reportId - ID of the report to remove
     */
    const removeReport = (reportId) => {
        setPendingReports(prev => prev.filter(r => r.id !== reportId))
    }

    /**
     * Submit report directly to API (when online)
     * @param {Object} report - The report to submit
     */
    const submitReport = async (report) => {
        try {
            const reportWithUser = {
                ...report,
                id: `report_${Date.now()}`,
                userName: reportService.getUserName() || 'Anonymous',
                status: 'pending',
                timestamp: new Date().toISOString()
            }
            
            const response = await apiService.submitReport(reportWithUser)
            return { success: true, data: response }
        } catch (error) {
            console.error('Error submitting report:', error)
            // If API fails, queue it
            addReport(report)
            return { success: false, error: error.message, queued: true }
        }
    }

    /**
     * Sync all pending reports to the server
     */
    const syncReports = async () => {
        if (pendingReports.length === 0) return { success: true, synced: 0 }

        setIsSyncing(true)
        const results = []

        try {
            for (const report of pendingReports) {
                try {
                    const reportData = {
                        basinId: report.basinId || 'unknown',
                        userName: report.userName || reportService.getUserName() || 'Anonymous',
                        issueType: report.issueType,
                        description: report.description,
                        photoData: report.photoData,
                        location: report.location,
                        timestamp: report.timestamp,
                        status: 'pending',
                        language: 'en'
                    }
                    
                    await apiService.submitReport(reportData)
                    results.push({ id: report.id, status: 'synced' })
                } catch (error) {
                    results.push({ id: report.id, status: 'failed', error: error.message })
                }
            }

            // Remove successfully synced reports
            const syncedIds = results.filter(r => r.status === 'synced').map(r => r.id)
            setPendingReports(prev => prev.filter(r => !syncedIds.includes(r.id)))

            return { 
                success: true, 
                synced: syncedIds.length,
                failed: results.filter(r => r.status === 'failed').length,
                results 
            }
        } catch (error) {
            console.error('Sync error:', error)
            return { success: false, error: error.message }
        } finally {
            setIsSyncing(false)
        }
    }

    /**
     * Get count of pending reports
     */
    const pendingCount = pendingReports.length

    return {
        pendingReports,
        pendingCount,
        isSyncing,
        addReport,
        removeReport,
        submitReport,
        syncReports
    }
}
