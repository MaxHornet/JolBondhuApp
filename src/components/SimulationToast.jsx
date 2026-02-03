import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

/**
 * SimulationToast Component
 * 
 * Displays floating notification banners for broadcasts, warnings, and alerts
 * Auto-dismisses after a set duration
 */

const SimulationToast = ({ toasts, onDismiss, darkMode }) => {
    // Get icon and color based on toast type
    const getToastStyle = (type) => {
        switch (type) {
            case 'warning':
                return {
                    icon: AlertTriangle,
                    bg: darkMode ? 'bg-red-900/90' : 'bg-red-500',
                    border: 'border-red-600',
                    iconColor: 'text-white'
                };
            case 'success':
                return {
                    icon: CheckCircle,
                    bg: darkMode ? 'bg-green-900/90' : 'bg-green-500',
                    border: 'border-green-600',
                    iconColor: 'text-white'
                };
            case 'info':
            default:
                return {
                    icon: Info,
                    bg: darkMode ? 'bg-blue-900/90' : 'bg-blue-500',
                    border: 'border-blue-600',
                    iconColor: 'text-white'
                };
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[1200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => {
                    const style = getToastStyle(toast.type);
                    const Icon = style.icon;

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className={`${style.bg} backdrop-blur-lg rounded-2xl p-4 shadow-2xl border ${style.border} pointer-events-auto`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full bg-white/20 ${style.iconColor}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold text-sm">{toast.title || toast.type.toUpperCase()}</p>
                                    <p className="text-white/90 text-sm mt-1 break-words">{toast.message}</p>
                                </div>
                                <button
                                    onClick={() => onDismiss(toast.id)}
                                    className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white/70 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Progress bar for auto-dismiss */}
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: toast.duration || 5, ease: 'linear' }}
                                className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-bl-2xl"
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

/**
 * Hook for managing simulation toasts
 */
export function useSimulationToast() {
    const [toasts, setToasts] = React.useState([]);

    const addToast = (type, message, title = null, duration = 5) => {
        const id = Date.now().toString();
        const newToast = { id, type, message, title, duration };

        // Keep max 3 toasts
        setToasts((prev) => [...prev.slice(-2), newToast]);

        // Auto dismiss after duration
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration * 1000);

        return id;
    };

    const dismissToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const showWarning = (message, title) => addToast('warning', message, title);
    const showSuccess = (message, title) => addToast('success', message, title);
    const showInfo = (message, title) => addToast('info', message, title);

    return {
        toasts,
        addToast,
        dismissToast,
        showWarning,
        showSuccess,
        showInfo
    };
}

export default SimulationToast;
