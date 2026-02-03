import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Image as ImageIcon, Mic, ChevronLeft, DollarSign, CheckCircle, XCircle, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { apiService } from '../services/apiService';
import { reportService } from '../services/reportService';
import { basins } from '../data/sharedData';

function MyReportsPage({ darkMode, language, t }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingUpi, setEditingUpi] = useState(null);
  const [upiInput, setUpiInput] = useState('');
  const [updating, setUpdating] = useState(false);

  const userName = reportService.getUserName() || 'Anonymous';

  useEffect(() => {
    fetchMyReports();
    const interval = setInterval(fetchMyReports, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyReports(userName);
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUpi = async (reportId) => {
    if (!upiInput.trim()) return;
    setUpdating(true);
    try {
      await apiService.updateReportUpi(reportId, upiInput.trim());
      setEditingUpi(null);
      setUpiInput('');
      fetchMyReports();
    } catch (error) {
      console.error('Error updating UPI:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getBasinName = (basinId) => {
    const basin = basins.find(b => b.id === basinId);
    return language === 'as' ? (basin?.nameAssamese || basin?.name || basinId) : (basin?.name || basinId);
  };

  const getIssueTypeName = (issueType) => {
    const issueTypeMap = {
      waterlogging: { en: 'Waterlogging', as: 'জলবন্ধতা' },
      drain_block: { en: 'Drain Blockage', as: 'নলা অৱৰোধ' },
      flood_damage: { en: 'Flood Damage', as: 'বান ক্ষতি' },
      road_block: { en: 'Road Blocked', as: 'পথ অৱৰুদ্ধ' },
      electricity_emergency: { en: 'Electricity Emergency', as: 'বিদ্যুতি জৰুৰীকালীন' },
      other: { en: 'Other', as: 'অন্যান্য' }
    };
    return issueTypeMap[issueType]?.[language] || issueType;
  };

  const getRewardStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'disbursed': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      default: return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
    }
  };

  const getRewardStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'disbursed': return <DollarSign className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getRewardStatusLabel = (status) => {
    switch (status) {
      case 'approved': return t.rewardApproved || 'Approved';
      case 'rejected': return t.rewardRejected || 'Rejected';
      case 'disbursed': return t.rewardDisbursed || 'Paid';
      default: return t.rewardPending || 'Pending';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t.justNow || 'Just now';
    if (diffMins < 60) return `${diffMins} ${t.minsAgo || 'mins ago'}`;
    if (diffHours < 24) return `${diffHours} ${t.hoursAgo || 'hours ago'}`;
    return `${diffDays} ${t.daysAgo || 'days ago'}`;
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'pending') return report.rewardStatus === 'pending';
    if (filter === 'approved') return report.rewardStatus === 'approved';
    if (filter === 'rejected') return report.rewardStatus === 'rejected';
    if (filter === 'disbursed') return report.rewardStatus === 'disbursed';
    return true;
  });

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.rewardStatus === 'pending').length,
    approved: reports.filter(r => r.rewardStatus === 'approved' || r.rewardStatus === 'disbursed').length,
    rejected: reports.filter(r => r.rewardStatus === 'rejected').length
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="px-4 py-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/report"
            className={`p-2 rounded-lg ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-gray-600'}`}
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {t.myReports || 'My Reports'}
            </h1>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              {userName}
            </p>
          </div>
          <button
            onClick={fetchMyReports}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${loading ? 'opacity-50' : ''} ${darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { key: 'total', label: t.all || 'All', color: 'blue' },
            { key: 'pending', label: t.pendingRewards || 'Pending', color: 'amber' },
            { key: 'approved', label: t.approvedRewards || 'Approved', color: 'green' },
            { key: 'rejected', label: t.rejectedRewards || 'Rejected', color: 'red' }
          ].map((stat) => (
            <div
              key={stat.key}
              className={`p-3 rounded-xl text-center ${
                darkMode ? 'bg-slate-800' : 'bg-white'
              }`}
            >
              <p className={`text-xl font-bold ${stat.color === 'blue' ? 'text-blue-500' : stat.color === 'amber' ? 'text-amber-500' : stat.color === 'green' ? 'text-green-500' : 'text-red-500'}`}>
                {stats[stat.key]}
              </p>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { key: 'all', label: t.all || 'All' },
            { key: 'pending', label: (t.rewardPending || 'Pending') + ' 🟡' },
            { key: 'approved', label: (t.rewardApproved || 'Approved') + ' 🟢' },
            { key: 'rejected', label: (t.rewardRejected || 'Rejected') + ' 🔴' }
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.key
                  ? darkMode ? 'bg-primary-600 text-white' : 'bg-primary-500 text-white'
                  : darkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className={`w-8 h-8 animate-spin ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className={`rounded-xl border p-8 text-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <FileText className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {t.noReports || 'No reports yet'}
            </p>
            <Link
              to="/report"
              className={`inline-block mt-4 px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-primary-600 text-white' : 'bg-primary-500 text-white'}`}
            >
              {t.reportIssue || 'Report an Issue'}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
                >
                  {/* Status Bar */}
                  <div className={`px-4 py-2 flex items-center justify-between border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full border flex items-center gap-1 ${getRewardStatusColor(report.rewardStatus || 'pending')}`}>
                        {getRewardStatusIcon(report.rewardStatus || 'pending')}
                        {getRewardStatusLabel(report.rewardStatus || 'pending')}
                      </span>
                      {report.rewardAmount && (
                        <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${darkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-100 text-teal-600'}`}>
                          <DollarSign className="w-3 h-3" />
                          ₹{report.rewardAmount}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                      {formatTime(report.timestamp)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                        {report.userName?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {getBasinName(report.basinId)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-600'}`}>
                            {getIssueTypeName(report.issueType)}
                          </span>
                        </div>

                        <p className={`text-sm mb-3 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                          {report.description}
                        </p>

                        {/* Media Indicators */}
                        <div className="flex items-center gap-3 mb-3">
                          {report.photoData && (
                            <span className={`text-xs flex items-center gap-1 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                              <ImageIcon className="w-3 h-3" />
                              Photo
                            </span>
                          )}
                          {report.voiceData && (
                            <span className={`text-xs flex items-center gap-1 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                              <Mic className="w-3 h-3" />
                              Voice
                            </span>
                          )}
                        </div>

                        {/* UPI Section */}
                        {report.rewardStatus === 'approved' && (
                          <div className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                            {editingUpi === report.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={upiInput}
                                  onChange={(e) => setUpiInput(e.target.value)}
                                  placeholder={t.upiIdPlaceholder || 'yourname@upi'}
                                  className={`flex-1 px-3 py-2 text-sm rounded-lg border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                                />
                                <button
                                  onClick={() => handleUpdateUpi(report.id)}
                                  disabled={updating || !upiInput.trim()}
                                  className="px-3 py-2 text-sm bg-green-500 text-white rounded-lg disabled:opacity-50"
                                >
                                  {t.save || 'Save'}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingUpi(null);
                                    setUpiInput('');
                                  }}
                                  className={`px-3 py-2 text-sm rounded-lg ${darkMode ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-gray-600'}`}
                                >
                                  {t.cancel || 'Cancel'}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-teal-500" />
                                  <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                    {report.upiId ? report.upiId : t.upiMissing || 'UPI not set'}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setEditingUpi(report.id);
                                    setUpiInput(report.upiId || '');
                                  }}
                                  className={`text-xs px-3 py-1 rounded ${darkMode ? 'bg-slate-600 text-slate-300' : 'bg-gray-200 text-gray-600'}`}
                                >
                                  {report.upiId ? t.edit || 'Edit' : t.add || 'Add'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Rejection Reason */}
                        {report.rewardStatus === 'rejected' && report.rewardReason && (
                          <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                            <p className={`text-xs font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                              {t.rejectionReason || 'Reason'}:
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                              {report.rewardReason}
                            </p>
                          </div>
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
    </div>
  );
}

export default MyReportsPage;
