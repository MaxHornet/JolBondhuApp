import React from 'react';
import { X, LayoutDashboard, Map, BarChart3, Users, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse, darkMode, t, language, activeTab, onTabChange }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: t.dashboard, tab: 'dashboard' },
    { icon: Map, label: t.liveMap, tab: 'livemap' },
    { icon: BarChart3, label: t.analytics, tab: 'analytics' },
    { icon: Users, label: t.citizenReports, tab: 'reports' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        className={`fixed left-0 top-0 h-full z-50 transform transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${isCollapsed ? 'w-16' : 'w-64'} ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-r`}
      >
        <div className={`${isCollapsed ? 'p-2' : 'p-6'}`}>
          <div className="flex items-center justify-between mb-8">
            <h1 className={`font-bold gradient-text transition-all duration-300 ${isCollapsed ? 'text-xl' : 'text-2xl'}`}>
              {isCollapsed ? 'J' : 'Jolbondhu'}
            </h1>

            <div className="flex items-center gap-2">
              <button
                onClick={onToggleCollapse}
                className={`flex p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Menu size={20} />
              </button>

              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (onTabChange) onTabChange(item.tab);
                  if (onClose) onClose();
                }}
                className={`flex items-center gap-3 rounded-lg transition-colors w-full text-left ${isCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'
                  } ${activeTab === item.tab
                    ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400'
                    : `hover:bg-gray-100 ${darkMode ? 'text-gray-300 hover:bg-slate-700' : 'text-gray-600'}`
                  }`}
                title={isCollapsed ? item.label : ""}
              >
                <item.icon size={20} />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {!isCollapsed && (
          <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              {t.systemOnline}
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className={`absolute bottom-0 left-0 right-0 p-2 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'} flex justify-center`}>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title={t.systemOnline}></div>
          </div>
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;
