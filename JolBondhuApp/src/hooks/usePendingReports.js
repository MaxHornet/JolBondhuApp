import { useState, useEffect } from 'react'

const STORAGE_KEY = 'jolbondhu_pending_reports'

/**
 * Hook to manage pending reports in local storage
 * Reports are stored when offline and synced when online
 */
export function usePendingReports() {
    const [pendingReports, setPendingReports] = useState([])

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
     * Sync all pending reports to the server
     * In demo mode, this just clears the queue
     */
    const syncReports = async () => {
        if (pendingReports.length === 0) return

        // In a real app, you would POST each report to the server here
        // For demo purposes, we'll simulate a successful sync
        console.log('Syncing reports:', pendingReports)

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mark all as synced (in demo, just clear them)
        setPendingReports([])

        return { success: true, synced: pendingReports.length }
    }

    /**
     * Get count of pending reports
     */
    const pendingCount = pendingReports.length

    return {
        pendingReports,
        pendingCount,
        addReport,
        removeReport,
        syncReports
    }
}
