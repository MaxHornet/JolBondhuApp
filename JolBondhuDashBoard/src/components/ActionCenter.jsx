import React, { useState, useEffect } from 'react';
import { Phone, Shield, Radio, Send, X, CheckCircle, AlertTriangle, Clock, Users, MessageSquare, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BroadcastAlertService from '../services/broadcastAlertService';

const ActionCenter = ({ darkMode, language, t, selectedBasin }) => {
  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState({});
  const [alertResult, setAlertResult] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const actions = [
    { 
      icon: Phone, 
      labelKey: 'emergencyContacts', 
      color: 'text-red-500', 
      bg: 'bg-red-50 dark:bg-red-900/20',
      action: 'emergency'
    },
    { 
      icon: Shield, 
      labelKey: 'safetyGuidelines', 
      color: 'text-green-500', 
      bg: 'bg-green-50 dark:bg-green-900/20',
      action: 'safety'
    },
    { 
      icon: Radio, 
      labelKey: 'broadcastAlert', 
      color: 'text-amber-500', 
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      action: 'broadcast'
    },
    { 
      icon: Send, 
      labelKey: 'sendWarning', 
      color: 'text-blue-500', 
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      action: 'warning'
    },
  ];

  // Load alert templates when broadcast modal opens
  useEffect(() => {
    if (activeModal === 'broadcast') {
      loadAlertTemplates();
    }
  }, [activeModal]);

  // Load alert templates
  const loadAlertTemplates = async () => {
    try {
      const templatesData = await BroadcastAlertService.getAlertTemplates();
      setTemplates(templatesData[language] || templatesData.en);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  // Handle Emergency Contacts
  const handleEmergencyContacts = async () => {
    setActiveModal('emergency');
    setLoading(true);
    
    // Simulate API call with realistic delay
    setTimeout(() => {
      setModalData({
        contacts: [
          { name: 'Assam State Disaster Management', phone: '1070', type: 'Emergency', priority: 'High' },
          { name: 'Guwahati Municipal Corporation', phone: '0361-2545002', type: 'Municipal', priority: 'High' },
          { name: 'District Collector Office', phone: '1077', type: 'District', priority: 'Medium' },
          { name: 'Fire Department', phone: '101', type: 'Emergency', priority: 'High' },
          { name: 'ASEB Electricity Emergency', phone: '1912', type: 'Electricity', priority: 'High' },
        ]
      });
      setLoading(false);
    }, 800);
  };

  // Handle Safety Guidelines
  const handleSafetyGuidelines = async () => {
    setActiveModal('safety');
    setLoading(true);
    
    setTimeout(() => {
      const guidelines = selectedBasin?.riskLevel === 'High' 
        ? [
            { step: 1, description: 'Evacuate immediately to higher ground' },
            { step: 2, description: 'Turn off electricity and gas supply' },
            { step: 3, description: 'Move valuables to upper floors' },
            { step: 4, description: 'Keep emergency kit ready' },
            { step: 5, description: 'Stay tuned to local news and alerts' },
          ]
        : selectedBasin?.riskLevel === 'Medium'
        ? [
            { step: 1, description: 'Monitor water levels closely' },
            { step: 2, description: 'Prepare emergency supplies' },
            { step: 3, description: 'Keep important documents safe' },
            { step: 4, description: 'Have evacuation plan ready' },
          ]
        : [
            { step: 1, description: 'Stay alert and monitor situation' },
            { step: 2, description: 'Keep emergency numbers handy' },
            { step: 3, description: 'Avoid low-lying areas' },
          ];
      
      setModalData({ 
        title: `Safety Guidelines - ${selectedBasin?.riskLevel} Risk`,
        guidelines 
      });
      setLoading(false);
    }, 600);
  };

  // Handle Broadcast Alert - NOW USING REAL API SERVICE
  const handleBroadcastAlert = async (message, severity = 'high', channels = ['sms', 'push', 'email']) => {
    if (!message || !selectedBasin) {
      alert(language === 'as' ? 'অনুগ্ৰহ কৰি বাৰ্তা প্ৰবেশ কৰক' : 'Please enter a message');
      return;
    }

    setLoading(true);
    setAlertResult(null);
    
    try {
      const alertData = {
        basinId: selectedBasin.id,
        message: message,
        severity: severity,
        channels: channels,
        type: 'flood_warning',
        timestamp: new Date().toISOString()
      };

      // Call the real API service
      const result = await BroadcastAlertService.broadcastAlert(alertData);
      
      setAlertResult({
        type: 'success',
        title: language === 'as' ? "সতৰ্কবাণী সফলতাৰে পঠিওৱা হ'ল!" : 'Alert Broadcasted Successfully!',
        data: result
      });
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        if (alertResult?.type === 'success') {
          setActiveModal(null);
          setAlertResult(null);
          setModalData({});
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error broadcasting alert:', error);
      setAlertResult({
        type: 'error',
        title: language === 'as' ? 'ত্ৰুটি' : 'Error',
        message: error.message || (language === 'as' ? 'সতৰ্কবাণী পঠিওৱাত বিফল' : 'Failed to broadcast alert')
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Send Warning - NOW USING REAL API SERVICE
  const handleSendWarning = async (message, recipients = ['citizens'], channels = ['sms', 'whatsapp', 'push']) => {
    if (!message || !selectedBasin) {
      alert(language === 'as' ? 'অনুগ্রহ করি বার্তা প্রবেশ করুন' : 'Please enter a message');
      return;
    }

    setLoading(true);
    setAlertResult(null);
    
    try {
      const warningData = {
        basinId: selectedBasin.id,
        message: message,
        recipients: recipients,
        priority: 'high',
        channels: channels,
        timestamp: new Date().toISOString()
      };

      // Call the real API service
      const result = await BroadcastAlertService.sendWarning(warningData);
      
      setAlertResult({
        type: 'success',
        title: language === 'as' ? 'সতৰ্কবাণী সফলতাৰে পঠিওৱা হ\'ল!' : 'Warning Sent Successfully!',
        data: result
      });
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        if (alertResult?.type === 'success') {
          setActiveModal(null);
          setAlertResult(null);
          setModalData({});
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error sending warning:', error);
      setAlertResult({
        type: 'error',
        title: language === 'as' ? 'ত্ৰুটি' : 'Error',
        message: error.message || (language === 'as' ? 'সতৰ্কবাণী পঠিওৱাত বিফল' : 'Failed to send warning')
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setModalData({ 
      ...modalData, 
      message: template.message,
      severity: template.severity 
    });
  };

  const handleAction = (actionType) => {
    setAlertResult(null);
    setModalData({});
    setSelectedTemplate(null);
    
    switch(actionType) {
      case 'emergency':
        handleEmergencyContacts();
        break;
      case 'safety':
        handleSafetyGuidelines();
        break;
      case 'broadcast':
        setActiveModal('broadcast');
        break;
      case 'warning':
        setActiveModal('warning');
        break;
      default:
        console.log('Unknown action:', actionType);
    }
  };

  // Get recipient checkbox state
  const getRecipients = () => {
    const recipients = [];
    if (modalData.sendToCitizens) recipients.push('citizens');
    if (modalData.sendToAuthorities) recipients.push('authorities');
    if (modalData.sendToEmergency) recipients.push('emergency_services');
    return recipients.length > 0 ? recipients : ['citizens'];
  };

  return (
    <>
      <div className={`rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} shadow-sm`}>
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold">{t.actionCenter}</h3>
          <p className="text-xs text-gray-500 mt-1">{t.quickActions}</p>
        </div>
        
        <div className="p-4 grid grid-cols-2 gap-3">
          {actions.map((action, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAction(action.action)}
              disabled={loading}
              className={`p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className={`w-10 h-10 rounded-lg ${action.bg} ${action.color} flex items-center justify-center mb-2`}>
                <action.icon size={20} />
              </div>
              <span className="text-sm font-medium block text-left">{t[action.labelKey]}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[1100] flex items-center justify-center p-4"
            onClick={() => !loading && setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {activeModal === 'emergency' && t.emergencyContacts}
                  {activeModal === 'safety' && t.safetyGuidelines}
                  {activeModal === 'broadcast' && t.broadcastAlert}
                  {activeModal === 'warning' && t.sendWarning}
                </h3>
                <button 
                  onClick={() => !loading && setActiveModal(null)}
                  disabled={loading}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
                  <span className="text-gray-500">
                    {language === 'as' ? 'পঠিওৱা হৈছে...' : 'Sending...'}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">
                    {language === 'as' ? 'অনুগ্ৰহ কৰি অপেক্ষা কৰক' : 'Please wait'}
                  </p>
                </div>
              )}

              {/* Success/Error Result */}
              {!loading && alertResult && (
                <div className={`rounded-xl p-6 mb-4 ${alertResult.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' : 'bg-red-50 dark:bg-red-900/20 border border-red-200'}`}>
                  <div className="flex items-start gap-3">
                    {alertResult.type === 'success' ? (
                      <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className={`font-bold ${alertResult.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                        {alertResult.title}
                      </h4>
                      
                      {alertResult.data && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>
                              {language === 'as' 
                                ? `${alertResult.data.recipientsNotified?.toLocaleString()} গৰাকী লোক অবগত কৰা হৈছে`
                                : `${alertResult.data.recipientsNotified?.toLocaleString()} recipients notified`
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>
                              {language === 'as'
                                ? `প্ৰাক্ অনুমান সময়: ${alertResult.data.estimatedCompletion}`
                                : `Est. completion: ${alertResult.data.estimatedCompletion}`
                              }
                            </span>
                          </div>
                          
                           {/* Channel breakdown */}
                          {alertResult.data.channels && (
                            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                              <p className="text-xs font-medium mb-2">
                                {language === 'as' ? 'চেনেলবোৰ:' : 'Channels:'}
                              </p>
                              <div className="grid grid-cols-4 gap-2 text-xs">
                                {alertResult.data.channels.sms && (
                                  <div className="bg-white dark:bg-slate-700 rounded p-2 text-center">
                                    <p className="font-bold text-lg">{alertResult.data.channels.sms.delivered}</p>
                                    <p className="text-gray-500">SMS</p>
                                  </div>
                                )}
                                {alertResult.data.channels.push && (
                                  <div className="bg-white dark:bg-slate-700 rounded p-2 text-center">
                                    <p className="font-bold text-lg">{alertResult.data.channels.push.delivered}</p>
                                    <p className="text-gray-500">Push</p>
                                  </div>
                                )}
                                {alertResult.data.channels.whatsapp && (
                                  <div className="bg-white dark:bg-slate-700 rounded p-2 text-center">
                                    <p className="font-bold text-lg">{alertResult.data.channels.whatsapp.delivered}</p>
                                    <p className="text-gray-500">WhatsApp</p>
                                  </div>
                                )}
                                {alertResult.data.channels.email && (
                                  <div className="bg-white dark:bg-slate-700 rounded p-2 text-center">
                                    <p className="font-bold text-lg">{alertResult.data.channels.email.delivered}</p>
                                    <p className="text-gray-500">Email</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {alertResult.message && (
                        <p className="text-sm mt-2 text-red-600">{alertResult.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Contacts Modal */}
              {!loading && !alertResult && activeModal === 'emergency' && modalData.contacts && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-4">
                    {language === 'as' ? 'অঞ্চল:' : 'Zone:'} {selectedBasin?.name}
                  </p>
                  {modalData.contacts.map((contact, idx) => (
                    <div key={idx} className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-gray-500">{contact.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-teal-600">{contact.phone}</p>
                          <span className={`text-xs px-2 py-1 rounded ${contact.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            {contact.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Safety Guidelines Modal */}
              {!loading && !alertResult && activeModal === 'safety' && modalData.guidelines && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-4">{modalData.title}</p>
                  {modalData.guidelines.map((guideline, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-bold flex-shrink-0">
                        {guideline.step}
                      </div>
                      <p className="text-sm pt-1.5">{guideline.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Broadcast Alert Modal */}
              {!loading && !alertResult && activeModal === 'broadcast' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {language === 'as' ? 'অঞ্চল:' : 'Zone:'} {selectedBasin?.name}
                    </p>
                    {selectedTemplate && (
                      <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full">
                        {selectedTemplate.title}
                      </span>
                    )}
                  </div>

                  {/* Alert Templates */}
                  {templates.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium mb-2 text-gray-500">
                        {language === 'as' ? 'টেমপ্লেৰ্টবোৰ:' : 'Templates:'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {templates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                              selectedTemplate?.id === template.id
                                ? 'bg-teal-500 text-white border-teal-500'
                                : darkMode
                                  ? 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            {template.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <textarea
                    value={modalData.message || ''}
                    placeholder={language === 'as' ? 'বাৰ্তা প্ৰবেশ কৰক...' : 'Enter alert message...'}
                    className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    rows={4}
                    onChange={(e) => setModalData({ ...modalData, message: e.target.value })}
                  />
                  
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <select 
                        value={modalData.severity || 'high'}
                        className={`flex-1 p-2 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
                        onChange={(e) => setModalData({ ...modalData, severity: e.target.value })}
                      >
                        <option value="high">
                          {language === 'as' ? 'উচ্চ বিপদ' : 'High Severity'}
                        </option>
                        <option value="medium">
                          {language === 'as' ? 'মধ্যম বিপদ' : 'Medium Severity'}
                        </option>
                        <option value="low">
                          {language === 'as' ? 'কম বিপদ' : 'Low Severity'}
                        </option>
                      </select>
                    </div>

                    {/* Channel Selection */}
                    <div className={`border rounded-lg p-3 ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                      <p className="text-xs font-medium mb-2 text-gray-500">
                        {language === 'as' ? 'চেনেলবোৰ:' : 'Channels:'}
                      </p>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={modalData.sendSMS !== false}
                            onChange={(e) => setModalData({ ...modalData, sendSMS: e.target.checked })}
                            className="rounded text-teal-500 focus:ring-teal-500"
                          />
                          <span className="text-sm">SMS</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={modalData.sendPush !== false}
                            onChange={(e) => setModalData({ ...modalData, sendPush: e.target.checked })}
                            className="rounded text-teal-500 focus:ring-teal-500"
                          />
                          <span className="text-sm">Push</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={modalData.sendWhatsApp !== false}
                            onChange={(e) => setModalData({ ...modalData, sendWhatsApp: e.target.checked })}
                            className="rounded text-teal-500 focus:ring-teal-500"
                          />
                          <span className="text-sm">WhatsApp</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={modalData.sendEmail !== false}
                            onChange={(e) => setModalData({ ...modalData, sendEmail: e.target.checked })}
                            className="rounded text-teal-500 focus:ring-teal-500"
                          />
                          <span className="text-sm">Email</span>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBroadcastAlert(
                        modalData.message, 
                        modalData.severity || 'high',
                        [
                          ...(modalData.sendSMS !== false ? ['sms'] : []),
                          ...(modalData.sendPush !== false ? ['push'] : []),
                          ...(modalData.sendWhatsApp !== false ? ['whatsapp'] : []),
                          ...(modalData.sendEmail !== false ? ['email'] : [])
                        ]
                      )}
                      disabled={!modalData.message}
                      className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Radio className="w-5 h-5" />
                      {language === 'as' ? 'সতৰ্কবাণী পঠিয়াওক' : 'Broadcast Alert'}
                    </button>
                  </div>
                </div>
              )}

              {/* Send Warning Modal */}
              {!loading && !alertResult && activeModal === 'warning' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    {language === 'as' ? 'অঞ্চল:' : 'Zone:'} {selectedBasin?.name}
                  </p>
                  
                  <textarea
                    value={modalData.message || ''}
                    placeholder={language === 'as' ? 'বাৰ্তা প্ৰবেশ কৰক...' : 'Enter warning message...'}
                    className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    rows={4}
                    onChange={(e) => setModalData({ ...modalData, message: e.target.value })}
                  />
                  
                  <div className="border rounded-lg p-3 ${darkMode ? 'border-slate-600' : 'border-gray-200'}">
                    <p className="text-xs font-medium mb-3 text-gray-500">
                      {language === 'as' ? 'প্ৰাপকবোৰ:' : 'Recipients:'}
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={modalData.sendToCitizens !== false}
                          onChange={(e) => setModalData({ ...modalData, sendToCitizens: e.target.checked })}
                          className="rounded text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm">{language === 'as' ? 'নাগৰিকসকল' : 'Citizens'}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={modalData.sendToAuthorities || false}
                          onChange={(e) => setModalData({ ...modalData, sendToAuthorities: e.target.checked })}
                          className="rounded text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm">{language === 'as' ? 'কতৃপক্ষ' : 'Authorities'}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={modalData.sendToEmergency || false}
                          onChange={(e) => setModalData({ ...modalData, sendToEmergency: e.target.checked })}
                          className="rounded text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm">{language === 'as' ? 'জৰুৰীকালীন সেৱা' : 'Emergency Services'}</span>
                      </label>
                    </div>
                  </div>

                  {/* Channel Selection for Warning */}
                  <div className={`border rounded-lg p-3 ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                    <p className="text-xs font-medium mb-2 text-gray-500">
                      {language === 'as' ? 'চেনেলবোৰ:' : 'Channels:'}
                    </p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={modalData.sendSMS !== false}
                          onChange={(e) => setModalData({ ...modalData, sendSMS: e.target.checked })}
                          className="rounded text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm">SMS</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={modalData.sendWhatsApp !== false}
                          onChange={(e) => setModalData({ ...modalData, sendWhatsApp: e.target.checked })}
                          className="rounded text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm">WhatsApp</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={modalData.sendPush !== false}
                          onChange={(e) => setModalData({ ...modalData, sendPush: e.target.checked })}
                          className="rounded text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm">Push</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendWarning(modalData.message, getRecipients(), [
                      ...(modalData.sendSMS !== false ? ['sms'] : []),
                      ...(modalData.sendWhatsApp !== false ? ['whatsapp'] : []),
                      ...(modalData.sendPush !== false ? ['push'] : [])
                    ])}
                    disabled={!modalData.message}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Send className="w-5 h-5" />
                    {language === 'as' ? 'সতৰ্কবাণী পঠিয়াওক' : 'Send Warning'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ActionCenter;
