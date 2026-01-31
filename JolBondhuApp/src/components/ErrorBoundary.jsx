import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors in child components and displays a fallback UI
 * Prevents the entire app from crashing due to one component error
 */

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You can also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // Clear localStorage cache that might be causing issues
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('weather_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Error clearing localStorage:', e);
    }
  };

  render() {
    if (this.state.hasError) {
      const { darkMode = true, language = 'en' } = this.props;
      
      const texts = {
        en: {
          title: 'Something went wrong',
          description: 'The app encountered an error. You can try reloading the page or clearing the cache.',
          reload: 'Reload Page',
          clearCache: 'Clear Cache & Retry',
          errorDetails: 'Error Details'
        },
        as: {
          title: 'কিবা ভুল হৈছে',
          description: 'এপ্প্‌টোত এটা ত্ৰুটি হৈছে। আপুনি পৃষ্ঠাটো পুনৰ লোড কৰাৰ চেষ্টা কৰিব পাৰে বা ক্যাশ্‌চটো পৰিষ্কাৰ কৰিব পাৰে।',
          reload: 'পৃষ্ঠা পুনৰ লোড কৰক',
          clearCache: 'ক্যাশ্‌চ পৰিষ্কাৰ কৰক আৰু পুনৰ চেষ্টা কৰক',
          errorDetails: 'ত্ৰুটিৰ বিৱৰণ'
        }
      };
      
      const t = texts[language];

      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${
          darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'
        }`}>
          <div className={`max-w-md w-full rounded-2xl p-6 shadow-xl ${
            darkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                darkMode ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-bold">{t.title}</h2>
            </div>
            
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t.description}
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t.reload}
              </button>
              
              <button
                onClick={this.handleReset}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                  darkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {t.clearCache}
              </button>
            </div>

            {/* Error details for debugging */}
            {import.meta.env.DEV && this.state.error && (
              <div className={`mt-6 p-3 rounded-lg text-xs font-mono overflow-auto ${
                darkMode ? 'bg-slate-900 text-red-400' : 'bg-gray-100 text-red-600'
              }`}>
                <p className="font-semibold mb-2">{t.errorDetails}:</p>
                <p>{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
