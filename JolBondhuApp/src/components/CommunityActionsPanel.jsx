import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    RouteOff,
    ShieldCheck,
    ChevronRight,
    Clock,
    X,
    MapPin
} from 'lucide-react';

const CommunityActionsPanel = ({ language = 'en', darkMode = false, userLocation = null }) => {
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false); // Will auto-expand if high-priority actions exist
    const [proximityWarning, setProximityWarning] = useState(null);

    //Fetch community actions
    useEffect(() => {
        fetchActions();
        const interval = setInterval(fetchActions, 120000); // Refresh every 2 minutes
        return () => clearInterval(interval);
    }, []);

    // Check proximity to hazards
    useEffect(() => {
        if (userLocation) {
            checkProximity();
        }
    }, [userLocation]);

    const fetchActions = async () => {
        try {
            const response = await fetch('http://localhost:3001/community_actions');
            if (response.ok) {
                const data = await response.json();
                const sortedActions = data.sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                });
                setActions(sortedActions);

                // Auto-expand if there are high-priority actions
                const hasHighPriority = sortedActions.some(a => a.priority === 'high');
                if (hasHighPriority && !expanded) {
                    setExpanded(true);
                }
            }
        } catch (error) {
            console.error('Failed to load community actions:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkProximity = async () => {
        try {
            const response = await fetch('http://localhost:3001/hazard_zones');
            if (response.ok) {
                const hazards = await response.json();

                // Check distance to each hazard
                for (const hazard of hazards) {
                    const distance = getDistance(
                        userLocation.lat,
                        userLocation.lng,
                        hazard.location.lat,
                        hazard.location.lng
                    );

                    // Alert if within 200m of high-severity hazard
                    if (distance < 200 && hazard.severity === 'high') {
                        setProximityWarning({
                            ...hazard,
                            distance: Math.round(distance)
                        });
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Proximity check failed:', error);
        }
    };

    // Haversine formula for distance calculation
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'route-off':
                return <RouteOff className="w-5 h-5" />;
            case 'shield-check':
                return <ShieldCheck className="w-5 h-5" />;
            default:
                return <AlertTriangle className="w-5 h-5" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return darkMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200';
            case 'medium':
                return darkMode ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-50 text-orange-700 border-orange-200';
            default:
                return darkMode ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    if (loading) return null;
    if (actions.length === 0) return null;

    return (
        <>
            {/* Proximity Warning Banner */}
            <AnimatePresence>
                {proximityWarning && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-16 left-0 right-0 z-50 mx-4 p-4 rounded-xl shadow-2xl border-2 ${darkMode ? 'bg-red-900/90 border-red-500' : 'bg-red-50 border-red-300'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 animate-pulse" />
                            <div className="flex-1">
                                <h3 className={`font-bold text-sm mb-1 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                                    {language === 'as' ? '⚠️ বিপদ অঞ্চলৰ ওচৰত' : '⚠️ Danger Zone Nearby'}
                                </h3>
                                <p className={`text-xs ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
                                    {language === 'as' ? proximityWarning.descriptionAssamese : proximityWarning.description}
                                </p>
                                <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-red-100' : 'text-red-900'}`}>
                                    {proximityWarning.distance}m {language === 'as' ? 'দূৰত্বত' : 'away'}
                                </p>
                            </div>
                            <button
                                onClick={() => setProximityWarning(null)}
                                className={`${darkMode ? 'text-red-300' : 'text-red-600'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Community Actions Panel */}
            <motion.div
                initial={{ x: expanded ? 0 : -300 }}
                animate={{ x: expanded ? 0 : -260 }}
                className={`fixed left-0 top-24 z-40 w-80 ${darkMode ? 'bg-slate-800' : 'bg-white'
                    } rounded-r-2xl shadow-2xl border-r-4 border-primary-500`}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className={`absolute -right-12 top-4 p-3 rounded-r-xl ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'
                        } shadow-xl border-r border-t border-b`}
                >
                    <motion.div
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </motion.div>
                </button>

                {/* Panel Content */}
                <div className="p-4 max-h-[calc(100vh-120px)] overflow-y-auto">
                    <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                        <ShieldCheck className="w-6 h-6 text-primary-500" />
                        {language === 'as' ? 'সম্প্রদায়ৰ পৰামৰ্শ' : 'Community Actions'}
                    </h2>

                    <div className="space-y-3">
                        {actions.map((action) => {
                            const isHighPriority = action.priority === 'high';
                            return (
                                <motion.div
                                    key={action.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`${isHighPriority ? 'p-4 border-3' : 'p-3 border-2'} rounded-xl ${getPriorityColor(action.priority)} ${isHighPriority ? 'shadow-lg' : ''}`}
                                >
                                    {/* Header with Icon & Title */}
                                    <div className="flex items-start gap-2 mb-2">
                                        <div className={isHighPriority ? 'animate-pulse' : ''}>
                                            {getIcon(action.icon)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-bold ${isHighPriority ? 'text-base' : 'text-sm'} mb-1`}>
                                                {isHighPriority && '⚠️ '}
                                                {language === 'as' ? action.titleAssamese : action.title}
                                            </h3>
                                            <p className={`${isHighPriority ? 'text-sm' : 'text-xs'} opacity-90`}>
                                                {language === 'as' ? action.descriptionAssamese : action.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Alternative Route - Highlighted for High Priority */}
                                    {action.alternativeRoute && (
                                        <div className={`mt-2 p-2 rounded-lg ${isHighPriority ? 'text-sm bg-white/30 border border-current' : 'text-xs'} ${darkMode ? 'bg-slate-700/50' : 'bg-white/50'}`}>
                                            <div className="flex items-center gap-1 mb-1 font-medium">
                                                <MapPin className={isHighPriority ? 'w-4 h-4' : 'w-3 h-3'} />
                                                {language === 'as' ? 'বিকল্প পথ:' : 'Alternative Route:'}
                                            </div>
                                            <p className="opacity-90 font-medium">
                                                {language === 'as' ? action.alternativeRouteAssamese : action.alternativeRoute}
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Items */}
                                    {action.actions && (
                                        <ul className="mt-2 space-y-1">
                                            {(language === 'as' ? action.actionsAssamese : action.actions).map((item, idx) => (
                                                <li key={idx} className={`${isHighPriority ? 'text-sm' : 'text-xs'} flex items-start gap-2`}>
                                                    <span className="text-primary-500 font-bold">✓</span>
                                                    <span className="opacity-90">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default CommunityActionsPanel;
