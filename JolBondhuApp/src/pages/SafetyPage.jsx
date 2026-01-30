import React from 'react'
import { motion } from 'framer-motion'
import {
    Shield,
    Phone,
    AlertTriangle,
    PhoneCall,
    Flame,
    BadgeCheck,
    Siren
} from 'lucide-react'
import { safetyGuidelines, emergencyContacts } from '../data/sharedData'

function SafetyPage({ basins, darkMode, language, t }) {
    // Get the highest risk level from all basins
    const getOverallRiskLevel = () => {
        if (basins.some(b => b.riskLevel === 'High')) return 'high'
        if (basins.some(b => b.riskLevel === 'Medium')) return 'medium'
        return 'low'
    }

    const riskLevel = getOverallRiskLevel()
    const guidelines = safetyGuidelines[riskLevel] || safetyGuidelines.low

    // Get icon for contact type
    const getContactIcon = (iconName) => {
        switch (iconName) {
            case 'phone': return Phone
            case 'shield': return Shield
            case 'siren': return Siren
            case 'badge': return BadgeCheck
            case 'flame': return Flame
            default: return Phone
        }
    }

    // Get color based on risk level
    const getRiskColor = () => {
        switch (riskLevel) {
            case 'high': return { bg: 'bg-red-500/20', text: 'text-red-500', gradient: 'from-red-600 to-red-500' }
            case 'medium': return { bg: 'bg-amber-500/20', text: 'text-amber-500', gradient: 'from-amber-600 to-amber-500' }
            default: return { bg: 'bg-green-500/20', text: 'text-green-500', gradient: 'from-green-600 to-green-500' }
        }
    }

    const colors = getRiskColor()

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-4 py-4 space-y-6"
        >
            {/* Current Risk Level Banner */}
            <motion.div
                variants={itemVariants}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${colors.gradient} p-4`}
            >
                <div className="relative flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-white/80 text-xs">
                            {language === 'as' ? 'বৰ্তমান বিপদ স্তৰ' : 'Current Risk Level'}
                        </p>
                        <h2 className="text-white font-bold text-xl">
                            {language === 'as'
                                ? (riskLevel === 'high' ? 'উচ্চ' : riskLevel === 'medium' ? 'মধ্যম' : 'কম')
                                : riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)
                            }
                        </h2>
                    </div>
                </div>
            </motion.div>

            {/* Safety Guidelines */}
            <motion.div variants={itemVariants}>
                <h2 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {t.safetyGuidelines}
                </h2>
                <p className={`text-xs mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {t.basedOnRisk}
                </p>

                <div className="space-y-3">
                    {guidelines.map((guideline, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-xl flex items-start gap-3 ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                                <span className={`text-sm font-bold ${colors.text}`}>{index + 1}</span>
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                {language === 'as' ? guideline.as : guideline.en}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Emergency Contacts */}
            <motion.div variants={itemVariants}>
                <h2 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {t.emergencyContacts}
                </h2>
                <p className={`text-xs mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {t.tapToCall}
                </p>

                <div className="grid grid-cols-1 gap-3">
                    {emergencyContacts.map((contact, index) => {
                        const Icon = getContactIcon(contact.icon)
                        return (
                            <motion.a
                                key={index}
                                href={`tel:${contact.phone}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-4 rounded-xl flex items-center gap-3 transition-all ${darkMode
                                        ? 'bg-slate-800 hover:bg-slate-700 active:bg-slate-700'
                                        : 'bg-white shadow-sm hover:shadow-md active:shadow-sm'
                                    }`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                    <Icon className="w-6 h-6 text-primary-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {language === 'as' ? contact.nameAssamese : contact.name}
                                    </h3>
                                    <p className="text-primary-500 text-lg font-bold">
                                        {contact.phone}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                    <PhoneCall className="w-5 h-5 text-white" />
                                </div>
                            </motion.a>
                        )
                    })}
                </div>
            </motion.div>

            {/* Additional Tips */}
            <motion.div
                variants={itemVariants}
                className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-blue-50'}`}
            >
                <div className="flex items-start gap-3">
                    <Shield className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`} />
                    <div>
                        <h3 className={`font-semibold text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {language === 'as' ? 'মনত ৰাখক' : 'Remember'}
                        </h3>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                            {language === 'as'
                                ? 'জৰুৰীকালীন পৰিস্থিতিত শান্ত থাকক আৰু নিৰ্দেশনা পালন কৰক। সুৰক্ষিত থাকক!'
                                : 'Stay calm during emergencies and follow official instructions. Stay safe!'
                            }
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default SafetyPage
