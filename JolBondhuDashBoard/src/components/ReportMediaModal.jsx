import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, Image as ImageIcon, Mic } from 'lucide-react';

const ReportMediaModal = ({ isOpen, onClose, report, darkMode, t }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setIsPlaying(false);
      setAudioProgress(0);
    }
  }, [isOpen, report]);

  if (!isOpen || !report) return null;

  const hasImage = report.photoData || report.image;
  const hasVoice = report.voiceData;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : 0);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev < 2 ? prev + 1 : 2);
  };

  const handleAudioPlayPause = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-[1200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden ${
            darkMode ? 'bg-slate-800' : 'bg-white'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            darkMode ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                darkMode ? 'bg-slate-700' : 'bg-gray-100'
              }`}>
                {report.user?.charAt(0) || '?'}
              </div>
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {report.user || 'Anonymous'}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {report.content || report.description?.substring(0, 50)}...
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Image Gallery */}
            {hasImage && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon size={18} className="text-teal-500" />
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {t.images}
                  </span>
                </div>

                <div className="relative">
                  <div className={`aspect-video rounded-xl overflow-hidden ${
                    darkMode ? 'bg-slate-700' : 'bg-gray-100'
                  }`}>
                    {report.photoData ? (
                      <img
                        src={report.photoData}
                        alt="Report attachment"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon size={48} className={`mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-300'}`} />
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                            {t.photoAttached}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Image Navigation */}
                  <div className="absolute inset-0 flex items-center justify-between px-2">
                    <button
                      onClick={handlePrevImage}
                      className={`p-2 rounded-full shadow-lg transition-colors ${
                        darkMode ? 'bg-slate-700/80 hover:bg-slate-700 text-white' : 'bg-white/80 hover:bg-white text-gray-800'
                      }`}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className={`p-2 rounded-full shadow-lg transition-colors ${
                        darkMode ? 'bg-slate-700/80 hover:bg-slate-700 text-white' : 'bg-white/80 hover:bg-white text-gray-800'
                      }`}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>

                  {/* Image Counter */}
                  <div className={`absolute bottom-3 right-3 px-3 py-1 rounded-full text-sm ${
                    darkMode ? 'bg-slate-700/80 text-white' : 'bg-white/80 text-gray-800'
                  }`}>
                    {currentImageIndex + 1} / 3
                  </div>
                </div>
              </div>
            )}

            {/* Voice Message */}
            {hasVoice && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Mic size={18} className="text-teal-500" />
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {t.voiceMessage}
                  </span>
                </div>

                <div className={`p-4 rounded-xl ${
                  darkMode ? 'bg-slate-700' : 'bg-gray-100'
                }`}>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleAudioPlayPause}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        isPlaying
                          ? 'bg-teal-500 text-white'
                          : darkMode ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <div className="flex-1">
                      <div className={`h-2 rounded-full overflow-hidden ${
                        darkMode ? 'bg-slate-600' : 'bg-gray-200'
                      }`}>
                        <motion.div
                          className="h-full bg-teal-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${audioProgress}%` }}
                        />
                      </div>
                      <div className={`flex justify-between text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>{formatTime(audioProgress * 1.5)}</span>
                        <span>{formatTime(90)}</span>
                      </div>
                    </div>

                    <Volume2 size={20} className="text-teal-500" />
                  </div>

                  <audio
                    ref={audio => {
                      if (audio) {
                        audio.src = report.voiceData;
                        audio.ontimeupdate = () => {
                          setAudioProgress(audio.currentTime / audio.duration);
                        };
                        audio.onended = () => {
                          setIsPlaying(false);
                          setAudioProgress(0);
                        };
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* No Media */}
            {!hasImage && !hasVoice && (
              <div className={`p-8 rounded-xl text-center ${
                darkMode ? 'bg-slate-700' : 'bg-gray-100'
              }`}>
                <ImageIcon size={48} className={`mx-auto mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-300'}`} />
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t.noMedia}
                </p>
              </div>
            )}

            {/* Timestamp Info */}
            <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t.report} ID:
                  </span>
                  <span className={`ml-2 font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {report.id}
                  </span>
                </div>
                <div>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t.incidentId}:
                  </span>
                  <span className={`ml-2 font-mono ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {report.incidentId || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t.verificationCount}:
                  </span>
                  <span className={`ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {report.verificationCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReportMediaModal;
