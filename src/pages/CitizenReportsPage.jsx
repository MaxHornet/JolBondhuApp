import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Image as ImageIcon, Clock, MapPin, AlertTriangle, CheckCircle, Filter, Search } from 'lucide-react';
import { apiService } from '../services/apiService';

const CitizenReportsPage = ({ darkMode, language, translations, selectedStation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const t = translations;

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

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
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

  const stats = useMemo(() => {
    const total = reports.length;
    const alerts = reports.filter(r => r.type === 'alert' || r.issueType === 'flood_warning').length;
    const pending = reports.filter(r => r.status === 'pending').length;
    const resolved = reports.filter(r => r.status === 'resolved' || r.status === 'under_review').length;
    return { total, alerts, pending, resolved };
  }, [reports]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'alert': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'report': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'update': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-green-500 bg-green-500/20';
      case 'under_review': return 'text-blue-500 bg-blue-500/20';
      case 'pending': return 'text-amber-500 bg-amber-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getIssueIcon = (issueType) => {
    switch (issueType) {
      case 'waterlogging': return '💧';
      case 'flood_damage': return '🏠';
      case 'drain_block': return '🚧';
      case 'road_block': return '🛣️';
      case 'electricity_emergency': return '⚡';
      default: return '📝';
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
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

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-4 ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Reports</span>
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
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Alerts</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {loading ? '...' : stats.alerts}
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
              <Clock className={`w-5 h-5 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pending</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {loading ? '...' : stats.pending}
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
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Resolved</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {loading ? '...' : stats.resolved}
            </p>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className={`rounded-xl border p-4 mb-6 ${
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { key: 'all', label: 'All Reports' },
              { key: 'alert', label: 'Alerts', color: 'red' },
              { key: 'report', label: 'Reports', color: 'amber' },
              { key: 'update', label: 'Updates', color: 'blue' },
              { key: 'pending', label: 'Pending', color: 'amber' },
              { key: 'resolved', label: 'Resolved', color: 'green' }
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === f.key
                    ? f.color === 'red' ? 'bg-red-500 text-white' :
                      f.color === 'amber' ? 'bg-amber-500 text-white' :
                      f.color === 'blue' ? 'bg-blue-500 text-white' :
                      f.color === 'green' ? 'bg-green-500 text-white' :
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

        {/* Reports List */}
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
                      {/* Avatar */}
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
                          <span className={`px-2 py-0.5 text-xs rounded-full border ${getTypeColor(report.type)}`}>
                            {report.type === 'alert' ? '🚨 Alert' : 
                             report.type === 'report' ? '📝 Report' : 
                             report.type === 'update' ? '📢 Update' : report.type}
                          </span>
                          {report.status && (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(report.status)}`}>
                              {report.status === 'pending' ? '⏳ Pending' :
                               report.status === 'under_review' ? '👁️ Reviewing' :
                               report.status === 'resolved' ? '✅ Resolved' : report.status}
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
                              Zone: {report.basinId}
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
                              {getIssueIcon(report.issueType)} {report.issueType}
                            </span>
                          </div>
                        )}
                      </div>

                      {report.image || report.photoData && (
                        <div className="flex-shrink-0">
                          <div className={`w-20 h-20 rounded-lg overflow-hidden ${
                            darkMode ? 'bg-slate-700' : 'bg-gray-100'
                          }`}>
                            <ImageIcon className={`w-full h-full p-4 ${darkMode ? 'text-gray-500' : 'text-gray-300'}`} />
                          </div>
                        </div>
                      )}
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
};

export default CitizenReportsPage;
