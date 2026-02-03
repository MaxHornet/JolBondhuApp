import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Image as ImageIcon, Clock, MapPin, AlertTriangle, CheckCircle, Filter, Search, DollarSign, X, Check, Eye, ThumbsUp, ThumbsDown, Wallet, PlayCircle } from 'lucide-react';
import { apiService } from '../services/apiService';
import ReportMediaModal from '../components/ReportMediaModal';

const CitizenReportsPage = ({ darkMode, language, translations, selectedStation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const t = translations;

  const [selectedReport, setSelectedReport] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await apiService.getReports();
        setReports(data || []);
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApprove = async () => {
    if (!upiId.trim()) {
      showNotification(t.upiIdRequired, 'error');
      return;
    }
    setProcessing(true);
    try {
      await apiService.approveReport(selectedReport.id, {
        rewardAmount: Math.floor(Math.random() * 101) + 50,
        upiId: upiId.trim(),
        adminNote: adminNote.trim()
      });
      showNotification(`Report approved! Random reward assigned.`);
      setShowApproveModal(false);
      setUpiId('');
      setAdminNote('');
      const data = await apiService.getReports();
      setReports(data || []);
    } catch (err) {
      showNotification('Failed to approve report', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showNotification(t.rejectionReasonRequired, 'error');
      return;
    }
    setProcessing(true);
    try {
      await apiService.rejectReport(selectedReport.id, {
        reason: rejectionReason.trim(),
        adminNote: adminNote.trim()
      });
      showNotification('Report rejected with reason.');
      setShowRejectModal(false);
      setRejectionReason('');
      setAdminNote('');
      const data = await apiService.getReports();
      setReports(data || []);
    } catch (err) {
      showNotification('Failed to reject report', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDisburse = async () => {
    setProcessing(true);
    try {
      await apiService.disburseReward(selectedReport.id);
      showNotification('Reward marked as disbursed!');
      setShowDisburseModal(false);
      const data = await apiService.getReports();
      setReports(data || []);
    } catch (err) {
      showNotification('Failed to disburse reward', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const getRewardStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'disbursed': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      default: return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
    }
  };

  const getRewardStatusLabel = (status) => {
    switch (status) {
      case 'approved': return t.rewardApproved;
      case 'rejected': return t.rewardRejected;
      case 'disbursed': return t.rewardDisbursed;
      default: return t.rewardPending;
    }
  };

  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter(r => r.rewardStatus === 'pending').length;
    const approved = reports.filter(r => r.rewardStatus === 'approved').length;
    const rejected = reports.filter(r => r.rewardStatus === 'rejected').length;
    const disbursed = reports.filter(r => r.rewardStatus === 'disbursed').length;
    const totalReward = reports
      .filter(r => r.rewardStatus === 'approved' || r.rewardStatus === 'disbursed')
      .reduce((sum, r) => sum + (r.rewardAmount || 0), 0);
    return { total, pending, approved, rejected, disbursed, totalReward };
  }, [reports]);

  const openApproveModal = (report) => {
    setSelectedReport(report);
    setUpiId(report.upiId || '');
    setShowApproveModal(true);
  };

  const openRejectModal = (report) => {
    setSelectedReport(report);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const openDisburseModal = (report) => {
    setSelectedReport(report);
    setShowDisburseModal(true);
  };

  const openMediaModal = (report) => {
    setSelectedReport(report);
    setShowMediaModal(true);
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (filter === 'reward-pending') return report.rewardStatus === 'pending';
      if (filter === 'reward-approved') return report.rewardStatus === 'approved';
      if (filter === 'reward-rejected') return report.rewardStatus === 'rejected';
      if (filter === 'reward-disbursed') return report.rewardStatus === 'disbursed';
      if (filter === 'alert') return report.type === 'alert' || report.issueType === 'flood_warning';
      if (filter === 'report') return report.type === 'report';
      if (filter === 'update') return report.type === 'update';
      if (filter === 'pending') return report.status === 'pending';
      if (filter === 'resolved') return report.status === 'resolved' || report.status === 'under_review';
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const locationStr = typeof report.location === 'string' ? report.location : JSON.stringify(report.location || '');
        return report.content?.toLowerCase().includes(term) ||
               report.user?.toLowerCase().includes(term) ||
               locationStr.toLowerCase().includes(term);
      }
      return true;
    });
  }, [reports, filter, searchTerm]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 z-[1300] px-4 py-3 rounded-lg shadow-lg ${
            notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
          }`}
        >
          {notification.message}
        </motion.div>
      )}

      <div className="p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {t.citizenReports}
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Citizen reports and feedback from affected areas
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-4 ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {loading ? '...' : stats.total}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-xl border p-4 ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.pendingRewards}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {loading ? '...' : stats.pending}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-xl border p-4 ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <ThumbsUp className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.approvedRewards}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {loading ? '...' : stats.approved}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl border p-4 ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <ThumbsDown className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.rejectedRewards}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {loading ? '...' : stats.rejected}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-xl border p-4 ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign className={`w-5 h-5 ${darkMode ? 'text-teal-400' : 'text-teal-500'}`} />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.totalRewards}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {loading ? '...' : `₹${stats.totalReward}`}
            </p>
          </motion.div>
        </div>

        <div className={`rounded-xl border p-4 mb-6 ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { key: 'all', label: 'All', color: 'teal' },
              { key: 'reward-pending', label: t.pendingRewards, color: 'amber' },
              { key: 'reward-approved', label: t.approvedRewards, color: 'green' },
              { key: 'reward-rejected', label: t.rejectedRewards, color: 'red' },
              { key: 'reward-disbursed', label: t.rewardDisbursed, color: 'blue' },
              { key: 'alert', label: 'Alerts', color: 'red' },
              { key: 'report', label: 'Reports', color: 'amber' },
              { key: 'update', label: 'Updates', color: 'blue' }
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === f.key
                    ? f.color === 'red' ? 'bg-red-500 text-white' :
                      f.color === 'amber' ? 'bg-amber-500 text-white' :
                      f.color === 'green' ? 'bg-green-500 text-white' :
                      f.color === 'blue' ? 'bg-blue-500 text-white' :
                      'bg-teal-500 text-white'
                    : darkMode 
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-sm rounded-lg border ${
                darkMode 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Users className={`w-8 h-8 animate-spin ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className={`rounded-xl border p-8 text-center ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <MessageSquare className={`w-12 h-12 mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              No reports found
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {searchTerm ? 'Try a different search term' : 'No citizen reports match the current filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-xl border overflow-hidden ${
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                        darkMode ? 'bg-slate-700' : 'bg-gray-100'
                      }`}>
                        {report.user?.charAt(0) || '?'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {report.user || 'Anonymous'}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full border ${getRewardStatusColor(report.rewardStatus || 'pending')}`}>
                            {getRewardStatusLabel(report.rewardStatus || 'pending')}
                          </span>
                          {report.rewardAmount && (
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${
                              darkMode ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' : 'bg-teal-100 text-teal-600 border-teal-200'
                            }`}>
                              ₹{report.rewardAmount}
                            </span>
                          )}
                        </div>

                        <div className={`flex items-center gap-3 mt-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {report.time || 'Recently'}
                          </span>
                          {report.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {typeof report.location === 'object' 
                                ? `${report.location.lat?.toFixed(4)}, ${report.location.lng?.toFixed(4)}`
                                : report.location}
                            </span>
                          )}
                          {report.basinId && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {report.basinId}
                            </span>
                          )}
                        </div>

                        <p className={`mt-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {report.content || report.description || report.message}
                        </p>

                        {report.issueType && (
                          <div className="mt-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
                              darkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {report.issueType}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => openMediaModal(report)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                          title={t.viewMedia}
                        >
                          <Eye size={18} />
                        </button>
                        {(report.photoData || report.voiceData) && (
                          <button
                            onClick={() => openMediaModal(report)}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode ? 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-400' : 'bg-teal-100 hover:bg-teal-200 text-teal-600'
                            }`}
                            title={t.viewMedia}
                          >
                            {report.photoData ? <ImageIcon size={18} /> : <PlayCircle size={18} />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                      <div className="flex flex-wrap items-center gap-3">
                        {report.rewardStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => openApproveModal(report)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                            >
                              <Check size={16} />
                              {t.approveReport}
                            </button>
                            <button
                              onClick={() => openRejectModal(report)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                              <X size={16} />
                              {t.rejectReport}
                            </button>
                          </>
                        )}
                        {report.rewardStatus === 'approved' && (
                          <button
                            onClick={() => openDisburseModal(report)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                          >
                            <Wallet size={16} />
                            {t.disburseReward}
                          </button>
                        )}
                        {report.rewardReason && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-600'
                          }`}>
                            Rejected: {report.rewardReason}
                          </span>
                        )}
                        {report.verificationCount > 0 && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            darkMode ? 'bg-slate-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {report.verificationCount} {t.verificationCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ReportMediaModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        report={selectedReport}
        darkMode={darkMode}
        t={t}
      />

      <AnimatePresence>
        {showApproveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[1100] flex items-center justify-center p-4"
            onClick={() => setShowApproveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={`w-full max-w-md rounded-2xl p-6 ${
                darkMode ? 'bg-slate-800' : 'bg-white'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {t.approveConfirmTitle}
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.approveConfirmMessage}
              </p>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.upiId} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder={t.enterUpiId}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.adminNote} <span className="text-gray-400">({t.optional})</span>
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={t.adminNote}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={processing || !upiId.trim()}
                  className="flex-1 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {processing ? '...' : t.confirm}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[1100] flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={`w-full max-w-md rounded-2xl p-6 ${
                darkMode ? 'bg-slate-800' : 'bg-white'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {t.rejectConfirmTitle}
              </h3>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.rejectConfirmMessage}
              </p>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.rejectionReason} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t.enterRejectionReason}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.adminNote} <span className="text-gray-400">({t.optional})</span>
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={t.adminNote}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {processing ? '...' : t.confirm}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDisburseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[1100] flex items-center justify-center p-4"
            onClick={() => setShowDisburseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={`w-full max-w-md rounded-2xl p-6 ${
                darkMode ? 'bg-slate-800' : 'bg-white'
              }`}
              onClick={e => e.stopPropagation()}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {t.disburseConfirmTitle}
              </h3>
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.disburseConfirmMessage}
              </p>
              {selectedReport && (
                <div className={`p-4 rounded-lg mb-6 ${
                  darkMode ? 'bg-slate-700' : 'bg-gray-100'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Amount:</span>
                    <span className="text-xl font-bold text-teal-500">₹{selectedReport.rewardAmount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>UPI ID:</span>
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedReport.upiId || 'N/A'}</span>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisburseModal(false)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleDisburse}
                  disabled={processing}
                  className="flex-1 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {processing ? '...' : t.confirm}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CitizenReportsPage;
