import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Cloud, Droplets, Mountain, AlertTriangle, Database, Beaker, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateRisk, DEFAULT_PARAMS } from '../services/simulationService';

/**
 * SimulationPanel Component
 * 
 * Floating panel for controlling simulation mode
 * Allows adjusting rainfall, blockage, and soil saturation parameters
 */

const SimulationPanel = ({
    isOpen,
    onClose,
    isSimulationMode,
    onToggleMode,
    params,
    onParamsChange,
    darkMode,
    language,
    t
}) => {
    const [localParams, setLocalParams] = useState(params || DEFAULT_PARAMS);
    const [expanded, setExpanded] = useState(true);

    // Update local params when props change
    useEffect(() => {
        if (params) {
            setLocalParams(params);
        }
    }, [params]);

    // Calculate current risk based on params
    const currentRisk = calculateRisk(localParams);

    // Handle slider changes
    const handleParamChange = (key, value) => {
        const newParams = { ...localParams, [key]: value };
        setLocalParams(newParams);
        onParamsChange(newParams);
    };

    // Get risk color
    const getRiskColor = (risk) => {
        switch (risk) {
            case 'High': return 'text-red-500 bg-red-500/20';
            case 'Medium': return 'text-amber-500 bg-amber-500/20';
            case 'Low': return 'text-green-500 bg-green-500/20';
            default: return 'text-gray-500 bg-gray-500/20';
        }
    };

    // Get translations
    const getText = (key) => {
        const texts = {
            en: {
                simulationMode: 'Simulation Mode',
                liveData: 'Live Data',
                simulated: 'Simulated',
                rainfall: 'Rainfall Intensity',
                blockage: 'Drainage Blockage',
                soilSaturation: 'Soil Saturation',
                currentRisk: 'Current Risk Level',
                mm: 'mm/hr',
                adjust: 'Adjust parameters to simulate flood conditions',
                warning: 'Simulation mode uses mock data'
            },
            as: {
                simulationMode: 'চিমুলেচন মোড',
                liveData: 'সৰাসৰি তথ্য',
                simulated: 'চিমুলেটেড',
                rainfall: 'বৰষুণৰ তীব্ৰতা',
                blockage: 'নিষ্কাশন বন্ধ',
                soilSaturation: 'মাটিৰ আৰ্দ্ৰতা',
                currentRisk: 'বৰ্তমান বিপদ স্তৰ',
                mm: 'মিমি/ঘণ্টা',
                adjust: 'বান পৰিস্থিতি অনুকৰণ কৰিবলৈ প্ৰাচল সামঞ্জস্য কৰক',
                warning: 'চিমুলেচন মোডে মক তথ্য ব্যৱহাৰ কৰে'
            }
        };
        return texts[language]?.[key] || texts.en[key];
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`fixed left-4 top-20 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl border ${darkMode
                                ? 'bg-slate-800 border-slate-700'
                                : 'bg-white border-gray-200'
                            }`}
                    >
                        {/* Header */}
                        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-2">
                                <Beaker className="w-5 h-5 text-purple-500" />
                                <h3 className="font-semibold">{getText('simulationMode')}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className={`p-1 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                                >
                                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                                <button
                                    onClick={onClose}
                                    className={`p-1 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {expanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 space-y-4">
                                        {/* Mode Toggle */}
                                        <div className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                                            <div className="flex items-center gap-2">
                                                {isSimulationMode ? (
                                                    <Beaker className="w-4 h-4 text-purple-500" />
                                                ) : (
                                                    <Database className="w-4 h-4 text-teal-500" />
                                                )}
                                                <span className="text-sm font-medium">
                                                    {isSimulationMode ? getText('simulated') : getText('liveData')}
                                                </span>
                                            </div>
                                            <button
                                                onClick={onToggleMode}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${isSimulationMode
                                                        ? 'bg-purple-500'
                                                        : darkMode ? 'bg-slate-600' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <motion.div
                                                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                                                    animate={{ left: isSimulationMode ? '26px' : '4px' }}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                />
                                            </button>
                                        </div>

                                        {/* Warning Banner for Simulation Mode */}
                                        {isSimulationMode && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/30"
                                            >
                                                <AlertTriangle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                                <p className="text-xs text-purple-500">{getText('warning')}</p>
                                            </motion.div>
                                        )}

                                        {/* Risk Indicator */}
                                        <div className={`p-4 rounded-xl text-center ${getRiskColor(currentRisk)}`}>
                                            <p className="text-xs font-medium mb-1">{getText('currentRisk')}</p>
                                            <p className="text-2xl font-bold">{currentRisk}</p>
                                        </div>

                                        {/* Parameter Sliders */}
                                        <div className="space-y-4">
                                            {/* Rainfall */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Cloud className="w-4 h-4 text-blue-500" />
                                                        <span className="text-sm">{getText('rainfall')}</span>
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {localParams.rainfall} {getText('mm')}
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="200"
                                                    value={localParams.rainfall}
                                                    onChange={(e) => handleParamChange('rainfall', parseInt(e.target.value))}
                                                    disabled={!isSimulationMode}
                                                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isSimulationMode
                                                            ? 'bg-blue-200 accent-blue-500'
                                                            : 'bg-gray-200 opacity-50'
                                                        }`}
                                                />
                                            </div>

                                            {/* Blockage */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Droplets className="w-4 h-4 text-amber-500" />
                                                        <span className="text-sm">{getText('blockage')}</span>
                                                    </div>
                                                    <span className="text-sm font-medium">{localParams.blockage}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={localParams.blockage}
                                                    onChange={(e) => handleParamChange('blockage', parseInt(e.target.value))}
                                                    disabled={!isSimulationMode}
                                                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isSimulationMode
                                                            ? 'bg-amber-200 accent-amber-500'
                                                            : 'bg-gray-200 opacity-50'
                                                        }`}
                                                />
                                            </div>

                                            {/* Soil Saturation */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Mountain className="w-4 h-4 text-green-500" />
                                                        <span className="text-sm">{getText('soilSaturation')}</span>
                                                    </div>
                                                    <span className="text-sm font-medium">{localParams.soilSaturation}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={localParams.soilSaturation}
                                                    onChange={(e) => handleParamChange('soilSaturation', parseInt(e.target.value))}
                                                    disabled={!isSimulationMode}
                                                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isSimulationMode
                                                            ? 'bg-green-200 accent-green-500'
                                                            : 'bg-gray-200 opacity-50'
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Helper Text */}
                                        <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {getText('adjust')}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SimulationPanel;
